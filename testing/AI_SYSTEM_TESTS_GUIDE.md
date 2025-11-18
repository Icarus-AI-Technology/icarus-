# 🧪 Guia de Testes Automatizados - AI System
## ICARUS v5.0

**Data:** 28 de Outubro de 2025  
**Versão:** 1.0.0

---

## 📋 Visão Geral

Suite completa de testes automatizados para o sistema de **AI Tutors & Agents**, incluindo:
- ✅ Testes End-to-End (E2E) com Playwright
- ✅ Testes Unitários com Vitest
- ✅ Cobertura de componentes principais
- ✅ Testes de performance
- ✅ Testes de acessibilidade

---

## 📂 Arquivos de Teste

### 1. **Testes E2E** ✅
**`tests/e2e/ai-system.spec.ts`** (~400 linhas)

**Cobertura:**
- AITutor Component
- AIOrchestrator Service
- AI System Dashboard
- CEO Intelligence Integration
- Performance & Responsiveness
- Error Handling
- Accessibility (A11y)
- Dark Mode

### 2. **Testes Unitários** ✅
**`tests/unit/AIOrchestrator.test.ts`** (~200 linhas)

**Cobertura:**
- getContextualSuggestions()
- identifyModuleCategory()
- Sugestões por categoria
- Performance
- Error Handling

---

## 🚀 Como Executar

### Pré-requisitos

```bash
# Instalar dependências de teste
pnpm add -D @playwright/test vitest @testing-library/react
```

### Testes E2E (Playwright)

```bash
# Instalar browsers
npx playwright install

# Executar todos os testes E2E
npx playwright test

# Executar em modo UI (interativo)
npx playwright test --ui

# Executar testes específicos
npx playwright test ai-system

# Ver relatório
npx playwright show-report
```

### Testes Unitários (Vitest)

```bash
# Executar todos os testes unitários
pnpm test

# Executar em modo watch
pnpm test:watch

# Ver cobertura
pnpm test:coverage

# Executar testes específicos
pnpm test AIOrchestrator
```

---

## 📊 Cobertura dos Testes

### **Componentes Testados:**

#### 1. **AITutor Component**
- [x] Renderização no Dashboard
- [x] Exibição de sugestões
- [x] Execução de ações
- [x] Diferentes tipos de sugestões
- [x] Estados de loading
- [x] Error handling
- [x] Acessibilidade
- [x] Dark mode

#### 2. **AIOrchestrator Service**
- [x] Sugestões contextuais
- [x] Classificação de módulos
- [x] Sugestões genéricas
- [x] Performance (<2s)
- [x] Múltiplas chamadas simultâneas
- [x] Validação de dados

#### 3. **AI System Dashboard**
- [x] Carregamento de KPIs
- [x] Métricas dos agentes
- [x] Status dos agentes
- [x] Top 10 módulos
- [x] Saúde do sistema
- [x] Auto-refresh
- [x] Responsividade
- [x] Dark mode

#### 4. **CEO Intelligence**
- [x] Acesso ao dashboard
- [x] Feed operacional
- [x] Eventos no feed

---

## 🎯 Casos de Teste Principais

### **1. Smoke Tests** (Básicos)
```typescript
✓ AITutor deve aparecer no Dashboard
✓ Dashboard AI deve carregar
✓ Agentes devem estar listados
✓ KPIs devem ser exibidos
```

### **2. Functional Tests** (Funcionais)
```typescript
✓ Sugestões devem ser exibidas
✓ Ações devem ser executáveis
✓ Diferentes tipos de sugestões
✓ Sugestões contextuais por módulo
✓ Métricas dos agentes
✓ Top 10 módulos ativos
```

### **3. Performance Tests**
```typescript
✓ AITutor carrega em <3s
✓ Sugestões retornam em <2s
✓ Dashboard responsivo
✓ Múltiplas chamadas simultâneas
```

### **4. Error Handling Tests**
```typescript
✓ Falha ao carregar sugestões
✓ Estado de loading
✓ Contexto inválido
✓ Array vazio em erro
```

