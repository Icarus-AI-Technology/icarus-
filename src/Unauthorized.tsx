import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

/**
 * Página 403 - Unauthorized (Não Autorizado)
 *
 * DESIGN:
 * - Neuromórfico
 * - Centralizada
 * - Ícone de shield/alerta
 * - Ações claras
 *
 * QUANDO MOSTRAR:
 * - Usuário tenta acessar recurso sem permissão
 * - Usuário não está autenticado (após redirect)
 * - Role/permissão insuficiente
 */

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-2xl w-full">
        <div role="alert" className="neumorphic-card p-8 md:p-12 text-center">
          {/* Ilustração */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full neumorphic-card">
              <ShieldAlert size={64} className="text-warning" />
            </div>
          </div>

          {/* Título */}
          <h1
            className="md:mb-4 text-text-primary-light dark:text-text-primary-dark"
            style={{ fontWeight: 700, fontSize: '0.813rem' }}
          >
            Acesso Não Autorizado
          </h1>

          {/* Descrição */}
          <p
            className="text-text-secondary-light dark:text-text-secondary-dark mb-8"
            style={{ fontSize: '0.813rem' }}
          >
            Você não tem permissão para acessar este recurso.
          </p>

          {/* Motivos Possíveis */}
          <div className="mb-8 p-4 bg-warning/10 dark:bg-warning/10 rounded-lg border border-warning/20">
            <p
              className="text-[var(--text-primary)] mb-2"
              style={{ fontWeight: 500, fontSize: '0.813rem' }}
            >
              Possíveis motivos:
            </p>
            <ul
              className="text-[var(--text-secondary)] text-left list-disc list-inside space-y-1"
              style={{ fontSize: '0.813rem' }}
            >
              <li>Você não está autenticado no sistema</li>
              <li>Sua conta não tem permissão para este módulo</li>
              <li>Seu perfil de usuário precisa ser atualizado</li>
              <li>O recurso está restrito ao seu nível de acesso</li>
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
              <li>Faça login com uma conta autorizada</li>
              <li>Solicite permissão ao administrador do sistema</li>
              <li>Verifique se você está acessando o módulo correto</li>
              <li>Entre em contato com o suporte técnico</li>
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
              <span>Ir para Home</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3
                bg-surface-light dark:bg-surface-dark
                text-text-primary-light dark:text-text-primary-dark
                rounded-lg transition-all duration-200
                shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
                hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]"
            >
              <span>Fazer Login</span>
            </Link>
          </div>

          {/* Link de Suporte */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] dark:border-border">
            <p
              className="text-text-secondary-light dark:text-text-secondary-dark"
              style={{ fontSize: '0.813rem' }}
            >
              Precisa de ajuda ou acredita que isto é um erro?{' '}
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
