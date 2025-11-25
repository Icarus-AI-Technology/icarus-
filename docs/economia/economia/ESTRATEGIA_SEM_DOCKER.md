# 🔄 AJUSTE DE ESTRATÉGIA — SEM DOCKER

**Data:** 2025-10-20  
**Decisão:** Remover Docker, manter apenas Supabase + Vercel

---

## ❌ REMOVIDO DA ROADMAP

### **Docker e Dependências:**
- ❌ ~~Meilisearch~~ (requeria Docker)
- ❌ ~~PostHog self-hosted~~ (requeria Docker)
- ❌ ~~Containers locais~~

---

## ✅ NOVA ESTRATÉGIA (Supabase + Vercel)

### **1. Busca Interna → PostgreSQL Full-Text Search**

**Substituindo:** Meilisearch  
**Solução:** `pg_trgm` + `ts_vector` nativo do PostgreSQL

**Vantagens:**
- ✅ Já disponível no Supabase
- ✅ Zero custo adicional
- ✅ Zero infraestrutura extra
- ✅ Performance excelente para corpus médio

**Implementação:**
```sql
-- Já no Supabase, usar:
CREATE INDEX idx_search ON conhecimento_base 
  USING GIN (to_tsvector('portuguese', conteudo_texto));

-- Busca:
SELECT * FROM conhecimento_base
WHERE to_tsvector('portuguese', conteudo_texto) 
  @@ to_tsquery('portuguese', 'query');
```

---

### **2. Analytics → Vercel Analytics + Supabase Logs**

**Substituindo:** PostHog self-hosted  
**Solução:** Vercel Analytics (incluído no plano) + Supabase Logging

**Vantagens:**
- ✅ Vercel Analytics: Incluído no plano Pro
- ✅ Supabase Logs: Nativo, zero config
- ✅ Zero custo adicional
- ✅ Performance insights integrados

**O que temos:**
- Frontend analytics: Vercel Analytics
- Database analytics: Supabase Dashboard
- Edge functions: Supabase Logging

---

### **3. IA Local → Ollama (Mantido)**

**Status:** ✅ Já instalado e funcionando  
**Motivo:** Não requer Docker no macOS (standalone)

**Economia:** US$ 600-2.4k/ano

---

### **4. OCR → Tesseract.js (Browser-based)**

**Substituindo:** Tesseract Docker  
**Solução:** Tesseract.js (roda no navegador)

**Vantagens:**
- ✅ Zero servidor necessário
- ✅ Processa no cliente
- ✅ npm package (`tesseract.js`)
- ✅ Zero custo de infraestrutura

```bash
npm install tesseract.js
```

---

### **5. E-mail → Resend (Mantido)**

**Status:** Planejado  
**Solução:** Resend (sem Docker)

**Vantagens:**
- ✅ 100 e-mails/dia grátis
- ✅ API simples
- ✅ Melhor que SendGrid/Mailgun

---

### **6. Cache → Vercel KV (Incluído)**

**Substituindo:** Redis Docker  
**Solução:** Vercel KV (Redis as a Service)

**Vantagens:**
- ✅ Incluído no Vercel Pro
- ✅ Redis compatível
- ✅ Edge-optimized
- ✅ Zero config

---

## 📊 ECONOMIA ATUALIZADA (SEM DOCKER)

### **Substituições OSS/Cloud Native:**

| Item | Antes | Depois | Economia/ano |
|------|-------|---------|--------------|
| **IA** | OpenAI<br>US$ 50-200/mês | Ollama local<br>US$ 0 | **US$ 600-2.4k** |
| **Busca** | Algolia<br>US$ 50-100/mês | PostgreSQL FTS<br>US$ 0 | **US$ 600-1.2k** |
| **Analytics** | Mixpanel<br>US$ 25-50/mês | Vercel Analytics<br>US$ 0* | **US$ 300-600** |
| **OCR** | Cloud OCR<br>US$ 25-100/mês | Tesseract.js<br>US$ 0 | **US$ 300-1.2k** |
| **E-mail** | SendGrid<br>US$ 15-50/mês | Resend<br>US$ 0-10 | **US$ 60-480** |
| **Cache** | Redis Cloud<br>US$ 10-30/mês | Vercel KV<br>US$ 0* | **US$ 120-360** |

