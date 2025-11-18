# 🔧 GUIA DE CORREÇÕES TYPESCRIPT - FASE 1

**Sistema**: ICARUS v5.0  
**Data**: 19 de Outubro de 2025  
**Objetivo**: Corrigir 127 erros TypeScript para atingir 100% de conformidade

---

## 📋 CHECKLIST DE CORREÇÕES

### ✅ COMPLETADO
- [x] Identificação de todos os erros TypeScript (127 total)
- [x] Categorização por severidade
- [x] Criação de TODOs para tracking

### 🔄 EM PROGRESSO
- [ ] Correção 1: Tooltip props (App.tsx)
- [ ] Correção 2: Imports duplicados (19 arquivos)
- [ ] Correção 3: Interface Cirurgia
- [ ] Correção 4: Interface Lead
- [ ] Correção 5: OraclusX DS exports
- [ ] Correção 6: Badge/Button variants

---

## 🔴 CORREÇÃO 1: Tooltip Props (App.tsx)

### Problema
```typescript
// ERRO TS2322: Property 'disabled' does not exist on type 'TooltipProps'
<Tooltip content="Home" position="right" disabled={sidebarOpen}>
  {/* ... */}
</Tooltip>
```

### Solução Recomendada

**Opção A**: Remover prop `disabled`
```typescript
// Antes:
<Tooltip content="Home" position="right" disabled={sidebarOpen}>

// Depois:
<Tooltip content="Home" position="right">
```

**Opção B**: Adicionar prop à interface
```typescript
// src/components/oraclusx-ds/Tooltip.tsx
export interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;  // Adicionar esta linha
  children: React.ReactNode;
}
```

### Arquivos Afetados
- `src/App.tsx` - Linhas: 198, 209, 220, 231, 242, 253, 264, 275, 286, 297, 308, 319, 330, 341

### Comando de Correção (Opção A)
```bash
# Remover todas as ocorrências de 'disabled={sidebarOpen}'
sed -i '' 's/ disabled={sidebarOpen}//g' src/App.tsx
```

---

## 🔴 CORREÇÃO 2: Imports Duplicados TrendingUp

### Problema
```typescript
// ERRO TS2300: Duplicate identifier 'TrendingUp'
import { Calendar, TrendingUp, DollarSign, TrendingUp } from "lucide-react";
```

### Solução
```typescript
// Remover segunda ocorrência
import { Calendar, TrendingUp, DollarSign } from "lucide-react";
```

### Arquivos Afetados (19 arquivos)
1. AnunciosPagos.tsx
2. AvaliacaoDesempenho.tsx
3. BeneficiosColaboradores.tsx
4. CampanhasAutomaticas.tsx
5. CapacitacaoIA.tsx
6. CombustivelIA.tsx
7. ConversaoVendas.tsx
8. CotacoesAutomaticas.tsx
9. GestaoRiscos.tsx
10. InventarioInteligente.tsx
11. LicenciamentoVeiculos.tsx
12. ManutencaoPreventiva.tsx
13. MultasInfracoes.tsx
14. PlanosManutencao.tsx
15. RentabilidadeClientes.tsx
16. RotasEntregas.tsx
17. SEOOtimizado.tsx
18. TransportadorasIA.tsx
19. (mais arquivos...)

