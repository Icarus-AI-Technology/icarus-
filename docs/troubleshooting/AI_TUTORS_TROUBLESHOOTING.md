# Troubleshooting - AI Tutors & Agents

**Data:** 28 de outubro de 2025  
**Versão:** 1.0  
**Público-alvo:** Equipe técnica e suporte

---

## 📋 Índice
- [Problemas Comuns](#problemas-comuns)
- [Performance](#performance)
- [Integração](#integração)
- [Dados e Precisão](#dados-e-precisão)
- [Logs e Debugging](#logs-e-debugging)
- [Escalação](#escalação)

---

## Problemas Comuns

### 1. **Tutores não aparecem no módulo**

**Sintomas:**
- Painel AI Tutor não carrega
- Área em branco onde deveria estar o tutor
- Erro no console: `AIOrchestrator is not defined`

**Causas Possíveis:**
- Módulo não integrado corretamente
- Erro de importação
- Permissão de acesso insuficiente

**Solução:**
```bash
# 1. Verificar se o módulo tem o import correto
grep -r "import.*AITutor" src/components/modules/

# 2. Verificar console do navegador (F12)
# Procurar por erros relacionados a AITutor

# 3. Verificar permissões do usuário
SELECT role, permissions 
FROM user_roles 
WHERE user_id = '<user_id>';

# 4. Limpar cache do navegador
Ctrl+Shift+Delete → Limpar tudo

# 5. Recarregar hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

**Prevenção:**
- Use o script `scripts/add-tutor-to-module.sh` para integração
- Sempre teste após integração
- Valide permissões RBAC

---

### 2. **Sugestões não são relevantes**

**Sintomas:**
- Sugestões genéricas demais
- Não consideram contexto atual
- Sempre as mesmas sugestões

**Causas Possíveis:**
- Falta de dados contextuais
- Categoria do módulo mal identificada
- Cache desatualizado

**Solução:**
```typescript
// 1. Verificar contexto sendo enviado
console.log('Context:', {
  moduleName: 'NomeDoModulo',
  currentView: activeCategory,
  kpis: { /* seus KPIs */ }
});

// 2. Forçar recarga de sugestões
const suggestions = await AIOrchestrator.getContextualSuggestions(
  'nome-modulo',
  context,
  { forceRefresh: true } // Ignora cache
);

// 3. Verificar categoria identificada
const category = AIOrchestrator.identifyModuleCategory('nome-modulo');
console.log('Category:', category);

// 4. Limpar cache do AIOrchestrator
localStorage.removeItem('ai_orchestrator_cache');
```

**Prevenção:**
- Sempre passe contexto rico (KPIs, filtros, estado)
- Atualize dados em tempo real
- Forneça feedback (👍/👎) consistente

---

### 3. **Ações não executam corretamente**

**Sintomas:**
- Clicar em "Executar" não faz nada
- Erro "Action failed" no toast
- Ação executa mas não reflete na UI

**Causas Possíveis:**
- Handler de ação não implementado
- Erro de validação
- Problema de permissão

**Solução:**
```typescript
// 1. Verificar handler implementado
<AITutor 
  module="seu-modulo"
  context={context}
  suggestions={suggestions}
  onAction={(action, suggestion) => {
    console.log('Action triggered:', action, suggestion);
    
    // Implementar lógica específica
    switch(action) {
      case 'view_details':
        handleViewDetails(suggestion.metadata);
        break;
      case 'execute_validation':
        handleValidation(suggestion.metadata);
        break;
      default:
        console.warn('Action not handled:', action);
    }
  }}
/>

// 2. Verificar logs da ação
SELECT * FROM ai_tutor_insights
WHERE action_taken = true
ORDER BY created_at DESC
LIMIT 10;

// 3. Verificar permissões
if (!hasPermission('execute_ai_action')) {
  toast.error('Você não tem permissão para executar esta ação');
  return;
}
```

**Prevenção:**
- Sempre implemente handler `onAction`
- Adicione validações antes de executar
- Forneça feedback visual (toast, loading)

---

### 4. **Performance lenta**

**Sintomas:**
- Tutores demoram >3s para carregar
- Aplicação trava ao abrir módulo
- Timeout em requisições

**Causas Possíveis:**
- Muitas queries simultâneas
- Falta de cache
- Banco de dados sobrecarregado

**Solução:**
```typescript
// 1. Implementar cache local
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cachedSuggestions = localStorage.getItem(`ai_cache_${module}`);
if (cachedSuggestions) {
  const { data, timestamp } = JSON.parse(cachedSuggestions);
  if (Date.now() - timestamp < CACHE_TTL) {
    return data;
  }
}

// 2. Usar debounce para evitar múltiplas chamadas
const debouncedLoadSuggestions = debounce(loadAISuggestions, 500);

// 3. Carregar assíncrono
useEffect(() => {
  let mounted = true;
  
  const loadAsync = async () => {
    const suggestions = await AIOrchestrator.getContextualSuggestions(...);
    if (mounted) setAiSuggestions(suggestions);
  };
  
  loadAsync();
  return () => { mounted = false; };
}, [dependencies]);

// 4. Verificar índices no banco
CREATE INDEX IF NOT EXISTS idx_ai_insights_module 
ON ai_tutor_insights(module_name, created_at DESC);
```

**Prevenção:**
- Sempre use cache
- Implemente loading states
- Monitore performance no AI System Dashboard

---

### 5. **Dashboard AI não carrega métricas**

**Sintomas:**
- KPIs mostram 0 ou "N/A"
- Gráficos vazios
- Erro "Failed to fetch metrics"

**Causas Possíveis:**
- Tabelas vazias (sem dados históricos)
- Permissão de leitura negada
- Erro em query SQL

**Solução:**
```sql
-- 1. Verificar se há dados
SELECT COUNT(*) FROM ai_tutor_insights;
SELECT COUNT(*) FROM ai_tutor_feedback;
SELECT COUNT(*) FROM ai_tutor_performance;

-- 2. Verificar permissões RLS
SELECT * FROM pg_policies 
WHERE tablename IN (
  'ai_tutor_insights', 
  'ai_tutor_feedback', 
  'ai_tutor_performance'
);

-- 3. Testar queries manualmente
SELECT 
  module_name,
  COUNT(*) as total_suggestions,
  SUM(CASE WHEN action_taken THEN 1 ELSE 0 END) as accepted
FROM ai_tutor_insights
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY module_name
ORDER BY total_suggestions DESC
LIMIT 10;

-- 4. Popular dados de teste (apenas dev/staging)
INSERT INTO ai_tutor_insights (module_name, suggestion_type, content, priority)
VALUES 
  ('cirurgias', 'warning', 'Teste', 'high'),
  ('estoque', 'insight', 'Teste', 'medium');
```

**Prevenção:**
- Monitore preenchimento de tabelas
- Configure alertas para falhas
- Use seed data em ambientes de teste

---

## Performance

### Otimização de Queries

```sql
-- 1. Criar índices críticos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insights_composite
ON ai_tutor_insights(module_name, created_at DESC, priority);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_performance_date
ON ai_tutor_performance(date DESC);

-- 2. Vacuum regular
VACUUM ANALYZE ai_tutor_insights;
VACUUM ANALYZE ai_tutor_feedback;
VACUUM ANALYZE ai_tutor_performance;

-- 3. Identificar queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%ai_tutor%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Monitoramento

```typescript
// Adicionar telemetria
const startTime = performance.now();
const suggestions = await AIOrchestrator.getContextualSuggestions(...);
const endTime = performance.now();

if (endTime - startTime > 2000) {
  console.warn(`AIOrchestrator slow response: ${endTime - startTime}ms`);
  // Enviar para monitoring
  analytics.track('ai_orchestrator_slow', {
    duration: endTime - startTime,
    module: moduleName
  });
}
```

---

## Integração

### Verificar Integração de Edge Functions

```bash
# 1. Listar Edge Functions deployadas
supabase functions list

# 2. Testar Edge Function manualmente
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/agent-clinical \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"action": "analyze_surgeries"}'

# 3. Verificar logs
supabase functions logs agent-clinical --tail

# 4. Re-deploy se necessário
supabase functions deploy agent-clinical
```

### Verificar Integração CEO Intelligence

```sql
-- 1. Verificar feed operacional
SELECT * FROM ceo_operational_feed
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar alertas consolidados
SELECT * FROM ceo_consolidated_alerts
WHERE status = 'active'
ORDER BY priority DESC, created_at DESC;

-- 3. Verificar notificações
SELECT * FROM ceo_notifications
WHERE read = false
ORDER BY created_at DESC;

-- 4. Se vazio, verificar CEOIntelligenceBridge
-- Executar manualmente o bridge
```

---

## Dados e Precisão

### Validar Qualidade dos Dados

```sql
-- 1. Verificar dados faltantes
SELECT 
  module_name,
  COUNT(*) as total,
  SUM(CASE WHEN metadata IS NULL THEN 1 ELSE 0 END) as missing_metadata,
  SUM(CASE WHEN priority IS NULL THEN 1 ELSE 0 END) as missing_priority
FROM ai_tutor_insights
GROUP BY module_name;

-- 2. Verificar feedback rate
SELECT 
  module_name,
  COUNT(*) as total_suggestions,
  COUNT(feedback_type) as with_feedback,
  ROUND(100.0 * COUNT(feedback_type) / COUNT(*), 2) as feedback_rate
FROM ai_tutor_insights i
LEFT JOIN ai_tutor_feedback f ON f.insight_id = i.id
GROUP BY module_name
ORDER BY feedback_rate DESC;

-- 3. Verificar taxa de aceitação
SELECT 
  module_name,
  COUNT(*) as total,
  SUM(CASE WHEN action_taken THEN 1 ELSE 0 END) as accepted,
  ROUND(100.0 * SUM(CASE WHEN action_taken THEN 1 ELSE 0 END) / COUNT(*), 2) as acceptance_rate
FROM ai_tutor_insights
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY module_name
ORDER BY acceptance_rate DESC;
```

### Calibrar Modelos

```typescript
// Ajustar thresholds baseado em feedback
const CONFIDENCE_THRESHOLDS = {
  high: 85,    // Sugestões com >85% confidence
  medium: 70,  // Entre 70-85%
  low: 50      // <70% (não mostrar?)
};

// Filtrar sugestões por confidence
const filteredSuggestions = suggestions.filter(
  s => s.confidence >= CONFIDENCE_THRESHOLDS.medium
);
```

---

## Logs e Debugging

### Habilitar Logs Detalhados

```typescript
// Em desenvolvimento, adicionar no console
if (import.meta.env.DEV) {
  window.DEBUG_AI = true;
  
  // Override console para capturar logs AI
  const originalLog = console.log;
  console.log = (...args) => {
    if (window.DEBUG_AI && args[0]?.includes?.('AI')) {
      originalLog('[AI DEBUG]', new Date().toISOString(), ...args);
    } else {
      originalLog(...args);
    }
  };
}
```

### Verificar Logs Supabase

```bash
# Logs das Edge Functions
supabase functions logs agent-clinical --tail
supabase functions logs agent-operations --tail
supabase functions logs agent-procurement --tail
supabase functions logs agent-logistics --tail

# Logs do Postgres
supabase db logs --tail

# Logs de Auth (se houver problemas de permissão)
supabase auth logs
```

### Debugging Passo a Passo

```typescript
// 1. Adicionar breakpoints no AIOrchestrator
async function getContextualSuggestions(module: string, context: any) {
  debugger; // Pausa aqui
  
  console.log('Input:', { module, context });
  const category = this.identifyModuleCategory(module);
  console.log('Category:', category);
  
  const suggestions = await this.getModuleSpecificSuggestions(module, context);
  console.log('Suggestions:', suggestions);
  
  return suggestions;
}

// 2. Usar React DevTools
// Inspecionar props do AITutor component
// Verificar state e re-renders

// 3. Network tab
// Verificar chamadas à API/Supabase
// Tempo de resposta
// Payloads
```

---

## Escalação

### Nível 1: Suporte Básico
**Problemas:** UI, uso básico, dúvidas  
**Ação:**
1. Consultar `AI_TUTORS_USER_GUIDE.md`
2. Verificar problemas comuns neste doc
3. Tentar soluções rápidas (cache, refresh, permissões)

**Se não resolver:** Escalar para Nível 2

---

### Nível 2: Suporte Técnico
**Problemas:** Performance, integração, bugs  
**Ação:**
1. Coletar logs detalhados
2. Reproduzir o problema em staging
3. Verificar métricas no AI System Dashboard
4. Consultar `docs/monitoring/AI_AGENTS_MONITORING_GUIDE.md`
5. Aplicar soluções deste documento

**Se não resolver:** Escalar para Nível 3

---

### Nível 3: Engenharia
**Problemas:** Bugs críticos, falhas sistêmicas, degradação  
**Ação:**
1. Criar issue no GitHub com:
   - Passos para reproduzir
   - Logs completos
   - Screenshots/vídeos
   - Impacto no negócio
2. Notificar equipe de eng via Slack (#ai-alerts)
3. Se crítico, acionar on-call

**Template de Issue:**
```markdown
## Bug Report: AI Tutors

**Severidade:** [P0-Crítico | P1-Alto | P2-Médio | P3-Baixo]
**Módulo Afetado:** [nome do módulo]
**Impacto:** [quantos usuários afetados]

### Descrição
[descrição clara do problema]

### Passos para Reproduzir
1. ...
2. ...
3. ...

### Comportamento Esperado
[o que deveria acontecer]

### Comportamento Atual
[o que está acontecendo]

### Logs
```
[colar logs relevantes]
```

### Screenshots
[anexar screenshots]

### Ambiente
- Versão: [ex: 5.0.2]
- Browser: [ex: Chrome 120]
- User Role: [ex: Gestor]
- Timestamp: [ex: 2025-10-28 14:30 UTC-3]
```

---

## Referências

- `AI_TUTORS_USER_GUIDE.md` - Guia do usuário
- `AI_AGENTS_DEPLOYMENT_GUIDE.md` - Deployment
- `AI_AGENTS_MONITORING_GUIDE.md` - Monitoramento
- `AI_SYSTEM_TESTS_GUIDE.md` - Testes

---

**Versão:** 1.0  
**Última atualização:** 28/10/2025  
© 2025 ICARUS v5.0 - Sistema Enterprise OPME

