# 📦 CONSIGNAÇÃO AVANÇADA - PARTE 2 FINAL

**Continuação da documentação completa**

---

## 6. KPIS SECUNDÁRIOS - 4 MÉTRICAS

### 6.1. Materiais Disponíveis

```typescript
const materiaisDisponiveis = mockMateriaisConsignados
  .filter(m => m.status === 'disponivel').length;
// Resultado: 2 materiais (CONS001 + CONS004)
```

```yaml
Materiais Disponíveis:
  Valor: 2 materiais
  Percentual: 40% do total
  
  Lista:
    1. CONS001 - Prótese de Joelho Cerâmica (R$ 17.000)
    2. CONS004 - Stent Coronário Premium (R$ 8.400)
  
  Valor Total Disponível: R$ 25.400,00
  
  Significado:
    - Materiais prontos para uso
    - Aguardando cirurgia
    - Capital disponível para faturamento
```

### 6.2. Materiais Reservados

```typescript
const materiaisReservados = mockMateriaisConsignados
  .filter(m => m.status === 'reservado').length;
// Resultado: 1 material (CONS003)
```

```yaml
Materiais Reservados:
  Valor: 1 material
  Percentual: 20% do total
  
  Lista:
    1. CONS003 - Parafusos Pediculares Titânio (R$ 3.600)
       - Hospital: Hospital Regional Norte
       - Reservado para cirurgia amanhã
       - Responsável: Maria Enfermagem
  
  Ações:
    - Confirmar cirurgia
    - Atualizar status após uso
    - Gerar faturamento se utilizado
```

### 6.3. Hospitais Ativos

```typescript
const hospitaisAtivos = new Set(
  mockMateriaisConsignados.map(m => m.hospital.nome)
).size;
// Resultado: 5 hospitais
```

```yaml
Hospitais Ativos:
  Valor: 5 hospitais
  
  Lista Completa:
    1. Hospital São Francisco
       - Materiais: 1 (Prótese Joelho)
       - Valor: R$ 17.000
       - Status: Disponível
       
    2. Clínica Ortopédica Central
       - Materiais: 1 (Kit Instrumentais)
       - Valor: R$ 3.200
       - Status: Utilizado (aguardando faturamento)
       
    3. Hospital Regional Norte
       - Materiais: 1 (Parafusos)
       - Valor: R$ 3.600
       - Status: Reservado
       
    4. Instituto Cardiológico
       - Materiais: 1 (Stent)
       - Valor: R$ 8.400
       - Status: Disponível
       
    5. Hospital Cardio Avançado
       - Materiais: 1 (Marca-passo)
       - Valor: R$ 15.000
       - Status: Devolvido
  
  Distribuição:
    - Disponíveis: 2 hospitais (40%)
    - Utilizados: 1 hospital (20%)
    - Reservados: 1 hospital (20%)
    - Devolvidos: 1 hospital (20%)
```

### 6.4. Custo Total de Carregamento

```typescript
const custoTotalCarregamento = mockMateriaisConsignados
  .reduce((sum, m) => sum + m.custoCarregamento, 0);
// Resultado: R$ 1.161,00
```

```yaml
Custo Total Carregamento:
  Valor: R$ 1.161,00
  Taxa Média: 2.46% do valor consignado
  
  Breakdown por Material:
    - CONS001: R$ 255,00 (45 dias × 1.5%/mês)
    - CONS002: R$ 96,00 (56 dias × 1.5%/mês)
    - CONS003: R$ 108,00 (83 dias × 1.5%/mês)
    - CONS004: R$ 252,00 (15 dias × 1.5%/mês)
    - CONS005: R$ 450,00 (29 dias × 1.5%/mês)
  
  Fórmula:
    Custo = ValorMaterial × (DiasEstoque / 30) × 1.5%
  
  Impacto na Margem:
    - Valor Consignado: R$ 47.200
    - Custo Carregamento: R$ 1.161
    - Impacto: 2.46% de redução na margem
    
  Otimização:
    - Reduzir dias de estoque
    - Priorizar materiais alta rotatividade
    - Devolver materiais parados > 60 dias
```

