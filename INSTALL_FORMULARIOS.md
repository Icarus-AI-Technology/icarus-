# 📦 Instalação - Sistema de Formulários

**Versão:** 1.0.0  
**Data:** 29/10/2025

---

## 📋 DEPENDÊNCIAS NECESSÁRIAS

### Verificar Dependências Atuais

```bash
cd /Users/daxmeneghel/icarus-v5.0
cat package.json | grep -E "(react-hook-form|zod|@hookform|@radix-ui/react-select|react-input-mask|sonner)"
```

---

## 🔧 INSTALAÇÃO

### Dependências Core (Se não instaladas)

```bash
# React Hook Form + Resolvers
pnpm add react-hook-form @hookform/resolvers

# Zod (Validation)
pnpm add zod

# Radix UI Select
pnpm add @radix-ui/react-select

# Input Mask
pnpm add react-input-mask
pnpm add -D @types/react-input-mask

# Toast (Sonner)
pnpm add sonner
```

### Dependências Existentes (Já no Projeto)

✅ React 18.3.1  
✅ TypeScript 5.6.2  
✅ Tailwind CSS 3.4.10  
✅ Lucide React 0.436.0  
✅ React Router DOM 6.26.0  

---

## ✅ VERIFICAÇÃO PÓS-INSTALAÇÃO

### 1. Type Check
```bash
pnpm type-check
```

**Esperado:** `0 erros`

### 2. Lint
```bash
pnpm lint
```

**Esperado:** `0 warnings`

### 3. Build
```bash
pnpm build
```

**Esperado:** `Build successful`

### 4. Dev Server
```bash
pnpm dev
```

**Esperado:** Server rodando em `http://localhost:5177`

---

## 🎯 DEPENDÊNCIAS EXATAS

### package.json (Adicionar se necessário)

```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-select": "^2.0.0",
    "react-hook-form": "^7.65.0",
    "react-input-mask": "^3.0.0",
    "sonner": "^1.0.0",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/react-input-mask": "^3.0.5"
  }
}
```

---

## 🚀 QUICK START

### Depois da Instalação

1. **Importar Componentes**
```typescript
import { FormTemplate, FormField, NeuInput } from '@/components/forms';
```

2. **Acessar Formulários**
```
http://localhost:5177/formularios
```

3. **Testar um Formulário**
```
http://localhost:5177/cadastros/medicos/novo
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module 'react-hook-form'"
**Solução:**
```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### Erro: "Cannot find module '@radix-ui/react-select'"
**Solução:**
```bash
pnpm add @radix-ui/react-select
```

### Erro: "Property 'mask' does not exist on type..."
**Solução:**
```bash
pnpm add react-input-mask @types/react-input-mask -D
```

### Erro no Build
**Solução:**
```bash
# Limpar cache
rm -rf node_modules
rm -rf .vite
pnpm install
pnpm build
```

---

## 📞 SUPORTE

### Documentação
- **Completa:** `docs/FORMULARIOS_PADRAO_COMPLETO.md`
- **Guia Rápido:** `docs/GUIA_RAPIDO_FORMULARIOS.md`
- **Índice Visual:** `docs/FORMULARIOS_INDICE_VISUAL.md`

### Verificação de Saúde
```bash
# Verificar todas dependências
pnpm list | grep -E "(react-hook-form|zod|radix|mask)"

# Verificar versões
pnpm list react-hook-form zod
```

---

**Guia de Instalação - Sistema de Formulários**  
**Todas as dependências mapeadas e documentadas** ✅

