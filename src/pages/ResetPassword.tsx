/**
 * Página: Reset de Senha
 * Envia e-mail de redefinição via Supabase Auth
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Input } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
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
        <Card className="orx-glass-card p-6">
          <CardBody>
            <div className="text-center mb-4" style={{ color: 'var(--orx-text-secondary)' }}>
              <h1
                className="font-display"
                style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}
              >
                Redefinir senha
              </h1>
              <p className="mt-1" style={{ fontWeight: 500 }}>
                Informe seu e-mail para receber o link
              </p>
            </div>

            {sent ? (
              <div
                className="flex flex-col items-center gap-2 text-center"
                style={{ color: 'var(--orx-text-secondary)' }}
              >
                <CheckCircle2 size={28} className="text-green-500" />
                <p>E-mail enviado para {email}. Verifique sua caixa de entrada.</p>
                <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <Input
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onValueChange={setEmail}
                  startContent={<Mail className="text-default-400" size={20} />}
                  variant="bordered"
                  required
                />

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full bg-primary text-white font-semibold"
                >
                  {loading ? 'Enviando...' : 'Enviar link'}
                </Button>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-primary text-sm hover:underline" style={{ fontWeight: 600 }}>
                    Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
