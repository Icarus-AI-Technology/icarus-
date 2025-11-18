# 💰 LLM AGENTE FINANCEIRO AVANÇADO — ICARUS v5.0

**Sistema**: ICARUS v5.0 — Gestão elevada pela IA  
**Data**: 20 de Outubro de 2025  
**Tipo**: Inteligência Artificial Financeira + Consultoria Bancária Automatizada

---

## 🎯 VISÃO GERAL

O **Agente Financeiro Avançado** é um assistente de IA especializado em:
- 📊 **Análise detalhada de extratos bancários** (todas as contas + cartões)
- ⚠️ **Detecção de anomalias e fraudes** em tempo real
- 💸 **Identificação de tarifas indevidas** e cobranças incorretas
- 🤝 **Consultoria em negociações bancárias** (empréstimos, tarifas)
- 📈 **Previsão de fluxo de caixa** e recomendações de investimento
- ⚖️ **Compliance com leis brasileiras** (CDC, CMN, BACEN)

---

## 🏗️ ARQUITETURA DE INTEGRAÇÃO

### 1. Pluggy API (Open Finance Brasil)

**✅ DESCOBERTA IMPORTANTE**: A Pluggy **SIM oferece pagamentos via PIX**!

```typescript
// Capacidades da Pluggy API
const pluggyCapabilities = {
  // Dados Financeiros (Read)
  contas: true,             // Saldo, dados cadastrais
  transacoes: true,         // Extrato completo
  investimentos: true,      // Aplicações, CDB, fundos
  cartoesCredito: true,     // Faturas, transações
  emprestimos: true,        // Contratos vigentes
  
  // Iniciação de Pagamentos (Write)
  pagamentosPIX: true,      // ✅ SUPORTADO
  cobrancasRecorrentes: true, // Assinaturas, mensalidades
  qrCodePIX: true,          // Geração de QR Code
  
  // Enriquecimento
  categorizacao: true,      // Classificação automática de transações
  identificacaoMerchant: true, // Reconhecimento de estabelecimentos
};
```

#### Implementação Pluggy

