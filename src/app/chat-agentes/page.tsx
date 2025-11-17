// src/app/chat-agentes/page.tsx
// Página dedicada ao chat com agentes

import AgentSelector from "@/components/ChatAgent/AgentSelector";

export const metadata = {
  title: "Chat com Agentes ICARUS",
  description:
    "Interface para interagir com os agentes especializados do sistema ICARUS",
};

export default function ChatAgentesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AgentSelector />
    </div>
  );
}
