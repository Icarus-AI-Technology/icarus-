/**
 * Módulo 01: Cadastro de Médicos
 * Sistema completo de cadastro com validações, IA e integrações
 * 
 * Documentação: MODULOS_CADASTROS_COMPRAS_COMPLETO.md (Seção 5)
 * OraclusX DS: 100% compliance
 * Hard Gates: Ativado
 */

import { useState, useEffect } from"react";
import { useNavigate } from"react-router-dom";
import { 
  User, 
  Stethoscope, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText,
  AlertTriangle,
  Check,
  Loader2,
  X,
  Sparkles
} from"lucide-react";
import { toast } from"sonner";

// Services
import { cadastrosService } from"@/services/CadastrosService";
import { validacaoService } from"@/services/ValidacaoService";
import { duplicateDetectionService } from"@/services/DuplicateDetectionService";

// Types
import type { Medico, MedicoFormData, ValidationErrors } from"@/types/cadastros";

// Hooks
import { useDocumentTitle } from"@/hooks";

// Estados brasileiros
const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Especialidades médicas (mockado - será autocomplete TUSS)
const ESPECIALIDADES = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'pediatria', label: 'Pediatria' },
  { value: 'ginecologia', label: 'Ginecologia e Obstetrícia' },
  { value: 'cirurgia_geral', label: 'Cirurgia Geral' },
  { value: 'anestesiologia', label: 'Anestesiologia' },
  { value: 'radiologia', label: 'Radiologia' },
  { value: 'dermatologia', label: 'Dermatologia' },
  { value: 'oftalmologia', label: 'Oftalmologia' }
];

// Estado inicial do formulário
const INITIAL_STATE: MedicoFormData = {
  nome_completo: '',
  cpf: '',
  rg: '',
  data_nascimento: '',
  sexo: '',
  crm: '',
  uf_crm: '',
  especialidade: '',
  registro_ans: '',
  telefone: '',
  celular: '',
  email: '',
  linkedin: '',
  endereco: {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  },
  dados_bancarios: {
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix: ''
  },
  observacoes: '',
  ativo: true
};

