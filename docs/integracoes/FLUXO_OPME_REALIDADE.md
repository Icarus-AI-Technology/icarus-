# Fluxo Real de uma Distribuidora OPME - Contexto Microsoft 365

## 🏥 O QUE É UMA DISTRIBUIDORA OPME?

Distribuidora de **OPME (Órteses, Próteses e Materiais Especiais)** é uma empresa que:
- **Compra** produtos médicos de **indústrias/fabricantes**
- **Distribui** esses produtos para **hospitais** conforme **pedidos médicos**
- **Fatura** para **planos de saúde** (fonte pagadora)

**NÃO É** uma clínica ou hospital. É um **intermediário logístico especializado** com conformidade ANVISA.

## 🔄 FLUXO COMPLETO DE UMA OPERAÇÃO OPME

### PASSO 1: Pedido Médico (Origem)
```
👨‍⚕️ Médico no Hospital
    ↓
Prescreve cirurgia que requer OPME
(Ex: Prótese de quadril, parafusos ortopédicos, stent cardíaco)
    ↓
Hospital solicita à Distribuidora credenciada
    ↓
🏥 REUNIÃO TEAMS: Confirmar disponibilidade, prazo, especificações técnicas
```

### PASSO 2: Autorização do Plano de Saúde
```
Hospital envia documentação → Plano de Saúde
    ↓
Plano analisa necessidade médica
    ↓
Plano AUTORIZA fornecimento (ou nega)
    ↓
💚 REUNIÃO TEAMS: Distribuidora pode precisar esclarecer dúvidas sobre o OPME
```

### PASSO 3: Fornecimento ao Hospital
```
🚚 Distribuidora separa OPME do estoque
    ↓
Valida: Registro ANVISA, Lote, Validade, Rastreabilidade (RDC 16/2013)
    ↓
Entrega no Hospital
    ↓
Hospital confirma recebimento
    ↓
Cirurgia realizada
```

### PASSO 4: Faturamento
```
📄 Distribuidora emite NF-e PARA:
    ↓
    ├─→ Hospital (destinatário físico)
    └─→ Plano de Saúde (pagador)
    ↓
SEFAZ autoriza NF-e
    ↓
📧 EMAIL OUTLOOK: XML + DANFE enviados automaticamente
    ↓
Hospital: Confirma recebimento fiscal
Plano: Audita valores e produtos
```

### PASSO 5: Pagamento (Plano → Distribuidora)
```
💰 Plano de Saúde:
    ↓
Audita NF-e vs. Autorização Prévia
    ↓
Aprova pagamento (ou glosa parcial)
    ↓
Paga Distribuidora (30-90 dias)
    ↓
💚 REUNIÃO TEAMS (se glosa): Negociar divergências
```

### PASSO 6: Reposição de Estoque
```
📦 Estoque da Distribuidora baixo
    ↓
Sistema ICARUS alerta via EMAIL OUTLOOK
    ↓
🏭 REUNIÃO TEAMS com Indústria
    ↓
Negociar: Preço, Prazo, Quantidade, Lotes, Validade
    ↓
Distribuidora compra da Indústria
    ↓
Indústria entrega → Distribuidora recebe
```

## 🎯 ONDE O MICROSOFT 365 ENTRA?

### 1. REUNIÕES TEAMS

#### Com HOSPITAIS 🏥
**Momento**: Antes do fornecimento ou pós-venda
**Objetivo**:
- Confirmar especificações técnicas do OPME solicitado
- Apresentar alternativas (se produto indisponível)
- Treinamento de equipe cirúrgica (produtos novos)
- Follow-up pós-cirurgia (satisfação, qualidade)
- Licitações e contratos anuais

**Exemplo Real**:
> *"Hospital XYZ solicitou prótese de fêmur, mas o modelo exato está em falta. Distribuidora agenda reunião Teams para apresentar modelo equivalente certificado ANVISA."*

