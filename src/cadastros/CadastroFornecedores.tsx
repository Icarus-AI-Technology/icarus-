import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface Certificacoes {
  iso9001: boolean;
  iso13485: boolean;
  anvisa: boolean;
  outras?: string;
}

interface FornecedorFormData {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  tipo: 'fabricante' | 'distribuidor' | 'importador' | 'prestador_servicos' | '';
  inscricao_estadual?: string;
  telefone: string;
  email: string;
  site?: string;
  contato_comercial_nome?: string;
  contato_comercial_telefone?: string;
  contato_comercial_email?: string;
  contato_financeiro_nome?: string;
  contato_financeiro_telefone?: string;
  contato_financeiro_email?: string;
  endereco?: Endereco;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  prazo_entrega_medio?: number;
  prazo_pagamento?: number;
  condicoes_pagamento?: string;
  horario_atendimento?: string;
  tempo_resposta_cotacao?: number;
  pedido_minimo?: number;
  aceita_consignacao: boolean;
  faz_entrega: boolean;
  raio_entrega?: number;
  avaliacao_qualidade?: number;
  avaliacao_pontualidade?: number;
  avaliacao_atendimento?: number;
  avaliacao_preco?: number;
  certificacoes?: Certificacoes;
  observacoes?: string;
}

const INITIAL_STATE: FornecedorFormData = {
  razao_social: '',
  cnpj: '',
  tipo: '',
  telefone: '',
  email: '',
  aceita_consignacao: false,
  faz_entrega: false,
  certificacoes: {
    iso9001: false,
    iso13485: false,
    anvisa: false
  }
};

const _ESTADOS = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' }
];

const CadastroFornecedores: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FornecedorFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [_errors, _setErrors] = useState<Record<string, string>>({});

  const _handleCEPChange = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData({
            ...formData,
            endereco: {
              cep: cepLimpo,
              logradouro: data.logradouro || '',
              numero: '',
              complemento: data.complemento || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              uf: data.uf || ''
            }
          });
        }
      } catch (error) {
   const err = error as Error;
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Fornecedor salvo:', formData);
      navigate('/cadastros');
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao salvar:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularAvaliacaoGeral = () => {
    const avaliacoes = [
      formData.avaliacao_qualidade || 0,
      formData.avaliacao_pontualidade || 0,
      formData.avaliacao_atendimento || 0,
      formData.avaliacao_preco || 0
    ];
    const soma = avaliacoes.reduce((acc, val) => acc + val, 0);
    return avaliacoes.some(v => v > 0) ? (soma / avaliacoes.filter(v => v > 0).length) : 0;
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
          Cadastro de Fornecedores
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Preencha os dados do fornecedor
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
                Razão Social <span style={{ color: 'var(--orx-error)', fontSize: '0.813rem' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
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
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.nome_fantasia || ''}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
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
                CNPJ <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                required
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
                Tipo <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as FornecedorFormData['tipo'] })}
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
                <option value="fabricante">Fabricante</option>
                <option value="distribuidor">Distribuidor</option>
                <option value="importador">Importador</option>
                <option value="prestador_servicos">Prestador de Serviços</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Inscrição Estadual
              </label>
              <input
                type="text"
                value={formData.inscricao_estadual || ''}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
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
                Telefone <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
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
                Email <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

          {/* Contatos Específicos */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.813rem', fontWeight: '600', color: 'var(--orx-text-primary)', marginBottom: '1rem' }}>
              Contato Comercial
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <input
                type="text"
                value={formData.contato_comercial_nome || ''}
                onChange={(e) => setFormData({ ...formData, contato_comercial_nome: e.target.value })}
                placeholder="Nome"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
              <input
                type="tel"
                value={formData.contato_comercial_telefone || ''}
                onChange={(e) => setFormData({ ...formData, contato_comercial_telefone: e.target.value })}
                placeholder="Telefone"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
              <input
                type="email"
                value={formData.contato_comercial_email || ''}
                onChange={(e) => setFormData({ ...formData, contato_comercial_email: e.target.value })}
                placeholder="Email"
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

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.813rem', fontWeight: '600', color: 'var(--orx-text-primary)', marginBottom: '1rem' }}>
              Contato Financeiro
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <input
                type="text"
                value={formData.contato_financeiro_nome || ''}
                onChange={(e) => setFormData({ ...formData, contato_financeiro_nome: e.target.value })}
                placeholder="Nome"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
              <input
                type="tel"
                value={formData.contato_financeiro_telefone || ''}
                onChange={(e) => setFormData({ ...formData, contato_financeiro_telefone: e.target.value })}
                placeholder="Telefone"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--orx-border)',
                  background: 'var(--orx-bg-light)',
                  color: 'var(--orx-text-primary)'
                }}
              />
              <input
                type="email"
                value={formData.contato_financeiro_email || ''}
                onChange={(e) => setFormData({ ...formData, contato_financeiro_email: e.target.value })}
                placeholder="Email"
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

        {/* Avaliação */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Avaliação e Performance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {['qualidade', 'pontualidade', 'atendimento', 'preco'].map((tipo) => (
              <div key={tipo}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)', textTransform: 'capitalize' }}>
                  {tipo === 'preco' ? 'Preço' : tipo}
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        const key = (`avaliacao_${tipo}`) as 'avaliacao_qualidade' | 'avaliacao_pontualidade' | 'avaliacao_atendimento' | 'avaliacao_preco';
                        setFormData({ ...formData, [key]: star });
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Star 
                        size={24} 
                        fill={(((formData[("avaliacao_" + tipo) as 'avaliacao_qualidade' | 'avaliacao_pontualidade' | 'avaliacao_atendimento' | 'avaliacao_preco'] ?? 0)) >= star) ? 'var(--orx-warning)' : 'none'}
                        stroke="var(--orx-warning)"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Avaliação Geral
              </label>
              <p style={{ fontSize: '0.813rem', fontWeight: 'bold', color: 'var(--orx-indigo-500)' }}>
                {calcularAvaliacaoGeral().toFixed(1)}
              </p>
              <p style={{ fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>de 5.0 estrelas</p>
            </div>
          </div>
        </div>

        {/* Certificações */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ 
            fontSize: '0.813rem', 
            fontWeight: '600',
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem'
          }}>
            Certificações
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'iso9001', label: 'ISO 9001 (Gestão da Qualidade)' },
              { key: 'iso13485', label: 'ISO 13485 (Dispositivos Médicos)' },
              { key: 'anvisa', label: 'Certificado ANVISA' }
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.certificacoes?.[key as keyof Certificacoes] as boolean || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    certificacoes: { ...formData.certificacoes, [key]: e.target.checked } as Certificacoes
                  })}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--orx-text-primary)' }}>{label}</span>
              </label>
            ))}
            
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--orx-text-primary)' }}>
                Outras Certificações
              </label>
              <textarea
                value={formData.certificacoes?.outras || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  certificacoes: { ...formData.certificacoes, outras: e.target.value } as Certificacoes
                })}
                rows={2}
                placeholder="Liste outras certificações relevantes..."
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
            placeholder="Informações adicionais sobre o fornecedor..."
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
                Cadastrar Fornecedor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroFornecedores;

