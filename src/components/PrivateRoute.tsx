/**
 * Component: PrivateRoute
 * Proteção de rotas que requerem autenticação
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { usuario, loading } = useAuth();

  // 🔧 MODO MOCK: Verificar localStorage como fallback
  const isMockAuthenticated =
    localStorage.getItem("icarus_authenticated") === "true";
  const mockUser = localStorage.getItem("icarus_user");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-primary mx-auto mb-4"
          />
          <p className="text-secondary dark:text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  // Aceitar autenticação mock OU autenticação normal
  if (!usuario && !isMockAuthenticated) {
    console.log(
      "🔒 PrivateRoute: Usuário não autenticado - redirecionando para /login",
    );
    return <Navigate to="/login" replace />;
  }

  if (isMockAuthenticated && !usuario) {
    console.log("✅ PrivateRoute: Modo MOCK ativo - acesso permitido");
  }

  return <>{children}</>;
}
