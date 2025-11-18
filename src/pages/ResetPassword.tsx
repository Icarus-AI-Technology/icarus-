/**
 * Página: Reset de Senha
 * Envia e-mail de redefinição via Supabase Auth
 */

import React, { useState } from"react";
import { Link } from"react-router-dom";
import { Card, CardContent, Button, Input } from"@/components/oraclusx-ds";
import { Mail, Loader2, CheckCircle2 } from"lucide-react";
import { supabase } from"@/lib/supabase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/login`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      const message = (err as Error)?.message || 'Não foi possível enviar o e-mail.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 orx-bg-gradient-login">
      <div className="w-full max-w-md">
        <Card className="orx-glass-card">
          <CardContent>
            <div className="text-center mb-4" style={{ color: 'var(--orx-text-secondary)' }}>
              <h1 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Redefinir senha</h1>
              <p className="mt-1" style={{ fontWeight: 500 }}>Informe seu e-mail para receber o link</p>
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-2 text-center" style={{ color: 'var(--orx-text-secondary)' }}>
                <CheckCircle2 size={28} className="text-green-500" />
                <p>E-mail enviado para {email}. Verifique sua caixa de entrada.</p>
                <Link to="/login" className="orx-contrast-link" style={{ fontWeight: 600 }}>Voltar ao login</Link>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-body-sm mb-2" style={{ fontWeight: 500, color: 'var(--orx-text-secondary)' }}>E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
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

                {error && (
                  <div className="text-red-500 text-body-sm">{error}</div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary text-gray-200 py-2.5 flex items-center justify-center gap-2">
                  {loading ? (<><Loader2 size={18} className="animate-spin" /> Enviando...</>) : 'Enviar link' }
                </Button>

                <div className="text-center">
                  <Link to="/login" className="orx-contrast-link" style={{ fontWeight: 600 }}>Voltar ao login</Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


