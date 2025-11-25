# 📦 ESTOQUE E CONSIGNAÇÃO - PARTE 2 (Seções 4-10)

**Continuação do arquivo**: MODULO_ESTOQUE_CONSIGNACAO_COMPLETO.md

---

## 4. GESTÃO DE INVENTÁRIO

### 4.1. Interface de Estoque

```typescript
/**
 * Gestão de Inventário Atual
 * 
 * Funcionalidades:
 * - Visualização em tempo real
 * - Filtros avançados
 * - Busca por código/lote/série
 * - Exportação
 */

export const GestaoInventario: React.FC = () => {
  const { produtos, loading } = useEstoque();
  const [filtros, setFiltros] = useState<FiltrosEstoque>({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventário de Estoque</h2>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Download />}>
            Exportar Excel
          </Button>
          <Button variant="primary" icon={<Plus />}>
            Nova Entrada
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Armazém"
            value={filtros.armazem}
            onChange={(v) => setFiltros({ ...filtros, armazem: v })}
            options={ARMAZENS}
          />
          <Select
            placeholder="Categoria"
            value={filtros.categoria}
            onChange={(v) => setFiltros({ ...filtros, categoria: v })}
            options={CATEGORIAS}
          />
          <Select
            placeholder="Status"
            value={filtros.status}
            onChange={(v) => setFiltros({ ...filtros, status: v })}
            options={[
              { value: 'disponivel', label: 'Disponível' },
              { value: 'reservado', label: 'Reservado' },
              { value: 'bloqueado', label: 'Bloqueado' },
              { value: 'vencido', label: 'Vencido' }
            ]}
          />
          <Input
            placeholder="Buscar por nome, lote, série..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
          />
        </div>
      </Card>

      {/* Tabela de Estoque */}
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Armazém</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Qtd Disponível</TableHead>
              <TableHead>Reservado</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Valor Unit.</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.produto.descricao}
                  <p className="text-xs text-gray-500">
                    Cód: {item.produto.codigo_interno}
                  </p>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {item.lote}
                  {item.serie && <p className="text-xs">S/N: {item.serie}</p>}
                </TableCell>
                <TableCell>{item.armazem.nome}</TableCell>
                <TableCell className="font-mono text-sm">
                  {item.localizacao?.codigo || '-'}
                </TableCell>
                <TableCell>
                  <span className={item.quantidade_disponivel === 0 ? 'text-red-600 font-bold' : ''}>
                    {item.quantidade_disponivel}
                  </span>
                </TableCell>
                <TableCell>
                  {item.quantidade_reservada > 0 ? (
                    <Badge variant="warning">{item.quantidade_reservada}</Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {item.dias_vencimento <= 30 ? (
                    <Badge variant="destructive">
                      {item.dias_vencimento} dias
                    </Badge>
                  ) : item.dias_vencimento <= 90 ? (
                    <Badge variant="warning">
                      {formatDate(item.data_validade)}
                    </Badge>
                  ) : (
                    formatDate(item.data_validade)
                  )}
                </TableCell>
                <TableCell>{formatCurrency(item.custo_unitario)}</TableCell>
                <TableCell className="font-semibold text-indigo-600">
                  {formatCurrency(item.custo_total)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleMovimentar(item.id)}>
                        <MoveIcon className="mr-2 h-4 w-4" />
                        Movimentar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReservar(item.id)}>
                        <Lock className="mr-2 h-4 w-4" />
                        Reservar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAjustar(item.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Ajustar Quantidade
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVerHistorico(item.id)}>
                        <History className="mr-2 h-4 w-4" />
                        Ver Histórico
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

---

## 5. MOVIMENTAÇÕES

### 5.1. Formulário de Movimentação

**Arquivo**: `/components/formularios/FormularioMovimentacaoEstoque.tsx`

```typescript
/**
 * Formulário de Movimentação de Estoque
 * 
 * TIPOS DE MOVIMENTAÇÃO:
 * - Entrada (compra, devolução, ajuste positivo)
 * - Saída (venda, consumo, ajuste negativo)
 * - Transferência (entre armazéns)
 * - Perda (vencimento, dano, roubo)
 */

