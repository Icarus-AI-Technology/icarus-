# 📚 Guia de Contribuição - ICARUS v5.0

Obrigado por contribuir com o ICARUS v5.0! Este guia estabelece os padrões e processos para manter nosso **100% Quality Score**.

---

## 🎯 Padrões de Qualidade

### Quality Score Mínimo: 95%

Todas as contribuições devem manter ou melhorar as seguintes métricas:

| Métrica           | Mínimo Aceitável | Ideal |
| ----------------- | ---------------- | ----- |
| Quality Score     | 95%              | 100%  |
| Test Coverage     | 50%              | 80%+  |
| Type Safety       | 85%              | 95%+  |
| JSDoc Coverage    | 80%              | 90%+  |
| ESLint Errors     | 0                | 0     |
| TypeScript Errors | 0                | 0     |
| 'any' types       | <50              | <30   |

---

## 📋 Checklist Antes de Commitar

- [ ] **Testes passando:** `pnpm test`
- [ ] **Lint sem erros:** `pnpm lint`
- [ ] **TypeScript OK:** `pnpm typecheck`
- [ ] **Sem 'any' types** desnecessários
- [ ] **JSDoc** em funções públicas
- [ ] **Testes adicionados** para novas features
- [ ] **Código formatado:** `pnpm format`

---

## 🔧 Setup do Ambiente

### 1. Clone e Instale

```bash
git clone https://github.com/seu-usuario/icarus-make.git
cd icarus-make
pnpm install
```

### 2. Configure Pre-commit Hooks

```bash
pnpm prepare
```

### 3. Rode o Monitor de Qualidade

```bash
./scripts/quality/monitor-quality.sh
```

---

## 📝 Padrões de Código

### TypeScript

#### ✅ BOM

```typescript
interface Usuario {
  id: string;
  nome: string;
  email: string;
}

async function buscarUsuario(id: string): Promise<Usuario> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
```

#### ❌ RUIM

```typescript
async function buscarUsuario(id: any): Promise<any> {
  const data = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}
```

### Tratamento de Erros

#### ✅ BOM

```typescript
try {
  await operation();
} catch (error: unknown) {
  const err = error as Error;
  logger.error("Operação falhou", err);
  throw err;
}
```

#### ❌ RUIM

```typescript
try {
  await operation();
} catch (error: any) {
  console.log(error);
}
```

### JSDoc

#### ✅ BOM

````typescript
/**
 * Busca um usuário pelo ID
 *
 * @param id - ID único do usuário
 * @returns Dados completos do usuário
 * @throws {Error} Se usuário não encontrado
 *
 * @example
 * ```typescript
 * const usuario = await buscarUsuario('123');
 * console.log(usuario.nome);
 * ```
 */
async function buscarUsuario(id: string): Promise<Usuario> {
  // ...
}
````

#### ❌ RUIM

```typescript
// Busca usuario
async function buscarUsuario(id: string): Promise<Usuario> {
  // ...
}
```

---

## 🧪 Testes

### Estrutura de Testes

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMinhoHook } from "../useMinhoHook";

// Mock do Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe("useMinhoHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar dados com sucesso", async () => {
    const { result } = renderHook(() => useMinhoHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it("deve lidar com erro", async () => {
    // Mock de erro
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: new Error("Erro") }),
    } as never);

    const { result } = renderHook(() => useMinhoHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

### Coverage Mínimo

- **Hooks:** 80%+
- **Components:** 70%+
- **Services:** 75%+
- **Utils:** 90%+

---

## 🎨 Componentes React

### Estrutura de Componente

````typescript
/**
 * Componente de Card para exibição de dados
 *
 * @example
 * ```tsx
 * <Card title="Título" description="Descrição">
 *   <p>Conteúdo</p>
 * </Card>
 * ```
 */
interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={cn('card', className)}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div>{children}</div>
    </div>
  );
}
````

### Error Boundaries

Todos os componentes principais devem ter Error Boundary:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

function MinhaFeature() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MinhoComponente />
    </ErrorBoundary>
  );
}
```

---

## 🔀 Workflow de Contribuição

### 1. Crie uma Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

### 2. Faça as Alterações

- Escreva código seguindo os padrões
- Adicione testes
- Atualize documentação

### 3. Rode os Checks

```bash
# Testes
pnpm test

# Lint
pnpm lint

# TypeScript
pnpm typecheck

# Monitor de Qualidade
./scripts/quality/monitor-quality.sh
```

### 4. Commit

Mensagens de commit devem seguir [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adiciona hook useNovaFuncionalidade
fix: corrige erro no cálculo de estoque
docs: atualiza README com exemplos
test: adiciona testes para useAuth
refactor: melhora performance do dashboard
```

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Crie um Pull Request com:

- Título descritivo
- Descrição detalhada das mudanças
- Screenshots (se UI)
- Checklist de qualidade preenchido

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Inicia dev server

# Qualidade
pnpm test                   # Roda testes
pnpm test:watch             # Testes em watch mode
pnpm test:coverage          # Testes com coverage
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint com fix automático
pnpm typecheck              # TypeScript check
pnpm format                 # Formata código (Prettier)

# Build
pnpm build                  # Build de produção
pnpm preview                # Preview do build

# Qualidade Avançada
./scripts/quality/monitor-quality.sh  # Monitor completo
./scripts/audit/fix-critical-issues.sh # Fix automático
```

---

## 📖 Recursos

### Documentação

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)

### Ferramentas

- [VS Code](https://code.visualstudio.com/)
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

## 🤝 Code Review

### O que Procuramos

✅ **Aprovar se:**

- Todos os testes passam
- Quality Score mantém 95%+
- Código segue padrões
- JSDoc completo
- Sem 'any' types desnecessários

❌ **Solicitar mudanças se:**

- Testes falhando
- Lint errors
- TypeScript errors
- Sem testes para novas features
- 'any' types sem justificativa

### Tempo de Review

- Features pequenas: 1-2 dias
- Features médias: 2-4 dias
- Features grandes: 4-7 dias

---

## 🐛 Reportando Bugs

Use o template de issue do GitHub com:

1. **Descrição:** O que está errado?
2. **Reprodução:** Passos para reproduzir
3. **Esperado:** O que deveria acontecer
4. **Atual:** O que está acontecendo
5. **Ambiente:** Browser, OS, versão
6. **Screenshots:** Se aplicável
7. **Logs:** Console errors

---

## 💡 Sugerindo Features

1. **Propósito:** Qual problema resolve?
2. **Solução:** Como funcionaria?
3. **Alternativas:** Outras abordagens consideradas?
4. **Impacto:** Quem se beneficia?
5. **Mockups:** Wireframes ou designs (se UI)

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/icarus-make/issues)
- **Discussions:** [GitHub Discussions](https://github.com/seu-usuario/icarus-make/discussions)
- **Email:** dev@icarus.com.br

---

## 📜 Licença

Este projeto é proprietário. Todas as contribuições estão sujeitas aos termos do contrato de contribuição.

---

## 🏆 Agradecimentos

Obrigado por ajudar a manter o ICARUS v5.0 com **100% Quality Score**! 🚀

Contribuidores destacados:

- Sua contribuição aqui!

---

**Última atualização:** 26 de Outubro de 2025  
**Versão do Guia:** 1.0.0