```typescript
// server/services/integrations/pluggy.ts
import { PluggyClient } from 'pluggy-sdk';

const pluggy = new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
});

export class PluggyService {
  // ============================================
  // DADOS FINANCEIROS (OPEN FINANCE)
  // ============================================
  
  // Listar todas as contas conectadas
  static async listarContas(itemId: string) {
    try {
      const accounts = await pluggy.fetchAccounts(itemId);
      
      return accounts.map(acc => ({
        id: acc.id,
        tipo: acc.type,
        subtipo: acc.subtype,
        numero: acc.number,
        banco: acc.bankData,
        saldo: acc.balance,
        saldoDisponivel: acc.availableBalance,
        moeda: acc.currencyCode,
      }));
    } catch (error) {
      throw new Error(`Erro ao listar contas: ${error.message}`);
    }
  }
  
  // Buscar transações (extrato)
  static async buscarTransacoes(accountId: string, params?: {
    dataInicio?: Date;
    dataFim?: Date;
    pagina?: number;
  }) {
    try {
      const transactions = await pluggy.fetchTransactions(accountId, {
        from: params?.dataInicio?.toISOString(),
        to: params?.dataFim?.toISOString(),
        page: params?.pagina || 1,
      });
      
      return {
        transacoes: transactions.results.map(tx => ({
          id: tx.id,
          data: new Date(tx.date),
          descricao: tx.description,
          valor: tx.amount,
          tipo: tx.type, // DEBIT | CREDIT
          categoria: tx.category, // Categorização automática da Pluggy
          merchant: tx.merchant, // Identificação do estabelecimento
          saldoApos: tx.balance,
        })),
        total: transactions.total,
        pagina: transactions.page,
        totalPaginas: transactions.totalPages,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }
  }
  
  // Buscar faturas de cartão de crédito
  static async buscarFaturasCartao(accountId: string) {
    try {
      const invoices = await pluggy.fetchCreditCardBills(accountId);
      
      return invoices.map(invoice => ({
        id: invoice.id,
        dataVencimento: new Date(invoice.dueDate),
        dataFechamento: new Date(invoice.closeDate),
        valorTotal: invoice.totalAmount,
        valorMinimo: invoice.minimumAmount,
        status: invoice.status,
        transacoes: invoice.lineItems.map(item => ({
          data: new Date(item.date),
          descricao: item.description,
          valor: item.amount,
          parcela: item.installmentNumber,
          totalParcelas: item.totalInstallments,
        })),
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar faturas: ${error.message}`);
    }
  }
  
  // ============================================
  // PAGAMENTOS VIA PIX
  // ============================================
  
  // Iniciar pagamento PIX
  static async iniciarPagamentoPIX(dados: {
    accountId: string;
    chavePIX: string;
    valor: number;
    descricao?: string;
  }) {
    try {
      const payment = await pluggy.createPayment({
        accountId: dados.accountId,
        recipient: {
          pixKey: dados.chavePIX,
        },
        amount: dados.valor,
        description: dados.descricao,
      });
      
      return {
        id: payment.id,
        status: payment.status, // PENDING, APPROVED, REJECTED
        chaveTransacao: payment.transactionId,
        dataExpiracao: payment.expiresAt,
      };
    } catch (error) {
      throw new Error(`Erro ao iniciar pagamento PIX: ${error.message}`);
    }
  }
  
  // Gerar QR Code PIX
  static async gerarQRCodePIX(dados: {
    valor: number;
    chavePIX: string;
    descricao?: string;
    expiraEm?: number; // minutos
  }) {
    try {
      const qrCode = await pluggy.createPixCharge({
        amount: dados.valor,
        pixKey: dados.chavePIX,
        description: dados.descricao,
        expirationTime: dados.expiraEm || 30,
      });
      
      return {
        qrCodeText: qrCode.brcode, // Texto do QR Code (Pix Copia e Cola)
        qrCodeImage: qrCode.qrCodeImage, // Base64 da imagem
        id: qrCode.id,
        expiraEm: new Date(qrCode.expiresAt),
      };
    } catch (error) {
      throw new Error(`Erro ao gerar QR Code: ${error.message}`);
    }
  }
  
  // Verificar status de pagamento
  static async verificarStatusPagamento(paymentId: string) {
    try {
      const payment = await pluggy.getPayment(paymentId);
      
      return {
        id: payment.id,
        status: payment.status,
        aprovadoEm: payment.approvedAt ? new Date(payment.approvedAt) : null,
        rejeitadoEm: payment.rejectedAt ? new Date(payment.rejectedAt) : null,
        motivoRejeicao: payment.rejectionReason,
      };
    } catch (error) {
      throw new Error(`Erro ao verificar pagamento: ${error.message}`);
    }
  }
  
  // ============================================
  // ENRIQUECIMENTO DE DADOS
  // ============================================
  
  // Categorizar transação manualmente (override)
  static async categorizarTransacao(transactionId: string, categoria: string) {
    try {
      await pluggy.updateTransaction(transactionId, {
        category: categoria,
      });
      
      return { sucesso: true };
    } catch (error) {
      throw new Error(`Erro ao categorizar transação: ${error.message}`);
    }
  }
  
  // Obter estatísticas de gastos por categoria
  static async obterEstatisticasGastos(accountId: string, params: {
    dataInicio: Date;
    dataFim: Date;
  }) {
    try {
      const transactions = await this.buscarTransacoes(accountId, params);
      
      // Agrupar por categoria
      const categorias = new Map<string, number>();
      
      transactions.transacoes
        .filter(tx => tx.tipo === 'DEBIT')
        .forEach(tx => {
          const categoria = tx.categoria || 'Sem categoria';
          categorias.set(
            categoria,
            (categorias.get(categoria) || 0) + Math.abs(tx.valor)
          );
        });
      
      return Array.from(categorias.entries())
        .map(([categoria, total]) => ({ categoria, total }))
        .sort((a, b) => b.total - a.total);
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }
}
```

---

## 🤖 LLM ESPECIALIZADA: FinGPT + Llama 3.1 8B

### Arquitetura Híbrida

```
┌─────────────────────────────────────────────────────────────┐
│                  AGENTE FINANCEIRO AVANÇADO                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   FinGPT     │    │  Llama 3.1   │    │  FinBERT     │ │
│  │  (Finanças)  │───▶│   8B (RAG)   │◀───│ (Sentimento) │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │        │
│         ▼                    ▼                    ▼        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         KNOWLEDGE BASE (RAG - Vetorial)             │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ • Leis brasileiras (CDC, CMN, BACEN, IN normativas)│  │
│  │ • Tabelas de tarifas bancárias regulamentadas      │  │
│  │ • Histórico de negociações bem-sucedidas           │  │
│  │ • Jurisprudência do PROCON e BACEN                 │  │
│  │ • Taxas de mercado (SELIC, CDI, IPCA)              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementação da LLM

