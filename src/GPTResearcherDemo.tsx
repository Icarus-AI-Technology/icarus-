/**
 * Página de Demonstração - GPT Researcher
 * Demonstra a integração completa do chatbot com pesquisa
 */

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/oraclusx-ds';
import { ChatbotWithResearch } from '@/components/oraclusx-ds';
import { Search, MessageSquare, TrendingUp, Zap } from 'lucide-react';
import { useDocumentTitle } from '@/hooks';

export default function GPTResearcherDemo() {
  useDocumentTitle('GPT Researcher Demo');
  const [mensagensEnviadas, setMensagensEnviadas] = useState<string[]>([]);

  const handleMessageSent = (message: string) => {
    console.log('Mensagem enviada:', message);
    setMensagensEnviadas((prev) => [...prev, message]);
  };

  const features = [
    {
      icon: Search,
      title: 'Pesquisa Profunda',
      description: 'Pesquisa web avançada com múltiplas fontes e citações automáticas',
      color: 'blue',
    },
    {
      icon: MessageSquare,
      title: 'Interface Intuitiva',
      description: 'Chat interativo com histórico de mensagens e indicadores visuais',
      color: 'green',
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Customizados',
      description: 'Diferentes tipos de relatórios: pesquisa, detalhado e recursos',
      color: 'indigo',
    },
    {
      icon: Zap,
      title: 'Tempo Real',
      description: 'Resultados em tempo real com logs detalhados do processo',
      color: 'purple',
    },
  ];

  const exemplos = [
    'Quais são as tendências de IA em 2025?',
    'Como funciona a tecnologia blockchain?',
    'Melhores práticas de segurança web',
    'Análise de mercado de computação quântica',
    'Comparação entre frameworks JavaScript modernos',
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900">
              <Search className="w-8 h-8 text-primary dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-display font-display text-primary dark:text-gray-100">
                GPT Researcher
              </h1>
              <p className="text-secondary dark:text-muted">Assistente de Pesquisa Inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 dark:bg-green-900 rounded-full inline-flex">
            <span className="w-2 h-2 bg-success/50 rounded-full animate-pulse" />
            <span
              className="text-body-sm  text-green-800 dark:text-green-200"
              style={{ fontWeight: 500 }}
            >
              Integração Completa
            </span>
          </div>
        </header>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-accent dark:text-accent-light',
              green: 'bg-success/10 dark:bg-green-900/30 text-success dark:text-green-400',
              indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-primary dark:text-indigo-400',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            };

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div
                    className={`inline-flex p-3 rounded-lg mb-3 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-primary dark:text-gray-100 mb-2" style={{ fontWeight: 500 }}>
                    {feature.title}
                  </h3>
                  <p className="text-body-sm text-secondary dark:text-muted">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Como Usar */}
          <Card>
            <CardHeader>
              <CardTitle>Como Usar</CardTitle>
              <CardDescription>Comece a pesquisar em 3 passos simples</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-inverse flex items-center justify-center text-body-sm font-display">
                    1
                  </span>
                  <div>
                    <strong className="block text-primary dark:text-gray-100">
                      Clique no botão do chat
                    </strong>
                    <span className="text-body-sm text-secondary dark:text-muted">
                      Localizado no canto inferior direito da tela
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-inverse flex items-center justify-center text-body-sm font-display">
                    2
                  </span>
                  <div>
                    <strong className="block text-primary dark:text-gray-100">
                      Digite sua pergunta
                    </strong>
                    <span className="text-body-sm text-secondary dark:text-muted">
                      Seja específico para melhores resultados
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-inverse flex items-center justify-center text-body-sm font-display">
                    3
                  </span>
                  <div>
                    <strong className="block text-primary dark:text-gray-100">
                      Receba a resposta
                    </strong>
                    <span className="text-body-sm text-secondary dark:text-muted">
                      Com fontes e referências automáticas
                    </span>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Exemplos de Pesquisa */}
          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Pesquisa</CardTitle>
              <CardDescription>Tente estas perguntas para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exemplos.map((exemplo, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface dark:bg-card hover:bg-surface dark:hover:bg-gray-700 transition-colors cursor-pointer text-body-sm"
                  >
                    <span className="text-primary dark:text-indigo-400 mr-2">→</span>
                    {exemplo}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Pesquisas */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pesquisas</CardTitle>
            <CardDescription>
              {mensagensEnviadas.length} pesquisa(s) realizada(s) nesta sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mensagensEnviadas.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto text-muted mb-3" />
                <p className="text-secondary dark:text-muted">Nenhuma pesquisa realizada ainda</p>
                <p className="text-body-sm text-muted dark:text-muted mt-1">
                  Clique no botão do chat para começar
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mensagensEnviadas.map((msg, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface dark:bg-card"
                  >
                    <span className="flex-shrink-0 text-primary dark:text-indigo-400 font-mono text-body-xs">
                      #{idx + 1}
                    </span>
                    <p className="text-body-sm text-secondary dark:text-muted">{msg}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
          <h3
            className="text-body-lg  text-indigo-900 dark:text-indigo-100 mb-2"
            style={{ fontWeight: 500 }}
          >
            ⚠️ Importante: Configuração do Servidor
          </h3>
          <p className="text-body-sm text-indigo-800 dark:text-indigo-200 mb-3">
            Para usar o GPT Researcher, você precisa ter o servidor rodando em{''}
            <code className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded">
              http://localhost:8000
            </code>
          </p>
          <div className="bg-surface dark:bg-background rounded-lg p-4 font-mono text-body-xs">
            <div className="text-secondary dark:text-muted mb-1"># Opção 1: Docker</div>
            <code className="text-primary dark:text-gray-100">
              docker run -p 8000:8000 -e OPENAI_API_KEY=sua_chave gptresearcher/gpt-researcher
            </code>
            <div className="text-secondary dark:text-muted mt-3 mb-1"># Opção 2: Python</div>
            <code className="text-primary dark:text-gray-100">
              pip install gpt-researcher && python -m gpt_researcher.server --port 8000
            </code>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <ChatbotWithResearch
        position="bottom-right"
        researcherHost="http://localhost:8000"
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
