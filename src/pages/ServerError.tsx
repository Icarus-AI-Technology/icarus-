import { Link } from 'react-router-dom';
import { ServerCrash, Home, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * Página 500 - Server Error (Erro do Servidor)
 *
 * DESIGN:
 * - Neuromórfico
 * - Centralizada
 * - Ícone de servidor com erro
 * - Ações de recuperação
 *
 * QUANDO MOSTRAR:
 * - Erro inesperado do servidor
 * - Erro de API/Backend
 * - Exceções não tratadas
 * - Timeout de requisição
 */

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-2xl w-full">
        <div role="alert" className="neumorphic-card p-8 md:p-12 text-center">
          {/* Ilustração */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full neumorphic-card">
              <ServerCrash size={64} className="text-[var(--destructive)]" />
            </div>
          </div>

          {/* Título */}
          <h1
            className="md:  mb-4 text-text-primary-light dark:text-text-primary-dark"
            style={{ fontWeight: 700, fontSize: '0.813rem' }}
          >
            Erro no Servidor
          </h1>

          {/* Descrição */}
          <p
            className="text-text-secondary-light dark:text-text-secondary-dark mb-8"
            style={{ fontSize: '0.813rem' }}
          >
            Ocorreu um erro inesperado. Nossos técnicos já foram notificados e estão trabalhando
            para resolver.
          </p>

          {/* Detalhes do Erro */}
          <div className="mb-8 p-4 bg-destructive/5 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p
              className="text-red-800 dark:text-red-200 mb-2"
              style={{ fontWeight: 500, fontSize: '0.813rem' }}
            >
              O que aconteceu:
            </p>
            <ul
              className="text-red-700 dark:text-red-300 text-left list-disc list-inside space-y-1"
              style={{ fontSize: '0.813rem' }}
            >
              <li>O servidor encontrou uma condição inesperada</li>
              <li>A requisição não pôde ser processada</li>
              <li>Um erro técnico impediu a operação</li>
              <li>O sistema está temporariamente indisponível</li>
            </ul>
          </div>

          {/* O que fazer */}
          <div className="mb-8 p-4 bg-[var(--accent)]/10 dark:bg-[var(--accent)]/10 rounded-lg border border-[var(--accent)]/20">
            <p
              className="text-[var(--text-primary)] mb-2"
              style={{ fontWeight: 500, fontSize: '0.813rem' }}
            >
              O que você pode fazer:
            </p>
            <ul
              className="text-[var(--text-secondary)] text-left list-decimal list-inside space-y-1"
              style={{ fontSize: '0.813rem' }}
            >
              <li>Tente recarregar a página</li>
              <li>Aguarde alguns minutos e tente novamente</li>
              <li>Verifique sua conexão com a internet</li>
              <li>Se o problema persistir, entre em contato com o suporte</li>
            </ul>
          </div>

          {/* Código do Erro (opcional) */}
          <div
            className="mb-8 p-3 bg-[var(--muted)] dark:bg-card rounded font-mono  text-[var(--text-secondary)]"
            style={{ fontSize: '0.813rem' }}
          >
            Código do erro: <span style={{ fontWeight: 700 }}>500</span> | Timestamp:{' '}
            <span style={{ fontWeight: 700 }}>{new Date().toLocaleString('pt-BR')}</span>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3
                bg-[var(--primary)] text-[var(--primary-foreground)]
                rounded-lg transition-all duration-200
                shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
                hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]"
            >
              <RefreshCw size={20} />
              <span style={{ fontSize: '0.813rem' }}>Recarregar Página</span>
            </button>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3
                bg-surface-light dark:bg-surface-dark
                text-text-primary-light dark:text-text-primary-dark
                rounded-lg transition-all duration-200
                shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
                hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]"
            >
              <ArrowLeft size={20} />
              <span style={{ fontSize: '0.813rem' }}>Voltar</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3
                bg-surface-light dark:bg-surface-dark
                text-text-primary-light dark:text-text-primary-dark
                rounded-lg transition-all duration-200
                shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
                hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]"
            >
              <Home size={20} />
              <span>Ir para Home</span>
            </Link>
          </div>

          {/* Link de Suporte */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] dark:border-border">
            <p
              className="text-text-secondary-light dark:text-text-secondary-dark"
              style={{ fontSize: '0.813rem' }}
            >
              O problema continua?{''}
              <Link to="/configuracoes" className="text-[var(--primary)] hover:underline">
                Reporte o erro ao suporte técnico
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
