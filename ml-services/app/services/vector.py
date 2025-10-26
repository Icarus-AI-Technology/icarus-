from typing import List

import numpy as np
import faiss

from .schemas import VectorAddRequest, VectorSearchRequest, VectorSearchResponse, VectorHit

_index = None
_ids: List[str] = []


def _ensure_index(dimension: int):
    global _index, _ids
    if _index is None:
        _index = faiss.IndexFlatIP(dimension)
        _ids = []
    return _index


def normalize(vectors: np.ndarray) -> np.ndarray:
    faiss.normalize_L2(vectors)
    return vectors


def add_vectors(request: VectorAddRequest):
    index = _ensure_index(len(request.vectors[0]))
    arr = normalize(np.array(request.vectors, dtype='float32'))
    index.add(arr)
    _ids.extend(request.ids)
    return {"count": len(request.ids)}


def clear_vectors():
    global _index, _ids
    _index = None
    _ids = []


def search(request: VectorSearchRequest) -> VectorSearchResponse:
    index = _ensure_index(len(request.query))
    if index.ntotal == 0:
        raise RuntimeError('Vector index vazio. Utilize `add_vectors` antes de pesquisar.')

    query = normalize(np.array([request.query], dtype='float32'))
    scores, idxs = index.search(query, request.top_k)
    hits = []
    for score, idx in zip(scores[0], idxs[0]):
        if idx == -1:
            continue
        hits.append(VectorHit(id=_ids[idx], score=float(score)))
    return VectorSearchResponse(hits=hits)
