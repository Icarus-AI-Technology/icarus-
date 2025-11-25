import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  X, 
  Maximize2, 
  Bot, 
  Sparkles 
} from 'lucide-react';
import { Chip, ScrollShadow } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { usuario } = useAuth();

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const suggestions = [
    "Ver alertas ativos",
    "Iniciar treinamento",
    "Analisar NFe #1234",
    "Status de pedidos"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('medical-ai', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'Você é o Assistente ICARUS AI, especializado em gestão de materiais OPME, ortopedia, traumatologia e contexto hospitalar brasileiro. Responda de forma técnica, clara e com foco em apoio à decisão clínica/operacional.',
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
          userId: usuario?.id,
          module: 'chat-widget',
        },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data?.result || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling medical-ai function:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <>
      {/* Minimized Button */}
      {!isExpanded && (
        <button
          onClick={toggleExpanded}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center text-white hover:scale-105 transition-all duration-300 z-50 group"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:animate-ping"></div>
          <Bot size={28} />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isExpanded && (
        <div className="fixed bottom-6 right-6 w-[380px] md:w-[420px] bg-[#1a1d26] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col font-sans animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-indigo-900/20">
          
          {/* HEADER */}
          <div className="bg-[#1a1d26] p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1a1d26] rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">ICARUS AI Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Online • Pronto para ajudar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <Maximize2 size={14} />
              </button>
              <button 
                onClick={toggleExpanded}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* CHAT BODY */}
          <ScrollShadow className="h-[400px] bg-[#11131f] p-4 relative">
            {/* Background Effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="flex flex-col gap-4 relative z-10 pb-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[85%]">
                    <div className="bg-[#1e222e] border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-sm">
                      <p className="font-bold text-white mb-2 flex items-center gap-2">
                        👋 Olá, {usuario?.nome_completo || 'Visitante'}!
                      </p>
                      <p className="mb-3 leading-relaxed">
                        Eu sou o <strong className="text-indigo-400">Assistente ICARUS AI</strong>, seu copiloto inteligente para gestão de materiais OPME.
                      </p>
                      <p className="font-medium text-white mb-2">O que posso fazer por você?</p>
                      <p className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5 leading-relaxed">
                        <Paperclip size={12} className="inline mr-1 text-cyan-400" />
                        <strong className="text-cyan-400">NOVO:</strong> Anexe fotos de produtos OPME, embalagens, PDFs com relatos cirúrgicos e prints de tela. Posso ler documentos e gerar justificativas médicas automaticamente!
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-500 ml-1">Agora</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex gap-3'}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'max-w-[85%]'}`}>
                    <div
                      className={
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-md'
                          : 'bg-[#1e222e] border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-sm'
                      }
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-500 ml-1">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-[#1e222e] border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </ScrollShadow>

          {/* SUGGESTIONS & INPUT */}
          <div className="p-4 bg-[#1a1d26] border-t border-white/5 flex flex-col gap-3">
            {/* Suggestions Chips */}
            {messages.length === 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {suggestions.map((sug, i) => (
                  <Chip
                    key={i}
                    as="button"
                    variant="flat"
                    onClick={() => handleSuggestionClick(sug)}
                    className="bg-[#232732] hover:bg-[#2d3240] text-xs text-gray-300 border border-white/5 cursor-pointer transition-colors py-1 h-7"
                  >
                    {sug}
                  </Chip>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-end gap-2 bg-[#11131f] p-2 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-colors shadow-inner">
              <button 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors" 
                title="Anexar arquivo"
                disabled={isLoading}
              >
                <Paperclip size={20} />
              </button>
              
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite, fale ou anexe arquivos..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 resize-none py-2 max-h-24 scrollbar-hide"
                rows={1}
                disabled={isLoading}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />

              <button 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors" 
                title="Comando de voz"
                disabled={isLoading}
              >
                <Mic size={20} />
              </button>

              <Button 
                isIconOnly 
                onClick={sendMessage}
                isDisabled={isLoading || !inputValue.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20" 
                size="sm"
              >
                <Send size={18} />
              </Button>
            </div>

            {/* Footer Info */}
            <div className="text-[9px] text-center text-gray-600 font-medium pt-1">
              Powered by ICARUS AI • 11 serviços integrados • OCR ativado
            </div>
          </div>
        </div>
      )}
    </>
  );
};
