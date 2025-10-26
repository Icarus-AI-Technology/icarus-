/**
 * Módulo 02: Cadastro de Hospitais
 * Sistema completo de cadastro com validações CNPJ e CNES
 * 
 * Documentação: MODULOS_CADASTROS_COMPRAS_COMPLETO.md (Seção 6)
 * OraclusX DS: 100% compliance
 * Hard Gates: Ativado
 */

import { useState } from"react";
import { useNavigate } from"react-router-dom";
import { 
  Building2, 
  Phone, 
  MapPin, 
  User,
  FileText,
  Check,
  Loader2,
  X
} from"lucide-react";
import { toast } from"sonner";

// Services
import { cadastrosService } from"@/services/CadastrosService";
import { validacaoService } from"@/services/ValidacaoService";

// Types
import type { Hospital, ValidationErrors } from"@/types/cadastros";

// Hooks
import { useDocumentTitle } from"@/hooks";


// Estado inicial
const INITIAL_STATE: Partial<Hospital> = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  cnes: '',
  tipo: 'hospital',
  telefone: '',
  email: '',
  site: '',
  endereco: {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  },
  responsavel_nome: '',
  responsavel_cpf: '',
  responsavel_telefone: '',
  responsavel_email: '',
  responsavel_cargo: '',
  quantidade_leitos: 0,
  salas_cirurgicas: 0,
  atende_urgencia: false,
  convenios_aceitos: [],
  observacoes: '',
  ativo: true
};

