import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

/**
 * Página 404 - Não Encontrado
 *
 * DESIGN:
 * - Neuromórfico
 * - Centralizada
 * - Ilustração visual
 * - Ações rápidas (Voltar, Home, Buscar)
 *
 * ACESSIBILIDADE:
 * - Role=alert para leitores de tela
 * - Texto descritivo
 * - Links claramente marcados
 */

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-2xl w-full">
        <div role="alert" className="neumorphic-card p-8 md:p-12 text-center">
          {/* Ilustração */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full neumorphic-card">
              <span
                className="text-[var(--primary)]"
                style={{ fontWeight: 700, fontSize: '0.813rem' }}
              >
                404
              </span>
            </div>
          </div>

          {/* Título */}
          <h1
            className="md:  mb-4 text-text-primary-light dark:text-text-primary-dark"
            style={{ fontWeight: 700, fontSize: '0.813rem' }}
          >
            Página Não Encontrada
          </h1>

          {/* Descrição */}
          <p
            className="text-text-secondary-light dark:text-text-secondary-dark mb-8"
            style={{ fontSize: '0.813rem' }}
          >
            Desculpe, a página que você está procurando não existe ou foi removida.
          </p>

          {/* Sugestões */}
          <div className="mb-8 p-4 bg-[var(--muted)] dark:bg-card rounded-lg">
            <p
              className="text-text-secondary-light dark:text-text-secondary-dark mb-2"
              style={{ fontSize: '0.813rem' }}
            >
              Possíveis motivos:
            </p>
            <ul
              className="text-text-secondary-light dark:text-text-secondary-dark text-left list-disc list-inside space-y-1"
              style={{ fontSize: '0.813rem' }}
            >
              <li>O link que você clicou está quebrado</li>
              <li>A URL foi digitada incorretamente</li>
              <li>A página foi movida ou excluída</li>
              <li>Você não tem permissão para acessar esta página</li>
            </ul>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                bg-[var(--primary)] text-[var(--primary-foreground)]
                rounded-lg transition-all duration-200
                shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
                hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]"
            >
              <Home size={20} />
              <span>Ir para o Início</span>
            </Link>

            <Link
              to="/modules"
              className="inline-flex items-center gap-2 px-6 py-3
                bg-surface-light dark:bg-surface-dark
                text-text-primary-light dark:text-text-primary-dark
                rounded-lg transition-all duration-200
                shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
                hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]"
            >
              <Search size={20} />
              <span>Ver Módulos</span>
            </Link>
          </div>

          {/* Link de Suporte */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] dark:border-border">
            <p
              className="text-text-secondary-light dark:text-text-secondary-dark"
              style={{ fontSize: '0.813rem' }}
            >
              Precisa de ajuda?{''}
              <Link to="/configuracoes" className="text-[var(--primary)] hover:underline">
                Entre em contato com o suporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
