/**
 * Página: Login
 * Autenticação com Supabase
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
} from "@/components/oraclusx-ds";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  BrainCircuit,
  LogIn,
} from "lucide-react";

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
      // 🔧 MODO DEMO: Bypass direto para desenvolvimento
      const mockCredentials = [
        { email: "dax@newortho.com.br", password: "Admin@123456!" },
        { email: "dax@newortho.com.br", password: "admin123" },
        { email: "admin@icarus.com", password: "admin123" },
      ];

      const isValidMock = mockCredentials.some(
        (cred) =>
          cred.email.toLowerCase() === email.toLowerCase() &&
          cred.password === password,
      );

      if (isValidMock) {
        console.log("✅ MODO DEMO: Credenciais válidas - login bypass ativo");

        // Criar sessão mock diretamente
        const mockUser = {
          id: "mock-user-" + Date.now(),
          email: email,
          full_name: "Dax Meneghel (DEMO)",
          role: "admin",
          empresa_id: "mock-empresa-001",
          empresa_nome: "NewOrtho DEMO",
        };

        // Salvar no localStorage
        localStorage.setItem("icarus_user", JSON.stringify(mockUser));
        localStorage.setItem("icarus_authenticated", "true");
        localStorage.setItem("icarus_use_mock_auth", "true");

        // Pequeno delay para simular autenticação
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("✅ MODO DEMO: Redirecionando para dashboard...");

        // Redirecionar
        navigate("/dashboard");
        return;
      }

      // Tentar autenticação normal se credenciais diferentes
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      const err = error as Error;
      console.error("❌ Erro no login:", err);

      // Se der erro, mostrar mensagem amigável
      if (err.message?.includes("fetch") || err.message?.includes("Failed")) {
        setError(
          "🔧 Use as credenciais DEMO: dax@newortho.com.br / Admin@123456!",
        );
      } else {
        setError(err instanceof Error ? err.message : "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 orx-bg-gradient-login">
      <div className="w-full max-w-md">
        {/* Formulário de Login */}
        <Card className="orx-glass-card">
          <CardContent>
            {/* Brand Container dentro do card */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "290px",
                  height: "64px",
                  padding: "0 1rem",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                  backdropFilter: "blur(20px) saturate(200%)",
                  WebkitBackdropFilter: "blur(20px) saturate(200%)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  boxShadow: `
                    14px 14px 28px rgba(99, 102, 241, 0.35),
                    -7px -7px 18px rgba(255, 255, 255, 0.08),
                    inset 2px 2px 10px rgba(0, 0, 0, 0.18),
                    inset -2px -2px 10px rgba(255, 255, 255, 0.12),
                    0 10px 40px 0 rgba(31, 38, 135, 0.45)
                  `,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.875rem",
                  transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                }}
              >
                <BrainCircuit
                  size={32}
                  color="#ffffff"
                  strokeWidth={2}
                  style={{ transition: "all 0.3s ease", flexShrink: 0 }}
                />
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontFamily: "var(--orx-font-family)",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  ICARUS v5.0
                </h2>
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "8px",
                marginBottom: "12px",
                color: "#6b7280",
                fontWeight: 700,
              }}
            >
              Gestão elevada pela IA
            </div>

            {/* Banner Modo Mock */}
            <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                🔧 <strong>MODO DEMO ATIVO</strong>
                <br />
                Use:{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  dax@newortho.com.br
                </code>{" "}
                /{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  Admin@123456!
                </code>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-body-sm  mb-2"
                  style={{ fontWeight: 500, color: "#6b7280" }}
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={20}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full text-gray-600"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-body-sm  mb-2"
                  style={{ fontWeight: 500, color: "#6b7280" }}
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={20}
                  />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full text-gray-600"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Link Esqueci Senha */}
              <div className="flex justify-center">
                <Link
                  to="/reset-password"
                  className="text-body-sm"
                  style={{ color: "#6b7280" }}
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/5 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle
                    size={20}
                    className="text-error dark:text-red-400"
                  />
                  <p className="text-body-sm text-error dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Botão Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-gray-200 py-2.5 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>

            {/* Rodapé dentro do card */}
            <p
              className="text-center"
              style={{
                marginTop: "24px",
                color: "#6b7280",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
              }}
            >
              © 2025{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #6366f1 0%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  fontWeight: 700,
                }}
              >
                Icarus Technology
              </span>
              . Todos os direitos reservados.
            </p>
          </CardContent>
        </Card>

        {/* Footer removido (agora dentro do card) */}
      </div>
    </div>
  );
}
