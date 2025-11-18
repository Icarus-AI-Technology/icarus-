# 📊 Guia de Monitoramento: AI Tutors & Agents
## ICARUS v5.0

**Data:** 28 de Outubro de 2025  
**Versão:** 1.0.0

---

## 🎯 Objetivo

Este guia fornece queries SQL, dashboards e métricas para monitorar o desempenho e eficácia do sistema de AI Tutors & Agents após o deploy em produção.

---

## 📈 KPIs Principais

### 1. Uso dos Tutores IA

**Métrica:** Número de sugestões exibidas por módulo

```sql
-- Sugestões mais exibidas (últimos 7 dias)
SELECT 
  modulo,
  tipo_insight,
  COUNT(*) as total_exibicoes,
  COUNT(CASE WHEN acao_executada THEN 1 END) as acoes_executadas,
  ROUND(COUNT(CASE WHEN acao_executada THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as taxa_conversao
FROM ai_tutor_insights
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY modulo, tipo_insight
ORDER BY total_exibicoes DESC
LIMIT 20;
```

**Meta:** Taxa de conversão >20% (usuário executou a ação sugerida)

---

### 2. Performance dos Agentes

**Métrica:** Tempo de execução e taxa de sucesso dos agentes

```sql
-- Performance dos agentes (últimas 24h)
SELECT
  agent_name,
  action_type,
  COUNT(*) as total_execucoes,
  COUNT(CASE WHEN success THEN 1 END) as sucessos,
  ROUND(AVG(execution_time_ms), 2) as tempo_medio_ms,
  MAX(execution_time_ms) as tempo_maximo_ms,
  ROUND(COUNT(CASE WHEN success THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as taxa_sucesso
FROM agent_actions_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY agent_name, action_type
ORDER BY agent_name, action_type;
```

**Meta:**
- Taxa de sucesso: >95%
- Tempo médio: <2000ms
- Tempo máximo: <5000ms

---

### 3. Feed Operacional CEO

**Métrica:** Eventos críticos reportados ao CEO

```sql
-- Últimos 50 eventos no feed do CEO
SELECT
  agente_origem,
  categoria,
  metrica,
  prioridade,
  valor_atual,
  tendencia,
  acoes_sugeridas,
  created_at
FROM ceo_operational_feed
ORDER BY 
  CASE prioridade
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END,
  created_at DESC
LIMIT 50;
```

**Análise:**

```sql
-- Distribuição de eventos por severidade (últimos 7 dias)
SELECT
  prioridade,
  COUNT(*) as total,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentual
FROM ceo_operational_feed
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY prioridade
ORDER BY 
  CASE prioridade
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    ELSE 4
  END;
```

**Meta:**
- Eventos críticos: <5% do total
- Eventos high: <15% do total

---

### 4. Notificações Enviadas

**Métrica:** Notificações enviadas ao CEO e taxa de resposta

```sql
-- Status das notificações (últimos 7 dias)
SELECT
  tipo,
  severidade,
  status,
  COUNT(*) as total,
  ROUND(AVG(EXTRACT(EPOCH FROM (lida_em - enviada_em)) / 60), 2) as tempo_medio_leitura_min
FROM ceo_notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tipo, severidade, status
ORDER BY severidade DESC, tipo;
```

**Meta:**
- Tempo médio de leitura: <30 min (notificações críticas)
- Taxa de notificações lidas: >80%

---

### 5. Recomendações Aprovadas

**Métrica:** ROI das recomendações aprovadas

```sql
-- Recomendações por status e ROI médio
SELECT
  area,
  status,
  COUNT(*) as total,
  ROUND(AVG(roi_estimado), 2) as roi_medio,
  ROUND(AVG(impacto_esperado), 2) as impacto_medio,
  ROUND(AVG(prazo_implementacao_dias), 0) as prazo_medio_dias
FROM ceo_recommendations
GROUP BY area, status
ORDER BY area, 
  CASE status
    WHEN 'concluida' THEN 1
    WHEN 'em_implementacao' THEN 2
    WHEN 'aprovada' THEN 3
    WHEN 'pendente' THEN 4
    ELSE 5
  END;
```

