# Benchmark Vetorial (FAISS vs pgvector)

Para executar quando os serviços estiverem disponíveis:

```bash
ML_API_URL=https://<ml-services>
ML_VECTOR_SEARCH_URL=https://<app>/api/ml/vector-search
ML_VECTOR_TOKEN=<opcional>
npx tsx tools/bench/vector-compare.ts
```

Ou via Supabase Edge:
```bash
/opt/homebrew/bin/supabase functions invoke vector-benchmark --project-ref ttswvavcisdnonytslom --body '{
  "query": [0.121,0.035,0.248,0.402,0.178,0.062,0.315,0.229,0.157,0.094],
  "topK": 5,
  "module": "cirurgias",
  "faissUrl": "https://<ml-services>/vector/faiss/search",
  "vectorSearchUrl": "https://<app>/api/ml/vector-search"
}'
```

Resultados ficam em `docs/qa/vector-benchmark.json`.
