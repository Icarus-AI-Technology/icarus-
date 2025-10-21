/**
 * OraclusX Design System - Chatbot com GPT Researcher
 * Chatbot avançado com capacidade de pesquisa profunda
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from"react";
import { MessageCircle, Send, X, Loader2, Bot, ExternalLink, ChevronDown, ChevronUp, Paperclip, Mic, MicOff } from"lucide-react";
import { cn } from"@/lib/utils";
import { useGPTResearcher } from"@/hooks/useGPTResearcher";
import { initSpeechRecognition } from"@/utils/browserCompatibility";
import { supabase } from"@/lib/supabase";

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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
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

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
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
  
  const searchLocalKnowledge = async (query: string): Promise<any[]> => {
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
      console.error('Erro ao buscar conhecimento local:', error);
      return [];
    }
  };

  // ============================================
  // BUSCAR ATIVIDADES DE USUÁRIO
  // ============================================

  const searchUserActivities = async (userEmail: string, days: number = 30): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .rpc('buscar_atividades_usuario', {
          p_usuario_email: userEmail,
          p_dias_historico: days
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      return [];
    }
  };

  const compareUsersForHandover = async (userEmailLeaving: string, userEmailReplacing: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .rpc('comparar_usuarios_handover', {
          p_usuario_sainte_email: userEmailLeaving,
          p_usuario_substituto_email: userEmailReplacing
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao comparar usuários:', error);
      return [];
    }
  };

  const detectUserQuery = (query: string): { type: string; params: any } | null => {
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

  const generateLocalResponse = async (query: string, context: any[]): Promise<string> => {
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
      } catch (_error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const suggestions = ["Ver alertas ativos","Iniciar treinamento","Como registrar um novo OPME?",
  ];

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="w-96 h-[600px] mb-4 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300"
          style={{
            background: 'var(--orx-bg-light)', // Paleta do sistema (adaptável dark/light)
            borderRadius: '1.25rem',
            boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)', // Neumorphism
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4"
            style={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              borderTopLeftRadius: '1.25rem',
              borderTopRightRadius: '1.25rem'
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-lg"
                style={{
                  background: 'rgba(99, 102, 241, 0.85)', // MESMO INDIGO do Icarus/Chatbot button
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: `
                    4px 4px 8px rgba(99, 102, 241, 0.2),
                    -2px -2px 6px rgba(255, 255, 255, 0.05),
                    inset 1px 1px 4px rgba(0, 0, 0, 0.1)
                  `
                }}
              >
                <Bot className="w-5 h-5" style={{ color: 'white' }} />
              </div>
              <div>
                <h3 
                  style={{
                    fontSize: '0.813rem', // Reduzido de 1rem para 0.875rem
                    fontFamily: 'var(--orx-font-family)',
                    color: 'var(--orx-text-primary)',
                    lineHeight: '1.2',
                    fontWeight: 600,
                    margin: 0
                  }}
                >
                  ICARUS AI Assistant
                </h3>
                <div className="flex items-center gap-1">
                  <span
                    className={cn("w-2 h-2 rounded-full",
                      isConnected ?"bg-success/50" :"bg-destructive/50"
                    )}
                  />
                  <span style={{ 
                    color: 'var(--orx-text-secondary)',
                    fontSize: '0.813rem' // Reduzido de 0.75rem para 0.6875rem
                  }}>
                    {isConnected ?"Online • Pronto para ajudar" :"Desconectado"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 rounded-lg transition-all"
                title="Expandir"
                aria-label="Expandir"
                style={{
                  border: 'none',
                  outline: 'none',
                  color: 'var(--orx-text-secondary)',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-all"
                title="Fechar chatbot"
                aria-label="Fechar chatbot"
                style={{
                  border: 'none',
                  outline: 'none',
                  color: 'var(--orx-text-secondary)',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto space-y-3"
            style={{
              padding: '1rem 1rem 1rem 0', // Remove padding esquerdo, mantém os outros
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex",
                  message.type ==="user" ?"justify-end" :"justify-start"
                )}
                style={{
                  paddingLeft: '1rem', // Adiciona padding esquerdo apenas nos itens
                  paddingRight: message.type ==="user" ? '0' : '1rem', // Remove padding direito em mensagens do usuário
                }}
              >
                <div
                  className={cn("rounded-lg p-3")}
                  style={{
                    maxWidth: message.type ==="user" ? '90%' : '95%', // Aumentado de 80% para ocupar mais espaço
                    background: message.type ==="user"
                      ? 'rgba(99, 102, 241, 0.85)' // Indigo Liquid Glass para mensagem do usuário
                      : message.type ==="research"
                      ? 'rgba(251, 191, 36, 0.15)' // Amarelo translúcido para pesquisa
                      : 'var(--orx-bg-light)', // Background do sistema para bot
                    color: message.type ==="user"
                      ? 'white'
                      : 'var(--orx-text-primary)',
                    boxShadow: message.type ==="user"
                      ? `
                        4px 4px 8px rgba(99, 102, 241, 0.2),
                        -2px -2px 6px rgba(255, 255, 255, 0.05),
                        inset 1px 1px 4px rgba(0, 0, 0, 0.1)
                      `
                      : 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)', // Neumorphism para mensagens do bot
                    backdropFilter: message.type ==="user" ? 'blur(12px) saturate(180%)' : undefined,
                    WebkitBackdropFilter: message.type ==="user" ? 'blur(12px) saturate(180%)' : undefined,
                    border: message.type ==="user" ? '1px solid rgba(255, 255, 255, 0.18)' : undefined,
                  }}
                >
                  <p 
                    className="whitespace-pre-wrap"
                    style={{
                      fontSize: '0.813rem', // Reduzido
                      fontFamily: 'var(--orx-font-family)',
                      lineHeight: '1.5',
                      margin: 0
                    }}
                  >
                    {message.content}
                  </p>
                  {message.sources && message.sources.length > 0 && (
                    <div 
                      className="mt-2 pt-2"
                      style={{
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <p 
                        className="mb-1" style={{ 
                          fontSize: '0.813rem',
                          color: 'var(--orx-text-secondary)'
                        , fontWeight: 500 }}
                      >
                        Fontes:
                      </p>
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                          style={{
                            fontSize: '0.813rem',
                            color: 'rgba(99, 102, 241, 1)'
                          }}
                        >
                          <ExternalLink size={12} />
                          {source}
                        </a>
                      ))}
                    </div>
                  )}
                  <p 
                    className="opacity-70 mt-1"
                    style={{
                      fontSize: '0.813rem',
                      color: message.type ==="user" ? 'rgba(255, 255, 255, 0.8)' : 'var(--orx-text-secondary)'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isResearching && (
              <div className="flex justify-start">
                <div 
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--orx-bg-light)',
                    boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)'
                  }}
                >
                  <Loader2 
                    className="w-5 h-5 animate-spin"
                    style={{ color: 'rgba(99, 102, 241, 1)' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (when no messages) */}
          {messages.length <= 1 && (
            <div 
              className="pb-2 space-y-2"
              style={{
                paddingLeft: '1rem', // Alinhado com as mensagens
                paddingRight: '1rem',
              }}
            >
              <p style={{
                fontSize: '0.813rem', // Reduzido de 0.8125rem
                fontFamily: 'var(--orx-font-family)',
                color: 'var(--orx-text-primary)',
                marginBottom: '0.5rem',
                fontWeight: 500
              }}>
                Sugestões:
              </p>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(suggestion);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all"
                  style={{
                    fontSize: '0.813rem', // Reduzido de 0.8125rem
                    fontFamily: 'var(--orx-font-family)',
                    color: 'var(--orx-text-primary)',
                    background: 'var(--orx-bg-light)',
                    border: 'none',
                    cursor: 'pointer',
                    // NEUMORPHISM COM BORDA ESCURA (sombras invertidas)
                    boxShadow: `
                      4px 4px 8px rgba(0, 0, 0, 0.18),
                      -2px -2px 6px rgba(0, 0, 0, 0.1),
                      inset 1px 1px 2px rgba(255, 255, 255, 0.3),
                      inset -1px -1px 2px rgba(0, 0, 0, 0.1)
                    `,
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; // Elevação mais pronunciada
                    e.currentTarget.style.boxShadow = `
                      6px 6px 12px rgba(0, 0, 0, 0.25),
                      -3px -3px 8px rgba(0, 0, 0, 0.15),
                      inset 1px 1px 3px rgba(255, 255, 255, 0.4),
                      inset -1px -1px 3px rgba(0, 0, 0, 0.12),
                      0 3px 12px rgba(99, 102, 241, 0.12)
                    `;
                    e.currentTarget.style.color = 'rgba(99, 102, 241, 1)'; // Texto muda para indigo
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `
                      4px 4px 8px rgba(0, 0, 0, 0.18),
                      -2px -2px 6px rgba(0, 0, 0, 0.1),
                      inset 1px 1px 2px rgba(255, 255, 255, 0.3),
                      inset -1px -1px 2px rgba(0, 0, 0, 0.1)
                    `;
                    e.currentTarget.style.color = 'var(--orx-text-primary)';
                  }}
                  onMouseDown={(e) => {
                    // Efeito de pressão (afundado)
                    e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                    e.currentTarget.style.boxShadow = `
                      inset 2px 2px 5px rgba(0, 0, 0, 0.2),
                      inset -2px -2px 4px rgba(0, 0, 0, 0.15)
                    `;
                  }}
                  onMouseUp={(e) => {
                    // Volta ao estado hover
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `
                      6px 6px 12px rgba(0, 0, 0, 0.25),
                      -3px -3px 8px rgba(0, 0, 0, 0.15),
                      inset 1px 1px 3px rgba(255, 255, 255, 0.4),
                      inset -1px -1px 3px rgba(0, 0, 0, 0.12),
                      0 3px 12px rgba(99, 102, 241, 0.12)
                    `;
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div 
              className="px-4 py-2"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--orx-error-dark)',
                fontSize: '0.813rem'
              }}
            >
              {error}
              <button
                onClick={clearError}
                className="ml-2 underline"
                title="Fechar mensagem de erro"
                aria-label="Fechar mensagem de erro"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--orx-error-dark)',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            </div>
          )}

          {/* Input */}
          <div 
            className="p-4"
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="flex items-center gap-2">
              {/* Botão Anexar Arquivos */}
              <button
                className="p-2 rounded-lg transition-all"
                title="Anexar arquivo"
                aria-label="Anexar arquivo"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'var(--orx-bg-light)',
                  boxShadow: 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
                  color: 'var(--orx-text-secondary)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)';
                }}
              >
                <Paperclip size={18} />
              </button>

              {/* Botão Comando por Voz */}
              <button
                onClick={toggleVoiceRecognition}
                className="p-2 rounded-lg transition-all"
                title={isListening ?"Parar gravação" :"Comando por voz"}
                aria-label={isListening ?"Parar gravação" :"Comando por voz"}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: isListening 
                    ? 'rgba(239, 68, 68, 0.85)' // Vermelho quando está ouvindo
                    : 'var(--orx-bg-light)',
                  boxShadow: isListening
                    ? `
                      4px 4px 8px rgba(239, 68, 68, 0.3),
                      -2px -2px 6px rgba(255, 255, 255, 0.05),
                      inset 1px 1px 4px rgba(0, 0, 0, 0.1),
                      0 0 20px rgba(239, 68, 68, 0.4)
                    `
                    : 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)',
                  color: isListening ? 'white' : 'var(--orx-text-secondary)',
                  cursor: 'pointer',
                  animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--orx-shadow-light-1), var(--orx-shadow-light-2)';
                  }
                }}
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
                className="flex-1 px-3 py-2 rounded-lg transition-all"
                style={{
                  fontSize: '0.813rem',
                  fontFamily: 'var(--orx-font-family)',
                  color: 'var(--orx-text-primary)',
                  background: 'var(--orx-bg-light)',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7)' // Neumorphism inset
                }}
              />

              {/* Botão Enviar */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isResearching}
                className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'rgba(99, 102, 241, 0.85)',
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: `
                    4px 4px 8px rgba(99, 102, 241, 0.2),
                    -2px -2px 6px rgba(255, 255, 255, 0.05),
                    inset 1px 1px 4px rgba(0, 0, 0, 0.1)
                  `
                }}
                onMouseEnter={(e) => {
                  if (!isResearching && inputMessage.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.95)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.85)';
                }}
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
            className="px-4 pb-3 pt-2 border-t"
            style={{
              borderTopColor: 'rgba(229, 231, 235, 0.5)'
            }}
          >
            <p style={{
              fontSize: '0.813rem',
              fontFamily: 'var(--orx-font-family)',
              color: 'var(--orx-text-secondary)',
              margin: 0,
              opacity: 0.6,
              textAlign: 'center'
            }}>
              Powered by ICARUS AI • 11 serviços integrados • OCR ativado
            </p>
          </div>
        </div>
      )}

      {/* Frase"Em que posso ajudar?" - Acima do botão flutuante */}
      {!isOpen && (
        <div 
          className="absolute mb-2"
          style={{
            bottom: '105px', // Acima do botão flutuante (88px + espaço)
            right: '0',
            background: 'rgba(255, 255, 255, 0.7)', // Branco com 70% opacidade (modo claro)
            backdropFilter: 'blur(12px)', // Blur mais forte
            WebkitBackdropFilter: 'blur(12px)', // Safari
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <p style={{
            fontSize: '0.813rem',
            fontFamily: 'var(--orx-font-family)',
            color: '#4B5563', // Cinza escuro (Gray-600)
            margin: 0,
            fontWeight: 500
          }}>
            Em que posso ajudar?
          </p>
        </div>
      )}

      {/* FAB Button - 20% maior (88px) com Liquid Glass + Gradiente */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("rounded-full","flex items-center justify-center","relative"
        )}
        style={{
          width: '88px', // 73px * 1.2 = 87.6px ≈ 88px (aumento de 20%)
          height: '88px',
          background: 'rgba(99, 102, 241, 0.85)', // Indigo com 85% opacidade (Liquid Glass)
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          outline: 'none',
          color: 'white',
          boxShadow: `
            12px 12px 24px rgba(99, 102, 241, 0.3),
            -6px -6px 16px rgba(255, 255, 255, 0.05),
            inset 2px 2px 8px rgba(0, 0, 0, 0.15),
            inset -2px -2px 8px rgba(255, 255, 255, 0.1),
            0 8px 32px 0 rgba(31, 38, 135, 0.37)
          `,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.95)';
          e.currentTarget.style.backdropFilter = 'blur(16px) saturate(200%)';
          e.currentTarget.style.setProperty('-webkit-backdrop-filter', 'blur(16px) saturate(200%)');
          e.currentTarget.style.boxShadow = `
            16px 16px 32px rgba(99, 102, 241, 0.35),
            -8px -8px 20px rgba(255, 255, 255, 0.08),
            inset 2px 2px 10px rgba(0, 0, 0, 0.18),
            inset -2px -2px 10px rgba(255, 255, 255, 0.12),
            0 12px 40px 0 rgba(31, 38, 135, 0.45)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.85)';
          e.currentTarget.style.backdropFilter = 'blur(12px) saturate(180%)';
          e.currentTarget.style.setProperty('-webkit-backdrop-filter', 'blur(12px) saturate(180%)');
          e.currentTarget.style.boxShadow = `
            12px 12px 24px rgba(99, 102, 241, 0.3),
            -6px -6px 16px rgba(255, 255, 255, 0.05),
            inset 2px 2px 8px rgba(0, 0, 0, 0.15),
            inset -2px -2px 8px rgba(255, 255, 255, 0.1),
            0 8px 32px 0 rgba(31, 38, 135, 0.37)
          `;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        }}
        aria-label="Abrir Assistente de Pesquisa"
      >
        <MessageCircle size={37} /> {/* 31 * 1.2 ≈ 37 (aumento de 20%) */}
        <span 
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-white rounded-full" style={{ 
            background: 'var(--orx-error)',
            fontSize: '0.813rem',
            border: 'none',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
          , fontWeight: 700 }}
        >
          3
        </span>
      </button>
    </div>
  );
};

ChatbotWithResearch.displayName ="OraclusXChatbotWithResearch";

export default ChatbotWithResearch;