export const FormularioMovimentacaoEstoque: React.FC = () => {
  const [formData, setFormData] = useState<MovimentacaoFormData>({});

  return (
    <FormularioContainer title="Movimentação de Estoque">
      <Card title="Tipo de Movimentação" padding="lg">
        <Select
          label="Tipo"
          value={formData.tipo}
          onChange={(v) => setFormData({ ...formData, tipo: v })}
          options={[
            { value: 'entrada', label: 'Entrada' },
            { value: 'saida', label: 'Saída' },
            { value: 'transferencia', label: 'Transferência' },
            { value: 'ajuste', label: 'Ajuste' },
            { value: 'perda', label: 'Perda' }
          ]}
          required
        />
      </Card>

      <Card title="Dados da Movimentação" padding="lg">
        <div className="grid grid-cols-2 gap-4">
          <AutocompleteInput
            label="Produto"
            value={formData.produto_id}
            onSearch={searchProdutos}
            required
          />

          {formData.tipo === 'transferencia' ? (
            <>
              <Select
                label="Armazém Origem"
                value={formData.armazem_origem}
                options={ARMAZENS}
                required
              />
              <Select
                label="Armazém Destino"
                value={formData.armazem_destino}
                options={ARMAZENS}
                required
              />
            </>
          ) : (
            <Select
              label="Armazém"
              value={formData.armazem}
              options={ARMAZENS}
              required
            />
          )}

          <Input
            label="Quantidade"
            type="number"
            value={formData.quantidade}
            onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
            min="1"
            required
          />

          {formData.tipo === 'entrada' && (
            <>
              <Input
                label="Lote"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                required
              />
              <Input
                label="Série (opcional)"
                value={formData.serie}
                onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
              />
              <Input
                label="Data de Validade"
                type="date"
                value={formData.data_validade}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Input
                label="Custo Unitário (R$)"
                type="number"
                value={formData.custo_unitario}
                step="0.01"
                required
              />
            </>
          )}

          <Select
            label="Motivo"
            value={formData.motivo}
            onChange={(v) => setFormData({ ...formData, motivo: v })}
            options={this.getMotivosDisponiveis(formData.tipo)}
            required
          />
        </div>

        <Textarea
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={3}
          className="mt-4"
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Cancelar</Button>
        <Button variant="primary" icon={<Check />}>
          Confirmar Movimentação
        </Button>
      </div>
    </FormularioContainer>
  );
};
```

---

## 6. CONTROLE DE VALIDADE

### 6.1. Sistema de Alertas FEFO

```typescript
/**
 * First Expire First Out (FEFO)
 * 
 * Prioriza saída de produtos próximos ao vencimento
 * 
 * ALERTAS:
 * - 90 dias: Alerta preventivo
 * - 60 dias: Alerta médio
 * - 30 dias: Alerta crítico
 * - 15 dias: Alerta urgente
 * - Vencido: Bloqueio automático
 */

export class ValidadeService {
  async verificarVencimentos(): Promise<void> {
    const hoje = new Date();

    // Buscar produtos próximos ao vencimento
    const { data: produtos } = await supabase
      .from('estoque')
      .select('*, produto:produtos_opme(*)')
      .gte('data_validade', hoje.toISOString())
      .lte('data_validade', addDays(hoje, 90).toISOString())
      .eq('status', 'disponivel');

    for (const item of produtos || []) {
      const diasVencimento = differenceInDays(new Date(item.data_validade), hoje);

      if (diasVencimento <= 15) {
        await this.criarAlerta(item, 'critica', diasVencimento);
        await this.notificarGestores(item, 'urgente');
      } else if (diasVencimento <= 30) {
        await this.criarAlerta(item, 'alta', diasVencimento);
        await this.notificarGestores(item, 'critico');
      } else if (diasVencimento <= 60) {
        await this.criarAlerta(item, 'media', diasVencimento);
      } else if (diasVencimento <= 90) {
        await this.criarAlerta(item, 'baixa', diasVencimento);
      }
    }

    // Bloquear produtos vencidos
    await this.bloquearVencidos();
  }

