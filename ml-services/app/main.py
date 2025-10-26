from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from app.services import llm, nlp, optimizer, vector, timeseries
from app.services.schemas import (
    LLMRequest,
    LLMResponse,
    NLPRequest,
    NLPResponse,
    OptimizationRequest,
    OptimizationResponse,
    VectorSearchRequest,
    VectorSearchResponse,
    ForecastRequest,
    ForecastResponse,
    VectorAddRequest,
)

app = FastAPI(title="ICARUS ML Services", version="0.4.0")


class HealthResponse(BaseModel):
    service: str
    status: str
    components: List[str]


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        service="ml-services",
        status="ok",
        components=[
            "llm-remote",
            "nlp-finance",
            "optimizer",
            "vector-search",
            "time-series",
        ],
    )


@app.post("/vector/faiss/add")
async def vector_add(request: VectorAddRequest):
    if not request.vectors or not request.ids:
        raise HTTPException(status_code=400, detail="ids e vectors são obrigatórios")
    if len(request.vectors) != len(request.ids):
        raise HTTPException(status_code=400, detail="ids e vectors devem ter o mesmo tamanho")
    result = vector.add_vectors(request)
    return result


@app.post("/vector/faiss/clear")
async def vector_clear():
    vector.clear_vectors()
    return {"status": "cleared"}


@app.post("/vector/faiss/search", response_model=VectorSearchResponse)
async def vector_search(request: VectorSearchRequest):
    try:
        result = vector.search(request)
        return result
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/llm/mistral", response_model=LLMResponse)
async def llm_generate(request: LLMRequest):
    result = await llm.generate(request)
    return result


@app.post("/nlp/finance", response_model=NLPResponse)
async def nlp_finance(request: NLPRequest):
    result = await nlp.analyze(request)
    return result


@app.post("/optimizer/or-tools", response_model=OptimizationResponse)
async def optimize_or_tools(request: OptimizationRequest):
    result = optimizer.solve_or_tools(request)
    return result


@app.post("/timeseries/prophet", response_model=ForecastResponse)
async def forecast_prophet(request: ForecastRequest):
    result = timeseries.forecast_prophet(request)
    return result
