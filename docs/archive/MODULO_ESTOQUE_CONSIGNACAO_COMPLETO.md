# 📦 MÓDULOS ESTOQUE INTELIGENTE E CONSIGNAÇÃO AVANÇADA - DOCUMENTAÇÃO COMPLETA

**Sistema**: ICARUS v5.0  
**Categoria**: Operacional / Gestão de Ativos  
**Prioridade**: ALTA (P1)  
**Versão**: 5.0.0  
**Última Atualização**: Outubro 2025  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL CONSOLIDADO

### PARTE I - MÓDULO ESTOQUE INTELIGENTE
1. [Visão Geral Estoque](#1-visão-geral-estoque)
2. [Arquitetura Estoque](#2-arquitetura-estoque)
3. [Dashboard Estoque](#3-dashboard-estoque)
4. [Gestão de Inventário](#4-gestão-de-inventário)
5. [Movimentações](#5-movimentações)
6. [Controle de Validade](#6-controle-de-validade)
7. [Ponto de Reposição](#7-ponto-de-reposição)
8. [IA para Estoque](#8-ia-para-estoque)
9. [Análise ABC/XYZ](#9-análise-abc-xyz)
10. [Integração com Compras](#10-integração-com-compras)

### PARTE II - MÓDULO CONSIGNAÇÃO AVANÇADA
11. [Visão Geral Consignação](#11-visão-geral-consignação)
12. [Arquitetura Consignação](#12-arquitetura-consignação)
13. [Contratos de Consignação](#13-contratos-de-consignação)
14. [Kits Consignados](#14-kits-consignados)
15. [Empréstimos e Devoluções](#15-empréstimos-e-devoluções)
16. [Faturamento Consignação](#16-faturamento-consignação)
17. [Dashboard Consignação](#17-dashboard-consignação)
18. [Integração com Cirurgias](#18-integração-com-cirurgias)

### PARTE III - ANALYTICS E CASOS DE USO
19. [Relatórios Consolidados](#19-relatórios-consolidados)
20. [Casos de Uso Completos](#20-casos-de-uso-completos)
21. [ROI e Conclusão](#21-roi-e-conclusão)

---

# PARTE I - MÓDULO ESTOQUE INTELIGENTE

## 1. VISÃO GERAL ESTOQUE

### 1.1. Descrição

**Arquivo Principal**: `/components/modules/EstoqueIA.tsx`  
**Service Principal**: `/lib/services/ai/EstoqueAI.ts`

O módulo **Estoque Inteligente** é responsável por gerenciar todo o inventário de produtos OPME com foco em:
- Controle preciso de estoque em tempo real
- Rastreabilidade total (lote, validade, série)
- Previsão de demanda com IA
- Otimização de capital de giro
- Redução de perdas por vencimento
- Ponto de reposição automático

### 1.2. Objetivos

```yaml
Objetivos Principais:
  - Controle 100% preciso do inventário
  - Zero rupturas de estoque (produtos críticos)
  - Redução de 70% em perdas por vencimento
  - Otimização de capital de giro
  - Previsão de demanda com IA (95% precisão)
  - Rastreabilidade completa ANVISA
  - Integração com compras e cirurgias
  - Gestão de múltiplos armazéns

Métricas de Sucesso:
  - Acurácia de inventário > 99%
  - Taxa de ruptura < 2%
  - Perdas por vencimento < 0.5%
  - Giro de estoque > 8x/ano
  - Tempo de localização < 30 segundos
  - Redução de 40% em capital imobilizado
```

### 1.3. Importância para Negócio OPME

```yaml
Por que é CRÍTICO:

  Capital Imobilizado:
    - 60-70% do capital está em estoque
    - Produtos de alto valor (R$ 10K - R$ 200K)
    - Custo de oportunidade alto
    - Gestão eficiente = competitividade

  Validade Crítica:
    - Produtos com validade curta (6-12 meses)
    - Perdas podem chegar a 10% do estoque
    - R$ 500K - R$ 2M de prejuízo anual
    - Prevenção é essencial

  Disponibilidade:
    - Ruptura = perda de cirurgia
    - Ruptura = perda de cliente
    - Urgências não podem esperar
    - Reputação em jogo

  Rastreabilidade:
    - ANVISA exige controle rigoroso
    - Recall de produtos
    - Auditorias frequentes
    - Multas pesadas por não conformidade

  Compliance:
    - RDC 16/2013 (rastreabilidade)
    - Boas Práticas de Armazenamento
    - Controle de temperatura
    - Segregação de produtos
```

---

## 2. ARQUITETURA ESTOQUE

### 2.1. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│              ESTOQUE INTELIGENTE - ARQUITETURA                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  PRESENTATION LAYER                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │  Dashboard   │  │  Inventário  │  │ Movimentação │ │    │
│  │  │   Estoque    │  │   Atual      │  │   Produtos   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │  Controle    │  │   Ponto de   │  │   Análise    │ │    │
│  │  │  Validade    │  │  Reposição   │  │   ABC/XYZ    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              BUSINESS LOGIC LAYER                       │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         EstoqueService.ts                        │  │    │
│  │  │  - CRUD de estoque                               │  │    │
│  │  │  - Movimentações                                 │  │    │
│  │  │  - Controle de lotes                             │  │    │
│  │  │  - Validações                                    │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         EstoqueAI.ts (IA)                       │  │    │
│  │  │  - Previsão de demanda                           │  │    │
│  │  │  - Análise ABC/XYZ                               │  │    │
│  │  │  - Sugestão de compras                           │  │    │
│  │  │  - Detecção de anomalias                         │  │    │
│  │  │  - Otimização de estoque                         │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         ValidadeService.ts                       │  │    │
│  │  │  - Controle de vencimentos                       │  │    │
│  │  │  - Alertas automáticos                           │  │    │
│  │  │  - FEFO (First Expire First Out)                 │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            INTEGRATION LAYER                            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Compras    │  │   Cirurgias  │  │     NF-e     │ │    │
│  │  │  Automático  │  │  Reserva Kit │  │   Entrada    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   ANVISA     │  │   Código     │  │     IoT      │ │    │
│  │  │Rastreabilid. │  │   Barras     │  │  Sensores    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    DATA LAYER                           │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │          Supabase PostgreSQL                      │  │    │
│  │  │  - estoque                                        │  │    │
│  │  │  - estoque_movimentacoes                          │  │    │
│  │  │  - estoque_lotes                                  │  │    │
│  │  │  - estoque_reservas                               │  │    │
│  │  │  - estoque_localizacoes                           │  │    │
│  │  │  - estoque_armazens                               │  │    │
│  │  │  - estoque_inventarios                            │  │    │
│  │  │  - estoque_alertas                                │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Modelo de Dados

```sql
-- ============================================
-- ESTOQUE INTELIGENTE - TABELAS
-- ============================================

-- Armazéns
CREATE TABLE estoque_armazens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- matriz, filial, deposito
  
  -- Endereço
  endereco TEXT,
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  
  -- Capacidade
  capacidade_m3 DECIMAL(10, 2),
  capacidade_utilizada_m3 DECIMAL(10, 2),
  
  -- Controle
  ativo BOOLEAN DEFAULT TRUE,
  responsavel_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Localizações dentro do armazém
CREATE TABLE estoque_localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  armazem_id UUID REFERENCES estoque_armazens(id),
  codigo VARCHAR(50) NOT NULL, -- Ex: A01-P03-N02 (corredor-prateleira-nível)
  descricao VARCHAR(200),
  
  tipo VARCHAR(50), -- prateleira, geladeira, cofre
  capacidade_itens INTEGER,
  
  -- Controle de temperatura (se aplicável)
  temperatura_min DECIMAL(5, 2),
  temperatura_max DECIMAL(5, 2),
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(armazem_id, codigo)
);

-- Estoque Atual
CREATE TABLE estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  armazem_id UUID REFERENCES estoque_armazens(id) NOT NULL,
  localizacao_id UUID REFERENCES estoque_localizacoes(id),
  
  -- Quantidades
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_reservada INTEGER DEFAULT 0,
  quantidade_disponivel INTEGER GENERATED ALWAYS AS (quantidade - quantidade_reservada) STORED,
  
  -- Lote e Validade
  lote VARCHAR(100),
  serie VARCHAR(100),
  data_fabricacao DATE,
  data_validade DATE,
  
  -- Valores
  custo_unitario DECIMAL(15, 2),
  custo_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantidade * custo_unitario) STORED,
  
  -- Controle
  status VARCHAR(50) DEFAULT 'disponivel',
  -- disponivel, reservado, bloqueado, vencido, quarentena
  
  -- Nota Fiscal de Entrada
  nfe_numero VARCHAR(50),
  nfe_data DATE,
  fornecedor_id UUID REFERENCES fornecedores(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(produto_id, armazem_id, lote, serie)
);

-- Movimentações de Estoque
CREATE TABLE estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  armazem_origem_id UUID REFERENCES estoque_armazens(id),
  armazem_destino_id UUID REFERENCES estoque_armazens(id),
  
  tipo VARCHAR(50) NOT NULL,
  -- entrada, saida, transferencia, ajuste, devolucao, perda
  
  quantidade INTEGER NOT NULL,
  lote VARCHAR(100),
  serie VARCHAR(100),
  
  -- Motivo
  motivo VARCHAR(50),
  -- compra, venda, cirurgia, transferencia, ajuste_inventario,
  -- devolucao_fornecedor, devolucao_cliente, vencimento, perda
  
  -- Referências
  cirurgia_id UUID REFERENCES cirurgias(id),
  compra_id UUID REFERENCES compras(id),
  venda_id UUID REFERENCES vendas(id),
  
  -- Documentação
  documento_tipo VARCHAR(50), -- nfe, nfs, pedido, inventario
  documento_numero VARCHAR(100),
  
  -- Valores
  custo_unitario DECIMAL(15, 2),
  valor_total DECIMAL(15, 2),
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  data_movimentacao TIMESTAMP DEFAULT NOW(),
  usuario_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reservas de Estoque
CREATE TABLE estoque_reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  estoque_id UUID REFERENCES estoque(id),
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  
  quantidade INTEGER NOT NULL,
  
  -- Motivo da Reserva
  motivo VARCHAR(50) NOT NULL, -- cirurgia, pedido, transferencia
  cirurgia_id UUID REFERENCES cirurgias(id),
  pedido_id UUID,
  
  -- Validade da Reserva
  data_reserva TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'ativa',
  -- ativa, consumida, cancelada, expirada
  
  usuario_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Controle de Lotes Detalhado
CREATE TABLE estoque_lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id) NOT NULL,
  lote VARCHAR(100) NOT NULL,
  serie VARCHAR(100),
  
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  
  fornecedor_id UUID REFERENCES fornecedores(id),
  nfe_numero VARCHAR(50),
  nfe_data DATE,
  
  -- Certificados
  certificado_qualidade TEXT,
  laudo_tecnico TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'ativo',
  -- ativo, vencido, bloqueado, recall
  
  bloqueado BOOLEAN DEFAULT FALSE,
  motivo_bloqueio TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(produto_id, lote, serie)
);

-- Inventários (Contagens Físicas)
CREATE TABLE estoque_inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  numero_inventario VARCHAR(50) UNIQUE NOT NULL,
  armazem_id UUID REFERENCES estoque_armazens(id),
  
  tipo VARCHAR(50) NOT NULL, -- geral, rotativo, por_categoria
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'em_andamento',
  -- em_andamento, concluido, aprovado, cancelado
  
  -- Responsáveis
  coordenador_id UUID REFERENCES usuarios(id),
  equipe_contagem JSONB, -- Array de user IDs
  
  -- Resultados
  total_itens_contados INTEGER DEFAULT 0,
  total_divergencias INTEGER DEFAULT 0,
  valor_divergencias DECIMAL(15, 2) DEFAULT 0,
  
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Itens do Inventário
CREATE TABLE estoque_inventarios_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  inventario_id UUID REFERENCES estoque_inventarios(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_opme(id),
  
  -- Quantidade Sistema
  quantidade_sistema INTEGER NOT NULL,
  
  -- Quantidade Física (Contagem)
  quantidade_fisica INTEGER,
  
  -- Divergência
  divergencia INTEGER GENERATED ALWAYS AS (quantidade_fisica - quantidade_sistema) STORED,
  
  lote VARCHAR(100),
  localizacao_id UUID REFERENCES estoque_localizacoes(id),
  
  -- Contagem
  data_contagem TIMESTAMP,
  usuario_contagem_id UUID REFERENCES usuarios(id),
  
  -- Observações
  observacoes TEXT,
  foto_evidencia TEXT, -- URL da foto
  
  status VARCHAR(50) DEFAULT 'pendente',
  -- pendente, contado, conferido, ajustado
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alertas de Estoque
CREATE TABLE estoque_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id),
  tipo VARCHAR(50) NOT NULL,
  -- estoque_baixo, ponto_reposicao, vencimento_proximo,
  -- ruptura, excesso, lote_bloqueado
  
  severidade VARCHAR(20) DEFAULT 'media',
  -- baixa, media, alta, critica
  
  mensagem TEXT NOT NULL,
  
  -- Dados do Alerta
  quantidade_atual INTEGER,
  quantidade_minima INTEGER,
  dias_vencimento INTEGER,
  
  status VARCHAR(50) DEFAULT 'ativo',
  -- ativo, resolvido, ignorado
  
  data_resolucao TIMESTAMP,
  resolvido_por UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX idx_estoque_produto ON estoque(produto_id);
CREATE INDEX idx_estoque_armazem ON estoque(armazem_id);
CREATE INDEX idx_estoque_validade ON estoque(data_validade);
CREATE INDEX idx_estoque_status ON estoque(status);
CREATE INDEX idx_movimentacoes_data ON estoque_movimentacoes(data_movimentacao);
CREATE INDEX idx_movimentacoes_produto ON estoque_movimentacoes(produto_id);
CREATE INDEX idx_movimentacoes_tipo ON estoque_movimentacoes(tipo);
CREATE INDEX idx_lotes_validade ON estoque_lotes(data_validade);
CREATE INDEX idx_lotes_produto ON estoque_lotes(produto_id);
CREATE INDEX idx_reservas_status ON estoque_reservas(status);
CREATE INDEX idx_reservas_expiracao ON estoque_reservas(data_expiracao);
CREATE INDEX idx_alertas_status ON estoque_alertas(status);
CREATE INDEX idx_alertas_severidade ON estoque_alertas(severidade);

-- Triggers
CREATE OR REPLACE FUNCTION atualizar_quantidade_reservada()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ativa' THEN
    UPDATE estoque
    SET quantidade_reservada = quantidade_reservada + NEW.quantidade
    WHERE id = NEW.estoque_id;
  ELSIF OLD.status = 'ativa' AND NEW.status != 'ativa' THEN
    UPDATE estoque
    SET quantidade_reservada = quantidade_reservada - OLD.quantidade
    WHERE id = OLD.estoque_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_reservas
AFTER INSERT OR UPDATE ON estoque_reservas
FOR EACH ROW
EXECUTE FUNCTION atualizar_quantidade_reservada();
```

---

## 3. DASHBOARD ESTOQUE

### 3.1. KPIs Principais

```typescript
/**
 * Dashboard de Estoque Inteligente
 * 
 * KPIS PRINCIPAIS:
 * 1. Valor Total em Estoque
 * 2. Giro de Estoque (vezes/ano)
 * 3. Produtos em Ruptura
 * 4. Itens Vencendo (30 dias)
 * 5. Taxa de Acurácia
 * 6. Cobertura de Estoque (dias)
 * 7. Capital Imobilizado
 * 8. Itens Abaixo do Mínimo
 */

export const DashboardEstoque: React.FC = () => {
  const { kpis, loading } = useEstoqueKPIs();
  const { alertas } = useAlertasEstoque();

  return (
    <div className="space-y-6">
      {/* KPIs Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          label="Valor Total Estoque"
          value={formatCurrency(kpis.valorTotal)}
          icon={<Package />}
          subtitle={`${kpis.totalItens.toLocaleString()} itens`}
        />
        
        <KPICard
          label="Giro de Estoque"
          value={`${kpis.giroEstoque}x/ano`}
          icon={<RefreshCw />}
          trend={{ 
            direction: kpis.giroEstoque > 8 ? 'up' : 'down',
            percentage: 5.2
          }}
        />
        
        <KPICard
          label="Produtos em Ruptura"
          value={kpis.rupturas}
          icon={<AlertTriangle />}
          variant={kpis.rupturas > 0 ? 'destructive' : 'success'}
        />
        
        <KPICard
          label="Vencendo (30 dias)"
          value={kpis.vencendo30}
          icon={<Calendar />}
          variant={kpis.vencendo30 > 5 ? 'warning' : 'default'}
          subtitle={formatCurrency(kpis.valorVencendo30)}
        />
      </div>

      {/* KPIs Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          label="Taxa de Acurácia"
          value={`${kpis.taxaAcuracia}%`}
          icon={<CheckCircle />}
          variant={kpis.taxaAcuracia >= 99 ? 'success' : 'warning'}
        />
        
        <KPICard
          label="Cobertura (dias)"
          value={`${kpis.coberturaEstoque} dias`}
          icon={<TrendingUp />}
        />
        
        <KPICard
          label="Capital Imobilizado"
          value={formatCurrency(kpis.capitalImobilizado)}
          icon={<DollarSign />}
          subtitle={`${kpis.percentualCapital}% do total`}
        />
        
        <KPICard
          label="Abaixo do Mínimo"
          value={kpis.abaixoMinimo}
          icon={<TrendingDown />}
          variant={kpis.abaixoMinimo > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Alertas Críticos */}
      {alertas.length > 0 && (
        <Card title="Alertas Críticos" padding="md">
          <div className="space-y-3">
            {alertas.map((alerta, idx) => (
              <Alert key={idx} variant={getAlertVariant(alerta.severidade)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alerta.tipo}</AlertTitle>
                <AlertDescription>
                  {alerta.mensagem}
                  <Button 
                    variant="link" 
                    className="ml-2"
                    onClick={() => handleVerProduto(alerta.produto_id)}
                  >
                    Ver produto →
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução do Estoque */}
        <Card title="Evolução de Estoque - 12 Meses" padding="md">
          <LineChart
            data={kpis.evolucaoEstoque}
            lines={[
              { key: 'valor', name: 'Valor', color: '#6366f1' },
              { key: 'quantidade', name: 'Quantidade', color: '#10b981' }
            ]}
          />
        </Card>

        {/* Distribuição ABC */}
        <Card title="Análise ABC" padding="md">
          <PieChart
            data={kpis.distribuicaoABC}
            label="classe"
            value="valor"
          />
        </Card>

        {/* Top Produtos por Valor */}
        <Card title="Top 10 Produtos (Valor em Estoque)" padding="md">
          <BarChart
            data={kpis.topProdutos}
            xAxis="produto"
            yAxis="valor"
            horizontal
            formatY={(v) => formatCurrency(v)}
          />
        </Card>

        {/* Movimentações Recentes */}
        <Card title="Movimentações Últimos 7 Dias" padding="md">
          <BarChart
            data={kpis.movimentacoesRecentes}
            xAxis="data"
            yAxis="quantidade"
          />
        </Card>
      </div>

      {/* IA Insights */}
      <Card 
        title="Insights de IA - Estoque" 
        padding="md"
        icon={<Sparkles />}
      >
        <div className="space-y-4">
          {kpis.insightsIA.map((insight, idx) => (
            <Alert key={idx} variant="info">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{insight.titulo}</AlertTitle>
              <AlertDescription>{insight.descricao}</AlertDescription>
            </Alert>
          ))}
        </div>
      </Card>

      {/* Tabela de Produtos Críticos */}
      <Card title="Produtos que Requerem Atenção" padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Estoque Atual</TableHead>
              <TableHead>Estoque Mínimo</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kpis.produtosCriticos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell className="font-medium">
                  {produto.descricao}
                </TableCell>
                <TableCell>
                  <Badge variant={produto.quantidade < produto.estoque_minimo ? 'destructive' : 'default'}>
                    {produto.quantidade}
                  </Badge>
                </TableCell>
                <TableCell>{produto.estoque_minimo}</TableCell>
                <TableCell>
                  {produto.dias_vencimento <= 30 ? (
                    <Badge variant="warning">
                      {produto.dias_vencimento} dias
                    </Badge>
                  ) : (
                    formatDate(produto.data_validade)
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(produto.status)}>
                    {produto.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      Solicitar Compra
                    </Button>
                    <Button size="sm" variant="secondary">
                      Ver Detalhes
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
```

Devido ao limite de caracteres, vou continuar a documentação em um segundo arquivo com as seções restantes (4-21).