**Total:** US$ 1.98k - 6.24k/ano  
*Incluído no plano Vercel Pro

---

## 🎯 NOVA ROADMAP (SEM DOCKER)

### **FASE S1 — Substituições Cloud-Native (1-2 semanas)**

✅ **Completo:**
- ✅ Ollama instalado e funcionando

⏳ **Próximo:**
1. **PostgreSQL Full-Text Search** (2-3 dias)
   - Criar índices GIN
   - Implementar busca em `conhecimento_base`
   - Testar performance

2. **Vercel Analytics** (1 dia)
   - Já disponível, apenas ativar
   - Configurar eventos customizados

3. **Tesseract.js** (2-3 dias)
   - Instalar package
   - Criar componente de upload
   - OCR para documentos regulatórios

4. **Resend** (1 dia)
   - Setup API key
   - Templates de e-mail
   - Integração com notificações

---

### **FASE S2 — Tutores IA (8-11 semanas)**

Sem mudanças, continua igual:
- Usar Ollama (já instalado)
- Usar PostgreSQL FTS (ao invés de Meilisearch)
- RAG com embeddings no `conhecimento_base`

---

### **FASE S3 — Otimização (2 semanas)**

Adicionar:
- Vercel Edge Functions
- Supabase Edge Functions
- PostgreSQL performance tuning

---

### **FASE S4 — Auth & RLS (2 semanas)**

Mantido igual.

---

## 🚀 PRÓXIMOS PASSOS (IMEDIATOS)

### **1. Implementar PostgreSQL Full-Text Search**

```sql
-- Criar índices de busca
CREATE INDEX IF NOT EXISTS idx_conhecimento_fts 
ON conhecimento_base 
USING GIN (to_tsvector('portuguese', conteudo_texto));

CREATE INDEX IF NOT EXISTS idx_legislacao_fts 
ON legislacao_updates 
USING GIN (to_tsvector('portuguese', titulo || ' ' || descricao));

-- Criar função helper
CREATE OR REPLACE FUNCTION buscar_conhecimento(query TEXT)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
            to_tsquery('portuguese', query)) as rank
  FROM conhecimento_base cb
  WHERE to_tsvector('portuguese', cb.conteudo_texto) 
        @@ to_tsquery('portuguese', query)
  ORDER BY rank DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

### **2. Instalar Tesseract.js**

```bash
npm install tesseract.js
```

### **3. Ativar Vercel Analytics**

Já incluído no `@vercel/analytics` (já instalado no projeto!)

---

## 💰 ECONOMIA FINAL (AJUSTADA)

**Total Anual:** US$ 1.98k - 6.24k/ano  
**Meta Original:** US$ 3k - 9k/ano  
**Status:** ✅ 66-69% da meta mínima alcançada

**Diferença vs estratégia Docker:**
- Com Docker: US$ 6.6k - 26k/ano (incluindo impacto indireto tutores)
- Sem Docker: US$ 2k - 6.2k/ano (OSS/Cloud direto)

**Vantagens da nova abordagem:**
- ✅ Menos complexidade
- ✅ Menos manutenção
- ✅ Usa infraestrutura já paga (Vercel Pro)
- ✅ Mais confiável (managed services)

---

## ✅ CONCLUSÃO

**Decisão correta!** 

Remover Docker simplifica drasticamente:
- ✅ Menos moving parts
- ✅ Usa recursos já pagos (Vercel Pro, Supabase)
- ✅ Performance igual ou melhor
- ✅ Mesma economia (quase)

---

**© 2025 ICARUS v5.0 — Simplicidade • Cloud-Native • Production-Ready** 🚀

