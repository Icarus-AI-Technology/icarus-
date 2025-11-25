/**
 * Exemplo de Uso - GPT Researcher
 * Demonstra como usar o chatbot com pesquisa no Icarus
 */

import React, { useMemo, useState } from 'react';
import { ChatbotWithResearch } from '@/components/oraclusx-ds';
import { useGPTResearcher } from '@/hooks/useGPTResearcher';

/**
 * Exemplo 1: Uso básico
 * Chatbot com pesquisa em posição padrão
 */
export function ExemploBasico() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-heading-lg font-display mb-4">Exemplo Básico - GPT Researcher</h1>
      <p className="text-secondary mb-8">O chatbot aparecerá no canto inferior direito da tela.</p>

      {/* Chatbot com configuração padrão */}
      <ChatbotWithResearch />
    </div>
  );
}

/**
 * Exemplo 2: Uso com callback e configuração customizada
 */
export function ExemploAvancado() {
  const [historico, setHistorico] = React.useState<string[]>([]);

  const handleMessageSent = (message: string) => {
    console.log('Mensagem enviada:', message);
    setHistorico((prev) => [...prev, message]);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-heading-lg font-display mb-4">Exemplo Avançado - GPT Researcher</h1>

      <div className="mb-8">
        <h2 className="text-heading-sm mb-2" style={{ fontWeight: 500 }}>
          Histórico de Pesquisas
        </h2>
        <div className="bg-surface dark:bg-card rounded-lg p-4">
          {historico.length === 0 ? (
            <p className="text-muted">Nenhuma pesquisa realizada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {historico.map((msg, idx) => (
                <li key={idx} className="text-body-sm">
                  {idx + 1}. {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chatbot com configuração customizada */}
      <ChatbotWithResearch
        position="bottom-left"
        researcherHost="http://localhost:8000"
        onMessageSent={handleMessageSent}
        className="custom-chatbot"
      />
    </div>
  );
}

/**
 * Exemplo 3: Uso com o hook useGPTResearcher
 */
interface PesquisaResultado {
  content: string;
  output?: string;
  metadata?: Record<string, unknown>;
}

export function ExemploComHook() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<PesquisaResultado[]>([]);

  const { isConnected, isResearching, logs, error, research } = useGPTResearcher({
    host: 'http://localhost:8000',
    onLog: (data) => {
      if (data.content === 'research_complete') {
        const output = typeof data.output === 'string' ? data.output : '';
        setResultados((prev: PesquisaResultado[]) => [
          ...prev,
          { content: output || 'Pesquisa concluída', output, metadata: data.metadata },
        ]);
      }
    },
  });

  const handlePesquisar = async () => {
    if (!query.trim()) return;

    await research({
      task: query,
      reportType: 'research_report',
      reportSource: 'web',
    });
  };

  const logsFormatados = useMemo(
    () =>
      logs.map((log, idx) => (
        <div key={idx} className="text-body-xs mb-1 font-mono">
          <span className="text-muted">[{log.content}]</span> {log.output}
        </div>
      )),
    [logs]
  );

  const resultadosRenderizados = useMemo(
    () =>
      resultados.map((resultado, idx) => (
        <div key={idx} className="bg-surface dark:bg-card rounded-lg p-4 shadow">
          <p className="whitespace-pre-wrap">{resultado.output ?? resultado.content}</p>
        </div>
      )),
    [resultados]
  );

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-heading-lg font-display mb-4">Exemplo com Hook - GPT Researcher</h1>

      {/* Status de Conexão */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isConnected
              ? 'bg-success/10 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-destructive/10 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success/50' : 'bg-destructive/50'}`}
          />
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
      </div>

      {/* Campo de Pesquisa */}
      <div className="mb-8">
        <label className="block text-body-sm mb-2" style={{ fontWeight: 500 }}>
          Digite sua pergunta de pesquisa:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePesquisar()}
            placeholder="Ex: Quais são as tendências de IA em 2025?"
            disabled={isResearching || !isConnected}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-border bg-surface dark:bg-card"
          />
          <button
            onClick={handlePesquisar}
            disabled={isResearching || !isConnected || !query.trim()}
            className={`px-6 py-2 rounded-lg orx-orx-font-medium ${
              isResearching || !isConnected || !query.trim()
                ? 'bg-gray-300 text-muted cursor-not-allowed'
                : 'bg-primary text-inverse hover:bg-primary'
            }`}
          >
            {isResearching ? 'Pesquisando...' : 'Pesquisar'}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-heading-sm mb-2" style={{ fontWeight: 500 }}>
            Logs de Pesquisa
          </h2>
          <div className="bg-surface dark:bg-card rounded-lg p-4 max-h-64 overflow-y-auto">
            {logsFormatados}
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div>
          <h2 className="text-heading-sm mb-2" style={{ fontWeight: 500 }}>
            Resultados
          </h2>
          <div className="space-y-4">{resultadosRenderizados}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo 4: Integração com módulo existente
 */
export function ExemploIntegracaoModulo() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-heading-lg font-display mb-4">ChatBot Metrics com GPT Researcher</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface dark:bg-card rounded-lg p-6 shadow">
          <h3 className="text-body-lg mb-2" style={{ fontWeight: 500 }}>
            Métricas do ChatBot
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Conversas hoje:</span>
              <strong>152</strong>
            </div>
            <div className="flex justify-between">
              <span>Pesquisas realizadas:</span>
              <strong>48</strong>
            </div>
            <div className="flex justify-between">
              <span>Taxa de satisfação:</span>
              <strong>94%</strong>
            </div>
          </div>
        </div>

        <div className="bg-surface dark:bg-card rounded-lg p-6 shadow">
          <h3 className="text-body-lg mb-2" style={{ fontWeight: 500 }}>
            Pesquisas Populares
          </h3>
          <ul className="space-y-1 text-body-sm">
            <li>• Tendências de IA em 2025</li>
            <li>• Como funciona blockchain</li>
            <li>• Melhores práticas de segurança</li>
          </ul>
        </div>
      </div>

      {/* Chatbot integrado */}
      <ChatbotWithResearch position="bottom-right" researcherHost="http://localhost:8000" />
    </div>
  );
}

export default {
  ExemploBasico,
  ExemploAvancado,
  ExemploComHook,
  ExemploIntegracaoModulo,
};
