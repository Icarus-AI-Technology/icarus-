# 📊 Sistema Completo de Observabilidade & Inteligência Comportamental

## 🎯 Visão Geral

Sistema abrangente de observabilidade, análise comportamental e inteligência artificial integrado ao ICARUS v5.0, permitindo rastreamento completo de atividades, detecção de anomalias, alertas inteligentes e suporte para transferências de responsabilidades.

---

## 🏗️ Arquitetura

### Backend (Supabase PostgreSQL)

#### Tabelas Criadas (Migração 0013)

1. **`user_activities`** - Log completo de todas atividades
   - Rastreamento detalhado de ações, módulos, tempo de execução
   - Captura de erros e contexto de execução
   - Informações de dispositivo e localização

2. **`user_behavior_profile`** - Perfil comportamental agregado
   - Módulos mais usados
   - Ações frequentes
   - Taxa de erro geral
   - Tempo médio por módulo
   - Funcionalidades dominadas vs. com dificuldade

3. **`user_handovers`** - Transferências de responsabilidades
   - Registro de férias, licenças, demissões
   - Responsabilidades transferidas
   - Status da transferência

4. **`system_errors`** - Erros centralizados
   - Tipo e severidade do erro
   - Stack trace e contexto
   - Impacto e solução sugerida
   - Status de resolução

5. **`system_alerts`** - Alertas inteligentes
   - Predições de erros
   - Anomalias comportamentais
   - Prazos vencendo
   - Tentativas de acesso não autorizado
   - Autocorreções

6. **`user_training`** - Sistema de treinamento
   - Progresso por módulo
   - Pontuações e tentativas
   - Certificações

7. **`user_sessions`** - Histórico de sessões
   - Duração, páginas visitadas
   - Dispositivo e navegador
   - Localização

#### Funções SQL

1. **`atualizar_perfil_comportamental()`**
   - Trigger automático que atualiza o perfil a cada atividade
   - Calcula taxa de erro em tempo real

2. **`criar_alerta_erro_critico()`**
   - Trigger automático para erros críticos/altos
   - Cria alertas para admin/CEO/devops

3. **`buscar_atividades_usuario(p_usuario_email, p_dias_historico)`**
   - Retorna resumo de atividades por módulo
   - Inclui total de ações, tempo médio, taxa de sucesso

4. **`comparar_usuarios_handover(p_usuario_sainte_email, p_usuario_substituto_email)`**
   - Compara experiência entre usuários
   - Identifica módulos que requerem treinamento

5. **`detectar_comportamento_anomalo()`**
   - Detecta taxa de erro alta (>30%)
   - Detecta inatividade prolongada (>7 dias)

---

## 🎨 Frontend (React + TypeScript)

### Hooks Personalizados

#### 1. `useActivityTracker`

**Localização:** `src/hooks/useActivityTracker.ts`

**Funções:**
- `trackActivity(activity)` - Rastreamento genérico
- `trackPageView(modulo, sub_modulo)` - Navegação
- `trackCRUD(metodo, modulo, dados, sucesso, erro)` - Operações CRUD
- `trackSearch(modulo, query, resultados)` - Buscas
- `trackExport(modulo, formato, total_registros)` - Exportações
- `trackAIInteraction(modulo, pergunta, resposta, feedback)` - IA

**Uso:**
```typescript
import { useActivityTracker } from '@/hooks/useActivityTracker';

function MeuComponente() {
  const { trackCRUD, trackSearch } = useActivityTracker();

  const handleSave = async (data) => {
    try {
      await saveData(data);
      trackCRUD('CREATE', 'pacientes', data, true);
    } catch (error) {
      trackCRUD('CREATE', 'pacientes', data, false, error.message);
    }
  };

  return ...;
}
```

#### 2. `useErrorHandler`

**Localização:** `src/hooks/useErrorHandler.ts`

**Funções:**
- `logError(errorData)` - Registrar erro manualmente
- `withErrorHandler(fn, modulo, severidade)` - Wrapper automático