  async bloquearVencidos(): Promise<void> {
    const hoje = new Date();

    await supabase
      .from('estoque')
      .update({ status: 'vencido' })
      .lt('data_validade', hoje.toISOString())
      .eq('status', 'disponivel');

    // Registrar bloqueio
    const { data: bloqueados } = await supabase
      .from('estoque')
      .select('*')
      .eq('status', 'vencido');

    for (const item of bloqueados || []) {
      await this.registrarBloqueio(item, 'Produto vencido - bloqueio automático');
    }
  }

  async sugerirAcoesVencimento(produtoId: string): Promise<string[]> {
    const { data: estoque } = await supabase
      .from('estoque')
      .select('*, produto:produtos_opme(*)')
      .eq('produto_id', produtoId)
      .lte('data_validade', addDays(new Date(), 60))
      .eq('status', 'disponivel');

    const acoes: string[] = [];

    if (estoque && estoque.length > 0) {
      const item = estoque[0];
      const diasVencimento = differenceInDays(new Date(item.data_validade), new Date());

      if (diasVencimento <= 30) {
        acoes.push('URGENTE: Criar promoção para este produto');
        acoes.push('Contactar clientes que já compraram este item');
        acoes.push('Considerar devolução ao fornecedor (se aceitar)');
      } else if (diasVencimento <= 60) {
        acoes.push('Oferecer desconto de 10-15% para clientes');
        acoes.push('Incluir em campanhas de marketing');
        acoes.push('Verificar possibilidade de uso em consignação');
      }

      acoes.push(`Ajustar preço de venda considerando ${diasVencimento} dias restantes`);
    }

    return acoes;
  }
}
```

---

## 7. PONTO DE REPOSIÇÃO

### 7.1. Cálculo Automático

```typescript
/**
 * Ponto de Reposição Inteligente
 * 
 * FÓRMULA:
 * Ponto Reposição = (Demanda Média × Lead Time) + Estoque Segurança
 * 
 * ESTOQUE SEGURANÇA:
 * Cobertura de variação de demanda e lead time
 * 
 * IA AJUSTA AUTOMATICAMENTE:
 * - Baseado em histórico
 * - Sazonalidade
 * - Tendências
 */

export class PontoReposicaoService {
  async calcularPontoReposicao(produtoId: string): Promise<PontoReposicao> {
    // Buscar histórico de consumo (últimos 12 meses)
    const { data: historico } = await supabase
      .from('estoque_movimentacoes')
      .select('quantidade, data_movimentacao')
      .eq('produto_id', produtoId)
      .eq('tipo', 'saida')
      .gte('data_movimentacao', subMonths(new Date(), 12).toISOString())
      .order('data_movimentacao', { ascending: true });

    if (!historico || historico.length < 30) {
      // Sem histórico suficiente, usar padrões
      return {
        ponto_reposicao: 10,
        estoque_seguranca: 5,
        estoque_maximo: 50,
        demanda_media_mensal: 0,
        lead_time_dias: 7,
        confianca: 30
      };
    }

    // Calcular demanda média mensal
    const totalConsumido = historico.reduce((sum, h) => sum + h.quantidade, 0);
    const meses = historico.length / 30; // Aproximadamente
    const demandaMediaMensal = totalConsumido / meses;
    const demandaMediaDiaria = demandaMediaMensal / 30;

    // Calcular desvio padrão (para estoque de segurança)
    const desvio = this.calcularDesvio(historico);

    // Buscar lead time do fornecedor
    const { data: fornecedorPrincipal } = await supabase
      .from('produtos_opme')
      .select('fornecedor:fornecedores(prazo_entrega_medio)')
      .eq('id', produtoId)
      .single();

    const leadTime = fornecedorPrincipal?.fornecedor?.prazo_entrega_medio || 7;

    // Calcular
    const estoqueSeguranca = Math.ceil(desvio * Math.sqrt(leadTime));
    const pontoReposicao = Math.ceil((demandaMediaDiaria * leadTime) + estoqueSeguranca);
    const estoqueMaximo = Math.ceil(pontoReposicao + demandaMediaMensal);

    // Atualizar no produto
    await supabase
      .from('produtos_opme')
      .update({
        estoque_minimo: pontoReposicao,
        estoque_maximo: estoqueMaximo,
        estoque_seguranca: estoqueSeguranca
      })
      .eq('id', produtoId);

    return {
      ponto_reposicao: pontoReposicao,
      estoque_seguranca: estoqueSeguranca,
      estoque_maximo: estoqueMaximo,
      demanda_media_mensal: Math.round(demandaMediaMensal),
      lead_time_dias: leadTime,
      confianca: 85
    };
  }

