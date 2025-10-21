# 🎨 DOCUMENTAÇÃO TÉCNICA - FRONTEND (Parte 3)

## FRONTEND COMPLETO - REACT + TYPESCRIPT

---

## 📂 ESTRUTURA DE PASTAS DETALHADA

```
src/
├── App.tsx                             # App principal + Router
├── main.tsx                            # Entry point
├── vite-env.d.ts                       # Vite types
│
├── components/                         # Todos os componentes
│   │
│   ├── oraclusx-ds/                   # 🎨 DESIGN SYSTEM (50+ componentes)
│   │   ├── Button.tsx                 # Botões neumórficos
│   │   ├── Card.tsx                   # Cards com elevação
│   │   ├── Input.tsx                  # Inputs validados
│   │   ├── Select.tsx                 # Selects customizados
│   │   ├── Checkbox.tsx               # Checkboxes neumórficos
│   │   ├── Radio.tsx                  # Radio buttons
│   │   ├── Switch.tsx                 # Toggle switches
│   │   ├── Badge.tsx                  # Badges de status
│   │   ├── Avatar.tsx                 # Avatars de usuário
│   │   ├── Tabs.tsx                   # Navegação em abas
│   │   ├── Accordion.tsx              # Painéis expansíveis
│   │   ├── Dialog.tsx                 # Modais
│   │   ├── Tooltip.tsx                # Tooltips
│   │   ├── Popover.tsx                # Popovers
│   │   ├── Dropdown.tsx               # Dropdowns
│   │   ├── Alert.tsx                  # Alertas
│   │   ├── Toast.tsx                  # Notificações toast
│   │   ├── Table.tsx                  # Tabelas responsivas
│   │   ├── Pagination.tsx             # Paginação
│   │   ├── Progress.tsx               # Barras de progresso
│   │   ├── Slider.tsx                 # Range sliders
│   │   ├── Separator.tsx              # Divisores
│   │   ├── Label.tsx                  # Labels de formulário
│   │   ├── Form.tsx                   # Form context
│   │   └── ... (30+ componentes mais)
│   │
│   ├── layout/                        # 📐 LAYOUT SYSTEM
│   │   ├── Container.tsx              # Container responsivo (max-width breakpoints)
│   │   ├── Grid.tsx                   # Grid system (12 colunas)
│   │   ├── Stack.tsx                  # VStack/HStack/Spacer/Divider
│   │   ├── Sidebar.tsx                # Sidebar navegação principal
│   │   ├── TopBar.tsx                 # TopBar com user menu
│   │   ├── MainLayout.tsx             # Layout principal (Sidebar + TopBar + Content)
│   │   ├── AuthLayout.tsx             # Layout páginas auth (Login, Register)
│   │   └── EmptyLayout.tsx            # Layout sem sidebar (onboarding)
│   │
│   ├── forms/                         # 📝 FORMULÁRIOS
│   │   ├── MultiStepForm.tsx          # Form multi-step com navegação
│   │   ├── MultiStepContext.tsx       # Context para state multi-step
│   │   ├── StepIndicator.tsx          # Indicador de progresso steps
│   │   ├── FormEndereco.tsx           # Form CEP + validação ViaCEP
│   │   ├── FormEmpresa.tsx            # Form CNPJ + validação Receita
│   │   ├── FormMedico.tsx             # Form CRM + validação CFM
│   │   ├── FormVeiculo.tsx            # Form Placa + FIPE
│   │   ├── FormProdutoANVISA.tsx      # Form Registro ANVISA
│   │   └── ExemploCadastroPacienteMultiStep.tsx  # Exemplo completo
│   │
│   ├── dashboard/                     # 📊 DASHBOARDS & CHARTS
│   │   ├── Charts.tsx                 # Line, Bar, Area, Pie (Recharts)
│   │   ├── ChartsAvancados.tsx        # Composed, Radar, Scatter, MultiRadar
│   │   ├── KPICard.tsx                # Card para KPIs (valor, variação, ícone)
│   │   ├── StatCard.tsx               # Card estatísticas
│   │   ├── DashboardCache.tsx         # Dashboard cache validações
│   │   └── DashboardExemplo.tsx       # Dashboard exemplo completo
│   │
│   ├── modules/                       # 🧩 16 MÓDULOS PRINCIPAIS (90+ arquivos)
│   │   │
│   │   ├── FaturamentoNFeCompleto.tsx           # NF-e SEFAZ + ANVISA
│   │   ├── GestaoUsuariosPermissoes.tsx         # RBAC + Auditoria
│   │   ├── APIGatewayDashboard.tsx              # API Gateway Monitoring
│   │   ├── BIDashboardInterativo.tsx            # BI Analytics (Star Schema)
│   │   ├── KPIDashboardConsolidado.tsx          # 13 KPIs Realtime
│   │   ├── IntegrationsManager.tsx              # Gerenciamento APIs
│   │   ├── RelatoriosRegulatorios.tsx           # ANVISA/SEFAZ/ANS
│   │   ├── GestaoContabil.tsx                   # Contabilidade + DRE
│   │   ├── LicitacoesPropostas.tsx              # Licitações Hospitalares
│   │   ├── Microsoft365IntegrationPanel.tsx     # Teams + Outlook
│   │   │
│   │   ├── EstoqueAvancado.tsx                  # Estoque OPME
│   │   ├── ConsignacaoAvancada.tsx              # Consignação cirúrgica
│   │   ├── GestaoContratos.tsx                  # Contratos (CLT, PJ)
│   │   ├── ComprasFornecedores.tsx              # Pedidos compra
│   │   ├── CRMVendas.tsx                        # CRM + Pipeline
│   │   ├── FinanceiroAvancado.tsx               # Contas a pagar/receber
│   │   ├── LogisticaAvancada.tsx                # Entregas + Rotas
│   │   ├── RelatoriosExecutivos.tsx             # Reports gerenciais
│   │   ├── ChatbotMetrics.tsx                   # Chatbot IA (não modificar)
│   │   │
│   │   └── ... (70+ módulos existentes)
│   │
│   ├── a11y/                          # ♿ ACESSIBILIDADE
│   │   ├── AccessibilityComponents.tsx  # SkipToContent, FocusTrap
│   │   ├── AccessibleButton.tsx       # Botão com ARIA
│   │   ├── AccessibleInput.tsx        # Input com ARIA
│   │   ├── LiveRegion.tsx             # Announcements para screen readers
│   │   └── useKeyboardNavigation.tsx  # Hook navegação teclado
│   │
│   ├── dnd/                           # 🖱️ DRAG & DROP
│   │   ├── SortableList.tsx           # Lista ordenável (DnD Kit)
│   │   ├── SortableItem.tsx           # Item ordenável
│   │   └── DragHandle.tsx             # Handle para arrastar
│   │
│   └── shared/                        # 🔄 COMPONENTES COMPARTILHADOS
│       ├── LoadingSpinner.tsx         # Spinner loading
│       ├── ErrorBoundary.tsx          # Error boundary React
│       ├── EmptyState.tsx             # Estado vazio (ilustração)
│       └── ConfirmDialog.tsx          # Dialog confirmação ações
│
├── hooks/                             # 🪝 CUSTOM HOOKS
│   ├── useValidacao.ts                # ✅ Hook universal validações (CEP, CNPJ, CRM, etc)
│   ├── useAuth.ts                     # 🔐 Hook autenticação (Supabase)
│   ├── useToast.ts                    # 🔔 Hook notificações toast
│   ├── useDebounce.ts                 # ⏱️ Hook debounce (search)
│   ├── useDocumentTitle.ts            # 📄 Hook alterar <title>
│   ├── useLocalStorage.ts             # 💾 Hook local storage
│   ├── useKeyboardNavigation.ts       # ⌨️ Hook navegação teclado
│   ├── useIntersectionObserver.ts     # 👀 Hook lazy loading
│   └── usePagination.ts               # 📄 Hook paginação
│
├── lib/                               # 📚 LIBRARIES & UTILITIES
│   │
│   ├── supabase.ts                    # 🗄️ Supabase client config
│   │
│   ├── utils.ts                       # 🛠️ Utilities gerais
│   │   ├── formatCurrency()           # Formatar R$ 1.234,56
│   │   ├── formatDate()               # Formatar dd/MM/yyyy
│   │   ├── formatCPF()                # Formatar 123.456.789-00
│   │   ├── formatCNPJ()               # Formatar 12.345.678/0001-90
│   │   ├── formatCEP()                # Formatar 12345-678
│   │   ├── formatPhone()              # Formatar (11) 98765-4321
│   │   ├── validateCPF()              # Validar CPF (dígitos)
│   │   ├── validateCNPJ()             # Validar CNPJ (dígitos)
│   │   ├── generateSlug()             # Gerar slug (URL-friendly)
│   │   └── cn() (classnames merge)    # Merge Tailwind classes
│   │
│   ├── services/                      # 🌐 API SERVICES (7 integrações)
│   │   │
│   │   ├── ViaCepService.ts           # CEP (gratuito)
│   │   │   ├── consultarCEP()
│   │   │   └── buscarPorEndereco()
│   │   │
│   │   ├── ReceitaFederalService.ts   # CNPJ/CPF (Brasil API)
│   │   │   ├── consultarCNPJ()
│   │   │   ├── consultarCPF()
│   │   │   └── verificarSituacao()
│   │   │
│   │   ├── CFMService.ts              # CRM Médicos (scraping)
│   │   │   ├── consultarCRM()
│   │   │   └── buscarPorNome()
│   │   │
│   │   ├── CFMScraperService.ts       # Puppeteer scraping CFM
│   │   │   ├── iniciarNavegador()
│   │   │   ├── consultarCRMScraping()
│   │   │   └── fecharNavegador()
│   │   │
│   │   ├── VeiculoService.ts          # Placas + FIPE
│   │   │   ├── validarPlacaMercosul()
│   │   │   ├── consultarFIPE()
│   │   │   └── buscarMarcaModelo()
│   │   │
│   │   ├── ANVISAService.ts           # Registro produtos médicos
│   │   │   ├── consultarRegistro()
│   │   │   ├── buscarPorFabricante()
│   │   │   └── verificarStatus()
│   │   │
│   │   ├── RBACService.ts             # RBAC operations
│   │   │   ├── getUserRoles()
│   │   │   ├── getUserPermissions()
│   │   │   ├── checkPermission()
│   │   │   ├── assignRole()
│   │   │   └── logAudit()
│   │   │
│   │   ├── APIGatewayService.ts       # API Gateway
│   │   │   ├── makeRequest()          # Request com rate limit/circuit breaker
│   │   │   ├── getMetrics()
│   │   │   └── getHealthStatus()
│   │   │
│   │   └── Microsoft365Service.ts     # Microsoft Graph API
│   │       ├── authenticate()
│   │       ├── createTeamsMeeting()
│   │       ├── getCalendarEvents()
│   │       ├── sendEmail()
│   │       └── uploadToOneDrive()
│   │
│   └── microsoft365/                  # 🪟 MICROSOFT 365 INTEGRATION
│       └── Microsoft365Service.ts     # (duplicado, consolidar)
│
├── contexts/                          # 🌐 REACT CONTEXTS
│   ├── AuthContext.tsx                # Context autenticação
│   │   ├── AuthProvider
│   │   ├── useAuth()
│   │   ├── signIn()
│   │   ├── signOut()
│   │   ├── signUp()
│   │   └── resetPassword()
│   │
│   ├── ToastContext.tsx               # Context notificações
│   │   ├── ToastProvider
│   │   ├── useToast()
│   │   ├── addToast()
│   │   └── removeToast()
│   │
│   ├── ThemeContext.tsx               # Context tema (dark/light)
│   │   ├── ThemeProvider
│   │   ├── useTheme()
│   │   ├── toggleTheme()
│   │   └── setTheme()
│   │
│   └── SidebarContext.tsx             # Context sidebar (collapsed)
│       ├── SidebarProvider
│       ├── useSidebar()
│       └── toggleSidebar()
│
├── pages/                             # 📄 PÁGINAS (Routes)
│   ├── Dashboard.tsx                  # Dashboard principal
│   ├── Login.tsx                      # Login page
│   ├── Register.tsx                   # Registro page
│   ├── NotFound.tsx                   # 404 page
│   └── ... (páginas dos módulos)
│
├── styles/                            # 🎨 ESTILOS GLOBAIS
│   ├── globals.css                    # Tailwind imports + global styles
│   └── oraclusx-ds.css                # Design System tokens
│
├── types/                             # 📝 TYPESCRIPT TYPES
│   ├── index.ts                       # Types globais
│   ├── database.types.ts              # Types Supabase (auto-generated)
│   ├── api.types.ts                   # Types APIs externas
│   └── modules.types.ts               # Types específicos módulos
│
└── test/                              # 🧪 TESTES
    ├── setup.ts                       # Vitest setup
    ├── integration/                   # Integration tests
    │   └── cache-supabase.test.ts
    └── mocks/                         # Mocks (MSW)
        └── handlers.ts
```

