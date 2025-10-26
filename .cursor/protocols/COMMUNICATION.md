# 📡 Comunicação entre Agentes

## Canais de Comunicação

### 1. Arquivos STATUS.json
- **Leitura:** Qualquer agente pode ler
- **Escrita:** Apenas o próprio agente
- **Localização:** `.cursor/agents/{id}-{name}/STATUS.json`

### 2. Arquivos de Mensagem
- **Formato:** JSON
- **Localização:** `.cursor/messages/{from}-to-{to}.json`
- **Tipo:** Assíncrona (não bloqueante)

### 3. Locks de Recursos
- **Formato:** JSON
- **Localização:** `.cursor/locks/{resource-hash}.lock`
- **Tipo:** Exclusivo para escrita

## Estrutura de Mensagem

```json
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
```

## Tipos de Mensagem

### 1. Notification (Notificação)
Informa conclusão de tarefa ou evento:

```json
{
  "type": "notification",
  "from": "01",
  "to": "orchestrator",
  "subject": "Design System auditado",
  "message": "28/28 componentes validados. 0 erros críticos."
}
```

### 2. Request (Solicitação)
Solicita informação ou ação:

```json
{
  "type": "request",
  "from": "06",
  "to": "03",
  "subject": "Verificar tabela cirurgias",
  "message": "Módulo CirurgiasProcedimentos precisa confirmar schema da tabela.",
  "requires_response": true
}
```

### 3. Response (Resposta)
Responde a uma solicitação:

```json
{
  "type": "response",
  "from": "03",
  "to": "06",
  "subject": "Re: Verificar tabela cirurgias",
  "message": "Tabela cirurgias validada. 25 colunas, todas as FKs corretas.",
  "data": { "validated": true }
}
```

## Exemplo de Uso

```typescript
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
```

## Leitura de Mensagens

```typescript
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
```
