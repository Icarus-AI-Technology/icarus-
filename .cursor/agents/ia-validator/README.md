# 🤖 IA Validator Agent

## Missão

Verificar se todas as IAs nativas estão configuradas corretamente para operar em localhost durante desenvolvimento.

## IAs Nativas Validadas

### 1. 🦙 Ollama (LLM Local)

- **Desenvolvimento:** http://localhost:11434
- **Produção:** Desabilitado (usar OpenAI/Anthropic)
- **Validações:**
  - ✓ Endpoint acessível
  - ✓ Modelos instalados
  - ✓ API key não necessária

### 2. 👁️ Tesseract.js (OCR)

- **Ambiente:** Cliente (Browser)
- **Validações:**
  - ✓ Workers configurados
  - ✓ WASM files acessíveis em `/public/tesseract`
  - ✓ Performance adequada

### 3. 🔍 Meilisearch (Search Engine)

- **Desenvolvimento:** http://localhost:7700
- **Produção:** Meilisearch Cloud
- **Validações:**
  - ✓ Endpoint acessível
  - ✓ Health check OK
  - ✓ Índices disponíveis

### 4. 📊 PostHog (Analytics)

- **Desenvolvimento:** http://localhost:8000
- **Produção:** PostHog Cloud
- **Validações:**
  - ✓ SDK inicializado
  - ✓ API key configurada
  - ✓ Privacy mode ativo

### 5. 🗄️ Supabase Edge Functions (AI)

- **Desenvolvimento:** Local Supabase
- **Produção:** Supabase Cloud
- **Validações:**
  - ✓ Conexão estabelecida
  - ✓ Auth configurado
  - ✓ Edge functions disponíveis

## Como Usar

### Executar Validação

```bash
node .cursor/agents/ia-validator/validate-ia.js
```

### Com Variáveis de Ambiente

```bash
NODE_ENV=development node .cursor/agents/ia-validator/validate-ia.js
```

### Relatórios

Os relatórios são salvos em:

```
.cursor/agents/ia-validator/validation-{timestamp}.json
```

## Interpretação de Status

- ✅ **OK**: Serviço funcionando corretamente
- ⚠️ **Warning**: Serviço parcialmente configurado
- ❌ **Error**: Serviço não disponível
- ⏭️ **Skipped**: Validação ignorada (ex: produção)

## Dependências

- `node-fetch`: Para requisições HTTP
- Variáveis de ambiente configuradas no `.env`

## Troubleshooting

### Ollama não acessível

```bash
# Instalar Ollama
brew install ollama

# Iniciar servidor
ollama serve

# Baixar modelo
ollama pull llama2
```

### Meilisearch não acessível

```bash
# Usando Docker
docker run -d -p 7700:7700 getmeili/meilisearch:latest

# Ou via Homebrew
brew install meilisearch
meilisearch
```

### Supabase não configurado

```bash
# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Configurar no .env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Tesseract.js arquivos faltando

```bash
# Criar diretório
mkdir -p public/tesseract

# Baixar arquivos necessários
# (geralmente feito automaticamente pelo pacote)
```

## Integração CI/CD

Para validação em CI/CD, adicione ao pipeline:

```yaml
- name: Validate AI Services
  run: |
    node .cursor/agents/ia-validator/validate-ia.js
  env:
    NODE_ENV: test
```

## Outputs

### Console

```
🤖 Validando IAs Nativas (development)...

🦙 Verificando Ollama...
✅ Ollama OK - 2 modelos disponíveis
🔍 Verificando Meilisearch...
✅ Meilisearch OK
📊 Verificando PostHog...
✅ PostHog configurado
🗄️  Verificando Supabase...
✅ Supabase OK
👁️  Verificando Tesseract.js...
✅ Tesseract.js arquivos encontrados

============================================================
📊 RELATÓRIO DE VALIDAÇÃO DE IAs
============================================================

✅ ollama: ok
   └─ Endpoint: http://localhost:11434
   └─ Modelos: llama2, codellama
✅ meilisearch: ok
   └─ Endpoint: http://localhost:7700
✅ posthog: ok
✅ supabase: ok
✅ tesseract: ok
   └─ Path: /tesseract

📄 Relatório salvo: .cursor/agents/ia-validator/validation-1729900000000.json

✅ VALIDAÇÃO PASSOU!
```

### JSON Report

```json
{
  "timestamp": "2025-10-26T...",
  "environment": "development",
  "checks": [
    {
      "service": "ollama",
      "status": "ok",
      "endpoint": "http://localhost:11434",
      "models": ["llama2", "codellama"]
    }
  ],
  "passed": true,
  "failed": 0
}
```
