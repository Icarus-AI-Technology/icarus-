# Vercel Environment Variables (Production)

# Supabase
SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_PROJECT_REF=ttswvavcisdnonytslom

# Feature Flags
FF_AI_TUTOR_CIRURGIAS=1
FF_ML_QUEUE=1

# ML Services
ML_ENQUEUE_URL=https://<vercel-app>/api/ml/enqueue
ML_ENQUEUE_TOKEN=<bearer_token_optional>
ML_VECTOR_SEARCH_URL=https://<vercel-app>/api/ml/vector-search
ML_VECTOR_TOKEN=<bearer_token_optional>
VITE_ML_ENQUEUE_URL=/api/ml/enqueue
VITE_ML_VECTOR_URL=/api/ml/vectors
VITE_ML_API_URL=https://<ml-services>

# Meilisearch / OCR / Integrations (placeholders)
VITE_MEILISEARCH_URL=https://<meili>
VITE_MEILISEARCH_API_KEY=<key>
VITE_TESSERACT_MODE=keywords

# PostHog / Analytics
VITE_PUBLIC_POSTHOG_KEY=<key>
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email / Notifications (example)
RESEND_API_KEY=<resend_key>

# Other
NODE_ENV=production
