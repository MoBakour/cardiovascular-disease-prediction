import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "5000"))
HOST = os.getenv("HOST", "0.0.0.0")
DATASET_PATH = os.getenv("DATASET_PATH", "cvd_dataset.csv")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Directory for persisted model artifacts (relative to working directory)
MODELS_DIR = Path(os.getenv("MODELS_DIR", "models"))