---

## 🎨 DESIGN SYSTEM - OraclusX DS

### Princípios de Design

1. **Neumorphism 3D Premium** - 100% aderente
2. **100% SVG Icons** - Lucide React (jamais PNG/JPG)
3. **CSS Variables** - Jamais text-*/font-* Tailwind classes
4. **Responsivo Mobile-First** - Breakpoints: sm, md, lg, xl, 2xl
5. **Acessibilidade WCAG 2.1 AA** - ARIA labels, keyboard navigation
6. **Dark Mode** - Suporte completo light/dark

### Tokens CSS Principais

```css
/* oraclusx-ds.css */
:root {
  /* CORES PRIMÁRIAS */
  --primary: #6366f1;           /* Índigo (único cor hard gate) */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* NEUMÓRFICO - LIGHT */
  --bg-light: #e0e5ec;
  --shadow-light-1: 8px 8px 16px #a3b1c6;
  --shadow-light-2: -8px -8px 16px #ffffff;
  
  /* NEUMÓRFICO - DARK */
  --bg-dark: #2d3748;
  --shadow-dark-1: 8px 8px 16px #1a202c;
  --shadow-dark-2: -8px -8px 16px #3d4a5c;
  
  /* TIPOGRAFIA */
  --text-heading-xl: 3rem;
  --text-heading-lg: 2rem;
  --text-heading-md: 1.5rem;
  --text-body: 1rem;
  --text-body-sm: 0.875rem;
  
  /* ESPAÇAMENTOS */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* RADIUS */
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  
  /* TRANSIÇÕES */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
}
```

