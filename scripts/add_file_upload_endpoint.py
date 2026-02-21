"""
Script to add a file upload endpoint to the FastAPI server.
This endpoint accepts .pth files, converts them to the standard format,
and calls the existing submit_update logic.

To use: Add this code to server/main.py after the existing endpoints.
"""

endpoint_code = '''
# Additional import needed at the top of server/main.py:
# from fastapi import UploadFile, File as FastAPIFile
# import torch
# import tempfile

@app.post("/submit_update_file")
async def submit_update_file(
    file: UploadFile,
    client_id: str,
    client_version: int
):
    """
    Accept a .pth file upload, convert it to the standard weights_delta format,
    and process it through the existing submit_update logic.
    """
    global global_model_weights, global_version
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pth") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Load the PyTorch model state dict
        state_dict = torch.load(tmp_path, map_location="cpu")
        
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
        import os
        os.unlink(tmp_path)
        
        # Now call the existing validation and aggregation logic
        # (Same as submit_update endpoint)
        
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
'''

print("=" * 70)
print("BACKEND FILE UPLOAD ENDPOINT CODE")
print("=" * 70)
print("\nAdd the following to server/main.py:\n")
print(endpoint_code)
print("\n" + "=" * 70)
print("IMPORTANT: You also need to add these imports at the top of server/main.py:")
print("  - from fastapi import UploadFile, File as FastAPIFile")
print("  - import torch")
print("  - import tempfile")
print("=" * 70)
