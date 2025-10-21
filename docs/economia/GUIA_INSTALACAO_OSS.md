# 🚀 GUIA RÁPIDO — Instalação OSS (Pós-Migração)

**Executar após confirmar migração SQL aplicada**

---

## 1️⃣ VALIDAR MIGRAÇÃO

```bash
npm run db:validate
```

**Resultado esperado:**
```
✅ MIGRAÇÃO VALIDADA COM SUCESSO!
```

---

## 2️⃣ INSTALAR OLLAMA (IA Local)

### **macOS (seu sistema)**

```bash
# Download e instalação automática
curl -fsSL https://ollama.com/install.sh | sh

# OU manualmente:
# brew install ollama
```

### **Baixar modelo recomendado**

```bash
# Modelo principal (8B - rápido e eficiente)
ollama pull llama3.1:8b

# Modelos alternativos (opcional):
# ollama pull mistral:7b       # Alternativa francesa
# ollama pull phi3:medium      # Pequeno e rápido (3.8B)
```

### **Testar**

```bash
# Iniciar servidor Ollama (se não iniciou automaticamente)
ollama serve

# Em outro terminal, testar:
ollama run llama3.1:8b "Explique o que é PGR em 3 linhas"
```

**Resultado esperado:**
```
PGR (Programa de Gerenciamento de Riscos) é um documento que identifica, 
avalia e controla riscos ocupacionais em ambientes de trabalho. É obrigatório 
para empresas brasileiras desde 2022, substituindo o antigo PPRA.
```

---

## 3️⃣ INSTALAR MEILISEARCH (Busca OSS)

### **Opção A: Docker (Recomendado)**

```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY="dev_master_key_change_in_production" \
  -v $(pwd)/.meilisearch:/meili_data \
  getmeili/meilisearch:latest
```

### **Opção B: Brew (macOS)**

```bash
brew update && brew install meilisearch

# Iniciar servidor
meilisearch --master-key "dev_master_key_change_in_production"
```

### **Testar**

```bash
# Verificar health
curl http://localhost:7700/health

# Criar índice de teste
curl -X POST 'http://localhost:7700/indexes' \
  -H 'Authorization: Bearer dev_master_key_change_in_production' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "uid": "test",
    "primaryKey": "id"
  }'
```

**Resultado esperado:**
```json
{
  "taskUid": 0,
  "indexUid": "test",
  "status": "enqueued",
  "type": "indexCreation"
}
```

---

## 4️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

Criar arquivo `.env.local`:

```bash
cat > .env.local << 'EOF'
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔐 ICARUS v5.0 — Variáveis de Ambiente (Local)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzE1MzksImV4cCI6MjA3NjQwNzUzOX0.pZhNjYp2M9S9wF_drLA6-ZK-tk_GaaJn5kYBTxQE1xg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc

# Ollama (IA Local)
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Meilisearch (Busca OSS)
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=dev_master_key_change_in_production

# Feature Flags (Desenvolvimento)
ENABLE_OLLAMA=true
ENABLE_MEILISEARCH=true
ENABLE_AI_TUTORS=true

# Modo de Desenvolvimento
NODE_ENV=development
VITE_ENV=development
EOF
```

---

## 5️⃣ POPULAR BASE DE CONHECIMENTO

```bash
# Reindexar documentação para RAG
npm run ai:tutor:reindex
```

**Resultado esperado:**
```
🤖 Reindexando base de conhecimento...
   ✓ Conectado ao Meilisearch
   ✓ 45 documentos processados
   ✓ Embeddings gerados via Ollama
   ✓ Índice atualizado
✅ Base de conhecimento pronta!
```

---

## 6️⃣ TESTAR SISTEMA COMPLETO

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

Abrir: http://localhost:5173

### **Testar Feature Flags:**

1. Fazer login
2. Ir para qualquer módulo
3. Procurar ícone de "ajuda" ou "tutor IA"
4. Verificar se funciona (modo dev)

### **Verificar Console:**

```javascript
// No DevTools Console:
localStorage.getItem('feature_flags')

// Deve retornar algo como:
// {"ollama_enabled": true, "tutor_pgr": true, ...}
```

---

## 7️⃣ MONITORAR RECURSOS

### **Ollama:**

```bash
# Ver modelos instalados
ollama list

# Ver uso de recursos
docker stats  # Se usando Docker
```

### **Meilisearch:**

```bash
# Dashboard web
open http://localhost:7700

# Verificar índices
curl http://localhost:7700/indexes \
  -H 'Authorization: Bearer dev_master_key_change_in_production'
```

---

## 📊 VERIFICAÇÕES DE SAÚDE

```bash
# 1. Ollama
curl http://localhost:11434/api/tags

# 2. Meilisearch
curl http://localhost:7700/health

# 3. Supabase
npm run db:health

# 4. Feature Flags
npm run db:validate
```

---

## 🎯 PRÓXIMOS PASSOS

Após tudo instalado e testado:

1. **Criar primeiro tutor IA (PGR)**
   ```bash
   # Seguir: docs/tutores/PLANO_EXECUCAO_S1_S4.md
   ```

2. **Configurar PM2 para produção**
   ```bash
   pm2 start ecosystem.economia.config.js
   pm2 save
   ```

3. **Habilitar feature flags gradualmente**
   - Começar com admin only
   - Depois beta testers (10%)
   - Gradualmente aumentar para 100%

---

## 🆘 TROUBLESHOOTING

### **❌ Ollama não inicia**

```bash
# Verificar porta 11434
lsof -i :11434

# Reiniciar
pkill ollama
ollama serve
```

### **❌ Meilisearch erro de conexão**

```bash
# Docker: verificar container
docker ps | grep meilisearch

# Se não estiver rodando:
docker start meilisearch

# Brew: reiniciar
brew services restart meilisearch
```

### **❌ Embedding generation falha**

```bash
# Verificar se modelo está disponível
ollama list | grep llama3.1

# Re-baixar se necessário
ollama pull llama3.1:8b
```

---

## 💡 DICAS DE PERFORMANCE

### **Ollama:**
- **GPU:** Se tiver GPU NVIDIA, Ollama usa automaticamente
- **RAM:** llama3.1:8b precisa ~8GB RAM
- **CPU:** 4+ cores recomendados

### **Meilisearch:**
- **RAM:** 512MB mínimo, 2GB recomendado
- **Disco:** ~1GB para índices iniciais

### **Produção:**
- Usar `llama3.1:8b-q4_0` (quantizado) para economizar RAM
- Configurar cache Redis para embeddings
- Rate limiting nas chamadas Ollama

---

## 📈 MÉTRICAS ESPERADAS

Após instalação:

| Métrica | Antes (OpenAI) | Depois (Ollama) | Economia |
|---------|----------------|-----------------|----------|
| Custo/mês | US$ 50-200 | US$ 0 | 100% |
| Latência p95 | 800-1500ms | 200-500ms | 60-75% |
| Privacidade | ❌ Cloud | ✅ Local | 100% |
| Uptime | 99.9% (SaaS) | 99.99% (local) | +0.09% |

---

**Tempo total estimado:** 15-30 minutos  
**Economia anual:** US$ 600-2.4k (só Ollama)

---

**© 2025 ICARUS v5.0** 🚀