  async verificarPontosReposicao(): Promise<void> {
    // Buscar produtos abaixo do ponto de reposição
    const { data: produtos } = await supabase
      .rpc('produtos_abaixo_ponto_reposicao');

    for (const produto of produtos || []) {
      // Criar alerta
      await supabase.from('estoque_alertas').insert({
        produto_id: produto.id,
        tipo: 'ponto_reposicao',
        severidade: 'alta',
        mensagem: `${produto.descricao} está abaixo do ponto de reposição (${produto.quantidade_atual} < ${produto.estoque_minimo})`,
        quantidade_atual: produto.quantidade_atual,
        quantidade_minima: produto.estoque_minimo
      });

      // Sugerir compra automática
      await this.sugerirCompraAutomatica(produto);
    }
  }

  private async sugerirCompraAutomatica(produto: any): Promise<void> {
    const quantidadeSugerida = produto.estoque_maximo - produto.quantidade_atual;

    // Criar solicitação de compra
    await supabase.from('compras_solicitacoes').insert({
      produto_id: produto.id,
      quantidade: quantidadeSugerida,
      motivo: 'reposicao_automatica',
      prioridade: produto.quantidade_atual === 0 ? 'urgente' : 'normal',
      gerada_automaticamente: true,
      status: 'pendente'
    });
  }
}

