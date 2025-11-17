# GUIA RÁPIDO - Sistema de Agentes ICARUS v5.0

## 🚀 Quick Start - Desenvolvimento

### 1. Setup Inicial

```bash
# 1. Aplicar migrações
cd supabase
supabase migration up

# 2. Verificar Edge Functions
supabase functions list

# 3. Servir Functions localmente (desenvolvimento)
supabase functions serve

# 4. Testar uma function
curl -X POST http://localhost:54321/functions/v1/orchestrator \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "Analisar consumo de materiais OPME",
    "organization_id": "your-org-id",
    "priority": 5
  }'
```

---

## 📝 Casos de Uso Comuns

### Caso 1: Análise de Consumo OPME

**Objetivo**: Gerar relatório de consumo de materiais do último trimestre

```typescript
// 1. Criar tarefa via orchestrator
const { data: task } = await supabase.functions.invoke("orchestrator", {
  body: {
    query_text: "Analisar consumo de materiais OPME do último trimestre",
    organization_id: currentOrgId,
    priority: 8,
    parameters: {
      date_range: {
        start: "2025-01-01",
        end: "2025-03-31",
      },
    },
  },
});

console.log("Task ID:", task.task_id);

// 2. Monitorar progresso via Realtime
const subscription = supabase
  .channel(`task-${task.task_id}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "agent_tasks",
      filter: `task_id=eq.${task.task_id}`,
    },
    (payload) => {
      console.log("Status:", payload.new.status);

      if (payload.new.status === "completed") {
        // Buscar relatório gerado
        fetchReport(task.task_id);
      }
    },
  )
  .subscribe();

// 3. Buscar relatório quando tarefa completa
async function fetchReport(taskId: string) {
  const { data: report } = await supabase
    .from("agent_reports")
    .select("*")
    .eq("task_id", taskId)
    .single();

  console.log("Relatório:", report.title);
  console.log("Status:", report.status);

  // Renderizar markdown
  const html = markdownToHtml(report.content);
  displayReport(html, report.visualizations);
}
```

### Caso 2: Validação de Compliance

**Objetivo**: Verificar conformidade com ANVISA e RDC 925

```typescript
// 1. Criar tarefa de compliance
const { data: task } = await supabase.functions.invoke("agent-compliance", {
  body: {
    task_id: await createTask("compliance", currentOrgId),
    parameters: {
      validations: [
        "anvisa_registration",
        "udi_validation",
        "rdc_925",
        "rastreabilidade",
      ],
    },
  },
});

console.log("Compliance Score:", task.compliance_score + "%");
console.log("Status:", task.status); // 'compliant', 'mostly_compliant', 'non_compliant'

// 2. Analisar resultados
if (task.compliance_score < 95) {
  console.warn("Atenção: Compliance abaixo de 95%");

  // Verificar detalhes
  task.summary.validations.forEach((validation) => {
    if (validation.status !== "valid") {
      console.error(`${validation.validation_type}: ${validation.message}`);
    }
  });
}
```

### Caso 3: Rastreabilidade IoT/RFID

**Objetivo**: Registrar leitura de tag RFID e rastrear material

```typescript
// 1. Registrar leitura IoT
const { data, error } = await supabase.rpc("register_iot_reading", {
  p_device_uid: "RFID-READER-001",
  p_reading_type: "rfid_tag_read",
  p_tag_uid: "TAG-MAT-123456",
  p_value: null,
  p_raw_data: {
    signal_strength: -45,
    read_count: 1,
    antenna: 1,
  },
});

console.log("Reading ID:", data);

// 2. Buscar histórico do material
const { data: readings } = await supabase
  .from("iot_readings")
  .select("*, iot_devices(*)")
  .eq("tag_uid", "TAG-MAT-123456")
  .order("read_at", { ascending: false })
  .limit(10);

console.log("Histórico de leituras:", readings);

// 3. Verificar se material está em uso
const latestReading = readings[0];
console.log("Última localização:", latestReading.iot_devices.location_name);
console.log(
  "Última leitura:",
  new Date(latestReading.read_at).toLocaleString(),
);
```

### Caso 4: Integração com Fornecedor

**Objetivo**: Sincronizar catálogo de produtos de fornecedor via API

```typescript
// 1. Configurar integração
const { data: integration } = await supabase
  .from("supplier_integrations")
  .insert({
    supplier_id: supplierId,
    organization_id: currentOrgId,
    integration_type: "api_rest",
    base_url: "https://api.fornecedor.com.br/v1",
    auth_type: "api_key",
    auth_config: {
      api_key_header: "X-API-Key",
    },
    capabilities: ["catalog", "pricing", "availability"],
    sync_enabled: true,
    sync_frequency_minutes: 60,
  })
  .select()
  .single();

