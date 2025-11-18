/**
 * Página: Login
 * Autenticação com Supabase
 * Design System: Neumórfico 3D Premium
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { NeumoInput, NeumoButton } from '@/components/oraclusx-ds';
import { Mail, Lock, AlertCircle, Loader2, BrainCircuit } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-orx-bg-app">
      {/* Background Pattern (opcional) */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-orx-bg-surface rounded-2xl shadow-neumo-lg p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orx-primary to-purple-500 shadow-neumo-lg mb-4">
              <BrainCircuit size={40} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold text-orx-text-primary mb-2">
              ICARUS v5.0
            </h1>
            <p className="text-orx-text-secondary font-medium">
              Gestão elevada pela IA
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-orx-text-primary text-sm font-medium mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orx-text-muted" size={20} />
                <NeumoInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-orx-text-primary text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orx-text-muted" size={20} />
                <NeumoInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Link Esqueci Senha */}
            <div className="flex justify-center">
              <Link
                to="/reset-password"
                className="text-sm text-orx-text-secondary hover:text-orx-primary transition-colors font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl shadow-neumo-sm">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Botão Submit */}
            <NeumoButton
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orx-primary to-purple-500 text-white hover:from-orx-primary/90 hover:to-purple-600"
            >
              {loading ? 'Entrando...' : '🚀 Entrar no Sistema'}
            </NeumoButton>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-orx-border-subtle">
            <p className="text-center text-xs text-orx-text-muted">
              © 2025{' '}
              <span className="font-bold bg-gradient-to-r from-orx-primary to-purple-500 bg-clip-text text-transparent">
                Icarus Technology
              </span>
              . Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