// View SQL para produtos abaixo do ponto
CREATE OR REPLACE FUNCTION produtos_abaixo_ponto_reposicao()
RETURNS TABLE (
  id UUID,
  descricao VARCHAR,
  quantidade_atual INTEGER,
  estoque_minimo INTEGER,
  estoque_maximo INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.descricao,
    COALESCE(SUM(e.quantidade_disponivel), 0)::INTEGER as quantidade_atual,
    p.estoque_minimo,
    p.estoque_maximo
  FROM produtos_opme p
  LEFT JOIN estoque e ON e.produto_id = p.id AND e.status = 'disponivel'
  GROUP BY p.id, p.descricao, p.estoque_minimo, p.estoque_maximo
  HAVING COALESCE(SUM(e.quantidade_disponivel), 0) < p.estoque_minimo;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. IA PARA ESTOQUE

### 8.1. Previsão de Demanda

**Arquivo**: `/lib/services/ai/EstoqueAI.ts` (já existe no sistema)

```typescript
/**
 * EstoqueAI - Inteligência Artificial para Estoque
 * 
 * ALGORITMOS:
 * 1. Previsão de Demanda (Time Series - ARIMA)
 * 2. Análise ABC/XYZ
 * 3. Otimização de Estoque (EOQ - Economic Order Quantity)
 * 4. Detecção de Anomalias
 * 5. Sugestão de Compras
 */

export class EstoqueAI extends BaseAIService {
  constructor() {
    super('EstoqueAI');
  }

  /**
   * Prever demanda futura
   */
  async preverDemanda(params: {
    produtoId: string;
    mesesPrevisao: number;
  }): Promise<PrevisaoDemanda> {
    // Buscar histórico de consumo
    const { data: historico } = await supabase
      .from('estoque_movimentacoes')
      .select('quantidade, data_movimentacao')
      .eq('produto_id', params.produtoId)
      .eq('tipo', 'saida')
      .gte('data_movimentacao', subMonths(new Date(), 12).toISOString())
      .order('data_movimentacao', { ascending: true });

    if (!historico || historico.length < 30) {
      return {
        previsoes: [],
        confianca: 0,
        metodo: 'insuficiente',
        mensagem: 'Histórico insuficiente para previsão'
      };
    }

    // Agrupar por mês
    const demandaMensal = this.agruparPorMes(historico);

    // Detectar sazonalidade
    const sazonalidade = this.detectarSazonalidade(demandaMensal);

    // Calcular tendência (regressão linear)
    const tendencia = this.calcularTendencia(demandaMensal);

    // Gerar previsões
    const previsoes: PrevisaoMes[] = [];
    
    for (let i = 1; i <= params.mesesPrevisao; i++) {
      const mesIndex = (demandaMensal.length + i - 1) % 12;
      const fatorSazonal = sazonalidade[mesIndex] || 1;
      
      const demandaBase = demandaMensal[demandaMensal.length - 1].quantidade;
      const ajusteTendencia = tendencia * i;
      
      const previsao = Math.round((demandaBase + ajusteTendencia) * fatorSazonal);

      previsoes.push({
        mes: addMonths(new Date(), i),
        demanda_prevista: Math.max(0, previsao),
        limite_inferior: Math.max(0, Math.round(previsao * 0.8)),
        limite_superior: Math.round(previsao * 1.2)
      });
    }

    return {
      previsoes,
      confianca: this.calcularConfianca(historico),
      metodo: 'time_series',
      sazonalidade_detectada: Object.keys(sazonalidade).length > 0,
      tendencia: tendencia > 0 ? 'crescente' : tendencia < 0 ? 'decrescente' : 'estavel'
    };
  }

  /**
   * Análise ABC/XYZ
   */
  async analisarABCXYZ(): Promise<AnaliseABCXYZ> {
    // Buscar todos os produtos com movimento
    const { data: produtos } = await supabase.rpc('calcular_abc_xyz');

    const analise: AnaliseABCXYZ = {
      classe_A: [],
      classe_B: [],
      classe_C: [],
      tipo_X: [],
      tipo_Y: [],
      tipo_Z: []
    };

    for (const produto of produtos) {
      // Classificação ABC (valor)
      if (produto.percentual_acumulado <= 80) {
        analise.classe_A.push(produto);
      } else if (produto.percentual_acumulado <= 95) {
        analise.classe_B.push(produto);
      } else {
        analise.classe_C.push(produto);
      }

      // Classificação XYZ (previsibilidade)
      if (produto.coeficiente_variacao <= 0.5) {
        analise.tipo_X.push(produto);
      } else if (produto.coeficiente_variacao <= 1.0) {
        analise.tipo_Y.push(produto);
      } else {
        analise.tipo_Z.push(produto);
      }
    }

    return analise;
  }

  /**
   * EOQ - Economic Order Quantity (Lote Econômico de Compra)
   */
  calcularEOQ(params: {
    demandaAnual: number;
    custoPedido: number;
    custoArmazenagem: number;
  }): number {
    // Fórmula Wilson: EOQ = √((2 × D × S) / H)
    // D = Demanda anual
    // S = Custo por pedido
    // H = Custo de armazenagem por unidade/ano

    const eoq = Math.sqrt(
      (2 * params.demandaAnual * params.custoPedido) / params.custoArmazenagem
    );

    return Math.round(eoq);
  }

  /**
   * Detectar anomalias no estoque
   */
  async detectarAnomalias(): Promise<Anomalia[]> {
    const anomalias: Anomalia[] = [];

    // 1. Produtos com movimento zero há muito tempo
    const { data: semMovimento } = await supabase.rpc('produtos_sem_movimento', {
      dias: 180
    });

    for (const produto of semMovimento || []) {
      anomalias.push({
        tipo: 'sem_movimento',
        produto_id: produto.id,
        severidade: 'media',
        descricao: `Produto sem movimento há ${produto.dias_parado} dias`,
        acao_sugerida: 'Considerar promoção ou devolução ao fornecedor'
      });
    }

    // 2. Produtos com consumo muito acima da média
    const { data: consumoExcessivo } = await supabase.rpc('produtos_consumo_anomalo');

    for (const produto of consumoExcessivo || []) {
      anomalias.push({
        tipo: 'consumo_excessivo',
        produto_id: produto.id,
        severidade: 'alta',
        descricao: `Consumo ${produto.percentual_acima}% acima da média`,
        acao_sugerida: 'Verificar possível erro de registro ou demanda real aumentada'
      });
    }

    // 3. Divergências de inventário frequentes
    const { data: divergencias } = await supabase.rpc('produtos_divergencias_frequentes');

    for (const produto of divergencias || []) {
      anomalias.push({
        tipo: 'divergencia_inventario',
        produto_id: produto.id,
        severidade: 'alta',
        descricao: `${produto.total_divergencias} divergências nos últimos 6 meses`,
        acao_sugerida: 'Investigar possível furto ou erro de processo'
      });
    }

    return anomalias;
  }

  // Métodos auxiliares privados
  private agruparPorMes(historico: any[]): any[] {
    const agrupado: Record<string, number> = {};

    for (const item of historico) {
      const mes = format(new Date(item.data_movimentacao), 'yyyy-MM');
      agrupado[mes] = (agrupado[mes] || 0) + item.quantidade;
    }

    return Object.entries(agrupado).map(([mes, quantidade]) => ({
      mes,
      quantidade
    }));
  }

  private detectarSazonalidade(demandaMensal: any[]): Record<number, number> {
    // Simplificado: calcular média por mês do ano
    const sazonalidade: Record<number, number[]> = {};

    for (const item of demandaMensal) {
      const mes = new Date(item.mes).getMonth();
      if (!sazonalidade[mes]) sazonalidade[mes] = [];
      sazonalidade[mes].push(item.quantidade);
    }

    const fatores: Record<number, number> = {};
    const mediaGeral = demandaMensal.reduce((s, d) => s + d.quantidade, 0) / demandaMensal.length;

    for (const [mes, valores] of Object.entries(sazonalidade)) {
      const mediaMes = valores.reduce((s, v) => s + v, 0) / valores.length;
      fatores[parseInt(mes)] = mediaMes / mediaGeral;
    }

    return fatores;
  }

  private calcularTendencia(demandaMensal: any[]): number {
    // Regressão linear simples
    const n = demandaMensal.length;
    let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;

    demandaMensal.forEach((item, index) => {
      somaX += index;
      somaY += item.quantidade;
      somaXY += index * item.quantidade;
      somaX2 += index * index;
    });

    const coeficiente = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
    
    return coeficiente;
  }

  private calcularConfianca(historico: any[]): number {
    if (historico.length < 30) return 40;
    if (historico.length < 90) return 65;
    if (historico.length < 180) return 80;
    return 90;
  }

  private calcularDesvio(historico: any[]): number {
    const valores = historico.map(h => h.quantidade);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const variancia = valores.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / valores.length;
    return Math.sqrt(variancia);
  }
}
```

---

## 9. ANÁLISE ABC/XYZ

### 9.1. Matriz ABC/XYZ

```typescript
/**
 * Análise ABC/XYZ
 * 
 * ABC (Valor):
 * - Classe A: 80% do valor (20% dos itens) - Controle rigoroso
 * - Classe B: 15% do valor (30% dos itens) - Controle normal
 * - Classe C: 5% do valor (50% dos itens) - Controle simplificado
 * 
 * XYZ (Previsibilidade):
 * - Tipo X: Demanda constante (CV < 0.5)
 * - Tipo Y: Demanda variável (0.5 < CV < 1.0)
 * - Tipo Z: Demanda irregular (CV > 1.0)
 * 
 * ESTRATÉGIAS:
 * - AX: Estoque Just-in-Time
 * - AY: Estoque segurança alto
 * - AZ: Estoque por demanda
 * - BX: Estoque moderado
 * - BY: Revisão frequente
 * - BZ: Estoque mínimo
 * - CX: Estoque padrão
 * - CY: Revisão esporádica
 * - CZ: Compra sob demanda
 */

export const AnaliseABCXYZ: React.FC = () => {
  const { analise, loading } = useAnaliseABCXYZ();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análise ABC/XYZ</h2>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-6">
        <Card padding="lg">
          <h3 className="font-semibold mb-4">Classe A</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {analise.classe_A.length}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {formatCurrency(analise.valorClasseA)} (80% do valor)
          </p>
        </Card>

        <Card padding="lg">
          <h3 className="font-semibold mb-4">Classe B</h3>
          <p className="text-3xl font-bold">
            {analise.classe_B.length}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {formatCurrency(analise.valorClasseB)} (15% do valor)
          </p>
        </Card>

        <Card padding="lg">
          <h3 className="font-semibold mb-4">Classe C</h3>
          <p className="text-3xl font-bold">
            {analise.classe_C.length}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {formatCurrency(analise.valorClasseC)} (5% do valor)
          </p>
        </Card>
      </div>

      {/* Matriz ABC/XYZ */}
      <Card title="Matriz ABC/XYZ" padding="md">
        <MatrizABCXYZ data={analise} />
      </Card>

      {/* Estratégias por Classificação */}
      <Card title="Estratégias Recomendadas" padding="md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classificação</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Estratégia de Estoque</TableHead>
              <TableHead>Frequência Revisão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge>AX</Badge></TableCell>
              <TableCell>{analise.matriz.AX?.length || 0}</TableCell>
              <TableCell>Just-in-Time (mínimo)</TableCell>
              <TableCell>Diária</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>AY</Badge></TableCell>
              <TableCell>{analise.matriz.AY?.length || 0}</TableCell>
              <TableCell>Estoque segurança alto</TableCell>
              <TableCell>Semanal</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>AZ</Badge></TableCell>
              <TableCell>{analise.matriz.AZ?.length || 0}</TableCell>
              <TableCell>Compra por demanda</TableCell>
              <TableCell>Por demanda</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>BX</Badge></TableCell>
              <TableCell>{analise.matriz.BX?.length || 0}</TableCell>
              <TableCell>Estoque moderado</TableCell>
              <TableCell>Quinzenal</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>BY</Badge></TableCell>
              <TableCell>{analise.matriz.BY?.length || 0}</TableCell>
              <TableCell>Revisão frequente</TableCell>
              <TableCell>Mensal</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>BZ</Badge></TableCell>
              <TableCell>{analise.matriz.BZ?.length || 0}</TableCell>
              <TableCell>Estoque mínimo</TableCell>
              <TableCell>Bimestral</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>CX</Badge></TableCell>
              <TableCell>{analise.matriz.CX?.length || 0}</TableCell>
              <TableCell>Estoque padrão</TableCell>
              <TableCell>Trimestral</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>CY</Badge></TableCell>
              <TableCell>{analise.matriz.CY?.length || 0}</TableCell>
              <TableCell>Revisão esporádica</TableCell>
              <TableCell>Semestral</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge>CZ</Badge></TableCell>
              <TableCell>{analise.matriz.CZ?.length || 0}</TableCell>
              <TableCell>Compra sob demanda</TableCell>
              <TableCell>Anual</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// View SQL para análise ABC/XYZ
CREATE OR REPLACE FUNCTION calcular_abc_xyz()
RETURNS TABLE (
  produto_id UUID,
  descricao VARCHAR,
  valor_total DECIMAL,
  percentual_acumulado DECIMAL,
  demanda_media DECIMAL,
  coeficiente_variacao DECIMAL,
  classe_abc VARCHAR(1),
  tipo_xyz VARCHAR(1)
) AS $$
BEGIN
  RETURN QUERY
  WITH consumo_produtos AS (
    SELECT 
      p.id,
      p.descricao,
      SUM(m.quantidade * m.custo_unitario) as valor_total,
      AVG(m.quantidade) as demanda_media,
      STDDEV(m.quantidade) / NULLIF(AVG(m.quantidade), 0) as coef_var
    FROM produtos_opme p
    LEFT JOIN estoque_movimentacoes m ON m.produto_id = p.id
    WHERE m.tipo = 'saida'
      AND m.data_movimentacao >= NOW() - INTERVAL '12 months'
    GROUP BY p.id, p.descricao
  ),
  ranking AS (
    SELECT 
      *,
      SUM(valor_total) OVER (ORDER BY valor_total DESC) / 
      SUM(valor_total) OVER () * 100 as perc_acum
    FROM consumo_produtos
  )
  SELECT 
    id as produto_id,
    descricao,
    valor_total,
    perc_acum as percentual_acumulado,
    demanda_media,
    coef_var as coeficiente_variacao,
    CASE 
      WHEN perc_acum <= 80 THEN 'A'
      WHEN perc_acum <= 95 THEN 'B'
      ELSE 'C'
    END as classe_abc,
    CASE 
      WHEN coef_var <= 0.5 THEN 'X'
      WHEN coef_var <= 1.0 THEN 'Y'
      ELSE 'Z'
    END as tipo_xyz
  FROM ranking;
END;
$$ LANGUAGE plpgsql;
```

---

## 10. INTEGRAÇÃO COM COMPRAS

### 10.1. Compra Automática

```typescript
/**
 * Integração Estoque → Compras
 * 
 * Quando produto atinge ponto de reposição:
 * 1. Sistema cria solicitação de compra automaticamente
 * 2. Cota em portais OPME
 * 3. Sugere fornecedor com melhor preço
 * 4. Gestor aprova ou ajusta
 * 5. Gera pedido de compra
 */

export class IntegracaoEstoqueCompras {
  async processarReposicaoAutomatica(): Promise<void> {
    // Buscar produtos abaixo do mínimo
    const { data: produtosReposicao } = await supabase
      .rpc('produtos_abaixo_ponto_reposicao');

    for (const produto of produtosReposicao || []) {
      // Calcular quantidade ideal
      const quantidadeIdeal = produto.estoque_maximo - produto.quantidade_atual;

      // Cotar em portais OPME
      const cotacao = await portaisOPMEService.cotarMultiplosPortais({
        produtoId: produto.id,
        quantidade: quantidadeIdeal
      });

      // Criar solicitação
      const { data: solicitacao } = await supabase
        .from('compras_solicitacoes')
        .insert({
          produto_id: produto.id,
          quantidade: quantidadeIdeal,
          motivo: 'reposicao_automatica',
          prioridade: produto.quantidade_atual === 0 ? 'urgente' : 'normal',
          
          // Dados da cotação
          cotacao_id: cotacao.cotacaoId,
          fornecedor_sugerido_id: await this.getFornecedorId(cotacao.melhorOferta?.fornecedor),
          preco_sugerido: cotacao.melhorOferta?.preco_unitario,
          economia_estimada: (produto.preco_custo_medio - cotacao.melhorOferta?.preco_unitario) * quantidadeIdeal,
          
          gerada_automaticamente: true,
          status: 'aguardando_aprovacao'
        })
        .select()
        .single();

      // Notificar gestor de compras
      await this.notificarGestor(solicitacao);
    }
  }
}
```

Vou continuar no próximo arquivo com a PARTE II - Consignação Avançada (seções 11-21).