### **5. Accessibility Tests** (A11y)
```typescript
✓ Atributos ARIA adequados
✓ Navegação por teclado
✓ Contraste de cores (AA)
✓ Screen reader friendly
```

### **6. Visual Tests**
```typescript
✓ Dark mode funciona
✓ Responsividade (Desktop/Tablet/Mobile)
✓ Componentes visíveis
```

---

## 📈 Métricas de Qualidade

### **Cobertura de Código Esperada:**
- **Componentes:** >80%
- **Services:** >90%
- **Utils:** >85%

### **Performance Targets:**
- **E2E Tests:** <5min total
- **Unit Tests:** <30s total
- **Load time:** <3s por página

### **Qualidade:**
- **Pass Rate:** >95%
- **Flaky Tests:** <2%
- **False Positives:** <1%

---

## 🔍 Estrutura dos Testes

### **Padrão E2E:**
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('deve fazer algo', async ({ page }) => {
    // Arrange
    await page.goto('/rota');
    
    // Act
    await page.click('[data-testid="button"]');
    
    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### **Padrão Unitário:**
```typescript
describe('Service Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('deve fazer algo', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await service.method(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

---

## 🛠️ Data Test IDs Adicionados

Para facilitar os testes, foram adicionados `data-testid`:

### **AITutor Component:**
```typescript
data-testid="ai-tutor"           // Container principal
data-testid="ai-loading"         // Estado de loading
data-testid="ai-suggestion"      // Cada sugestão
data-testid="ai-suggestion-action" // Botões de ação
data-testid="ai-error"           // Mensagem de erro
```

### **AI System Dashboard:**
```typescript
data-testid="kpi-card"           // Cada KPI
data-testid="kpi-value"          // Valor do KPI
data-testid="agent-metrics"      // Container dos agentes
data-testid="agent-card"         // Cada agente
data-testid="agent-status"       // Status do agente
data-testid="module-activity"    // Container módulos
data-testid="module-item"        // Cada módulo
data-testid="health-indicator"   // Indicadores de saúde
```

---

## 🐛 Troubleshooting

### **Problema: Testes E2E falhando**

**Solução:**
```bash
# Reinstalar browsers
npx playwright install --force

# Limpar cache
npx playwright test --clear-cache

# Executar em modo debug
npx playwright test --debug
```

### **Problema: Timeouts nos testes**

**Solução:**
```typescript
// Aumentar timeout global
test.setTimeout(30000); // 30 segundos

// Ou por teste
test('...', async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### **Problema: Testes flaky (instáveis)**

**Solução:**
```typescript
// Adicionar waits apropriados
await page.waitForSelector('[data-testid="element"]');
await page.waitForLoadState('networkidle');

// Usar retry automático
test.retries(2);
```

---

## 📊 Relatórios

### **Playwright Report:**
```bash
# Gerar relatório HTML
npx playwright test --reporter=html

# Abrir relatório
npx playwright show-report
```

### **Vitest Coverage:**
```bash
# Gerar relatório de cobertura
pnpm test:coverage

# Ver em ./coverage/index.html
```

---

## 🎯 CI/CD Integration

### **GitHub Actions Exemplo:**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## ✅ Checklist de Testes

Antes de fazer deploy:

- [ ] Todos os testes E2E passando
- [ ] Todos os testes unitários passando
- [ ] Cobertura >80%
- [ ] Sem testes flaky
- [ ] Performance dentro dos targets
- [ ] Acessibilidade validada
- [ ] Dark mode testado
- [ ] Responsividade testada

---

## 📚 Referências

- **Playwright Docs:** https://playwright.dev
- **Vitest Docs:** https://vitest.dev
- **Testing Library:** https://testing-library.com

---

## 🎉 Benefícios

✅ **Confiança:** Deploy com segurança  
✅ **Qualidade:** Bugs detectados cedo  
✅ **Velocidade:** Testes automatizados  
✅ **Documentação:** Testes como specs  
✅ **Regressão:** Prevenir quebras  

---

**Testes criados por:** AI Assistant  
**Data:** 28 de Outubro de 2025  
**Versão:** 1.0.0