**Meta:**
- Taxa de aprovação: >30%
- ROI médio: >5x

---

## 📊 Dashboards Sugeridos

### Dashboard 1: Visão Geral AI System

**Widgets:**

1. **Total de Sugestões Exibidas (Gauge)**
   - Últimas 24h
   - Meta: >100 sugestões/dia

2. **Taxa de Conversão Geral (%)** 
   - Ações executadas / Total sugestões
   - Meta: >20%

3. **Agentes Ativos (Status)**
   - Clinical: 🟢 Ativo
   - Operations: 🟢 Ativo  
   - Procurement: 🟢 Ativo
   - Logistics: 🟢 Ativo

4. **Tempo de Resposta Médio (Line Chart)**
   - Por agente, últimas 24h
   - Meta: <2s

---

### Dashboard 2: CEO Intelligence Feed

**Widgets:**

1. **Eventos por Severidade (Pie Chart)**
   - Critical, High, Medium, Low
   - Últimos 7 dias

2. **Timeline de Eventos (Timeline)**
   - Últimos 20 eventos críticos
   - Com ações sugeridas

3. **Recomendações Pendentes (Table)**
   - Ordenadas por ROI
   - Com botão "Aprovar"

4. **Notificações Não Lidas (Counter)**
   - Badge com número
   - Link para lista completa

---

### Dashboard 3: Módulos com Tutores

**Widgets:**

1. **Uso por Módulo (Bar Chart)**
   - Total de sugestões exibidas
   - Últimos 7 dias

2. **Top 10 Sugestões Mais Executadas (Table)**
   - Módulo, Tipo, Taxa conversão

3. **Módulos com Menor Engajamento (Alert)**
   - Taxa de conversão <10%
   - Requer otimização

---

## 🔍 Queries de Troubleshooting

### 1. Identificar Agentes com Falhas

```sql
-- Agentes com taxa de erro >5% (últimas 24h)
SELECT
  agent_name,
  COUNT(*) as total,
  COUNT(CASE WHEN NOT success THEN 1 END) as falhas,
  ROUND(COUNT(CASE WHEN NOT success THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as taxa_erro,
  array_agg(DISTINCT error_message) FILTER (WHERE error_message IS NOT NULL) as erros_unicos
FROM agent_actions_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY agent_name
HAVING COUNT(CASE WHEN NOT success THEN 1 END)::NUMERIC / COUNT(*) > 0.05
ORDER BY taxa_erro DESC;
```

---

### 2. Sugestões Ignoradas Repetidamente

```sql
-- Sugestões exibidas >5x mas nunca executadas
SELECT
  modulo,
  tipo_insight,
  conteudo->>'titulo' as titulo,
  COUNT(*) as vezes_exibida,
  AVG(confianca) as confianca_media
FROM ai_tutor_insights
WHERE 
  created_at > NOW() - INTERVAL '30 days'
  AND acao_executada = false
GROUP BY modulo, tipo_insight, conteudo->>'titulo'
HAVING COUNT(*) > 5
ORDER BY vezes_exibida DESC
LIMIT 10;
```

**Ação:** Revisar relevância ou desabilitar sugestões ignoradas

---

### 3. Notificações Não Lidas por Muito Tempo

```sql
-- Notificações críticas não lidas há mais de 1 hora
SELECT
  tipo,
  titulo,
  descricao,
  severidade,
  enviada_em,
  EXTRACT(EPOCH FROM (NOW() - enviada_em)) / 3600 as horas_pendentes
FROM ceo_notifications
WHERE 
  status = 'pendente'
  AND severidade IN ('critical', 'high')
  AND enviada_em < NOW() - INTERVAL '1 hour'
ORDER BY enviada_em ASC;
```

---

### 4. Verificar Saúde das Edge Functions

```bash
# Testar todas as Edge Functions
for func in agent-clinical agent-operations agent-procurement agent-logistics; do
  echo "Testing $func..."
  supabase functions invoke $func --body '{"action":"getMetrics"}' || echo "FAILED: $func"
done
```

---

## 📈 Relatórios Semanais

### Template de Relatório Executivo

