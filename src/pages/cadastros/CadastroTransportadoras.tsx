import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransportadoraFormData {
  nome: string;
  cnpj?: string;
  tipo: 'rodoviario' | 'aereo' | 'courier' | 'multimodal' | '';
  telefone?: string;
  email?: string;
  site?: string;
  prazo_entrega_medio?: number;
  custo_km?: number;
  raio_atendimento?: number;
  horario_coleta?: string;
  possui_api: boolean;
  api_url?: string;
  api_token?: string;
  api_auth_type?: 'bearer' | 'basic' | 'api_key' | 'oauth2' | '';
  avaliacao?: number;
  observacoes?: string;
}

const INITIAL_STATE: TransportadoraFormData = {
  nome: '',
  tipo: '',
  possui_api: false
};

const CadastroTransportadoras: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TransportadoraFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Transportadora salva:', formData);
      navigate('/cadastros');
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao salvar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/cadastros')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--orx-bg-light)',
            border: '1px solid var(--orx-border)',
            borderRadius: '0.5rem',
            color: 'var(--orx-text-primary)',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1 style={{ 
          fontSize: '0.813rem', 
          fontWeight: 'bold',
          color: 'var(--orx-text-primary)',
          marginBottom: '0.5rem'
        }}>
          Cadastro de Transportadoras
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Configure empresas de transporte e logística
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Dados Institucionais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Dados Institucionais
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Nome/Razão Social <span style={{ color: 'var(--orx-error)', fontSize: '0.813rem' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj || ''}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Tipo de Transporte <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TransportadoraFormData['tipo'] })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              >
                <option value="">Selecione...</option>
                <option value="rodoviario">Rodoviário</option>
                <option value="aereo">Aéreo</option>
                <option value="courier">Courier/Motoboy</option>
                <option value="multimodal">Multimodal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Contato
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 3456-7890"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Site
              </label>
              <input
                type="url"
                value={formData.site || ''}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Dados Operacionais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Dados Operacionais
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Prazo Médio Entrega (dias)
              </label>
              <input
                type="number"
                value={formData.prazo_entrega_medio || ''}
                onChange={(e) => setFormData({ ...formData, prazo_entrega_medio: parseInt(e.target.value) })}
                min="0"
                placeholder="Ex: 3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Custo por KM (R$)
              </label>
              <input
                type="number"
                value={formData.custo_km || ''}
                onChange={(e) => setFormData({ ...formData, custo_km: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                placeholder="Ex: 1.50"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Raio de Atendimento (km)
              </label>
              <input
                type="number"
                value={formData.raio_atendimento || ''}
                onChange={(e) => setFormData({ ...formData, raio_atendimento: parseInt(e.target.value) })}
                min="0"
                placeholder="Ex: 100"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Horário de Coleta
              </label>
              <input
                type="text"
                value={formData.horario_coleta || ''}
                onChange={(e) => setFormData({ ...formData, horario_coleta: e.target.value })}
                placeholder="Ex: 8h-17h"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Integração API */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <LinkIcon size={24} />
            Integração API
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.possui_api}
                onChange={(e) => setFormData({ ...formData, possui_api: e.target.checked })}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--orx-text-primary)' }}>Possui API de Integração</span>
            </label>
          </div>

          {formData.possui_api && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                  URL da API
                </label>
                <input
                  type="url"
                  value={formData.api_url || ''}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  placeholder="https://api.transportadora.com.br"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--orx-border)',
                    background: 'var(--orx-bg-light)',
                    color: 'var(--orx-text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                  Token/API Key
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiToken ? 'text' : 'password'}
                    value={formData.api_token || ''}
                    onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '3rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--orx-border)',
                      background: 'var(--orx-bg-light)',
                      color: 'var(--orx-text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiToken(!showApiToken)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--orx-text-secondary)',
                      fontSize: '0.813rem'
                    }}
                  >
                    {showApiToken ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                  Tipo de Autenticação
                </label>
                <select
                  value={formData.api_auth_type || ''}
                onChange={(e) => setFormData({ ...formData, api_auth_type: e.target.value as TransportadoraFormData['api_auth_type'] })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--orx-border)',
                    background: 'var(--orx-bg-light)',
                    color: 'var(--orx-text-primary)'
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api_key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Avaliação */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Avaliação
          </h2>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--orx-text-primary)' }}>
              Avaliação Geral (0-5)
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={formData.avaliacao || 0}
              onChange={(e) => setFormData({ ...formData, avaliacao: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--orx-indigo-500)' }}
            />
            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.813rem', 
              fontWeight: 'bold', 
              color: 'var(--orx-indigo-500)',
              marginTop: '0.5rem'
            }}>
              {(formData.avaliacao || 0).toFixed(1)} ⭐
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Observações
          </h2>
          <textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={4}
            placeholder="Informações adicionais sobre a transportadora..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--orx-border)',
              background: 'var(--orx-bg-light)',
              color: 'var(--orx-text-primary)',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/cadastros')}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--orx-border)',
              background: 'var(--orx-bg-light)',
              color: 'var(--orx-text-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="colored-button"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'var(--orx-indigo-500)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check size={20} />
                Cadastrar Transportadora
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroTransportadoras;