export default function CadastroHospitais() {
  useDocumentTitle("Cadastro de Hospitais");
  const navigate = useNavigate();

  // Estados
  const [formData, setFormData] = useState<Partial<Hospital>>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [validatingCNPJ, setValidatingCNPJ] = useState(false);
  const [validatingCNES, setValidatingCNES] = useState(false);
  const [validatingCPF, setValidatingCPF] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  // Validação de CNPJ em tempo real
  const handleCNPJChange = async (cnpj: string) => {
    setFormData({ ...formData, cnpj });

    const restErrors = { ...validationErrors };
    delete restErrors.cnpj;
    setValidationErrors(restErrors);

    if (cnpj.length === 18) { // CNPJ formatado: 99.999.999/9999-99
      setValidatingCNPJ(true);
      try {
        const resultado = await validacaoService.validarCNPJ(cnpj);
        
        if (!resultado.valido) {
          setValidationErrors({
            ...validationErrors,
            cnpj: resultado.mensagem || 'CNPJ inválido'
          });
        } else {
          // Enriquecer dados
          if (resultado.dados) {
            setFormData(prev => ({
              ...prev,
              cnpj,
              razao_social: resultado.dados.razaoSocial || prev.razao_social,
              nome_fantasia: resultado.dados.nomeFantasia || prev.nome_fantasia
            }));
          }
        }
      } catch (error) {
        console.warn('Erro ao validar CNPJ:', error);
      } finally {
        setValidatingCNPJ(false);
      }
    }
  };

  // Validação de CNES
  const handleCNESChange = async (cnes: string) => {
    setFormData({ ...formData, cnes });

    const restErrors = { ...validationErrors };
    delete restErrors.cnes;
    setValidationErrors(restErrors);

    if (cnes.length === 7) {
      setValidatingCNES(true);
      try {
        const resultado = await validacaoService.validarCNES(cnes);
        
        if (!resultado.valido) {
          setValidationErrors({
            ...validationErrors,
            cnes: resultado.mensagem || 'CNES não encontrado no DATASUS'
          });
        } else {
          // Enriquecer dados
          if (resultado.dados) {
            setFormData(prev => ({
              ...prev,
              cnes,
              razao_social: resultado.dados.nome || prev.razao_social
            }));
          }
        }
      } catch (error) {
        console.warn('Erro ao validar CNES:', error);
      } finally {
        setValidatingCNES(false);
      }
    }
  };

  // Validação CPF do responsável
  const handleCPFResponsavelChange = async (cpf: string) => {
    setFormData({ ...formData, responsavel_cpf: cpf });

    const restErrors = { ...validationErrors };
    delete restErrors.responsavel_cpf;
    setValidationErrors(restErrors);

    if (cpf.length === 14) {
      setValidatingCPF(true);
      try {
        const resultado = await validacaoService.validarCPF(cpf);
        
        if (!resultado.valido) {
          setValidationErrors({
            ...validationErrors,
            responsavel_cpf: resultado.mensagem || 'CPF inválido'
          });
        }
      } catch (error) {
        console.warn('Erro ao validar CPF:', error);
      } finally {
        setValidatingCPF(false);
      }
    }
  };

  // Busca de CEP
  const handleCEPChange = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    setFormData({
      ...formData,
      endereco: { ...formData.endereco!, cep: cepLimpo }
    });

    if (cepLimpo.length === 8) {
      setBuscandoCEP(true);
      try {
        const resultado = await validacaoService.validarCEP(cepLimpo);
        
        if (resultado.valido && resultado.dados) {
          setFormData({
            ...formData,
            endereco: {
              cep: cepLimpo,
              logradouro: resultado.dados.logradouro || '',
              bairro: resultado.dados.bairro || '',
              cidade: resultado.dados.localidade || '',
              uf: resultado.dados.uf || '',
              numero: formData.endereco?.numero || '',
              complemento: formData.endereco?.complemento || ''
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao buscar CEP:', error);
      } finally {
        setBuscandoCEP(false);
      }
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações finais
      const errors: ValidationErrors = {};

      if (!formData.razao_social) errors.razao_social = 'Razão social é obrigatória';
      if (!formData.cnpj) errors.cnpj = 'CNPJ é obrigatório';
      if (!formData.tipo) errors.tipo = 'Tipo é obrigatório';
      if (!formData.telefone) errors.telefone = 'Telefone é obrigatório';
      if (!formData.email) errors.email = 'Email é obrigatório';
      if (!formData.responsavel_nome) errors.responsavel_nome = 'Nome do responsável é obrigatório';
      if (!formData.responsavel_cpf) errors.responsavel_cpf = 'CPF do responsável é obrigatório';
      if (!formData.responsavel_telefone) errors.responsavel_telefone = 'Telefone do responsável é obrigatório';

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Salvar
      await cadastrosService.createHospital(formData as Omit<Hospital, 'id' | 'created_at' | 'updated_at'>);
      
      toast.success('Hospital cadastrado com sucesso!');
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar hospital:', error as Error);
      toast.error('Erro ao salvar hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-lg font-display text-[var(--orx-text-primary)]">
            Cadastro de Hospitais
          </h1>
          <p className="text-body text-[var(--orx-text-secondary)] mt-1">
            Cadastre hospitais, clínicas e ambulatórios com validações CNPJ e CNES
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cadastros')}
          className="neumorphic-button"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          <X size={18} />
          <span style={{ marginLeft: '0.5rem', fontSize: '0.813rem' }}>Cancelar</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Dados Institucionais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Dados Institucionais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Razão Social */}
            <div>
              <label 
                htmlFor="razao_social"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Razão Social <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="razao_social"
                type="text"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.razao_social ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="Nome oficial da empresa"
              />
              {validationErrors.razao_social && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.razao_social}
                </p>
              )}
            </div>

            {/* Nome Fantasia */}
            <div>
              <label 
                htmlFor="nome_fantasia"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Nome Fantasia
              </label>
              <input
                id="nome_fantasia"
                type="text"
                value={formData.nome_fantasia || ''}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="Nome comercial"
              />
            </div>

            {/* CNPJ */}
            <div>
              <label 
                htmlFor="cnpj"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                CNPJ <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                  className="neumorphic-input"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: validatingCNPJ ? '2.5rem' : '0.75rem',
                    borderRadius: '0.5rem',
                    border: validationErrors.cnpj ? '2px solid var(--orx-error)' : 'none'
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {validatingCNPJ && (
                  <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: 'var(--orx-primary)' }} />
                  </div>
                )}
              </div>
              {validationErrors.cnpj && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.cnpj}
                </p>
              )}
            </div>

            {/* CNES */}
            <div>
              <label 
                htmlFor="cnes"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                CNES (Cadastro Nacional de Estabelecimentos de Saúde)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cnes"
                  type="text"
                  value={formData.cnes || ''}
                  onChange={(e) => handleCNESChange(e.target.value)}
                  className="neumorphic-input"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: validatingCNES ? '2.5rem' : '0.75rem',
                    borderRadius: '0.5rem',
                    border: validationErrors.cnes ? '2px solid var(--orx-error)' : 'none'
                  }}
                  placeholder="0000000"
                  maxLength={7}
                />
                {validatingCNES && (
                  <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: 'var(--orx-primary)' }} />
                  </div>
                )}
              </div>
              {validationErrors.cnes && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.cnes}
                </p>
              )}
            </div>

            {/* Tipo de Estabelecimento */}
            <div className="md:col-span-2">
              <label 
                htmlFor="tipo"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Tipo de Estabelecimento <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'hospital' | 'clinica' | 'ambulatorio' })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.tipo ? '2px solid var(--orx-error)' : 'none'
                }}
              >
                <option value="">Selecione</option>
                <option value="hospital">Hospital</option>
                <option value="clinica">Clínica</option>
                <option value="ambulatorio">Ambulatório</option>
              </select>
              {validationErrors.tipo && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.tipo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2: Contato */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <Phone size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Telefone */}
            <div>
              <label 
                htmlFor="telefone"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Telefone <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.telefone ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="(11) 3456-7890"
              />
              {validationErrors.telefone && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.telefone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Email <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.email ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="contato@hospital.com.br"
              />
              {validationErrors.email && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Site */}
            <div>
              <label 
                htmlFor="site"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Site
              </label>
              <input
                id="site"
                type="url"
                value={formData.site || ''}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Endereço */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Endereço
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CEP */}
            <div>
              <label 
                htmlFor="cep"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                CEP
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cep"
                  type="text"
                  value={formData.endereco?.cep || ''}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  className="neumorphic-input"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: buscandoCEP ? '2.5rem' : '0.75rem',
                    borderRadius: '0.5rem'
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {buscandoCEP && (
                  <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: 'var(--orx-primary)' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Logradouro */}
            <div className="md:col-span-3">
              <label 
                htmlFor="logradouro"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Logradouro
              </label>
              <input
                id="logradouro"
                type="text"
                value={formData.endereco?.logradouro || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco: { ...formData.endereco!, logradouro: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="Rua, Avenida..."
              />
            </div>

            {/* Número */}
            <div>
              <label 
                htmlFor="numero"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Número
              </label>
              <input
                id="numero"
                type="text"
                value={formData.endereco?.numero || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco: { ...formData.endereco!, numero: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="123"
              />
            </div>

            {/* Complemento */}
            <div>
              <label 
                htmlFor="complemento"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Complemento
              </label>
              <input
                id="complemento"
                type="text"
                value={formData.endereco?.complemento || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco: { ...formData.endereco!, complemento: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="Bloco, Andar..."
              />
            </div>

            {/* Bairro */}
            <div>
              <label 
                htmlFor="bairro"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Bairro
              </label>
              <input
                id="bairro"
                type="text"
                value={formData.endereco?.bairro || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco: { ...formData.endereco!, bairro: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="Centro"
              />
            </div>

            {/* Cidade */}
            <div>
              <label 
                htmlFor="cidade"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Cidade
              </label>
              <input
                id="cidade"
                type="text"
                value={formData.endereco?.cidade || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  endereco: { ...formData.endereco!, cidade: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="São Paulo"
              />
            </div>
          </div>
        </div>

        {/* Seção 4: Responsável Legal */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Responsável Legal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Responsável */}
            <div>
              <label 
                htmlFor="responsavel_nome"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Nome do Responsável <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="responsavel_nome"
                type="text"
                value={formData.responsavel_nome}
                onChange={(e) => setFormData({ ...formData, responsavel_nome: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.responsavel_nome ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="Nome completo"
              />
              {validationErrors.responsavel_nome && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.responsavel_nome}
                </p>
              )}
            </div>

            {/* CPF do Responsável */}
            <div>
              <label 
                htmlFor="responsavel_cpf"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                CPF do Responsável <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="responsavel_cpf"
                  type="text"
                  value={formData.responsavel_cpf}
                  onChange={(e) => handleCPFResponsavelChange(e.target.value)}
                  className="neumorphic-input"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: validatingCPF ? '2.5rem' : '0.75rem',
                    borderRadius: '0.5rem',
                    border: validationErrors.responsavel_cpf ? '2px solid var(--orx-error)' : 'none'
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {validatingCPF && (
                  <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: 'var(--orx-primary)' }} />
                  </div>
                )}
              </div>
              {validationErrors.responsavel_cpf && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.responsavel_cpf}
                </p>
              )}
            </div>

            {/* Telefone do Responsável */}
            <div>
              <label 
                htmlFor="responsavel_telefone"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Telefone do Responsável <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="responsavel_telefone"
                type="tel"
                value={formData.responsavel_telefone}
                onChange={(e) => setFormData({ ...formData, responsavel_telefone: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.responsavel_telefone ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="(11) 98765-4321"
              />
              {validationErrors.responsavel_telefone && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.responsavel_telefone}
                </p>
              )}
            </div>

            {/* Email do Responsável */}
            <div>
              <label 
                htmlFor="responsavel_email"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Email do Responsável
              </label>
              <input
                id="responsavel_email"
                type="email"
                value={formData.responsavel_email || ''}
                onChange={(e) => setFormData({ ...formData, responsavel_email: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="responsavel@email.com"
              />
            </div>

            {/* Cargo do Responsável */}
            <div className="md:col-span-2">
              <label 
                htmlFor="responsavel_cargo"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Cargo do Responsável
              </label>
              <input
                id="responsavel_cargo"
                type="text"
                value={formData.responsavel_cargo || ''}
                onChange={(e) => setFormData({ ...formData, responsavel_cargo: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="Ex: Diretor Clínico"
              />
            </div>
          </div>
        </div>

        {/* Seção 5: Dados Operacionais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Dados Operacionais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantidade de Leitos */}
            <div>
              <label 
                htmlFor="quantidade_leitos"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Quantidade de Leitos
              </label>
              <input
                id="quantidade_leitos"
                type="number"
                value={formData.quantidade_leitos || 0}
                onChange={(e) => setFormData({ ...formData, quantidade_leitos: parseInt(e.target.value) || 0 })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                min="0"
                placeholder="0"
              />
            </div>

            {/* Salas Cirúrgicas */}
            <div>
              <label 
                htmlFor="salas_cirurgicas"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Salas Cirúrgicas
              </label>
              <input
                id="salas_cirurgicas"
                type="number"
                value={formData.salas_cirurgicas || 0}
                onChange={(e) => setFormData({ ...formData, salas_cirurgicas: parseInt(e.target.value) || 0 })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                min="0"
                placeholder="0"
              />
            </div>

            {/* Atende Urgência/Emergência */}
            <div className="flex items-center" style={{ paddingTop: '2rem' }}>
              <input
                id="atende_urgencia"
                type="checkbox"
                checked={formData.atende_urgencia}
                onChange={(e) => setFormData({ ...formData, atende_urgencia: e.target.checked })}
                style={{ 
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="atende_urgencia"
                style={{ 
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  cursor: 'pointer'
                }}
              >
                Atende Urgência/Emergência
              </label>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Observações
            </h2>
          </div>

          <textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="neumorphic-input"
            style={{ 
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              minHeight: '120px',
              resize: 'vertical'
            }}
            placeholder="Informações adicionais sobre o hospital..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/cadastros')}
            className="neumorphic-button"
            style={{ padding: '0.75rem 1.5rem' }}
            disabled={loading}
          >
            <X size={18} />
            <span style={{ marginLeft: '0.5rem', fontSize: '0.813rem' }}>Cancelar</span>
          </button>
          
          <button
            type="submit"
            className="neumorphic-button colored-button"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', 
              padding: '0.75rem 2rem',
              background: 'var(--orx-primary)',
              color: 'white'
            }}
            disabled={loading || Object.keys(validationErrors).length > 0}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span style={{ marginLeft: '0.5rem' }}>Salvando...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.813rem' }}>Cadastrar Hospital</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

