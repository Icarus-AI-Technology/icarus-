# 🤖 AIAssistantNotification - Guia de Integração

**Componente Integrado:** Notificações IA + FAB (Floating Action Button)  
**Design System:** OraclusX v5.0  
**Neumorphism:** 3D Premium com gradientes e sombras avançadas

---

## 📋 Visão Geral

O `AIAssistantNotification` é um componente **all-in-one** que substitui e integra:

- ✅ Card de notificação IA com sugestões
- ✅ Botão flutuante (FAB) para chatbot
- ✅ Badge de contador de notificações
- ✅ Sistema de feedback (thumbs up/down)
- ✅ Ações personalizadas por notificação
- ✅ Animações e transições suaves
- ✅ Dark mode nativo
- ✅ Responsivo (mobile-first)

**Antes:** 2 componentes duplicados (card + FAB)  
**Depois:** 1 componente integrado e inteligente

---

## 🎯 Problema Resolvido

### Situação Anterior (Duplicidade)

```tsx
{/* Card de notificação */}
<div className="orx-card bg-gradient-to-br from-indigo-50...">
  <div>Assistente IA</div>
  <div>1 sugestão • Dashboard</div>
  <p>Materiais críticos com estoque baixo...</p>
  <button>Abrir estoque</button>
</div>

{/* FAB separado */}
<button className="w-16 h-16 rounded-full bg-gradient-to-br...">
  <MessageCircle />
</button>
```

**Problemas:**
- ❌ Duplicidade de código
- ❌ Difícil manter consistência
- ❌ Sem comunicação entre componentes
- ❌ Badge de contador separado

---

### Solução Atual (Integrada)

```tsx
import { AIAssistantNotification } from "@/components/oraclusx-ds";

<AIAssistantNotification
  notifications={[
    {
      id: "1",
      title: "Assistente IA",
      suggestionCount: 1,
      source: "Dashboard",
      severity: "critical",
      message: "Estoque crítico identificado em 3 materiais...",
      confidence: 92,
      actionLabel: "Abrir estoque",
      actionUrl: "/estoque",
      onFeedback: (positive) => handleFeedback(positive),
    }
  ]}
  position="bottom-right"
  enableFAB={true}
  onOpenChat={() => openChatbot()}
/>
```

**Vantagens:**
- ✅ Componente único
- ✅ Integração automática FAB + notificações
- ✅ Badge contador sincronizado
- ✅ API declarativa e simples

---

## 🚀 Uso Básico

### 1. Importação

```tsx
import { 
  AIAssistantNotification,
  type AINotification 
} from "@/components/oraclusx-ds";
```

---

### 2. Exemplo Simples

```tsx
function MyApp() {
  const notifications: AINotification[] = [
    {
      id: "notif-1",
      title: "Alerta de Estoque",
      severity: "warning",
      message: "5 materiais abaixo do estoque mínimo",
      confidence: 88,
      actionLabel: "Ver materiais",
      onAction: () => router.push("/estoque"),
    }
  ];

  return (
    <AIAssistantNotification
      notifications={notifications}
      position="bottom-right"
      enableFAB={true}
      onOpenChat={() => setShowChatbot(true)}
    />
  );
}
```

---

### 3. Múltiplas Notificações

```tsx
const notifications: AINotification[] = [
  {
    id: "1",
    title: "Estoque Crítico",
    severity: "critical",
    message: "3 materiais com estoque zero",
    confidence: 95,
    actionLabel: "Repor agora",
    actionUrl: "/estoque/reposicao",
  },
  {
    id: "2",
    title: "Otimização de Rota",
    severity: "info",
    message: "Economia de R$ 540 detectada",
    confidence: 87,
    actionLabel: "Ver rota",
  },
  {
    id: "3",
    title: "Compliance",
    severity: "warning",
    message: "Documento expirando em 5 dias",
    actionLabel: "Renovar",
  },
];

<AIAssistantNotification
  notifications={notifications}
  maxVisible={3}
  position="bottom-right"
/>
```

