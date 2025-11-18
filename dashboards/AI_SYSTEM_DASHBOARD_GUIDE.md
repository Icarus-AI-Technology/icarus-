# 📊 Dashboard de Métricas AI - Guia Completo
## ICARUS v5.0 - Sistema de Monitoramento em Tempo Real

**Data:** 28 de Outubro de 2025  
**Componente:** `AISystemDashboard.tsx`

---

## 🎯 Objetivo

Dashboard visual para monitoramento em tempo real do sistema de **AI Tutors & Agents**, exibindo:
- Métricas de uso e performance
- Status dos agentes especializados
- Atividade por módulo
- Saúde do sistema

---

## 📊 Métricas Disponíveis

### 1. **KPIs Principais** (Cards superiores)

#### Sugestões Geradas
- **Total:** Número de sugestões IA exibidas (últimas 24h)
- **Fonte:** Tabela `ai_tutor_insights`
- **Atualização:** A cada 30 segundos

#### Taxa de Conversão
- **Cálculo:** (Ações executadas / Total sugestões) × 100
- **Meta:** >20%
- **Indicador:** Eficácia das sugestões

#### Tempo Médio
- **Métrica:** Tempo de resposta médio do sistema
- **Fonte:** `agent_actions_log.execution_time_ms`
- **Meta:** <2000ms

#### Módulos Ativos
- **Total:** Módulos que geraram sugestões (últimas 24h)
- **Máximo:** 95 módulos
- **Indicador:** Adoção do sistema

---

### 2. **Agentes Especializados**

Para cada um dos 4 agentes (Clinical, Operations, Procurement, Logistics):

- **Execuções:** Total de execuções (últimas 24h)
- **Taxa de Sucesso:** Porcentagem de execuções bem-sucedidas
- **Tempo Médio:** Tempo médio de execução (ms)
- **Status:** 
  - 🟢 `active` - Executando normalmente
  - 🟡 `idle` - Sem execuções recentes
  - 🔴 `error` - Falhas detectadas

---

### 3. **Top 10 Módulos Mais Ativos**

Ranking dos módulos por:
- **Sugestões geradas:** Número total
- **Taxa de conversão:** Barra de progresso visual
- **Última atividade:** Timestamp

**Ordenação:** Por número de sugestões (desc)

---

### 4. **Status de Saúde do Sistema**

Indicadores de 3 componentes principais:
- **AIOrchestrator:** Service coordenador central
- **Edge Functions:** 4 agentes especializados
- **CEO Intelligence:** Bridge de agregação

**Status possíveis:**
- ✅ Operacional
- ⚠️ Degradado
- ❌ Inativo

---

## 🔌 Integração com Banco de Dados

### Queries Utilizadas

#### 1. Total de Sugestões (24h)
```sql
SELECT COUNT(*) 
FROM ai_tutor_insights 
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

#### 2. Ações Executadas
```sql
SELECT COUNT(*) 
FROM ai_tutor_insights 
WHERE acao_executada = true 
AND created_at >= NOW() - INTERVAL '24 hours';
```

#### 3. Módulos Ativos
```sql
SELECT DISTINCT modulo 
FROM ai_tutor_insights 
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

#### 4. Métricas dos Agentes
```sql
SELECT 
  agent_name,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as sucessos,
  AVG(execution_time_ms) as tempo_medio
FROM agent_actions_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY agent_name;
```

#### 5. Atividade por Módulo
```sql
SELECT 
  modulo,
  COUNT(*) as suggestions,
  SUM(CASE WHEN acao_executada THEN 1 ELSE 0 END) as conversions,
  MAX(created_at) as last_activity
FROM ai_tutor_insights
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY modulo
ORDER BY suggestions DESC
LIMIT 10;
```

---

## 🚀 Como Usar

### 1. Adicionar Rota no App.tsx

```typescript
import AISystemDashboard from './pages/AISystemDashboard';

// Dentro das rotas:
<Route path="/admin/ai-dashboard" element={<AISystemDashboard />} />
```

### 2. Adicionar ao Menu de Navegação

```typescript
{
  path: '/admin/ai-dashboard',
  label: 'Dashboard IA',
  icon: BarChart3,
  badge: 'Novo'
}
```

### 3. Acessar

```
http://localhost:5173/admin/ai-dashboard
```

---

## ⚙️ Configuração

### Intervalo de Atualização

Por padrão, as métricas são atualizadas a **cada 30 segundos**.

Para alterar:

```typescript
// Em AISystemDashboard.tsx, linha ~89
const interval = setInterval(() => {
  loadSystemMetrics();
  loadAgentMetrics();
  loadModuleActivity();
}, 30000); // Mudar para desejado (em ms)
```

### Período de Análise

