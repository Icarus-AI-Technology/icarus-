# 🎯 PLANO TÁTICO — PRÓXIMOS PASSOS RECOMENDADOS

**Data:** 20 de Outubro de 2025  
**Agente:** ORQUESTRADOR_UX_MCP  
**Status Atual:** 91% completo (53/58 módulos)

---

## 🚀 PROGRESSO ATUAL

### ✅ COMPLETADO
- ✅ **Inventário Total:** 312 arquivos, 77.727 linhas
- ✅ **Módulo Cadastros:** 100% (9 sub-módulos, 7.600 linhas)
- ✅ **Design System:** 100% (48 componentes, Neumorphism 3D, dark mode)
- ✅ **Hard Gates:** 100% compliance
- ✅ **Build Produção:** SUCCESS (254.95 kB gzip)
- ✅ **Pesquisa OSS:** Economia potencial $295-575/mês

---

## 📋 PRÓXIMOS BLOCOS (Prioridade P1)

### **BLOCO 5: Implementar Módulo Compras Completo (4 sub-módulos restantes)**

**Sub-módulos Pendentes:**
1. ✅ Dashboard Compras (completo)
2. 🟡 Gestão de Cotações (esqueleto)
3. 🟡 Pedidos de Compra (workflow parcial)
4. 🟡 Notas de Compra - Parse XML NF-e (pendente)
5. ❌ Compras Internacionais (não iniciado)
6. ❌ IA para Compras - Recomendação de Fornecedores (não iniciado)

**Estimativa:** ~3.500 linhas, 3-4 dias

**Arquivos a Criar/Modificar:**
- `src/pages/compras/GestaoCotacoes.tsx` (novo, ~800 linhas)
- `src/pages/compras/PedidosCompra.tsx` (modificar, +400 linhas)
- `src/pages/compras/NotasCompra.tsx` (modificar, +600 linhas)
- `src/pages/compras/ComprasInternacionais.tsx` (novo, ~900 linhas)
- `src/services/ComprasAIService.ts` (novo, ~800 linhas)
- `src/lib/services/SEFAZService.ts` (expandir, +400 linhas)
- `src/lib/services/ParseXMLNFeService.ts` (novo, ~600 linhas)

**Integrações:**
- 📄 **SEFAZ (WebService SOAP)** — Consulta NF-e por chave de acesso
- 📄 **Tesseract.js (OCR)** — Extração de DANFE (PDF → dados)
- 🤖 **IA Recomendação** — Score de fornecedores (histórico + performance)

**Rotas a Adicionar no `App.tsx`:**
```tsx
<Route path="/compras" element={<DashboardCompras />} />
<Route path="/compras/cotacoes" element={<GestaoCotacoes />} />
<Route path="/compras/pedidos" element={<PedidosCompra />} />
<Route path="/compras/notas" element={<NotasCompra />} />
<Route path="/compras/internacionais" element={<ComprasInternacionais />} />
<Route path="/compras/ia-analise" element={<ComprasIAAnalise />} />
```

---

## 💰 IMPLEMENTAÇÕES OSS/BAIXO CUSTO (P1 - Alta Prioridade)

### **1. Migrar Chatbot para Ollama (Local LLM)**

**Objetivo:** Substituir OpenAI GPT-4 por Llama 3.2 (3B) local  
**Economia:** **$150-300/mês** permanente  
**Tempo:** 1-2 dias

**Passos:**
1. Instalar Ollama (`brew install ollama` ou `curl -fsSL https://ollama.com/install.sh | sh`)
2. Baixar modelo: `ollama pull llama3.2:3b`
3. Criar `src/lib/services/OllamaService.ts`
4. Modificar `src/components/oraclusx-ds/ChatbotWithResearch.tsx`
5. Testes A/B (comparar qualidade de resposta)
6. Fallback para OpenAI (se Ollama offline)

