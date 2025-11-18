# 🏆 Licitações e Propostas - Gestão Hospitalar

## Visão Geral

Sistema completo de gestão de **licitações hospitalares** (públicas e privadas) e **propostas comerciais** para distribuidoras OPME. Inclui pregões eletrônicos, cotações, análise de viabilidade, aprovação multinível e dashboard de performance.

## 🎯 Funcionalidades

### 1. **Gestão de Licitações**
- Cadastro completo (públicas: ComprasNet, BLL / privadas: cotações)
- 5 tipos: Pregão Eletrônico, Pregão Presencial, Concorrência, Cotação Privada, Dispensa
- 3 modalidades: Menor Preço, Técnica+Preço, Maior Desconto
- Órgãos compradores: Hospitais públicos/privados, Planos de saúde, Secretarias
- Timeline de eventos (publicação, esclarecimentos, abertura, resultado)
- Documentos anexos (editais, contratos, atas)

### 2. **Propostas Comerciais**
- Elaboração com itens detalhados (produtos OPME)
- Análise de viabilidade (margem bruta/líquida)
- **Aprovação em 3 níveis**: Comercial → Financeiro → Diretoria
- Garantias (caução, seguro, fiança bancária)
- Versões de propostas (reenvi

o)
- Anexos (proposta técnica, comercial, documentos)

### 3. **Dashboard de Performance**
- Taxa de sucesso (licitações vencidas / participadas)
- Valor total vencido vs. perdido
- Licitações ativas e próximas aberturas
- Propostas pendentes de aprovação
- Gráfico de performance (pizza: vencidas/perdidas)

### 4. **Análise de Viabilidade**
- Cálculo automático de margem bruta/líquida
- Alertas de margem baixa (&lt;10%)
- Comparação com histórico
- Aprovação condicional por margem

## 🏗️ Arquitetura

### Tabelas (5):

1. **`licitacoes`**: Licitações hospitalares
2. **`propostas_comerciais`**: Propostas enviadas
3. **`proposta_itens`**: Itens detalhados
4. **`licitacao_eventos`**: Timeline de eventos
5. **`licitacao_documentos`**: Documentos anexos

### Views (2):
- `vw_licitacoes_ativas`: Licitações ainda não encerradas
- `vw_propostas_pendentes`: Propostas aguardando aprovação

### Functions (2):
- `calcular_taxa_sucesso_licitacoes()`: Taxa de sucesso %
- `criar_evento_licitacao()`: Adiciona evento à timeline

## 📊 Estatísticas

- **SQL**: ~650 linhas
- **React**: ~850 linhas
- **Docs**: ~250 linhas
- **TOTAL**: ~1.750 linhas

## 🎯 Contexto OPME

**Taxa de sucesso saudável**: 40-60% (mercado altamente competitivo)
**Margem mínima aceitável**: 10-12% (margem líquida)
**Prazo médio de pagamento**: 30-60 dias (hospitais públicos: até 90 dias)

**Status**: ✅ 100% COMPLETO

