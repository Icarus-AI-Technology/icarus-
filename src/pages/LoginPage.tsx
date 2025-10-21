/**
 * Tela de Login - ICARUS v5.0
 * Design neumórfico com modo escuro
 * Sistema de autenticação customizado
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Validações básicas
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos');
      setCarregando(false);
      return;
    }

    try {
      const resultado = await login(email, senha);

      if (resultado.sucesso) {
        // Redirecionar para dashboard
        navigate('/dashboard');
      } else {
        setErro(resultado.mensagem);
      }
    } catch (error: unknown) {
      setErro(error.message || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Container principal */}
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">I</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ICARUS v5.0</h1>
          <p className="text-slate-400">Sistema de Gestão OPME</p>
        </div>

        {/* Card de Login */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                disabled={carregando}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-slate-200">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
                  disabled={carregando}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  disabled={carregando}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={carregando || loading}
            >
              {carregando ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn size={20} />
                  Entrar
                </div>
              )}
            </Button>

            {/* Credenciais de teste (apenas para desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <p className="text-xs text-slate-400 mb-2 font-semibold">
                  Credenciais de teste:
                </p>
                <p className="text-xs text-slate-500">
                  Email: dax@newortho.com.br
                </p>
                <p className="text-xs text-slate-500">Senha: admin123</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-slate-400 hover:text-slate-200"
                  onClick={() => {
                    setEmail('dax@newortho.com.br');
                    setSenha('admin123');
                  }}
                >
                  Preencher automaticamente
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          © 2025 NEW ORTHO - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

