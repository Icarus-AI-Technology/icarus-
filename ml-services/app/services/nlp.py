from transformers import pipeline

from .schemas import NLPRequest, NLPResponse, NLPScore

_finance_pipeline = None
_pt_classifier = None


def _load_finance():
    global _finance_pipeline
    if _finance_pipeline is None:
        _finance_pipeline = pipeline("text-classification", model="ProsusAI/finbert")
    return _finance_pipeline


def _load_bertimbau():
    global _pt_classifier
    if _pt_classifier is None:
        _pt_classifier = pipeline("text-classification", model="rdenadai/bertimbau-finetuned-sentiment")
    return _pt_classifier


def analyze(request: NLPRequest) -> NLPResponse:
    if request.task == "sentiment":
        clf = _load_bertimbau()
    else:
        clf = _load_finance()
    outputs = clf(request.text, top_k=3)
    scores = [NLPScore(label=out["label"], score=float(out["score"])) for out in outputs]
    return NLPResponse(task=request.task, scores=scores)
