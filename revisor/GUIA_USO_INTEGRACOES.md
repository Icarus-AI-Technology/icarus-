# 📚 GUIA DE USO - INTEGRAÇÕES ICARUS v5.0

**Versão**: 5.0.2  
**Data**: 20 de outubro de 2025  
**Status**: Production Ready

---

## 📑 ÍNDICE

1. [Comunicação](#1-comunicação)
   - [Twilio (SMS)](#11-twilio-sms)
   - [WhatsApp Business](#12-whatsapp-business)
   - [SendGrid (Email)](#13-sendgrid-email)
   - [Mailchimp](#14-mailchimp)
2. [Rastreabilidade OPME](#2-rastreabilidade-opme)
   - [Abbott Track&Trace](#21-abbott-tracktrace)
   - [Medtronic VISION](#22-medtronic-vision)
   - [J&J TraceLink](#23-jj-tracelink)
   - [Stryker Connect](#24-stryker-connect)
   - [Boston Scientific iTrace](#25-boston-scientific-itrace)
3. [Agentes IA](#3-agentes-ia)
   - [Compliance AI](#31-compliance-ai)
   - [Documentação AI](#32-documentação-ai)
   - [Auditoria AI](#33-auditoria-ai)
   - [Treinamento AI](#34-treinamento-ai)
   - [Risco AI](#35-risco-ai)
   - [Viabilidade AI](#36-viabilidade-ai)
4. [Configuração](#4-configuração)
5. [Exemplos Práticos](#5-exemplos-práticos)

---

## 1. 📱 COMUNICAÇÃO

### 1.1. Twilio (SMS)

#### Configuração
```bash
# .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+5511999999999
```

#### Uso Básico
```typescript
import { CommunicationService } from '@/lib/services/CommunicationService';

// Enviar SMS
const result = await CommunicationService.sendSMS({
  to: '+5511988887777',
  message: 'Sua cirurgia foi agendada para 25/10/2025 às 14h'
});

if (result.success) {
  console.log('SMS enviado! ID:', result.messageId);
} else {
  console.error('Erro:', result.error);
}
```

#### Casos de Uso
- ✅ Confirmação de agendamentos
- ✅ Alertas urgentes
- ✅ Lembretes de consultas
- ✅ Notificações de resultados
- ✅ Códigos de verificação (2FA)

---

### 1.2. WhatsApp Business

#### Configuração
```bash
# .env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Uso com Template
```typescript
// Template aprovado no Meta Business
const result = await CommunicationService.sendWhatsApp({
  to: '+5511988887777',
  template: 'agendamento_cirurgia',
  templateParams: {
    nome: 'João Silva',
    data: '25/10/2025',
    hora: '14h',
    hospital: 'Hospital São Lucas'
  }
});
```

#### Uso com Mensagem Livre
```typescript
// Apenas para janelas de 24h após interação do usuário
const result = await CommunicationService.sendWhatsApp({
  to: '+5511988887777',
  message: 'Olá! Seu resultado já está disponível no sistema.'
});
```

#### Templates Recomendados
```
// agendamento_cirurgia
Olá {{1}}! Sua cirurgia foi agendada para {{2}} às {{3}} no {{4}}.

// lembrete_consulta
{{1}}, lembre-se: consulta amanhã às {{2}}. Local: {{3}}.

// resultado_disponivel
{{1}}, seu resultado de {{2}} já está disponível no portal.
```

---

### 1.3. SendGrid (Email)

#### Configuração
```bash
# .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@icarus.com.br
```

#### Email HTML
```typescript
const result = await CommunicationService.sendEmail({
  to: 'paciente@email.com',
  subject: 'Confirmação de Cirurgia - Hospital São Lucas',
  html: `
    <h1>Cirurgia Confirmada</h1>
    <p>Prezado(a) João Silva,</p>
    <p>Sua cirurgia foi confirmada para <strong>25/10/2025 às 14h</strong>.</p>
    <h2>Orientações Pré-Operatórias:</h2>
    <ul>
      <li>Jejum de 8 horas</li>
      <li>Chegar 1 hora antes</li>
      <li>Trazer documentos e exames</li>
    </ul>
  `,
  text: 'Sua cirurgia foi confirmada para 25/10/2025 às 14h.'
});
```

#### Email com Anexos
```typescript
const result = await CommunicationService.sendEmail({
  to: 'paciente@email.com',
  subject: 'Termo de Consentimento',
  html: '<p>Segue anexo o termo de consentimento para assinatura.</p>',
  attachments: [
    {
      filename: 'termo_consentimento.pdf',
      content: base64PdfContent,
      type: 'application/pdf'
    }
  ]
});
```

---

### 1.4. Mailchimp

#### Configuração
```bash
# .env
MAILCHIMP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1
MAILCHIMP_DC=us1
```

#### Criar e Enviar Campanha
```typescript
const result = await CommunicationService.sendCampaign({
  listId: 'abc123def456',
  subject: 'Novidades do Mês - ICARUS Saúde',
  fromName: 'ICARUS Saúde',
  replyTo: 'contato@icarus.com.br',
  htmlContent: `
    <html>
      <body>
        <h1>Confira as Novidades</h1>
        <p>Novas funcionalidades disponíveis...</p>
      </body>
    </html>
  `,
  schedule: '2025-10-25T10:00:00Z' // Opcional
});
```

---

## 2. 🏥 RASTREABILIDADE OPME

### 2.1. Abbott Track&Trace

#### Configuração
```bash
# .env
ABBOTT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Rastrear Dispositivo
```typescript
import { OPMETraceabilityService } from '@/lib/services/OPMETraceabilityService';

const result = await OPMETraceabilityService.trackAbbott('SN123456789');

if (result.verified) {
  console.log('Dispositivo verificado!');
  console.log('Produto:', result.deviceInfo?.productName);
  console.log('Validade:', result.deviceInfo?.expirationDate);
  console.log('Status:', result.deviceInfo?.status);
  
  if (result.deviceInfo?.recallInfo?.isRecalled) {
    console.warn('ATENÇÃO: Dispositivo em recall!');
    console.log('Motivo:', result.deviceInfo.recallInfo.recallReason);
  }
}
```

---

### 2.2. Medtronic VISION

#### Configuração
```bash
# .env
MEDTRONIC_CLIENT_ID=your_client_id
MEDTRONIC_CLIENT_SECRET=your_client_secret
```

#### Verificar Dispositivo
```typescript
const result = await OPMETraceabilityService.verifyMedtronic(
  'SN987654321',
  'LOT2024-001' // Opcional
);

if (result.verified) {
  console.log('Válido!');
  console.log('Certificações:', result.deviceInfo?.certifications);
}
```

---

### 2.3. J&J TraceLink

#### Verificar por GTIN + Serial
```typescript
const result = await OPMETraceabilityService.queryJJ(
  '00012345678905', // GTIN
  'SN555444333'     // Serial Number
);
```

---

### 2.4. Stryker Connect

#### Lookup por Device ID
```typescript
const result = await OPMETraceabilityService.lookupStryker('DEV-12345');
```

---

### 2.5. Boston Scientific iTrace

#### Verificar Dispositivo
```typescript
const result = await OPMETraceabilityService.verifyBostonScientific(
  'SN777888999',
  'LOT2024-05'
);
```

---

### Verificação Automática (Qualquer Fabricante)

```typescript
const result = await OPMETraceabilityService.verifyDevice({
  serialNumber: 'SN123456',
  manufacturer: 'abbott', // ou 'medtronic', 'jj', 'stryker', 'boston_scientific'
  lotNumber: 'LOT123',
  gtin: '00012345678905' // Obrigatório para J&J
});
```

---

### Verificação em Lote

```typescript
const devices = [
  { serialNumber: 'SN001', manufacturer: 'abbott' },
  { serialNumber: 'SN002', manufacturer: 'medtronic' },
  { serialNumber: 'SN003', manufacturer: 'jj', gtin: '00012345678905' }
];

const results = await OPMETraceabilityService.verifyMultipleDevices(devices);

results.forEach((result, index) => {
  console.log(`Dispositivo ${index + 1}:`, result.verified ? '✅' : '❌');
});
```

---

### Verificar Recall

```typescript
const recallStatus = await OPMETraceabilityService.checkRecallStatus({
  serialNumber: 'SN123456',
  manufacturer: 'abbott'
});

if (recallStatus.isRecalled) {
  alert(`⚠️ DISPOSITIVO EM RECALL!\n${recallStatus.recallInfo?.reason}`);
}
```

---

## 3. 🤖 AGENTES IA

### 3.1. Compliance AI

#### Verificar Conformidade
```typescript
import { ComplianceAI } from '@/lib/services/ai/ComplianceAI';

const result = await ComplianceAI.checkCompliance({
  tipo: 'anvisa',
  entidade: 'produto',
  dados: {
    codigo_anvisa: '80123456789',
    nome_produto: 'Prótese Cardíaca XYZ',
    fabricante: 'Abbott',
    validade: '2025-12-31'
  }
});

console.log('Score:', result.score);
console.log('Conforme:', result.conforme);

if (result.naoConformidades.length > 0) {
  result.naoConformidades.forEach(nc => {
    console.log(`- ${nc.descricao} (${nc.severidade})`);
    console.log(`  Sugestão: ${nc.sugestaoCorrecao}`);
  });
}
```

#### Monitorar Compliance
```typescript
const status = await ComplianceAI.monitorCompliance('empresa-123');

console.log('Score Geral:', status.score);
console.log('Status:', status.statusGeral);

status.areas.forEach(area => {
  console.log(`${area.area}: ${area.score}% - ${area.alertas} alertas`);
});
```

---

### 3.2. Documentação AI

```typescript
import { DocumentacaoAI } from '@/lib/services/ai/DocumentacaoAI';

const doc = await DocumentacaoAI.generateDocumentation({
  tipo: 'procedimento',
  dados: {
    nome: 'Implante de Prótese Cardíaca',
    etapas: [/* ... */],
    materiais: [/* ... */]
  }
});

console.log('Documentação gerada:');
console.log(doc.conteudo);
```

---

### 3.3. Auditoria AI

```typescript
import { AuditoriaAI } from '@/lib/services/ai/AuditoriaAI';

const riscos = await AuditoriaAI.predictAuditRisks('empresa-123');

console.log('Score de Risco:', riscos.score);

riscos.riscos.forEach(risco => {
  console.log(`⚠️ ${risco.area}: ${risco.descricao}`);
  console.log(`   Ação preventiva: ${risco.acaoPreventiva}`);
});
```

---

### 3.4. Treinamento AI

```typescript
import { TreinamentoAI } from '@/lib/services/ai/TreinamentoAI';

const plano = await TreinamentoAI.createTrainingPlan({
  colaboradorId: 'user-123',
  cargo: 'Técnico de Qualidade',
  nivelAtual: 'Intermediário',
  objetivos: [
    'Dominar rastreabilidade OPME',
    'Certificação ANVISA'
  ]
});

console.log('Duração:', plano.plano.duracao, 'dias');
plano.plano.modulos.forEach(modulo => {
  console.log(`- ${modulo.nome} (${modulo.duracao}h)`);
});
```

---

### 3.5. Risco AI

```typescript
import { RiscoAI } from '@/lib/services/ai/RiscoAI';

const analise = await RiscoAI.analyzeRisks({
  tipo: 'operacional',
  entidade: 'processo_rastreabilidade',
  dados: { /* ... */ }
});

console.log('Score Geral:', analise.scoreGeral);
console.log('Classificação:', analise.classificacao);

analise.riscos.forEach(risco => {
  console.log(`${risco.codigo}: ${risco.descricao}`);
  console.log(`Probabilidade: ${risco.probabilidade * 100}%`);
  console.log(`Impacto: ${risco.impacto * 100}%`);
  console.log(`Mitigação: ${risco.mitigacao}`);
});
```

---

### 3.6. Viabilidade AI

```typescript
import { ViabilidadeAI } from '@/lib/services/ai/ViabilidadeAI';

const viabilidade = await ViabilidadeAI.analyzeImportViability({
  produto: {
    nome: 'Prótese Cardíaca Premium',
    descricao: 'Dispositivo médico classe III',
    codigoHs: '9021.39.19',
    valorFob: 50000,
    peso: 2.5,
    fabricante: 'Abbott',
    paisOrigem: 'USA'
  },
  fornecedor: {
    nome: 'Abbott USA',
    pais: 'USA',
    incoterm: 'FOB'
  },
  destino: {
    porto: 'Santos',
    cidade: 'São Paulo',
    estado: 'SP'
  }
});

console.log('Viável:', viabilidade.viavel ? 'SIM' : 'NÃO');
console.log('Score:', viabilidade.scoreViabilidade);
console.log('Custo Total: R$', viabilidade.custoTotal.total.toLocaleString());
console.log('Prazo Total:', viabilidade.prazo.total, 'dias');

console.log('\nTributos:');
console.log('- II: R$', viabilidade.custoTotal.tributos.ii.toLocaleString());
console.log('- IPI: R$', viabilidade.custoTotal.tributos.ipi.toLocaleString());
console.log('- PIS: R$', viabilidade.custoTotal.tributos.pis.toLocaleString());
console.log('- COFINS: R$', viabilidade.custoTotal.tributos.cofins.toLocaleString());
console.log('- ICMS: R$', viabilidade.custoTotal.tributos.icms.toLocaleString());

console.log('\nRecomendações:');
viabilidade.recomendacoes.forEach(rec => console.log(`- ${rec}`));
```

---

## 4. ⚙️ CONFIGURAÇÃO

### 4.1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com todas as credenciais:

```bash
# === COMUNICAÇÃO ===
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+5511999999999

WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@icarus.com.br

MAILCHIMP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1
MAILCHIMP_DC=us1

# === FABRICANTES OPME ===
ABBOTT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

MEDTRONIC_CLIENT_ID=your_client_id
MEDTRONIC_CLIENT_SECRET=your_client_secret

JJ_TRACELINK_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

STRYKER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

BOSTON_SCIENTIFIC_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.2. Executar Migração Supabase

```bash
npx supabase db push
```

---

## 5. 💡 EXEMPLOS PRÁTICOS

### Exemplo 1: Notificação de Cirurgia

```typescript
// 1. Enviar SMS de confirmação
await CommunicationService.sendSMS({
  to: paciente.celular,
  message: `Olá ${paciente.nome}! Sua cirurgia foi confirmada para ${data} às ${hora}.`
});

// 2. Enviar WhatsApp com detalhes
await CommunicationService.sendWhatsApp({
  to: paciente.celular,
  template: 'confirmacao_cirurgia',
  templateParams: {
    nome: paciente.nome,
    data,
    hora,
    hospital: cirurgia.hospital,
    medico: cirurgia.medico
  }
});

// 3. Enviar email com orientações completas
await CommunicationService.sendEmail({
  to: paciente.email,
  subject: 'Confirmação de Cirurgia',
  html: templateEmailCirurgia,
  attachments: [
    {
      filename: 'orientacoes_pre_operatorias.pdf',
      content: pdfBase64,
      type: 'application/pdf'
    }
  ]
});
```

### Exemplo 2: Entrada de Material OPME

```typescript
// 1. Verificar rastreabilidade
const traceResult = await OPMETraceabilityService.verifyDevice({
  serialNumber: dispositivo.serial,
  manufacturer: dispositivo.fabricante,
  lotNumber: dispositivo.lote
});

if (!traceResult.verified) {
  throw new Error('Dispositivo não verificado!');
}

// 2. Verificar recall
const recallStatus = await OPMETraceabilityService.checkRecallStatus({
  serialNumber: dispositivo.serial,
  manufacturer: dispositivo.fabricante
});

if (recallStatus.isRecalled) {
  await CommunicationService.sendNotification({
    phone: responsavel.telefone,
    message: `⚠️ ALERTA: Dispositivo ${dispositivo.serial} está em recall!`
  });
  throw new Error('Dispositivo em recall!');
}

// 3. Verificar compliance
const complianceResult = await ComplianceAI.checkCompliance({
  tipo: 'anvisa',
  entidade: 'produto',
  dados: traceResult.deviceInfo
});

// 4. Registrar entrada
if (complianceResult.conforme && traceResult.verified) {
  await registrarEntradaEstoque(dispositivo);
}
```

### Exemplo 3: Análise de Importação

```typescript
// Analisar viabilidade
const viabilidade = await ViabilidadeAI.analyzeImportViability({
  produto: produtoImportar,
  fornecedor: fornecedorSelecionado,
  destino: {
    porto: 'Santos',
    cidade: 'São Paulo',
    estado: 'SP'
  }
});

if (viabilidade.viavel && viabilidade.scoreViabilidade >= 70) {
  // Enviar proposta ao diretor
  await CommunicationService.sendEmail({
    to: 'diretor@empresa.com',
    subject: 'Proposta de Importação',
    html: gerarRelatorioViabilidade(viabilidade)
  });
} else {
  console.log('Importação não viável. Considerar alternativas.');
}
```

---

## 📞 SUPORTE

Para dúvidas ou problemas:
- Email: suporte@icarus.com.br
- Documentação: https://docs.icarus.com.br
- GitHub: https://github.com/icarus/icarus-v5

---

**Versão**: 5.0.2  
**Última Atualização**: 20/10/2025