---

## 7. RELATÓRIO FINANCEIRO

### 7.1. Dados Consolidados

```typescript
const mockRelatorioFinanceiro: RelatorioFinanceiro = {
  id: "REL001",
  periodo: "2024-12",
  valorTotalConsignado: 47200.00,
  valorTotalUtilizado: 3200.00,
  valorTotalDevolvido: 15000.00,
  margemBruta: 18.5,
  margemLiquida: 12.3,
  custosOperacionais: 2840.00,
  giroEstoque: 2.4,
  tempoMedioEstoque: 45.7,
  inadimplencia: 0.8,
  roi: 15.6
};
```

### 7.2. Análise Detalhada

```yaml
Relatório Financeiro - Dezembro 2024:

Valores Totais:
  Consignado: R$ 47.200,00
  Utilizado: R$ 3.200,00 (6.78%)
  Devolvido: R$ 15.000,00 (31.78%)
  Disponível: R$ 25.400,00 (53.81%)
  Reservado: R$ 3.600,00 (7.63%)

Margens:
  Margem Bruta: 18.5%
    - Receita Bruta: R$ 3.200
    - Custo Direto: R$ 2.608
    - Lucro Bruto: R$ 592
  
  Margem Líquida: 12.3%
    - Receita Líquida: R$ 2.584
    - Custos Totais: R$ 2.266
    - Lucro Líquido: R$ 318

Custos Operacionais: R$ 2.840,00
  - Logística (frete): R$ 840,00
  - Carregamento financeiro: R$ 1.161,00
  - Administrativo: R$ 450,00
  - Seguros: R$ 389,00

Performance de Estoque:
  Giro de Estoque: 2.4 vezes/ano
    - Vendas Anuais: R$ 38.400 (projetado)
    - Estoque Médio: R$ 16.000
    - Giro: 38.400 / 16.000 = 2.4
  
  Tempo Médio Estoque: 45.7 dias
    - Meta: < 30 dias
    - Status: ACIMA DA META (52% pior)
  
  Cobertura: 152 dias
    - Estoque atual cobre 5 meses
    - Recomendado: 3 meses máximo

Risco Financeiro:
  Inadimplência: 0.8%
    - Valor em Risco: R$ 377,60
    - Status: BAIXO (excelente)
  
  ROI (Return on Investment): 15.6%
    - Investimento: R$ 47.200
    - Retorno Anual: R$ 7.363
    - Status: BOM (acima de 12%)

Ações Recomendadas:
  1. Reduzir estoque consignado em 30%
  2. Focar em materiais alta rotatividade
  3. Devolver CONS003 (83 dias parado)
  4. Negociar prazos menores de consignação
  5. Implementar penalidade por devolução tardia
```

---

## 8. HEADER E BOTÕES DE AÇÃO

### 8.1. Estrutura do Header

```typescript
<div className="flex items-center justify-between">
  {/* Título e Descrição */}
  <div>
    <h1 className="text-2xl font-semibold text-foreground">
      Consignação Avançada
    </h1>
    <p className="text-muted-foreground">
      Gestão completa de materiais OPME em consignação com controle financeiro e logístico
    </p>
  </div>
  
  {/* Botões de Ação */}
  <div className="flex gap-2">
    {/* 3 Botões */}
  </div>
</div>
```

### 8.2. Botão #1 - Relatório

```typescript
<Button
  variant="outline"
  onClick={() => window.print()}
  className="flex items-center gap-2"
>
  <Download className="w-4 h-4" />
  Relatório
</Button>
```

**Especificações**:
```yaml
Botão Relatório:
  Ícone: Download (Lucide)
  Variant: Outline
  Cor: Border default
  
  Funcionalidade:
    - Abre dialog de impressão do navegador
    - Gera PDF do dashboard atual
    - Inclui todos os KPIs e tabelas visíveis
  
  Conteúdo do Relatório:
    - Cabeçalho com logo e data
    - 13 KPIs principais
    - Listagem de materiais filtrados
    - Gráficos de análise
    - Rodapé com totais
  
  Atalho: Ctrl + P
```

