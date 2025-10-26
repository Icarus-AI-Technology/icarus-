#!/usr/bin/env node

/**
 * ICARUS v5.0 - Setup Automático de Agentes
 * 
 * Este script cria toda a estrutura de diretórios e arquivos
 * necessária para o sistema de auditoria com 9 agentes.
 * 
 * Uso: node setup-icarus-agents.cjs
 */

 
const fs = require('fs');
const path = require('path');

console.log('🚀 ICARUS v5.0 - Setup de Agentes\n');
console.log('📦 Criando estrutura de diretórios e arquivos...\n');

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const BASE_DIR = '.cursor';

const AGENTS = [
  { id: '01', name: 'design-system', emoji: '🎨', subagents: 3 },
  { id: '02', name: 'frontend', emoji: '⚛️', subagents: 4 },
  { id: '03', name: 'backend', emoji: '🗄️', subagents: 4 },
  { id: '04', name: 'integrations', emoji: '🔌', subagents: 4 },
  { id: '05', name: 'ai', emoji: '🤖', subagents: 4 },
  { id: '06', name: 'modules', emoji: '📦', subagents: 7 },
  { id: '07', name: 'security', emoji: '🔒', subagents: 4 },
  { id: '08', name: 'testing', emoji: '🧪', subagents: 4 },
  { id: '09', name: 'deploy', emoji: '🚀', subagents: 4 }
];

