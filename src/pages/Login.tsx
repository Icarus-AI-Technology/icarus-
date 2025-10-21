/**
 * Página: Login
 * Autenticação com Supabase
 */

import React, { useState } from"react";
import { useNavigate, Link } from"react-router-dom";
import { useAuth } from"@/hooks";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from"@/components/oraclusx-ds";
import { Mail, Lock, AlertCircle, Loader2 } from"lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (_err) {
      setError(err instanceof Error ? err.message :"Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary rounded-full mb-4">
            <svg
              className="w-12 h-12 text-inverse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-heading-lg font-display text-primary dark:text-inverse mb-2">
            Icarus Make
          </h1>
          <p className="text-secondary dark:text-muted">
            Sistema de Gestão Cirúrgica OPME
          </p>
        </div>

        {/* Formulário de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Entrar na sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-body-sm  mb-2" style={{ fontWeight: 500 }}>
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-body-sm  mb-2" style={{ fontWeight: 500 }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Link Esqueci Senha */}
              <div className="flex justify-end">
                <Link
                  to="/reset-password"
                  className="text-body-sm text-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/5 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle size={20} className="text-error dark:text-red-400" />
                  <p className="text-body-sm text-error dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Botão Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary text-inverse py-2.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Entrando...
                  </>
                ) : ("Entrar"
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-border"></div>
              </div>
              <div className="relative flex justify-center text-body-sm">
                <span className="px-2 bg-surface dark:bg-card text-muted">
                  Novo no Icarus?
                </span>
              </div>
            </div>

            {/* Link para Cadastro */}
            <div className="text-center">
              <Link
                to="/signup"
                className="text-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" style={{ fontWeight: 500 }}
              >
                Criar uma conta
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-body-sm text-secondary dark:text-muted mt-8">
          © 2025 Icarus Make. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

