import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, Input, Checkbox } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { Rocket, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Sparkles, Activity } from 'lucide-react';
import { IcarusBrain } from '@/components/icons/IcarusBrain';

export default function Login() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Limpar sessão ao entrar na tela de login
  React.useEffect(() => {
    logout();
  }, [logout]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resultado = await login(email, password);
      if (resultado.sucesso) {
        navigate('/dashboard');
      } else {
        setError(resultado.mensagem);
      }
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#05060b] px-4 py-12 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(99,102,241,0.18),_transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.25] bg-[length:32px_32px] bg-[radial-gradient(circle,_rgba(99,102,241,0.35)_1px,transparent_1px)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#2dd4bf]/30 blur-[180px]" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#6366f1]/25 blur-[200px]" />

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <section className="hidden lg:flex flex-col gap-8 pr-6 text-slate-200">
          <div className="w-fit rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-2xl shadow-[0_20px_60px_rgba(45,212,191,0.15)]">
            <div className="flex items-center gap-3 text-sm font-medium tracking-wide">
              <Sparkles className="text-[#2dd4bf]" size={20} />
              Experience OraclusX / Dark Glass
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-[#2dd4bf]/80">Acesso inteligente</p>
            <h2 className="text-4xl font-semibold text-white leading-snug">
              ICARUS v6.0
              <br />
              <span className="text-[#2dd4bf]">Medical Intelligence Hub</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl">
              Autenticação segura com Supabase Auth, telemetria em tempo real e controles auditáveis
              para o ecossistema médico-corporativo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'Compliance', detail: 'MFA + Auditoria Zero Trust' },
              { icon: IcarusBrain, title: 'IA Contextual', detail: 'Insights assistidos 24/7' },
              { icon: Activity, title: 'Telemetria', detail: 'Monitoring de agentes IA' },
              { icon: Rocket, title: 'Deploy contínuo', detail: 'Pipelines verificados' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                <item.icon className="text-[#2dd4bf] mb-3" size={24} />
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(15,23,42,0.65)] backdrop-blur-2xl">
          <CardBody className="p-10 space-y-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-[#6366f1] flex items-center justify-center shadow-[0_25px_60px_rgba(99,102,241,0.45)]">
                <IcarusBrain className="h-10 w-10" />
              </div>
              <div>
                <p className="text-xs tracking-[0.35em] text-slate-400 uppercase">Portal Médico</p>
                <h1 className="text-2xl font-bold text-white">ICARUS v6.0</h1>
                <p className="text-sm text-slate-400">Autentique-se para acessar o cockpit</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                labelPlacement="outside"
                variant="flat"
                radius="lg"
                value={email}
                onValueChange={setEmail}
                startContent={<Mail className="text-lg text-slate-400" />}
                required
                classNames={{
                  label: 'text-sm font-semibold text-slate-200',
                  inputWrapper:
                    'bg-white/5 border border-white/10 hover:border-[#2dd4bf]/40 focus:border-[#2dd4bf]/60 transition-all text-white',
                  input: 'placeholder:text-slate-500',
                }}
              />

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                labelPlacement="outside"
                variant="flat"
                radius="lg"
                value={password}
                onValueChange={setPassword}
                startContent={<Lock className="text-lg text-slate-400" />}
                endContent={
                  <button
                    className="focus:outline-none text-slate-400 hover:text-white transition-colors"
                    type="button"
                    onClick={toggleVisibility}
                    aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                type={isVisible ? 'text' : 'password'}
                required
                classNames={{
                  label: 'text-sm font-semibold text-slate-200',
                  inputWrapper:
                    'bg-white/5 border border-white/10 hover:border-[#2dd4bf]/40 focus:border-[#2dd4bf]/60 transition-all text-white',
                  input: 'placeholder:text-slate-500',
                }}
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <Checkbox size="sm" className="text-slate-300" radius="sm">
                  Lembrar meu acesso
                </Checkbox>
                <Link
                  to="/reset-password"
                  className="font-semibold text-[#2dd4bf] hover:text-[#2dd4bf]/80 transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                radius="lg"
                className="w-full bg-gradient-to-r from-[#2dd4bf] via-[#31c7d8] to-[#6366f1] text-white font-semibold shadow-[0_25px_60px_rgba(99,102,241,0.35)] hover:opacity-95 transition-opacity"
                isLoading={loading}
                startContent={!loading && <Rocket size={18} />}
              >
                {loading ? 'Validando...' : 'Entrar no Sistema'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500">
              © 2025 Icarus Technology • Supabase Auth • Dark Glass Framework
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
