# Supabase Edge: `vector-benchmark`

- Endpoint: `https://ttswvavcisdnonytslom.supabase.co/functions/v1/vector-benchmark`
- Payload:
```json
{
  "query": [0.1, 0.2, 0.3],
  "topK": 5,
  "module": "cirurgias",
  "faissUrl": "https://ml-service/api/vector/faiss/search",
  "vectorSearchUrl": "https://app-prod/api/ml/vector-search",
  "vectorSearchToken": "<opcional bearer>"
}
```
- Resposta:
```json
{
  "summary": {
    "faissLatencyMs": 12.5,
    "pgvectorLatencyMs": 45.7,
    "recallAtK": 0.8
  },
  "detail": {
    "faissIds": ["doc-a", "doc-b"],
    "pgvectorIds": ["doc-a", "doc-c"]
  }
}
```
- Usar `supabase functions invoke vector-benchmark --body '{}'` para testes locais.
