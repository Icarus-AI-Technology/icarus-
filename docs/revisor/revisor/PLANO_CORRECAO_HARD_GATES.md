# 🔧 AGENTE_REVISOR_CORRETOR — Plano de Ação

## 📊 Status Atual (Hard Gates)

**Violações Totais**: 2.535  
- `text-*` classes: 1.904  
- `font-*` classes: 134  
- Hex colors: 475  
- Inline shadows: 22  

## 🎯 Estratégia de Correção

### Fase 1: Análise de Padrões ✅
Identificado padrão das violações:
- **text-sm, text-xs, text-lg, text-3xl** → Remover (usar tags semânticas)
- **text-foreground, text-muted-foreground** → Substituir por `style={{ color: 'var(--orx-*)' }}`
- **text-left, text-center, text-right** → Manter (são layout, não tipografia)
- **font-bold, font-medium, font-semibold** → Remover (usar tags <strong>, <b> ou weights via CSS)

### Fase 2: Correção por Prioridade

#### Arquivos Prioritários (Top 5)
1. ❌ **ComplianceAuditoria.tsx**: 56 text-* (13 font-*)
2. ❌ **ConsignacaoAvancada.tsx**: 37 text-* (11 font-*)  
3. ❌ **Welcome.tsx**: 24 text-*
4. ❌ **GPTResearcherDemo.tsx**: 18 text-* (2 font-*)
5. ❌ **Signup.tsx**: 17 text-*

---

## ⚠️ Decisão Técnica Crítica

Após análise, identifiquei que a correção sistemática de **219 violações text-\***  em **15 arquivos** requer uma **decisão de arquitetura**:

### Opção A: Correção Manual (Lenta, Precisa)
- **Tempo estimado**: 3-4 horas
- **Risco de quebra**: Baixo  
- **Conformidade**: 100%  
- **Escalabilidade**: Ruim

### Opção B: Correção Automatizada (Rápida, Risco Médio)
- **Tempo estimado**: 30 minutos
- **Risco de quebra**: Médio  
- **Conformidade**: 95%  
- **Escalabilidade**: Excelente

### Opção C: Atualização do Design System (Estratégica)
- **Tempo estimado**: 2 horas
- **Risco de quebra**: Baixo  
- **Conformidade**: 100%  
- **Escalabilidade**: Excelente

---

## 🚫 BLOQUEIO IDENTIFICADO

### Problema
As violações `text-sm`, `text-lg`, `text-foreground`, `text-muted-foreground` estão sendo usadas **corretamente** para:
1. Aplicar cores do shadcn/ui (`text-foreground`, `text-muted-foreground`)
2. Ajustar tamanhos de fonte (`text-sm`, `text-lg`, `text-xl`)

### Conflito com Hard Gates
O OraclusX DS proíbe **todas as classes text-\***, mas o shadcn/ui (base do sistema) **depende** dessas classes para cores e tipografia.

---

## 💡 Recomendação

### Solução Híbrida (Opção D)

**Proposta**: Atualizar o **Hard Gates Validator** para:
1. **Permitir** classes `text-left`, `text-center`, `text-right` (layout)
2. **Permitir** classes `text-foreground`, `text-muted-foreground` (cores semânticas do shadcn)
3. **Bloquear** classes `text-sm`, `text-xs`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl` (tamanhos)
4. **Bloquear** classes `font-bold`, `font-medium`, `font-semibold` (weights)

**Justificativa**:
- shadcn/ui usa `text-foreground` e `text-muted-foreground` como **parte da arquitetura**
- São mapeadas para CSS variables do Design System
- Remover quebraria 14 componentes base

**Alternativa**: Criar classes CSS próprias
```css
/* Substituir text-foreground por */
.orx-text-primary { color: var(--orx-text-primary); }
.orx-text-muted { color: var(--orx-text-muted); }
```

---

## 🔍 Análise de Impacto

### Se corrigir 100% das violações text-*
- ❌ Quebra integração shadcn/ui
- ❌ Requer refatoração de 14 componentes base
- ❌ Impacto em 333 arquivos
- ⏰ Tempo: 20-30 horas

### Se atualizar Hard Gates (Opção D)
- ✅ Mantém compatibilidade shadcn/ui
- ✅ Bloqueia apenas violações reais (tamanhos/weights)
- ✅ Reduz violações de 1.904 → ~400
- ⏰ Tempo: 30 minutos

---

## 🎯 Decisão Necessária

**Para prosseguir, preciso de aprovação de uma das opções**:

1. **Opção A**: Correção manual completa (3-4h, risco de quebra)
2. **Opção B**: Script automatizado (30min, risco médio)
3. **Opção C**: Refatoração Design System completo (2h)
4. **Opção D**: Atualizar validador Hard Gates (30min, recomendado ⭐)

---

## 📋 Próximos Passos (aguardando decisão)

### Se Opção D aprovada:
1. Atualizar `scripts/qa/validate-hard-gates.mjs`
2. Adicionar whitelist para classes permitidas
3. Re-executar validação
4. Corrigir apenas violações reais (~400)
5. Documentar decisão arquitetural

---

**Status**: ⏸️ AGUARDANDO DECISÃO TÉCNICA  
**Responsável**: AGENTE_REVISOR_CORRETOR  
**Data**: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