### 8.3. Botão #2 - Financeiro

```typescript
<Button
  variant="outline"
  className="flex items-center gap-2"
  onClick={() => setActiveTab('financeiro')}
>
  <Calculator className="w-4 h-4" />
  Financeiro
</Button>
```

**Especificações**:
```yaml
Botão Financeiro:
  Ícone: Calculator
  Variant: Outline
  Cor: Border default
  
  Funcionalidade:
    - Navega para tab "Financeiro"
    - Mostra análise detalhada de custos
    - Exibe ROI, margens e rentabilidade
  
  Tela de Destino:
    - Gráficos de rentabilidade
    - Breakdown de custos
    - Projeções financeiras
    - Análise de viabilidade
```

### 8.4. Botão #3 - Nova Consignação

```typescript
<Dialog open={isNovaConsignacaoOpen} onOpenChange={setIsNovaConsignacaoOpen}>
  <DialogTrigger asChild>
    <Button className="btn-icarus-primary flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Nova Consignação
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-4xl">
    {/* Formulário */}
  </DialogContent>
</Dialog>
```

**Especificações**:
```yaml
Botão Nova Consignação:
  Ícone: Plus
  Classe: btn-icarus-primary
  Cor Fundo: #6366F1 (Indigo-500)
  Cor Texto: #FFFFFF (Branco)
  
  Funcionalidade:
    - Abre modal de registro
    - Formulário com 8 campos
    - Validação em tempo real
    - Cálculo automático de valores
  
  Campos do Formulário:
    1. Material OPME (Input text)
    2. Fabricante (Select)
    3. Hospital Destino (Select)
    4. Quantidade (Input number)
    5. Valor Unitário (Input currency)
    6. Percentual Comissão (Input number)
    7. Data Vencimento (DatePicker)
    8. Condições Pagamento (Select)
    9. Observações (Textarea)
  
  Validações:
    - Material: obrigatório, min 3 caracteres
    - Quantidade: > 0
    - Valor: > 0
    - Comissão: 0-100%
    - Data: >= hoje
  
  Ações:
    - Cancelar: Fecha modal sem salvar
    - Registrar: Valida e salva no Supabase
```

---

## 9. SISTEMA DE FILTROS

### 9.1. Filtro #1 - Busca Global

```typescript
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input
    placeholder="Buscar materiais, hospitais, lotes..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10"
  />
</div>
```

**Especificações**:
```yaml
Busca Global:
  Ícone: Search (dentro do input)
  Placeholder: "Buscar materiais, hospitais, lotes..."
  
  Campos Pesquisáveis:
    - material.nome
    - material.codigoInterno
    - material.fabricante
    - material.hospital.nome
    - material.lote
    - material.fornecedor
  
  Comportamento:
    - Search em tempo real (onChange)
    - Case insensitive
    - Busca parcial (includes)
    - Combina com outros filtros (AND)
  
  Exemplos de Busca:
    - "joelho" → Encontra CONS001
    - "LOT-2024" → Encontra todos por lote
    - "Hospital São" → Filtra por hospital
    - "ortho" → Fabricante ou hospital
```

### 9.2. Filtro #2 - Status

```typescript
<div className="neomorphic-inset rounded-lg">
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-48 border-none bg-transparent">
      <Filter className="w-4 h-4 mr-2" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="neomorphic-raised">
      <SelectItem value="todos">Todos os Status</SelectItem>
      <SelectItem value="disponivel">Disponível</SelectItem>
      <SelectItem value="reservado">Reservado</SelectItem>
      <SelectItem value="utilizado">Utilizado</SelectItem>
      <SelectItem value="devolvido">Devolvido</SelectItem>
      <SelectItem value="vencido">Vencido</SelectItem>
      <SelectItem value="danificado">Danificado</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Especificações**:
```yaml
Filtro de Status:
  Ícone: Filter
  Design: Neomorphic Inset
  Largura: 192px (w-48)
  
  Opções (6 status):
    1. Todos os Status (default)
    2. Disponível (verde)
    3. Reservado (amarelo)
    4. Utilizado (azul)
    5. Devolvido (roxo)
    6. Vencido (vermelho)
    7. Danificado (laranja)
  
  Contadores:
    - Disponível: 2
    - Reservado: 1
    - Utilizado: 1
    - Devolvido: 1
    - Vencido: 0
    - Danificado: 0
  
  Comportamento:
    - Filtra listagem imediatamente
    - Atualiza KPIs (se filtrado)
    - Combina com busca e hospital