#### Com PLANOS DE SAÚDE 💚
**Momento**: Credenciamento inicial ou renovação de tabela
**Objetivo**:
- **Credenciamento**: Habilitar distribuidora para fornecimento
- **Negociação de Tabela**: Plano define quanto pagará por cada OPME
- **Auditoria**: Resolver glosas (pagamentos negados)
- **Conformidade**: Demonstrar rastreabilidade ANVISA

**Exemplo Real**:
> *"Unimed São Paulo precisa credenciar nova distribuidora para atender região sul. Reunião Teams para apresentar documentação, certificados ANVISA e proposta comercial."*

#### Com INDÚSTRIAS 🏭
**Momento**: Negociação de contratos de compra
**Objetivo**:
- Negociar preços de compra (margem da distribuidora)
- Fechar contratos de distribuição exclusiva
- Conhecer novas linhas de produtos
- Treinamento técnico sobre dispositivos complexos
- Resolver problemas de qualidade/não conformidade

**Exemplo Real**:
> *"Distribuidora está expandindo portfólio e agenda reunião Teams com Medtronic para negociar distribuição exclusiva de marca-passos na região nordeste."*

### 2. EMAIL OUTLOOK AUTOMÁTICO

#### NF-e para Hospital + Plano de Saúde
```typescript
await Microsoft365Integration.email.enviarNFeEmail(
  'financeiro@hospitalabc.com', // Hospital (destinatário físico)
  123456, // Número da NF-e
  'https://storage.supabase.com/danfe/123456.pdf',
  'https://storage.supabase.com/xml/123456.xml'
);

// Enviar cópia para Plano de Saúde (pagador)
await Microsoft365Integration.email.enviarEmail({
  para: ['auditoria@unimed.com.br'],
  cc: ['financeiro@hospitalabc.com'],
  assunto: 'NF-e 123456 - OPME Cirurgia Ortopédica',
  corpo_html: `
    <h3>Faturamento OPME</h3>
    <p>Paciente: João Silva</p>
    <p>Cirurgia: Artroplastia de Quadril</p>
    <p>Valor Total: R$ 15.000,00</p>
    <p>Registro ANVISA: 12345678901234</p>
  `,
});
```

#### Alerta de Estoque Crítico
```typescript
// Sistema ICARUS detecta estoque baixo
await Microsoft365Integration.email.enviarEmail({
  para: ['vendas@medtronic.com'],
  assunto: '🚨 Alerta: Estoque Crítico - Stent Cardíaco',
  corpo_html: `
    <h3>Reposição Urgente</h3>
    <p><strong>Produto:</strong> Stent Cardíaco XYZ</p>
    <p><strong>Estoque Atual:</strong> 5 unidades</p>
    <p><strong>Demanda Mensal:</strong> 30 unidades</p>
    <p><strong>Cirurgias Agendadas:</strong> 8 (próximos 7 dias)</p>
    <p>Solicito reunião Teams para negociar pedido de reposição.</p>
  `,
  importancia: 'high',
});
```

### 3. ONEDRIVE/SHAREPOINT

#### Backup de XMLs de NF-e (Conformidade ANVISA)
```typescript
// Backup automático após emissão
const xmlBuffer = await fetch('/nfe/123456.xml').then(r => r.arrayBuffer());
await Microsoft365Integration.onedrive.uploadArquivo(
  'NFe_123456_20251020.xml',
  xmlBuffer,
  'ICARUS/NF-es/2025/Outubro'
);
```

