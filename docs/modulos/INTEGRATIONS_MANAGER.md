# 🔌 Integrations Manager - Gerenciamento Centralizado

## Visão Geral

O **Integrations Manager** é o centro de controle de todas as integrações externas do ICARUS. Ele fornece visibilidade completa, gerenciamento de webhooks, logs detalhados e configurações avançadas para APIs como SEFAZ, ANVISA, CFM, Microsoft 365 e outras.

## 🎯 Funcionalidades Principais

### 1. **Dashboard de Integrações**
- Status em tempo real de todas as APIs
- KPIs: Integrações Ativas, Chamadas 24h, Taxa de Sucesso, Tempo Médio
- Cards visuais por integração (SEFAZ, ANVISA, CFM, etc.)
- Teste manual de integração

### 2. **Gerenciamento de Webhooks**
- Criar webhooks customizados
- Configurar eventos (nfe.autorizada, kpi.critico, etc.)
- Secret keys para segurança
- Estatísticas de chamadas (sucessos/falhas)
- Toggle ativar/desativar

### 3. **Logs Centralizados**
- Histórico de todas as requisições
- Filtros avançados (data, integração, status)
- Detalhes de request/response
- Exportação CSV/JSON
- Alertas de falhas

### 4. **Health Checks Automáticos**
- Verificação periódica de disponibilidade
- Alertas proativos de downtime
- Histórico de uptime (SLA)
- Gráficos de disponibilidade

### 5. **Configurações Avançadas**
- Gerenciar credenciais (API Keys, Certificates)
- Rate limits personalizados
- Retry policies
- Timeouts configuráveis
- Circuit breaker thresholds

## 🏗️ Integrações Gerenciadas

### SEFAZ (Secretaria da Fazenda)
- **Endpoints**: Emissão, Consulta, Cancelamento de NF-e
- **Autenticação**: Certificado Digital A1/A3
- **Rate Limit**: 50 req/min (emissão), 100 req/min (consulta)
- **Criticidade**: Crítica
- **SLA**: 99.5%

### ANVISA (Agência Nacional de Vigilância Sanitária)
- **Endpoints**: Consulta Registro, Rastreabilidade
- **Autenticação**: API Key
- **Rate Limit**: 200 req/min
- **Criticidade**: Alta
- **SLA**: 99%

### CFM (Conselho Federal de Medicina)
- **Endpoints**: Validação CRM
- **Autenticação**: None (público) ou Scraping (Puppeteer)
- **Rate Limit**: 50 req/min
- **Criticidade**: Média
- **SLA**: 95%

### Microsoft 365
- **Endpoints**: Teams, Outlook, OneDrive
- **Autenticação**: OAuth 2.0 (Microsoft Graph)
- **Rate Limit**: Dinâmico (Microsoft Throttling)
- **Criticidade**: Média
- **SLA**: 99.9%

### Receita Federal (Brasil API)
- **Endpoints**: CNPJ, CPF
- **Autenticação**: None
- **Rate Limit**: 300 req/min
- **Criticidade**: Média
- **SLA**: 98%

### ViaCEP
- **Endpoints**: Consulta CEP
- **Autenticação**: None
- **Rate Limit**: 500 req/min
- **Criticidade**: Baixa
- **SLA**: 95%

### Infosimples (Opcional)
- **Endpoints**: CNPJ Completo, CPF Completo
- **Autenticação**: API Key (pago)
- **Rate Limit**: 100 req/min
- **Criticidade**: Alta (se contratado)
- **SLA**: 99.5%

## 💻 Uso no Código

### Exemplo 1: Testar Integração Manualmente

```typescript
import { supabase } from '@/lib/supabase';

// Testar conexão com SEFAZ
const { data, error } = await supabase.rpc('testar_integracao', {
  p_endpoint_id: 'sefaz-nfe-consulta',
});

if (data.sucesso) {
  console.log('SEFAZ está online! Tempo:', data.tempo_resposta);
} else {
  console.error('SEFAZ offline:', data.erro);
}
```

### Exemplo 2: Criar Webhook

```typescript
const { data: webhook } = await supabase
  .from('webhooks')
  .insert({
    nome: 'Slack - Alerta NF-e Cancelada',
    url: 'https://hooks.slack.com/services/XXX',
    eventos: ['nfe.cancelada'],
    secret: 'whsec_' + crypto.randomUUID(),
    is_ativo: true,
  })
  .select()
  .single();

console.log('Webhook criado:', webhook.id);
```

### Exemplo 3: Buscar Logs de Falhas

```typescript
const { data: logs } = await supabase
  .from('api_requests_log')
  .select('*')
  .gte('response_status', 400) // Status de erro (4xx, 5xx)
  .gte('created_at', new Date(Date.now() - 86400000).toISOString()) // Últimas 24h
  .order('created_at', { ascending: false });

logs.forEach(log => {
  console.log(`${log.endpoint_nome}: ${log.error_message}`);
});
```

## 📊 Interface React

### Componente: `IntegrationsManager.tsx`

#### 5 Abas:

1. **Visão Geral**:
   - 4 KPIs: Integrações Ativas, Chamadas 24h, Taxa Sucesso, Tempo Médio
   - Grid de cards (uma para cada integração)
   - Botão "Testar" para health check manual

2. **Integrações**:
   - Tabela completa de todas as APIs
   - Filtros por status, tipo
   - Ações: Ver Logs, Configurar, Testar

3. **Webhooks**:
   - Lista de webhooks configurados
   - Toggle ativar/desativar
   - Estatísticas de chamadas
   - Editar/Deletar