console.log("Integration ID:", integration.integration_id);

// 2. Forçar sincronização manual
await supabase.rpc("trigger_supplier_sync", {
  p_integration_id: integration.integration_id,
});

// 3. Verificar produtos sincronizados
const { data: products } = await supabase
  .from("external_product_catalog")
  .select("*")
  .eq("integration_id", integration.integration_id)
  .eq("mapping_status", "mapped");

console.log(`${products.length} produtos sincronizados`);
```

---

## 🔧 Funções Úteis (RPC)

### 1. Criar Tarefa

```sql
-- Via SQL
SELECT create_agent_task(
  'Analisar estoque de OPME',  -- query_text
  'data_internal',              -- task_type
  'uuid-org-id',                -- organization_id
  5,                             -- priority (1-10)
  '{}'::jsonb                   -- parameters
);
```

```typescript
// Via TypeScript
const { data, error } = await supabase.rpc("create_agent_task", {
  p_query_text: "Analisar estoque de OPME",
  p_task_type: "data_internal",
  p_organization_id: currentOrgId,
  p_priority: 5,
  p_parameters: {},
});
```

### 2. Obter Métricas de Tarefa

```sql
SELECT get_agent_task_metrics('uuid-task-id');
```

Retorna:

```json
{
  "task_id": "uuid",
  "status": "completed",
  "execution_time_ms": 5432,
  "retry_count": 0,
  "logs_count": 12,
  "error_logs_count": 0,
  "sources_count": 3,
  "avg_confidence": 0.98,
  "subtasks_count": 4
}
```

### 3. Validar Registro ANVISA

```sql
SELECT validate_anvisa_registration(
  '12345678',            -- registration_number
  'product',             -- entity_type
  'uuid-product-id',     -- entity_id
  'uuid-org-id'          -- organization_id
);
```

### 4. Registrar Leitura IoT

```sql
SELECT register_iot_reading(
  'RFID-001',           -- device_uid
  'rfid_tag_read',      -- reading_type
  'TAG-123',            -- tag_uid
  NULL,                 -- value
  '{"data": "..."}'::jsonb  -- raw_data
);
```

---

## 📊 Queries Úteis

### 1. Listar Tarefas Ativas

```sql
SELECT
  t.task_id,
  t.query_text,
  t.status,
  t.priority,
  t.created_at,
  COUNT(l.log_id) as logs_count
FROM agent_tasks t
LEFT JOIN agent_logs l ON l.task_id = t.task_id
WHERE t.status IN ('pending', 'in_progress')
  AND t.organization_id = 'uuid-org-id'
GROUP BY t.task_id
ORDER BY t.priority DESC, t.created_at ASC;
```

### 2. Performance de Agentes

```sql
SELECT * FROM agent_performance_summary
WHERE total_tasks > 0
ORDER BY avg_execution_time_ms ASC;
```

### 3. Relatórios Pendentes de Revisão

```sql
SELECT
  r.report_id,
  r.title,
  r.report_type,
  r.created_at,
  t.query_text,
  p.full_name as creator_name
FROM agent_reports r
JOIN agent_tasks t ON t.task_id = r.task_id
JOIN profiles p ON p.id = r.created_by
WHERE r.status = 'pending_review'
  AND r.organization_id = 'uuid-org-id'
ORDER BY r.created_at ASC;
```

### 4. Dispositivos IoT Offline

```sql
SELECT
  device_uid,
  device_type,
  location_name,
  last_seen_at,
  NOW() - last_seen_at as offline_duration
FROM iot_devices
WHERE status = 'active'
  AND last_seen_at < NOW() - INTERVAL '1 hour'
  AND organization_id = 'uuid-org-id'
ORDER BY last_seen_at ASC;
```

### 5. Materiais sem Validação ANVISA

```sql
SELECT
  p.id,
  p.name,
  p.anvisa_registration
FROM products p
LEFT JOIN anvisa_validations v
  ON v.entity_type = 'product'
  AND v.entity_id = p.id
  AND v.cache_expires_at > NOW()
WHERE p.organization_id = 'uuid-org-id'
  AND p.anvisa_registration IS NOT NULL
  AND v.validation_id IS NULL