```sql
-- Relatório Semanal CEO (copiar resultado para apresentação)
WITH stats AS (
  SELECT
    COUNT(DISTINCT modulo) as modulos_ativos,
    COUNT(*) as total_sugestoes,
    COUNT(CASE WHEN acao_executada THEN 1 END) as acoes_executadas,
    ROUND(AVG(confianca), 2) as confianca_media
  FROM ai_tutor_insights
  WHERE created_at > NOW() - INTERVAL '7 days'
),
agents AS (
  SELECT
    COUNT(DISTINCT agent_name) as agentes_ativos,
    COUNT(*) as total_execucoes,
    COUNT(CASE WHEN success THEN 1 END) as execucoes_sucesso
  FROM agent_actions_log
  WHERE created_at > NOW() - INTERVAL '7 days'
),
ceo_feed AS (
  SELECT
    COUNT(*) as eventos_reportados,
    COUNT(CASE WHEN prioridade IN ('critical', 'high') THEN 1 END) as eventos_criticos
  FROM ceo_operational_feed
  WHERE created_at > NOW() - INTERVAL '7 days'
)
SELECT
  '📊 Relatório Semanal AI System - ' || TO_CHAR(NOW(), 'DD/MM/YYYY') as titulo,
  json_build_object(
    'tutores', json_build_object(
      'modulos_ativos', s.modulos_ativos,
      'sugestoes_exibidas', s.total_sugestoes,
      'acoes_executadas', s.acoes_executadas,
      'taxa_conversao', ROUND(s.acoes_executadas::NUMERIC / s.total_sugestoes * 100, 2) || '%',
      'confianca_media', s.confianca_media || '%'
    ),
    'agentes', json_build_object(
      'agentes_ativos', a.agentes_ativos,
      'execucoes_totais', a.total_execucoes,
      'taxa_sucesso', ROUND(a.execucoes_sucesso::NUMERIC / a.total_execucoes * 100, 2) || '%'
    ),
    'ceo_intelligence', json_build_object(
      'eventos_reportados', c.eventos_reportados,
      'eventos_criticos', c.eventos_criticos,
      'percentual_critico', ROUND(c.eventos_criticos::NUMERIC / c.eventos_reportados * 100, 2) || '%'
    )
  ) as dados
FROM stats s, agents a, ceo_feed c;
```

---

## 🚨 Alertas Automáticos (Configurar)

### 1. Taxa de Erro Alta

**Condição:** Taxa de erro de agentes >10% em 1 hora

**Ação:** Enviar notificação para equipe técnica

```sql
-- Query para monitoramento
SELECT agent_name, COUNT(*) as falhas
FROM agent_actions_log
WHERE 
  created_at > NOW() - INTERVAL '1 hour'
  AND success = false
GROUP BY agent_name
HAVING COUNT(*) > (
  SELECT COUNT(*) * 0.1
  FROM agent_actions_log
  WHERE created_at > NOW() - INTERVAL '1 hour'
);
```

---

### 2. Sem Sugestões IA

**Condição:** Nenhuma sugestão exibida em 2 horas

**Ação:** Verificar AIOrchestrator

```sql
-- Última sugestão exibida
SELECT MAX(created_at) as ultima_sugestao,
       EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 3600 as horas_sem_sugestao
FROM ai_tutor_insights;
```

---

### 3. CEO Notificação Crítica Não Lida

**Condição:** Notificação crítica pendente >30 min

**Ação:** Escalar para time executivo

```sql
SELECT COUNT(*) as notificacoes_criticas_pendentes
FROM ceo_notifications
WHERE 
  severidade = 'critical'
  AND status = 'pendente'
  AND enviada_em < NOW() - INTERVAL '30 minutes';
```

---

## 📞 Contatos de Suporte

**Equipe Técnica:**
- Slack: #icarus-ai-support
- Email: dev-team@icarus.com

**Documentação:**
- Deploy: `docs/deployment/AI_AGENTS_DEPLOYMENT_GUIDE.md`
- Troubleshooting: `docs/troubleshooting/AI_SYSTEM.md`

---

**Monitoramento Guide v1.0.0** - ICARUS v5.0  
Última atualização: 28/10/2025