```typescript
// server/services/ai/financial-agent.ts
import Ollama from 'ollama';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

// FinGPT v3.4 (Llama 3.1 fine-tuned em dados financeiros)
const MODEL = 'fingpt:latest';

export class FinancialAgentService {
  private static vectorStore: MemoryVectorStore;
  
  // Inicializar RAG com conhecimento financeiro brasileiro
  static async inicializarKnowledgeBase() {
    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
    });
    
    // Documentos da base de conhecimento
    const documents = [
      // Leis e regulamentações
      new Document({
        pageContent: `CDC Artigo 39, IV: É vedado ao fornecedor de produtos ou serviços prevalecer-se da fraqueza ou ignorância do consumidor, tendo em vista sua idade, saúde, conhecimento ou condição social, para impingir-lhe seus produtos ou serviços.`,
        metadata: { tipo: 'lei', fonte: 'CDC', artigo: '39-IV' },
      }),
      new Document({
        pageContent: `Resolução CMN 3.919/2010: As tarifas bancárias devem estar previstas em tabela e divulgadas aos clientes. Cobrança de tarifas não previstas ou sem aviso prévio é ilegal.`,
        metadata: { tipo: 'regulacao', fonte: 'CMN', numero: '3919' },
      }),
      new Document({
        pageContent: `Circular BACEN 3.656/2013: Tarifas permitidas incluem: fornecimento de cartão com função débito, fornecimento de segunda via de cartão, saque terminal de autoatendimento, extrato mensal. Tarifas NÃO permitidas: consulta saldo, primeira via cartão, fornecimento talão cheque.`,
        metadata: { tipo: 'regulacao', fonte: 'BACEN', numero: '3656' },
      }),
      // Tarifas típicas indevidas
      new Document({
        pageContent: `Tarifas comumente cobradas indevidamente: 1) Tarifa de cadastro (ilegal após Resolução 3.518/2007); 2) Manutenção de conta inativa (ilegal); 3) Consulta saldo/extrato online (ilegal); 4) Seguro prestamista sem consentimento expresso (ilegal); 5) Capitalização mensal de juros sem previsão contratual (ilegal).`,
        metadata: { tipo: 'jurisprudencia', fonte: 'PROCON-SP' },
      }),
      // Estratégias de negociação
      new Document({
        pageContent: `Negociação de taxas de juros de empréstimo: 1) Comparar com taxa média do mercado (BACEN); 2) Apresentar propostas de concorrentes; 3) Negociar portabilidade como alavanca; 4) Solicitar redução baseada em bom histórico; 5) Ameaçar com reclamação no BACEN/PROCON se taxa abusiva.`,
        metadata: { tipo: 'estrategia', area: 'negociacao' },
      }),
      new Document({
        pageContent: `Contestação de tarifas indevidas: 1) Identificar tarifa na Circular 3.656/2013; 2) Solicitar estorno por escrito ao banco; 3) Se negado, registrar reclamação no BACEN (Sistema Consumidor.gov.br); 4) Prazo legal: banco tem 10 dias úteis para resposta; 5) Se não resolvido, acionar PROCON ou Juizado Especial.`,
        metadata: { tipo: 'estrategia', area: 'contestacao' },
      }),
      // Taxas de mercado (atualizadas dinamicamente)
      new Document({
        pageContent: `Taxas de referência (outubro 2025): SELIC: 10,75% a.a.; CDI: 10,65% a.a.; IPCA (12 meses): 4,82%; Taxa média empréstimo pessoal: 52,5% a.a.; Taxa média cheque especial: 135,8% a.a.; Taxa média cartão rotativo: 432,5% a.a.`,
        metadata: { tipo: 'mercado', data: '2025-10' },
      }),
    ];
    
    this.vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      embeddings
    );
  }
  
  // ============================================
  // ANÁLISE DE EXTRATOS E TRANSAÇÕES
  // ============================================
  
  static async analisarExtrato(dados: {
    transacoes: Array<{
      data: Date;
      descricao: string;
      valor: number;
      tipo: 'DEBIT' | 'CREDIT';
      categoria?: string;
    }>;
    periodo: { inicio: Date; fim: Date };
  }) {
    try {
      // 1. Buscar contexto relevante no RAG
      const contexto = await this.vectorStore.similaritySearch(
        'análise de transações bancárias tarifas indevidas padrões de gasto',
        5
      );
      
      // 2. Preparar prompt
      const prompt = `Você é um consultor financeiro especialista em análise bancária brasileira.

