# config.py - Shared configuration for client and server
import os

# Project root: parent of asyncshield package
_PACKAGE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(_PACKAGE_DIR)

# Data directory for MNIST (server golden set + client local data)
DATA_DIR = os.environ.get("ASYNCSHIELD_DATA_DIR", os.path.join(PROJECT_ROOT, "data"))

# Server URL (clients connect here)
SERVER_URL = os.environ.get("ASYNCSHIELD_SERVER_URL", "http://localhost:8000")

# Global model vector length (must match server and WeightStandardizer)
MODEL_VECTOR_SIZE = int(os.environ.get("ASYNCSHIELD_MODEL_SIZE", "500000"))

# Server-only: database and host/port
_SERVER_DIR = os.path.join(_PACKAGE_DIR, "server")
SERVER_DB_PATH = os.environ.get("ASYNCSHIELD_DB_PATH", os.path.join(_SERVER_DIR, "asyncshield.db"))
SERVER_HOST = os.environ.get("ASYNCSHIELD_SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.environ.get("ASYNCSHIELD_SERVER_PORT", "8000"))