ORDER BY p.name;
```

---

## 🐛 Debugging

### Ver Logs de Uma Tarefa

```sql
SELECT
  log_id,
  agent_name,
  event_type,
  action,
  log_level,
  event_time,
  duration_ms,
  details
FROM agent_logs
WHERE task_id = 'uuid-task-id'
ORDER BY event_time ASC;
```

### Ver Erros Recentes

```sql
SELECT
  l.log_id,
  l.task_id,
  l.agent_name,
  l.action,
  l.details->>'error_message' as error_message,
  l.event_time,
  t.query_text
FROM agent_logs l
JOIN agent_tasks t ON t.task_id = l.task_id
WHERE l.log_level IN ('error', 'critical')
  AND l.event_time > NOW() - INTERVAL '24 hours'
ORDER BY l.event_time DESC
LIMIT 20;
```

### Ver Chamadas API com Erro

```sql
SELECT
  log_id,
  i.supplier_id,
  s.nome as supplier_name,
  request_method,
  request_url,
  response_status,
  error_message,
  created_at
FROM supplier_api_logs l
JOIN supplier_integrations i ON i.integration_id = l.integration_id
JOIN suppliers s ON s.id = i.supplier_id
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 🔔 Notificações e Alertas

### Configurar Notificação de Tarefa Completa

```typescript
// Frontend - React/TypeScript
useEffect(() => {
  const subscription = supabase
    .channel("agent-notifications")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "agent_tasks",
        filter: `status=eq.completed`,
      },
      (payload) => {
        // Mostrar notificação toast
        toast.success(`Tarefa completa: ${payload.new.query_text}`);

        // Buscar relatório
        if (payload.new.task_type === "synthesis") {
          fetchAndDisplayReport(payload.new.task_id);
        }
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Alerta de Compliance Baixo

```sql
-- Trigger para alertar quando compliance < 80%
CREATE OR REPLACE FUNCTION notify_low_compliance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.task_type = 'compliance' THEN
    IF (NEW.result_data->'summary'->>'compliance_score')::numeric < 80 THEN
      -- Criar notificação
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        severity,
        metadata
      )
      SELECT
        uo.user_id,
        'compliance_alert',
        'Compliance Baixo Detectado',
        'Score de compliance: ' || (NEW.result_data->'summary'->>'compliance_score') || '%',
        'high',
        jsonb_build_object('task_id', NEW.task_id, 'score', NEW.result_data->'summary'->>'compliance_score')
      FROM user_organizations uo
      WHERE uo.organization_id = NEW.organization_id
        AND uo.role IN ('admin', 'compliance_officer');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_low_compliance_trigger
  AFTER UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_low_compliance();
```

---

## 🧪 Testes

### Teste 1: Fluxo Completo

```bash
# 1. Criar tarefa
curl -X POST http://localhost:54321/functions/v1/orchestrator \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "Teste de análise completa",
    "organization_id": "test-org-id",
    "priority": 5
  }'

# 2. Verificar tarefas criadas
psql $DATABASE_URL -c "SELECT task_id, status, task_type FROM agent_tasks ORDER BY created_at DESC LIMIT 5;"

# 3. Ver logs
psql $DATABASE_URL -c "SELECT agent_name, event_type, action FROM agent_logs ORDER BY event_time DESC LIMIT 10;"
```

---

## 📚 Referências Rápidas

### Status de Tarefas

- `pending` - Aguardando execução
- `in_progress` - Em execução
- `completed` - Concluída com sucesso
- `failed` - Falhou
- `cancelled` - Cancelada
- `waiting_approval` - Aguardando aprovação humana

### Tipos de Tarefas

- `master_planning` - Orquestração master
- `data_internal` - Dados internos (ERP/IoT)
- `data_external` - Dados externos (APIs)
- `benchmark` - Comparação de mercado
- `compliance` - Validação regulatória
- `synthesis` - Geração de relatório
- `visualization` - Gráficos
- `notification` - Notificações

### Tipos de Relatórios

- `consumo_opme` - Consumo de materiais
- `compliance_summary` - Resumo de compliance
- `previsao_demanda` - Previsão de demanda
- `analise_custo` - Análise de custos
- `benchmark_fornecedores` - Comparação de fornecedores
- `auditoria_rastreabilidade` - Auditoria de rastreio
- `desempenho_cirurgias` - Performance cirúrgica
- `glosas_detectadas` - Glosas identificadas
- `custom` - Personalizado

---

**Última Atualização**: 2025-10-26  
**Versão**: 1.0.0
