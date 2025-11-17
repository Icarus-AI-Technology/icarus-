# 🚨 AÇÕES IMEDIATAS - AUDITORIA DE CÓDIGO

> **Status:** 🔴 BLOQUEADORES CRÍTICOS IDENTIFICADOS  
> **Prazo:** 24-48 horas para correções P0

---

## 🔴 P0 - URGENTE (Execute AGORA)

### 1. Remover Credenciais Expostas (5 minutos)

**Problema:** Credenciais reais do Supabase no `env.example`

```bash
# Editar env.example
nano env.example
```

**Substituir:**

```env
# ANTES (NUNCA FAZER ISSO!)
VITE_SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DEPOIS (CORRETO)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Commit:**

```bash
git add env.example
git commit -m "security: remove exposed Supabase credentials from env.example"
git push origin main
```

---

### 2. Rotacionar Chaves Supabase (30 minutos)

**Passo a passo:**

1. Acessar [Supabase Dashboard](https://app.supabase.com)
2. Selecionar projeto `ttswvavcisdnonytslom`
3. Ir em **Settings** → **API**
4. **Reset** da anon key
5. Atualizar variáveis:
   - Localmente no `.env`
   - No Vercel (Settings → Environment Variables)
   - Em qualquer outro ambiente

**Verificar:**

```bash
# Testar nova conexão
pnpm dev
# Verificar se login funciona
```

---

### 3. Implementar Sanitização XSS (2 horas)

**Instalar DOMPurify:**

```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

**Arquivos para corrigir:**

#### a) `src/components/modules/AdminConfiguracoes.tsx`

```typescript
// No início do arquivo
import DOMPurify from 'dompurify';

// Linha 386 - ANTES
<div
  className="p-3 bg-surface dark:bg-card rounded-lg"
  dangerouslySetInnerHTML={{ __html: templateHtml || '...' }}
/>

// DEPOIS
<div
  className="p-3 bg-surface dark:bg-card rounded-lg"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(templateHtml || '...')
  }}
/>
```

#### b) `src/lib/services/CFMScraperService.ts`

```typescript
// Adicionar import
import DOMPurify from "dompurify";

// Linha 145 - sanitizar antes de usar
const especialidades = await page.$$eval(selector, (elements) =>
  elements.map((el) => DOMPurify.sanitize(el.textContent || "")),
);
```

#### c) `src/main-test.tsx`

```typescript
// Linha 31 - sanitizar
root.innerHTML = DOMPurify.sanitize(`
  <div style="padding: 20px;">
    ...
  </div>
`);
```

**Testar:**

```bash
pnpm lint
pnpm dev
```

---

## 🟠 P1 - ALTA (Esta Semana)

### 4. Corrigir Erros de Lint (1 dia)

```bash
# Ver todos os erros
pnpm lint

# Corrigir automáticos
pnpm lint --fix

# Erros manuais
# - Substituir 'any' por tipos específicos
# - Corrigir hooks em stories
# - Atualizar regras de imagens
```

**Principais erros:**

#### a) Substituir 'any' types (23 ocorrências)

**Exemplos:**

```typescript
// ❌ RUIM - .cursor/agents/03-backend/run.ts:57
function executar(data: any) {
  return data.result;
}

// ✅ BOM
interface ExecutarData {
  result: string;
  status: number;
}

function executar(data: ExecutarData) {
  return data.result;
}
```

#### b) Corrigir Hooks em Stories

```typescript
// ❌ RUIM - src/components/oraclusx-ds/Dialog.stories.tsx
export const Default = {
  render: () => {
    const [open, setOpen] = useState(false); // Hook em render
    ...
  }
}

// ✅ BOM
const DialogExample = () => {
  const [open, setOpen] = useState(false);
  return ...
}

export const Default = {
  render: () => <DialogExample />
}
```

---

### 5. Implementar Testes Básicos (2 semanas)

**Meta inicial: 30% de cobertura**

#### a) Instalar dependências

```bash
pnpm add -D @vitest/coverage-v8
```

#### b) Prioridade 1: Testar Hooks (38 hooks)

**Template de teste:**

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";

describe("useAuth", () => {
  it("should login successfully", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      const response = await result.current.login(
        "test@example.com",
        "password123",
      );
      expect(response.sucesso).toBe(true);
    });
  });

  it("should handle login error", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      const response = await result.current.login(
        "invalid@example.com",
        "wrong",
      );
      expect(response.sucesso).toBe(false);
    });
  });
});
```

**Criar testes para:**

- ✅ useAuth
- ✅ useEstoque
- ✅ useConsignacao
- ✅ useFluxoCaixa
- ✅ useDashboardData
- ... (todos os 38 hooks)

#### c) Prioridade 2: Testar Services

```typescript
// src/services/__tests__/ValidacaoService.test.ts
import { describe, it, expect } from "vitest";
import { ValidacaoService } from "../ValidacaoService";

