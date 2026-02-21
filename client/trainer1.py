# client/trainer1.py
import torch
import torch.optim as optim
from torchvision import datasets, transforms
from opacus import PrivacyEngine
import requests
import numpy as np
import uuid
import random

from asyncshield.client.models import RobustCNN, restore_1d_to_model
from asyncshield.client.standardizer import WeightStandardizer
from asyncshield.config import SERVER_URL, DATA_DIR, MODEL_VECTOR_SIZE

CLIENT_ID = f"specialist-node-{uuid.uuid4().hex[:4]}"

def run_trainer():
    print(f"--- Starting Trainer 1: {CLIENT_ID} ---")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 1️⃣ Fetch Global State
    res = requests.get(f"{SERVER_URL}/get_model").json()
    global_weights_1d = np.array(res['weights'])
    current_version = res['version']

    # 2️⃣ Setup Model (RobustCNN)
    model = RobustCNN().to(device)
    model = restore_1d_to_model(model, global_weights_1d)

    # 3️⃣ Local Data (INCREASED TO 5000 RANDOM SAMPLES)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])

    dataset = datasets.MNIST(DATA_DIR, train=True, download=True, transform=transform)

    # 🔥 Increased Data from 1000 → 5000
    subset_indices = random.sample(range(len(dataset)), 5000)
    subset = torch.utils.data.Subset(dataset, subset_indices)

    train_loader = torch.utils.data.DataLoader(subset, batch_size=32, shuffle=True)

    # 4️⃣ Privacy Engine (Lower Noise → Higher Epsilon)
    optimizer = optim.SGD(model.parameters(), lr=0.01)

    privacy_engine = PrivacyEngine()

    model, optimizer, train_loader = privacy_engine.make_private(
        module=model,
        optimizer=optimizer,
        data_loader=train_loader,
        noise_multiplier=0.7,  # 🔥 Reduced noise (was 1.1)
        max_grad_norm=1.0
    )

    # 5️⃣ Train (INCREASED EPOCHS FROM 1 → 3)
    epochs = 3

    model.train()
    for epoch in range(epochs):
        print(f"Epoch {epoch+1}/{epochs}")
        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(device), target.to(device)
            optimizer.zero_grad()
            output = model(data)
            loss = torch.nn.CrossEntropyLoss()(output, target)
            loss.backward()
            optimizer.step()

    # 6️⃣ Standardize and Push
    standardizer = WeightStandardizer(target_size=MODEL_VECTOR_SIZE)
    updated_1d = standardizer.universal_standardize(model)
    delta = updated_1d - global_weights_1d

    payload = {
        "client_id": CLIENT_ID,
        "client_version": current_version,
        "weights_delta": delta.tolist()
    }

    response = requests.post(f"{SERVER_URL}/submit_update", json=payload)
    print(f"[{CLIENT_ID}] Server Response: {response.json()}")

if __name__ == "__main__":
    run_trainer()