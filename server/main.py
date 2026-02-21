# server/main.py
from fastapi import FastAPI, UploadFile, File as FastAPIFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import numpy as np
import os
import tempfile
try:
    import torch
except ImportError:
    torch = None  # Optional: only needed for .pth file uploads

from asyncshield.server.aggregator import RobustAggregator
from asyncshield.server.database import AsyncDatabase
from asyncshield.server.evaluator import Evaluator
from asyncshield.config import SERVER_DB_PATH, MODEL_VECTOR_SIZE

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = AsyncDatabase(SERVER_DB_PATH)
aggregator = RobustAggregator()
evaluator = Evaluator()

global_model_weights = np.zeros(MODEL_VECTOR_SIZE) 
global_version = 1

# ZERO-TRUST: accuracy_improvement is REMOVED from the payload.
class UpdatePayload(BaseModel):
    client_id: str
    client_version: int
    weights_delta: List[float] 

@app.get("/get_model")
def get_model():
    return {
        "version": global_version,
        "weights": global_model_weights.tolist(),
        "message": "Model ready for download"
    }

@app.post("/submit_update")
def submit_update(payload: UpdatePayload):
    global global_model_weights, global_version
    
    delta = np.array(payload.weights_delta)
    
    # 1. ZERO-TRUST EVALUATION
    real_delta_i, current_accuracy = evaluator.verify_update(global_model_weights, delta)
    
    # DEBUG LOG
    print(f"[EVAL] Client: {payload.client_id} | Real ΔI: {real_delta_i*100:.4f}% | Acc: {current_accuracy*100:.2f}%")
    
    # --- NEW STRICTER LOGIC ---

    # A: Tighten threshold to -1.5% (0.015). 
    # This is enough for DP noise but blocks bad architectures (like the MLP).
    if real_delta_i < -0.015:
        print(f"[Server] REJECTED: Accuracy drop too high ({real_delta_i*100:.2f}%)")
        db.add_commit(
            payload.client_id, 
            "Rejected ❌", 
            f"Zero-Trust Failure: Accuracy dropped by {abs(real_delta_i*100):.1f}%", 
            "None", 
            0
        )
        return {"status": "rejected", "message": "Zero-Trust: Quality too low."}

    # B: ONLY Merge if the improvement is non-negative
    # We don't want the "Global Brain" to get dumber.
    if real_delta_i <= 0:
        db.add_commit(payload.client_id, "Rejected ❌", "No measurable improvement", "None", 0)
        return {"status": "rejected", "message": "Update did not improve the model."}

    # 2. ROBUST ASYNC AGGREGATION (Only reached if improvement > 0)
    global_model_weights = aggregator.apply_update(
        global_model_weights, 
        delta, 
        global_version, 
        payload.client_version
    )
    
    # 3. VERSION BUMP & BOUNTY
    old_version = global_version
    global_version += 1
    
    # Only pay if they actually improved the model
    # (5 base tokens + 10,000x the gain)
    bounty_earned = 5 + int(real_delta_i * 10000)
    
    db.add_commit(
        payload.client_id, 
        "Merged ✅", 
        f"Real Improvement: {real_delta_i*100:.3f}% | New Acc: {current_accuracy*100:.1f}%", 
        f"v{old_version}->v{global_version}", 
        bounty_earned
    )

    return {
        "status": "success", 
        "bounty_earned": bounty_earned, 
        "new_version": global_version
    }
@app.get("/dashboard_data")
def get_dashboard_data():
    return {
        "global_version": global_version,
        **db.get_dashboard_data()
    }

@app.get("/download_architecture")
def download_architecture():
    file_path = os.path.join(os.path.dirname(__file__), "models.py")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/x-python", filename="models.py")
    return {"error": "Architecture file not found on server."}

@app.post("/submit_update_file")
async def submit_update_file(
    file: UploadFile,
    client_id: str = Form(...),
    client_version: int = Form(...)
):
    """
    Accept a .pth file upload, convert it to the standard weights_delta format,
    and process it through the existing submit_update logic.
    """
    global global_model_weights, global_version
    
    if torch is None:
        return {"status": "rejected", "message": "PyTorch is not installed on the server."}
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pth") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Load the PyTorch model state dict
        state_dict = torch.load(tmp_path, map_location="cpu", weights_only=False)
        
        # Flatten all weights into a single vector
        weights_list = []
        for key in sorted(state_dict.keys()):
            param = state_dict[key]
            if isinstance(param, torch.Tensor):
                weights_list.append(param.flatten().numpy())
        
        # Concatenate all weights
        if weights_list:
            client_weights = np.concatenate(weights_list)
        else:
            os.unlink(tmp_path)
            return {"status": "rejected", "message": "No valid weights found in .pth file"}
        
        # Standardize to MODEL_VECTOR_SIZE (500k)
        if len(client_weights) > MODEL_VECTOR_SIZE:
            # Truncate if too large
            client_weights = client_weights[:MODEL_VECTOR_SIZE]
        elif len(client_weights) < MODEL_VECTOR_SIZE:
            # Pad with zeros if too small
            padding = np.zeros(MODEL_VECTOR_SIZE - len(client_weights))
            client_weights = np.concatenate([client_weights, padding])
        
        # Clip to [-1, 1] range for safety
        client_weights = np.clip(client_weights, -1.0, 1.0)
        
        # Compute delta from current global model
        delta = client_weights - global_model_weights
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        # Now call the existing validation and aggregation logic
        # 1. ZERO-TRUST EVALUATION
        real_delta_i, current_accuracy = evaluator.verify_update(global_model_weights, delta)
        
        print(f"[EVAL] Client: {client_id} | Real ΔI: {real_delta_i*100:.4f}% | Acc: {current_accuracy*100:.2f}%")
        
        # Tighten threshold to -1.5%
        if real_delta_i < -0.015:
            print(f"[Server] REJECTED: Accuracy drop too high ({real_delta_i*100:.2f}%)")
            db.add_commit(
                client_id, 
                "Rejected ❌", 
                f"Zero-Trust Failure: Accuracy dropped by {abs(real_delta_i*100):.1f}%", 
                "None", 
                0
            )
            return {"status": "rejected", "message": "Zero-Trust: Quality too low."}

        # Only merge if improvement > 0
        if real_delta_i <= 0:
            db.add_commit(client_id, "Rejected ❌", "No measurable improvement", "None", 0)
            return {"status": "rejected", "message": "Update did not improve the model."}

        # 2. ROBUST ASYNC AGGREGATION
        global_model_weights = aggregator.apply_update(
            global_model_weights, 
            delta, 
            global_version, 
            client_version
        )
        
        # 3. VERSION BUMP & BOUNTY
        old_version = global_version
        global_version += 1
        
        bounty_earned = 5 + int(real_delta_i * 10000)
        
        db.add_commit(
            client_id, 
            "Merged ✅", 
            f"Real Improvement: {real_delta_i*100:.3f}% | New Acc: {current_accuracy*100:.1f}%", 
            f"v{old_version}->v{global_version}", 
            bounty_earned
        )

        return {
            "status": "success", 
            "bounty_earned": bounty_earned, 
            "new_version": global_version
        }
        
    except Exception as e:
        print(f"[ERROR] File upload processing failed: {str(e)}")
        return {"status": "rejected", "message": f"Error processing file: {str(e)}"}
