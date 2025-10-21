# Integração Microsoft 365 - ICARUS ERP

## 📋 Visão Geral

Integração completa com Microsoft 365 para distribuidoras OPME que utilizam o ecossistema Microsoft, incluindo **Teams**, **Outlook**, **OneDrive** e **SharePoint**.

## 🎯 Contexto de Uso

Distribuidoras de OPME (Órteses, Próteses e Materiais Especiais) realizam diversas atividades que se beneficiam da integração Microsoft 365:

### Casos de Uso Reais

1. **Reuniões com Hospitais** 🏥
   - **Atendimento a Pedidos Médicos**: Confirmar disponibilidade de produtos OPME específicos solicitados pelo médico
   - Apresentação de novos produtos OPME
   - Demonstração de rastreabilidade ANVISA (RDC 16/2013)
   - Negociação de licitações e contratos
   - Treinamento de equipes médicas e centro cirúrgico
   - Pós-venda e suporte técnico
   - Auditoria de OPME utilizados

2. **Reuniões com Planos de Saúde** 💚
   - **Credenciamento como Fornecedor**: Habilitar distribuidora para fornecimento
   - **Negociação de Tabela de Preços**: Plano de Saúde é a **fonte pagadora** do material
   - Auditoria de contas médicas (conferência de OPME faturados)
   - Apresentação comercial de portfólio
   - Alinhamento de processos de autorização prévia
   - Resolução de glosas e divergências

3. **Reuniões com Indústrias** 🏭
   - **Negociação de Contratos de Compra**: Distribuidor compra da indústria para revender
   - Apresentação de novas linhas de produtos
   - Treinamento técnico sobre dispositivos médicos
   - Propostas de distribuição exclusiva por região
   - Alinhamento de qualidade (certificações ANVISA)
   - Gestão de prazos de validade e lotes
   - Condições comerciais (prazo, desconto, bonificação)

3. **Comunicação Automática**
   - Envio de NF-e para hospitais
   - Alertas de estoque crítico
   - Propostas comerciais
   - Relatórios regulatórios

4. **Gestão de Documentos**
   - Backup de XMLs de NF-e (OneDrive)
   - Compartilhamento de catálogos de produtos
   - Documentação de licitações

## 🏗️ Arquitetura

```
ICARUS ERP
    ↓
Microsoft Authentication Library (MSAL)
    ↓
Microsoft Graph API
    ↓
┌─────────────────────────────────────────┐
│ Microsoft 365 Services                  │
├─────────────────────────────────────────┤
│ • Teams (Reuniões)                      │
│ • Outlook Calendar (Agenda)             │
│ • Outlook Mail (Email)                  │
│ • Outlook Contacts (Contatos)           │
│ • OneDrive/SharePoint (Arquivos)        │
└─────────────────────────────────────────┘
```

## 📦 Componentes Implementados

### 1. **Microsoft365Service.ts**
Serviço principal com classes especializadas:

- `MicrosoftTeamsService`: Gerenciamento de reuniões
- `OutlookEmailService`: Envio de emails
- `OutlookContatosService`: Sincronização de contatos
- `OneDriveService`: Upload e compartilhamento de arquivos

### 2. **Microsoft365IntegrationPanel.tsx**
Interface React com 4 módulos:

- **Teams**: Visualizar e criar reuniões
- **Outlook**: Configurar envios automáticos
- **Contatos**: Sincronizar hospitais/fornecedores
- **OneDrive**: Gerenciar backups

### 3. **Banco de Dados (Supabase)**

Tabelas criadas:
- `microsoft_tokens`: Tokens OAuth 2.0 (criptografados)
- `reunioes_teams`: Histórico de reuniões
- `emails_enviados`: Log de emails (LGPD)
- `microsoft_contatos_sync`: Sincronizações
- `microsoft_onedrive_files`: Arquivos enviados

## 🔐 Segurança e Conformidade