describe("ValidacaoService", () => {
  it("should validate CPF correctly", () => {
    expect(ValidacaoService.validarCPF("123.456.789-00")).toBe(true);
    expect(ValidacaoService.validarCPF("000.000.000-00")).toBe(false);
  });

  it("should validate CNPJ correctly", () => {
    expect(ValidacaoService.validarCNPJ("12.345.678/0001-00")).toBe(true);
    expect(ValidacaoService.validarCNPJ("00.000.000/0000-00")).toBe(false);
  });
});
```

#### d) Rodar testes

```bash
# Rodar todos
pnpm test

# Com cobertura
pnpm test:coverage

# Watch mode
pnpm test --watch

# UI mode
pnpm test:ui
```

**Meta:**

- Semana 1: 20% cobertura (hooks críticos)
- Semana 2: 30% cobertura (hooks + services)

---

### 6. Reduzir 'any' Types (1 semana)

**Meta: de 109 para < 20**

**Estratégia:**

#### Fase 1: Testes (45 ocorrências)

```typescript
// Permitido em testes
// Adicionar ao eslintrc
{
  files: ['**/*.test.ts', '**/*.test.tsx'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
}
```

#### Fase 2: Webhooks (15 ocorrências)

```typescript
// ❌ RUIM - src/webhooks/stripe-payment.ts
function verifySignature(payload: any, signature: any): any {
  ...
}

// ✅ BOM
interface StripePayload {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

function verifySignature(
  payload: StripePayload,
  signature: string
): boolean {
  ...
}
```

#### Fase 3: Services (25 ocorrências)

**Criar interfaces:**

```typescript
// src/types/integrations.ts
export interface JadlogResponse {
  success: boolean;
  tracking: string;
  status: string;
}

export interface BraspressQuote {
  price: number;
  delivery_days: number;
  service: string;
}

// Usar nos services
```

---

## 🟡 P2 - MÉDIA (Próximo Mês)

### 7. Otimizar Bundle Size

```bash
# Instalar analisador
pnpm add -D vite-bundle-visualizer

# Adicionar ao vite.config.ts
import { visualizer } from 'vite-bundle-visualizer';

plugins: [
  react(),
  visualizer({ open: true })
]

# Buildar e analisar
pnpm build
```

**Ações:**

- Revisar dependências grandes
- Lazy load mais componentes
- Tree-shaking agressivo

---

### 8. Implementar Logging Estruturado

```bash
pnpm add pino pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// Usar
logger.info({ userId: "123" }, "User logged in");
logger.error({ error: err }, "Failed to process");
```

---

### 9. Migrar para httpOnly Cookies

```typescript
// api/auth/login.ts
export default async function handler(req, res) {
  // Gerar JWT
  const token = jwt.sign(payload, SECRET, { expiresIn: "7d" });

  // Set httpOnly cookie
  res.setHeader("Set-Cookie", [
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
  ]);

  res.json({ success: true });
}
```

---

## 📋 CHECKLIST DE EXECUÇÃO

### Hoje (P0)

- [ ] ✅ Remover credenciais do env.example
- [ ] ✅ Commit e push
- [ ] ✅ Rotacionar chaves Supabase
- [ ] ✅ Atualizar .env local
- [ ] ✅ Atualizar Vercel env vars
- [ ] ✅ Testar aplicação

### Esta Semana (P0 + P1)

- [ ] ✅ Instalar DOMPurify
- [ ] ✅ Sanitizar 3 ocorrências de XSS
- [ ] ✅ Testar sanitização
- [ ] ✅ Corrigir erros de lint
- [ ] ✅ Instalar @vitest/coverage-v8
- [ ] ✅ Criar primeiros testes (5+ hooks)

### Próximas 2 Semanas

- [ ] ⏳ Testes para todos os 38 hooks
- [ ] ⏳ Testes para services críticos
- [ ] ⏳ Atingir 30% cobertura
- [ ] ⏳ Reduzir 'any' para < 20

### Próximo Mês

- [ ] 📅 Logging estruturado
- [ ] 📅 Bundle < 1MB
- [ ] 📅 httpOnly cookies
- [ ] 📅 80% cobertura

---

## 🆘 COMANDOS ÚTEIS

```bash
# Verificar status
pnpm lint                 # Erros de código
pnpm type-check          # Erros de tipo
pnpm test:coverage       # Cobertura de testes
pnpm build               # Testar build

# Desenvolvimento
pnpm dev                 # Dev server
pnpm test --watch        # Watch testes

# CI/CD
pnpm validate:all        # Type + Lint + Build
pnpm qa:all             # QA completo
```

---

## 📊 PROGRESSO

### Meta: Sistema Pronto para Produção

| Fase                   | Status       | Prazo   | Responsável |
| ---------------------- | ------------ | ------- | ----------- |
| P0 - Segurança Crítica | 🔴 TODO      | 24h     | DevOps      |
| P1 - Qualidade Alta    | 🟡 TODO      | 1 sem   | Dev Team    |
| P2 - Otimizações       | ⚪ TODO      | 1 mês   | Dev Team    |
| Deploy Produção        | ⚪ BLOQUEADO | 4-6 sem | -           |

---

**Dúvidas?** Consulte `RELATORIO_AUDITORIA_CODIGO.md` ou `RELATORIO_AUDITORIA_CODIGO.json`

**Última atualização:** 26/10/2025