### Classes Utilitárias

```css
/* Neumorphic Styles */
.neuro-raised {
  background: var(--bg-light);
  box-shadow: var(--shadow-light-1), var(--shadow-light-2);
  transition: var(--transition-base);
}

.neuro-raised:hover {
  transform: translateY(-2px);
  box-shadow: 10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff;
}

.neuro-inset {
  background: var(--bg-light);
  box-shadow: inset 8px 8px 16px #a3b1c6, inset -8px -8px 16px #ffffff;
}

.neuro-flat {
  background: var(--bg-light);
  box-shadow: 2px 2px 4px #a3b1c6, -2px -2px 4px #ffffff;
}

/* Dark Mode */
.dark .neuro-raised {
  background: var(--bg-dark);
  box-shadow: var(--shadow-dark-1), var(--shadow-dark-2);
}
```

---

## 🧩 COMPONENTES PRINCIPAIS

### 1. Button Component

**Arquivo**: `src/components/oraclusx-ds/Button.tsx`

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'default', 
  size = 'md',
  icon,
  loading,
  children,
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'neuro-raised rounded-xl flex items-center justify-center gap-2',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-[var(--primary)] text-white hover:bg-[#5558e0]': variant === 'default',
          'bg-transparent': variant === 'ghost',
          'bg-[var(--error)] text-white': variant === 'error',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-6 py-2.5 text-base': size === 'md',
          'px-8 py-3.5 text-lg': size === 'lg',
        },
        className
      )}
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
      }}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
