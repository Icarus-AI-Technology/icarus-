# Variáveis de Ambiente (Vercel/Produção)

## Backend / API
```
ML_ENQUEUE_URL=https://<app-prod>/api/ml/enqueue
ML_ENQUEUE_TOKEN=<bearer token opcional>
FF_AI_TUTOR_CIRURGIAS=1
FF_ML_QUEUE=1
```

## Frontend (Vite)
```
VITE_ML_ENQUEUE_URL=/api/ml/enqueue
VITE_ML_VECTOR_URL=/api/ml/vectors
VITE_ML_API_URL=https://<ml-services>
```

## Supabase Edge (opcional)
Se quiser consumir direto a função:
```
VITE_ML_VECTOR_URL=https://ttswvavcisdnonytslom.supabase.co/functions/v1/ml-vectors
```
