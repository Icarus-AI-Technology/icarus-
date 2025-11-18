/**
 * Storybook: AIAssistantNotification
 * Demonstração do componente integrado de notificações IA + FAB
 */

import type { Meta, StoryObj } from "@storybook/react";
import { AIAssistantNotification } from "./AIAssistantNotification";

const meta: Meta<typeof AIAssistantNotification> = {
  title: "OraclusX DS/AIAssistantNotification",
  component: AIAssistantNotification,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AIAssistantNotification>;

// Mock notifications
const sampleNotifications = [
  {
    id: "1",
    title: "Assistente IA",
    suggestionCount: 1,
    source: "Dashboard",
    severity: "critical" as const,
    message: "Estoque crítico identificado em 3 materiais de alta prioridade. Execute reposição imediata.",
    confidence: 92,
    actionLabel: "Abrir estoque",
    actionUrl: "/estoque",
    onFeedback: (positive: boolean) => console.log("Feedback:", positive ? "Positivo" : "Negativo"),
  },
  {
    id: "2",
    title: "Otimização de Rota",
    suggestionCount: 2,
    source: "Logística",
    severity: "warning" as const,
    message: "Detectada rota subótima para entrega #4721. Economia estimada: R$ 340,00",
    confidence: 87,
    actionLabel: "Ver otimização",
    onAction: () => console.log("Abrindo otimização de rota"),
  },
  {
    id: "3",
    title: "Compliance",
    source: "Auditoria",
    severity: "info" as const,
    message: "Novo relatório trimestral disponível. Confira as métricas de conformidade.",
    actionLabel: "Visualizar relatório",
  },
];

/**
 * Estado padrão com múltiplas notificações
 */
export const Default: Story = {
  args: {
    notifications: sampleNotifications,
    position: "bottom-right",
    maxVisible: 3,
    enableFAB: true,
    fabLabel: "Abrir Chatbot",
    onOpenChat: () => console.log("Chatbot aberto"),
  },
};

/**
 * Notificação crítica única
 */
export const SingleCritical: Story = {
  args: {
    notifications: [sampleNotifications[0]],
    position: "bottom-right",
    enableFAB: true,
    onOpenChat: () => console.log("Chatbot aberto"),
  },
};

/**
 * Múltiplas notificações sem FAB
 */
export const WithoutFAB: Story = {
  args: {
    notifications: sampleNotifications,
    position: "top-right",
    enableFAB: false,
  },
};

/**
 * Posição top-left
 */
export const TopLeft: Story = {
  args: {
    notifications: sampleNotifications.slice(0, 2),
    position: "top-left",
    enableFAB: true,
  },
};

/**
 * Notificação de sucesso
 */
export const SuccessNotification: Story = {
  args: {
    notifications: [
      {
        id: "success-1",
        title: "Processo Concluído",
        severity: "success",
        message: "Importação de 1.247 materiais realizada com sucesso. Todos os registros foram validados.",
        confidence: 100,
        actionLabel: "Ver detalhes",
      },
    ],
    position: "bottom-right",
    enableFAB: true,
  },
};

/**
 * Apenas FAB (sem notificações)
 */
export const FABOnly: Story = {
  args: {
    notifications: [],
    position: "bottom-right",
    enableFAB: true,
    fabLabel: "Conversar com IA",
    onOpenChat: () => console.log("Abrindo chat"),
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  args: {
    notifications: sampleNotifications,
    position: "bottom-right",
    enableFAB: true,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-gray-900 p-8">
        <Story />
      </div>
    ),
  ],
};

/**
 * Limite de 2 notificações visíveis
 */
export const LimitedVisible: Story = {
  args: {
    notifications: sampleNotifications,
    maxVisible: 2,
    position: "bottom-right",
    enableFAB: true,
  },
};