CONTEXTO REGULATÓRIO:
${contexto.map(doc => doc.pageContent).join('\n\n')}

DADOS DO CLIENTE:
Período: ${dados.periodo.inicio.toLocaleDateString()} a ${dados.periodo.fim.toLocaleDateString()}
Total de transações: ${dados.transacoes.length}

TRANSAÇÕES (últimas 50):
${dados.transacoes.slice(0, 50).map((tx, i) => 
  `${i+1}. [${tx.data.toLocaleDateString()}] ${tx.descricao} - R$ ${tx.valor.toFixed(2)} (${tx.tipo})`
).join('\n')}

TAREFA: Analise detalhadamente este extrato e forneça:

1. TARIFAS INDEVIDAS (se houver):
   - Identificar cobranças que violam Circular BACEN 3.656/2013
   - Calcular valor total a ser contestado
   - Fornecer fundamentação legal para contestação

2. ANOMALIAS E FRAUDES POTENCIAIS:
   - Transações duplicadas
   - Valores atípicos (fora do padrão histórico)
   - Transações suspeitas (horários incomuns, locais estranhos)

3. ANÁLISE DE GASTOS:
   - Categorias de maior gasto
   - Oportunidades de redução de custos
   - Sugestões de otimização

4. SCORE DE SAÚDE FINANCEIRA (0-100):
   - Avaliar equilíbrio entrada/saída
   - Diversificação de gastos
   - Controle de despesas essenciais vs supérfluas

Responda em formato JSON estruturado.`;
      
      // 3. Chamar LLM
      const response = await ollama.chat({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Você é um agente financeiro especialista em análise bancária, compliance e negociações. Sempre forneça respostas precisas, baseadas em leis brasileiras vigentes (CDC, CMN, BACEN).',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: 'json',
      });
      
      return JSON.parse(response.message.content);
    } catch (error) {
      throw new Error(`Erro na análise: ${error.message}`);
    }
  }
  
  // ============================================
  // DETECÇÃO DE TARIFAS INDEVIDAS
  // ============================================
  
  static async identificarTarifasIndevidas(transacoes: Array<{
    descricao: string;
    valor: number;
    data: Date;
  }>) {
    try {
      // Filtrar possíveis tarifas (palavras-chave)
      const possiveisTarifas = transacoes.filter(tx =>
        /tarifa|taxa|manut|cadastro|seguro|anuidade|pacote/i.test(tx.descricao)
      );
      
      if (possiveisTarifas.length === 0) {
        return {
          encontradas: false,
          tarifas: [],
          valorTotal: 0,
        };
      }
      
      // Buscar regulamentação no RAG
      const contexto = await this.vectorStore.similaritySearch(
        'tarifas bancárias permitidas Circular BACEN 3.656',
        3
      );
      
      const prompt = `Você é um especialista em regulamentação bancária brasileira.

REGULAMENTAÇÃO:
${contexto.map(doc => doc.pageContent).join('\n\n')}

TARIFAS COBRADAS:
${possiveisTarifas.map((t, i) => 
  `${i+1}. [${t.data.toLocaleDateString()}] ${t.descricao} - R$ ${t.valor.toFixed(2)}`
).join('\n')}

TAREFA: Para CADA tarifa, determine:
1. É LEGAL ou ILEGAL segundo Circular BACEN 3.656/2013?
2. Fundamentação legal (artigo/resolução)
3. Ação recomendada (manter, contestar)
4. Chance de sucesso em contestação (%)

