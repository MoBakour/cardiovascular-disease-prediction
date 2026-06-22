"""
FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router
from app import data, models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load saved models or train from scratch."""
    loaded = models.load_saved_models()
    if not loaded:
        data.load_and_prepare()
        models.train_all_models()
    yield


app = FastAPI(
    title="Cardiovascular Disease Prediction API",
    description="ML-powered cardiovascular disease risk prediction",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