Por padrão, exibe dados das **últimas 24 horas**.

Para alterar:

```typescript
// Alterar o intervalo em cada query
.gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
//                                      ↑
//                     Mudar para: 7 dias = 7 * 24 * 60 * 60 * 1000
```

---

## 📈 Interpretação das Métricas

### Taxa de Conversão

| Valor | Interpretação | Ação |
|-------|---------------|------|
| >30% | ✅ Excelente | Manter |
| 20-30% | ✅ Bom | Monitorar |
| 10-20% | ⚠️ Regular | Revisar sugestões |
| <10% | ❌ Baixo | Otimizar urgente |

### Tempo de Resposta

| Valor | Interpretação | Ação |
|-------|---------------|------|
| <1000ms | ✅ Rápido | Manter |
| 1000-2000ms | ✅ Aceitável | Monitorar |
| 2000-5000ms | ⚠️ Lento | Otimizar |
| >5000ms | ❌ Crítico | Investigar urgente |

### Taxa de Sucesso (Agentes)

| Valor | Interpretação | Ação |
|-------|---------------|------|
| >95% | ✅ Ótimo | Manter |
| 90-95% | ✅ Bom | Monitorar |
| 80-90% | ⚠️ Atenção | Revisar logs |
| <80% | ❌ Problema | Investigar urgente |

---

## 🎨 Customização Visual

### Cores dos KPIs

```typescript
const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-accent',
  green: 'bg-success/10 dark:bg-green-900/30 text-success',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-primary',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
};
```

### Status dos Agentes

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-600'; // 🟢
    case 'idle': return 'bg-yellow-100 text-yellow-600';  // 🟡
    case 'error': return 'bg-red-100 text-red-600';       // 🔴
  }
};
```

---

## 🔍 Troubleshooting

### Problema: Dashboard vazio

**Causa:** Nenhum dado ainda registrado no banco

**Solução:**
1. Verificar se migrations foram aplicadas
2. Usar o sistema (gerar sugestões)
3. Aguardar 1-2 minutos para dados aparecerem

### Problema: Métricas não atualizam

**Causa:** Erro na conexão Supabase

**Solução:**
1. Verificar console do browser (F12)
2. Conferir `.env.local` está correto
3. Verificar credenciais Supabase
4. Limpar cache e recarregar

### Problema: Agentes aparecem como "idle"

**Causa:** Nenhuma execução registrada

**Solução:**
1. Verificar se Edge Functions estão deployadas
2. Aguardar atividade dos agentes
3. Executar manualmente: `supabase functions invoke agent-clinical`

---

## 📊 Dashboards Adicionais Sugeridos

### 1. **Dashboard por Módulo**
- Drill-down em um módulo específico
- Histórico de sugestões
- Análise de padrões

### 2. **Dashboard de Performance**
- Gráficos de tempo ao longo do dia
- Picos de uso
- Bottlenecks

### 3. **Dashboard Executivo**
- Métricas agregadas (semana/mês)
- Tendências
- ROI estimado

---

## 🎯 Próximas Melhorias

### Curto Prazo
- [ ] Gráficos de linha para tendências
- [ ] Filtros por período (24h, 7d, 30d)
- [ ] Export para PDF

### Médio Prazo
- [ ] Alertas automáticos (email/SMS)
- [ ] Drill-down em módulos específicos
- [ ] Comparativo com períodos anteriores

### Longo Prazo
- [ ] Machine learning para anomalias
- [ ] Predições de uso futuro
- [ ] Recomendações de otimização

---

## ✅ Checklist de Implementação

- [x] Dashboard component criado
- [x] Queries Supabase implementadas
- [x] Auto-refresh a cada 30s
- [x] Design neumórfico OraclusX
- [x] Dark mode suportado
- [x] TypeScript estrito
- [ ] Rota adicionada ao App.tsx
- [ ] Item no menu de navegação
- [ ] Testes com dados reais
- [ ] Documentação criada (este arquivo)

---

## 📚 Referências

- **Componente:** `src/pages/AISystemDashboard.tsx`
- **Queries SQL:** `docs/monitoring/AI_AGENTS_MONITORING_GUIDE.md`
- **Banco de Dados:** Migrations em `supabase/migrations/`
- **Design System:** `ORACLUSX_DS_COMPLETO.md`

---

## 🎉 Benefícios

✅ **Visibilidade:** Monitoramento em tempo real  
✅ **Proatividade:** Detectar problemas cedo  
✅ **Otimização:** Identificar oportunidades de melhoria  
✅ **Accountability:** Métricas claras de desempenho  
✅ **ROI:** Demonstrar valor do sistema AI  

---

**Dashboard criado por:** AI Assistant  
**Data:** 28 de Outubro de 2025  
**Versão:** 1.0.0