Responda em formato JSON: { "tarifas": [ { "indice": 1, "descricao": "...", "valor": 0, "legal": true/false, "fundamentacao": "...", "acao": "...", "chanceSucesso": 0 } ] }`;
      
      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Especialista em regulamentação bancária brasileira.' },
          { role: 'user', content: prompt },
        ],
        format: 'json',
      });
      
      const resultado = JSON.parse(response.message.content);
      
      const tarifasIlegais = resultado.tarifas.filter((t: any) => !t.legal);
      const valorTotal = tarifasIlegais.reduce((sum: number, t: any) => sum + t.valor, 0);
      
      return {
        encontradas: tarifasIlegais.length > 0,
        tarifas: tarifasIlegais,
        valorTotal,
        acaoRecomendada: tarifasIlegais.length > 0
          ? `Contestar ${tarifasIlegais.length} tarifa(s) indevida(s). Valor total a recuperar: R$ ${valorTotal.toFixed(2)}`
          : 'Nenhuma tarifa ilegal identificada.',
      };
    } catch (error) {
      throw new Error(`Erro ao identificar tarifas: ${error.message}`);
    }
  }
  
  // ============================================
  // CONSULTORIA EM NEGOCIAÇÕES
  // ============================================
  
  static async gerarEstrategiaNegociacao(dados: {
    tipo: 'emprestimo' | 'tarifa' | 'juros';
    valorAtual: number;
    condicaoAtual: string;
    historicoCliente: {
      tempoRelacionamento: number; // anos
      reclamacoesAnteriores: number;
      pontuacaoCredito: number;
    };
  }) {
    try {
      const contexto = await this.vectorStore.similaritySearch(
        `negociação ${dados.tipo} banco estratégias`,
        5
      );
      
      const prompt = `Você é um consultor especialista em negociações bancárias no Brasil.

CONTEXTO:
${contexto.map(doc => doc.pageContent).join('\n\n')}

SITUAÇÃO DO CLIENTE:
- Tipo de negociação: ${dados.tipo}
- Valor/Taxa atual: R$ ${dados.valorAtual.toFixed(2)}
- Condição: ${dados.condicaoAtual}
- Tempo de relacionamento: ${dados.historicoCliente.tempoRelacionamento} anos
- Reclamações anteriores: ${dados.historicoCliente.reclamacoesAnteriores}
- Score de crédito: ${dados.historicoCliente.pontuacaoCredito}

TAREFA: Forneça uma estratégia de negociação completa:

1. DIAGNÓSTICO:
   - Situação atual está abusiva? (comparar com média de mercado)
   - Força de negociação do cliente (0-10)

2. ESTRATÉGIA:
   - Argumentos principais (máximo 5)
   - Valor/taxa alvo realista
   - Plano B se banco recusar

3. ROTEIRO DE NEGOCIAÇÃO:
   - Passo 1: Como iniciar conversa
   - Passo 2: Argumentos a apresentar
   - Passo 3: Concessões a oferecer
   - Passo 4: Como pressionar (se necessário)
   - Passo 5: Quando acionar BACEN/PROCON

4. DOCUMENTAÇÃO NECESSÁRIA:
   - Quais documentos levar para negociação

Responda em formato JSON estruturado.`;
      
      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Consultor especialista em negociações bancárias.' },
          { role: 'user', content: prompt },
        ],
        format: 'json',
      });
      
      return JSON.parse(response.message.content);
    } catch (error) {
      throw new Error(`Erro ao gerar estratégia: ${error.message}`);
    }
  }
  
  // ============================================
  // PREVISÃO DE FLUXO DE CAIXA
  // ============================================
  
  static async preverFluxoCaixa(dados: {
    historicoTransacoes: Array<{
      data: Date;
      valor: number;
      tipo: 'DEBIT' | 'CREDIT';
      categoria: string;
    }>;
    periodoPrevisao: number; // meses
  }) {
    try {
      // Agrupar por mês
      const porMes = new Map<string, { entradas: number; saidas: number }>();
      
      dados.historicoTransacoes.forEach(tx => {
        const mes = `${tx.data.getFullYear()}-${tx.data.getMonth() + 1}`;
        const registro = porMes.get(mes) || { entradas: 0, saidas: 0 };
        
        if (tx.tipo === 'CREDIT') {
          registro.entradas += tx.valor;
        } else {
          registro.saidas += Math.abs(tx.valor);
        }
        
        porMes.set(mes, registro);
      });
      
      const historico = Array.from(porMes.entries()).map(([mes, valores]) => ({
        mes,
        ...valores,
        saldo: valores.entradas - valores.saidas,
      }));
      
      const prompt = `Você é um analista financeiro especializado em previsões de fluxo de caixa.

HISTÓRICO (últimos ${historico.length} meses):
${historico.map(h => `${h.mes}: Entradas R$ ${h.entradas.toFixed(2)}, Saídas R$ ${h.saidas.toFixed(2)}, Saldo R$ ${h.saldo.toFixed(2)}`).join('\n')}