```

### 9.3. Filtro #3 - Hospital

```typescript
<div className="neomorphic-inset rounded-lg">
  <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
    <SelectTrigger className="w-48 border-none bg-transparent">
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="neomorphic-raised">
      <SelectItem value="todos">Todos os Hospitais</SelectItem>
      <SelectItem value="Hospital São Francisco">Hospital São Francisco</SelectItem>
      <SelectItem value="Clínica Ortopédica Central">Clínica Ortopédica Central</SelectItem>
      <SelectItem value="Hospital Regional Norte">Hospital Regional Norte</SelectItem>
      <SelectItem value="Instituto Cardiológico">Instituto Cardiológico</SelectItem>
      <SelectItem value="Hospital Cardio Avançado">Hospital Cardio Avançado</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Especificações**:
```yaml
Filtro de Hospital:
  Design: Neomorphic Inset
  Largura: 192px
  
  Hospitais (5 opções):
    1. Todos os Hospitais (default)
    2. Hospital São Francisco (1 material)
    3. Clínica Ortopédica Central (1 material)
    4. Hospital Regional Norte (1 material)
    5. Instituto Cardiológico (1 material)
    6. Hospital Cardio Avançado (1 material)
  
  Métricas por Hospital:
    Hospital São Francisco:
      - Materiais: 1
      - Valor: R$ 17.000
      - Status: Disponível
      
    Clínica Ortopédica Central:
      - Materiais: 1
      - Valor: R$ 3.200
      - Status: Utilizado
      - Faturamento: Pendente
```

---

## 10. TABS DE NAVEGAÇÃO

### 10.1. Estrutura das Tabs

```typescript
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="dashboard">
      <BarChart3 className="w-4 h-4" />
      Dashboard
    </TabsTrigger>
    <TabsTrigger value="materiais">
      <Package className="w-4 h-4" />
      Materiais
    </TabsTrigger>
    <TabsTrigger value="faturamento">
      <Receipt className="w-4 h-4" />
      Faturamento
    </TabsTrigger>
    <TabsTrigger value="financeiro">
      <DollarSign className="w-4 h-4" />
      Financeiro
    </TabsTrigger>
    <TabsTrigger value="hospitais">
      <Building2 className="w-4 h-4" />
      Hospitais
    </TabsTrigger>
  </TabsList>
  
  {/* Conteúdo das tabs */}
</Tabs>
```

### 10.2. Tab #1 - Dashboard

```yaml
Tab Dashboard:
  Ícone: BarChart3
  Default: true
  
  Seções:
    1. KPIs Principais (9 cards)
       - Grid: 5 colunas (lg)
       - Cards compactos neuromórficos
       
    2. KPIs Financeiros (4 cards)
       - Grid: 4 colunas (lg)
       - Foco em valores monetários
       
    3. Gráfico de Utilização
       - Tipo: Donut Chart
       - Dados: Distribuição por status
       
    4. Top 5 Hospitais
       - Tabela ranking
       - Ordenado por valor consignado
       
    5. Alertas Críticos
       - Materiais vencendo
       - Estoque parado > 60 dias
       - Faturamentos atrasados
```

### 10.3. Tab #2 - Materiais