### Script de Correção Automatizada
```bash
#!/bin/bash
# fix-imports.sh

FILES=(
  "src/components/modules/AnunciosPagos.tsx"
  "src/components/modules/AvaliacaoDesempenho.tsx"
  "src/components/modules/BeneficiosColaboradores.tsx"
  "src/components/modules/CampanhasAutomaticas.tsx"
  "src/components/modules/CapacitacaoIA.tsx"
  "src/components/modules/CombustivelIA.tsx"
  "src/components/modules/ConversaoVendas.tsx"
  "src/components/modules/CotacoesAutomaticas.tsx"
  "src/components/modules/GestaoRiscos.tsx"
  "src/components/modules/InventarioInteligente.tsx"
  "src/components/modules/LicenciamentoVeiculos.tsx"
  "src/components/modules/ManutencaoPreventiva.tsx"
  "src/components/modules/MultasInfracoes.tsx"
  "src/components/modules/PlanosManutencao.tsx"
  "src/components/modules/RentabilidadeClientes.tsx"
  "src/components/modules/RotasEntregas.tsx"
  "src/components/modules/SEOOtimizado.tsx"
  "src/components/modules/TransportadorasIA.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Corrigindo $file..."
    # Remove duplicatas de TrendingUp no import
    sed -i '' 's/, TrendingUp\([^,]*\), TrendingUp/, TrendingUp\1/g' "$file"
  fi
done

echo "✅ Correção de imports concluída!"
```

---

## 🔴 CORREÇÃO 3: Interface Cirurgia

### Problema
```typescript
// ERRO: Property 'tipo_procedimento' does not exist on type 'Cirurgia'
const tipo = cirurgia.tipo_procedimento;  // ❌
const hora = cirurgia.hora_inicio;        // ❌
```

### Solução

**Opção A**: Atualizar código para usar propriedades existentes
```typescript
// src/components/modules/CirurgiasProcedimentos.tsx

// Antes:
const tipo = cirurgia.tipo_procedimento;
const hora = cirurgia.hora_inicio;

// Depois:
const tipo = cirurgia.procedimento;
const hora = new Date(cirurgia.data_cirurgia).toLocaleTimeString();
```

**Opção B**: Atualizar interface Cirurgia
```typescript
// src/hooks/useCirurgias.ts
export interface Cirurgia {
  // ... propriedades existentes
  tipo_procedimento?: string;  // Adicionar
  hora_inicio?: string;        // Adicionar
}
```

### Linhas Afetadas
- 187, 196, 198, 205, 207, 213, 224, 246, 309, 325, 441, 446, 556

---

## 🔴 CORREÇÃO 4: Interface Lead

### Problema
```typescript
// ERRO: Property 'estagio' does not exist on type 'Lead'
const estagio = lead.estagio;  // ❌
```

### Solução

**Opção A**: Usar propriedade existente 'status'
```typescript
// Antes:
const estagio = lead.estagio;
lead.estagio === 'negociacao'

// Depois:
const estagio = lead.status;
lead.status === 'negociacao'
```

**Opção B**: Adicionar 'estagio' à interface
```typescript
// src/hooks/useLeads.ts
export interface Lead {
  // ... propriedades existentes
  estagio?: string;  // Adicionar
}
```

### Linhas Afetadas (CRMVendas.tsx)
- 96, 103, 110, 117, 124, 161, 183, 192, 194, 198, 200

---

## 🔴 CORREÇÃO 5: OraclusX DS Exports

### Problema
```typescript
// ERRO TS2614: Module '"./Form"' has no exported member 'Form'
export { Form, FormLabel, FormControl, FormMessage } from './Form';
```

### Solução

**Verificar arquivo Form.tsx**:
```typescript
// src/components/oraclusx-ds/Form.tsx

// Se os exports não existem, comentar ou remover da index.ts:
// src/components/oraclusx-ds/index.ts

// Antes:
export { Form, FormLabel, FormControl, FormMessage } from './Form';

// Depois (temporário):
// export { Form, FormLabel, FormControl, FormMessage } from './Form';
```

---

## 🔴 CORREÇÃO 6: Badge/Button Variants

### Problema
```typescript
// ERRO TS2322: Type '"secondary"' is not assignable to type variants
<Badge variant="secondary" />  // ❌
<Button variant="ghost" />     // ❌
```

### Solução

**Opção A**: Usar variants existentes
```typescript
// Antes:
<Badge variant="secondary" />
<Button variant="ghost" />

// Depois:
<Badge variant="default" />
<Button variant="primary" />
```

