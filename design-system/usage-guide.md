# 🎯 Guia de Uso - OraclusX Design System

**Versão:** 1.0.0  
**Data:** 30 de outubro de 2025  
**Público:** Desenvolvedores ICARUS v5.0

---

## 📚 Índice

1. [Quando Usar Cada Componente](#quando-usar)
2. [Exemplos de Composição](#composicao)
3. [Anti-Patterns](#anti-patterns)
4. [Migração de Código Legacy](#migracao)
5. [Boas Práticas](#boas-praticas)

---

## 🎯 Quando Usar Cada Componente {#quando-usar}

### Container

**Use quando:** Precisa de um wrapper de layout com controle de largura máxima e centralização.

**✅ Casos de uso:**
- Páginas completas
- Seções que precisam centralizar conteúdo
- Limitação de largura responsiva

**❌ Não use quando:**
- Dentro de outros Containers (evite nesting)
- Para espaçamento simples (use padding/margin direto)

```tsx
// ✅ BOM
<Container maxWidth="7xl" padding="lg">
  <PageHeader title="Dashboard" />
  <Section>{content}</Section>
</Container>

// ❌ RUIM
<Container>
  <Container> {/* Não faça nesting */}
    {content}
  </Container>
</Container>
```

---

### Section

**Use quando:** Agrupar conteúdo relacionado com título/descrição opcional.

**✅ Casos de uso:**
- Agrupar KPIs de uma mesma categoria
- Separar visualmente seções da página
- Adicionar título + ações em um bloco

**❌ Não use quando:**
- Para um único elemento (use div simples)
- Quando não há agrupamento lógico

```tsx
// ✅ BOM
<Section
  title="KPIs Financeiros"
  description="Métricas financeiras do mês"
  actions={<Button>Exportar</Button>}
>
  <StatsGrid stats={financialKPIs} />
</Section>

// ❌ RUIM
<Section> {/* Sem título/descrição, não adiciona valor */}
  <div>{singleElement}</div>
</Section>
```

---

### GlassCard

**Use quando:** Quer destaque visual com efeito glassmorphism.

**✅ Casos de uso:**
- Modals de destaque
- Cards de hero sections
- Elementos sobre backgrounds complexos
- Formulários importantes

**❌ Não use quando:**
- Para todos os cards (use Card normal)
- Background é simples (glass perde efeito)
- Performance é crítica (glass é mais pesado)

```tsx
// ✅ BOM - Hero section com background
<div className="orx-bg-gradient-brand">
  <GlassCard blur="lg" gradient gradientColor="brand">
    <CardHeader>
      <CardTitle>Bem-vindo ao ICARUS</CardTitle>
    </CardHeader>
  </GlassCard>
</div>

// ❌ RUIM - Sobre background branco simples
<div className="bg-white">
  <GlassCard> {/* Glass não terá efeito visível */}
    {content}
  </GlassCard>
</div>
```

---

### AnimatedCard

**Use quando:** Quer animação de entrada em cards.

**✅ Casos de uso:**
- Listas de cards
- Grids de elementos
- Dashboards dinâmicos
- Onboarding flows

**❌ Não use quando:**
- Usuário tem `prefers-reduced-motion`
- Card está sempre visível (sem mount/unmount)
- Performance é crítica (muitos cards)

```tsx
// ✅ BOM - Grid com stagger animation
{items.map((item, index) => (
  <AnimatedCard
    key={item.id}
    animation="slide"
    delay={index * 50}
    hoverLift
  >
    {item.content}
  </AnimatedCard>
))}

// ❌ RUIM - Animação sem sentido
<AnimatedCard animation="bounce" delay={5000}>
  {/* Delay muito alto frustra usuário */}
</AnimatedCard>
```

---

### PageHeader

**Use quando:** Início de uma página/módulo.

**✅ Casos de uso:**
- Todas as páginas principais
- Módulos com navegação própria
- Dashboards
- Formulários complexos

**❌ Não use quando:**
- Em modals (use CardHeader)
- Em sub-seções (use Section title)
- Páginas muito simples (Login, Error pages)

```tsx
// ✅ BOM
export default function DashboardPage() {
  return (
    <Container>
      <PageHeader
        title="Dashboard Principal"
        description="Visão consolidada"
        icon={Home}
        badge={{ label: "Live", variant: "success" }}
        actions={<Button>Exportar</Button>}
      />
      {/* Resto do conteúdo */}
    </Container>
  );
}

// ❌ RUIM - Em modal
<Modal>
  <PageHeader title="Confirmar ação" />
  {/* Use CardHeader dentro de modals */}
</Modal>
```

---

### StatsGrid

**Use quando:** Exibir múltiplos KPIs/estatísticas.

**✅ Casos de uso:**
- Dashboards
- Páginas de analytics
- Relatórios
- 2-8 métricas relacionadas

**❌ Não use quando:**
- Apenas 1 KPI (use KPICard direto)
- Mais de 8 KPIs (divida em seções)
- KPIs muito diferentes (use layout custom)

```tsx
// ✅ BOM
<StatsGrid
  columns={4}
  animated
  stats={[
    {
      label: "Vendas",
      value: "R$ 1.2M",
      icon: DollarSign,
      colorScheme: "emerald",
      trend: { value: 15.2, label: "vs. anterior" }
    },
    // ... 3-7 stats similares
  ]}
/>

// ❌ RUIM - Apenas 1 stat
<StatsGrid stats={[singleStat]} />
{/* Use <KPICard {...singleStat} /> direto */}
```

---

### CategoryTabs

**Use quando:** Navegação entre categorias/views.

**✅ Casos de uso:**
- Filtros de conteúdo
- Sub-navegação de módulos
- Dashboards com múltiplas views
- 2-8 categorias

**❌ Não use quando:**
- Navegação principal (use Sidebar)
- Apenas 1 categoria
- Mais de 8 categorias (use Dropdown)
- Navegação hierárquica (use Breadcrumb)

```tsx
// ✅ BOM
<CategoryTabs
  categories={[
    { id: "vendas", label: "Vendas", icon: TrendingUp, count: 245 },
    { id: "estoque", label: "Estoque", icon: Package, count: 1024 },
    { id: "alertas", label: "Alertas", icon: AlertCircle, count: 12, trend: "-3" }
  ]}
  activeCategory={active}
  onChange={setActive}
/>

// ❌ RUIM - Navegação principal
<CategoryTabs categories={mainMenuItems} />
{/* Use IcarusSidebar para menu principal */}
```

---

## 🧩 Exemplos de Composição {#composicao}

### Dashboard Completo

```tsx
export default function MyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Container maxWidth="7xl" padding="lg">
      <Section spacing="lg">
        <PageHeader
          title="Dashboard de Vendas"
          description="Acompanhe suas métricas em tempo real"
          icon={TrendingUp}
          badge={{ label: "Live", variant: "success" }}
          actions={
            <>
              <Button variant="secondary" icon={<RefreshCw />}>
                Atualizar
              </Button>
              <Button variant="primary" icon={<Download />}>
                Exportar
              </Button>
            </>
          }
          breadcrumbs={[
            { label: "Início", href: "/" },
            { label: "Dashboards", href: "/dashboards" },
            { label: "Vendas" }
          ]}
        />

        <CategoryTabs
          categories={[
            { id: "overview", label: "Visão Geral", icon: Home },
            { id: "sales", label: "Vendas", icon: DollarSign, count: 245 },
            { id: "products", label: "Produtos", icon: Package, count: 89 }
          ]}
          activeCategory={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <>
            <StatsGrid
              columns={4}
              animated
              stats={overviewStats}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedCard animation="slide" delay={0} hoverLift>
                <CardHeader>
                  <CardTitle>Faturamento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart data={monthlyRevenue} />
                </CardContent>
              </AnimatedCard>

              <AnimatedCard animation="slide" delay={100} hoverLift>
                <CardHeader>
                  <CardTitle>Top Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopProductsList />
                </CardContent>
              </AnimatedCard>
            </div>
          </>
        )}
      </Section>
    </Container>
  );
}
```

### Formulário de Cadastro

```tsx
export default function CadastroPage() {
  return (
    <Container maxWidth="5xl" padding="lg">
      <PageHeader
        title="Novo Cadastro"
        description="Preencha os dados do cliente"
        icon={UserPlus}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft /> Voltar
          </Button>
        }
      />

      <GlassCard blur="md" className="mt-6">
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>
            Informações básicas do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Campos do formulário */}
          </form>
        </CardContent>
      </GlassCard>
    </Container>
  );
}
```

### Modal com Glass Effect

```tsx
<Modal open={isOpen} onClose={closeModal}>
  <GlassCard blur="xl" className="max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Confirmar Exclusão</CardTitle>
      <CardDescription>
        Esta ação não pode ser desfeita
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p>Tem certeza que deseja excluir {itemName}?</p>
    </CardContent>
    <CardFooter className="gap-2">
      <Button variant="ghost" onClick={closeModal}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={confirmDelete}>
        Excluir
      </Button>
    </CardFooter>
  </GlassCard>
</Modal>
```

---

## ❌ Anti-Patterns {#anti-patterns}

### 1. Nesting Excessivo

```tsx
// ❌ RUIM
<Container>
  <Section>
    <Container> {/* Não aninha containers */}
      <Section> {/* Não aninha sections sem motivo */}
        <div>Content</div>
      </Section>
    </Container>
  </Section>
</Container>

// ✅ BOM
<Container>
  <Section title="Grupo 1">
    {content1}
  </Section>
  <Section title="Grupo 2">
    {content2}
  </Section>
</Container>
```

### 2. Animações Desnecessárias

```tsx
// ❌ RUIM - Anima tudo
{items.map((item, i) => (
  <AnimatedCard animation="bounce" delay={i * 1000}>
    {item}
  </AnimatedCard>
))}

// ✅ BOM - Animação sutil e rápida
{items.map((item, i) => (
  <AnimatedCard
    animation="fade"
    delay={i * 50}
    duration={200}
  >
    {item}
  </AnimatedCard>
))}
```

### 3. Inline Styles Misturados

```tsx
// ❌ RUIM - Mistura componentes DS com inline styles
<Container>
  <div style={{ padding: '20px', background: '#fff' }}>
    <PageHeader title="Título" />
  </div>
</Container>

// ✅ BOM - Usa classes ou componentes DS
<Container padding="lg">
  <Card>
    <PageHeader title="Título" />
  </Card>
</Container>
```

### 4. Props Desnecessárias

```tsx
// ❌ RUIM
<StatsGrid
  columns={4}
  stats={[singleStat]}
/>

// ✅ BOM
<KPICard {...singleStat} />
```

---

## 🔄 Migração de Código Legacy {#migracao}

### Padrão 1: Divs com Inline Styles

```tsx
// ❌ ANTES
<div style={{
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '2rem',
  background: 'linear-gradient(120deg, #4338ca, #312e81)',
  borderRadius: '1rem'
}}>
  {content}
</div>

// ✅ DEPOIS
<Container maxWidth="7xl" padding="lg" variant="gradient">
  {content}
</Container>
```

### Padrão 2: Headers Customizados

```tsx
// ❌ ANTES
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-[var(--orx-text-primary)]">
      Título
    </h1>
    <p className="text-[var(--orx-text-secondary)]">
      Descrição
    </p>
  </div>
  <div className="flex gap-2">
    <Button>Ação 1</Button>
    <Button>Ação 2</Button>
  </div>
</div>

// ✅ DEPOIS
<PageHeader
  title="Título"
  description="Descrição"
  actions={
    <>
      <Button>Ação 1</Button>
      <Button>Ação 2</Button>
    </>
  }
/>
```

### Padrão 3: Grid de KPIs

```tsx
// ❌ ANTES
<div className={KPI_GRID}>
  {kpis.map(kpi => (
    <KPICard
      key={kpi.id}
      title={kpi.title}
      value={kpi.value}
      icon={kpi.icon}
      colorScheme={kpi.color}
      trend={kpi.trend}
      className={KPI_COL}
    />
  ))}
</div>

// ✅ DEPOIS
<StatsGrid
  columns={4}
  animated
  stats={kpis.map(kpi => ({
    label: kpi.title,
    value: kpi.value,
    icon: kpi.icon,
    colorScheme: kpi.color,
    trend: kpi.trend
  }))}
/>
```

---

## ✨ Boas Práticas {#boas-praticas}

### 1. Composição sobre Customização

```tsx
// ❌ RUIM - Props excessivas
<Container
  maxWidth="7xl"
  padding="lg"
  margin="xl"
  border="solid"
  borderColor="primary"
  borderWidth="2px"
  // ... 10 mais props
>

// ✅ BOM - Composição
<Container maxWidth="7xl" padding="lg">
  <div className="border-2 border-primary m-12">
    {content}
  </div>
</Container>
```

### 2. Consistência de Animações

```tsx
// ✅ BOM - Delays consistentes
const STAGGER_DELAY = 50;

{items.map((item, i) => (
  <AnimatedCard
    animation="fade"
    delay={i * STAGGER_DELAY}
    duration={300}
  >
    {item}
  </AnimatedCard>
))}
```

### 3. Tipagem Forte

```tsx
// ✅ BOM - Tipagem explícita
import type { StatItem, KPIColorScheme } from '@/components/oraclusx-ds';

const stats: StatItem[] = [
  {
    label: "Vendas",
    value: "R$ 1.2M",
    icon: DollarSign,
    colorScheme: "emerald" as KPIColorScheme,
    trend: { value: 15.2, label: "vs. anterior" }
  }
];
```

### 4. Dark Mode First

```tsx
// ✅ BOM - Usa design tokens
<div className="text-[var(--orx-text-primary)] bg-[var(--orx-bg-light)]">

// ❌ RUIM - Hardcoded colors
<div className="text-gray-900 bg-white">
```

### 5. Performance

```tsx
// ✅ BOM - Memoização quando necessário
const MemoizedStatsGrid = React.memo(StatsGrid);

<MemoizedStatsGrid stats={expensiveStatsCalculation()} />

// ✅ BOM - Lazy loading
const HeavyDashboard = lazy(() => import('./HeavyDashboard'));

<Suspense fallback={<Skeleton />}>
  <HeavyDashboard />
</Suspense>
```

---

## 📞 Suporte

**Dúvidas?** Consulte:
- `ORACLUSX_DS_COMPLETO.md` - Visão geral
- `animation-tokens.md` - Tokens de animação
- `color-exceptions.md` - Exceções de cores
- Storybook - Exemplos interativos

**Bugs?** Reporte em:
- GitHub Issues
- Slack #design-system

---

**Versão:** 1.0.0  
**Última atualização:** 30/10/2025  
**Autor:** Equipe ICARUS v5.0

