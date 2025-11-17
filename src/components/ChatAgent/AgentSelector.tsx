"use client";

// src/components/ChatAgent/AgentSelector.tsx
// Componente para selecionar e executar agentes via chat

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";

type Agent = {
  name: string;
  icon: string;
  color: string;
  commands: string[];
};

type Message = {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  agent?: string;
  timestamp: Date;
  status?: "pending" | "success" | "error";
};

const AGENTS: Agent[] = [
  {
    name: "IA-Validator",
    icon: "🔍",
    color: "text-blue-600",
    commands: [
      "validar-topologia",
      "auditar-edge-functions",
      "corrigir-configs",
    ],
  },
  {
    name: "Contador",
    icon: "📊",
    color: "text-green-600",
    commands: ["check-fiscal-erp", "list-obrigacoes", "simular-lucro-real"],
  },
  {
    name: "Advogado",
    icon: "⚖️",
    color: "text-purple-600",
    commands: ["check-compliance-erp", "monitor-regulatorio"],
  },
  {
    name: "Gestao",
    icon: "📈",
    color: "text-orange-600",
    commands: ["mapear-kpis", "auditar-modulos"],
  },
  {
    name: "Tutor",
    icon: "🎓",
    color: "text-indigo-600",
    commands: ["diagnosticar", "classificar-gaps", "parecer-compliance"],
  },
];

export default function AgentSelector() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content: "Digite @ para ver agentes disponíveis ou /help para ajuda",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Detectar @mention
  useEffect(() => {
    if (input.startsWith("@")) {
      const query = input.slice(1).toLowerCase();
      const filtered = AGENTS.filter((agent) =>
        agent.name.toLowerCase().includes(query),
      );
      setFilteredAgents(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSelectedAgent(null);
    }
  }, [input]);

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setInput(`@${agent.name} `);
    setShowSuggestions(false);
  };

  const executeCommand = async (agent: string, action: string) => {
    setIsExecuting(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `@${agent} ${action}`,
      timestamp: new Date(),
    };

    const pendingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "agent",
      content: `Executando ${action}...`,
      agent,
      timestamp: new Date(),
      status: "pending",
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);

    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, action }),
      });

      const result = await response.json();

      const resultMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "agent",
        content: result.success ? result.data : result.error,
        agent,
        timestamp: new Date(),
        status: result.success ? "success" : "error",
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== pendingMessage.id).concat(resultMessage),
      );
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "agent",
        content: `Erro: ${error.message}`,
        agent,
        timestamp: new Date(),
        status: "error",
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== pendingMessage.id).concat(errorMessage),
      );
    } finally {
      setIsExecuting(false);
      setInput("");
      setSelectedAgent(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    // Comando help
    if (input === "/help") {
      const helpMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: `Comandos disponíveis:\n\n${AGENTS.map(
          (agent) =>
            `${agent.icon} @${agent.name}\n  Ações: ${agent.commands.join(", ")}`,
        ).join("\n\n")}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, helpMessage]);
      setInput("");
      return;
    }

    // Parse comando: @Agent action
    const match = input.match(/@(\w+)\s+(\S+)/);
    if (match) {
      const [, agentName, action] = match;
      const agent = AGENTS.find((a) => a.name === agentName);

      if (agent) {
        if (agent.commands.includes(action)) {
          executeCommand(agentName, action);
        } else {
          const errorMsg: Message = {
            id: Date.now().toString(),
            type: "system",
            content: `Ação "${action}" não encontrada para @${agentName}.\nAções disponíveis: ${agent.commands.join(", ")}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          setInput("");
        }
      } else {
        const errorMsg: Message = {
          id: Date.now().toString(),
          type: "system",
          content: `Agente @${agentName} não encontrado. Use /help para ver agentes disponíveis.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setInput("");
      }
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.status === "pending")
      return <Loader2 className="animate-spin" size={16} />;
    if (message.status === "success") return <CheckCircle size={16} />;
    if (message.status === "error") return <AlertCircle size={16} />;
    if (message.type === "system") return <Info size={16} />;
    return null;
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white">🤖 Agentes ICARUS</h1>
        <p className="text-blue-100 text-sm">
          Digite @ para selecionar um agente ou /help para ajuda
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : message.type === "system"
                    ? "bg-gray-100 text-gray-800 border border-gray-300"
                    : "bg-white text-gray-800 shadow-md"
              }`}
            >
              {message.agent && (
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                  {AGENTS.find((a) => a.name === message.agent)?.icon}
                  <span>{message.agent}</span>
                  {getMessageIcon(message)}
                </div>
              )}
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {message.content}
              </pre>
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && filteredAgents.length > 0 && (
        <div className="mb-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAgents.map((agent) => (
            <button
              key={agent.name}
              onClick={() => selectAgent(agent)}
              className="w-full px-4 py-3 hover:bg-gray-100 text-left flex items-center gap-3 border-b last:border-b-0"
            >
              <span className="text-2xl">{agent.icon}</span>
              <div className="flex-1">
                <div className={`font-semibold ${agent.color}`}>
                  @{agent.name}
                </div>
                <div className="text-xs text-gray-600">
                  {agent.commands.join(", ")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite @ para selecionar agente..."
          className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isExecuting}
        />
        <button
          type="submit"
          disabled={!input.trim() || isExecuting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isExecuting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>

      {/* Selected Agent Commands */}
      {selectedAgent && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-semibold text-blue-900 mb-2">
            Ações disponíveis para {selectedAgent.icon} @{selectedAgent.name}:
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAgent.commands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInput(`@${selectedAgent.name} ${cmd}`)}
                className="px-3 py-1 bg-white border border-blue-200 rounded text-sm hover:bg-blue-100"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