**Opção B**: Adicionar variants às interfaces
```typescript
// src/components/oraclusx-ds/Badge.tsx
export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "secondary";

// src/components/oraclusx-ds/Button.tsx
export type ButtonVariant = "default" | "primary" | "success" | "warning" | "error" | "ghost";
```

### Arquivos Afetados
- `src/components/modules/ComprasFornecedores.tsx` - Linhas 318, 370
- `src/components/oraclusx-ds/Drawer.tsx` - Linha 127
- `src/components/oraclusx-ds/Modal.tsx` - Linha 119

---

## 🚀 SCRIPT COMPLETO DE CORREÇÕES

```bash
#!/bin/bash
# fix-all-ts-errors.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 CORRIGINDO TODOS OS ERROS TYPESCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Remover 'disabled' de Tooltips
echo "1️⃣  Corrigindo Tooltips em App.tsx..."
sed -i '' 's/ disabled={sidebarOpen}//g' src/App.tsx
echo "✅ App.tsx corrigido"
echo ""

# 2. Corrigir imports duplicados
echo "2️⃣  Corrigindo imports duplicados TrendingUp..."
find src/components/modules -name "*.tsx" -type f -exec grep -l "TrendingUp.*TrendingUp" {} \; | while read file; do
  echo "   Corrigindo $file..."
  sed -i '' 's/, TrendingUp\([^,]*\), TrendingUp/, TrendingUp\1/g' "$file"
done
echo "✅ Imports corrigidos"
echo ""

# 3. Corrigir variant 'secondary' para 'default'
echo "3️⃣  Corrigindo Badge variants..."
sed -i '' 's/variant="secondary"/variant="default"/g' src/components/modules/ComprasFornecedores.tsx
echo "✅ Badge variants corrigidos"
echo ""

# 4. Corrigir variant 'ghost' para 'primary'
echo "4️⃣  Corrigindo Button variants..."
sed -i '' 's/variant="ghost"/variant="primary"/g' src/components/oraclusx-ds/Drawer.tsx
sed -i '' 's/variant="ghost"/variant="primary"/g' src/components/oraclusx-ds/Modal.tsx
echo "✅ Button variants corrigidos"
echo ""

# 5. Verificar resultado
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CORREÇÕES APLICADAS!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Executando type-check para verificar..."
npm run type-check 2>&1 | grep -E "error TS|Found [0-9]+ error" | head -5
echo ""
echo "📋 Próximo passo: Revisar erros de interface (Cirurgia/Lead)"
```

---

## 📊 PROGRESSO ESPERADO

### Antes das Correções
- Erros TypeScript: 127
- Conformidade: 82%

### Após Correção Rápida (Script Automatizado)
- Erros TypeScript: ~70-80 (redução de 40%)
- Conformidade: ~90%

### Após Todas as Correções Manuais
- Erros TypeScript: 0
- Conformidade: 100%

---

## ⏱️ TEMPO ESTIMADO

| Correção | Método | Tempo |
|----------|--------|-------|
| 1-2-6 | Script automatizado | 5 min |
| 3-4 | Manual (interfaces) | 45 min |
| 5 | Manual (exports) | 15 min |
| Verificação | Type-check + Build | 10 min |
| **TOTAL** | - | **1h 15min** |

---

## 🎯 PRÓXIMA AÇÃO RECOMENDADA

```bash
# 1. Executar script de correções automáticas
chmod +x fix-all-ts-errors.sh
./fix-all-ts-errors.sh

# 2. Verificar resultado
npm run type-check

# 3. Corrigir interfaces manualmente (Cirurgia/Lead)
# Editar: src/hooks/useCirurgias.ts
# Editar: src/hooks/useLeads.ts

# 4. Build final
npm run build

# 5. Testes E2E
npm run test:e2e
```

---

**Documento gerado automaticamente**  
**ICARUS v5.0 - Guia de Correções TypeScript**  
**19 de Outubro de 2025 - 01:45**

