# 🚀 SETUP OLLAMA - Guia de Instalação

**Data:** 20 de outubro de 2025  
**Objetivo:** Instalar e configurar Ollama para uso local/cloud

---

## 📋 PRÉ-REQUISITOS

### Hardware Mínimo
- **RAM:** 8GB (mínimo), 16GB (recomendado)
- **Disco:** 20GB livres (para modelos)
- **GPU:** Opcional (NVIDIA, AMD ou Apple Silicon)

### Sistema Operacional
- macOS 11+ (Apple Silicon ou Intel)
- Linux (Ubuntu 20.04+, Debian, Fedora, etc.)
- Windows 10/11 com WSL2

---

## 🔧 INSTALAÇÃO

### macOS / Linux
```bash
# Download e instalação automática
curl -fsSL https://ollama.com/install.sh | sh

# Verificar instalação
ollama --version
```

### Windows (WSL2)
```bash
# Dentro do WSL2
curl -fsSL https://ollama.com/install.sh | sh
```

### Docker (Alternativa)
```bash
# Pull imagem
docker pull ollama/ollama:latest

# Run container
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama

# Verificar
docker ps | grep ollama
```

---

## 📦 BAIXAR MODELOS

### Modelo 1: Llama 3.1 8B (Geral)
```bash
# Download (~4.7GB)
ollama pull llama3.1:8b

# Testar
ollama run llama3.1:8b "Explique o que é OPME em 3 frases"
```

### Modelo 2: Mistral 7B (Análises)
```bash
# Download (~4.1GB)
ollama pull mistral:7b

# Testar
ollama run mistral:7b "Analise este contexto: cirurgia cardíaca"
```

### Modelo 3: Code Llama 13B (Código - Opcional)
```bash
# Download (~7.4GB)
ollama pull codellama:13b

# Testar
ollama run codellama:13b "Escreva uma função TypeScript para validar CPF"
```

---

## ⚙️ CONFIGURAÇÃO NO ICARUS

### 1. Variáveis de Ambiente
```bash
# .env.local ou .env.production
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_DEFAULT_MODEL=llama3.1:8b
```

### 2. Verificar Integração
```typescript
// Teste no console do navegador ou Node.js
import { ollamaService } from '@/lib/llm/ollama.service';

// Health check
const isAvailable = await ollamaService.healthCheck();
console.log('Ollama disponível:', isAvailable);

// Listar modelos
const models = await ollamaService.listModels();
console.log('Modelos instalados:', models);

// Testar chat
const response = await ollamaService.chat([
  { role: 'system', content: 'Você é um assistente de gestão hospitalar' },
  { role: 'user', content: 'O que significa OPME?' }
]);
console.log('Resposta:', response);
```

---

## 🔥 USO DO HYBRID LLM SERVICE

### Exemplo 1: Análise Simples (Ollama - Grátis)
```typescript
import { hybridLLMService } from '@/lib/llm/hybrid.service';

const response = await hybridLLMService.processQuery({
  prompt: 'Sugira 3 melhorias para o fluxo de cirurgias',
  complexity: 'simple'
});

console.log(response.content); // Resposta
console.log(response.cost);    // $0 (Ollama)
console.log(response.model);   // "ollama:llama3.1:8b"
```

### Exemplo 2: Análise Complexa (GPT-4 - Pago)
```typescript
const response = await hybridLLMService.processQuery({
  prompt: 'Analise conformidade ANVISA deste documento...',
  complexity: 'complex'
});

console.log(response.cost);  // ~$0.03 (GPT-4)
console.log(response.model); // "gpt-4-turbo"
```

### Exemplo 3: Sugestões (80% Ollama)
```typescript
const suggestions = await hybridLLMService.getSuggestions(
  'Contexto: 5 cirurgias agendadas hoje',
  'Como otimizar a agenda?'
);

console.log(suggestions); // Array de sugestões
```

---

## 🐳 DEPLOY COM DOCKER COMPOSE

### docker-compose.yml
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: icarus-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_ORIGINS=*
    restart: unless-stopped
    # Opcional: GPU support
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

