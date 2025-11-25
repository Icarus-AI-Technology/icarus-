// src/hooks/useChatbot.ts
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface ChatbotConversa {
  id: string;
  usuario_id: string;
  data_inicio: string;
  data_fim: string | null;
  status: 'ativa' | 'finalizada' | 'abandonada';
  total_mensagens: number;
  satisfacao_usuario: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatbotMensagem {
  id: string;
  conversa_id: string;
  tipo: 'usuario' | 'assistente' | 'sistema';
  conteudo: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatbotIntencao {
  id: string;
  nome: string;
  categoria: string | null;
  padroes: string[];
  palavras_chave: string[];
  variacoes: string[];
  resposta_padrao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatbotFAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string | null;
  palavras_chave: string[];
  variacoes: string[];
  total_acessos: number;
  ultima_atualizacao: string;
  ativo: boolean;
  created_at: string;
}

interface RespostaIA {
  mensagem: string;
  origem: 'edge' | 'faq';
  modelo?: string;
}

export function useChatbot() {
  const { user } = useAuth();
  const [conversaAtiva, setConversaAtiva] = useState<ChatbotConversa | null>(null);
  const [mensagens, setMensagens] = useState<ChatbotMensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Iniciar nova conversa
  const iniciarConversa = useCallback(async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('chatbot_conversas')
        .insert({
          usuario_id: user.id,
          status: 'ativa',
          total_mensagens: 0,
          metadata: {},
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setConversaAtiva(data);
      setMensagens([]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar conversa';
      setError(message);
      console.error('Erro iniciarConversa:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar mensagens de uma conversa
  const carregarMensagens = useCallback(async (conversaId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('chatbot_mensagens')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('created_at', { ascending: true });

      if (supabaseError) throw supabaseError;

      setMensagens(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar mensagens';
      setError(message);
      console.error('Erro carregarMensagens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar mensagem
  const enviarMensagem = useCallback(
    async (conteudo: string) => {
      if (!conversaAtiva) {
        setError('Nenhuma conversa ativa');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Inserir mensagem do usuário
        const { data: _mensagemUsuario, error: errorUsuario } = await supabase
          .from('chatbot_mensagens')
          .insert({
            conversa_id: conversaAtiva.id,
            tipo: 'usuario',
            conteudo,
            metadata: {},
          })
          .select()
          .single();

        if (errorUsuario) throw errorUsuario;

        // Atualizar total de mensagens
        await supabase
          .from('chatbot_conversas')
          .update({
            total_mensagens: conversaAtiva.total_mensagens + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversaAtiva.id);

        // Buscar resposta da IA (edge function + fallback)
        const respostaIA = await gerarRespostaIA(conteudo);

        // Inserir resposta do assistente
        const { data: mensagemAssistente, error: errorAssistente } = await supabase
          .from('chatbot_mensagens')
          .insert({
            conversa_id: conversaAtiva.id,
            tipo: 'assistente',
            conteudo: respostaIA.mensagem,
            metadata: {
              source: respostaIA.origem,
              model: respostaIA.modelo ?? (respostaIA.origem === 'edge' ? 'ai-tutor-financeiro' : 'faq'),
              confidence: respostaIA.origem === 'edge' ? 0.95 : 0.6,
            },
          })
          .select()
          .single();

        if (errorAssistente) throw errorAssistente;

        // Atualizar total de mensagens novamente
        await supabase
          .from('chatbot_conversas')
          .update({
            total_mensagens: conversaAtiva.total_mensagens + 2,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversaAtiva.id);

        // Recarregar mensagens
        await carregarMensagens(conversaAtiva.id);

        return mensagemAssistente;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(message);
        console.error('Erro enviarMensagem:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [conversaAtiva, carregarMensagens, gerarRespostaIA]
  );

  const buscarRespostaFaq = useCallback(async (pergunta: string): Promise<string | null> => {
    const { data: faqs } = await supabase
      .from('chatbot_faqs')
      .select('*')
      .eq('ativo', true)
      .limit(5);

    if (faqs && faqs.length > 0) {
      // Busca simples por palavras-chave
      const perguntaLower = pergunta.toLowerCase();
      const faqEncontrada = faqs.find((faq) =>
        faq.palavras_chave.some((palavra: string) => perguntaLower.includes(palavra.toLowerCase()))
      );

      if (faqEncontrada) {
        return faqEncontrada.resposta;
      }
    }

    return null;
  }, []);

  // Buscar resposta da IA (edge function + fallback)
  const gerarRespostaIA = useCallback(async (pergunta: string): Promise<RespostaIA> => {
    try {
      const { data, error: edgeError } = await supabase.functions.invoke<{
        info?: string;
        prompt?: string;
        context?: Record<string, unknown>;
      }>('ai-tutor-financeiro', {
        body: {
          prompt: pergunta,
          context: {
            conversaId: conversaAtiva?.id ?? null,
            usuario: user?.email ?? user?.id ?? 'desconhecido',
            origem: 'chatbot-web',
          },
        },
      });

      if (edgeError) throw edgeError;

      const resposta = data?.info ?? data?.prompt;
      if (resposta && typeof resposta === 'string') {
        return {
          mensagem: resposta,
          origem: 'edge',
          modelo: (data?.context?.model as string | undefined) ?? 'anthropic-placeholder',
        };
      }
    } catch (err) {
      console.warn('Edge Function ai-tutor-financeiro indisponível, usando fallback.', err);
    }

    const fallbackResposta = await buscarRespostaFaq(pergunta);
    if (fallbackResposta) {
      return { mensagem: fallbackResposta, origem: 'faq' };
    }

    return { mensagem: 'Desculpe, não encontrei uma resposta para sua pergunta. Um atendente humano entrará em contato em breve.', origem: 'fallback' as const };
  }, [buscarRespostaFaq, conversaAtiva?.id, user?.email, user?.id]);

  // Finalizar conversa
  const finalizarConversa = useCallback(
    async (satisfacao?: number) => {
      if (!conversaAtiva) return;

      try {
        await supabase
          .from('chatbot_conversas')
          .update({
            status: 'finalizada',
            data_fim: new Date().toISOString(),
            satisfacao_usuario: satisfacao || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversaAtiva.id);

        setConversaAtiva(null);
        setMensagens([]);
      } catch (err) {
        console.error('Erro finalizarConversa:', err);
      }
    },
    [conversaAtiva]
  );

  // Buscar FAQs
  const buscarFAQs = useCallback(async (categoria?: string) => {
    try {
      let query = supabase.from('chatbot_faqs').select('*').eq('ativo', true);

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error: supabaseError } = await query
        .order('total_acessos', { ascending: false })
        .limit(20);

      if (supabaseError) throw supabaseError;

      return data || [];
    } catch (err) {
      console.error('Erro buscarFAQs:', err);
      return [];
    }
  }, []);

  // Setup Realtime para mensagens
  useEffect(() => {
    if (!conversaAtiva) return;

    const channel = supabase
      .channel(`chatbot_mensagens:${conversaAtiva.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_mensagens',
          filter: `conversa_id=eq.${conversaAtiva.id}`,
        },
        (payload) => {
          setMensagens((prev) => [...prev, payload.new as ChatbotMensagem]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversaAtiva]);

  return {
    conversaAtiva,
    mensagens,
    loading,
    error,
    iniciarConversa,
    enviarMensagem,
    carregarMensagens,
    finalizarConversa,
    buscarFAQs,
  };
}
