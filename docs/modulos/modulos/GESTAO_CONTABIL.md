# 💰 Gestão Contábil - DRE/Balancete/Razão

## Visão Geral

O módulo **Gestão Contábil** é o sistema completo de contabilidade para distribuidoras OPME. Ele oferece Plano de Contas estruturado, lançamentos com partidas dobradas, DRE (Demonstração do Resultado do Exercício), Balancete de Verificação, Razão Contábil e Centros de Custo.

## 🎯 Funcionalidades Principais

### 1. **Plano de Contas Estruturado**
- Hierarquia de 4 níveis (Grupo → Subgrupo → Conta → Subconta)
- Codificação padronizada (ex: `1.1.01.001`)
- Contas analíticas (aceitam lançamento) vs. sintéticas (agrupam)
- Natureza: débito ou crédito
- Tipos: Ativo, Passivo, Receita, Despesa, Resultado
- Pré-configurado para distribuidoras OPME

### 2. **Lançamentos Contábeis (Partidas Dobradas)**
- Sistema de débito e crédito (sempre iguais)
- Histórico completo e complementar
- Documento origem (NF-e, Boleto, Transferência)
- Competência vs. Caixa
- Status: Provisório, Confirmado, Cancelado
- Validação automática de partidas dobradas
- Centro de custo opcional

### 3. **DRE (Demonstração do Resultado)**
- Receita Bruta
- (-) Deduções (ICMS, devoluções)
- (=) Receita Líquida
- (-) Custos (CMV)
- (=) Lucro Bruto
- (-) Despesas Operacionais
- (=) Lucro Operacional
- (+/-) Outras Receitas/Despesas
- (=) Lucro Líquido
- **Percentual sobre receita bruta**
- **Análise visual (gráfico de barras)**

### 4. **Balancete de Verificação**
- Saldos de todas as contas (débito/crédito)
- Saldo atual (devedor/credor)
- Total Ativo, Passivo, Patrimônio Líquido
- Validação contábil (débito = crédito)

### 5. **Razão Contábil**
- Histórico completo de movimentações por conta
- Ordenado por data
- Centro de custo
- Documento origem

### 6. **Centros de Custo**
- Rateio de despesas por área
- Tipos: Operacional, Administrativo, Comercial, Logística
- Orçamento mensal
- Responsável por centro

### 7. **Integrações Automáticas**
- NF-e de venda → Lançamento de receita + CMV
- NF-e de compra → Lançamento de estoque + fornecedor
- Contas a receber → Lançamento de cliente
- Contas a pagar → Lançamento de fornecedor

## 🏗️ Arquitetura de Banco de Dados

### Tabelas:

1. **`plano_contas`**: Plano de Contas estruturado
   - Hierarquia (código, nome, grau, conta_pai_id)
   - Tipo (ativo, passivo, receita, despesa, resultado)
   - Natureza (débito, crédito)
   - Aceita lançamento (analítica vs. sintética)
   - Integração automática (nfe_venda, nfe_compra, etc.)

2. **`centros_custo`**: Centros de Custo
   - Código, nome, tipo
   - Hierarquia (centro_pai_id)
   - Orçamento mensal
   - Responsável

3. **`lancamentos_contabeis`**: Lançamentos (cabeçalho)
   - Número, data de lançamento, data de competência
   - Histórico
   - Documento origem (tipo, id, número)
   - Valor total
   - Status (provisório, confirmado, cancelado)
   - Auditoria (criado por, confirmado por, cancelado por)

4. **`partidas_contabeis`**: Partidas Dobradas (débito/crédito)
   - Lançamento pai
   - Conta
   - Tipo (débito ou crédito)
   - Valor
   - Centro de custo (opcional)
   - Histórico específico

### Views:

1. **`vw_razao_contabil`**: Razão Contábil
   - Todas as partidas agrupadas por conta
   - Com histórico, data, documento origem

2. **`vw_balancete`**: Balancete de Verificação
   - Saldos de todas as contas (débito, crédito, saldo atual)
   - Tipo de saldo (devedor, credor, zerado)

### Functions:

1. **`gerar_dre(data_inicio, data_fim)`**
   - Calcula DRE do período
   - Retorna 10 linhas (receita bruta → lucro líquido)
   - Com valores e percentuais sobre receita bruta

2. **`validar_partidas_dobradas()`**
   - Trigger que valida se débito = crédito
   - Garante integridade contábil

## 📊 Interface React

### 4 Abas:

1. **DRE**:
   - Filtros: Data Início/Fim
   - 3 KPIs: Receita Bruta, Lucro Líquido, Margem Líquida
   - Gráfico de barras (Receita → Custos → Despesas → Lucro)
   - Tabela DRE completa (10 linhas)
   - Exportação PDF/Excel

