import os
import httpx

from .schemas import LLMRequest, LLMResponse, LLMChoice

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")


async def generate(request: LLMRequest) -> LLMResponse:
    payload = {
        "model": request.model or OLLAMA_MODEL,
        "prompt": request.prompt,
        "stream": False,
        "options": {
            "temperature": request.temperature,
            "num_predict": request.max_tokens,
        },
    }

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(f"{OLLAMA_URL}/api/generate", json=payload)
        resp.raise_for_status()
        data = resp.json()

    text = data.get("response") or data.get("output") or ""
    return LLMResponse(model=payload["model"], choices=[LLMChoice(text=text)])
