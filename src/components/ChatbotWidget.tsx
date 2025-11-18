// src/components/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { Button } from './oraclusx-ds/Button';
import { Input } from './oraclusx-ds/Input';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversaAtiva,
    mensagens,
    loading,
    iniciarConversa,
    enviarMensagem,
    finalizarConversa
  } = useChatbot();

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Abrir chat e iniciar conversa
  const handleOpen = async () => {
    setIsOpen(true);
    if (!conversaAtiva) {
      await iniciarConversa();
    }
  };

  // Fechar chat e finalizar conversa
  const handleClose = () => {
    setIsOpen(false);
    if (conversaAtiva) {
      finalizarConversa();
    }
  };

  // Enviar mensagem
  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const message = inputMessage;
    setInputMessage('');
    await enviarMensagem(message);
  };

  // Pressionar Enter para enviar
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white dark:bg-[#1a1d29] rounded-2xl shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-14 w-80' : 'h-[600px] w-96'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
              <div>
                <h3 className="font-semibold text-white orx-text-base">
                  Assistente ICARUS
                </h3>
                <p className="orx-text-xs text-white/80">
                  Online • Responde em segundos
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
              >
                {isMinimized ? (
                  <Maximize2 className="h-5 w-5 text-white" />
                ) : (
                  <Minimize2 className="h-5 w-5 text-white" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fechar chat"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0f1117]">
                {mensagens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-[#6366F1]/10 flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-[#6366F1]" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 orx-text-base">
                      Olá! Como posso ajudar?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 orx-text-sm">
                      Pergunte sobre cirurgias, estoque, produtos ou qualquer dúvida sobre o sistema.
                    </p>
                  </div>
                ) : (
                  mensagens.map((mensagem) => (
                    <div
                      key={mensagem.id}
                      className={`flex ${
                        mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          mensagem.tipo === 'usuario'
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-white dark:bg-[#1a1d29] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="orx-text-sm whitespace-pre-wrap">
                          {mensagem.conteudo}
                        </p>
                        <span
                          className={`orx-text-xs mt-1 block ${
                            mensagem.tipo === 'usuario'
                              ? 'text-white/70'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#1a1d29] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1d29]">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      disabled={loading}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || loading}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="mt-2 orx-text-xs text-gray-500 dark:text-gray-400 text-center">
                  Powered by GPT-4 • ICARUS v5.0
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