4. **Logs**:
   - Tabela de logs com timestamp, método, status
   - Busca por integração
   - Exportação CSV
   - Detalhes de erro

5. **Configurações**:
   - Gerenciar API Keys
   - Configurar rate limits
   - Políticas de retry
   - Circuit breaker thresholds

## 🔐 Segurança

### Armazenamento de Credenciais:
- **API Keys**: Criptografadas no banco (AES-256)
- **Certificates**: Armazenados em Supabase Storage (encrypted at rest)
- **OAuth Tokens**: Refresh tokens criptografados, access tokens em memória

### Auditoria:
- Log de todas as chamadas (request + response)
- Rastreabilidade de quem fez cada configuração
- Alertas de tentativas de acesso não autorizado

### RLS (Row Level Security):
- Admins e TI veem tudo
- Gerentes veem apenas integrações de sua área
- Vendedores não têm acesso

## 🚨 Alertas e Notificações

### Alertas Automáticos:
1. **API Down**: Integração falhou 3x consecutivas
2. **High Error Rate**: > 10% de erros em 5 minutos
3. **Slow Response**: Tempo médio > 2 segundos
4. **Rate Limit Exceeded**: Limite sendo atingido frequentemente
5. **Certificate Expiring**: Certificado SEFAZ expira em < 30 dias

### Canais de Notificação:
- Email (Supabase Edge Function)
- Slack (Webhook)
- Microsoft Teams (Microsoft Graph)
- SMS (Twilio - opcional)
- Push Notification (Firebase - opcional)

## 📈 Métricas e SLA

### SLA Targets:
- **SEFAZ**: 99.5% uptime
- **ANVISA**: 99% uptime
- **Microsoft 365**: 99.9% uptime (garantido pela Microsoft)
- **Outros**: 95-98% uptime

### Métricas Monitoradas:
- **Uptime**: % de tempo disponível
- **Latency**: Tempo médio de resposta (P50, P95, P99)
- **Error Rate**: % de requisições com erro
- **Throughput**: Requisições por segundo
- **MTTR** (Mean Time To Recovery): Tempo médio para recuperação de falha

## 🤖 Webhooks

### Eventos Disponíveis:

#### NFe:
- `nfe.autorizada`: NF-e foi autorizada pela SEFAZ
- `nfe.cancelada`: NF-e foi cancelada
- `nfe.denegada`: NF-e foi denegada
- `nfe.rejeitada`: NF-e foi rejeitada

#### KPIs:
- `kpi.critico`: KPI entrou em estado crítico
- `kpi.alerta`: KPI entrou em alerta
- `kpi.meta_atingida`: Meta foi atingida

#### APIs:
- `api.down`: API externa ficou offline
- `api.recovered`: API externa voltou online
- `api.high_error_rate`: Alta taxa de erro detectada

### Payload do Webhook:

```json
{
  "event": "nfe.autorizada",
  "timestamp": "2025-10-20T14:30:00Z",
  "data": {
    "nfe_id": "uuid",
    "numero": "000123",
    "chave_acesso": "35251012345678000190550010001234561234567890",
    "valor_total": 10000.00,
    "cliente": {
      "cnpj": "12345678000190",
      "razao_social": "Hospital XYZ"
    }
  },
  "signature": "sha256=abc123..."
}
```

### Verificação de Signature:

```typescript
import crypto from 'crypto';

function verificarWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## 📊 Estatísticas do Módulo

- **Component React**: ~850 linhas
- **Integrações Gerenciadas**: 7
- **Abas**: 5
- **Tipos de Alertas**: 5
- **Eventos de Webhook**: 10+

## 🎯 Benefícios

### Para TI:
- ✅ Visibilidade completa de integrações
- ✅ Diagnóstico rápido de problemas
- ✅ Gestão centralizada de credenciais
- ✅ Logs detalhados para troubleshooting

### Para Operações:
- ✅ Alertas proativos de downtime
- ✅ Webhooks para automação
- ✅ Histórico de SLA

### Para Compliance:
- ✅ Auditoria de todas as chamadas
- ✅ Rastreabilidade de configurações
- ✅ Logs exportáveis

## 🚀 Próximos Passos

Com o Integrations Manager implementado, o BLOCO 2 está completo! O sistema agora possui:

1. **BLOCO 1**: Core Críticos (NF-e, RBAC, API Gateway)
2. **BLOCO 2**: Analytics & Dashboards (BI, KPIs, Integrations Manager)
3. **Próximo**: BLOCO 3 (Gestão) - Relatórios, Contábil, Licitações, Workflows

## 📝 Notas Importantes

### Retry Policy:
- 1ª tentativa: imediato
- 2ª tentativa: 1 segundo depois
- 3ª tentativa: 2 segundos depois
- 4ª tentativa: 4 segundos depois (exponencial backoff)

### Circuit Breaker:
- **Threshold**: 5 falhas consecutivas
- **Timeout**: 60 segundos antes de tentar reabrir
- **Half-Open**: Testa com 1 requisição antes de reabrir completamente

### Cache:
- **ViaCEP**: 30 dias (endereços não mudam)
- **CNPJ/CPF**: 24 horas
- **CRM**: 24 horas
- **ANVISA Registro**: 1 hora
- **NF-e Consulta**: 5 minutos

---

## 🎉 Conclusão

O **Integrations Manager** transforma o ICARUS em um hub de integrações robusto, com visibilidade, automação e segurança de nível enterprise.

**Status**: ✅ 100% COMPLETO  
**Versão**: 1.0  
**Data**: Outubro 2025