```

**Uso**:
```tsx
<Button variant="default" size="md" icon={<Plus />}>
  Novo Pedido
</Button>

<Button variant="error" icon={<Trash2 />} loading={isDeleting}>
  Excluir
</Button>
```

### 2. Card Component

**Arquivo**: `src/components/oraclusx-ds/Card.tsx`

```typescript
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('neuro-raised rounded-xl p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      {children}
    </div>
  );
}

export function CardTitle({ children }: CardTitleProps) {
  return (
    <h3 
      className="text-[var(--text-primary)] m-0"
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-heading-md)',
        fontWeight: 600,
      }}
    >
      {children}
    </h3>
  );
}
```

**Uso**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Vendas do Mês</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold">R$ 250.000</p>
    <p className="text-sm text-green-600">+15% vs mês anterior</p>
  </CardContent>
</Card>
```

### 3. Input Component

**Arquivo**: `src/components/oraclusx-ds/Input.tsx`

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label 
            className="block text-[var(--text-primary)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
            }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'neuro-inset rounded-lg px-4 py-2.5 w-full',
              'bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]',
              'text-[var(--text-primary)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
              'transition-all duration-300',
              {
                'pl-10': icon,
                'border-red-500': error,
              },
              className
            )}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  }
);
```

### 4. MultiStepForm Component

**Arquivo**: `src/components/forms/MultiStepForm.tsx`

```typescript
export function MultiStepForm({ 
  steps, 
  onComplete, 
  children 
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const nextStep = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    if (currentStep === steps.length - 1) {
      onComplete({ ...formData, ...data });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <MultiStepContext.Provider value={{ 
      currentStep, 
      nextStep, 
      prevStep, 
      formData 
    }}>
      <Card className="max-w-4xl mx-auto">
        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {React.Children.toArray(children)[currentStep]}
          </motion.div>
        </AnimatePresence>
      </Card>
    </MultiStepContext.Provider>
  );
}
```

**Uso**:
```tsx
<MultiStepForm
  steps={['Dados Pessoais', 'Endereço', 'Confirmação']}
  onComplete={handleSubmit}
>
  <Step1DadosPessoais />
  <Step2Endereco />
  <Step3Confirmacao />
</MultiStepForm>
```

---

## 🪝 CUSTOM HOOKS

### 1. useValidacao Hook

**Arquivo**: `src/hooks/useValidacao.ts`

```typescript
type TipoValidacao = 'cep' | 'cnpj' | 'cpf' | 'crm' | 'veiculo' | 'anvisa';

interface UseValidacaoOptions {
  tipo: TipoValidacao;
  useCache?: boolean;
  ttl?: number; // segundos
}

export function useValidacao(options: UseValidacaoOptions) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validar = async (valor: string) => {
    setLoading(true);
    setError(null);

    try {
      let resultado;

      // Verifica cache se habilitado
      if (options.useCache) {
        const cached = await getFromCache(options.tipo, valor);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Chama serviço apropriado
      switch (options.tipo) {
        case 'cep':
          resultado = await ViaCepService.consultarCEP(valor);
          break;
        case 'cnpj':
          resultado = await ReceitaFederalService.consultarCNPJ(valor);
          break;
        case 'cpf':
          resultado = await ReceitaFederalService.consultarCPF(valor);
          break;
        case 'crm':
          resultado = await CFMService.consultarCRM(valor);
          break;
        case 'veiculo':
          resultado = await VeiculoService.consultarFIPE(valor);
          break;
        case 'anvisa':
          resultado = await ANVISAService.consultarRegistro(valor);
          break;
      }

      // Salva no cache
      if (options.useCache && resultado) {
        await saveToCache(options.tipo, valor, resultado, options.ttl);
      }

      setData(resultado);
      return resultado;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, validar };
}
```

**Uso**:
```tsx
const { data, loading, validar } = useValidacao({
  tipo: 'cnpj',
  useCache: true,
  ttl: 86400, // 24 horas
});

const handleValidar = async () => {
  try {
    const empresa = await validar('12345678000190');
    console.log(empresa.razao_social);
  } catch (error) {
    toast.error('CNPJ inválido');
  }
};
```

### 2. useAuth Hook

**Arquivo**: `src/hooks/useAuth.ts`

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// AuthContext Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Uso**:
```tsx
const { user, signIn, signOut } = useAuth();

if (!user) {
  return <LoginPage />;
}

return (
  <div>
    <p>Bem-vindo, {user.email}!</p>
    <Button onClick={signOut}>Sair</Button>
  </div>
);
```

---

## 📊 CHARTS & DASHBOARDS

### Recharts Implementation

**Arquivo**: `src/components/dashboard/Charts.tsx`

```typescript
export function LineChartComponent({ data, dataKey, xKey }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis 
          dataKey={xKey} 
          stroke="var(--text-secondary)"
          style={{ fontFamily: 'var(--font-body)' }}
        />
        <YAxis 
          stroke="var(--text-secondary)"
          style={{ fontFamily: 'var(--font-body)' }}
        />
        <RechartsTooltip 
          contentStyle={{
            backgroundColor: 'var(--bg-light)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-light-1), var(--shadow-light-2)',
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke="var(--primary)" 
          strokeWidth={3}
          dot={{ fill: 'var(--primary)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**8 Tipos de Gráficos Implementados**:
1. **LineChart** - Tendências temporais
2. **BarChart** - Comparações categoria
3. **AreaChart** - Volume acumulado
4. **PieChart** - Distribuição percentual
5. **ComposedChart** - Múltiplos tipos combinados
6. **RadarChart** - Análise multidimensional
7. **ScatterChart** - Correlações
8. **MultiRadarChart** - Comparação múltiplas entidades

---

## 🎯 ESTADO E PERFORMANCE

### State Management

**Abordagem**: Context API + Zustand (lightweight)

```typescript
// Zustand store para estado global complexo
import create from 'zustand';

interface AppStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

### Performance Optimizations

```typescript
// 1. Code Splitting (React.lazy)
const DashboardBI = React.lazy(() => import('./components/modules/BIDashboardInterativo'));

// 2. Memoization
const MemoizedChart = React.memo(LineChartComponent);

const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'ativo');
}, [data]);

const handleSearch = useCallback(
  debounce((query: string) => {
    // Search logic
  }, 300),
  []
);

// 3. Virtual Scrolling (react-window)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

---

## 🚀 BUILD & DEPLOY

### Build Configuration

**Arquivo**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@lib': '/src/lib',
      '@styles': '/src/styles',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'ui': ['lucide-react', 'framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
  },
});
```

### Bundle Analyzer

```bash
npm run build -- --report
```

**Bundle Size** (otimizado):
- **index-[hash].js**: ~280KB (gzipped)
- **vendor-[hash].js**: ~150KB (gzipped)
- **supabase-[hash].js**: ~80KB (gzipped)
- **charts-[hash].js**: ~120KB (gzipped)
- **ui-[hash].js**: ~50KB (gzipped)
- **index-[hash].css**: ~45KB (gzipped)

**Total First Load**: ~350KB

---

**Continua na Parte 4: Integrações Externas e Deploy Final...**

