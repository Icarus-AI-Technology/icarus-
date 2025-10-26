# Pipeline de Persistência de Vetores (AI Tutor Cirurgias)

## Dependências e Flags
- Feature flags: `FF_AI_TUTOR_CIRURGIAS`, `FF_ML_QUEUE`
- Serviços: `ml-services` (FastAPI), Supabase (pgvector + Edge Function `ml-vectors`), BullMQ

## Fluxo
1. **Pré-processamento**: extração de texto de DANFEs / pedidos médicos (Tesseract, scripts QA).
2. **Vetorização**: uso de `ml-services` (`/vector/faiss/add`) ou outro modelo LLM para gerar embeddings.
3. **Enfileiramento**: CLI `tools/ops/enqueue-vector-store.ts` cria job `vector-store` com vetores + metadados.
4. **Worker**: `ml.worker.ts` chama `MlService.persistVectors` → `/api/ml/vectors` → Supabase `ml_vectors`.
5. **Consulta RAG**: `MlService.listPersistedVectors` + pesquisa FAISS/pgvector para tutor cirurgias.

## Setup Supabase
```sh
supabase db remote commit < sql/setup_pgvector.sql
supabase db remote commit < sql/create_ml_vectors_table.sql
supabase functions deploy ml-vectors
```

## Variáveis de Ambiente
- Backend/API: `ML_VECTOR_API_URL=https://<app>/api/ml/vectors`
- Frontend (Vite): `VITE_ML_VECTOR_URL=/api/ml/vectors`
- Ativar flags `FF_AI_TUTOR_CIRURGIAS=1`, `FF_ML_QUEUE=1`

## CLI `enqueue-vector-store`
```sh
# via arquivo JSON
npx tsx tools/ops/enqueue-vector-store.ts --input data/vetores.json

# parâmetros individuais
npx tsx tools/ops/enqueue-vector-store.ts \
  --external-id doc-1 \
  --module cirurgias \
  --embedding '[0.1,0.2,0.3]' \
  --metadata '{"idioma":"pt-BR"}' \
  --priority 5
```

Formato do JSON:
```json
{
  "vectors": [
    {
      "externalId": "doc-1",
      "module": "cirurgias",
      "embedding": [0.1, 0.2, 0.3],
      "metadata": {"idioma": "pt-BR"}
    }
  ]
}
```

## Operação
- `--dry-run`: valida payload sem enfileirar.
- `--delay`: agenda job (ms).
- Monitorar BullMQ e tabela `ml_vectors` no Supabase para auditoria.

## Próximos Passos
- Automatizar ingestão (watcher de storage Supabase → CLI).
- Criar benchmarks FAISS vs pgvector para tutor cirurgias.
- Estender `module` para compras/estoque com novos feature flags.
