/**
 * Página: Signup (Cadastro)
 * Registro de novos usuários
 */

import React, { useState } from"react";
import { useNavigate, Link } from"react-router-dom";
import { useAuth } from"@/hooks";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from"@/components/oraclusx-ds";
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from"lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (_err) {
      setError(err instanceof Error ? err.message :"Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="inline-block p-4 bg-success/10 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle size={48} className="text-success dark:text-green-400" />
            </div>
            <h2 className="text-heading font-display text-primary dark:text-inverse mb-2">
              Conta criada com sucesso!
            </h2>
            <p className="text-secondary dark:text-muted mb-4">
              Verifique seu e-mail para confirmar o cadastro.
            </p>
            <p className="text-body-sm text-muted">
              Redirecionando para o login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Criar Conta
          </h1>
          <p className="text-secondary dark:text-muted">
            Comece a usar o Icarus Make hoje
          </p>
        </div>

        {/* Formulário de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastre-se gratuitamente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label htmlFor="fullName" className="block text-body-sm  mb-2" style={{ fontWeight: 500 }}>
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 w-full"
                    placeholder="João Silva"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <p className="text-body-xs text-muted mt-1">
                  Mínimo de 6 caracteres
                </p>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmPassword" className="block text-body-sm  mb-2" style={{ fontWeight: 500 }}>
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>
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
                    Criando conta...
                  </>
                ) : ("Criar conta"
                )}
              </Button>

              {/* Termos */}
              <p className="text-body-xs text-muted text-center">
                Ao criar uma conta, você concorda com nossos{""}
                <Link to="/terms" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{""}
                e{""}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-border"></div>
              </div>
              <div className="relative flex justify-center text-body-sm">
                <span className="px-2 bg-surface dark:bg-card text-muted">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            {/* Link para Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" style={{ fontWeight: 500 }}
              >
                Fazer login
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

