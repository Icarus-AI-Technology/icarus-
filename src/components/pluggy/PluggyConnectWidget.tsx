/**
 * 🔌 PLUGGY CONNECT WIDGET — COMPONENTE REACT
 *
 * Componente para conectar contas bancárias via Pluggy Connect Widget
 * Funciona em modo MOCK até ter credenciais reais
 *
 * Features:
 * - Modal responsivo com Pluggy Connect Widget
 * - Modo MOCK com simulação de bancos
 * - Loading states
 * - Error handling
 * - Success callback
 * - Dark mode support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { PluggyService } from '@/services/integrations/PluggyService';

interface PluggyConnectWidgetProps {
  userId: string;
  onSuccess?: (itemId: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

// Mock de bancos brasileiros para desenvolvimento
const MOCK_BANKS = [
  { id: 1, name: 'Banco do Brasil', logo: '🏦' },
  { id: 2, name: 'Bradesco', logo: '🏦' },
  { id: 3, name: 'Itaú Unibanco', logo: '🏦' },
  { id: 4, name: 'Caixa Econômica Federal', logo: '🏦' },
  { id: 5, name: 'Santander', logo: '🏦' },
  { id: 6, name: 'Nubank', logo: '💜' },
  { id: 7, name: 'Inter', logo: '🧡' },
  { id: 8, name: 'C6 Bank', logo: '⚫' },
  { id: 9, name: 'Banco Pan', logo: '🏦' },
  { id: 10, name: 'Sicredi', logo: '🏦' },
];

export const PluggyConnectWidget: React.FC<PluggyConnectWidgetProps> = ({
  userId,
  onSuccess,
  onError,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [step, setStep] = useState<'select' | 'credentials' | 'connecting'>('select');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const pluggyEnabled = import.meta.env.VITE_PLUGGY_ENABLED === 'true';

  const handlePluggySuccess = useCallback(
    (itemData: { item: { id: string } }) => {
      setSuccess(true);
      onSuccess?.(itemData.item.id);

      // Fechar após 2 segundos
      setTimeout(() => {
        onClose?.();
      }, 2000);
    },
    [onClose, onSuccess]
  );

  const handlePluggyError = useCallback(
    (error: unknown) => {
      const errorMessage = (error as { message?: string })?.message || 'Erro ao conectar banco';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    },
    [onError]
  );

  const initializeWidget = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (pluggyEnabled) {
        // Modo REAL: Gerar connect token
        const token = await PluggyService.createConnectToken(userId);
        setConnectToken(token.accessToken);

        // Inicializar Pluggy Connect Widget
        // @ts-expect-error Pluggy Connect SDK é injetado via script externo no runtime
        if (window.PluggyConnect) {
          // @ts-expect-error Instância global de PluggyConnect criada pelo SDK externo
          const pluggyConnect = new window.PluggyConnect({
            connectToken: token.accessToken,
            onSuccess: handlePluggySuccess,
            onError: handlePluggyError,
            onClose: onClose,
          });
          pluggyConnect.init();
        } else {
          throw new Error('Pluggy Connect SDK não carregado');
        }
      } else {
        // Modo MOCK: Simular carregamento
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      const err = error as Error;
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar widget';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [pluggyEnabled, userId, onClose, onError, handlePluggyError, handlePluggySuccess]);

  useEffect(() => {
    initializeWidget();
  }, [initializeWidget]);

  // MOCK: Selecionar banco
  const handleSelectBank = (bankId: number) => {
    setSelectedBank(bankId);
    setStep('credentials');
  };

  // MOCK: Conectar banco
  const handleMockConnect = async () => {
    if (!credentials.username || !credentials.password) {
      setError('Preencha usuário e senha');
      return;
    }

    setStep('connecting');
    setError(null);

    try {
      // Simular conexão
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular sucesso aleatório (80% de chance)
      if (Math.random() > 0.2) {
        const mockItemId = `mock-item-${Date.now()}`;
        setSuccess(true);
        onSuccess?.(mockItemId);

        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        throw new Error('Credenciais inválidas (mock)');
      }
    } catch (error) {
      const err = error as Error;
      setError(err instanceof Error ? err.message : 'Erro ao conectar');
      setStep('credentials');
      onError?.(err instanceof Error ? err : new Error('Erro ao conectar'));
    }
  };

  // MOCK: Voltar para seleção
  const handleBack = () => {
    setStep('select');
    setSelectedBank(null);
    setCredentials({ username: '', password: '' });
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="neumorphic-container w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border-0 bg-[var(--orx-gray-100)] text-[var(--orx-text-primary)] cursor-pointer flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[linear-gradient(135deg,var(--orx-primary),var(--orx-secondary))] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-[0.813rem] orx-orx-font-bold text-[var(--orx-text-primary)] mb-2">
            Conectar Banco
          </h2>
          <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
            {pluggyEnabled
              ? 'Conecte sua conta bancária de forma segura via Open Finance Brasil'
              : '⚠️ Modo MOCK: Simule a conexão para desenvolvimento'}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-[var(--orx-primary)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--orx-text-secondary)]">Inicializando widget...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && !success && (
          <div className="p-4 rounded-xl bg-[var(--orx-error-light)] border border-[var(--orx-error)] flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-[var(--orx-error)] shrink-0" />
            <p className="text-[0.813rem] text-[var(--orx-error-dark)]">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[var(--orx-success)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[0.813rem] orx-orx-font-bold text-[var(--orx-success)] mb-2">
              Banco Conectado!
            </h3>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
              Sincronizando dados...
            </p>
          </div>
        )}

        {/* MOCK: Bank Selection */}
        {!pluggyEnabled && !loading && !success && step === 'select' && (
          <div>
            <h3 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4">
              Selecione seu banco
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {MOCK_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleSelectBank(bank.id)}
                  className="neumorphic-button p-4 flex flex-col items-center gap-2 rounded-xl transition-all"
                >
                  <span className="text-[0.813rem]">{bank.logo}</span>
                  <span className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] text-center">
                    {bank.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MOCK: Credentials */}
        {!pluggyEnabled && !loading && !success && step === 'credentials' && (
          <div>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 mb-4 text-[0.813rem] text-[var(--orx-primary)] bg-transparent border-0 cursor-pointer orx-orx-font-semibold"
            >
              ← Voltar
            </button>

            <h3 className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-primary)] mb-4">
              Conectar {MOCK_BANKS.find((b) => b.id === selectedBank)?.name}
            </h3>

            <div className="mb-4">
              <label className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] mb-2 block">
                Usuário / CPF / Agência
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Digite seu usuário"
                className="w-full p-3 rounded-lg border border-[var(--orx-gray-300)] bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem]"
              />
            </div>

            <div className="mb-6">
              <label className="text-[0.813rem] orx-orx-font-semibold text-[var(--orx-text-secondary)] mb-2 block">
                Senha
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Digite sua senha"
                className="w-full p-3 rounded-lg border border-[var(--orx-gray-300)] bg-[var(--orx-bg-light)] text-[var(--orx-text-primary)] text-[0.813rem]"
              />
            </div>

            <button
              onClick={handleMockConnect}
              className="neumorphic-button inline-flex items-center gap-2 w-full p-3 rounded-xl bg-[var(--orx-primary)] text-white orx-orx-font-semibold text-[0.813rem] cursor-pointer"
            >
              Conectar
            </button>

            <p className="mt-4 text-[0.813rem] text-[var(--orx-text-secondary)] text-center">
              🔒 Suas credenciais são criptografadas e protegidas
            </p>
          </div>
        )}

        {/* MOCK: Connecting */}
        {!pluggyEnabled && !loading && !success && step === 'connecting' && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-[var(--orx-primary)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--orx-text-secondary)]">Conectando ao banco...</p>
          </div>
        )}

        {/* Real mode placeholder */}
        {pluggyEnabled && !loading && !success && !error && (
          <div id="pluggy-connect-container" className="min-h-[400px]" />
        )}
      </div>
    </div>
  );
};

export default PluggyConnectWidget;
