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

import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Building2, CreditCard } from 'lucide-react';
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
  
  useEffect(() => {
    initializeWidget();
  }, []);
  
  const initializeWidget = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (pluggyEnabled) {
        // Modo REAL: Gerar connect token
        const token = await PluggyService.getConnectToken(userId);
        setConnectToken(token.accessToken);
        
        // Inicializar Pluggy Connect Widget
        // @ts-expect-error - SDK será carregado externamente
        if (window.PluggyConnect) {
          // @ts-expect-error
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (_err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar widget';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };
  
  const handlePluggySuccess = (itemData: any) => {
    setSuccess(true);
    onSuccess?.(itemData.item.id);
    
    // Fechar após 2 segundos
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };
  
  const handlePluggyError = (error: any) => {
    const errorMessage = error.message || 'Erro ao conectar banco';
    setError(errorMessage);
    onError?.(new Error(errorMessage));
  };
  
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    } catch (_err) {
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="neumorphic-container"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--orx-gray-100)',
            color: 'var(--orx-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X style={{ width: '1rem', height: '1rem' }} />
        </button>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--orx-primary), var(--orx-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Building2 style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 style={{
            fontSize: '0.813rem',
            fontWeight: 'bold',
            color: 'var(--orx-text-primary)',
            marginBottom: '0.5rem',
          }}>
            Conectar Banco
          </h2>
          <p style={{
            fontSize: '0.813rem',
            color: 'var(--orx-text-secondary)',
          }}>
            {pluggyEnabled 
              ? 'Conecte sua conta bancária de forma segura via Open Finance Brasil'
              : '⚠️ Modo MOCK: Simule a conexão para desenvolvimento'
            }
          </p>
        </div>
        
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Loader2 style={{
              width: '3rem',
              height: '3rem',
              color: 'var(--orx-primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <p style={{ color: 'var(--orx-text-secondary)' }}>
              Inicializando widget...
            </p>
          </div>
        )}
        
        {/* Error */}
        {error && !loading && !success && (
          <div style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            background: 'var(--orx-error-light)',
            border: '1px solid var(--orx-error)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: 'var(--orx-error)',
              flexShrink: 0,
            }} />
            <p style={{
              fontSize: '0.813rem',
              color: 'var(--orx-error-dark)',
            }}>
              {error}
            </p>
          </div>
        )}
        
        {/* Success */}
        {success && (
          <div style={{
            textAlign: 'center',
            padding: '2rem 0',
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'var(--orx-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: 'bold',
              color: 'var(--orx-success)',
              marginBottom: '0.5rem',
            }}>
              Banco Conectado!
            </h3>
            <p style={{
              fontSize: '0.813rem',
              color: 'var(--orx-text-secondary)',
            }}>
              Sincronizando dados...
            </p>
          </div>
        )}
        
        {/* MOCK: Bank Selection */}
        {!pluggyEnabled && !loading && !success && step === 'select' && (
          <div>
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: '600',
              color: 'var(--orx-text-primary)',
              marginBottom: '1rem',
            }}>
              Selecione seu banco
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}>
              {MOCK_BANKS.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => handleSelectBank(bank.id)}
                  className="neumorphic-button"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '0.813rem' }}>{bank.logo}</span>
                  <span style={{
                    fontSize: '0.813rem',
                    fontWeight: '600',
                    color: 'var(--orx-text-primary)',
                    textAlign: 'center',
                  }}>
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.813rem',
                color: 'var(--orx-primary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              ← Voltar
            </button>
            
            <h3 style={{
              fontSize: '0.813rem',
              fontWeight: '600',
              color: 'var(--orx-text-primary)',
              marginBottom: '1rem',
            }}>
              Conectar {MOCK_BANKS.find(b => b.id === selectedBank)?.name}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                fontSize: '0.813rem',
                fontWeight: '600',
                color: 'var(--orx-text-secondary)',
                marginBottom: '0.5rem',
                display: 'block',
              }}>
                Usuário / CPF / Agência
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Digite seu usuário"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-gray-300)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)',
                  fontSize: '0.813rem',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontSize: '0.813rem',
                fontWeight: '600',
                color: 'var(--orx-text-secondary)',
                marginBottom: '0.5rem',
                display: 'block',
              }}>
                Senha
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Digite sua senha"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-gray-300)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)',
                  fontSize: '0.813rem',
                }}
              />
            </div>
            
            <button
              onClick={handleMockConnect}
              className="neumorphic-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                background: 'var(--orx-primary)',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.813rem',
                cursor: 'pointer',
              }}
            >
              Conectar
            </button>
            
            <p style={{
              marginTop: '1rem',
              fontSize: '0.813rem',
              color: 'var(--orx-text-secondary)',
              textAlign: 'center',
            }}>
              🔒 Suas credenciais são criptografadas e protegidas
            </p>
          </div>
        )}
        
        {/* MOCK: Connecting */}
        {!pluggyEnabled && !loading && !success && step === 'connecting' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Loader2 style={{
              width: '3rem',
              height: '3rem',
              color: 'var(--orx-primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <p style={{ color: 'var(--orx-text-secondary)' }}>
              Conectando ao banco...
            </p>
          </div>
        )}
        
        {/* Real mode placeholder */}
        {pluggyEnabled && !loading && !success && !error && (
          <div id="pluggy-connect-container" style={{ minHeight: '400px' }} />
        )}
      </div>
    </div>
  );
};

export default PluggyConnectWidget;