const DIRECTORIES = [
  'config',
  'agents',
  'protocols',
  'templates',
  'scripts',
  'scripts/utils',
  'locks',
  'messages',
  'logs',
  'reports'
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function createDirectory(dirPath) {
  const fullPath = path.join(BASE_DIR, dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✅ ${dirPath}`);
  }
}

function createFile(filePath, content) {
  const fullPath = path.join(BASE_DIR, filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  📄 ${filePath}`);
}

// ============================================================================
// 1. CRIAR DIRETÓRIOS BASE
// ============================================================================

console.log('📁 Criando diretórios base...');
DIRECTORIES.forEach(dir => createDirectory(dir));

// Criar diretórios de agentes e subagentes
AGENTS.forEach(agent => {
  const agentDir = `agents/${agent.id}-${agent.name}`;
  createDirectory(agentDir);
  createDirectory(`${agentDir}/subagents`);
});

console.log('\n');

// ============================================================================
// 2. CRIAR ARQUIVO .cursorrules
// ============================================================================

console.log('📜 Criando .cursorrules...');

const CURSORRULES = `# ICARUS v5.0 - Cursor AI Rules

## 🎯 Contexto do Projeto

**Sistema:** ICARUS v5.0 - ERP para Distribuidores OPME  
**Stack:** React 18 + TypeScript 5.6 + Vite + Supabase  
**Design System:** OraclusX DS (Neumorphic 3D)  
**Módulos:** 58 módulos funcionais  
**Status:** Auditoria completa em andamento

---

## ⚠️ REGRA FUNDAMENTAL

### **NUNCA MODIFICAR CÓDIGO SEM APROVAÇÃO EXPLÍCITA**

Os agentes devem **APENAS**:
- ✅ Auditar e analisar
- ✅ Documentar gaps e issues
- ✅ Gerar relatórios
- ✅ Sugerir correções

Os agentes **NUNCA** devem:
- ❌ Modificar arquivos de código
- ❌ Criar novos componentes
- ❌ Alterar configurações
- ❌ Aplicar correções automaticamente

---

## 📋 Protocolos de Execução

### 1. Verificar STATUS.json
Antes de iniciar qualquer tarefa, verificar:
\`\`\`json
{
  "status": "idle|running|completed|failed|blocked",
  "progress": 0-100,
  "locked_resources": []
}
\`\`\`

### 2. Adquirir Locks
Para leitura de recursos críticos:
\`\`\`typescript
const locked = await acquireLock('resource-path', 'agent-id');
if (!locked) {
  // Aguardar ou abortar
}
\`\`\`

### 3. Atualizar Progresso
Durante execução, atualizar STATUS.json:
\`\`\`json
{
  "status": "running",
  "progress": 45,
  "current_task": "Auditando componentes..."
}
\`\`\`

### 4. Gerar Relatório
Ao finalizar, criar REPORT.md com:
- Resumo executivo
- Detalhamento técnico
- Gaps identificados
- Recomendações

---

## 🎨 Padrões de Código

### TypeScript
- ✅ Strict mode habilitado
- ✅ Props sempre tipadas
- ✅ Evitar \`any\`
- ✅ Usar tipos gerados do Supabase

### Nomenclatura
- Componentes: \`PascalCase\`
- Variáveis: \`camelCase\`
- Arquivos: \`kebab-case.tsx\`
- Hooks: \`useCamelCase\`
- Services: \`PascalCaseService.ts\`

### Design System OraclusX DS
- Usar **APENAS** componentes do DS
- Cor primária: \`#6366F1\` (indigo)
- Sombras neumórficas (4 tipos)
- Dark/Light mode obrigatório
- Acessibilidade WCAG 2.1 AA

---

## 🔧 Comandos Disponíveis

\`\`\`bash
# Validação
npm run type-check          # TypeScript check
npm run lint                # ESLint
npm run build               # Build production

# Testes
npm run test                # Unit tests
npm run test:e2e            # E2E Playwright
npm run qa:all              # QA completo

# Agentes
npm run setup:agents        # Criar estrutura
npm run audit:full          # Executar todos os agentes
npm run audit:agent -- 01   # Executar agente específico
npm run report:generate     # Gerar relatório consolidado

# Logs
npm run logs:agent -- 01    # Ver logs de um agente
npm run logs:all            # Ver todos os logs
\`\`\`

---

## 📚 Referências Principais

- **Spec Completa:** \`ICARUS_V5_SPEC_COMPLETO.md\`
- **Design System:** \`ORACLUSX_DS_COMPLETO.md\`
- **Manual 58 Módulos:** \`MANUAL_COMPLETO_58_MODULOS.md\`
- **Inventário:** \`inventario.md\`
- **README:** \`README.md\`

---

## 🚫 Anti-Padrões (EVITAR)

❌ Modificar código sem aprovação  
❌ Ignorar erros TypeScript  
❌ Usar inline styles  
❌ Componentes fora do DS  
❌ Commits sem mensagem semântica  
❌ console.log em produção  
❌ Hardcoded credentials  
❌ Ignorar acessibilidade  
❌ Quebrar convenções de nomenclatura  

---

## 📊 Métricas de Qualidade

### Targets
- TypeScript: 0 erros
- ESLint: 0 erros
- Bundle: < 280 KB
- Build time: < 4s
- Lighthouse: 90+
- Test Coverage: 85%+
- Acessibilidade: WCAG AA 100%

---

## 🎯 Sistema de Agentes

### Grupos de Execução Paralela

**Grupo 1:** (30-45 min)
- 01 - Design System
- 02 - Frontend
- 07 - Segurança

**Grupo 2:** (45-60 min)
- 03 - Backend
- 04 - Integrações

**Grupo 3:** (60-90 min) - Aguarda Grupo 2
- 05 - IA
- 06 - Módulos

**Sequential:** (30-45 min) - Aguarda todos
- 08 - Testes
- 09 - Deploy

---

## 📞 Suporte

**Orquestrador:** \`.cursor/agents/00-ORCHESTRATOR.md\`  
**Protocolos:** \`.cursor/protocols/\`  
**Templates:** \`.cursor/templates/\`  

---

**Versão:** 5.0.0  
**Data:** ${new Date().toISOString()}  
**Status:** Sistema de Auditoria Ativo
`;

createFile('.cursorrules', CURSORRULES);

console.log('\n');

// ============================================================================
// 3. CRIAR CONFIGURAÇÕES
// ============================================================================

console.log('⚙️ Criando arquivos de configuração...');

// execution-plan.json
const EXECUTION_PLAN = {
  version: '1.0.0',
  created_at: new Date().toISOString(),
  parallel_groups: [
    {
      group_id: 1,
      agents: ['01', '02', '07'],
      estimated_time_minutes: 40,
      dependencies: [],
      description: 'Frontend, Design e Segurança (sem dependências BD)'
    },
    {
      group_id: 2,
      agents: ['03', '04'],
      estimated_time_minutes: 55,
      dependencies: [],
      description: 'Backend e Integrações (independentes)'
    },
    {
      group_id: 3,
      agents: ['05', '06'],
      estimated_time_minutes: 75,
      dependencies: ['03'],
      description: 'IA e Módulos (dependem do schema BD)'
    }
  ],
  sequential: {
    agents: ['08', '09'],
    estimated_time_minutes: 40,
    dependencies: ['01', '02', '03', '04', '05', '06', '07'],
    description: 'Testes e Deploy (dependem de todos)'
  },
  total_estimated_time_minutes: 210
};

createFile('config/execution-plan.json', JSON.stringify(EXECUTION_PLAN, null, 2));

// resources.json
const RESOURCES = {
  lockable_resources: [
    {
      path: 'src/components/oraclusx-ds/*',
      type: 'read-write',
      description: 'Design System components'
    },
    {
      path: 'src/pages/*',
      type: 'read-write',
      description: 'Pages and routes'
    },
    {
      path: 'src/hooks/*',
      type: 'read-write',
      description: 'Custom hooks'
    },
    {
      path: 'src/services/*',
      type: 'read-write',
      description: 'Business logic services'
    },
    {
      path: 'supabase/migrations/*',
      type: 'read-only',
      description: 'Database migrations'
    },
    {
      path: 'package.json',
      type: 'read-only',
      description: 'Package configuration'
    },
    {
      path: 'tsconfig.json',
      type: 'read-only',
      description: 'TypeScript configuration'
    }
  ],
  lock_policy: {
    read: 'multiple_readers_allowed',
    write: 'exclusive_lock_required',
    timeout_seconds: 30
  }
};

createFile('config/resources.json', JSON.stringify(RESOURCES, null, 2));

console.log('\n');

// ============================================================================
// 4. CRIAR STATUS.json PARA CADA AGENTE
// ============================================================================

console.log('📊 Criando STATUS.json para cada agente...');

AGENTS.forEach(agent => {
  const status = {
    agent_id: agent.id,
    agent_name: agent.name,
    emoji: agent.emoji,
    status: 'idle',
    start_time: null,
    end_time: null,
    duration_seconds: null,
    progress: 0,
    current_task: null,
    locked_resources: [],
    errors: [],
    warnings: [],
    metadata: {
      total_tasks: 0,
      completed_tasks: 0,
      total_subagents: agent.subagents,
      completed_subagents: 0,
      critical_issues: 0,
      important_issues: 0,
      suggestions: 0
    }
  };
  
  createFile(`agents/${agent.id}-${agent.name}/STATUS.json`, JSON.stringify(status, null, 2));
});

console.log('\n');

// ============================================================================
// 5. CRIAR PROTOCOLOS
// ============================================================================

console.log('📋 Criando protocolos...');

// SYNC-PROTOCOL.md
const SYNC_PROTOCOL = `# 🔄 Protocolo de Sincronização

## Estados dos Agentes

Cada agente mantém um arquivo \`STATUS.json\` com os seguintes estados:

### Estados Possíveis

\`\`\`typescript
type AgentStatus = 
  | 'idle'       // Aguardando início
  | 'running'    // Em execução
  | 'completed'  // Concluído com sucesso
  | 'failed'     // Falhou (erro crítico)
  | 'blocked';   // Bloqueado (aguardando dependências)
\`\`\`

### Estrutura do STATUS.json

\`\`\`json
{
  "agent_id": "01",
  "status": "running",
  "progress": 45,
  "current_task": "Auditando componentes OraclusX DS",
  "locked_resources": ["src/components/oraclusx-ds/*"],
  "errors": [],
  "warnings": ["5 componentes sem testes"]
}
\`\`\`

## Fluxo de Execução

\`\`\`mermaid
graph TD
    A[idle] --> B[Verificar Dependências]
    B -->|OK| C[running]
    B -->|Aguardar| D[blocked]
    D --> B
    C --> E[Executar Tarefas]
    E --> F[Atualizar Progress]
    F --> E
    E --> G[Gerar Relatório]
    G --> H[completed]
    E -->|Erro| I[failed]
\`\`\`

## Atualização de Status

### 1. Início
\`\`\`typescript
status.status = 'running';
status.start_time = new Date().toISOString();
status.progress = 0;
\`\`\`

### 2. Durante Execução
\`\`\`typescript
status.progress = Math.floor((completedTasks / totalTasks) * 100);
status.current_task = 'Descrição da tarefa atual';
\`\`\`

### 3. Finalização
\`\`\`typescript
status.status = 'completed';
status.end_time = new Date().toISOString();
status.progress = 100;
\`\`\`

## Dependências

Antes de iniciar, verificar se todas as dependências foram satisfeitas:

\`\`\`typescript
function checkDependencies(agentId) {
  const plan = require('../config/execution-plan.json');
  const deps = []; // implementar getDependencies se necessário
  
  return deps.every(depId => {
    const depStatus = loadStatus(depId);
    return depStatus.status === 'completed';
  });
}
\`\`\`
`;

createFile('protocols/SYNC-PROTOCOL.md', SYNC_PROTOCOL);

// COMMUNICATION.md
const COMMUNICATION = `# 📡 Comunicação entre Agentes

## Canais de Comunicação

### 1. Arquivos STATUS.json
- **Leitura:** Qualquer agente pode ler
- **Escrita:** Apenas o próprio agente
- **Localização:** \`.cursor/agents/{id}-{name}/STATUS.json\`

### 2. Arquivos de Mensagem
- **Formato:** JSON
- **Localização:** \`.cursor/messages/{from}-to-{to}.json\`
- **Tipo:** Assíncrona (não bloqueante)

### 3. Locks de Recursos
- **Formato:** JSON
- **Localização:** \`.cursor/locks/{resource-hash}.lock\`
- **Tipo:** Exclusivo para escrita

## Estrutura de Mensagem

\`\`\`json
{
  "id": "msg-123456",
  "from": "03",
  "to": "05",
  "timestamp": "2025-10-25T10:30:00Z",
  "type": "notification|request|response",
  "priority": "low|normal|high|critical",
  "subject": "Schema validado",
  "message": "Schema BD validado. Pode iniciar auditoria de modelos IA.",
  "data": {
    "tables_ready": true,
    "rpc_functions": ["get_dashboard_kpis", "atualizar_metricas"]
  },
  "requires_response": false,
  "read": false
}
\`\`\`

## Tipos de Mensagem

### 1. Notification (Notificação)
Informa conclusão de tarefa ou evento:

\`\`\`json
{
  "type": "notification",
  "from": "01",
  "to": "orchestrator",
  "subject": "Design System auditado",
  "message": "28/28 componentes validados. 0 erros críticos."
}
\`\`\`

### 2. Request (Solicitação)
Solicita informação ou ação:

\`\`\`json
{
  "type": "request",
  "from": "06",
  "to": "03",
  "subject": "Verificar tabela cirurgias",
  "message": "Módulo CirurgiasProcedimentos precisa confirmar schema da tabela.",
  "requires_response": true
}
\`\`\`

### 3. Response (Resposta)
Responde a uma solicitação:

\`\`\`json
{
  "type": "response",
  "from": "03",
  "to": "06",
  "subject": "Re: Verificar tabela cirurgias",
  "message": "Tabela cirurgias validada. 25 colunas, todas as FKs corretas.",
  "data": { "validated": true }
}
\`\`\`

## Exemplo de Uso

\`\`\`typescript
// Agente 03 (Backend) envia notificação para Agente 05 (IA)
const message = {
  id: 'msg-' + Date.now(),
  from: '03',
  to: '05',
  timestamp: new Date().toISOString(),
  type: 'notification',
  priority: 'normal',
  subject: 'Schema validado',
  message: 'Schema BD completo. 100+ tabelas, 15 RPC functions, 20 views.',
  data: {
    tables: 100,
    functions: 15,
    views: 20
  },
  requires_response: false,
  read: false
};

fs.writeFileSync('.cursor/messages/03-to-05.json', JSON.stringify(message, null, 2));
\`\`\`

## Leitura de Mensagens

\`\`\`typescript
function readMessages(agentId) {
  const messagesDir = '.cursor/messages';
  const files = fs.readdirSync(messagesDir);
  
  return files
    .filter(file => file.includes('to-' + agentId))
    .map(file => {
      const content = fs.readFileSync(messagesDir + '/' + file, 'utf8');
      return JSON.parse(content);
    })
    .filter(msg => !msg.read);
}
\`\`\`
`;

createFile('protocols/COMMUNICATION.md', COMMUNICATION);

// LOCKS.md
const LOCKS = `# 🔒 Sistema de Locks

## Conceito

O sistema de locks previne conflitos quando múltiplos agentes precisam acessar os mesmos recursos.

## Políticas de Lock

### Leitura (Read)
- **Múltiplos leitores:** Permitido
- **Lock:** Não requerido
- **Uso:** Auditar, analisar, gerar relatórios

### Escrita (Write)
- **Lock exclusivo:** Requerido
- **Apenas 1 agente:** Por vez
- **Uso:** Modificar arquivos (quando aprovado)

## Estrutura de Lock

\`\`\`json
{
  "resource": "src/components/Button.tsx",
  "holder": "01",
  "acquired_at": "2025-10-25T10:30:00Z",
  "expires_at": "2025-10-25T10:30:30Z",
  "type": "write"
}
\`\`\`

## Fluxo de Aquisição

\`\`\`mermaid
sequenceDiagram
    participant Agent
    participant LockManager
    participant Resource
    
    Agent->>LockManager: acquireLock(resource, agentId)
    LockManager->>Resource: Check if locked
    alt Resource Available
        LockManager->>Resource: Create lock file
        LockManager->>Agent: Lock acquired ✅
        Agent->>Resource: Access resource
        Agent->>LockManager: releaseLock(resource, agentId)
        LockManager->>Resource: Delete lock file
    else Resource Locked
        LockManager->>Agent: Lock failed ❌
        Agent->>Agent: Wait or retry
    end
\`\`\`

## Implementação

### Adquirir Lock

\`\`\`typescript
async function acquireLock(
  resource,
  agentId,
  timeout = 30000
) {
  const lockPath = getLockPath(resource);
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (!fs.existsSync(lockPath)) {
      const lock = {
        resource,
        holder: agentId,
        acquired_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + timeout).toISOString(),
        type: 'write'
      };
      
      fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
      return true;
    }
    
    // Aguardar 100ms antes de tentar novamente
    await new Promise(r => setTimeout(r, 100));
  }
  
  return false;
}
\`\`\`

### Liberar Lock

\`\`\`typescript
function releaseLock(resource, agentId) {
  const lockPath = getLockPath(resource);
  
  if (!fs.existsSync(lockPath)) {
    return false;
  }
  
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  
  if (lock.holder !== agentId) {
    console.error('Lock não pertence a ' + agentId);
    return false;
  }
  
  fs.unlinkSync(lockPath);
  return true;
}
\`\`\`

### Verificar Lock

\`\`\`typescript
function isLocked(resource) {
  const lockPath = getLockPath(resource);
  
  if (!fs.existsSync(lockPath)) {
    return false;
  }
  
  // Verificar se expirou
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const expiresAt = new Date(lock.expires_at);
  
  if (expiresAt < new Date()) {
    // Lock expirado - remover
    fs.unlinkSync(lockPath);
    return false;
  }
  
  return true;
}
\`\`\`

## Timeout e Expiração

- **Timeout padrão:** 30 segundos
- **Auto-expiração:** Previne deadlocks
- **Renovação:** Lock pode ser renovado se necessário

## Recursos Críticos

Lista de recursos que **SEMPRE** requerem lock para escrita:

\`\`\`json
[
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "tailwind.config.js",
  "src/components/oraclusx-ds/**/*",
  "src/App.tsx",
  "supabase/migrations/**/*"
]
\`\`\`

## Boas Práticas

✅ **Sempre** verificar se lock foi adquirido antes de escrever  
✅ **Sempre** liberar lock após uso  
✅ **Nunca** manter lock por mais de 30 segundos  
✅ **Sempre** tratar falha na aquisição de lock  
❌ **Nunca** forçar escrita sem lock  
❌ **Nunca** deletar lock de outro agente  
`;

createFile('protocols/LOCKS.md', LOCKS);

console.log('\n');

// ============================================================================
// 6. CRIAR TEMPLATES
// ============================================================================

console.log('📝 Criando templates...');

// AGENT-TEMPLATE.md
const AGENT_TEMPLATE = `# [EMOJI] AGENTE [XX]: [NOME]

## 📋 Identificação

- **ID:** \`[01-09]\`
- **Nome:** \`[nome-do-agente]\`
- **Emoji:** [EMOJI]
- **Grupo Paralelo:** \`[1, 2, 3, ou sequential]\`
- **Dependências:** \`[lista de IDs de agentes]\`
- **Tempo Estimado:** \`[15-90 min]\`
- **Subagentes:** \`[número]\`

---

## 🎯 Missão

[Descrição clara e objetiva da missão principal do agente]

---

## 📦 Escopo de Auditoria

### Arquivos/Diretórios a Auditar

\`\`\`
[Lista de paths]
src/components/...
src/pages/...
\`\`\`

### Critérios de Validação

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

---

## 🔄 Protocolo de Execução

### Fase 1: Pré-requisitos (5 min)

\`\`\`bash
# Comandos de verificação
npm run type-check
npm run lint
\`\`\`

**Validações:**
- [ ] Ambiente configurado
- [ ] Dependências instaladas
- [ ] Dependências de outros agentes satisfeitas

---

### Fase 2: Inicialização (2 min)

\`\`\`typescript
// Atualizar STATUS.json
const status = {
  agent_id: '[XX]',
  status: 'running',
  start_time: new Date().toISOString(),
  progress: 0,
  current_task: 'Inicializando...'
};
\`\`\`

**Ações:**
1. Carregar configuração
2. Verificar recursos necessários
3. Adquirir locks (se necessário)
4. Iniciar logging

---

### Fase 3: Execução de Subagentes (XX min)

#### Subagente [X.1]: [Nome]

**Responsabilidade:** [Descrição]

**Script de auditoria:**
\`\`\`bash
# Comandos específicos
[comandos]
\`\`\`

**Validações:**
- [ ] Validação A
- [ ] Validação B

**Output esperado:**
\`\`\`json
{
  "subagent": "X.1",
  "status": "completed",
  "issues": 0,
  "warnings": 2
}
\`\`\`

---

[Repetir para cada subagente]

---

### Fase 4: Consolidação (5 min)

**Ações:**
1. Consolidar resultados de todos os subagentes
2. Calcular score final
3. Identificar gaps críticos
4. Gerar lista de recomendações

---

### Fase 5: Geração de Relatório (5 min)

**Template do relatório:**

\`\`\`markdown
# [EMOJI] RELATÓRIO - AGENTE [XX]

## Resumo Executivo
- Total auditado: X items
- Issues críticos: Y
- Warnings: Z
- Score: W/100

## Detalhamento
[Seções detalhadas por subagente]

## Gaps Críticos
- [ ] Gap 1
- [ ] Gap 2

## Recomendações
1. Recomendação 1
2. Recomendação 2
\`\`\`

---

### Fase 6: Finalização (2 min)

\`\`\`typescript
// Atualizar STATUS.json
const status = {
  agent_id: '[XX]',
  status: 'completed',
  end_time: new Date().toISOString(),
  progress: 100,
  current_task: 'Concluído'
};
\`\`\`

**Ações:**
1. Salvar REPORT.md
2. Atualizar STATUS.json
3. Liberar locks
4. Notificar orquestrador
5. Enviar mensagens para agentes dependentes

---

## 🔒 Gerenciamento de Locks

### Recursos de Leitura (Não requer lock)

\`\`\`json
[
  "path/to/read/1",
  "path/to/read/2"
]
\`\`\`

### Recursos de Escrita (Requer lock exclusivo)

\`\`\`json
[
  ".cursor/agents/[XX]-[name]/STATUS.json",
  ".cursor/agents/[XX]-[name]/REPORT.md"
]
\`\`\`

---

## 📡 Comunicação

### Dependências (Aguardar)

- **Agente [YY]:** Aguardar conclusão antes de iniciar
- **Agente [ZZ]:** Consumir dados de [arquivo/mensagem]

### Notificações (Informar)

- **Agente [WW]:** Enviar mensagem quando [condição]
- **Orquestrador:** Notificar conclusão

---

## 🚫 Anti-Padrões Específicos

❌ Anti-padrão 1: [Descrição]  
❌ Anti-padrão 2: [Descrição]  
❌ Anti-padrão 3: [Descrição]  

---

## ✅ Checklist Final

- [ ] Todas as tarefas concluídas
- [ ] Todos os subagentes executados
- [ ] STATUS.json atualizado
- [ ] REPORT.md gerado
- [ ] Locks liberados
- [ ] Logs salvos
- [ ] Orquestrador notificado
- [ ] Mensagens enviadas

---

## 📊 Métricas de Sucesso

- **Score mínimo:** 80/100
- **Issues críticos:** 0
- **Warnings:** < 10
- **Tempo execução:** < [tempo estimado]

---

## 🐛 Troubleshooting

### Problema 1
**Sintoma:** [Descrição do problema]  
**Causa:** [Causa raiz]  
**Solução:** [Como resolver]

### Problema 2
[Repetir estrutura]

---

**Data de Criação:** ${new Date().toISOString()}  
**Versão:** 1.0.0  
**Status:** Template Base
`;

createFile('templates/AGENT-TEMPLATE.md', AGENT_TEMPLATE);

// SUBAGENT-TEMPLATE.md
const SUBAGENT_TEMPLATE = `# Subagente [X.Y]: [Nome]

## 📋 Identificação

- **Agente Pai:** [XX]
- **ID:** [X.Y]
- **Nome:** [nome-do-subagente]
- **Tempo Estimado:** [5-15 min]

---

## 🎯 Responsabilidade

[Descrição específica da responsabilidade deste subagente]

---

## 📦 Escopo

### Arquivos a Auditar

\`\`\`
[Lista específica de arquivos/diretórios]
\`\`\`

### Critérios de Validação

- [ ] Critério específico 1
- [ ] Critério específico 2
- [ ] Critério específico 3

---

## 🔄 Protocolo de Execução

### 1. Preparação

\`\`\`bash
# Comandos de setup
[comandos]
\`\`\`

### 2. Auditoria

\`\`\`typescript
// Script de auditoria
[código ou comandos]
\`\`\`

### 3. Validação

**Para cada item auditado:**
- Verificar [critério 1]
- Validar [critério 2]
- Confirmar [critério 3]

### 4. Documentação

**Registrar:**
- ✅ Items conformes
- ⚠️ Warnings
- ❌ Issues críticos

---

## 📊 Output Esperado

\`\`\`json
{
  "subagent_id": "X.Y",
  "status": "completed",
  "items_audited": 0,
  "items_passed": 0,
  "items_failed": 0,
  "warnings": [],
  "critical_issues": [],
  "score": 0
}
\`\`\`

---

## ✅ Checklist

- [ ] Todos os arquivos auditados
- [ ] Todos os critérios validados
- [ ] Issues documentados
- [ ] Score calculado
- [ ] Output gerado

---

**Versão:** 1.0.0
`;

createFile('templates/SUBAGENT-TEMPLATE.md', SUBAGENT_TEMPLATE);

// STATUS-TEMPLATE.json
const STATUS_TEMPLATE_JSON = {
  agent_id: 'XX',
  agent_name: 'nome',
  emoji: '❓',
  status: 'idle',
  start_time: null,
  end_time: null,
  duration_seconds: null,
  progress: 0,
  current_task: null,
  locked_resources: [],
  errors: [],
  warnings: [],
  metadata: {
    total_tasks: 0,
    completed_tasks: 0,
    total_subagents: 0,
    completed_subagents: 0,
    critical_issues: 0,
    important_issues: 0,
    suggestions: 0
  }
};

createFile('templates/STATUS-TEMPLATE.json', JSON.stringify(STATUS_TEMPLATE_JSON, null, 2));

// REPORT-TEMPLATE.md
const REPORT_TEMPLATE = `# [EMOJI] RELATÓRIO - AGENTE [XX]: [NOME]

**Data:** [timestamp]  
**Duração:** [tempo em minutos]  
**Status:** [completed|failed]  

---

## 📊 Resumo Executivo

- **Total auditado:** X items
- **Issues críticos:** Y
- **Warnings:** Z
- **Score final:** W/100

### Status por Subagente

| ID | Subagente | Status | Score | Issues |
|----|-----------|--------|-------|--------|
| X.1 | [Nome] | ✅ | 95/100 | 0 |
| X.2 | [Nome] | ⚠️ | 85/100 | 2 |
| X.3 | [Nome] | ✅ | 100/100 | 0 |

---

## 📋 Detalhamento por Subagente

### Subagente X.1: [Nome]

**Escopo:** [Descrição]

**Resultados:**
- ✅ Conforme: A items
- ⚠️ Warnings: B items
- ❌ Críticos: C items

**Detalhes:**
[Descrição detalhada dos achados]

---

[Repetir para cada subagente]

---

## 🔴 Gaps Críticos

### Gap 1: [Título]
**Severidade:** 🔴 Crítica  
**Impacto:** [Descrição do impacto]  
**Localização:** \`path/to/file.ts\`  
**Descrição:** [Descrição detalhada]  
**Recomendação:** [Como corrigir]

### Gap 2: [Título]
[Repetir estrutura]

---

## 🟡 Issues Importantes

### Issue 1: [Título]
**Severidade:** 🟡 Importante  
**Impacto:** [Descrição]  
**Recomendação:** [Como resolver]

---

## 🟢 Melhorias Sugeridas

1. **[Título da melhoria]**
   - Descrição: [...]
   - Benefício: [...]
   - Esforço: [Baixo|Médio|Alto]

2. **[Título da melhoria]**
   [Repetir estrutura]

---

## 🎯 Recomendações Prioritárias

### Imediatas (Antes do Deploy)
1. [ ] Correção crítica 1
2. [ ] Correção crítica 2

### Curto Prazo (Próxima Sprint)
1. [ ] Melhoria importante 1
2. [ ] Melhoria importante 2

### Médio Prazo (Próximo Mês)
1. [ ] Otimização 1
2. [ ] Otimização 2

---

## 📈 Métricas Detalhadas

\`\`\`yaml
Total de arquivos auditados: X
Total de linhas analisadas: Y
Tempo de execução: Z minutos

Distribuição de Issues:
  - Críticos: A (X%)
  - Importantes: B (Y%)
  - Warnings: C (Z%)
  
Score por categoria:
  - Funcionalidade: W/100
  - Qualidade código: X/100
  - Performance: Y/100
  - Segurança: Z/100
\`\`\`

---

## 🔗 Referências

- [Arquivo 1](path/to/file1)
- [Arquivo 2](path/to/file2)
- [Documentação relevante](link)

---

## 📝 Observações Adicionais

[Qualquer observação importante que não se encaixe nas seções acima]

---

**Gerado por:** Agente [XX] - [Nome]  
**Versão do Sistema:** 5.0.0  
**Versão do Agente:** 1.0.0
`;

createFile('templates/REPORT-TEMPLATE.md', REPORT_TEMPLATE);

console.log('\n');

// ============================================================================
// 7. CRIAR SCRIPTS UTILITÁRIOS
// ============================================================================

console.log('🛠️ Criando scripts utilitários... (pulado nesta versão)');

console.log('\n');

// ============================================================================
// 8. CRIAR PLACEHOLDER PARA AGENTES
// ============================================================================

console.log('📝 Criando placeholders para agentes...');

AGENTS.forEach(agent => {
  let agentPlaceholder = `# ${agent.emoji} AGENTE ${agent.id}: ${agent.name.toUpperCase()}

**Status:** Aguardando configuração completa

## Próximos Passos

1. Ler template em \`.cursor/templates/AGENT-TEMPLATE.md\`
2. Preencher seções:
   - Missão
   - Escopo de auditoria
   - Protocolo de execução
   - Subagentes (${agent.subagents} total)
3. Criar arquivos de subagentes em \`subagents/\`
4. Definir critérios de validação
5. Preparar scripts de auditoria

## Estrutura de Subagentes

`;

  for (let i = 1; i <= agent.subagents; i++) {
    agentPlaceholder += `- [ ] ${agent.id}.${i} - [Nome do subagente]\n`;
  }

  createFile(`agents/${agent.id}-${agent.name}/AGENT.md`, agentPlaceholder);

  // Criar REPORT.md placeholder
  const reportPlaceholder = `# ${agent.emoji} RELATÓRIO - AGENTE ${agent.id}

*Relatório será gerado após execução do agente*

---

**Data de Geração:** Pendente  
**Status:** Aguardando execução  
`;

  createFile(`agents/${agent.id}-${agent.name}/REPORT.md`, reportPlaceholder);
});

console.log('\n');

// ============================================================================
// 9. CRIAR/ATUALIZAR PACKAGE.JSON SCRIPTS
// ============================================================================

console.log('📦 Atualizando package.json...');

const packageJsonPath = 'package.json';
let packageJson = {};

if (fs.existsSync(packageJsonPath)) {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} else {
  packageJson = {
    name: 'icarus-v5',
    version: '5.0.0',
    scripts: {}
  };
}

// Adicionar scripts (sem sobrescrever existentes)
packageJson.scripts = {
  ...packageJson.scripts,
  'setup:agents': 'node setup-icarus-agents.cjs',
  'audit:full': packageJson.scripts?.['audit:full'] || 'node .cursor/scripts/orchestrator.js',
  'audit:agent': packageJson.scripts?.['audit:agent'] || 'node .cursor/scripts/run-agent.js',
  'report:generate': packageJson.scripts?.['report:generate'] || 'node .cursor/scripts/generate-report.js',
  'logs:agent': packageJson.scripts?.['logs:agent'] || 'node .cursor/scripts/view-logs.js',
  'locks:clean': packageJson.scripts?.['locks:clean'] || 'node .cursor/scripts/clean-locks.js',
  'status:all': packageJson.scripts?.['status:all'] || 'node .cursor/scripts/view-status.js'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('  ✅ Scripts adicionados ao package.json\n');

// ============================================================================
// 10. CRIAR .gitignore LOCAL DA PASTA .cursor
// ============================================================================

console.log('🚫 Criando .gitignore para .cursor/...');

const GITIGNORE = `# Logs
logs/*.log

# Locks temporários
locks/*.lock

# Mensagens temporárias
messages/*.json

# Status dinâmico (descomentar se quiser versionar)
# agents/*/STATUS.json

# Relatórios gerados (descomentar se quiser versionar)
# reports/*.md

# Node modules (se houver scripts com deps)
node_modules/
`;

createFile('.gitignore', GITIGNORE);

console.log('\n');

// ============================================================================
// RESUMO FINAL
// ============================================================================

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ ESTRUTURA CRIADA COM SUCESSO!');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📁 Estrutura criada:');
console.log('   .cursor/');
console.log('   ├── .cursorrules (Regras globais)');
console.log('   ├── config/ (Planos de execução)');
console.log('   ├── agents/ (9 agentes + orquestrador)');
console.log('   ├── protocols/ (3 protocolos)');
console.log('   ├── templates/ (4 templates)');
console.log('   ├── scripts/ (+ utils)');
console.log('   ├── locks/ (Sistema de locks)');
console.log('   ├── messages/ (Comunicação)');
console.log('   ├── logs/ (Logs de execução)');
console.log('   └── reports/ (Relatórios gerados)\n');

console.log('🚀 Próximos passos:\n');
console.log('   1. Revisar .cursor/.cursorrules');
console.log('   2. Configurar cada agente:');
AGENTS.forEach(agent => {
  console.log(`      - ${agent.emoji} Agente ${agent.id}: .cursor/agents/${agent.id}-${agent.name}/AGENT.md`);
});
console.log('\n   3. Executar preparação:');
console.log('      npm run type-check');
console.log('      npm run lint\n');
console.log('   4. Executar auditoria:');
console.log('      npm run audit:full\n');
console.log('   5. Gerar relatório:');
console.log('      npm run report:generate\n');

console.log('📚 Documentação:');
console.log('   - Orquestrador: .cursor/agents/00-ORCHESTRATOR.md');
console.log('   - Protocolos: .cursor/protocols/');
console.log('   - Templates: .cursor/templates/\n');

console.log('═══════════════════════════════════════════════════════════');
console.log('🎯 Sistema de agentes pronto para configuração!');
console.log('═══════════════════════════════════════════════════════════\n');
