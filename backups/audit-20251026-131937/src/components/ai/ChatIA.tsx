/**
 * Componente: Chat IA
 * Interface de conversação com modelos LLM (Ollama + GPT-4 + Claude)
 */

import { useState } from "react";
import { Send, Bot, User, Sparkles, Loader } from "lucide-react";
import { hybridLLMService } from "@/lib/llm/hybrid.service";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
}

export function ChatIA() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente de IA do ICARUS v5.0. Posso ajudá-lo com análises, previsões e insights sobre estoque, cirurgias, finanças e compliance. Como posso ajudar?",
      model: "system",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Determinar complexidade baseado na pergunta
      const complexity =
        input.toLowerCase().includes("análise") ||
        input.toLowerCase().includes("compliance")
          ? "complex"
          : input.toLowerCase().includes("previsão") ||
              input.toLowerCase().includes("recomend")
            ? "moderate"
            : "simple";

      const response = await hybridLLMService.processQuery({
        prompt: input,
        complexity,
        systemPrompt:
          "Você é um assistente especializado em gestão hospitalar e OPME. Seja direto, preciso e prático.",
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        model: response.model,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente ou reformule sua pergunta.",
        model: "error",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sugestoes = [
    "Qual a previsão de demanda para próteses de joelho?",
    "Analise o score de inadimplência dos clientes",
    "Quais cirurgias têm maior complexidade este mês?",
    "Existem alertas de compliance urgentes?",
  ];

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Chat IA - Assistente ICARUS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Powered by: Ollama + GPT-4 + Claude 3.5
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-slate-600 dark:text-slate-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`
              max-w-[80%] rounded-2xl px-4 py-3
              ${
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              }
            `}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                <span>
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {message.model && message.model !== "system" && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {message.model}
                    </span>
                  </>
                )}
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Processando...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sugestões (aparece quando não há mensagens do usuário) */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Sugestões:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {sugestoes.map((sugestao, idx) => (
              <button
                key={idx}
                onClick={() => setInput(sugestao)}
                className="text-left text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta... (Shift+Enter para nova linha)"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          💡 Este chat usa estratégia híbrida: 80% Ollama (grátis) + 20%
          GPT-4/Claude (casos complexos)
        </p>
      </div>
    </div>
  );
}
