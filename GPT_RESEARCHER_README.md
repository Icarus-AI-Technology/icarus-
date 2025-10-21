# 🤖 GPT Researcher - Guia Rápido

## 🚀 Início Rápido

### 1. Instalação
Já está instalado! ✅

```bash
npm install gpt-researcher  # Já executado
```

### 2. Iniciar o Servidor GPT Researcher

**Opção A: Docker (Recomendado)**
```bash
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sua_chave_api \
  gptresearcher/gpt-researcher
```

**Opção B: Python**
```bash
pip install gpt-researcher
python -m gpt_researcher.server --port 8000
```

### 3. Uso no Icarus

```tsx
import { ChatbotWithResearch } from '@/components/oraclusx-ds';

function App() {
  return (
    <ChatbotWithResearch 
      position="bottom-right"
      researcherHost="http://localhost:8000"
    />
  );
}
```

## 📦 Componentes Criados

### 1. ChatbotWithResearch
Componente de UI completo com chat e pesquisa integrada.

**Localização:** `/src/components/oraclusx-ds/ChatbotWithResearch.tsx`

### 2. useGPTResearcher Hook
Hook React para integração programática.

**Localização:** `/src/hooks/useGPTResearcher.ts`

### 3. GPTResearcherService
Serviço singleton para gerenciamento avançado.

**Localização:** `/src/lib/gpt-researcher-service.ts`

## 🎯 Exemplos de Uso

### Exemplo 1: Básico
```tsx
<ChatbotWithResearch />
```

### Exemplo 2: Com Callback
```tsx
<ChatbotWithResearch
  onMessageSent={(msg) => console.log('Enviado:', msg)}
/>
```

### Exemplo 3: Hook Customizado
```tsx
const { research, isResearching } = useGPTResearcher();

await research({
  task: "Quais são as tendências de IA?",
  reportType: "research_report",
  reportSource: "web"
});
```

## 🔧 Configuração

### Variáveis de Ambiente (Servidor)
```env
OPENAI_API_KEY=sua_chave_aqui
GPT_RESEARCHER_PORT=8000
```

### Props do Componente
```typescript
interface ChatbotWithResearchProps {
  position?: "bottom-right" | "bottom-left";
  className?: string;
  researcherHost?: string;  // default: "http://localhost:8000"
  onMessageSent?: (message: string) => void;
}
```

## 📊 Tipos de Relatório

- `research_report` - Relatório de pesquisa padrão
- `detailed_report` - Análise profunda
- `resource_report` - Lista de recursos

## 🔍 Fontes de Pesquisa

- `web` - Internet (padrão)
- `local` - Documentos locais
- `hybrid` - Combinação

## ✨ Funcionalidades

- ✅ Pesquisa web profunda
- ✅ Interface de chat interativa
- ✅ Múltiplas fontes e citações
- ✅ Logs detalhados
- ✅ Tipos de relatório customizáveis
- ✅ Filtro por domínios específicos
- ✅ Indicadores de status em tempo real

## 🐛 Troubleshooting

### "GPT Researcher não está conectado"
➡️ Verifique se o servidor está rodando em `http://localhost:8000`

### "WebSocket connection failed"
➡️ Confirme que a porta 8000 está disponível e não bloqueada por firewall

### Sem resultados
➡️ Verifique:
- Chave API configurada no servidor
- Conexão com internet
- Logs do servidor para erros

## 📚 Documentação Completa

Para documentação detalhada, consulte:
- `/docs/GPT_RESEARCHER_INTEGRACAO.md`
- Exemplos práticos em `/src/components/examples/GPTResearcherExamples.tsx`

## 🎨 Componentes Exportados

Todos os componentes estão disponíveis via:

```tsx
import { 
  ChatbotWithResearch,
  useGPTResearcher 
} from '@/components/oraclusx-ds';
```

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- Nunca exponha chaves API no frontend
- Configure as chaves no servidor GPT Researcher
- Use HTTPS em produção

## 🚀 Próximos Passos

1. Configure o servidor GPT Researcher
2. Importe e use o componente
3. Customize conforme necessário
4. Veja os exemplos práticos

---

**Status:** ✅ Pronto para uso  
**Versão:** 1.0.0  
**Data:** Outubro 2025

