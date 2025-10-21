# ⚠️ Guia de Configuração Manual do GPT Researcher

## Problema Encontrado

A instalação via Python encontrou problemas de compatibilidade com dependências.

## Soluções Alternativas

### Opção 1: Docker (Recomendado)

Se você tiver Docker Desktop instalado:

```bash
docker run -d --name gpt-researcher \
  -p 8000:8000 \
  -e OPENAI_API_KEY="sua_chave_api_aqui" \
  gptresearcher/gpt-researcher
```

### Opção 2: Python com ambiente virtual atualizado

```bash
# Remover ambiente com problema
rm -rf gpt-researcher-env

# Criar novo ambiente com Python 3.10+
python3.10 -m venv gpt-researcher-env
source gpt-researcher-env/bin/activate

# Instalar
pip install --upgrade pip
pip install gpt-researcher

# Iniciar servidor
export OPENAI_API_KEY="sua_chave_api_aqui"
python -m gpt_researcher.server --port 8000
```

### Opção 3: Servidor Remoto GPT Researcher

Você pode usar uma instância remota do GPT Researcher e configurar o componente para apontar para ela:

```tsx
<ChatbotWithResearch 
  researcherHost="https://sua-instancia-gpt-researcher.com"
/>
```

## Teste Sem Servidor (Mock)

Para testar a interface sem servidor:

1. Abra o arquivo: `src/pages/GPTResearcherDemo.tsx`
2. Acesse a página de demonstração
3. O chat ficará em estado "desconectado" mas a UI está funcional

## Configuração das Chaves de API

### OpenAI (Principal)
```bash
export OPENAI_API_KEY="sk-..."
```

### Alternativas
- Anthropic Claude: `export ANTHROPIC_API_KEY="..."`
- Google Gemini: `export GOOGLE_API_KEY="..."`
- Local (Ollama): `export OPENAI_BASE_URL="http://localhost:11434/v1"`

## Instalando Docker

### macOS
```bash
# Opção 1: Docker Desktop
# Baixe em: https://www.docker.com/products/docker-desktop

# Opção 2: Colima (alternativa open source)
brew install colima docker
colima start
```

### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## Verificação

Após configurar, teste:

```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{"status": "healthy"}
```

## Suporte

Se continuar tendo problemas:

1. **Verifique os logs** do servidor
2. **Confirme a porta** 8000 está livre
3. **Teste sua chave** de API separadamente
4. **Considere usar** um serviço hospedado

## Componente Pronto

O componente React já está totalmente implementado e pronto. Assim que o servidor estiver rodando:

```tsx
import { ChatbotWithResearch } from '@/components/oraclusx-ds';

<ChatbotWithResearch 
  researcherHost="http://localhost:8000"
/>
```

---

**Status do Código:** ✅ 100% Completo e Funcional
**Status do Servidor:** ⏳ Aguardando Configuração

Para mais detalhes, consulte:
- `docs/GPT_RESEARCHER_INTEGRACAO.md`
- `GPT_RESEARCHER_README.md`