### **2. Implementar OCR DANFE (Tesseract.js)**

**Objetivo:** Extrair dados de DANFE (PDF/imagem) sem APIs pagas  
**Economia:** **$45-150/mês**  
**Tempo:** 1 dia

**Passos:**
1. Instalar Tesseract.js (`npm install tesseract.js`)
2. Criar `src/lib/services/OCRService.ts`
3. Integrar em `NotasCompra.tsx` (upload PDF → parse → preview)
4. Testes com 10 DANFEs reais

### **3. Setup FCM (Push Notifications)**

**Objetivo:** Alertas em tempo real (estoque baixo, cirurgias, faturas)  
**Custo:** **$0** (FCM free, ilimitado)  
**Tempo:** 0.5 dia

**Passos:**
1. Criar projeto Firebase
2. Configurar `public/firebase-messaging-sw.js`
3. Criar `src/lib/services/FCMService.ts`
4. Integrar com Supabase Realtime (triggers)

---

## 🧪 TESTES & QA (P1 - Crítico para Produção)

### **1. E2E Tests (Playwright)**

**Objetivo:** Garantir workflows críticos  
**Tempo:** 2 dias

**Casos de Teste Prioritários:**
```typescript
// tests/e2e/cadastro-medico.spec.ts
test('Cadastro de Médico - Fluxo Completo', async ({ page }) => {
  await page.goto('/cadastros/medicos');
  await page.fill('[name="nome_completo"]', 'Dr. Teste E2E');
  await page.fill('[name="cpf"]', '123.456.789-00');
  await page.fill('[name="crm"]', '123456');
  await page.selectOption('[name="uf_crm"]', 'SP');
  await page.fill('[name="especialidade"]', 'Ortopedia');
  await page.fill('[name="celular"]', '(11) 98765-4321');
  await page.fill('[name="email"]', 'teste@email.com');
  await page.click('button[type="submit"]');
  
  // Assert
  await expect(page).toHaveURL('/cadastros');
  await expect(page.getByText('Médico cadastrado com sucesso!')).toBeVisible();
});
```

**Total:** ~15 tests (9 cadastros + 6 workflows críticos)

### **2. Visual Regression (Testsprite) — ⚠️ MCP Indisponível**

**Situação:** Testsprite MCP requer API key  
**Alternativa:** Manual screenshots + comparação visual

**Rotas a Capturar (Light + Dark):**
- `/` (Dashboard Principal)
- `/cadastros` (Dashboard Cadastros)
- `/cadastros/medicos` (Formulário Médico)
- `/cadastros/produtos` (Formulário Produtos OPME)
- `/compras` (Dashboard Compras)

**Ferramenta Manual:** Playwright Screenshots
```typescript
await page.goto('/');
await page.screenshot({ path: 'docs/screenshots/dashboard-light.png' });

await page.emulateMedia({ colorScheme: 'dark' });
await page.screenshot({ path: 'docs/screenshots/dashboard-dark.png' });
```

---

## 🚀 PERFORMANCE (P2 - Importante)

### **1. Code-Splitting (React.lazy)**

**Objetivo:** Reduzir bundle inicial de 977 kB → ~800 kB  
**Impacto:** **+20-30% performance** (LCP, TTI)  
**Tempo:** 1 dia

**Implementação:**
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const CadastroMedicos = lazy(() => import('./pages/cadastros/CadastroMedicos'));
const CadastroHospitais = lazy(() => import('./pages/cadastros/CadastroHospitais'));
// ... (todos os 58 módulos)

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="animate-spin" size={48} />
  </div>
);

// No Routes:
<Route 
  path="/cadastros/medicos" 
  element={
    <Suspense fallback={<LoadingFallback />}>
      <CadastroMedicos />
    </Suspense>
  } 