---

## 🎨 Personalização

### Severidades (Cores)

```tsx
severity: "info"     // Indigo/Purple (padrão)
severity: "warning"  // Amber/Orange
severity: "critical" // Red/Rose
severity: "success"  // Emerald/Green
```

Cada severidade tem:
- Gradiente de fundo personalizado
- Borda colorida
- Badge com cor semântica
- Dark mode automático

---

### Posições

```tsx
position="bottom-right" // Padrão (recomendado)
position="bottom-left"
position="top-right"
position="top-left"
```

---

### Configuração do FAB

```tsx
// Habilitar/desabilitar FAB
enableFAB={true}

// Customizar label
fabLabel="Conversar com IA"

// Handler de clique
onOpenChat={() => {
  setShowChat(true);
  trackEvent("chatbot_opened");
}}
```

---

### Limitar Notificações Visíveis

```tsx
// Mostrar apenas as 2 mais recentes
<AIAssistantNotification
  notifications={allNotifications}
  maxVisible={2}
/>
```

---

## 🔧 API Completa

### Props do Componente

```tsx
interface AIAssistantNotificationProps {
  /** Array de notificações a exibir */
  notifications: AINotification[];
  
  /** Posição na tela */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  
  /** Máximo de notificações visíveis */
  maxVisible?: number;
  
  /** Habilitar FAB (botão flutuante) */
  enableFAB?: boolean;
  
  /** Label de acessibilidade do FAB */
  fabLabel?: string;
  
  /** Handler ao clicar no FAB */
  onOpenChat?: () => void;
  
  /** Classes CSS adicionais */
  className?: string;
}
```

---

### Interface AINotification

```tsx
interface AINotification {
  /** ID único da notificação */
  id: string;
  
  /** Título principal */
  title: string;
  
  /** Contador de sugestões (badge) */
  suggestionCount?: number;
  
  /** Origem da notificação */
  source?: string;
  
  /** Tipo/severidade (define cores) */
  severity: "info" | "warning" | "critical" | "success";
  
  /** Mensagem descritiva */
  message: string;
  
  /** Confiança da IA (0-100%) */
  confidence?: number;
  
  /** Label do botão de ação */
  actionLabel?: string;
  
  /** URL de destino (navegação) */
  actionUrl?: string;
  
  /** Handler customizado de ação */
  onAction?: () => void;
  
  /** Handler ao fechar notificação */
  onDismiss?: () => void;
  
  /** Handler de feedback (thumbs up/down) */
  onFeedback?: (positive: boolean) => void;
}
```

---

## 💡 Casos de Uso

### 1. Alertas de Estoque

```tsx
{
  id: "stock-001",
  title: "Alerta de Estoque",
  severity: "critical",
  message: "Material #4521 com estoque zero. Impacto em 3 cirurgias programadas.",
  confidence: 94,
  actionLabel: "Repor material",
  actionUrl: "/estoque/reposicao?material=4521",
  onFeedback: (positive) => logFeedback("stock-alert", positive),
}
```

---

### 2. Otimização de Processos

```tsx
{
  id: "opt-001",
  title: "IA Otimizadora",
  severity: "info",
  source: "Logística",
  message: "Rota otimizada detectada. Economia estimada: R$ 840,00",
  confidence: 91,
  actionLabel: "Aplicar otimização",
  onAction: async () => {
    await applyRouteOptimization();
    showToast("Rota otimizada aplicada!");
  },
}
```

---

### 3. Compliance e Auditoria

```tsx
{
  id: "comp-001",
  title: "Compliance",
  severity: "warning",
  source: "Auditoria",
  message: "Certificado ANVISA #7821 expira em 7 dias. Renove para evitar bloqueios.",
  actionLabel: "Iniciar renovação",
  actionUrl: "/compliance/renovacao/7821",
}
```

---

### 4. Sucesso de Operação