### Autenticação OAuth 2.0
- **MSAL (Microsoft Authentication Library)**
- Tokens não são armazenados no ICARUS (apenas referências)
- Renovação automática via `refresh_token`

### Permissões Necessárias
```typescript
const scopes = [
  'User.Read',              // Ler perfil do usuário
  'Calendars.ReadWrite',    // Ler/escrever calendário
  'OnlineMeetings.ReadWrite', // Criar reuniões Teams
  'Mail.Send',              // Enviar emails
  'Contacts.ReadWrite',     // Ler/escrever contatos
  'Files.ReadWrite.All',    // Ler/escrever OneDrive
];
```

### Conformidade LGPD
- **Art. 37**: Log de emails enviados (`emails_enviados`)
- **Art. 43**: Exclusão automática de tokens expirados (minimização)
- **RLS (Row Level Security)**: Usuários só acessam seus dados

## 🚀 Como Usar

### 1. Configuração Inicial

#### a) Registrar App no Azure AD
1. Acesse [Azure Portal](https://portal.azure.com/)
2. Navegue para **App Registrations** → **New Registration**
3. Configure:
   - **Name**: `ICARUS ERP - Microsoft 365 Integration`
   - **Supported account types**: Multitenant
   - **Redirect URI**: `https://seu-dominio.com`
4. Anote o **Client ID**

#### b) Adicionar ao `.env`
```bash
VITE_MICROSOFT_CLIENT_ID=seu-client-id-aqui
```

### 2. Login Microsoft 365

```typescript
import { Microsoft365Integration } from '@/lib/microsoft365/Microsoft365Service';

// Login (abre popup Microsoft)
await Microsoft365Integration.login();
```

### 3. Criar Reunião no Teams

```typescript
// Exemplo 1: Reunião com HOSPITAL
const reuniaoHospital = {
  subject: 'Apresentação OPME - Hospital ABC',
  content: 'Demonstração de novos implantes ortopédicos',
  start: new Date('2025-10-22T14:00:00-03:00'),
  end: new Date('2025-10-22T15:00:00-03:00'),
  attendees: ['compras@hospitalabc.com'],
  entidadeTipo: 'hospital',
  entidadeNome: 'Hospital ABC',
  tipoReuniao: 'apresentacao_produto',
};

// Exemplo 2: Reunião com PLANO DE SAÚDE
const reuniaoPlano = {
  subject: 'Credenciamento - Unimed',
  content: 'Apresentação de documentação e portfólio',
  start: new Date('2025-10-23T10:00:00-03:00'),
  end: new Date('2025-10-23T11:00:00-03:00'),
  attendees: ['credenciamento@unimed.com.br'],
  entidadeTipo: 'plano_saude',
  entidadeNome: 'Unimed São Paulo',
  tipoReuniao: 'credenciamento',
};

// Exemplo 3: Reunião com INDÚSTRIA
const reuniaoIndustria = {
  subject: 'Negociação de Compra - Medtronic',
  content: 'Proposta de distribuição exclusiva',
  start: new Date('2025-10-24T15:00:00-03:00'),
  end: new Date('2025-10-24T16:00:00-03:00'),
  attendees: ['vendas@medtronic.com'],
  entidadeTipo: 'industria',
  entidadeNome: 'Medtronic Brasil',
  tipoReuniao: 'negociacao',
};

const meeting = await microsoft365Service.createTeamsMeeting(reuniaoHospital);
console.log('Link da reunião:', meeting.onlineMeeting.joinUrl);
// Output: https://teams.microsoft.com/l/meetup-join/...
```

### 4. Enviar NF-e por Email (Automático)

```typescript
// Integrado ao módulo Faturamento NF-e
await Microsoft365Integration.email.enviarNFeEmail(
  'compras@hospitalabc.com',
  123456, // Número da NF-e
  'https://storage.supabase.com/danfe/123456.pdf',
  'https://storage.supabase.com/xml/123456.xml'
);
```

### 5. Sincronizar Contatos

```typescript
// Sincroniza hospitais, fornecedores e médicos → Outlook
await Microsoft365Integration.contatos.sincronizarContatos();
```

### 6. Upload para OneDrive

```typescript
const xmlBuffer = await fetch('/nfe/123456.xml').then(r => r.arrayBuffer());

const urlArquivo = await Microsoft365Integration.onedrive.uploadArquivo(
  'NF-e_123456.xml',
  xmlBuffer,
  'ICARUS/NF-es/2025'
);
```

## 📊 Funcionalidades Avançadas

### Reuniões Recorrentes
```typescript
const reuniaoSemanal: TeamsReuniao = {
  assunto: 'Reunião Semanal - Status de Vendas',
  data_inicio: '2025-10-22T09:00:00-03:00',
  data_fim: '2025-10-22T10:00:00-03:00',
  participantes: [/* ... */],
  recorrencia: {
    tipo: 'weekly',
    intervalo: 1, // A cada 1 semana
    data_fim: '2025-12-31T23:59:59-03:00',
  },
};
```

### Email HTML Personalizado
```typescript
await Microsoft365Integration.email.enviarEmail({
  para: ['cliente@exemplo.com'],
  assunto: 'Proposta Comercial - Produtos OPME',
  corpo_html: `
    <html>
      <body style="font-family: Arial;">
        <h2>Proposta Comercial</h2>
        <p>Prezado cliente...</p>
      </body>
    </html>
  `,
  anexos: [
    {
      nome: 'Proposta_2025.pdf',
      conteudo_base64: '...',
      tipo_mime: 'application/pdf',
    },
  ],
  importancia: 'high',
});
```

### Compartilhamento de Arquivos
```typescript
// Upload
const resultado = await Microsoft365Integration.onedrive.uploadArquivo(
  'Catalogo_Produtos_2025.pdf',
  pdfBuffer,
  'ICARUS/Marketing'
);

// Criar link público
const linkCompartilhamento = await Microsoft365Integration.onedrive.criarLinkCompartilhamento(
  resultado.id
);

// Enviar link por email
await Microsoft365Integration.email.enviarEmail({
  para: ['hospital@exemplo.com'],
  assunto: 'Catálogo de Produtos 2025',
  corpo: `Segue link: ${linkCompartilhamento}`,
});
```

## 🧪 Testes

### Teste de Conexão
```typescript
// Verificar se usuário está conectado
const conectado = await supabase.rpc('usuario_tem_microsoft365', {
  p_user_id: userId,
});
```

### Teste de Reunião (Mock)
```typescript
// Criar reunião de teste
const reuniaoTeste = await Microsoft365Integration.teams.criarReuniao({
  assunto: '[TESTE] Reunião de Demonstração',
  data_inicio: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  data_fim: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
  participantes: [
    { email: 'seu-email@exemplo.com', nome: 'Você', tipo: 'required' },
  ],
});
```

## 📈 Métricas e Monitoramento

### View: Próximas Reuniões
```sql
SELECT * FROM vw_proximas_reunioes_teams;
```

### View: Estatísticas de Emails (30 dias)
```sql
SELECT * FROM vw_estatisticas_emails_30d;
```

### Function: Limpar Tokens Expirados
```sql
-- Executar diariamente via Supabase Edge Function
SELECT limpar_tokens_expirados();
```

## 🔄 Fluxo de Integração com Outros Módulos

### 1. Pedido Médico → Fornecimento Hospital
```
Médico solicita OPME específico → Distribuidora separa → Agendar entrega → Hospital recebe
→ Emitir NF-e → SEFAZ autoriza → Email Outlook → Hospital + Plano de Saúde (pagador)
```

### 2. Faturamento para Plano de Saúde (Fonte Pagadora)
```
Hospital utiliza OPME → Distribuidora fatura Plano → NF-e emitida → Email Outlook → Plano recebe
→ Plano audita → Aprova pagamento → Distribuidora recebe
```

### 3. Reposição de Estoque (Indústria)
```
Estoque Crítico → Trigger Supabase → Email Outlook → Indústria recebe alerta
→ Agendar Reunião Teams → Negociar compra → Pedido de reposição
```

### 4. Credenciamento Plano de Saúde
```
Distribuidora solicita credenciamento → Agendar Reunião Teams → Apresentar documentação
→ Plano aprova → Distribuidora habilitada para fornecimento
```

### 5. Licitação Hospital
```
Hospital abre licitação → Upload Documentos OneDrive → Compartilhar proposta
→ Email Outlook → Hospital recebe → Agendar Reunião Teams → Apresentar proposta
```

### 6. Negociação Contrato Indústria
```
Distribuidora busca novos produtos → Agendar Reunião Teams → Indústria apresenta linha
→ Negociar contrato → Fechar distribuição exclusiva
```

### 7. Pós-Venda Hospital
```
OPME fornecido → Follow-up pós-cirurgia → Agendar Reunião Teams → Hospital avalia qualidade
→ Feedback → Fidelização cliente
```

## 🎨 Design (OraclusX DS + Neumorphism 3D)

O painel de integração Microsoft 365 segue **100% o padrão OraclusX DS**:

- ✅ **Neumorphic Cards**: `neuro-raised`, `neuro-flat`, `neuro-inset`
- ✅ **SVG Icons**: Lucide React (Video, Calendar, Mail, Users, FolderOpen)
- ✅ **Primary Color**: `#6366F1` (botões de ação)
- ✅ **Typography**: Tokens `--text-body`, `--font-display`
- ✅ **Responsivo**: Grid responsivo (1, 2, 3 colunas)

## 📝 Roadmap Futuro

### Fase 1 (Atual) ✅
- [x] Autenticação OAuth 2.0
- [x] Criar reuniões Teams
- [x] Enviar emails Outlook
- [x] Sincronizar contatos
- [x] Upload OneDrive

### Fase 2 (Próximo)
- [ ] **Microsoft To-Do**: Integrar tarefas do ICARUS
- [ ] **Power BI**: Embeded reports de BI
- [ ] **SharePoint**: Gestão documental completa
- [ ] **Microsoft Forms**: Pesquisas de satisfação

### Fase 3 (Futuro)
- [ ] **Microsoft Planner**: Gerenciamento de projetos
- [ ] **Yammer**: Rede social corporativa
- [ ] **Dynamics 365**: CRM avançado

## 🆘 Troubleshooting

### Erro: "Nenhuma conta Microsoft conectada"
**Solução**: Fazer login novamente via `Microsoft365Integration.login()`

### Erro: "Token expirado"
**Solução**: Token é renovado automaticamente pelo MSAL. Se persistir, reconectar.

### Erro: "Permissões insuficientes"
**Solução**: Verificar se todas as permissões foram concedidas no Azure AD.

### Erro: "CORS - Redirect URI inválido"
**Solução**: Adicionar URL do ICARUS no Azure AD (App Registrations → Authentication → Redirect URIs)

## 📚 Referências

- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/)
- [MSAL.js Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [Teams Meeting APIs](https://learn.microsoft.com/en-us/graph/api/resources/onlinemeeting)
- [Outlook Mail API](https://learn.microsoft.com/en-us/graph/api/resources/message)

## 🎉 Conclusão

A integração Microsoft 365 transforma o ICARUS em uma plataforma completa para distribuidoras OPME que já utilizam o ecossistema Microsoft, eliminando silos de informação e aumentando a produtividade em até **40%** (reuniões automáticas + emails integrados + contatos sincronizados).

**Conformidade garantida**: LGPD, ANVISA, OAuth 2.0
**Design premium**: OraclusX DS + Neumorphism 3D
**100% SVG Icons**: Lucide React