2. **Balancete**:
   - 3 KPIs: Total Ativo, Total Passivo, Patrimônio Líquido
   - Tabela de contas (código, nome, débito, crédito, saldo)
   - Indicador de saldo (devedor/credor)

3. **Lançamentos**:
   - Tabela de lançamentos (número, data, histórico, valor, status)
   - Botão "Novo Lançamento" (partidas dobradas)
   - Visualização de partidas (débito/crédito)
   - Confirmação/Cancelamento

4. **Centros de Custo**:
   - Cards de centros (código, nome, tipo, orçamento)
   - Acompanhamento de gastos vs. orçamento
   - Botão "Novo Centro"

## 💻 Uso no Código

### Exemplo 1: Criar Lançamento (Partidas Dobradas)

```typescript
import { supabase } from '@/lib/supabase';

// Venda de OPME (Receita + CMV)
async function lancarVenda(nfeId: string, valorVenda: number, custoMercadoria: number) {
  // 1. Criar lançamento (cabeçalho)
  const { data: lancamento } = await supabase
    .from('lancamentos_contabeis')
    .insert({
      data_lancamento: new Date().toISOString(),
      data_competencia: new Date().toISOString(),
      historico: 'Venda OPME - Hospital XYZ',
      tipo_lancamento: 'padrao',
      valor_total: valorVenda,
      documento_tipo: 'nfe',
      documento_id: nfeId,
      status: 'confirmado',
    })
    .select()
    .single();

  // 2. Criar partidas dobradas (débito = crédito)
  await supabase.from('partidas_contabeis').insert([
    {
      lancamento_id: lancamento.id,
      conta_id: 'uuid-conta-clientes', // 1.1.02.001 (Clientes)
      tipo_partida: 'debito',
      valor: valorVenda,
    },
    {
      lancamento_id: lancamento.id,
      conta_id: 'uuid-conta-receita-venda', // 3.1.01.001 (Venda OPME)
      tipo_partida: 'credito',
      valor: valorVenda,
    },
  ]);

  // 3. Lançar CMV (Custo da Mercadoria Vendida)
  const { data: lancamentoCMV } = await supabase
    .from('lancamentos_contabeis')
    .insert({
      data_lancamento: new Date().toISOString(),
      data_competencia: new Date().toISOString(),
      historico: 'CMV - Venda OPME',
      tipo_lancamento: 'padrao',
      valor_total: custoMercadoria,
      status: 'confirmado',
    })
    .select()
    .single();

  await supabase.from('partidas_contabeis').insert([
    {
      lancamento_id: lancamentoCMV.id,
      conta_id: 'uuid-conta-cmv', // 3.3.01.001 (Custo OPME Vendido)
      tipo_partida: 'debito',
      valor: custoMercadoria,
    },
    {
      lancamento_id: lancamentoCMV.id,
      conta_id: 'uuid-conta-estoque', // 1.1.03.001 (Estoque OPME)
      tipo_partida: 'credito',
      valor: custoMercadoria,
    },
  ]);
}
```

### Exemplo 2: Gerar DRE

```typescript
// Gerar DRE do mês atual
const { data: dre } = await supabase.rpc('gerar_dre', {
  p_data_inicio: '2025-10-01',
  p_data_fim: '2025-10-31',
});

dre.forEach((linha) => {
  console.log(`${linha.descricao}: R$ ${linha.valor} (${linha.percentual}%)`);
});

// Output:
// Receita Bruta: R$ 2.500.000 (100%)
// (-) Deduções: R$ -425.000 (17%)
// (=) Receita Líquida: R$ 2.075.000 (83%)
// (-) Custos: R$ -1.250.000 (50%)
// (=) Lucro Bruto: R$ 825.000 (33%)
// (-) Despesas Operacionais: R$ -420.000 (16.8%)
// (=) Lucro Operacional: R$ 405.000 (16.2%)
// (+) Outras Receitas: R$ 15.000 (0.6%)
// (-) Outras Despesas: R$ -20.000 (0.8%)
// (=) Lucro Líquido: R$ 400.000 (16%)
```

### Exemplo 3: Consultar Balancete

```typescript
const { data: balancete } = await supabase
  .from('vw_balancete')
  .select('*')
  .order('conta_codigo');

balancete.forEach((conta) => {
  console.log(
    `${conta.conta_codigo} - ${conta.conta_nome}: Saldo ${conta.tipo_saldo} R$ ${conta.saldo_atual}`
  );
});

// Output:
// 1.1.01.001 - Caixa: Saldo devedor R$ 20.000
// 1.1.01.002 - Bancos c/ Movimento: Saldo devedor R$ 180.000
// 1.1.02.001 - Clientes: Saldo devedor R$ 200.000
// 1.1.03.001 - Estoque de OPME: Saldo devedor R$ 400.000
// 2.1.01.001 - Fornecedores Nacionais: Saldo credor R$ 200.000
```

