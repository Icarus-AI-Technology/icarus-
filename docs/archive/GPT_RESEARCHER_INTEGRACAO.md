# Integração GPT Researcher - Icarus

## 📋 Visão Geral

O **GPT Researcher** é um agente de pesquisa profunda de código aberto, projetado para realizar pesquisas abrangentes e factuais na web e localmente sobre qualquer tarefa. Esta integração fornece ao Icarus capacidades avançadas de pesquisa através de um chatbot inteligente.

## 🚀 Instalação

O pacote já foi instalado no projeto:

```bash
npm install gpt-researcher
```

## 🏗️ Arquitetura

A integração consiste em três camadas principais:

### 1. **Serviço** (`/src/lib/gpt-researcher-service.ts`)
Encapsula toda a lógica de comunicação com o GPT Researcher WebSocket.

### 2. **Hook React** (`/src/hooks/useGPTResearcher.ts`)
Hook customizado para gerenciar o estado e ciclo de vida da pesquisa.

### 3. **Componente UI** (`/src/components/oraclusx-ds/ChatbotWithResearch.tsx`)
Interface visual completa para interação com o usuário.

## 📦 Componentes Criados

### ChatbotWithResearch

Componente principal de chatbot com capacidade de pesquisa integrada.

**Props:**
```typescript
interface ChatbotWithResearchProps {
  position?: "bottom-right" | "bottom-left";
  className?: string;
  researcherHost?: string;
  onMessageSent?: (message: string) => void;
}
```

**Exemplo de uso básico:**
```tsx
import { ChatbotWithResearch } from '@/components/oraclusx-ds';

function App() {
  return (
    <ChatbotWithResearch
      position="bottom-right"
      researcherHost="http://localhost:8000"
      onMessageSent={(message) => console.log('Enviado:', message)}
    />
  );
}
```

## 🔧 Hook: useGPTResearcher

Hook para integração programática com GPT Researcher.

**Exemplo de uso:**
```tsx
import { useGPTResearcher } from '@/hooks';

function MyComponent() {
  const {
    isConnected,
    isResearching,
    logs,
    error,
    research,
    clearLogs
  } = useGPTResearcher({
    host: 'http://localhost:8000',
    onLog: (data) => console.log('Log:', data)
  });

  const handleResearch = async () => {
    await research({
      task: "Quais são as tendências de IA em 2025?",
      reportType: "research_report",
      reportSource: "web"
    });
  };

  return (
    <div>
      <button onClick={handleResearch} disabled={!isConnected}>
        Pesquisar
      </button>
      {isResearching && <p>Pesquisando...</p>}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

## 🛠️ Serviço: GPTResearcherService

Classe singleton para gerenciamento avançado.

**Exemplo de uso:**
```typescript
import { getGPTResearcherService } from '@/lib/gpt-researcher-service';

const service = getGPTResearcherService({
  host: 'http://localhost:8000',
  timeout: 60000
});

// Inicializar
await service.initialize();

// Adicionar listener
service.addLogListener((log) => {
  console.log('Log:', log);
});

// Fazer pesquisa
await service.research({
  task: "Como funciona blockchain?",
  reportType: "research_report",
  reportSource: "web",
  queryDomains: ["techcrunch.com", "wired.com"]
});
```

## 🔐 Configuração do Servidor

Para usar o GPT Researcher, você precisa ter o servidor rodando. Existem duas opções:

### Opção 1: Docker (Recomendado)

```bash
docker pull gptresearcher/gpt-researcher
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your_api_key \
  gptresearcher/gpt-researcher
```

### Opção 2: Python Local

```bash
# Instalar
pip install gpt-researcher

