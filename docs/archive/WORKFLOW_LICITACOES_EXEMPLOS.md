# 🎯 WORKFLOW LICITAÇÕES — EXEMPLOS PRÁTICOS

**Sistema**: ICARUS v5.0 — Gestão elevada pela IA  
**Módulo**: Licitações Públicas  
**Data**: 20 de Outubro de 2025

---

## 📋 ÍNDICE

1. [Caso de Uso 1: Pregão Eletrônico](#caso-de-uso-1-pregão-eletrônico)
2. [Caso de Uso 2: Recurso de Impugnação](#caso-de-uso-2-recurso-de-impugnação)
3. [Caso de Uso 3: Vitória e Assinatura](#caso-de-uso-3-vitória-e-assinatura)
4. [Integração com Outros Módulos](#integração-com-outros-módulos)
5. [Dashboards e Relatórios](#dashboards-e-relatórios)

---

## 🏛️ CASO DE USO 1: PREGÃO ELETRÔNICO

### Cenário

Empresa identifica pregão eletrônico do Hospital Municipal para fornecimento de OPME de ortopedia.

### Fluxo Completo

```typescript
import { workflowEngine } from '@/services/workflow';
import type { LicitacaoWorkflowMetadata } from '@/services/workflow/definitions/licitacao.workflow';

// 1. IDENTIFICAR OPORTUNIDADE
const licitacao = await workflowEngine.createInstance(
  'licitacao',
  'pregao-2025-001',
  'licitacao',
  'user-comercial-01',
  'Ana Paula Silva',
  {
    // Dados do Edital
    numeroEdital: 'PE 001/2025',
    modalidade: 'pregao_eletronico',
    orgaoNome: 'Hospital Municipal São João',
    orgaoCNPJ: '12.345.678/0001-90',
    objeto: 'Fornecimento de OPME de Ortopedia para 12 meses',
    valorEstimado: 850000,
    
    // Prazos
    dataPublicacao: new Date('2025-10-15'),
    dataLimiteImpugnacao: new Date('2025-10-22'),
    dataLimiteEsclarecimentos: new Date('2025-10-25'),
    dataLimiteEnvio: new Date('2025-10-30T17:00:00'),
    dataSessao: new Date('2025-11-05T10:00:00'),
    
    // Certidões
    certidoesRegulares: true,
    documentosExigidos: [
      'Certidão Negativa de Débitos Federais',
      'Certidão Negativa Municipal',
      'Certidão ANVISA',
      'Balanço Patrimonial',
      'Atestado de Capacidade Técnica',
    ],
    documentosAnexados: [],
  } as LicitacaoWorkflowMetadata
);

// Notificação automática enviada:
// "Nova oportunidade de licitação: Hospital Municipal São João - 
//  Fornecimento de OPME de Ortopedia. Valor estimado: R$ 850.000"

// 2. ANÁLISE DE VIABILIDADE (3 dias)
const emAnalise = await workflowEngine.transition(
  licitacao,
  'em_analise',
  'user-comercial-01',
  'Ana Paula Silva',
  'iniciar_analise'
);

// Análise realizada:
// ✅ Empresa possui as certidões
// ✅ Possui atestados de capacidade técnica
// ✅ Margem de lucro viável
// ✅ Estoque compatível

// 3. APROVAÇÃO DE PARTICIPAÇÃO
const analiseAprovada = await workflowEngine.transition(
  emAnalise,
  'analise_aprovada',
  'user-gestor-01',
  'Roberto Costa (Gestor Comercial)',
  'aprovar_participacao',
  'Aprovada participação. Margem estimada: 18%'
);

// 4. PREPARAÇÃO DE DOCUMENTAÇÃO (5 dias)
const preparandoDocs = await workflowEngine.transition(
  analiseAprovada,
  'preparando_documentacao',
  'user-documentacao-01',
  'Fernanda Oliveira',
  'iniciar_preparacao'
);

// Anexar documentos
preparandoDocs.metadata.documentosAnexados = [
  {
    tipo: 'Certidão Negativa Federal',
    arquivo: 'certidao_federal_2025.pdf',
    dataAnexo: new Date('2025-10-17'),
  },
  {
    tipo: 'Certidão ANVISA',
    arquivo: 'certidao_anvisa_vigente.pdf',
    dataAnexo: new Date('2025-10-18'),
  },
  {
    tipo: 'Balanço Patrimonial 2024',
    arquivo: 'balanco_2024_auditado.pdf',
    dataAnexo: new Date('2025-10-19'),
  },
  {
    tipo: 'Atestado de Capacidade Técnica',
    arquivo: 'atestado_hospital_xyz.pdf',
    dataAnexo: new Date('2025-10-20'),
  },
  {
    tipo: 'Certidão Municipal',
    arquivo: 'certidao_municipal_2025.pdf',
    dataAnexo: new Date('2025-10-20'),
  },
];

const docsProonta = await workflowEngine.transition(
  preparandoDocs,
  'documentacao_pronta',
  'user-documentacao-01',
  'Fernanda Oliveira',
  'confirmar_documentacao',
  'Todos os 5 documentos exigidos anexados e conferidos'
);

// 5. ELABORAÇÃO DE PROPOSTA COMERCIAL (5 dias)
const preparandoProposta = await workflowEngine.transition(
  docsProonta,
  'preparando_proposta',
  'user-comercial-02',
  'Carlos Mendes (Pricing)',
  'iniciar_proposta'
);

// Calcular custos e margem
preparandoProposta.metadata.valorProposta = 780000; // 18% de margem
preparandoProposta.metadata.planilhaCustos = 'planilha_custos_pregao_001_2025.xlsx';
preparandoProposta.metadata.prazoExecucao = '12 meses';
preparandoProposta.metadata.garantiaOferta = '5% do valor total';

const propostaPronta = await workflowEngine.transition(
  preparandoProposta,
  'proposta_pronta',
  'user-gestor-01',
  'Roberto Costa',
  'finalizar_proposta',
  'Proposta aprovada: R$ 780.000,00 com margem de 18%'
);

// Notificação automática:
// "Proposta finalizada! Valor: R$ 780.000. Prazo de envio: 30/10/2025 17:00"

// 6. ENVIO E AGUARDO DA SESSÃO
const aguardandoSessao = await workflowEngine.transition(
  propostaPronta,
  'aguardando_sessao',
  'user-comercial-01',
  'Ana Paula Silva',
  'enviar_proposta',
  'Proposta enviada via sistema Comprasnet em 28/10/2025 às 14:30'
);

// Notificação 24h antes da sessão:
// "LEMBRETE: Sessão pública em 24 horas! 
//  Modalidade: Pregão Eletrônico. Edital: PE 001/2025"

// 7. SESSÃO PÚBLICA - DISPUTA DE LANCES
const emSessao = await workflowEngine.transition(
  aguardandoSessao,
  'em_sessao',
  'user-comercial-01',
  'Ana Paula Silva',
  'iniciar_sessao',
  'Sessão iniciada. Lances sendo dados.'
);

// Durante a sessão:
// Lance inicial: R$ 780.000
// Concorrente A: R$ 750.000
// Nossa empresa: R$ 735.000
// Concorrente A: R$ 720.000
// Nossa empresa: R$ 710.000 (LANCE FINAL - VENCEDOR)

const vencedora = await workflowEngine.transition(
  emSessao,
  'vencedora',
  'user-comercial-01',
  'Ana Paula Silva',
  'registrar_vitoria',
  'Vencemos! Valor final: R$ 710.000 (margem ajustada: 11,3%)'
);

vencedora.metadata.valorContrato = 710000;

// Notificação automática:
// "🏆 VITÓRIA NA LICITAÇÃO! 
//  Órgão: Hospital Municipal São João. Valor: R$ 710.000"

// 8. AGUARDAR HOMOLOGAÇÃO (sem recursos)
const aguardandoHomologacao = await workflowEngine.transition(
  vencedora,
  'aguardando_homologacao',
  'user-comercial-01',
  'Ana Paula Silva',
  'aguardar_homologacao',
  'Nenhum recurso apresentado. Aguardando homologação oficial.'
);

// 15 dias depois...

// 9. HOMOLOGAÇÃO OFICIAL
const homologada = await workflowEngine.transition(
  aguardandoHomologacao,
  'homologada',
  'user-comercial-01',
  'Ana Paula Silva',
  'confirmar_homologacao',
  'Homologação publicada no DOU em 22/11/2025'
);

// Notificação automática:
// "✅ Licitação HOMOLOGADA! Iniciar processo de assinatura de contrato."

// 10. ASSINATURA DO CONTRATO
const aguardandoContrato = await workflowEngine.transition(
  homologada,
  'aguardando_contrato',
  'user-juridico-01',
  'Dra. Patricia Santos',
  'iniciar_contrato',
  'Contrato elaborado e enviado para assinatura'
);

aguardandoContrato.metadata.dataInicio = new Date('2026-01-01');
aguardandoContrato.metadata.dataTermino = new Date('2026-12-31');

const contratoAssinado = await workflowEngine.transition(
  aguardandoContrato,
  'contrato_assinado',
  'user-juridico-01',
  'Dra. Patricia Santos',
  'confirmar_assinatura',
  'Contrato assinado em 05/12/2025. Início da vigência: 01/01/2026'
);

// Notificação automática:
// "🎉 CONTRATO ASSINADO! 
//  Órgão: Hospital Municipal São João. 
//  Valor: R$ 710.000. 
//  Vigência: 01/01/2026 a 31/12/2026"

// FIM DO WORKFLOW - SUCESSO! 🎉
```

### Métricas do Processo

```typescript
const metrics = {
  tempoTotal: 51, // dias (identificação → assinatura)
  tempoAnalise: 3,
  tempoDocumentacao: 5,
  tempoProposta: 5,
  tempoAguardoSessao: 8,
  tempoHomologacao: 15,
  tempoAssinatura: 15,
  
  valorInicial: 850000,
  valorProposta: 780000,
  valorFinal: 710000,
  economia: 140000, // 16,5% de desconto ao órgão público
  
  margemPlanejada: 0.18, // 18%
  margemFinal: 0.113,    // 11,3%
};
```

---

## 🔥 CASO DE USO 2: RECURSO DE IMPUGNAÇÃO

### Cenário

Empresa perde licitação por diferença mínima e entra com recurso.

```typescript
// Durante a sessão
const emSessao = /* ... */;

// Nossa proposta: R$ 510.000
// Concorrente venceu: R$ 508.000
// Diferença: R$ 2.000 (0,39%)

// Identificamos irregularidade: Concorrente não possui ANVISA

const emRecurso = await workflowEngine.transition(
  emSessao,
  'em_recurso_impugnacao',
  'user-juridico-01',
  'Dra. Patricia Santos',
  'entrar_recurso',
  `RECURSO: Empresa vencedora não comprovou regularidade junto à ANVISA 
   conforme exigido no item 4.2 do edital. Anexo: print do site ANVISA 
   mostrando situação irregular.`
);

// Notificação enviada ao gestor e equipe jurídica

// 10 dias depois - Comissão de Licitação aceita o recurso

const vencedora = await workflowEngine.transition(
  emRecurso,
  'vencedora',
  'user-comercial-01',
  'Ana Paula Silva',
  'recurso_deferido',
  `Recurso DEFERIDO! Empresa anterior desclassificada. 
   Nossa proposta de R$ 510.000 foi declarada vencedora.`
);

// Notificação automática:
// "🏆 VITÓRIA POR RECURSO! Nossa impugnação foi aceita. 
//  Valor do contrato: R$ 510.000"

// Continua o fluxo normal (homologação → contrato)
```

---

## 🎊 CASO DE USO 3: VITÓRIA E ASSINATURA

### Integração com Módulo de Contratos

Quando uma licitação chega ao estado `contrato_assinado`, o sistema pode **automaticamente criar um contrato** no módulo de Contratos:

```typescript
import { CONTRATO_WORKFLOW } from '@/services/workflow/definitions/contrato.workflow';

// Listener de eventos
workflowEngine.on('transition:contrato_assinado', async (licitacaoInstance) => {
  // Extrair dados da licitação
  const metadata = licitacaoInstance.metadata as LicitacaoWorkflowMetadata;
  
  // Criar contrato automaticamente
  const contrato = await workflowEngine.createInstance(
    'contrato',
    `contrato-licitacao-${licitacaoInstance.entityId}`,
    'contrato',
    licitacaoInstance.createdBy,
    licitacaoInstance.createdByName,
    {
      tipo: 'cliente',
      parteId: metadata.orgaoCNPJ,
      parteNome: metadata.orgaoNome,
      valorTotal: metadata.valorContrato,
      dataInicio: metadata.dataInicio,
      dataTermino: metadata.dataTermino,
      renovacaoAutomatica: false,
      clausulas: [
        `Fornecimento de ${metadata.objeto}`,
        `Valor total: R$ ${metadata.valorContrato?.toFixed(2)}`,
        `Edital: ${metadata.numeroEdital}`,
      ],
      anexos: [
        `edital_${metadata.numeroEdital}.pdf`,
        `proposta_comercial.pdf`,
        `ata_sessao_publica.pdf`,
        `termo_homologacao.pdf`,
        `contrato_assinado.pdf`,
      ],
    }
  });
  
  // Transitar automaticamente para "assinado" (já foi assinado na licitação)
  await workflowEngine.transition(
    contrato,
    'assinado',
    'system',
    'Sistema ICARUS',
    'importar_licitacao',
    `Contrato importado automaticamente da licitação ${metadata.numeroEdital}`
  );
  
  // Iniciar vigência
  await workflowEngine.transition(
    contrato,
    'vigente',
    'system',
    'Sistema ICARUS',
    'iniciar_vigencia',
    `Contrato em vigência desde ${metadata.dataInicio?.toLocaleDateString()}`
  );
  
  console.log(`✅ Contrato criado automaticamente: ${contrato.id}`);
});
```

---

## 🔗 INTEGRAÇÃO COM OUTROS MÓDULOS

### 1. Compras & Fornecedores

Após ganhar licitação, o sistema pode:

```typescript
// Criar fornecedor (se novo)
if (!fornecedorExistente) {
  await CadastrosService.criarFornecedor({
    razaoSocial: metadata.orgaoNome,
    cnpj: metadata.orgaoCNPJ,
    tipo: 'orgao_publico',
    // ...
  });
}

// Criar pedido de compra programado
await workflowEngine.createInstance(
  'pedido_compra',
  `pedido-licitacao-${licitacaoInstance.id}`,
  'pedido_compra',
  // ...
);
```

### 2. Financeiro

```typescript
// Criar recebimento programado
await FinanceiroService.criarRecebimentoProgramado({
  origem: 'licitacao',
  origemId: licitacaoInstance.id,
  cliente: metadata.orgaoNome,
  valor: metadata.valorContrato,
  dataInicio: metadata.dataInicio,
  dataTermino: metadata.dataTermino,
  periodicidade: 'mensal', // ou conforme contrato
});
```

### 3. OPME

```typescript
// Reservar estoque para o contrato
await OPMEService.reservarEstoqueContrato({
  contratoId: contrato.id,
  itens: metadata.itensContrato,
  periodo: {
    inicio: metadata.dataInicio,
    termino: metadata.dataTermino,
  },
});
```

---

## 📊 DASHBOARDS E RELATÓRIOS

### Dashboard de Licitações

```typescript
interface LicitacoesDashboard {
  // KPIs
  totalIdentificadas: number;
  emAndamento: number;
  vencidas: number;
  perdidas: number;
  taxaVitoria: number; // %
  
  // Financeiro
  valorTotalVencido: number;
  valorMedioContrato: number;
  margemMediaRealizada: number;
  
  // Tempo
  tempoMedioCiclo: number; // dias
  tempoMedioAteVitoria: number;
  
  // Por Órgão
  orgaosMaisCompram: Array<{
    orgao: string;
    contratos: number;
    valorTotal: number;
  }>;
  
  // Próximas Sessões
  proximasSessoes: Array<{
    edital: string;
    orgao: string;
    dataSessao: Date;
    valorEstimado: number;
    status: string;
  }>;
  
  // Recursos/Impugnações
  recursosAbertos: number;
  recursosVencidos: number;
  taxaSucessoRecursos: number;
}
```

### Alertas Automáticos

```typescript
// 1. Licitação com prazo próximo (3 dias)
if (diasAtePrazo <= 3 && instance.currentStateId === 'preparando_documentacao') {
  notificar({
    tipo: 'urgente',
    destinatarios: ['gestor_licitacoes', 'equipe'],
    mensagem: `URGENTE: Faltam ${diasAtePrazo} dias para prazo de envio!`,
  });
}

// 2. Sessão em 24 horas
if (horasAteSessao === 24) {
  notificar({
    tipo: 'lembrete',
    destinatarios: ['comercial', 'pricing'],
    mensagem: 'Sessão pública amanhã! Preparar lances e estratégia.',
  });
}

// 3. Homologação atrasada (> 15 dias)
if (diasAguardandoHomologacao > 15) {
  notificar({
    tipo: 'atencao',
    destinatarios: ['gestor_licitacoes'],
    mensagem: 'Homologação atrasada. Verificar com órgão público.',
  });
}
```

---

## 🎯 PRÓXIMAS FEATURES

### 1. IA para Análise de Editais

```typescript
// LLM analisa edital automaticamente
const analiseIA = await LLMService.analisarEdital(editalPDF);

// Retorna:
{
  viabilidade: 'alta' | 'media' | 'baixa',
  pontosCriticos: string[],
  documentosNecessarios: string[],
  prazos: { tipo: string; data: Date }[],
  estimativaValor: number,
  concorrenciaEstimada: number,
  recomendacao: string,
}
```

### 2. Monitoramento Automático de Portais

```typescript
// Scraping automático de Comprasnet, BLL, etc.
const novasLicitacoes = await ScraperService.monitorarPortais({
  palavrasChave: ['OPME', 'ortopedia', 'material cirúrgico'],
  valorMinimo: 100000,
  estados: ['SP', 'RJ', 'MG'],
});

// Cria instâncias automaticamente
for (const licitacao of novasLicitacoes) {
  await workflowEngine.createInstance('licitacao', /* ... */);
}
```

### 3. Histórico de Órgãos Públicos

```typescript
interface HistoricoOrgao {
  cnpj: string;
  nome: string;
  totalLicitacoes: number;
  vitorias: number;
  derrotas: number;
  valorTotalContratado: number;
  mediaPrazoHomologacao: number;
  mediaTempoAssinatura: number;
  observacoes: string[];
}

// Usar histórico para decisão de participação
const historico = await getHistoricoOrgao(orgaoCNPJ);
if (historico.taxaHomologacao < 0.5) {
  console.warn('Órgão com baixa taxa de homologação!');
}
```

---

**Desenvolvido com ❤️ pela equipe ICARUS v5.0**  
*Gestão elevada pela IA*