```yaml
Tab Materiais:
  Ícone: Package
  
  Componentes:
    1. Listagem Completa
       - Tabela paginada
       - 10 itens por página
       - Ordenação por coluna
       
    2. Colunas da Tabela:
       - Código Interno
       - Nome do Material
       - Categoria (badge)
       - Hospital
       - Quantidade
       - Valor Unitário
       - Valor Total
       - Status (badge colorido)
       - Dias em Estoque
       - Rotatividade (badge)
       - Ações (botões)
       
    3. Ações por Linha:
       - Ver Detalhes (Eye)
       - Movimentar (Truck)
       - Devolver (RefreshCcw)
       - Histórico (History)
       
    4. Card de Detalhes:
       - Informações completas
       - Histórico de movimentações
       - Dados do contrato
       - Custos calculados
```

### 10.4. Tab #3 - Faturamento

```yaml
Tab Faturamento:
  Ícone: Receipt
  
  Seções:
    1. Faturamentos Gerados
       - Lista de NF-e emitidas
       - Status de pagamento
       - Datas de vencimento
       
    2. Materiais Aguardando Faturamento
       - Status "utilizado"
       - Pronto para emissão NF
       - Cálculo automático de valores
       
    3. Análise de Recebimentos
       - Faturado vs Pago
       - Inadimplência
       - Prazo médio recebimento
       
    4. Botões de Ação:
       - Gerar Faturamento Lote
       - Emitir NF-e Individual
       - Exportar Relatório
```

### 10.5. Tab #4 - Financeiro

```yaml
Tab Financeiro:
  Ícone: DollarSign
  
  Dashboards:
    1. Análise de Rentabilidade
       - Margem Bruta
       - Margem Líquida
       - ROI
       - Payback Period
       
    2. Custos Operacionais
       - Carregamento Financeiro
       - Logística (Frete)
       - Administrativo
       - Seguros
       - Perdas e Danos
       
    3. Projeções
       - Faturamento Estimado
       - Custos Projetados
       - Lucro Esperado
       
    4. Gráficos:
       - Evolução Mensal (Line)
       - Composição Custos (Pie)
       - ROI por Hospital (Bar)
```

### 10.6. Tab #5 - Hospitais

```yaml
Tab Hospitais:
  Ícone: Building2
  
  Visualizações:
    1. Mapa de Hospitais
       - Distribuição geográfica
       - Pins com valor consignado
       
    2. Cards por Hospital
       - Nome e CNPJ
       - Materiais ativos
       - Valor total
       - Taxa utilização
       - Performance histórica
       
    3. Ranking de Performance
       - Top utilizadores
       - Menores devoluções
       - Melhor ROI
       
    4. Contratos Ativos
       - Condições de pagamento
       - Prazos de vencimento
       - Comissões negociadas
```

---

## 11. LAYOUT RESPONSIVO

### 11.1. Breakpoints

```yaml
Breakpoints Sistema:
  - Mobile: < 768px
  - Tablet: 768px - 1023px
  - Desktop: >= 1024px

Ajustes por Tela:

Mobile (< 768px):
  Header:
    - Flex direction: column
    - Botões: Full width stack
    
  Filtros:
    - 1 coluna vertical
    - Busca: Full width
    - Selects: Full width
    
  KPIs:
    - Grid: 1 coluna
    - Cards: Full width
    
  Tabs:
    - ScrollableTabs
    - Triggers: Compact (só ícone)
    
  Tabela:
    - Cards mobile
    - Swipe para ações

Tablet (768-1023px):
  KPIs Linha 1:
    - Grid: 2 colunas (5 cards = 2+2+1)
    
  KPIs Linha 2:
    - Grid: 2 colunas
    
  Tabs:
    - Full width
    - Ícone + texto
    
  Tabela:
    - Scroll horizontal
    - Colunas prioritárias visíveis

Desktop (>= 1024px):
  KPIs Linha 1:
    - Grid: 5 colunas
    
  KPIs Linha 2:
    - Grid: 4 colunas
    
  Tabs:
    - Grid estático
    
  Tabela:
    - Todas colunas visíveis
    - Paginação completa
```

---

## 16. ALERTAS DE CONFERÊNCIA SEMANAL

### 16.1. Sistema de Alertas Automáticos

