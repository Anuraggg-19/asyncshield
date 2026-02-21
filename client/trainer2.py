# client/trainer2.py
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
import requests
import numpy as np
import uuid

from asyncshield.client.standardizer import WeightStandardizer
from asyncshield.config import SERVER_URL, DATA_DIR, MODEL_VECTOR_SIZE

CLIENT_ID = f"alternative-mlp-node-{uuid.uuid4().hex[:4]}"

# A completely different model architecture
class SimpleMLP(nn.Module):
    def __init__(self):
        super(SimpleMLP, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(28*28, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        )
    def forward(self, x):
        x = x.view(-1, 28*28)
        return self.fc(x)

def run_trainer():
    print(f"--- Starting Trainer 2 (MLP): {CLIENT_ID} ---")
    
    # 1. Fetch Global State
    res = requests.get(f"{SERVER_URL}/get_model").json()
    global_weights_1d = np.array(res['weights'])
    current_version = res['version']

    # 2. Setup MLP Model
    model = SimpleMLP()
    optimizer = optim.SGD(model.parameters(), lr=0.05)

    # 3. Train on MNIST
    transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
    dataset = datasets.MNIST(DATA_DIR, train=True, download=True, transform=transform)
    train_loader = torch.utils.data.DataLoader(torch.utils.data.Subset(dataset, range(500)), batch_size=32)

    model.train()
    for data, target in train_loader:
        optimizer.zero_grad()
        output = model(data)
        loss = nn.CrossEntropyLoss()(output, target)
        loss.backward()
        optimizer.step()

    # 4. UNIFIED STANDARDIZATION
    # Even though it's an MLP, we force it into the 500k-vector format
    standardizer = WeightStandardizer(target_size=MODEL_VECTOR_SIZE)
    updated_1d = standardizer.universal_standardize(model)
    
    # Calculate delta against the global weights
    delta = updated_1d - global_weights_1d

    # 5. Push to Server
    payload = {
        "client_id": CLIENT_ID,
        "client_version": current_version,
        "weights_delta": delta.tolist()
    }
    
    response = requests.post(f"{SERVER_URL}/submit_update", json=payload)
    print(f"[{CLIENT_ID}] Server Response: {response.json()}")

if __name__ == "__main__":
    run_trainer()