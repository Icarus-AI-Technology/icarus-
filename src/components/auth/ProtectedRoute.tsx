/**
 * Componente de Proteção de Rotas
 * Restringe acesso baseado em autenticação e permissões
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  permissaoNecessaria?: string;
  recursoNecessario?: { recurso: string; acao?: string };
}

/**
 * Protege rotas que requerem autenticação e/ou permissões específicas
 */
export function ProtectedRoute({
  children,
  permissaoNecessaria,
  recursoNecessario,
}: ProtectedRouteProps) {
  const { usuario, loading, temPermissao, temAcessoRecurso } = useAuth();
  const location = useLocation();

  // Aguardar carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permissão específica
  if (permissaoNecessaria && !temPermissao(permissaoNecessaria)) {
    return <AcessoNegado tipo="permissao" nome={permissaoNecessaria} />;
  }

  // Verificar acesso a recurso específico
  if (recursoNecessario) {
    const { recurso, acao } = recursoNecessario;
    if (!temAcessoRecurso(recurso, acao)) {
      return <AcessoNegado tipo="recurso" nome={`${recurso}/${acao || 'any'}`} />;
    }
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}

/**
 * Tela de Acesso Negado
 */
function AcessoNegado({ tipo, nome }: { tipo: string; nome: string }) {
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full">
        <Alert className="bg-red-900/20 border-red-900/50">
          <Shield className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-400 orx-text-lg mb-2">Acesso Negado</AlertTitle>
          <AlertDescription className="text-slate-300 space-y-2">
            <p>Você não tem permissão para acessar este recurso.</p>
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg orx-text-sm">
              <p className="text-slate-400">
                <strong>Usuário:</strong> {usuario?.nome_completo}
              </p>
              <p className="text-slate-400">
                <strong>Cargo:</strong> {usuario?.cargo}
              </p>
              <p className="text-slate-400">
                <strong>Tipo:</strong> {tipo}
              </p>
              <p className="text-slate-400">
                <strong>Recurso:</strong> {nome}
              </p>
            </div>
            <p className="text-slate-500 orx-text-xs mt-4">
              Entre em contato com o administrador do sistema para solicitar acesso.
            </p>
          </AlertDescription>
        </Alert>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Voltar para o Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook para verificar permissões em componentes
 */
export function usePermissao(codigo: string): boolean {
  const { temPermissao } = useAuth();
  return temPermissao(codigo);
}

/**
 * Hook para verificar acesso a recursos
 */
export function useAcessoRecurso(recurso: string, acao?: string): boolean {
  const { temAcessoRecurso } = useAuth();
  return temAcessoRecurso(recurso, acao);
}

/**
 * Componente condicional baseado em permissão
 * Renderiza children apenas se o usuário tiver a permissão
 */
export function ComPermissao({
  codigo,
  children,
  fallback,
}: {
  codigo: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const temPermissao = usePermissao(codigo);

  if (!temPermissao) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * Componente condicional baseado em acesso a recurso
 * Renderiza children apenas se o usuário tiver acesso
 */
export function ComAcessoRecurso({
  recurso,
  acao,
  children,
  fallback,
}: {
  recurso: string;
  acao?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const temAcesso = useAcessoRecurso(recurso, acao);

  if (!temAcesso) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
