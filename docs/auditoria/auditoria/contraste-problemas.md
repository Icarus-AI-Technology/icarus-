# Relatório de Problemas de Contraste - ICARUS v5.0

**Data:** $(date)  
**Prioridade:** CRÍTICA  
**Impacto:** Texto invisível em modo claro, violação WCAG AA

## Problemas Identificados

### Arquivos com `text-white` ou cores fixas problemáticas

1. **src/components/oraclusx-ds/ChatbotWithResearch.tsx**
   - Linha 471: `text-white` em ícone Bot (background colorido - OK)
   - Linha 522: `text-white` em mensagens do usuário (background colorido - OK, mas precisa dark mode)
   - Linha 554: `text-[rgba(255,255,255,0.8)]` em timestamp (precisa ajuste)
   - Linha 630: `text-white` quando isListening (background vermelho - OK)
   - Linha 654: `text-white` em botão enviar (background colorido - OK)
   - Linha 694: `text-white` em FAB button (background colorido - OK)
   - Linha 705: `text-white` em badge (background vermelho - OK)

2. **src/components/shared/AITutor.tsx**
   - Linha 135: `text-white` em ícone (background gradient - OK)
   - Linha 137: `text-white` em badge (background vermelho - OK)
   - Linha 157: `text-white` em ícone (background gradient - OK)
   - Linha 160: `dark:text-white` - CORRETO (usa dark:)
   - Linha 225: `dark:text-white` - CORRETO (usa dark:)

3. **src/components/oraclusx-ds/NavigationBar.tsx**
   - Linha 57: `text-white` em botão primary (background colorido - OK)

4. **src/App.tsx**
   - Linha 58: `text-white` em BrandIdentity (background gradient - OK)
   - Linha 71: `text-white` em título (background gradient - OK)

5. **src/components/layout/IcarusSidebar.tsx**
   - Linha 820: `text-white` em badge (background vermelho - OK)

### Problemas Reais (texto invisível em modo claro)

**CRÍTICO:** Mensagens do usuário no ChatbotWithResearch usam `text-white` mas o background é colorido - OK em teoria, mas precisa garantir contraste adequado e suporte a dark mode.

**MÉDIO:** Timestamps com `text-[rgba(255,255,255,0.8)]` em mensagens de usuário podem ter baixo contraste.

### Estratégia de Correção

1. **Backgrounds coloridos com texto branco:** MANTER `text-white` mas garantir dark mode support
2. **Textos em backgrounds claros:** Substituir por `text-[color:hsl(var(--orx-text-primary))]`
3. **Textos com opacidade:** Ajustar para usar tokens semânticos
4. **Adicionar dark: variants** onde necessário

## Próximos Passos

1. Corrigir ChatbotWithResearch.tsx
2. Corrigir AITutor.tsx (verificar se precisa ajustes)
3. Auditar formulários
4. Executar qa:a11y para validar