**Uso:**
```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MeuComponente() {
  const { withErrorHandler, logError } = useErrorHandler();

  const fetchData = withErrorHandler(async () => {
    const data = await api.get('/data');
    return data;
  }, 'cadastros', 'media');

  // Ou registro manual:
  try {
    await riskyOperation();
  } catch (error) {
    logError({
      tipo: 'erro_integracao',
      severidade: 'alta',
      modulo: 'cadastros',
      mensagem: error.message,
      stack_trace: error.stack,
      contexto: { operation: 'sync' }
    });
  }
}
```

### Componentes

#### 1. `ObservabilityDashboard`

**Localização:** `src/components/observability/ObservabilityDashboard.tsx`

**Funcionalidades:**
- ✅ Visualização de perfis comportamentais
- ✅ Lista de alertas pendentes
- ✅ Detecção de anomalias
- ✅ Cards com estatísticas gerais
- ✅ Atualização automática a cada 30s
- ✅ Ações para resolver alertas

**Rota sugerida:** `/observability/dashboard`

#### 2. `NotificationSystem`

**Localização:** `src/components/notifications/NotificationSystem.tsx`

**Funcionalidades:**
- ✅ Notificações em tempo real (Supabase Realtime)
- ✅ Notificações do navegador (Web Notification API)
- ✅ Badge com contador de não lidas
- ✅ Marcar como lida
- ✅ Resolver notificações
- ✅ Filtro por papel/destinatário

**Integração:**
```typescript
import { NotificationSystem } from '@/components/notifications/NotificationSystem';

// No layout/topbar:
<NotificationSystem />
```

#### 3. `TrainingReports`

**Localização:** `src/components/training/TrainingReports.tsx`

**Funcionalidades:**
- ✅ Progresso geral e por módulo
- ✅ Pontuações e tempo gasto
- ✅ Atividade recente
- ✅ Gaps de conhecimento

**Rota sugerida:** `/training/reports`

#### 4. `ChatbotWithResearch` (Atualizado)

**Localização:** `src/components/oraclusx-ds/ChatbotWithResearch.tsx`

**Novas Funcionalidades:**
- ✅ Consultar atividades de usuário: "O que João fez no sistema?"
- ✅ Comparar usuários para handover: "Comparar João com Pedro"
- ✅ Detecção inteligente de intenção
- ✅ Integração com base de conhecimento local

**Exemplos de Uso:**
- "O que o João fez?"
- "Atividades do Pedro"
- "Comparar João com Maria"
- "Comparação entre Ana e Carlos"

---

## 🚀 Fluxo de Trabalho

### 1. Rastreamento Automático

```
Usuário acessa página
    ↓
NavigationTracker (App.tsx)
    ↓
trackPageView()
    ↓
INSERT em user_activities
    ↓
TRIGGER atualizar_perfil_comportamental()
    ↓
UPDATE em user_behavior_profile
```

### 2. Detecção de Erros

```
Erro ocorre na aplicação
    ↓
useErrorHandler captura
    ↓
logError()
    ↓
INSERT em system_errors
    ↓
TRIGGER criar_alerta_erro_critico() (se severidade alta/crítica)
    ↓
INSERT em system_alerts
    ↓
Supabase Realtime notifica
    ↓
NotificationSystem exibe notificação
```

### 3. Análise Comportamental

```
Dashboard carrega
    ↓
buscar_atividades_usuario()
    ↓
detectar_comportamento_anomalo()
    ↓
Exibe métricas e alertas
    ↓
Atualização automática a cada 30s
```

### 4. Transferência de Responsabilidades

```
Usuário pergunta "Comparar João com Pedro"
    ↓
detectUserQuery() identifica handover
    ↓
comparar_usuarios_handover()
    ↓
Retorna análise com módulos que requerem treinamento
    ↓
Chatbot exibe recomendações
```

---

## 📈 Métricas Disponíveis

