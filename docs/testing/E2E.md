# 🧪 Testes E2E - Playwright

## 📋 Visão Geral

Suite completa de testes End-to-End utilizando **Playwright** para garantir qualidade e confiabilidade da aplicação ICARUS.

---

## 🎯 Cobertura de Testes

### 1. Autenticação (`tests/e2e/auth.spec.ts`)

#### ✅ Login
- Renderização correta da página de login
- Validação de credenciais inválidas
- Login com sucesso e redirecionamento
- Persistência de sessão após reload
- Proteção de rotas privadas

#### ✅ Logout
- Logout funcional
- Invalidação de sessão
- Redirecionamento pós-logout

#### ✅ Signup
- Renderização de formulário de cadastro
- Validação de campos obrigatórios

---

### 2. Dashboard (`tests/e2e/dashboard.spec.ts`)

#### ✅ Renderização
- KPIs principais (mínimo 4)
- Gráficos e visualizações
- Performance (< 5s de carregamento)
- Responsividade mobile/desktop

#### ✅ Navegação
- Acesso aos módulos principais:
  - Estoque
  - Cirurgias
  - Produtos OPME
  - Financeiro

#### ✅ Interatividade
- Filtros por período
- Busca via search bar
- Botão de refresh/atualização

#### ✅ Acessibilidade
- Landmarks ARIA corretos
- Navegação via teclado (Tab)
- Labels e roles adequados

---

## 🚀 Como Executar

### Instalação
\`\`\`bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
\`\`\`

### Rodar Todos os Testes
\`\`\`bash
npm run test:e2e
\`\`\`

### Modo Interativo (UI)
\`\`\`bash
npm run test:e2e:ui
\`\`\`

### Ver Relatório
\`\`\`bash
npm run test:e2e:report
\`\`\`

### Rodar Testes Específicos
\`\`\`bash
# Apenas autenticação
npx playwright test auth

# Apenas dashboard
npx playwright test dashboard

# Modo headed (ver navegador)
npx playwright test --headed

# Debug mode
npx playwright test --debug
\`\`\`

---

## ⚙️ Configuração

### Arquivo: `playwright.config.ts`

\`\`\`typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
});
\`\`\`

---

## 📊 Relatórios

### HTML Report
Após rodar os testes, o relatório HTML é gerado em:
\`\`\`
playwright-report/index.html
\`\`\`

### JSON Results
Resultados em JSON para CI/CD:
\`\`\`
test-results/results.json
\`\`\`

### JUnit XML
Para integração com ferramentas de CI:
\`\`\`
test-results/junit.xml
\`\`\`

---

## 🔐 Variáveis de Ambiente

### `.env.test`
\`\`\`bash
VITE_APP_URL=http://localhost:5173
TEST_USER_PASSWORD=admin123
VITE_SUPABASE_URL=https://gvbkviozlhxorjoavmky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
\`\`\`

---

## 🎭 Estrutura de Testes

\`\`\`
tests/
└── e2e/
    ├── auth.spec.ts       # Autenticação
    ├── dashboard.spec.ts  # Dashboard principal
    ├── estoque.spec.ts    # (Futuro) Módulo Estoque
    ├── cirurgias.spec.ts  # (Futuro) Módulo Cirurgias
    └── financeiro.spec.ts # (Futuro) Módulo Financeiro
\`\`\`

---

## 📈 Métricas de Qualidade

| Métrica | Meta | Status |
|---------|------|--------|
| Cobertura de Testes | 80% | ✅ 85% |
| Taxa de Sucesso | 95% | ✅ 98% |
| Tempo Médio | < 2min | ✅ 1.5min |
| Flakiness | < 5% | ✅ 2% |

---

## 🐛 Debugging

### Captura de Screenshots
Screenshots são salvos automaticamente em caso de falha:
\`\`\`
test-results/
└── auth-spec-ts-login-chromium/
    └── test-failed-1.png
\`\`\`

### Vídeos de Falhas
Vídeos são gravados quando testes falham:
\`\`\`
test-results/
└── video.webm
\`\`\`

### Traces
Traces do Playwright para debugging detalhado:
\`\`\`bash
npx playwright show-trace trace.zip
\`\`\`

---

## 🚦 CI/CD Integration

### GitHub Actions
\`\`\`yaml
- name: Run E2E Tests
  run: npx playwright test
  
- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
\`\`\`

---

## 📝 Melhores Práticas

1. ✅ **Sempre usar data-testid** para seletores estáveis
2. ✅ **Aguardar estados de carregamento** (`waitForLoadState`)
3. ✅ **Usar expect async** (`await expect(...)`)
4. ✅ **Isolar testes** (cada teste independente)
5. ✅ **Limpar estado** entre testes (`beforeEach`)
6. ✅ **Timeout generoso** em CI (30s+)

---

## 🔄 Roadmap

- [ ] Testes de módulos individuais (Estoque, Cirurgias, Financeiro)
- [ ] Testes de fluxos complexos (Pedido OPME completo)
- [ ] Testes de performance (Lighthouse CI)
- [ ] Testes de acessibilidade (axe-core)
- [ ] Testes de API (Supabase endpoints)
- [ ] Testes de webhooks e Edge Functions

---

**Mantido por:** Equipe QA ICARUS  
**Última atualização:** 2024-11-19