volumes:
  ollama_data:
    driver: local
```

### Iniciar
```bash
# Up
docker-compose up -d ollama

# Baixar modelos dentro do container
docker exec -it icarus-ollama ollama pull llama3.1:8b
docker exec -it icarus-ollama ollama pull mistral:7b

# Verificar
docker logs icarus-ollama
curl http://localhost:11434/api/tags
```

---

## 🌩️ ALTERNATIVA: GPU CLOUD

### Opção 1: RunPod (GPU cloud barato)
- **Preço:** $0.20-0.50/hora (GPU)
- **Setup:** Ollama pré-instalado em templates
- **URL:** https://runpod.io

### Opção 2: Modal Labs
- **Preço:** Pay-per-use (~$0.10/hora idle)
- **Setup:** Serverless GPU
- **URL:** https://modal.com

### Configuração com GPU Cloud
```bash
# .env.production
VITE_OLLAMA_URL=https://seu-ollama-gpu.runpod.io
VITE_OLLAMA_API_KEY=<se necessário>
```

---

## 📊 MONITORAMENTO

### Verificar Performance
```bash
# Ollama logs
ollama serve --log-level debug

# Verificar uso de RAM/GPU
ollama ps  # Lista processos ativos

# Métricas
curl http://localhost:11434/api/tags | jq
```

### Latência Esperada
- **CPU (8-core):** 3-8s por resposta (100-300 tokens)
- **GPU (RTX 3060):** 1-3s por resposta
- **Apple M1/M2:** 2-5s por resposta

---

## 🔧 TROUBLESHOOTING

### Problema: Ollama não inicia
```bash
# Verificar se porta está em uso
lsof -i :11434

# Reiniciar serviço
brew services restart ollama  # macOS
systemctl restart ollama      # Linux

# Logs
journalctl -u ollama -f       # Linux systemd
```

### Problema: Modelo muito lento
```bash
# Usar modelo menor
ollama pull llama3.1:7b  # Versão menor

# Ou reduzir contexto
ollama run llama3.1:8b --context-size 2048
```

### Problema: Falta memória
```bash
# Reduzir modelos carregados
ollama rm codellama:13b

# Usar apenas 1 modelo por vez
ollama serve --max-loaded-models 1
```

---

## ✅ VALIDAÇÃO FINAL

### Checklist
- [ ] Ollama instalado e rodando
- [ ] Modelos baixados (llama3.1:8b + mistral:7b)
- [ ] Health check passa: `curl localhost:11434/api/tags`
- [ ] Variáveis de ambiente configuradas
- [ ] HybridLLMService testado e funcional
- [ ] Latência aceitável (< 10s)

### Teste Completo
```typescript
// src/__tests__/llm.test.ts
import { hybridLLMService } from '@/lib/llm/hybrid.service';

describe('Hybrid LLM', () => {
  it('should use Ollama for simple queries', async () => {
    const response = await hybridLLMService.processQuery({
      prompt: 'O que é OPME?',
      complexity: 'simple'
    });

    expect(response.cost).toBe(0); // Ollama = grátis
    expect(response.model).toContain('ollama');
  });

  it('should provide usage stats', () => {
    const stats = hybridLLMService.getUsageStats();
    console.log(stats);
    expect(stats.ollamaAvailable).toBe(true);
  });
});
```

---

## 💰 ECONOMIA PROJETADA

### Cenário Atual (sem Ollama)
- **GPT-4 Turbo:** $200-500/mês
- **Claude 3.5:** $100-300/mês
- **Total:** $300-800/mês

### Cenário com Ollama (80/20)
- **Ollama (80%):** $0/mês
- **GPT-4 (20%):** $40-100/mês
- **Total:** $40-100/mês
- **Economia:** $260-700/mês (~$3,120-8,400/ano)

---

**Setup completo!** 🎉  
**Ollama rodando + HybridLLMService implementado = $0 para 80% das queries de IA**

---

© 2025 ICARUS v5.0  
**Cost Optimization. AI at Zero Cost.**