export default function CadastroMedicos() {
  useDocumentTitle("Cadastro de Médicos");
  const navigate = useNavigate();

  // Estados
  const [formData, setFormData] = useState<MedicoFormData>(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [validatingCPF, setValidatingCPF] = useState(false);
  const [validatingCRM, setValidatingCRM] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [possiveisDuplicatas, setPossiveisDuplicatas] = useState<any[]>([]);

  // Validação de CPF em tempo real
  const handleCPFChange = async (cpf: string) => {
    setFormData({ ...formData, cpf });

    // Remove erros anteriores
    const { cpf: _, ...restErrors } = validationErrors;
    setValidationErrors(restErrors);

    if (cpf.length === 14) { // CPF formatado: 999.999.999-99
      setValidatingCPF(true);
      try {
        const resultado = await validacaoService.validarCPF(cpf);
        
        if (!resultado.valido) {
          setValidationErrors({
            ...validationErrors,
            cpf: resultado.mensagem || 'CPF inválido'
          });
        } else {
          // Enriquecer dados se disponível
          if (resultado.dados?.nome) {
            setFormData(prev => ({
              ...prev,
              cpf,
              nome_completo: resultado.dados.nome || prev.nome_completo
            }));
          }
        }
      } catch (_error) {
        console.warn('Erro ao validar CPF:', error);
      } finally {
        setValidatingCPF(false);
      }
    }
  };

  // Validação de CRM em tempo real
  const handleCRMChange = async (crm: string, uf: string) => {
    setFormData({ ...formData, crm, uf_crm: uf });

    // Remove erros anteriores
    const { crm: _, ...restErrors } = validationErrors;
    setValidationErrors(restErrors);

    if (crm && uf) {
      setValidatingCRM(true);
      try {
        const resultado = await validacaoService.validarCRM(crm, uf);
        
        if (!resultado.valido) {
          setValidationErrors({
            ...validationErrors,
            crm: resultado.mensagem || 'CRM inválido'
          });
        } else {
          // Verificar duplicação
          const duplicatas = await duplicateDetectionService.detectPossibleDuplicates({
            tipo: 'medico',
            crm,
            uf_crm: uf
          });

          if (duplicatas.length > 0) {
            setValidationErrors({
              ...validationErrors,
              crm: `CRM já cadastrado para: ${duplicatas[0].nome}`
            });
          }
        }
      } catch (_error) {
        console.warn('Erro ao validar CRM:', error);
      } finally {
        setValidatingCRM(false);
      }
    }
  };

  // Busca de CEP
  const handleCEPChange = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    setFormData({
      ...formData,
      endereco: { ...formData.endereco, cep: cepLimpo }
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
      } catch (_error) {
        console.warn('Erro ao buscar CEP:', error);
      } finally {
        setBuscandoCEP(false);
      }
    }
  };

  // Detecção de duplicatas (debounced)
  useEffect(() => {
    const detectarDuplicatas = async () => {
      if (formData.nome_completo.length < 5) {
        setPossiveisDuplicatas([]);
        return;
      }

      try {
        const duplicatas = await duplicateDetectionService.detectPossibleDuplicates({
          tipo: 'medico',
          nome: formData.nome_completo,
          cpf: formData.cpf,
          crm: formData.crm
        });

        setPossiveisDuplicatas(duplicatas);
      } catch (_error) {
        console.error('Erro ao detectar duplicatas:', error);
      }
    };

    const debounce = setTimeout(detectarDuplicatas, 500);
    return () => clearTimeout(debounce);
  }, [formData.nome_completo, formData.cpf, formData.crm]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações finais
      const errors: ValidationErrors = {};

      if (!formData.nome_completo) errors.nome_completo = 'Nome completo é obrigatório';
      if (!formData.cpf) errors.cpf = 'CPF é obrigatório';
      if (!formData.crm) errors.crm = 'CRM é obrigatório';
      if (!formData.uf_crm) errors.uf_crm = 'UF do CRM é obrigatório';
      if (!formData.especialidade) errors.especialidade = 'Especialidade é obrigatória';
      if (!formData.celular) errors.celular = 'Celular é obrigatório';
      if (!formData.email) errors.email = 'Email é obrigatório';

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Salvar
      const novoMedico = await cadastrosService.createMedico(formData);
      
      toast.success('Médico cadastrado com sucesso!');
      navigate('/cadastros');
    } catch (_error) {
      console.error('Erro ao salvar médico:', error);
      toast.error('Erro ao salvar médico');
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
            Cadastro de Médicos
          </h1>
          <p className="text-body text-[var(--orx-text-secondary)] mt-1">
            Cadastre médicos com validações em tempo real e detecção de duplicatas
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

      {/* Alerta de Duplicatas */}
      {possiveisDuplicatas.length > 0 && (
        <div 
          className="neumorphic-card" 
          style={{ 
            padding: '1rem',
            border: '2px solid var(--orx-warning)',
            background: 'var(--orx-bg-light)'
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle 
              size={24} 
              style={{ color: 'var(--orx-warning)', flexShrink: 0 }} 
            />
            <div style={{ flex: 1 }}>
              <h3 
                className="font-display" 
                style={{ 
                  fontSize: '0.813rem', 
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem'
                }}
              >
                Possíveis Duplicatas Detectadas
              </h3>
              <p style={{ fontSize: '0.813rem', color: 'var(--orx-text-secondary)' }}>
                Encontramos {possiveisDuplicatas.length} médico(s) similar(es):
              </p>
              <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                {possiveisDuplicatas.map((dup, idx) => (
                  <li 
                    key={idx}
                    style={{ 
                      fontSize: '0.813rem', 
                      color: 'var(--orx-text-primary)',
                      marginBottom: '0.25rem'
                    }}
                  >
                    • {dup.nome} - {dup.motivo}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Dados Pessoais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Dados Pessoais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="md:col-span-2">
              <label 
                htmlFor="nome_completo"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Nome Completo <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="nome_completo"
                type="text"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.nome_completo ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="Digite o nome completo do médico"
              />
              {validationErrors.nome_completo && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.nome_completo}
                </p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label 
                htmlFor="cpf"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                CPF <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  className="neumorphic-input"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: validatingCPF ? '2.5rem' : '0.75rem',
                    borderRadius: '0.5rem',
                    border: validationErrors.cpf ? '2px solid var(--orx-error)' : 'none'
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
              {validationErrors.cpf && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.cpf}
                </p>
              )}
            </div>

            {/* RG */}
            <div>
              <label 
                htmlFor="rg"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                RG
              </label>
              <input
                id="rg"
                type="text"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="00.000.000-0"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label 
                htmlFor="data_nascimento"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Data de Nascimento
              </label>
              <input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
              />
            </div>

            {/* Sexo */}
            <div>
              <label 
                htmlFor="sexo"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Sexo
              </label>
              <select
                id="sexo"
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 2: Dados Profissionais */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Dados Profissionais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CRM */}
            <div>
              <label 
                htmlFor="crm"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                CRM <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="crm"
                  type="text"
                  value={formData.crm}
                  onChange={(e) => handleCRMChange(e.target.value, formData.uf_crm)}
                  className="neumorphic-input"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: validatingCRM ? '2.5rem' : '0.75rem',
                    borderRadius: '0.5rem',
                    border: validationErrors.crm ? '2px solid var(--orx-error)' : 'none'
                  }}
                  placeholder="123456"
                />
                {validatingCRM && (
                  <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: 'var(--orx-primary)' }} />
                  </div>
                )}
              </div>
              {validationErrors.crm && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.crm}
                </p>
              )}
            </div>

            {/* UF do CRM */}
            <div>
              <label 
                htmlFor="uf_crm"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                UF do CRM <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                id="uf_crm"
                value={formData.uf_crm}
                onChange={(e) => handleCRMChange(formData.crm, e.target.value)}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.uf_crm ? '2px solid var(--orx-error)' : 'none'
                }}
              >
                <option value="">Selecione</option>
                {ESTADOS_BRASILEIROS.map(estado => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
              {validationErrors.uf_crm && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.uf_crm}
                </p>
              )}
            </div>

            {/* Especialidade */}
            <div>
              <label 
                htmlFor="especialidade"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Especialidade <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <select
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.especialidade ? '2px solid var(--orx-error)' : 'none'
                }}
              >
                <option value="">Selecione</option>
                {ESPECIALIDADES.map(esp => (
                  <option key={esp.value} value={esp.value}>{esp.label}</option>
                ))}
              </select>
              {validationErrors.especialidade && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.especialidade}
                </p>
              )}
            </div>

            {/* Registro ANS */}
            <div className="md:col-span-3">
              <label 
                htmlFor="registro_ans"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Registro ANS (opcional)
              </label>
              <input
                id="registro_ans"
                type="text"
                value={formData.registro_ans || ''}
                onChange={(e) => setFormData({ ...formData, registro_ans: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="Apenas se aplicável"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Contato */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <Phone size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Telefone Fixo */}
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
                Telefone Fixo
              </label>
              <input
                id="telefone"
                type="tel"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="(11) 3456-7890"
              />
            </div>

            {/* Celular (WhatsApp) */}
            <div>
              <label 
                htmlFor="celular"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Celular (WhatsApp) <span style={{ color: 'var(--orx-error)' }}>*</span>
              </label>
              <input
                id="celular"
                type="tel"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: validationErrors.celular ? '2px solid var(--orx-error)' : 'none'
                }}
                placeholder="(11) 98765-4321"
              />
              {validationErrors.celular && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.celular}
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
                placeholder="medico@email.com"
              />
              {validationErrors.email && (
                <p style={{ fontSize: '0.813rem', color: 'var(--orx-error)', marginTop: '0.25rem' }}>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="md:col-span-3">
              <label 
                htmlFor="linkedin"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                LinkedIn (opcional)
              </label>
              <input
                id="linkedin"
                type="url"
                value={formData.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* Seção 4: Endereço */}
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
                placeholder="Apto, Sala..."
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

        {/* Seção 5: Dados Bancários */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} style={{ color: 'var(--orx-primary)' }} />
            <h2 className="font-display" style={{ fontSize: '0.813rem', color: 'var(--orx-text-primary)' }}>
              Dados Bancários (Opcional)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Banco */}
            <div>
              <label 
                htmlFor="banco"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Banco
              </label>
              <input
                id="banco"
                type="text"
                value={formData.dados_bancarios?.banco || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: { ...formData.dados_bancarios!, banco: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="001 - Banco do Brasil"
              />
            </div>

            {/* Agência */}
            <div>
              <label 
                htmlFor="agencia"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Agência
              </label>
              <input
                id="agencia"
                type="text"
                value={formData.dados_bancarios?.agencia || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: { ...formData.dados_bancarios!, agencia: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="1234"
              />
            </div>

            {/* Conta */}
            <div>
              <label 
                htmlFor="conta"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Conta
              </label>
              <input
                id="conta"
                type="text"
                value={formData.dados_bancarios?.conta || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: { ...formData.dados_bancarios!, conta: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="12345-6"
              />
            </div>

            {/* Tipo de Conta */}
            <div>
              <label 
                htmlFor="tipo_conta"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Tipo de Conta
              </label>
              <select
                id="tipo_conta"
                value={formData.dados_bancarios?.tipo_conta || 'corrente'}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: { ...formData.dados_bancarios!, tipo_conta: e.target.value as 'corrente' | 'poupanca' }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>

            {/* PIX */}
            <div className="md:col-span-4">
              <label 
                htmlFor="pix"
                style={{ 
                  display: 'block',
                  fontSize: '0.813rem',
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Chave PIX
              </label>
              <input
                id="pix"
                type="text"
                value={formData.dados_bancarios?.pix || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: { ...formData.dados_bancarios!, pix: e.target.value }
                })}
                className="neumorphic-input"
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem'
                }}
                placeholder="CPF, email, telefone ou chave aleatória"
              />
            </div>
          </div>
        </div>

        {/* Seção 7: Observações */}
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
            placeholder="Informações adicionais sobre o médico..."
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
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.813rem' }}>Cadastrar Médico</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