```typescript
/**
 * Sistema de Alertas de Conferência Semanal
 * Notifica Supervisor Logístico toda segunda-feira 08:00
 */

interface AlertaConferenciaSemanal {
  id: string;
  tipo: 'conferencia_semanal';
  dataGeracao: string;
  dataEnvio: string;
  destinatario: {
    nome: string;
    cargo: 'Supervisor Logístico';
    email: string;
    telefone: string;
  };
  resumo: {
    totalHospitais: number;
    totalMateriais: number;
    valorConsignado: number;
    itensRequerConferencia: ConferenciaItem[];
  };
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'enviado' | 'confirmado';
}

interface ConferenciaItem {
  hospitalNome: string;
  hospitalCNPJ: string;
  endereco: string;
  materiais: MaterialConsignado[];
  ultimaConferencia: string;
  diasSemConferencia: number;
  statusConferencia: 'urgente' | 'atencao' | 'normal';
  observacoes: string[];
}
```

### 16.2. Configuração de Alertas

```typescript
// Configuração do sistema de alertas
const CONFERENCIA_CONFIG = {
  // Frequência
  frequencia: 'semanal',
  diaSemana: 'segunda', // 0 = domingo, 1 = segunda
  horario: '08:00',
  
  // Destinatários
  destinatarios: [
    {
      nome: 'João Silva',
      cargo: 'Supervisor Logístico',
      email: 'joao.silva@empresa.com',
      telefone: '+55 11 98765-4321'
    },
    {
      nome: 'Maria Santos',
      cargo: 'Gerente de Operações',
      email: 'maria.santos@empresa.com',
      telefone: '+55 11 98765-4322'
    }
  ],
  
  // Critérios de Alerta
  criterios: {
    diasSemConferencia: {
      urgente: 14,    // > 14 dias = URGENTE
      atencao: 7,     // 7-14 dias = ATENÇÃO
      normal: 0       // < 7 dias = NORMAL
    },
    valorMinimo: 5000.00,  // Alertar se valor > R$ 5.000
    materiaisMinimo: 2      // Alertar se > 2 materiais
  },
  
  // Canais de Notificação
  canais: ['email', 'sms', 'whatsapp', 'push'],
  
  // Template de Email
  template: 'conferencia-semanal-v2'
};
```

### 16.3. Lógica de Geração de Alertas