### Por Usuário
- Total de atividades
- Total de erros
- Taxa de erro geral
- Última atividade
- Módulos mais usados
- Tempo médio por módulo
- Funcionalidades dominadas
- Funcionalidades com dificuldade

### Por Sistema
- Usuários ativos
- Alertas pendentes
- Anomalias detectadas
- Taxa média de sucesso
- Erros por severidade
- Tempo de resposta médio

### Por Módulo
- Total de acessos
- Ações realizadas
- Taxa de sucesso
- Tempo médio de execução
- Usuários ativos

---

## 🔔 Tipos de Alertas

### Automáticos
- **Erro Recorrente:** Erros de severidade alta/crítica
- **Comportamento Anômalo:** Taxa de erro >30%
- **Inatividade Prolongada:** Sem atividade há >7 dias
- **Predição de Erro:** Baseado em padrões históricos

### Manuais (via Admin)
- Prazo vencendo
- Tentativa de acesso não autorizado
- Performance baixa
- Autocorreção realizada

---

## 🛡️ Conformidade e Segurança

### LGPD
- ✅ Dados minimizados (apenas essenciais)
- ✅ Anonimização de IPs após 30 dias
- ✅ Soft delete para auditoria
- ✅ Consentimento explícito para tracking

### ANVISA
- ✅ Rastreabilidade completa de ações
- ✅ Logs imutáveis com timestamp
- ✅ Auditoria de mudanças críticas

### ISO 27001
- ✅ Monitoramento de acessos
- ✅ Detecção de anomalias
- ✅ Logs centralizados

---

## 🧪 Testes e Validação

### Testar Rastreamento de Atividade

```sql
-- Verificar atividades registradas
SELECT * FROM user_activities 
ORDER BY criado_em DESC 
LIMIT 10;

-- Ver perfil comportamental
SELECT * FROM user_behavior_profile 
WHERE usuario_id = 'SEU_USER_ID';
```

### Testar Detecção de Anomalias

```sql
-- Executar detecção
SELECT * FROM detectar_comportamento_anomalo();

-- Simular erro crítico
INSERT INTO system_errors (
  usuario_id, tipo, severidade, modulo, mensagem
) VALUES (
  'SEU_USER_ID', 
  'erro_aplicacao', 
  'critica', 
  'test', 
  'Teste de erro crítico'
);

-- Verificar alerta criado
SELECT * FROM system_alerts 
WHERE tipo = 'erro_recorrente' 
ORDER BY criado_em DESC 
LIMIT 1;
```

### Testar Comparação de Usuários

```sql
-- Comparar dois usuários
SELECT * FROM comparar_usuarios_handover(
  'joao@empresa.com',
  'pedro@empresa.com'
);
```

---

## 📊 Dashboards e Visualizações

### 1. Dashboard Principal
- Cards com métricas gerais
- Gráfico de atividades ao longo do tempo
- Top usuários por atividade
- Distribuição de erros por módulo

### 2. Dashboard de Alertas
- Lista de alertas pendentes
- Filtro por severidade
- Ações rápidas (resolver, marcar como lida)

### 3. Dashboard de Treinamento
- Progresso geral
- Progresso por módulo
- Gaps de conhecimento
- Atividade recente

---

## 🔧 Configuração e Deploy

### 1. Aplicar Migrações

```sql
-- Aplicar migração 0013
-- Via Supabase Dashboard SQL Editor
-- Copiar e executar: supabase/migrations/0013_observabilidade_comportamental.sql
```

### 2. Configurar Realtime

```typescript
// Já configurado em NotificationSystem
// Certifique-se de que Realtime está habilitado no Supabase
```

### 3. Habilitar Web Notifications

```typescript
// Solicitar permissão (já implementado em NotificationSystem)
if ('Notification' in window) {
  Notification.requestPermission();
}
```

### 4. Adicionar Rotas

