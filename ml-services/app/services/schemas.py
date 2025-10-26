from pydantic import BaseModel, Field
from typing import List, Optional


class LLMRequest(BaseModel):
    prompt: str
    max_tokens: int = 256
    temperature: float = 0.2
    model: str = "mistral"


class LLMChoice(BaseModel):
    text: str


class LLMResponse(BaseModel):
    model: str
    choices: List[LLMChoice]


class NLPRequest(BaseModel):
    text: str
    task: str = Field("sentiment", description="sentiment | classification | ner")


class NLPScore(BaseModel):
    label: str
    score: float


class NLPResponse(BaseModel):
    task: str
    scores: List[NLPScore]


class OptimizationConstraint(BaseModel):
    name: str
    value: float


class OptimizationRequest(BaseModel):
    objective: List[float]
    constraints: Optional[List[OptimizationConstraint]] = None


class OptimizationResponse(BaseModel):
    status: str
    solution: List[float]
    objective_value: float


class VectorAddRequest(BaseModel):
    ids: List[str]
    vectors: List[List[float]]


class VectorSearchRequest(BaseModel):
    query: List[float]
    top_k: int = 5


class VectorHit(BaseModel):
    id: str
    score: float


class VectorSearchResponse(BaseModel):
    hits: List[VectorHit]


class ForecastRequest(BaseModel):
    timestamps: List[str]
    values: List[float]
    horizon: int = 7


class ForecastPoint(BaseModel):
    timestamp: str
    value: float


class ForecastResponse(BaseModel):
    model: str
    forecast: List[ForecastPoint]
