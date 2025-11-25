import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Star, Building, Phone, Award, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/oraclusx-ds/Button';
import { Input } from '@/components/oraclusx-ds/Input';
import { Select } from '@/components/oraclusx-ds/Select';

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
    anvisa: false,
  },
};

const _ESTADOS = [
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
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
              uf: data.uf || '',
            },
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
      formData.avaliacao_preco || 0,
    ];
    const soma = avaliacoes.reduce((acc, val) => acc + val, 0);
    return avaliacoes.some((v) => v > 0) ? soma / avaliacoes.filter((v) => v > 0).length : 0;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/cadastros')}
            variant="ghost"
            className="p-3 rounded-lg flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-[0.813rem] font-bold text-[var(--orx-text-primary)]">
              Cadastro de Fornecedores
            </h1>
            <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mt-1">
              Preencha os dados do fornecedor
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Institucionais */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Building size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              Dados Institucionais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-full md:col-span-1">
              <Input
                variant="neumo"
                label="Razão Social *"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                placeholder="Razão Social Ltda"
              />
            </div>

            <div className="col-span-full md:col-span-1">
              <Input
                variant="neumo"
                label="Nome Fantasia"
                value={formData.nome_fantasia || ''}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                placeholder="Nome Fantasia"
              />
            </div>

            <div className="col-span-full md:col-span-1">
              <Input
                variant="neumo"
                label="CNPJ *"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="col-span-full md:col-span-1">
              <Select
                label="Tipo *"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value as FornecedorFormData['tipo'] })
                }
                options={[
                  { value: 'fabricante', label: 'Fabricante' },
                  { value: 'distribuidor', label: 'Distribuidor' },
                  { value: 'importador', label: 'Importador' },
                  { value: 'prestador_servicos', label: 'Prestador de Serviços' },
                ]}
              />
            </div>

            <div className="col-span-full md:col-span-1">
              <Input
                variant="neumo"
                label="Inscrição Estadual"
                value={formData.inscricao_estadual || ''}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                placeholder="Isento ou número"
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Phone size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Input
                variant="neumo"
                label="Telefone *"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 3456-7890"
              />
            </div>

            <div>
              <Input
                variant="neumo"
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@fornecedor.com"
              />
            </div>

            <div>
              <Input
                variant="neumo"
                label="Site"
                type="url"
                value={formData.site || ''}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Contatos Específicos */}
          <div className="mt-6">
            <h3 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)] mb-4">
              Contato Comercial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                variant="neumo"
                label="Nome"
                value={formData.contato_comercial_nome || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contato_comercial_nome: e.target.value })
                }
                placeholder="Nome"
              />
              <Input
                variant="neumo"
                label="Telefone"
                type="tel"
                value={formData.contato_comercial_telefone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contato_comercial_telefone: e.target.value })
                }
                placeholder="Telefone"
              />
              <Input
                variant="neumo"
                label="Email"
                type="email"
                value={formData.contato_comercial_email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contato_comercial_email: e.target.value })
                }
                placeholder="Email"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)] mb-4">
              Contato Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                variant="neumo"
                label="Nome"
                value={formData.contato_financeiro_nome || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contato_financeiro_nome: e.target.value })
                }
                placeholder="Nome"
              />
              <Input
                variant="neumo"
                label="Telefone"
                type="tel"
                value={formData.contato_financeiro_telefone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contato_financeiro_telefone: e.target.value })
                }
                placeholder="Telefone"
              />
              <Input
                variant="neumo"
                label="Email"
                type="email"
                value={formData.contato_financeiro_email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, contato_financeiro_email: e.target.value })
                }
                placeholder="Email"
              />
            </div>
          </div>
        </div>

        {/* Avaliação */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Star size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              Avaliação e Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {['qualidade', 'pontualidade', 'atendimento', 'preco'].map((tipo) => (
              <div key={tipo}>
                <label className="block mb-2 text-[0.813rem] font-medium text-[var(--orx-text-primary)] capitalize">
                  {tipo === 'preco' ? 'Preço' : tipo}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        const key = `avaliacao_${tipo}` as
                          | 'avaliacao_qualidade'
                          | 'avaliacao_pontualidade'
                          | 'avaliacao_atendimento'
                          | 'avaliacao_preco';
                        setFormData({ ...formData, [key]: star });
                      }}
                      className="bg-transparent border-none cursor-pointer p-1 hover:scale-110 transition-transform"
                      aria-label={`Avaliar ${tipo} com ${star} estrela${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={24}
                        fill={
                          (formData[
                            ('avaliacao_' + tipo) as
                              | 'avaliacao_qualidade'
                              | 'avaliacao_pontualidade'
                              | 'avaliacao_atendimento'
                              | 'avaliacao_preco'
                          ] ?? 0) >= star
                            ? 'var(--orx-warning)'
                            : 'none'
                        }
                        stroke="var(--orx-warning)"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block mb-2 text-[0.813rem] font-medium text-[var(--orx-text-primary)]">
                Avaliação Geral
              </label>
              <p className="text-[1.5rem] font-bold text-[var(--orx-primary)]">
                {calcularAvaliacaoGeral().toFixed(1)}
              </p>
              <p className="text-[0.75rem] text-[var(--orx-text-secondary)]">de 5.0 estrelas</p>
            </div>
          </div>
        </div>

        {/* Certificações */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              Certificações
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'iso9001', label: 'ISO 9001 (Gestão da Qualidade)' },
              { key: 'iso13485', label: 'ISO 13485 (Dispositivos Médicos)' },
              { key: 'anvisa', label: 'Certificado ANVISA' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    (formData.certificacoes?.[key as keyof Certificacoes] as boolean) || false
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificacoes: {
                        ...formData.certificacoes,
                        [key]: e.target.checked,
                      } as Certificacoes,
                    })
                  }
                  className="w-5 h-5 rounded border-[var(--orx-border)] text-[var(--orx-primary)] focus:ring-[var(--orx-primary)]"
                />
                <span className="text-[0.813rem] text-[var(--orx-text-primary)]">{label}</span>
              </label>
            ))}

            <div className="mt-4">
              <label className="block mb-2 text-[0.813rem] font-medium text-[var(--orx-text-primary)]">
                Outras Certificações
              </label>
              <textarea
                value={formData.certificacoes?.outras || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    certificacoes: {
                      ...formData.certificacoes,
                      outras: e.target.value,
                    } as Certificacoes,
                  })
                }
                rows={2}
                placeholder="Liste outras certificações relevantes..."
                className="w-full p-3 rounded-lg bg-[var(--orx-bg-input)] border border-[var(--orx-border-input)] text-[var(--orx-text-primary)] text-[0.813rem] focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
              Observações
            </h2>
          </div>
          <textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={4}
            placeholder="Informações adicionais sobre o fornecedor..."
            className="w-full p-3 rounded-lg bg-[var(--orx-bg-input)] border border-[var(--orx-border-input)] text-[var(--orx-text-primary)] text-[0.813rem] focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)] transition-all min-h-[100px]"
          />
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            onClick={() => navigate('/cadastros')}
            variant="ghost"
            className="px-6 py-3"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            color="primary"
            type="submit"
            className="px-6 py-3 flex items-center gap-2"
            disabled={loading}
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
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CadastroFornecedores;