### Exemplo 4: Criar Centro de Custo

```typescript
const { data: centro } = await supabase
  .from('centros_custo')
  .insert({
    codigo: 'CC005',
    nome: 'Vendas - Região Sul',
    tipo: 'comercial',
    orcamento_mensal: 100000,
    responsavel_id: 'uuid-gerente-sul',
  })
  .select()
  .single();

console.log('Centro criado:', centro.nome);
```

## 📋 Plano de Contas OPME (Pré-configurado)

### 1. ATIVO
- **1.1** Ativo Circulante
  - **1.1.01** Caixa e Equivalentes
    - 1.1.01.001 Caixa
    - 1.1.01.002 Bancos c/ Movimento
  - **1.1.02** Contas a Receber
    - 1.1.02.001 Clientes
  - **1.1.03** Estoques
    - 1.1.03.001 Estoque de OPME

### 2. PASSIVO
- **2.1** Passivo Circulante
  - **2.1.01** Fornecedores
    - 2.1.01.001 Fornecedores Nacionais
  - **2.1.02** Obrigações Fiscais
    - 2.1.02.001 ICMS a Recolher

### 3. RESULTADO (Receitas e Despesas)
- **3.1** Receita Bruta
  - **3.1.01** Venda de OPME
    - 3.1.01.001 Venda OPME - Hospitais
- **3.2** Deduções da Receita
  - **3.2.01** Impostos sobre Vendas
    - 3.2.01.001 ICMS s/ Vendas
- **3.3** Custo das Vendas
  - **3.3.01** CMV - OPME
    - 3.3.01.001 Custo OPME Vendido
- **3.4** Despesas Operacionais
  - **3.4.01** Despesas Administrativas
    - 3.4.01.001 Salários
    - 3.4.01.002 Encargos Sociais
  - **3.4.02** Despesas Comerciais
    - 3.4.02.001 Comissões
  - **3.4.03** Despesas Logísticas
    - 3.4.03.001 Fretes
- **3.5** Outras Receitas
  - **3.5.01** Receitas Financeiras
    - 3.5.01.001 Juros Recebidos
- **3.6** Outras Despesas
  - **3.6.01** Despesas Financeiras
    - 3.6.01.001 Juros Pagos

## 🔐 Segurança e Conformidade

### RLS (Row Level Security):
- Contadores e Analistas Contábeis: Veem tudo e podem criar lançamentos
- Gerentes: Veem apenas centros de custo de sua área
- Auditores: Leitura completa, sem edição
- Outros: Sem acesso

### Auditoria:
- Quem criou cada lançamento
- Quem confirmou/cancelou
- Motivo de cancelamento
- Logs de todas as operações

### SPED Contábil (ECD):
- Geração automática do arquivo texto
- Layout oficial da Receita Federal
- Validação de partidas dobradas
- Histórico padronizado

## 📊 Estatísticas do Módulo

- **SQL**: ~700 linhas (migration)
- **React**: ~900 linhas (component)
- **Docs**: ~450 linhas
- **TOTAL**: ~2.050 linhas
- **Tabelas**: 4
- **Views**: 2
- **Functions**: 2
- **Contas Pré-configuradas**: 25

## 🎯 Benefícios

### Para Contabilidade:
- ✅ Plano de Contas padronizado OPME
- ✅ Partidas dobradas validadas automaticamente
- ✅ DRE e Balancete em tempo real
- ✅ Exportação SPED Contábil

### Para Gestão:
- ✅ Visão financeira completa (DRE)
- ✅ Margem líquida e lucratividade
- ✅ Centros de custo para controle
- ✅ Análise visual (gráficos)

### Para Auditoria:
- ✅ Rastreabilidade completa
- ✅ Histórico de todas as operações
- ✅ Documentos origem vinculados

## 🏥 Contexto OPME

### Por que é importante?
Distribuidoras OPME precisam:
- **DRE mensal** para avaliar lucratividade
- **Balancete** para apresentar a bancos/investidores
- **SPED Contábil (ECD)** obrigatório (empresas do Lucro Real)
- **Centros de custo** para rateio de despesas por produto/cliente

### Margens Típicas (OPME):
- **Receita Bruta**: 100%
- **Deduções** (ICMS, PIS, COFINS): ~17%
- **Receita Líquida**: ~83%
- **Custos** (CMV): ~50-55%
- **Lucro Bruto**: ~30%
- **Despesas Operacionais**: ~15-20%
- **Lucro Líquido**: **10-15%** (meta saudável)

## 🎉 Conclusão

O **Gestão Contábil** transforma contabilidade em ferramenta de gestão estratégica, com visibilidade completa da saúde financeira da distribuidora.

**Status**: ✅ 100% COMPLETO  
**Versão**: 1.0  
**Data**: Outubro 2025

