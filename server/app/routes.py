"""
API route definitions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import data, models

router = APIRouter()


class PredictRequest(BaseModel):
    model: str
    tuning: str
    input: list[float]


@router.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


@router.get("/training-status")
def training_status():
    """Check if models are trained and ready."""
    return {
        "complete": models.training_complete,
        "progress": models.training_progress,
    }


@router.get("/evaluate")
def evaluate():
    """Return evaluation results for all 9 model variants."""
    if not models.training_complete:
        raise HTTPException(status_code=503, detail="Models are still training. Please wait.")
    return models.results


@router.post("/predict")
def predict(req: PredictRequest):
    """Predict cardiovascular disease for given patient features."""
    if not models.training_complete:
        raise HTTPException(status_code=503, detail="Models are still training. Please wait.")

    model_name = req.model
    tuning = req.tuning
    input_data = req.input

    if model_name not in models.models:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' not found.")

    # Select the right model variant based on tuning method
    if tuning == "Grid Search":
        model = models.grid_tuning_models[model_name]
    elif tuning == "Randomized Search":
        model = models.randomized_tuning_models[model_name]
    else:
        model = models.models[model_name]

    # Transform raw input through the same engineering/selection/scaling pipeline
    try:
        input_scaled = data.prepare_input(input_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    prediction = model.predict(input_scaled)
    return {"prediction": prediction.tolist()}