```tsx
{
  id: "success-001",
  title: "Processo Concluído",
  severity: "success",
  message: "Importação de 2.847 materiais realizada com sucesso.",
  confidence: 100,
  actionLabel: "Ver relatório",
}
```

---

## 🎭 Comportamentos

### Expansão de Notificação

- Clique no ícone de seta (↓/↑) para expandir/recolher
- Expandida: mostra confiança, botão de ação e feedback
- Recolhida: mostra apenas título e mensagem (limitada a 2 linhas)

---

### Feedback de IA

```tsx
onFeedback: (positive: boolean) => {
  // Enviar para analytics
  trackEvent("ai_feedback", {
    notification_id: "stock-001",
    positive,
    timestamp: Date.now(),
  });
  
  // Atualizar modelo IA
  updateAIModel("stock-alerts", { feedback: positive });
}
```

---

### Dismissal (Fechar)

```tsx
onDismiss: () => {
  // Marcar como lida no backend
  markNotificationAsRead(notification.id);
  
  // Remover da lista local
  setNotifications(prev => 
    prev.filter(n => n.id !== notification.id)
  );
}
```

---

### Ações Customizadas

```tsx
// Navegação
actionUrl: "/path/to/page"

// OU Handler customizado
onAction: async () => {
  setLoading(true);
  try {
    await performAction();
    showToast("Ação executada!");
  } catch (error) {
    showToast("Erro ao executar", "error");
  } finally {
    setLoading(false);
  }
}
```

---

## 🎨 Estilo Neumórfico

### Gradientes por Severidade

```css
/* Info (Indigo/Purple) */
background: linear-gradient(to-br, 
  from-indigo-50 to-purple-50
  dark:from-indigo-950 dark:to-purple-950
)

/* Warning (Amber/Orange) */
background: linear-gradient(to-br,
  from-amber-50 to-orange-50
  dark:from-amber-950 dark:to-orange-950
)

/* Critical (Red/Rose) */
background: linear-gradient(to-br,
  from-red-50 to-rose-50
  dark:from-red-950 dark:to-rose-950
)

/* Success (Emerald/Green) */
background: linear-gradient(to-br,
  from-emerald-50 to-green-50
  dark:from-emerald-950 dark:to-green-950
)
```

---

### Sombras Neumórficas

```css
/* FAB (Botão Flutuante) */
shadow: 8px 8px 16px rgba(94,53,177,0.4),
        -4px -4px 12px rgba(255,255,255,0.3)

/* Hover */
shadow: 12px 12px 24px rgba(94,53,177,0.5),
        -6px -6px 16px rgba(255,255,255,0.4)

/* Dark Mode */
shadow: 8px 8px 16px rgba(94,53,177,0.6),
        -4px -4px 12px rgba(255,255,255,0.1)
```

---

### Animações

```css
/* Entrada */
animate-in slide-in-from-right-5 fade-in duration-500

/* Delay sequencial */
animation-delay: ${index * 100}ms

/* Expansão */
animate-in slide-in-from-top-2 fade-in duration-300

/* FAB Scale */
hover:scale-110
active:scale-95
```

---

## ♿ Acessibilidade

### ARIA Labels

```tsx
aria-label="Abrir Chatbot"           // FAB
aria-label="Expandir"                 // Botão expandir
aria-label="Fechar"                   // Botão fechar
aria-label="Útil"                     // Feedback positivo
aria-label="Não útil"                 // Feedback negativo
```

---

### Navegação por Teclado

- ✅ Todos os botões acessíveis via Tab
- ✅ Enter/Space para ativar
- ✅ Esc para fechar (via onDismiss)
- ✅ Focus visible com outline

---

### Contraste WCAG AA

- ✅ Texto em cores de alta legibilidade
- ✅ Badges com contraste mínimo 4.5:1
- ✅ Ícones com tamanho >= 20px
- ✅ Dark mode com cores ajustadas

---

## 🧪 Testes Recomendados

