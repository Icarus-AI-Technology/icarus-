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
  X
} from"lucide-react";
import { toast } from"sonner";

// Services
import { cadastrosService } from"@/services/CadastrosService";
import { validacaoService } from"@/services/ValidacaoService";
import { duplicateDetectionService } from"@/services/DuplicateDetectionService";

// Types
import type { MedicoFormData, ValidationErrors } from"@/types/cadastros";

// Hooks
import { useDocumentTitle } from"@/hooks";

interface PossivelDuplicata {
  nome?: string;
  motivo?: string;
}

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
  const [validatingCRM, setValidatingCRM] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [possiveisDuplicatas, setPossiveisDuplicatas] = useState<PossivelDuplicata[]>([]);

  // CPF opcional (sem validação em tempo real)
  const handleCPFChange = (cpf: string) => {
    setFormData({ ...formData, cpf });
    const { cpf: _omit, ...restErrors } = validationErrors;
    setValidationErrors(restErrors);
  };

  // Validação de CRM + autofill via API (mantido)
  const handleCRMChange = async (crm: string, uf: string) => {
    setFormData({ ...formData, crm, uf_crm: uf });

    // Remove erros anteriores
    const { crm: _, ...restErrors } = validationErrors;
    setValidationErrors(restErrors);

    if (crm && uf) {
      setValidatingCRM(true);
      try {
        // Consulta CRM (validação + dados)
        const resultado = await validacaoService.consultarCRM(crm, uf);

        if (!resultado.ativo) {
          setValidationErrors({
            ...validationErrors,
            crm: resultado.mensagem || 'CRM inválido'
          });
        } else {
          // Preenchimento automático (nome/especialidade) se disponível
          setFormData(prev => ({
            ...prev,
            nome_completo: resultado.nome || prev.nome_completo,
            especialidade: resultado.especialidade || prev.especialidade,
          }));

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
      } catch (error) {
        console.warn('Erro ao consultar/validar CRM:', error);
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
      } catch (error) {
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
      } catch (error) {
        console.error('Erro ao detectar duplicatas:', error as Error);
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
      await cadastrosService.createMedico(formData);
      
      toast.success('Médico cadastrado com sucesso!');
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar médico:', error as Error);
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
          className="neumorphic-button px-6 py-3"
          aria-label="Cancelar cadastro"
        >
          <X size={18} />
          <span className="ml-2 text-[0.813rem]">Cancelar</span>
        </button>
      </div>

      {/* Alerta de Duplicatas */}
      {possiveisDuplicatas.length > 0 && (
        <div className="neumorphic-card p-4 border-2 border-[var(--orx-warning)] bg-[var(--orx-bg-light)]">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-[var(--orx-warning)] shrink-0" />
            <div className="flex-1">
              <h3 className="font-display text-[0.813rem] text-[var(--orx-text-primary)] mb-2">
                Possíveis Duplicatas Detectadas
              </h3>
              <p className="text-[0.813rem] text-[var(--orx-text-secondary)]">
                Encontramos {possiveisDuplicatas.length} médico(s) similar(es):
              </p>
              <ul className="mt-2 ml-4">
                {possiveisDuplicatas.map((dup, idx) => (
                  <li key={idx} className="text-[0.813rem] text-[var(--orx-text-primary)] mb-1">
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
        <div className="neumorphic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-[var(--orx-primary)]" />
            <h2 className="font-display text-[0.813rem] text-[var(--orx-text-primary)]">
              Dados Pessoais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="md:col-span-2">
              <label 
                htmlFor="nome_completo"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Nome Completo <span className="text-[var(--orx-error)]">*</span>
              </label>
              <input
                id="nome_completo"
                type="text"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                className={`neumorphic-input w-full p-3 rounded-lg ${validationErrors.nome_completo ? 'border-2 border-[var(--orx-error)]' : ''}`}
                placeholder="Digite o nome completo do médico"
              />
              {validationErrors.nome_completo && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.nome_completo}</p>
              )}
            </div>

            {/* CPF (opcional) */}
            <div>
              <label 
                htmlFor="cpf"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                CPF
              </label>
              <div className="relative">
                <input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  className={`neumorphic-input w-full p-3 rounded-lg ${validationErrors.cpf ? 'border-2 border-[var(--orx-error)]' : ''}`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              {validationErrors.cpf && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.cpf}</p>
              )}
            </div>

            {/* RG */}
            <div>
              <label 
                htmlFor="rg"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                RG
              </label>
              <input
                id="rg"
                type="text"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="00.000.000-0"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label 
                htmlFor="data_nascimento"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Data de Nascimento
              </label>
              <input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
              />
            </div>

            {/* Sexo */}
            <div>
              <label 
                htmlFor="sexo"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Sexo
              </label>
              <select
                id="sexo"
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select
              >
            </div>
          </div>
        </div>

        {/* Seção 2: Dados Profissionais */}
        <div className="neumorphic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={20} className="text-[var(--orx-primary)]" />
            <h2 className="font-display text-[0.813rem] text-[var(--orx-text-primary)]">Dados Profissionais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CRM */}
            <div>
              <label 
                htmlFor="crm"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                CRM <span className="text-[var(--orx-error)]">*</span>
              </label>
              <div className="relative">
                <input
                  id="crm"
                  type="text"
                  value={formData.crm}
                  onChange={(e) => handleCRMChange(e.target.value, formData.uf_crm)}
                  className={`neumorphic-input w-full p-3 rounded-lg ${validatingCRM ? 'pr-10' : ''} ${validationErrors.crm ? 'border-2 border-[var(--orx-error)]' : ''}`}
                  placeholder="123456"
                />
                {validatingCRM && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-[var(--orx-primary)]" />
                  </div>
                )}
              </div>
              {validationErrors.crm && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.crm}</p>
              )}
            </div>

            {/* UF do CRM */}
            <div>
              <label 
                htmlFor="uf_crm"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                UF do CRM <span className="text-[var(--orx-error)]">*</span>
              </label>
              <select
                id="uf_crm"
                value={formData.uf_crm}
                onChange={(e) => handleCRMChange(formData.crm, e.target.value)}
                className={`neumorphic-input w-full p-3 rounded-lg ${validationErrors.uf_crm ? 'border-2 border-[var(--orx-error)]' : ''}`}
              >
                <option value="">Selecione</option>
                {ESTADOS_BRASILEIROS.map(estado => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
              {validationErrors.uf_crm && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.uf_crm}</p>
              )}
            </div>

            {/* Especialidade */}
            <div>
              <label 
                htmlFor="especialidade"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Especialidade <span className="text-[var(--orx-error)]">*</span>
              </label>
              <select
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
              >
                <option value="">Selecione</option>
                {ESPECIALIDADES.map(esp => (
                  <option key={esp.value} value={esp.value}>{esp.label}</option>
                ))}
              </select>
              {validationErrors.especialidade && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.especialidade}</p>
              )}
            </div>

            {/* Registro ANS */}
            <div className="md:col-span-3">
              <label 
                htmlFor="registro_ans"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Registro ANS (opcional)
              </label>
              <input
                id="registro_ans"
                type="text"
                value={formData.registro_ans || ''}
                onChange={(e) => setFormData({ ...formData, registro_ans: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="Apenas se aplicável"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Contato */}
        <div className="neumorphic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={20} className="text-[var(--orx-primary)]" />
            <h2 className="font-display text-[0.813rem] text-[var(--orx-text-primary)]">
              Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Telefone Fixo */}
            <div>
              <label 
                htmlFor="telefone"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Telefone Fixo
              </label>
              <input
                id="telefone"
                type="tel"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="(11) 3456-7890"
              />
            </div>

            {/* Celular (WhatsApp) */}
            <div>
              <label 
                htmlFor="celular"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Celular (WhatsApp) <span className="text-[var(--orx-error)]">*</span>
              </label>
              <input
                id="celular"
                type="tel"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                className={`neumorphic-input w-full p-3 rounded-lg ${validationErrors.celular ? 'border-2 border-[var(--orx-error)]' : ''}`}
                placeholder="(11) 98888-7777"
              />
              {validationErrors.celular && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.celular}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                Email <span className="text-[var(--orx-error)]">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`neumorphic-input w-full p-3 rounded-lg ${validationErrors.email ? 'border-2 border-[var(--orx-error)]' : ''}`}
                placeholder="medico@email.com"
              />
              {validationErrors.email && (
                <p className="text-[0.813rem] text-[var(--orx-error)] mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="md:col-span-3">
              <label 
                htmlFor="linkedin"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                LinkedIn (opcional)
              </label>
              <input
                id="linkedin"
                type="url"
                value={formData.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>

        {/* Seção 4: Endereço */}
        <div className="neumorphic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-[var(--orx-primary)]" />
            <h2 className="font-display text-[0.813rem] text-[var(--orx-text-primary)]">
              Endereço
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CEP */}
            <div>
              <label 
                htmlFor="cep"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
              >
                CEP
              </label>
              <div className="relative">
                <input
                  id="cep"
                  type="text"
                  value={formData.endereco?.cep || ''}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  className={`neumorphic-input w-full p-3 rounded-lg ${buscandoCEP ? 'pr-10' : ''}`}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {buscandoCEP && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-[var(--orx-primary)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Logradouro */}
            <div className="md:col-span-3">
              <label 
                htmlFor="logradouro"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="Rua, Avenida..."
              />
            </div>

            {/* Número */}
            <div>
              <label 
                htmlFor="numero"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="123"
              />
            </div>

            {/* Complemento */}
            <div>
              <label 
                htmlFor="complemento"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="Apto, Sala..."
              />
            </div>

            {/* Bairro */}
            <div>
              <label 
                htmlFor="bairro"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
              />
            </div>

            {/* Cidade */}
            <div>
              <label 
                htmlFor="cidade"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Seção 5: Dados Bancários */}
        <div className="neumorphic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} className="text-[var(--orx-primary)]" />
            <h2 className="font-display text-[0.813rem] text-[var(--orx-text-primary)]">
              Dados Bancários (Opcional)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Banco */}
            <div>
              <label 
                htmlFor="banco"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="001 - Banco do Brasil"
              />
            </div>

            {/* Agência */}
            <div>
              <label 
                htmlFor="agencia"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="1234"
              />
            </div>

            {/* Conta */}
            <div>
              <label 
                htmlFor="conta"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="12345-6"
              />
            </div>

            {/* Tipo de Conta */}
            <div>
              <label 
                htmlFor="tipo_conta"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>

            {/* PIX */}
            <div className="md:col-span-4">
              <label 
                htmlFor="pix"
                className="block text-[0.813rem] text-[var(--orx-text-primary)] mb-2 orx-font-medium"
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
                className="neumorphic-input w-full p-3 rounded-lg"
                placeholder="CPF, email, telefone ou chave aleatória"
              />
            </div>
          </div>
        </div>

        {/* Seção 7: Observações */}
        <div className="neumorphic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-[var(--orx-primary)]" />
            <h2 className="font-display text-[0.813rem] text-[var(--orx-text-primary)]">
              Observações
            </h2>
          </div>

          <textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="neumorphic-input w-full p-3 rounded-lg min-h-[120px] resize-y"
            placeholder="Informações adicionais sobre o médico..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/cadastros')}
            className="neumorphic-button px-6 py-3"
            disabled={loading}
          >
            <X size={18} />
            <span className="ml-2 text-[0.813rem]">Cancelar</span>
          </button>
          
          <button
            type="submit"
            className="neumorphic-button colored-button inline-flex items-center gap-2 px-6 py-3 bg-[var(--orx-primary)] text-white"
            disabled={loading || Object.keys(validationErrors).length > 0}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="ml-2">Salvando...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span className="ml-2 text-[0.813rem]">Cadastrar Médico</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
