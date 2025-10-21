# 🏥 Healthcheck - ICARUS v5.0

**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**

📅 Data: 2025-10-20T16:12:30.068Z

---

## 📊 Sumário

| Status | Quantidade |
|--------|------------|
| ✅ OK | 1 |
| ⚠️  Avisos | 2 |
| ❌ Falhas | 2 |
| **Total** | **5** |

**Status Geral:** 🟡 PARCIAL

---

## 📋 Detalhamento

### ✅ OK ICARUS_WEB_URL

**Endpoint:** `http://localhost:4173`

**Mensagem:** Frontend acessível

**HTTP Status:** 200

**Prioridade:** **OK**

---

### ❌ AUSENTE SUPABASE_URL

**Mensagem:** Variável de ambiente não definida

**Ação Recomendada:** Definir VITE_SUPABASE_URL no .env

**Prioridade:** **CRÍTICA**

---

### ❌ AUSENTE SUPABASE_ANON_KEY

**Mensagem:** Variável de ambiente não definida

**Ação Recomendada:** Definir VITE_SUPABASE_ANON_KEY no .env

**Prioridade:** **CRÍTICA**

---

### ⚠️  AUSENTE SUPABASE_SERVICE_ROLE_KEY

**Mensagem:** Chave de serviço não configurada (opcional)

**Ação Recomendada:** Definir SUPABASE_SERVICE_ROLE_KEY para scripts backend

**Prioridade:** **BAIXA**

---

### ⚠️  NÃO CONFIGURADO MEILISEARCH

**Mensagem:** Serviço de busca não configurado (opcional)

**Ação Recomendada:** Configurar VITE_MEILISEARCH_HOST se quiser busca avançada

**Prioridade:** **BAIXA**

---

## 🔧 Troubleshooting

### ICARUS_WEB_URL não acessível

```bash
# Verificar se o preview está rodando
npm run preview:start

# Ou iniciar com PM2
npm run preview:setup
```

### Supabase não configurado

1. Criar projeto em [supabase.com](https://supabase.com)
2. Copiar URL e chaves do Dashboard
3. Adicionar ao `.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Meilisearch não acessível

```bash
# Docker (recomendado)
docker run -d -p 7700:7700 getmeili/meilisearch:latest

# Ou instalar localmente
curl -L https://install.meilisearch.com | sh
./meilisearch
```

---

*Relatório gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*
