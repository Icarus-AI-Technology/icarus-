/**
 * OraclusX Design System - Chatbot com GPT Researcher
 * Chatbot avançado com capacidade de pesquisa profunda
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { MessageCircle, Send, X, Loader2, Bot, ExternalLink, Paperclip, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGPTResearcher } from "@/hooks/useGPTResearcher";
import { initSpeechRecognition } from "@/utils/browserCompatibility";
import { supabase } from "@/lib/supabase";

export interface Message {
  id: string;
  type:"user" |"bot" |"research";
  content: string;
  timestamp: Date;
  sources?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChatbotWithResearchProps {
  position?:"bottom-right" |"bottom-left";
  className?: string;
  researcherHost?: string;
  onMessageSent?: (message: string) => void;
}

export const ChatbotWithResearch: React.FC<ChatbotWithResearchProps> = ({
  position ="bottom-right",
  className,
  researcherHost,
  onMessageSent,
}) => {
  const isQAMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('qa') === '1';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isConnected, isResearching, logs, error, research, clearError } = useGPTResearcher({
    host: researcherHost,
    onLog: (data) => {
      console.log("Research Log:", data);
    },
  });

  const positionClasses = useMemo(
    () => ({"bottom-right":"bottom-6 right-6","bottom-left":"bottom-6 left-6",
    }),
    []
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Inicializa o reconhecimento de voz com polyfill cross-browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = initSpeechRecognition();
      
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'pt-BR';

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.warn('Web Speech API não disponível neste navegador. Comando por voz desabilitado.');
      }
    }
  }, []);

  const addBotMessage = useCallback((content: string, sources?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type:"bot",
      content,
      timestamp: new Date(),
      sources,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("👋 Olá!\n\n" +"Eu sou o **Assistente ICARUS AI**, seu copiloto inteligente para gestão de materiais OPME.\n\n" +"**O que posso fazer por você?**\n\n" +"🔗 **NOVO:** Anexe fotos de produtos OPME, embalagens, PDFs com relatos cirúrgicos e prints de tela." +"Posso ler documentos e gerar justificativas médicas automaticamente!"
      );
    }
  }, [isOpen, messages.length, addBotMessage]);

  useEffect(() => {
    // Atualiza mensagens com os logs de pesquisa
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      
      if (lastLog.type ==="info" && (lastLog.message?.includes("concluída") ?? false)) {
        // Pesquisa completa - nada a fazer, resultado já foi adicionado
      }
    }
  }, [logs]);

  

  const addUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type:"user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const addResearchMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type:"research",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // ============================================
  // BUSCA NA BASE DE CONHECIMENTO LOCAL (RAG)
  // ============================================
  
  const searchLocalKnowledge = async (query: string): Promise<Array<{ categoria: string; conteudo_texto: string; modulo?: string }>> => {
    try {
      const { data, error } = await supabase
        .rpc('buscar_conhecimento', {
          query_text: query,
          limit_results: 5,
          min_rank: 0.1
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar conhecimento local:', err);
      return [];
    }
  };

  // ============================================
  // BUSCAR ATIVIDADES DE USUÁRIO
  // ============================================

  const searchUserActivities = async (userEmail: string, days: number = 30): Promise<Array<{ modulo: string; total_acoes: number; acoes_unicas: string[]; taxa_sucesso: number; tempo_medio_ms: number }>> => {
    try {
      const { data, error } = await supabase
        .rpc('buscar_atividades_usuario', {
          p_usuario_email: userEmail,
          p_dias_historico: days
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao buscar atividades do usuário:', err);
      return [];
    }
  };

  const compareUsersForHandover = async (userEmailLeaving: string, userEmailReplacing: string): Promise<Array<{ modulo: string; precisa_treinamento: boolean; experiencia_sainte: number; experiencia_substituto: number; diferenca_experiencia: number }>> => {
    try {
      const { data, error } = await supabase
        .rpc('comparar_usuarios_handover', {
          p_usuario_sainte_email: userEmailLeaving,
          p_usuario_substituto_email: userEmailReplacing
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao comparar usuários:', err);
      return [];
    }
  };

  const detectUserQuery = (query: string): { type: 'user_activities' | 'user_handover'; params: Record<string, string> } | null => {
    const lowerQuery = query.toLowerCase();

    // Detectar consulta de atividades: "o que [usuário] fez"
    const activityMatch = lowerQuery.match(/o que (?:o |a )?([a-záàâãéèêíïóôõöúçñ\s]+) fez|atividades? (?:do|da) ([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (activityMatch) {
      const userName = (activityMatch[1] || activityMatch[2]).trim();
      return { type: 'user_activities', params: { userName } };
    }

    // Detectar comparação para handover: "comparar [user1] com [user2]"
    const handoverMatch = lowerQuery.match(/compar(?:ar|ação) (?:entre )?([a-záàâãéèêíïóôõöúçñ\s]+) (?:com|e) ([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (handoverMatch) {
      const user1 = handoverMatch[1].trim();
      const user2 = handoverMatch[2].trim();
      return { type: 'user_handover', params: { user1, user2 } };
    }

    return null;
  };

  const generateLocalResponse = async (query: string, context: Array<{ categoria: string; conteudo_texto: string; modulo?: string }>): Promise<string> => {
    if (context.length === 0) {
      return ''; // Sem contexto local, usar pesquisa web
    }

    try {
      // Montar contexto a partir da base de conhecimento
      const contextText = context
        .map(doc => `[${doc.categoria}] ${doc.conteudo_texto}`)
        .join('\n\n');

      const prompt = `Você é um assistente especializado em saúde, OPME e gestão hospitalar.

CONTEXTO DA BASE DE CONHECIMENTO:
${contextText}

PERGUNTA DO USUÁRIO:
${query}

INSTRUÇÕES:
- Responda de forma clara e profissional
- Use o contexto fornecido quando relevante
- Se for sobre OPME, materiais cirúrgicos ou legislação de saúde, seja específico
- Cite legislação quando aplicável (ANVISA, ANS)
- Se o contexto não for suficiente, indique que uma pesquisa mais aprofundada pode ser necessária

RESPOSTA:`;

      // Tentar usar Ollama local primeiro
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1:8b',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
    } catch (error) {
      console.log('Ollama não disponível, usando apenas contexto:', error);
    }

    // Fallback: retornar apenas o contexto formatado
    return `📚 **Informações da base de conhecimento:**\n\n${context.map((doc, idx) => 
      `**${idx + 1}. ${doc.categoria}** (${doc.modulo})\n${doc.conteudo_texto.substring(0, 300)}...`
    ).join('\n\n')}`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isResearching) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    onMessageSent?.(userMessage);

    // Adiciona mensagem do usuário
    addUserMessage(userMessage);

    // DETECTAR CONSULTAS ESPECIAIS SOBRE USUÁRIOS
    const userQuery = detectUserQuery(userMessage);
    
    if (userQuery) {
      if (userQuery.type === 'user_activities') {
        // Buscar atividades de um usuário específico
        addResearchMessage(`🔍 Buscando atividades de ${userQuery.params.userName}...`);
        
        // Tentar encontrar o email do usuário (assumindo formato nome@empresa.com)
        const userEmail = `${userQuery.params.userName.toLowerCase().replace(/\s+/g, '')}@empresa.com`;
        const activities = await searchUserActivities(userEmail, 30);
        
        if (activities.length > 0) {
          const response = `📊 **Atividades de ${userQuery.params.userName} (últimos 30 dias):**\n\n` +
            activities.map((act, idx) => 
              `**${idx + 1}. ${act.modulo}**\n` +
              `   • Total de ações: ${act.total_acoes}\n` +
              `   • Ações realizadas: ${act.acoes_unicas.join(', ')}\n` +
              `   • Taxa de sucesso: ${act.taxa_sucesso}%\n` +
              `   • Tempo médio: ${act.tempo_medio_ms}ms`
            ).join('\n\n');
          
          addBotMessage(response);
          return;
        } else {
          addBotMessage(`❌ Não encontrei atividades para ${userQuery.params.userName}. Verifique se o nome está correto ou se o usuário está cadastrado no sistema.`);
          return;
        }
      }
      
      if (userQuery.type === 'user_handover') {
        // Comparar usuários para handover
        addResearchMessage(`🔄 Comparando ${userQuery.params.user1} com ${userQuery.params.user2}...`);
        
        const email1 = `${userQuery.params.user1.toLowerCase().replace(/\s+/g, '')}@empresa.com`;
        const email2 = `${userQuery.params.user2.toLowerCase().replace(/\s+/g, '')}@empresa.com`;
        
        const comparison = await compareUsersForHandover(email1, email2);
        
        if (comparison.length > 0) {
          const needsTraining = comparison.filter(c => c.precisa_treinamento);
          
          let response = `🔄 **Análise de Handover: ${userQuery.params.user1} → ${userQuery.params.user2}**\n\n`;
          
          if (needsTraining.length > 0) {
            response += `⚠️ **Módulos que requerem treinamento:**\n\n`;
            response += needsTraining.map((mod, idx) => 
              `**${idx + 1}. ${mod.modulo}**\n` +
              `   • Experiência de ${userQuery.params.user1}: ${mod.experiencia_sainte} ações\n` +
              `   • Experiência de ${userQuery.params.user2}: ${mod.experiencia_substituto} ações\n` +
              `   • Diferença: ${mod.diferenca_experiencia} ações\n` +
              `   • Status: 🔴 Treinamento necessário`
            ).join('\n\n');
          } else {
            response += `✅ ${userQuery.params.user2} está pronto para assumir as responsabilidades!`;
          }
          
          addBotMessage(response);
          return;
        } else {
          addBotMessage(`❌ Não foi possível comparar os usuários. Verifique se os nomes estão corretos.`);
          return;
        }
      }
    }

    // 1. PRIMEIRO: Buscar na base de conhecimento local
    addResearchMessage("🔍 Buscando na base de conhecimento local...");
    
    const localKnowledge = await searchLocalKnowledge(userMessage);
    
    if (localKnowledge.length > 0) {
      // Temos conhecimento local relevante
      const localResponse = await generateLocalResponse(userMessage, localKnowledge);
      
      if (localResponse) {
        addBotMessage(
          `💡 **Resposta da Base de Conhecimento:**\n\n${localResponse}\n\n` +
          `📊 **Fonte:** ${localKnowledge.length} documento(s) encontrado(s)\n\n` +
          `_Quer uma pesquisa mais aprofundada na web? Digite "pesquisar mais sobre [assunto]"_`
        );
        return;
      }
    }

    // 2. SE NÃO HOUVER CONHECIMENTO LOCAL: Pesquisar na web
    if (!isConnected) {
      addBotMessage("❌ GPT Researcher não está conectado. Verifique se o servidor está rodando em" +
          (researcherHost ||"http://localhost:8000")
      );
      return;
    }

    // Adiciona mensagem de pesquisa
    addResearchMessage("🔍 Pesquisando informações na web...");

    const result = await research({
      task: userMessage,
      reportType:"research_report",
      reportSource:"web",
    });

    if (result) {
      // Remove mensagem de pesquisa
      setMessages((prev) => prev.filter((m) => m.type !=="research"));
      
      // Adiciona resposta com fontes
      const sources = result.sources.map((s) => s.url);
      addBotMessage(result.report, sources);
    } else {
      // Remove mensagem de pesquisa
      setMessages((prev) => prev.filter((m) => m.type !=="research"));
      addBotMessage("❌ Erro ao realizar pesquisa. Tente novamente.");
    }
  };

  // Função para controlar o reconhecimento de voz
  const toggleVoiceRecognition = () => {
    if (!recognition) {
      addBotMessage("❌ Reconhecimento de voz não está disponível neste navegador.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
   const err = error as Error;
        console.error('Error starting recognition:', err);
        setIsListening(false);
      }
    }
  };

  const suggestions = ["Ver alertas ativos","Iniciar treinamento","Como registrar um novo OPME?",
  ];

  if (isQAMode) {
    return null;
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="w-96 h-[600px] mb-4 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 bg-[var(--orx-bg-light)] rounded-[1.25rem] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] border border-white/10"
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-b-[rgba(0,0,0,0.05)] rounded-t-[1.25rem]"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[rgba(99,102,241,0.85)] backdrop-blur-[12px] backdrop-saturate-[180%] border border-white/20 shadow-[4px_4px_8px_rgba(99,102,241,0.2),_-2px_-2px_6px_rgba(255,255,255,0.05),_inset_1px_1px_4px_rgba(0,0,0,0.1)]">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[0.813rem] text-[var(--orx-text-primary)] leading-[1.2] orx-font-semibold m-0">
                  ICARUS AI Assistant
                </h3>
                <div className="flex items-center gap-1">
                  <span
                    className={cn("w-2 h-2 rounded-full",
                      isConnected ?"bg-success/50" :"bg-destructive/50"
                    )}
                  />
                  <span className="text-[var(--orx-text-secondary)] text-[0.813rem]">
                    {isConnected ?"Online • Pronto para ajudar" :"Desconectado"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 rounded-lg transition-all bg-transparent text-[var(--orx-text-secondary)] hover:bg-[rgba(99,102,241,0.1)]"
                title="Expandir"
                aria-label="Expandir"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-all bg-transparent text-[var(--orx-text-secondary)] hover:bg-[rgba(239,68,68,0.1)]"
                title="Fechar chatbot"
                aria-label="Fechar chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-4 pb-4 pl-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex",
                  message.type ==="user" ?"justify-end pr-0 pl-4" :"justify-start pr-4 pl-4"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[95%] text-[var(--orx-text-primary)]",
                    message.type === "user" && "max-w-[90%] text-white bg-[rgba(99,102,241,0.85)] backdrop-blur-[12px] backdrop-saturate-[180%] border border-white/20 shadow-[4px_4px_8px_rgba(99,102,241,0.2),_-2px_-2px_6px_rgba(255,255,255,0.05),_inset_1px_1px_4px_rgba(0,0,0,0.1)]",
                    message.type === "research" && "bg-[rgba(251,191,36,0.15)]",
                    message.type === "bot" && "bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)]"
                  )}
                >
                  <p 
                    className="whitespace-pre-wrap text-[0.813rem] leading-[1.5] m-0"
                  >
                    {message.content}
                  </p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-t-[rgba(0,0,0,0.1)]">
                      <p 
                        className="mb-1 text-[0.813rem] text-[var(--orx-text-secondary)] orx-font-medium"
                      >
                        Fontes:
                      </p>
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline text-[0.813rem] text-[rgba(99,102,241,1)]"
                        >
                          <ExternalLink size={12} />
                          {source}
                        </a>
                      ))}
                    </div>
                  )}
                  <p 
                    className={cn("opacity-70 mt-1 text-[0.813rem]", message.type === "user" ? "text-[rgba(255,255,255,0.8)]" : "text-[var(--orx-text-secondary)]")}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isResearching && (
              <div className="flex justify-start">
                <div 
                  className="rounded-lg p-3 bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)]"
                >
                  <Loader2 
                    className="w-5 h-5 animate-spin text-[rgba(99,102,241,1)]"
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (when no messages) */}
          {messages.length <= 1 && (
            <div className="pb-2 space-y-2 px-4">
              <p className="text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium">
                Sugestões:
              </p>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(suggestion);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all text-[0.813rem] text-[var(--orx-text-primary)] bg-[var(--orx-bg-light)] shadow-[4px_4px_8px_rgba(0,0,0,0.18),_-2px_-2px_6px_rgba(0,0,0,0.1),_inset_1px_1px_2px_rgba(255,255,255,0.3),_inset_-1px_-1px_2px_rgba(0,0,0,0.1)] orx-font-medium hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.25),_-3px_-3px_8px_rgba(0,0,0,0.15),_inset_1px_1px_3px_rgba(255,255,255,0.4),_inset_-1px_-1px_3px_rgba(0,0,0,0.12),_0_3px_12px_rgba(99,102,241,0.12)] hover:text-[rgba(99,102,241,1)] active:scale-[0.98]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div 
              className="px-4 py-2 bg-[rgba(239,68,68,0.1)] text-[var(--orx-error-dark)] text-[0.813rem]"
            >
              {error}
              <button
                onClick={clearError}
                className="ml-2 underline bg-transparent text-[var(--orx-error-dark)]"
                title="Fechar mensagem de erro"
                aria-label="Fechar mensagem de erro"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Input */}
          <div 
            className="p-4 border-t border-t-[rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center gap-2">
              {/* Botão Anexar Arquivos */}
              <button
                className="p-2 rounded-lg transition-all bg-[var(--orx-bg-light)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] text-[var(--orx-text-secondary)] hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(99,102,241,0.15)]"
                title="Anexar arquivo"
                aria-label="Anexar arquivo"
              >
                <Paperclip size={18} />
              </button>

              {/* Botão Comando por Voz */}
              <button
                onClick={toggleVoiceRecognition}
                className={cn("p-2 rounded-lg transition-all",
                  isListening ? "bg-[rgba(239,68,68,0.85)] text-white animate-pulse shadow-[4px_4px_8px_rgba(239,68,68,0.3),_-2px_-2px_6px_rgba(255,255,255,0.05),_inset_1px_1px_4px_rgba(0,0,0,0.1),_0_0_20px_rgba(239,68,68,0.4)]" :
                  "bg-[var(--orx-bg-light)] text-[var(--orx-text-secondary)] shadow-[var(--orx-shadow-light-1),_var(--orx-shadow-light-2)] hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(99,102,241,0.15)]"
                )}
                title={isListening ?"Parar gravação" :"Comando por voz"}
                aria-label={isListening ?"Parar gravação" :"Comando por voz"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Input de texto com neumorphism */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key ==="Enter" && handleSendMessage()}
                placeholder="Digite sua pergunta..."
                disabled={isResearching}
                className="flex-1 px-3 py-2 rounded-lg transition-all text-[0.813rem] text-[var(--orx-text-primary)] bg-[var(--orx-bg-light)] outline-none shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)]"
              />

              {/* Botão Enviar */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isResearching}
                className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[rgba(99,102,241,0.85)] text-white backdrop-blur-[12px] backdrop-saturate-[180%] shadow-[4px_4px_8px_rgba(99,102,241,0.2),_-2px_-2px_6px_rgba(255,255,255,0.05),_inset_1px_1px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:bg-[rgba(99,102,241,0.95)]"
              >
                {isResearching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Footer - Powered by ICARUS AI */}
          <div 
            className="px-4 pb-3 pt-2 border-t border-t-[rgba(229,231,235,0.5)]"
          >
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)] m-0 opacity-60 text-center">
              Powered by ICARUS AI • 11 serviços integrados • OCR ativado
            </p>
          </div>
        </div>
      )}

      {/* Frase"Em que posso ajudar?" - Acima do botão flutuante */}
      {!isOpen && (
        <div 
          className="absolute mb-2 right-0 bottom-[105px] bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] px-5 py-3 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] whitespace-nowrap border border-white/30"
        >
          <p className="text-[0.813rem] text-[#4B5563] m-0 orx-font-medium">
            Em que posso ajudar?
          </p>
        </div>
      )}

      {/* FAB Button - 20% maior (88px) com Liquid Glass + Gradiente */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full",
          "flex items-center justify-center",
          "relative",
          "w-[88px] h-[88px] bg-[rgba(99,102,241,0.85)] text-white backdrop-blur-[12px] backdrop-saturate-[180%] border border-white/20",
          "shadow-[12px_12px_24px_rgba(99,102,241,0.3),_-6px_-6px_16px_rgba(255,255,255,0.05),_inset_2px_2px_8px_rgba(0,0,0,0.15),_inset_-2px_-2px_8px_rgba(255,255,255,0.1),_0_8px_32px_0_rgba(31,38,135,0.37)]",
          "transition-all duration-300 ease-out hover:scale-[1.05] hover:-translate-y-[2px] hover:bg-[rgba(99,102,241,0.95)]",
          "hover:backdrop-blur-[16px] hover:backdrop-saturate-[200%]",
          "hover:shadow-[16px_16px_32px_rgba(99,102,241,0.35),_-8px_-8px_20px_rgba(255,255,255,0.08),_inset_2px_2px_10px_rgba(0,0,0,0.18),_inset_-2px_-2px_10px_rgba(255,255,255,0.12),_0_12px_40px_0_rgba(31,38,135,0.45)]",
          "active:scale-[0.95]"
        )}
         aria-label="Abrir Assistente de Pesquisa"
      >
        <MessageCircle size={37} /> {/* 31 * 1.2 ≈ 37 (aumento de 20%) */}
        <span 
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-white rounded-full bg-[var(--orx-error)] text-[0.813rem] shadow-[0_2px_4px_rgba(239,68,68,0.3)] orx-font-bold"
        >
          3
        </span>
      </button>
    </div>
  );
};

ChatbotWithResearch.displayName ="OraclusXChatbotWithResearch";

export default ChatbotWithResearch;

