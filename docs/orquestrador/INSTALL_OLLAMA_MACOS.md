# 🍎 INSTALAÇÃO OLLAMA - macOS

**Sistema:** macOS (Darwin 25.1.0)  
**Data:** 20 de outubro de 2025

---

## 📥 OPÇÕES DE INSTALAÇÃO

### Opção 1: Download Direto (RECOMENDADO) ⭐
```bash
# Baixar instalador oficial
open https://ollama.com/download/mac

# Ou via terminal:
curl -L -o ~/Downloads/Ollama.dmg https://ollama.com/download/Ollama-darwin.dmg

# Instalar:
# 1. Abrir Ollama.dmg
# 2. Arrastar Ollama para Applications
# 3. Abrir Ollama.app
```

### Opção 2: Homebrew (se disponível)
```bash
# Verificar se Homebrew está instalado
brew --version

# Instalar Ollama
brew install ollama

# Verificar instalação
ollama --version
```

### Opção 3: GPU Cloud (sem instalação local)
Se preferir não instalar localmente, use GPU cloud:

#### RunPod (GPU cloud barato)
- **Preço:** $0.20-0.50/hora
- **Setup:** 5 minutos
- **URL:** https://runpod.io

**Steps:**
1. Criar conta em https://runpod.io
2. Deploy template "Ollama"
3. Copiar URL da API
4. Configurar `.env`:
```bash
VITE_OLLAMA_URL=https://xxxxx-11434.proxy.runpod.net
```

#### Modal Labs (Serverless GPU)
- **Preço:** Pay-per-use (~$0.10/hora idle)
- **Setup:** 10 minutos
- **URL:** https://modal.com

---

## ✅ APÓS INSTALAÇÃO

### 1. Verificar Ollama
```bash
# Verificar versão
ollama --version

# Verificar se está rodando
ollama list
```

### 2. Pull Modelos
```bash
# Modelo 1: Llama 3.1 8B (4.7GB)
ollama pull llama3.1:8b

# Modelo 2: Mistral 7B (4.1GB)
ollama pull mistral:7b

# Verificar modelos instalados
ollama list
```

### 3. Testar
```bash
# Teste rápido
ollama run llama3.1:8b "O que é OPME em 3 frases?"

# API HTTP
curl http://localhost:11434/api/tags
```

### 4. Configurar .env
```bash
# .env.local
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_DEFAULT_MODEL=llama3.1:8b
```

---

## 🎯 ALTERNATIVA: USAR CLOUD SEM INSTALAR

Se não quiser instalar Ollama localmente, nossa estratégia Cloud-First permite:

### Opção A: Usar apenas GPT-4/Claude (sem Ollama)
```typescript
// src/lib/llm/hybrid.service.ts
// Se Ollama não estiver disponível, usa 100% GPT-4
// Fallback automático já implementado! ✅
```

### Opção B: GPU Cloud (RunPod/Modal)
Vantagens:
- ✅ Zero instalação local
- ✅ GPU potente (mais rápido)
- ✅ Pay-per-use
- ✅ Escalável

Desvantagens:
- ⏳ Custo (baixo, mas existe)
- ⏳ Latência de rede

---

## 💡 RECOMENDAÇÃO FINAL

Dado que:
1. ✅ Estamos em macOS
2. ✅ Ollama precisa ser instalado manualmente (download .dmg)
3. ✅ Temos fallback automático para GPT-4 implementado

**Sugestão:** 

### Fase 1 (AGORA): Cloud-First sem Ollama
- ✅ Usar GPT-4/Claude para queries complexas
- ✅ Focar nas integrações que NÃO dependem de Ollama
- ✅ BrasilAPI, PostHog, Resend, Redis Cloud

### Fase 2 (DEPOIS): Adicionar Ollama quando conveniente
- ⏳ Baixar Ollama.dmg
- ⏳ Instalar modelos
- ⏳ HybridLLMService automaticamente detecta e usa

**Vantagem:** Sistema funciona 100% sem Ollama, com fallback inteligente!

---

## 🚀 PRÓXIMA AÇÃO

Vou prosseguir com as integrações que **NÃO dependem de Ollama**:

1. ✅ Integrar BrasilAPI em formulários
2. ✅ Setup template .env com cloud services
3. ✅ Criar guia de criação de contas (Resend, PostHog, Redis)
4. ✅ Atualizar MonitoringDashboard para mostrar "Ollama: Opcional"

**Ollama fica como OPCIONAL - sistema funciona sem ele!** 🎯

---

© 2025 ICARUS v5.0  
**Cloud-First. Ollama Optional. Full Functionality.**

