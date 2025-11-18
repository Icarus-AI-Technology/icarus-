# 🤖 Guia - ChatbotFAB Integrated

**Versão:** 2.0.0  
**Data:** 29/10/2025  
**Status:** ✅ Implementado

---

## 🎯 OBJETIVO

Integrar todas as funcionalidades do card "Assistente IA" no botão FAB do chatbot, criando uma experiência unificada e menos intrusiva.

---

## 📦 O QUE FOI FEITO

### ✅ Criado: ChatbotFABIntegrated

**Arquivo:** `src/components/oraclusx-ds/ChatbotFABIntegrated.tsx`

### Funcionalidades Integradas

1. **Badge Dinâmico**
   - Mostra número de sugestões críticas + altas
   - Animação pulse quando há alertas
   - Badge vermelho (#EF4444)

2. **Painel de Sugestões**
   - Abre ao clicar no FAB (se houver sugestões)
   - Neumórfico com sombras duplas
   - Animação slide-in suave
   - Scrollable até 500px

3. **Tooltip "Em que posso ajudar?"**
   - Aparece quando há sugestões
   - Posicionado acima do FAB
   - Glass morphism effect

4. **Lista de Sugestões**
   - Ícones por tipo (Lightbulb, AlertTriangle, Zap, etc)
   - Cores por prioridade (Critical=Red, High=Orange, etc)
   - Título + Descrição
   - Confiança da IA (%)
   - Botões de feedback (👍 👎)
   - Botão de ação customizado
   - Botão dismiss (X)

5. **Header do Painel**
   - Ícone Sparkles
   - "Assistente IA" + badge
   - Contador de sugestões
   - Nome do módulo
   - Botão refresh
   - Botão fechar
   - Expandir/Colapsar

---

## 🎨 DESIGN NEUMÓRFICO

### FAB Button
```css
Tamanho: 64px × 64px (w-16 h-16)
Gradiente: Purple 500 → Purple 600
Sombras: Duplas neumórficas (8px + 12px hover)
Hover: Scale 105% + translate-y -2px
Badge: Red 500, pulse animation
```

### Painel de Sugestões
```css
Largura: 384px (w-96)
Max Height: 500px
Background: Gradiente white → gray-50
Sombras: 8px duplas neumórficas
Border: 1px gray-100
Animation: slide-in-from-bottom + fade-in
```

### Tooltip
```css
Background: white/90 + backdrop-blur
Sombras: 5px neumórficas
Border: white/30
Animation: fade-in
```

---

## 💻 COMO USAR

### Básico
```typescript
import { ChatbotFABIntegrated } from '@/components/oraclusx-ds';

<ChatbotFABIntegrated
  module="Dashboard"
  suggestions={suggestions}
  onChatOpen={() => console.log('Chat aberto')}
/>
```

### Completo
```typescript
import { ChatbotFABIntegrated, AISuggestion } from '@/components/oraclusx-ds';
import { useNavigate } from 'react-router-dom';

const suggestions: AISuggestion[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Materiais críticos com estoque baixo',
    description: 'Estoque crítico em 3 materiais de alta prioridade.',
    confidence: 92,
    priority: 'critical',
    action: {
      label: 'Abrir estoque crítico',
      handler: () => navigate('/estoque?filtro=critico')
    },
    dismissible: true
  }
];

<ChatbotFABIntegrated
  module="Dashboard"
  suggestions={suggestions}
  onChatOpen={() => {/* Abrir modal de chat */}}
  onAction={(action, suggestion) => {/* Log action */}}
  onFeedback={(id, feedback) => {/* Send to analytics */}}
  onRefresh={async () => {/* Reload suggestions */}}
  position="bottom-right"
/>
```

---

## 🔧 PROPS

### ChatbotFABIntegratedProps

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `module` | `string` | Não | Nome do módulo atual (default: 'Dashboard') |
| `suggestions` | `AISuggestion[]` | Não | Array de sugestões (default: []) |
| `onChatOpen` | `() => void` | Não | Callback quando chat é aberto |
| `onAction` | `(action, suggestion) => void` | Não | Callback quando ação executada |
| `onFeedback` | `(id, feedback) => void` | Não | Callback de feedback |
| `onRefresh` | `() => Promise<void>` | Não | Callback para atualizar sugestões |
| `position` | `'bottom-right' \| 'bottom-left'` | Não | Posição do FAB (default: 'bottom-right') |
| `className` | `string` | Não | Classes adicionais |

### AISuggestion

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | Sim | ID único da sugestão |
| `type` | `'tip' \| 'warning' \| 'action' \| 'insight' \| 'optimization'` | Sim | Tipo |
| `title` | `string` | Sim | Título da sugestão |
| `description` | `string` | Sim | Descrição detalhada |
| `confidence` | `number` | Sim | Confiança 0-100 |
| `priority` | `'low' \| 'medium' \| 'high' \| 'critical'` | Sim | Prioridade |
| `action` | `{ label: string, handler: () => void }` | Não | Ação executável |
| `dismissible` | `boolean` | Não | Se pode ser descartada (default: true) |

---

## 🎯 COMPORTAMENTO

### Sem Sugestões
- FAB normal (sem badge)
- Ao clicar → executa `onChatOpen()` (abre chat)
- Sem tooltip
- Sem painel

### Com Sugestões
- FAB com badge (count de critical + high)
- Tooltip "Em que posso ajudar?"
- Ao clicar → abre painel de sugestões
- Badge com pulse animation

### Painel Aberto
- Header clicável (expand/collapse)
- Lista de sugestões scrollable
- Cada sugestão:
  - Ícone colorido
  - Título + Descrição
  - Confiança %
  - Feedback (👍 👎)
  - Botão de ação (opcional)
  - Botão dismiss (X)

---

## 🎨 CUSTOMIZAÇÃO

### Alterar Posição
```typescript
<ChatbotFABIntegrated position="bottom-left" />
```

### Alterar Cores (via CSS variables)
```css
--primary: #5E35B1;           /* Cor do FAB */
--orx-error: #EF4444;         /* Cor do badge */
--orx-success: #10B981;       /* Cor de feedback positivo */
```

### Classes Adicionais
```typescript
<ChatbotFABIntegrated className="custom-class" />
```

---

## 🔗 INTEGRAÇÃO COM AIOrchestrator

### No App.tsx (Global)
```typescript
const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
const [currentModule, setCurrentModule] = useState('Dashboard');

// Carregar sugestões quando módulo mudar
useEffect(() => {
  const loadSuggestions = async () => {
    const suggestions = await AIOrchestrator.getContextualSuggestions(currentModule);
    setAiSuggestions(suggestions);
  };
  loadSuggestions();
}, [currentModule]);

// Renderizar FAB
<ChatbotFABIntegrated
  module={currentModule}
  suggestions={aiSuggestions}
  onRefresh={async () => {
    const suggestions = await AIOrchestrator.getContextualSuggestions(currentModule);
    setAiSuggestions(suggestions);
  }}
/>
```

---

## 🆚 ANTES vs DEPOIS

### Antes (Card Separado)
```
┌─────────────────────────────┐
│ 🤖 Assistente IA       [1]  │
├─────────────────────────────┤
│ ⚠️ Materiais críticos       │
│ Estoque crítico em 3...     │
│ Confiança: 92% 👍 👎       │
│ [Abrir estoque crítico]     │
└─────────────────────────────┘

              +

┌─────┐
│ 💬  │ ← FAB Chatbot (separado)
│  3  │
└─────┘
```

### Depois (Integrado)
```
┌─────┐
│ 💬  │ ← FAB único
│  3  │   Clique para ver sugestões
└─────┘   OU abrir chat (se sem sugestões)
  ↑
  Ao clicar (com sugestões):
  
┌──────────────────────────────────┐
│ 🤖 Assistente IA          [X] [↓]│
│ 1 sugestão • Dashboard            │
├──────────────────────────────────┤
│ ⚠️ Materiais críticos            │
│ Estoque crítico em 3...          │
│ Confiança: 92% 👍 👎             │
│        [Abrir estoque crítico]   │
└──────────────────────────────────┘
```

---

## ✅ BENEFÍCIOS

1. **UX Melhorada**
   - Menos elementos na tela
   - Experiência unificada
   - Menos distrações

2. **Mais Contextual**
   - Badge mostra urgência
   - Tooltip chama atenção
   - Sugestões quando relevantes

3. **Mais Acessível**
   - Um único FAB para focar
   - Keyboard accessible
   - Screen reader friendly

4. **Mais Eficiente**
   - Código consolidado
   - Menos re-renders
   - Melhor performance

---

## 🚀 PRÓXIMOS PASSOS

### Melhorias Futuras
- [ ] Adicionar sons de notificação
- [ ] Animação de entrada mais elaborada
- [ ] Sugestões agrupadas por prioridade
- [ ] Histórico de sugestões descartadas
- [ ] Atalhos de teclado (Ctrl+K para abrir)
- [ ] Modo compacto (apenas badge)

---

**Guia ChatbotFAB Integrated - ICARUS v5.0**  
**Assistente IA Integrado com Sucesso** ✅

