# 🔧 CI/CD - Configuração Completa

## ✅ Guia de Configuração dos Secrets no GitHub

### 1. Acessar Configurações do Repositório

```
https://github.com/<seu-usuario>/<seu-repo>/settings/secrets/actions
```

### 2. Adicionar Secrets (Click em "New repository secret")

#### Secret 1: VITE_SUPABASE_URL

```
Nome: VITE_SUPABASE_URL
Valor: https://<seu-projeto>.supabase.co
```

**Como obter:**

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → API
4. Copie "Project URL"

---

#### Secret 2: SUPABASE_FUNCTIONS_URL

```
Nome: SUPABASE_FUNCTIONS_URL
Valor: https://<seu-projeto>.supabase.co/functions/v1
```

**Nota:** Adicione `/functions/v1` ao final da URL do projeto

---

#### Secret 3: VITE_SUPABASE_ANON_KEY

```
Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter:**

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → API
4. Copie "anon public" key

---

### 3. Verificar Secrets Configurados

Após adicionar, você deve ver:

- ✅ VITE_SUPABASE_URL
- ✅ SUPABASE_FUNCTIONS_URL
- ✅ VITE_SUPABASE_ANON_KEY

---

## 📝 Configuração Local do Husky

### Instalar dependências necessárias:

```bash
pnpm add -D husky lint-staged
```

### Inicializar Husky:

```bash
pnpm exec husky init
```

### Testar hook localmente:

```bash
# Fazer uma mudança qualquer
echo "test" >> test.txt

# Adicionar ao stage
git add test.txt

# Tentar commit (vai executar validações)
git commit -m "test: verificar hooks"
```

**Resultado esperado:**

```
🔍 Executando validações pré-commit...

1️⃣ Validando topologia de IA...
✅ Topologia válida

2️⃣ Executando lint-staged...
✅ Lint passou

3️⃣ Verificando tipos TypeScript...
✅ Types OK

✅ Todas as validações passaram! Prosseguindo com commit...
```

---

## 🧪 Testar GitHub Actions Localmente

### Opção 1: Usar act (recomendado)

```bash
# Instalar act
brew install act

# Executar workflow localmente
act push
```

### Opção 2: Criar branch de teste

```bash
# Criar branch
git checkout -b test/ci-validation

# Fazer commit
git commit -m "test: CI validation" --allow-empty

# Push para testar
git push origin test/ci-validation

# Abrir PR no GitHub e ver workflow executar
```

---

## 📊 Badge de Status no README

Adicione ao `README.md`:

```markdown
[![Validação IA](https://github.com/<usuario>/<repo>/actions/workflows/validate-ia-topology.yml/badge.svg)](https://github.com/<usuario>/<repo>/actions/workflows/validate-ia-topology.yml)
```

---

## 🚨 Troubleshooting

### Erro: "Secret not found"

**Solução:** Verifique se os secrets estão no repositório correto e escritos exatamente como especificado

### Erro: "Workflow file is invalid"

**Solução:** Verifique a sintaxe YAML em https://www.yamllint.com/

### Erro: "Node version mismatch"

**Solução:** Certifique-se de usar Node 18+ localmente e no CI

### Hook não executa

**Solução:**

```bash
chmod +x .husky/pre-commit
git config core.hooksPath .husky
```

---

## ✅ Checklist de Verificação

- [ ] Secrets configurados no GitHub
- [ ] Husky instalado (`pnpm add -D husky`)
- [ ] Hook executando localmente
- [ ] Workflow aparece no GitHub Actions
- [ ] Badge adicionado ao README
- [ ] Teste de PR realizado

---

**Documentação oficial:**

- GitHub Actions: https://docs.github.com/actions
- Husky: https://typicode.github.io/husky/
- lint-staged: https://github.com/okonet/lint-staged