# Executar servidor
python -m gpt_researcher.server --port 8000
```

## 🎨 Funcionalidades

### 1. **Pesquisa em Tempo Real**
- Pesquisa web profunda
- Múltiplas fontes
- Citações automáticas

### 2. **Interface Intuitiva**
- Chat interativo
- Histórico de mensagens
- Indicadores visuais de status

### 3. **Logs Detalhados**
- Acompanhamento do processo
- Visualização de fontes
- Debugging facilitado

### 4. **Customização**
- Tipos de relatório (research_report, detailed_report, resource_report)
- Fontes (web, local, hybrid)
- Tom (objective, formal, analytical, informative)
- Domínios específicos

## 📊 Tipos de Relatório

### research_report
Relatório de pesquisa padrão com informações factuais.

### detailed_report
Relatório detalhado com análise profunda.

### resource_report
Lista de recursos e referências sobre o tema.

## 🌐 Fontes de Pesquisa

### web
Pesquisa na internet (padrão).

### local
Pesquisa em documentos locais.

### hybrid
Combinação de web e local.

## 🎯 Exemplos de Uso

### Exemplo 1: Pesquisa Simples
```tsx
<ChatbotWithResearch
  position="bottom-right"
  researcherHost="http://localhost:8000"
/>
```

### Exemplo 2: Com Callback
```tsx
<ChatbotWithResearch
  position="bottom-left"
  researcherHost="http://localhost:8000"
  onMessageSent={(msg) => {
    // Salvar histórico
    saveToHistory(msg);
  }}
/>
```

### Exemplo 3: Hook Customizado
```tsx
function CustomResearch() {
  const { research, isResearching, logs } = useGPTResearcher();

  const handleClick = async () => {
    await research({
      task: "Análise de mercado de IA generativa",
      reportType: "detailed_report",
      reportSource: "web",
      queryDomains: ["gartner.com", "forrester.com"]
    });
  };

  return (
    <div>
      <button onClick={handleClick}>
        Pesquisar Mercado
      </button>
      
      {isResearching && <Spinner />}
      
      <div>
        {logs.map((log, i) => (
          <div key={i}>{log.output}</div>
        ))}
      </div>
    </div>
  );
}
```

## 🐛 Troubleshooting

### Erro: "GPT Researcher não está conectado"
**Solução:** Verifique se o servidor GPT Researcher está rodando em `http://localhost:8000`.

### Erro: "WebSocket connection failed"
**Solução:** 
1. Confirme que o servidor está acessível
2. Verifique se a porta 8000 está disponível
3. Verifique configurações de firewall

### Pesquisa não retorna resultados
**Solução:**
1. Verifique sua chave API (OpenAI, Google, etc.)
2. Confirme que há conexão com internet
3. Verifique os logs do servidor

## 🔒 Segurança

- **Nunca** exponha suas chaves API no frontend
- O servidor GPT Researcher deve gerenciar as chaves
- Use variáveis de ambiente para configuração sensível
- Considere autenticação para produção

## 📈 Performance

### Otimizações Implementadas:
- Singleton pattern no serviço
- Lazy loading do pacote GPT Researcher
- Debounce em pesquisas rápidas
- Cache de resultados (considerar implementar)

## 🚀 Próximos Passos

### Melhorias Futuras:
1. ✅ Cache de pesquisas anteriores
2. ✅ Exportação de relatórios (PDF, MD)
3. ✅ Histórico persistente
4. ✅ Filtros avançados de domínio
5. ✅ Integração com banco de dados
6. ✅ Analytics de uso

## 📚 Recursos

- [GPT Researcher Documentation](https://docs.gptr.dev)
- [GPT Researcher GitHub](https://github.com/assafelovic/gpt-researcher)
- [API Reference](https://docs.gptr.dev/api)

## 🤝 Suporte

Para questões sobre a integração:
- Consulte esta documentação
- Verifique os logs do console
- Revise o código dos componentes

Para questões sobre GPT Researcher:
- [Discord Oficial](https://discord.gg/QgZXvJAccX)
- [GitHub Issues](https://github.com/assafelovic/gpt-researcher/issues)

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Autor:** Equipe Icarus