### Vitest (Unitários)

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { AIAssistantNotification } from "@/components/oraclusx-ds";

test("renderiza notificação corretamente", () => {
  const notifications = [{
    id: "1",
    title: "Teste",
    severity: "info",
    message: "Mensagem de teste",
  }];
  
  render(<AIAssistantNotification notifications={notifications} />);
  expect(screen.getByText("Teste")).toBeInTheDocument();
});

test("chama onOpenChat ao clicar no FAB", () => {
  const handleOpen = vi.fn();
  render(
    <AIAssistantNotification 
      notifications={[]} 
      onOpenChat={handleOpen} 
    />
  );
  
  fireEvent.click(screen.getByLabelText("Abrir Chatbot"));
  expect(handleOpen).toHaveBeenCalled();
});
```

---

### Playwright (E2E)

```tsx
test("notificação expande ao clicar", async ({ page }) => {
  await page.goto("/dashboard");
  
  // Verificar notificação visível
  await expect(page.getByText("Assistente IA")).toBeVisible();
  
  // Expandir
  await page.getByLabel("Expandir").click();
  
  // Verificar conteúdo expandido
  await expect(page.getByText("Confiança: 92%")).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir estoque" })).toBeVisible();
});
```

---

## 📦 Integração com Backend

### Exemplo com Supabase Realtime

```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AIAssistantNotification, type AINotification } from "@/components/oraclusx-ds";

function App() {
  const [notifications, setNotifications] = useState<AINotification[]>([]);

  useEffect(() => {
    // Inscrever em notificações realtime
    const channel = supabase
      .channel("ai-notifications")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "ai_notifications" },
        (payload) => {
          const newNotif: AINotification = {
            id: payload.new.id,
            title: payload.new.title,
            severity: payload.new.severity,
            message: payload.new.message,
            confidence: payload.new.confidence,
            actionUrl: payload.new.action_url,
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AIAssistantNotification
      notifications={notifications}
      position="bottom-right"
      onOpenChat={() => setShowChat(true)}
    />
  );
}
```

---

## 🚀 Deploy e Performance

### Code Splitting

```tsx
// Lazy load do componente
const AIAssistantNotification = lazy(() => 
  import("@/components/oraclusx-ds").then(mod => ({
    default: mod.AIAssistantNotification
  }))
);

<Suspense fallback={<div>Carregando...</div>}>
  <AIAssistantNotification ... />
</Suspense>
```

---

### Memoização

```tsx
const memoizedNotifications = useMemo(() => 
  notifications.slice(0, 3),
  [notifications]
);

<AIAssistantNotification notifications={memoizedNotifications} />
```

---

## 📚 Storybook

Todas as variações estão documentadas no Storybook:

```bash
pnpm storybook
```

Navegue até: **OraclusX DS > AIAssistantNotification**

**Stories disponíveis:**
- Default (múltiplas notificações)
- SingleCritical (notificação única crítica)
- WithoutFAB (sem botão flutuante)
- TopLeft (posição top-left)
- SuccessNotification (sucesso)
- FABOnly (apenas FAB, sem notificações)
- DarkMode (modo escuro)
- LimitedVisible (limite de 2 visíveis)

---

## ✅ Checklist de Integração

- [ ] Importar componente do `@/components/oraclusx-ds`
- [ ] Criar array de `AINotification[]`
- [ ] Configurar `position` conforme layout
- [ ] Implementar `onOpenChat` se usar FAB
- [ ] Implementar `onFeedback` para analytics
- [ ] Configurar `actionUrl` ou `onAction`
- [ ] Testar dark mode
- [ ] Validar acessibilidade (navegação por teclado)
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Configurar backend realtime (opcional)
- [ ] Executar `pnpm qa:ui` e `pnpm qa:a11y`

---

**Criado para:** ICARUS v5.0  
**Design System:** OraclusX v5.0  
**Autor:** Agente Webdesign Expert (Neumorphism 3D)  
**Data:** 30 de outubro de 2025