#### Compartilhamento de Documentos de Licitação
```typescript
// Hospital abre licitação, distribuidora envia proposta
const propostaBuffer = await gerarPropostaLicitacao(licitacaoId);
const resultado = await Microsoft365Integration.onedrive.uploadArquivo(
  'Proposta_Licitacao_Hospital_ABC.pdf',
  propostaBuffer,
  'ICARUS/Licitacoes/2025'
);

const linkPublico = await Microsoft365Integration.onedrive.criarLinkCompartilhamento(
  resultado.id
);

await Microsoft365Integration.email.enviarEmail({
  para: ['licitacoes@hospitalabc.com'],
  assunto: 'Proposta Comercial - Licitação 2025/001',
  corpo: `Segue proposta em anexo: ${linkPublico}`,
});
```

### 4. OUTLOOK CALENDAR (Sincronização)

Todas as reuniões criadas no ICARUS são **automaticamente sincronizadas** com o Outlook Calendar da equipe, garantindo que:
- Vendedores tenham visibilidade de todas as reuniões
- Lembretes sejam enviados automaticamente
- Reuniões recorrentes (ex: follow-up mensal com hospitais) sejam agendadas

## 📊 MÉTRICAS REAIS DE UMA DISTRIBUIDORA OPME

### KPIs Típicos
- **Hospitais Atendidos**: 50-200
- **Planos Credenciados**: 10-30
- **Fornecedores (Indústrias)**: 15-50
- **Pedidos Médicos/Mês**: 200-1.000
- **NF-es Emitidas/Mês**: 200-1.000
- **Valor Médio NF-e**: R$ 5.000 - R$ 50.000
- **Prazo Médio Pagamento**: 30-90 dias
- **Taxa de Glosa**: 5-15% (pagamentos negados por planos)

### Reuniões Típicas/Mês (por tipo)
- 🏥 **Hospitais**: 20-50 reuniões (apresentações, follow-up)
- 💚 **Planos de Saúde**: 5-15 reuniões (credenciamento, glosas)
- 🏭 **Indústrias**: 10-20 reuniões (negociação, reposição)

## 🎯 BENEFÍCIOS DA INTEGRAÇÃO MICROSOFT 365

### Para a Equipe Comercial
✅ **Agilidade**: Agendar reunião Teams em 2 cliques
✅ **Organização**: Todas as reuniões sincronizadas no Outlook
✅ **Contexto**: Saber se reunião é com Hospital/Plano/Indústria
✅ **Histórico**: Consultar reuniões passadas com cada entidade

### Para o Financeiro
✅ **Automação**: NF-e enviada automaticamente por email
✅ **Rastreabilidade**: Backup automático de XMLs no OneDrive
✅ **Compliance**: Logs de envios (LGPD Art. 37)

### Para a Logística
✅ **Alertas**: Email automático quando estoque crítico
✅ **Comunicação Rápida**: Solicitar reposição à indústria via email

### Para a Gestão
✅ **Visibilidade**: Dashboard de reuniões por entidade
✅ **Análise**: Quantas reuniões com hospitais vs. planos vs. indústrias
✅ **Estratégia**: Identificar oportunidades de credenciamento

## 🚨 COMPLIANCE ANVISA + LGPD

A integração Microsoft 365 no ICARUS respeita:

### ANVISA RDC 16/2013 (Boas Práticas de Distribuição)
✅ Rastreabilidade: Backup de XMLs de NF-e no OneDrive
✅ Registros: Logs de comunicação com hospitais e planos

### LGPD Art. 37 (Registro de Operações)
✅ Tabela `emails_enviados`: Log de todos os emails
✅ Tabela `reunioes_teams`: Histórico de reuniões com entidades
✅ RLS: Usuários só acessam seus próprios dados

## 📚 REFERÊNCIAS

- [ANVISA RDC 16/2013 - Boas Práticas de Distribuição](https://www.gov.br/anvisa/pt-br)
- [SEFAZ - Nota Fiscal Eletrônica](https://www.nfe.fazenda.gov.br/)
- [LGPD - Lei Geral de Proteção de Dados](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

**🎉 Com a integração Microsoft 365, a distribuidora OPME reduz em até 40% o tempo gasto em comunicação e aumenta a conformidade regulatória!**

