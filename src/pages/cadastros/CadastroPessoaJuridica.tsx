/**
 * Cadastro de Pessoa Jurídica - ICARUS v5.0
 * Design System: OraclusX DS - Neumórfico 3D Premium
 *
 * Formulário com busca automática via CNPJ (Receita Federal)
 * e design neumórfico padronizado.
 */

import { useState } from 'react';
import { ArrowLeft, Building2, MapPin, Phone, Search, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/oraclusx-ds/Input';
import { Button } from '@/components/oraclusx-ds/Button';
import { useDocumentTitle } from '@/hooks';

interface PessoaJuridicaFormData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  telefone?: string;
  email?: string;
  site?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  dados_bancarios?: {
    banco?: string;
    agencia?: string;
    conta?: string;
    pix?: string;
  };
  observacoes?: string;
}

const INITIAL_STATE: PessoaJuridicaFormData = {
  cnpj: '',
  razao_social: '',
  endereco: {
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
  },
};

export default function CadastroPessoaJuridica() {
  useDocumentTitle('Cadastro de Pessoa Jurídica');
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PessoaJuridicaFormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [cnpjEncontrado, setCnpjEncontrado] = useState(false);

  const handleBuscarCNPJ = async () => {
    if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14) {
      toast.error('CNPJ inválido');
      return;
    }

    setBuscandoCNPJ(true);
    try {
      // Simulação de busca na Receita Federal
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock de dados retornados
      setFormData({
        ...formData,
        razao_social: 'EMPRESA EXEMPLO LTDA',
        nome_fantasia: 'Empresa Exemplo',
        telefone: '(11) 3000-0000',
        email: 'contato@empresaexemplo.com.br',
        endereco: {
          ...formData.endereco,
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          uf: 'SP',
        },
      });

      setCnpjEncontrado(true);
      toast.success('Dados encontrados na Receita Federal!');
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      toast.error('Erro ao buscar CNPJ na Receita Federal');
    } finally {
      setBuscandoCNPJ(false);
    }
  };

  const handleBuscarCEP = async () => {
    if (!formData.endereco.cep || formData.endereco.cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido');
      return;
    }

    setBuscandoCEP(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          logradouro: 'Rua Exemplo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
        },
      });

      toast.success('CEP encontrado!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setBuscandoCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.cnpj) {
      toast.error('CNPJ é obrigatório');
      return;
    }

    if (!formData.razao_social) {
      toast.error('Razão Social é obrigatória');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Pessoa Jurídica cadastrada com sucesso!');
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar pessoa jurídica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="neumo"
              onClick={() => navigate('/cadastros')}
              variant="ghost"
              className="p-3 rounded-lg flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-[0.813rem] font-bold text-[var(--orx-text-primary)]">
                Cadastro de Pessoa Jurídica
              </h1>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)] mt-1">
                Busca automática via CNPJ - Receita Federal
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Busca CNPJ */}
          <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                <Search size={20} className="text-white" />
              </div>
              <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                Buscar por CNPJ
              </h2>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  variant="neumo"
                  id="cnpj"
                  label="CNPJ *"
                  value={formData.cnpj}
                  onChange={(e) => {
                    setFormData({ ...formData, cnpj: e.target.value });
                    setCnpjEncontrado(false);
                  }}
                  placeholder="00.000.000/0000-00"
                  disabled={buscandoCNPJ}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="neumo"
                  type="button"
                  variant="primary"
                  onClick={handleBuscarCNPJ}
                  disabled={buscandoCNPJ || !formData.cnpj}
                  className="mb-[2px] h-[42px]"
                >
                  {buscandoCNPJ ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Buscar na Receita'
                  )}
                </Button>
              </div>
            </div>

            {cnpjEncontrado && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-[0.813rem] text-green-800 dark:text-green-200">
                  Dados encontrados e preenchidos automaticamente
                </span>
              </div>
            )}
          </div>

          {/* Dados Cadastrais */}
          {cnpjEncontrado && (
            <>
              <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                    Dados Cadastrais
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      variant="neumo"
                      id="razao_social"
                      label="Razão Social"
                      value={formData.razao_social}
                      onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                      required
                      disabled
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="nome_fantasia"
                      label="Nome Fantasia"
                      value={formData.nome_fantasia || ''}
                      onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="inscricao_estadual"
                      label="Inscrição Estadual"
                      value={formData.inscricao_estadual || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, inscricao_estadual: e.target.value })
                      }
                      placeholder="000.000.000.000"
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="telefone"
                      label="Telefone"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="email"
                      label="E-mail"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                    Endereço
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          variant="neumo"
                          id="cep"
                          label="CEP"
                          value={formData.endereco.cep}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endereco: { ...formData.endereco, cep: e.target.value },
                            })
                          }
                          placeholder="00000-000"
                          disabled
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="neumo"
                          type="button"
                          variant="ghost"
                          onClick={handleBuscarCEP}
                          disabled={buscandoCEP}
                          className="mb-[2px] h-[42px] w-[42px] p-0 flex items-center justify-center"
                        >
                          {buscandoCEP ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <Input
                      variant="neumo"
                      id="logradouro"
                      label="Logradouro"
                      value={formData.endereco.logradouro}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, logradouro: e.target.value },
                        })
                      }
                      disabled
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="numero"
                      label="Número"
                      value={formData.endereco.numero}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, numero: e.target.value },
                        })
                      }
                      placeholder="000"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="complemento"
                      label="Complemento"
                      value={formData.endereco.complemento || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, complemento: e.target.value },
                        })
                      }
                      placeholder="Sala, Andar..."
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="bairro"
                      label="Bairro"
                      value={formData.endereco.bairro}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, bairro: e.target.value },
                        })
                      }
                      disabled
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="cidade"
                      label="Cidade"
                      value={formData.endereco.cidade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, cidade: e.target.value },
                        })
                      }
                      disabled
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="uf"
                      label="UF"
                      value={formData.endereco.uf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endereco: { ...formData.endereco, uf: e.target.value },
                        })
                      }
                      disabled
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Dados Bancários */}
              <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--orx-primary)] flex items-center justify-center">
                    <Phone size={20} className="text-white" />
                  </div>
                  <h2 className="text-[0.813rem] font-semibold text-[var(--orx-text-primary)]">
                    Dados Bancários (Opcional)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Input
                      variant="neumo"
                      id="banco"
                      label="Banco"
                      value={formData.dados_bancarios?.banco || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dados_bancarios: {
                            ...formData.dados_bancarios,
                            banco: e.target.value,
                          },
                        })
                      }
                      placeholder="000 - Nome do Banco"
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="agencia"
                      label="Agência"
                      value={formData.dados_bancarios?.agencia || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dados_bancarios: {
                            ...formData.dados_bancarios,
                            agencia: e.target.value,
                          },
                        })
                      }
                      placeholder="0000-0"
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="conta"
                      label="Conta"
                      value={formData.dados_bancarios?.conta || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dados_bancarios: {
                            ...formData.dados_bancarios,
                            conta: e.target.value,
                          },
                        })
                      }
                      placeholder="00000-0"
                    />
                  </div>

                  <div>
                    <Input
                      variant="neumo"
                      id="pix"
                      label="Chave PIX"
                      value={formData.dados_bancarios?.pix || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dados_bancarios: {
                            ...formData.dados_bancarios,
                            pix: e.target.value,
                          },
                        })
                      }
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-[var(--orx-bg-card)] shadow-[var(--orx-shadow-card)] p-6 rounded-2xl">
                <div className="mb-4">
                  <label className="block text-[0.813rem] font-medium text-[var(--orx-text-primary)] mb-2">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre a empresa..."
                    rows={4}
                    className="w-full p-3 rounded-lg bg-[var(--orx-bg-input)] border border-[var(--orx-border-input)] text-[var(--orx-text-primary)] text-[0.813rem] focus:outline-none focus:ring-2 focus:ring-[var(--orx-primary)] transition-all min-h-[100px]"
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-4">
                <Button
                  variant="neumo"
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/cadastros')}
                  disabled={loading}
                  className="px-6 py-3"
                >
                  Cancelar
                </Button>

                <Button
                  variant="neumo"
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="px-6 py-3 flex items-center gap-2"
                >
                  {loading ? 'Salvando...' : 'Salvar Pessoa Jurídica'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
