/**
 * 🤖 TUTOR IA ESPECIALIZADO EM OPME
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Assistente inteligente para:
 * - Justificativas médicas
 * - Prevenção de glosas
 * - Análise de documentos (OCR)
 * - Catálogo de materiais
 * - Legislação e compliance
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Upload,
  FileText,
  Sparkles,
  Image as ImageIcon,
  Send,
  X,
  Loader2,
  BookOpen,
  Scale,
  Package,
  FileCheck,
} from "lucide-react";
import ocrService from "@/lib/ocr-service";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "image" | "document";
  confidence?: number;
}

interface OCRResult {
  text: string;
  confidence: number;
  fields?: Record<string, string | null>;
}

export function TutorOPME() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "ocr" | "search">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================================
  // BUSCA NA BASE DE CONHECIMENTO
  // ============================================

  interface KnowledgeDoc {
    categoria: string;
    conteudo_texto: string;
  }

  const searchKnowledge = async (query: string): Promise<KnowledgeDoc[]> => {
    try {
      const { data, error } = await supabase.rpc("buscar_conhecimento", {
        query_text: query,
        limit_results: 5,
        min_rank: 0.1,
      });

      if (error) throw error;
      return (data as KnowledgeDoc[]) || [];
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao buscar conhecimento:", err);
      return [];
    }
  };

  // ============================================
  // GERAÇÃO DE RESPOSTA COM OLLAMA + RAG
  // ============================================

  const generateResponse = async (userQuery: string): Promise<string> => {
    try {
      // 1. Buscar contexto relevante na base de conhecimento
      const context = await searchKnowledge(userQuery);

      // 2. Montar prompt com contexto (RAG)
      const contextText = context
        .map((doc) => `[${doc.categoria}] ${doc.conteudo_texto}`)
        .join("\n\n");

      const prompt = `Você é um especialista em OPME (Órteses, Próteses e Materiais Especiais) e trabalha auxiliando profissionais de saúde.

CONTEXTO DA BASE DE CONHECIMENTO:
${contextText}

PERGUNTA DO USUÁRIO:
${userQuery}

INSTRUÇÕES:
- Responda de forma clara, objetiva e profissional
- Use o contexto fornecido quando relevante
- Se for sobre justificativa médica, forneça estrutura detalhada
- Se for sobre glosas, explique prevenção e recurso
- Se for sobre materiais, detalhe características e indicações
- Cite legislação quando aplicável (ANS, ANVISA)
- Se não tiver certeza, indique que o médico responsável deve ser consultado

RESPOSTA:`;

      // 3. Enviar para Ollama
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1:8b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Ollama não disponível. Verifique se está rodando (ollama serve)",
        );
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao gerar resposta:", err);
      return `Desculpe, não consegui processar sua pergunta no momento. 

**Possíveis soluções:**
- Verifique se o Ollama está rodando: \`ollama serve\`
- Tente reformular sua pergunta
- Consulte a documentação em docs/tutores/

**Sua pergunta:** ${userQuery}`;
    }
  };

  // ============================================
  // PROCESSAR OCR (DOCUMENTOS/FOTOS)
  // ============================================

  const processOCR = async (file: File): Promise<OCRResult> => {
    try {
      setIsLoading(true);

      // Extrair texto
      const result = await ocrService.extractText(file);

      // Tentar extrair campos estruturados (etiquetas OPME)
      const fields = await ocrService.extractFields(file, {
        lote: /Lote[:\s]*(\w+)/i,
        validade: /Val(?:idade)?[:\s]*([\d-]+)/i,
        registro: /(?:Reg(?:istro)?|MS)[:\s]*(\d{13})/i,
        fabricante: /Fabricante[:\s]*(.+?)(?:\n|$)/i,
        ref: /(?:REF|Ref(?:erência)?)[:\s]*(\w+)/i,
      });

      return {
        text: result.text,
        confidence: result.confidence,
        fields,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro no OCR:", err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || (selectedFile ? `[Arquivo: ${selectedFile.name}]` : ""),
      timestamp: new Date(),
      type: selectedFile ? "image" : "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response = "";

      // Se tem arquivo, processar OCR primeiro
      if (selectedFile) {
        const ocrResult = await processOCR(selectedFile);

        response = `**📄 Documento processado com ${ocrResult.confidence.toFixed(1)}% de confiança**\n\n`;

        if (ocrResult.fields && Object.keys(ocrResult.fields).length > 0) {
          response += "**Campos extraídos:**\n";
          Object.entries(ocrResult.fields).forEach(([key, value]) => {
            if (value) response += `- **${key}:** ${value}\n`;
          });
          response += "\n";
        }

        response += `**Texto completo:**\n${ocrResult.text.substring(0, 500)}${ocrResult.text.length > 500 ? "..." : ""}`;

        // Perguntar ao usuário o que ele quer fazer com o documento
        response +=
          "\n\n**O que você gostaria de fazer com este documento?**\n- Gerar justificativa médica\n- Verificar conformidade\n- Conferir dados para faturamento\n- Outro (me diga!)";

        setSelectedFile(null);
      } else {
        // Resposta com IA (RAG + Ollama)
        response = await generateResponse(input);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const err = error as Error;
      console.error("Erro:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // ============================================
  // ATALHOS RÁPIDOS
  // ============================================

  const shortcuts = [
    {
      icon: FileText,
      label: "Gerar Justificativa",
      prompt:
        "Preciso de ajuda para criar uma justificativa médica para OPME. Como estruturar?",
    },
    {
      icon: Scale,
      label: "Evitar Glosas",
      prompt:
        "Quais são os principais motivos de glosa em OPME e como prevenir?",
    },
    {
      icon: Package,
      label: "Catálogo de Materiais",
      prompt:
        "Me explique sobre os tipos de materiais de síntese óssea disponíveis.",
    },
    {
      icon: FileCheck,
      label: "Checklist Pré-Op",
      prompt: "Qual o checklist pré-cirúrgico completo para OPME?",
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 group"
        title="Tutor IA OPME"
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[480px] h-[680px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">Tutor IA OPME</h3>
            <p className="text-xs opacity-90">
              Especialista em materiais cirúrgicos
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === "chat"
              ? "bg-white dark:bg-gray-900 border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium text-sm">Chat</span>
        </button>
        <button
          onClick={() => setActiveTab("ocr")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === "ocr"
              ? "bg-white dark:bg-gray-900 border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="font-medium text-sm">Scan</span>
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
            activeTab === "search"
              ? "bg-white dark:bg-gray-900 border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="font-medium text-sm">Busca</span>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
              Olá! Sou seu Tutor IA especializado em OPME
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Posso ajudar com:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {shortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  onClick={() => {
                    setInput(shortcut.prompt);
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <shortcut.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {shortcut.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Upload documento/foto"
          >
            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Pergunte sobre OPME, glosas, materiais..."
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!input.trim() && !selectedFile)}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