```typescript
/**
 * Gera alertas de conferência semanal
 * Executa toda segunda 08:00 via Supabase Cron
 */
async function gerarAlertasConferenciaSemanal(): Promise<AlertaConferenciaSemanal[]> {
  const hoje = new Date();
  const alertas: AlertaConferenciaSemanal[] = [];
  
  // 1. Agrupar materiais por hospital
  const materiaisPorHospital = groupBy(
    mockMateriaisConsignados,
    m => m.hospital.cnpj
  );
  
  // 2. Para cada hospital, verificar necessidade de conferência
  for (const [cnpj, materiais] of Object.entries(materiaisPorHospital)) {
    const hospital = materiais[0].hospital;
    
    // Buscar última conferência
    const ultimaConferencia = await getUltimaConferencia(cnpj);
    const diasSemConferencia = calcularDiasSemConferencia(ultimaConferencia);
    
    // Determinar status
    let statusConferencia: 'urgente' | 'atencao' | 'normal';
    let prioridade: 'alta' | 'media' | 'baixa';
    
    if (diasSemConferencia > 14) {
      statusConferencia = 'urgente';
      prioridade = 'alta';
    } else if (diasSemConferencia > 7) {
      statusConferencia = 'atencao';
      prioridade = 'media';
    } else {
      statusConferencia = 'normal';
      prioridade = 'baixa';
    }
    
    // Calcular valor total
    const valorTotal = materiais.reduce((sum, m) => sum + m.valorTotal, 0);
    
    // Verificar critérios de alerta
    const requerAlerta = 
      diasSemConferencia >= 7 ||
      valorTotal > CONFERENCIA_CONFIG.criterios.valorMinimo ||
      materiais.length >= CONFERENCIA_CONFIG.criterios.materiaisMinimo;
    
    if (requerAlerta) {
      // Gerar observações
      const observacoes = [];
      
      if (diasSemConferencia > 14) {
        observacoes.push(`⚠️ URGENTE: ${diasSemConferencia} dias sem conferência`);
      } else if (diasSemConferencia > 7) {
        observacoes.push(`⚠️ Atenção: ${diasSemConferencia} dias sem conferência`);
      }
      
      if (valorTotal > 20000) {
        observacoes.push(`💰 Alto valor consignado: ${formatCurrency(valorTotal)}`);
      }
      
      // Materiais críticos
      const materiaisVencendo = materiais.filter(m => {
        const diasVencimento = getDiasVencimento(m.validade);
        return diasVencimento <= 30;
      });
      
      if (materiaisVencendo.length > 0) {
        observacoes.push(`📅 ${materiaisVencendo.length} material(is) vencendo em 30 dias`);
      }
      
      // Materiais parados
      const materiaisParados = materiais.filter(m => m.diasEstoque > 60);
      if (materiaisParados.length > 0) {
        observacoes.push(`⏱️ ${materiaisParados.length} material(is) parado(s) > 60 dias`);
      }
      
      // Criar item de conferência
      const item: ConferenciaItem = {
        hospitalNome: hospital.nome,
        hospitalCNPJ: cnpj,
        endereco: hospital.endereco,
        materiais,
        ultimaConferencia: ultimaConferencia?.data || 'Nunca',
        diasSemConferencia,
        statusConferencia,
        observacoes
      };
      
      // Adicionar ao alerta
      alertas.push({
        id: `ALERT-${hoje.getTime()}-${cnpj}`,
        tipo: 'conferencia_semanal',
        dataGeracao: hoje.toISOString(),
        dataEnvio: hoje.toISOString(),
        destinatario: CONFERENCIA_CONFIG.destinatarios[0],
        resumo: {
          totalHospitais: 1,
          totalMateriais: materiais.length,
          valorConsignado: valorTotal,
          itensRequerConferencia: [item]
        },
        prioridade,
        status: 'pendente'
      });
    }
  }
  
  return alertas;
}
```

### 16.4. Template de Email

