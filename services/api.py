"""Health and model-contract API for the Python service image."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Landmark AI services", version="1.0.0")


class ForecastRequest(BaseModel):
    model: str = Field(pattern="^(convlstm|predrnn)$")
    market: str
    horizon: int = Field(default=4, ge=1, le=12)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "landmark-ai", "version": "1.0.0"}


@app.post("/forecast")
def forecast_contract(request: ForecastRequest) -> dict:
    return {
        "status": "accepted",
        "model": request.model,
        "market": request.market,
        "horizon": request.horizon,
        "message": "Connect this contract to a registered SageMaker endpoint.",
    }