```typescript
// Em App.tsx ou Router.tsx
import { ObservabilityDashboard } from '@/components/observability/ObservabilityDashboard';
import { TrainingReports } from '@/components/training/TrainingReports';

<Route path="/observability/dashboard" element={<ObservabilityDashboard />} />
<Route path="/training/reports" element={<TrainingReports />} />
```

### 5. Integrar NotificationSystem no Layout

```typescript
// Em IcarusTopbar.tsx ou similar
import { NotificationSystem } from '@/components/notifications/NotificationSystem';

<NotificationSystem />
```

---

## 🎓 Casos de Uso

### 1. Onboarding de Novo Usuário
- Sistema rastreia todas atividades
- Tutor IA sugere treinamentos baseado em dificuldades
- Dashboard mostra progresso

### 2. Substituição por Férias
- Admin: "Comparar João com Pedro"
- Sistema identifica gaps de conhecimento
- Gera plano de treinamento automático
- Registra handover com data de início/fim

### 3. Detecção de Problema Recorrente
- Usuário tem taxa de erro alta em módulo específico
- Sistema detecta anomalia
- Cria alerta para admin
- Admin oferece treinamento direcionado

### 4. Auditoria de Atividades
- Gerente: "O que Maria fez ontem?"
- Chatbot lista todas atividades
- Detalhamento por módulo e tempo gasto

### 5. Predição de Problemas
- Sistema analisa padrões históricos
- Detecta usuário com comportamento anômalo
- Alerta preventivo para admin
- Intervenção proativa

---

## 📚 Referências Técnicas

### Stack
- **Backend:** Supabase PostgreSQL + Realtime
- **Frontend:** React + TypeScript + Tailwind CSS
- **IA:** Ollama (local) + RAG (Postgres)
- **Analytics:** Vercel Analytics
- **Notificações:** Web Notification API

### Dependências
```json
{
  "@supabase/supabase-js": "^2.x",
  "lucide-react": "^0.x",
  "react-router-dom": "^6.x"
}
```

### Extensões PostgreSQL Necessárias
- `pgcrypto` - Para UUID generation
- `vector` - Para embeddings (RAG)
- `pg_trgm` - Para busca por similaridade
- `unaccent` - Para normalização de texto

---

## ✅ Checklist de Implementação

- [x] Criar migração 0013 (backend)
- [x] Criar hook useActivityTracker
- [x] Criar hook useErrorHandler
- [x] Atualizar ChatbotWithResearch
- [x] Criar ObservabilityDashboard
- [x] Criar NotificationSystem
- [x] Criar TrainingReports
- [x] Integrar NavigationTracker no App
- [x] Documentar sistema completo

### Próximos Passos (Opcional)
- [ ] Adicionar gráficos com Chart.js ou Recharts
- [ ] Implementar exportação de relatórios (PDF, Excel)
- [ ] Dashboard executivo para CEO
- [ ] Predição avançada com Machine Learning
- [ ] Integração com calendário para handovers automáticos
- [ ] Sistema de gamificação para treinamentos

---

## 🆘 Troubleshooting

### Notificações não aparecem
```typescript
// Verificar permissão
console.log(Notification.permission);
// Se 'denied', usuário precisa resetar permissão no navegador
```

### Atividades não sendo registradas
```sql
-- Verificar se trigger está ativo
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_atualizar_perfil';

-- Verificar se há erros nas atividades
SELECT * FROM user_activities 
WHERE sucesso = false 
ORDER BY criado_em DESC;
```

### Alertas não sendo criados
```sql
-- Verificar trigger
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_alerta_erro';

-- Verificar erros recentes
SELECT * FROM system_errors 
WHERE severidade IN ('alta', 'critica') 
ORDER BY criado_em DESC;
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique os logs do Supabase
3. Teste as funções SQL manualmente
4. Consulte o chatbot: "Como usar o sistema de observabilidade?"

---

**Versão:** 1.0  
**Data:** 2025-10-21  
**Autor:** AGENTE_EQUIPE_ECONOMIA_AI_TUTORES