TAREFA: Preveja o fluxo de caixa para os próximos ${dados.periodoPrevisao} meses:

1. PROJEÇÃO MENSAL:
   - Entradas esperadas
   - Saídas esperadas
   - Saldo previsto
   - Intervalo de confiança (mínimo/máximo)

2. ANÁLISE DE TENDÊNCIAS:
   - Tendência geral (crescimento/declínio)
   - Sazonalidade identificada
   - Variabilidade (estável vs volátil)

3. ALERTAS:
   - Meses com risco de saldo negativo
   - Recomendações de reserva de emergência

4. RECOMENDAÇÕES:
   - Oportunidades de investimento
   - Sugestões de corte de gastos (se necessário)

Responda em formato JSON estruturado.`;
      
      const response = await ollama.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Analista financeiro especializado em previsões.' },
          { role: 'user', content: prompt },
        ],
        format: 'json',
      });
      
      return JSON.parse(response.message.content);
    } catch (error) {
      throw new Error(`Erro na previsão: ${error.message}`);
    }
  }
}
```

---

## 🎨 INTERFACE DO USUÁRIO

### Dashboard Financeiro

```typescript
// src/pages/financeiro/DashboardFinanceiroAvancado.tsx
import React, { useEffect, useState } from 'react';
import { PluggyService } from '@/services/integrations/pluggy';
import { FinancialAgentService } from '@/services/ai/financial-agent';
import { AlertTriangle, TrendingUp, DollarSign, Bot } from 'lucide-react';

export const DashboardFinanceiroAvancado = () => {
  const [analise, setAnalise] = useState<any>(null);
  const [tarifasIndevidas, setTarifasIndevidas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    carregarAnalise();
  }, []);
  
  const carregarAnalise = async () => {
    try {
      // 1. Buscar transações da Pluggy
      const contas = await PluggyService.listarContas(currentItemId);
      const transacoes = await PluggyService.buscarTransacoes(
        contas[0].id,
        {
          dataInicio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 dias
          dataFim: new Date(),
        }
      );
      
      // 2. Analisar com IA
      const analiseIA = await FinancialAgentService.analisarExtrato({
        transacoes: transacoes.transacoes,
        periodo: {
          inicio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          fim: new Date(),
        },
      });
      
      // 3. Identificar tarifas indevidas
      const tarifas = await FinancialAgentService.identificarTarifasIndevidas(
        transacoes.transacoes
      );
      
      setAnalise(analiseIA);
      setTarifasIndevidas(tarifas);
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Analisando suas transações com IA...</div>;
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Análise Financeira Avançada</h1>
        <button className="neumorphic-button px-4 py-2">
          <RefreshCw className="w-5 h-5 mr-2" />
          Atualizar Análise
        </button>
      </div>
      
      {/* Score de Saúde Financeira */}
      <div className="neumorphic-container p-6">
        <h2 className="text-xl font-bold mb-4">Score de Saúde Financeira</h2>
        <div className="flex items-center justify-center">
          <div
            className="circular-progress"
            style={{
              '--progress': analise.scoreFinanceiro,
              '--size': '200px',
            }}
          >
            <span className="text-4xl font-bold">{analise.scoreFinanceiro}</span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
        </div>
      </div>
      
      {/* Tarifas Indevidas (ALERTA) */}
      {tarifasIndevidas.encontradas && (
        <div
          className="neumorphic-container p-6 border-l-4"
          style={{ borderColor: 'var(--orx-error-dark)' }}
        >
          <div className="flex items-start">
            <AlertTriangle
              className="w-6 h-6 mr-3"
              style={{ color: 'var(--orx-error-dark)' }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-600">
                {tarifasIndevidas.tarifas.length} Tarifa(s) Indevida(s) Identificada(s)
              </h3>
              <p className="text-gray-600 mt-1">
                Valor total a recuperar: <strong>R$ {tarifasIndevidas.valorTotal.toFixed(2)}</strong>
              </p>
              <div className="mt-4 space-y-2">
                {tarifasIndevidas.tarifas.map((tarifa: any, i: number) => (
                  <div key={i} className="bg-red-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{tarifa.descricao}</span>
                      <span className="text-red-600">R$ {tarifa.valor.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {tarifa.fundamentacao}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Chance de sucesso: {tarifa.chanceSucesso}%
                    </p>
                  </div>
                ))}
              </div>
              <button
                className="neumorphic-button mt-4 px-4 py-2 colored-button"
                style={{ background: 'var(--orx-error-dark)' }}
              >
                Contestar Tarifas Automaticamente
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Análise de Gastos por Categoria */}
      <div className="neumorphic-container p-6">
        <h2 className="text-xl font-bold mb-4">Análise de Gastos</h2>
        <div className="space-y-4">
          {analise.gastosPorCategoria.map((cat: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <span className="font-medium">{cat.categoria}</span>
                <span>R$ {cat.total.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${cat.percentual}%`,
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Anomalias Detectadas */}
      {analise.anomalias.length > 0 && (
        <div className="neumorphic-container p-6">
          <h2 className="text-xl font-bold mb-4">Anomalias Detectadas</h2>
          <div className="space-y-3">
            {analise.anomalias.map((anomalia: any, i: number) => (
              <div
                key={i}
                className="flex items-start p-3 bg-yellow-50 rounded"
              >
                <AlertTriangle className="w-5 h-5 mr-3 text-yellow-600" />
                <div>
                  <p className="font-medium">{anomalia.descricao}</p>
                  <p className="text-sm text-gray-600">{anomalia.detalhes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Chatbot de Consultoria */}
      <div className="neumorphic-container p-6">
        <div className="flex items-center mb-4">
          <Bot className="w-6 h-6 mr-2" style={{ color: 'var(--orx-primary)' }} />
          <h2 className="text-xl font-bold">Consultor Financeiro IA</h2>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">
            Posso ajudá-lo com:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Negociar redução de tarifas bancárias</li>
            <li>Analisar propostas de empréstimo</li>
            <li>Identificar oportunidades de economia</li>
            <li>Prever seu fluxo de caixa futuro</li>
          </ul>
          <button className="neumorphic-button mt-4 px-4 py-2 w-full">
            Iniciar Conversa
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 💰 CUSTO & ROI

### Custos Mensais

```
Pluggy API (Open Finance + Pagamentos PIX):
   Plano Growth: ~R$ 200/mês
   • Até 500 contas conectadas
   • Pagamentos PIX ilimitados (taxa de R$0,50/transação)
   • Suporte técnico prioritário
   
LLM Local (Ollama + FinGPT):
   Hardware: R$ 0/mês (usa servidor existente)
   • Modelo: FinGPT (7B parâmetros)
   • RAM: 8-16 GB
   • GPU: Opcional (acelera 5-10x)
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: R$ 200/mês (fixo) + R$ 0,50/PIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ROI Estimado

```
Benefícios Mensais:
   1. Tarifas indevidas recuperadas: R$ 300-800/mês
   2. Economia em negociações (juros, tarifas): R$ 500-1.500/mês
   3. Prevenção de fraudes: R$ 200-600/mês (evitado)
   4. Otimização de fluxo de caixa: R$ 1.000-3.000/mês
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BENEFÍCIO TOTAL: R$ 2.000-5.900/mês
CUSTO: R$ 200/mês
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROI: 900% - 2.850%
Payback: < 1 mês
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🚀 IMPLEMENTAÇÃO

### Fase 1: Integração Pluggy (Semana 1)
1. ⏳ Criar conta Pluggy (obter API keys)
2. ⏳ Implementar PluggyService (contas, transações, cartões)
3. ⏳ Implementar PluggyService (pagamentos PIX)
4. ⏳ Testar conexão com bancos (sandbox)

### Fase 2: LLM Financeira (Semana 2)
5. ⏳ Instalar Ollama + baixar modelo FinGPT
6. ⏳ Implementar RAG com knowledge base brasileiro
7. ⏳ Criar FinancialAgentService
8. ⏳ Testes de análise de extratos

### Fase 3: Features Avançadas (Semana 3)
9. ⏳ Detecção de tarifas indevidas
10. ⏳ Consultoria em negociações
11. ⏳ Previsão de fluxo de caixa
12. ⏳ Alertas de anomalias em tempo real

### Fase 4: Interface & Deploy (Semana 4)
13. ⏳ Dashboard Financeiro Avançado
14. ⏳ Chatbot de Consultoria
15. ⏳ Notificações WhatsApp (via Z-API)
16. ⏳ Deploy produção

---

**Este documento integra a arquitetura completa do ICARUS v5.0**