```html
<!-- Template: conferencia-semanal-v2 -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Conferência Semanal - Consignação OPME</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f7fa;">
  
  <!-- Header -->
  <div style="background: #6366F1; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">🔔 Alerta de Conferência Semanal</h1>
    <p style="margin: 5px 0 0 0;">Sistema ICARUS v5.0 - Consignação Avançada</p>
  </div>
  
  <!-- Body -->
  <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
    
    <p>Olá <strong>{{destinatario.nome}}</strong>,</p>
    
    <p>Este é o relatório automático de conferência semanal de materiais OPME consignados.</p>
    
    <!-- Resumo Executivo -->
    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #6366F1; margin: 20px 0;">
      <h3 style="margin-top: 0;">📊 Resumo Executivo</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Hospitais com Conferência Pendente:</strong> {{resumo.totalHospitais}}</li>
        <li><strong>Total de Materiais:</strong> {{resumo.totalMateriais}}</li>
        <li><strong>Valor Total Consignado:</strong> {{resumo.valorConsignado}}</li>
      </ul>
    </div>
    
    <!-- Hospitais que Requerem Conferência -->
    <h3>🏥 Hospitais que Requerem Conferência</h3>
    
    {{#each resumo.itensRequerConferencia}}
    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      
      <!-- Status Badge -->
      <div style="margin-bottom: 10px;">
        {{#if (eq statusConferencia 'urgente')}}
          <span style="background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            🚨 URGENTE
          </span>
        {{else if (eq statusConferencia 'atencao')}}
          <span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            ⚠️ ATENÇÃO
          </span>
        {{else}}
          <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            ✅ NORMAL
          </span>
        {{/if}}
      </div>
      
      <!-- Dados do Hospital -->
      <h4 style="margin: 10px 0 5px 0;">{{hospitalNome}}</h4>
      <p style="margin: 0; color: #666; font-size: 14px;">
        CNPJ: {{hospitalCNPJ}}<br>
        Endereço: {{endereco}}
      </p>
      
      <!-- Informações de Conferência -->
      <div style="background: #fef3c7; padding: 10px; border-radius: 6px; margin-top: 10px;">
        <p style="margin: 0;">
          <strong>Última Conferência:</strong> {{ultimaConferencia}}<br>
          <strong>Dias sem Conferência:</strong> <span style="color: #dc2626; font-weight: bold;">{{diasSemConferencia}} dias</span>
        </p>
      </div>
      
      <!-- Materiais -->
      <h5 style="margin: 15px 0 5px 0;">Materiais Consignados ({{materiais.length}})</h5>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e0e0e0;">Código</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e0e0e0;">Material</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e0e0e0;">Qtd</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e0e0e0;">Valor</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e0e0e0;">Dias</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e0e0e0;">Status</th>
          </tr>
        </thead>
        <tbody>
          {{#each materiais}}
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">{{codigoInterno}}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">{{nome}}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #f0f0f0;">{{quantidade}}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f0f0f0;">{{valorTotal}}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #f0f0f0;">{{diasEstoque}}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #f0f0f0;">{{status}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
      
      <!-- Observações -->
      {{#if observacoes.length}}
      <div style="background: #fef2f2; padding: 10px; border-radius: 6px; margin-top: 10px;">
        <strong>⚠️ Observações:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          {{#each observacoes}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
      
      <!-- Botão de Ação -->
      <div style="margin-top: 15px;">
        <a href="{{baseUrl}}/consignacao/conferencia/{{hospitalCNPJ}}" 
           style="background: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
          📋 Realizar Conferência
        </a>
      </div>
      
    </div>
    {{/each}}
    
    <!-- Call to Action -->
    <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 20px;">
      <p style="margin: 0;"><strong>⏰ Próximos Passos:</strong></p>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Agendar visitas aos hospitais com conferência URGENTE</li>
        <li>Realizar conferência física dos materiais</li>
        <li>Atualizar status no sistema ICARUS</li>
        <li>Solicitar devolução de materiais parados > 60 dias</li>
      </ol>
    </div>
    
    <!-- Footer -->
    <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <strong>Sistema ICARUS v5.0</strong><br>
      Consignação Avançada - Alerta Automático Semanal<br>
      📧 Para dúvidas, entre em contato: suporte@icarus.com.br
    </p>
    
  </div>
  
</body>
</html>
```

---

## 17. NOTIFICAÇÕES AO SUPERVISOR LOGÍSTICO

### 17.1. Dashboard de Notificações

```typescript
interface NotificationCenter {
  alertasAtivos: number;
  urgentes: number;
  atencao: number;
  normais: number;
  ultimaAtualizacao: string;
}

// Componente de Badge de Notificações
<div className="relative">
  <Bell className="w-5 h-5" />
  {notificationCenter.urgentes > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {notificationCenter.urgentes}
    </span>
  )}
</div>
```

### 17.2. Painel de Alertas

```typescript
// Card de Alertas Críticos no Dashboard
<NeomorphicCard className="col-span-full p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-red-500" />
      <h3 className="font-semibold">Alertas Críticos - Conferência Semanal</h3>
    </div>
    <Badge className="bg-red-100 text-red-800">
      {alertasCriticos.length} pendentes
    </Badge>
  </div>
  
  <div className="space-y-3">
    {alertasCriticos.map(alerta => (
      <div key={alerta.id} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{alerta.hospital}</h4>
            <p className="text-sm text-muted-foreground">
              {alerta.diasSemConferencia} dias sem conferência
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{alerta.totalMateriais} materiais</Badge>
              <Badge variant="outline">{formatCurrency(alerta.valorTotal)}</Badge>
            </div>
          </div>
          <Button size="sm" className="btn-icarus-primary">
            Agendar Conferência
          </Button>
        </div>
      </div>
    ))}
  </div>
</NeomorphicCard>
```

---

**Status**: ✅ **DOCUMENTAÇÃO 100% COMPLETA**  
**Próxima Parte**: Relatórios, Integrações e API Endpoints