/>
```

**Resultado Esperado:**
- Bundle inicial: 977 kB → **~800 kB** (-18%)
- Chunks por módulo: ~20-50 kB cada
- First Load: 254 kB gzip → **~180 kB** (-29%)

---

## 📊 CRONOGRAMA RECOMENDADO (Próximas 2 Semanas)

### **Semana 1: Módulo Compras + OSS Migration**

| Dia | Tarefa | Tempo | Responsável |
|-----|--------|-------|-------------|
| **Dia 1** | Gestão de Cotações (form + workflow) | 8h | Dev |
| **Dia 2** | Pedidos de Compra (completar workflow) | 8h | Dev |
| **Dia 3** | Parse XML NF-e (SEFAZ + Tesseract OCR) | 8h | Dev |
| **Dia 4** | Compras Internacionais (form + cálculos) | 8h | Dev |
| **Dia 5** | IA Compras (recomendação fornecedores) | 8h | Dev |

**Entregável Semana 1:** ✅ Módulo Compras 100% (6 sub-módulos)

### **Semana 2: Testes + Performance + Deploy**

| Dia | Tarefa | Tempo | Responsável |
|-----|--------|-------|-------------|
| **Dia 6** | Ollama Setup + Integração Chatbot | 8h | Dev |
| **Dia 7** | FCM Setup + Notificações Realtime | 4h | Dev |
| **Dia 7** | E2E Tests (Playwright - 15 tests) | 4h | QA/Dev |
| **Dia 8** | Code-Splitting (React.lazy) | 8h | Dev |
| **Dia 9** | Visual Regression (screenshots) + A11y Audit | 8h | QA |
| **Dia 10** | Deploy Produção (Vercel/Netlify) + CI/CD | 8h | DevOps/Dev |

**Entregável Semana 2:** ✅ Sistema 100% + Deploy Produção

---

## 🎯 MÉTRICAS DE SUCESSO

### KPIs Técnicos
- ✅ **Módulos Completos:** 58/58 (100%)
- ✅ **Build Size:** < 300 kB gzip (atual: 254.95 kB)
- ✅ **Lighthouse Score:** > 90 (Performance, A11y, Best Practices)
- ✅ **Test Coverage:** > 80% (unit + integration + E2E)
- ✅ **Hard Gates Violations:** 0

### KPIs de Negócio
- 💰 **Economia Mensal:** $295-575/mês (OSS migration)
- ⚡ **Time-to-Interactive:** < 3s (code-splitting)
- ♿ **A11y Compliance:** WCAG 2.1 AA (100%)
- 📱 **Responsive:** Mobile + Tablet + Desktop

---

## 🏁 CONCLUSÃO

### Status Atual
- **Código:** 91% completo (53/58 módulos)
- **Design:** 100% compliant (OraclusX DS + Neumorphism 3D)
- **Build:** SUCCESS (254.95 kB gzip)
- **Pesquisa:** Economia potencial $295-575/mês

### Próximos Passos Críticos (P1)
1. **Completar Módulo Compras** (4 sub-módulos, 3-4 dias)
2. **Migrar Chatbot para Ollama** (economia $150-300/mês, 1-2 dias)
3. **Implementar E2E Tests** (15 tests, 2 dias)
4. **Code-Splitting** (redução ~100 kB, 1 dia)
5. **Deploy Produção** (Vercel/Netlify + CI/CD, 1 dia)

### Timeline
- **Semana 1:** Módulo Compras + Migrações OSS
- **Semana 2:** Testes + Performance + Deploy

### Resultado Final
- ✅ **ICARUS v5.0 100% completo**
- ✅ **Economia $295-575/mês** (OSS stack)
- ✅ **Performance otimizada** (~180 kB gzip)
- ✅ **100% testado** (E2E + Visual)
- ✅ **Produção-ready** (Deploy + CI/CD)

---

**Relatório gerado por:** ORQUESTRADOR_UX_MCP  
**Data de Conclusão Estimada:** **6 de Novembro de 2025** (17 dias)
