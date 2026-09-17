"""
prediction-service/app.py

Small FastAPI microservice that loads the Data Analyst's scikit-learn
model(s) and exposes a /predict endpoint over HTTP. The Node/Express
backend calls this service — Node cannot load .pkl/.joblib files directly.

⚠️ PLACEHOLDER — the exact input features, output shape, and whether
this is one multi-output model or three separate models are NOT YET
KNOWN. See the "Questions for the Data Analyst" list alongside this
file. Update MODEL_PATH and the predict() logic once the real model
and its documentation arrive.

Run locally:
    pip install fastapi uvicorn scikit-learn joblib pydantic
    uvicorn app:app --reload --port 5000
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="Climate Disaster Platform — Prediction Service")

MODEL_PATH = os.getenv("MODEL_PATH", "./models/flood_risk_model.pkl")

model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Loaded model from {MODEL_PATH}")
    else:
        print(f"WARNING: model file not found at {MODEL_PATH}. "
              f"/predict will return 503 until it's placed there.")


# TODO: replace with the ACTUAL feature names/order the Data Analyst's
# model was trained on. This is a guess based on the data we have
# (flood extent + discharge) — do not trust it until confirmed.
class PredictionInput(BaseModel):
    flood_area_km2: float | None = None
    avg_discharge_m3s: float | None = None
    max_discharge_m3s: float | None = None
    month: int | None = None
    year: int | None = None


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
def predict(input: PredictionInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    # TODO: this feature vector construction is a placeholder. Replace
    # with the exact order/preprocessing the model expects once known.
    features = [[
        input.flood_area_km2 or 0,
        input.avg_discharge_m3s or 0,
        input.max_discharge_m3s or 0,
        input.month or 0,
    ]]

    try:
        prediction = model.predict(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    # TODO: shape this response once we know what the model actually
    # returns (a single array? a dict with risk/flood/discharge keys?).
    return {
        "isProvisional": True,
        "note": "Prediction service scaffold — verify output shape against real model.",
        "raw_prediction": prediction.tolist() if hasattr(prediction, "tolist") else prediction,
    }