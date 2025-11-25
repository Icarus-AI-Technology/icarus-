import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, UserCheck, MapPin, Shield, Heart, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { FormFieldError } from '@/components/oraclusx-ds/FormFieldError';
import { Button } from '@/components/oraclusx-ds/Button';
import { NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { cadastrosService } from '@/services/CadastrosService';
import { validacaoService } from '@/services/ValidacaoService';
import type { Paciente, PacienteFormData, ValidationErrors } from '../../types/cadastros';

/**
 * FORMULÁRIO DE CADASTRO DE PACIENTES
 *
 * DOCUMENTAÇÃO: MODULOS_CADASTROS_COMPRAS_PARTE2.md → Seção "Pacientes"
 */

export default function CadastroPacientes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingCpf, setValidatingCpf] = useState(false);
  const [validatingCep, setValidatingCep] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<PacienteFormData>({
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: 'M',
    estado_civil: 'solteiro',
    nome_mae: '',
    nome_pai: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
    convenio_id: '',
    numero_carteirinha: '',
    validade_plano: '',
    plano: '',
    tipo_atendimento: 'completo',
    grupo_sanguineo: 'O+',
    alergias: '',
    medicamentos_uso: '',
    observacoes_saude: '',
    observacoes: '',
    consentimento_lgpd: false,
    ativo: true,
  });

  // Validation Errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * HANDLE INPUT CHANGE
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;

    // Checkbox handling
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: PacienteFormData) => ({ ...prev, [id]: checked }));
      return;
    }

    // Nested address fields
    if (
      id.startsWith('cep') ||
      id.startsWith('logradouro') ||
      id.startsWith('numero') ||
      id.startsWith('complemento') ||
      id.startsWith('bairro') ||
      id.startsWith('cidade') ||
      id.startsWith('uf')
    ) {
      const addressKey = id.split('_')[0] as keyof typeof formData.endereco;
      setFormData((prev: PacienteFormData) => ({
        ...prev,
        endereco: {
          ...prev.endereco!,
          [addressKey]: value,
        },
      }));
      return;
    }

    // Regular fields
    setFormData((prev: PacienteFormData) => ({ ...prev, [id]: value }));
  };

  /**
   * VALIDAÇÃO CPF EM TEMPO REAL (OPCIONAL, MAS SE PREENCHIDO, VALIDADO)
   */
  const handleCpfBlur = async () => {
    // Se CPF não foi preenchido, não precisa validar
    if (!formData.cpf || formData.cpf.trim() === '') {
      setErrors((prev: ValidationErrors) => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
      return;
    }

    setValidatingCpf(true);
    setErrors((prev: ValidationErrors) => {
      const newErrors = { ...prev };
      delete newErrors.cpf;
      return newErrors;
    });

    try {
      const resultado = await validacaoService.consultarCPFReceitaFederal(formData.cpf);

      if (!resultado.valido) {
        setErrors((prev: ValidationErrors) => ({
          ...prev,
          cpf: resultado.mensagem || 'CPF inválido',
        }));
      } else {
        toast.success('CPF validado com sucesso!');
        // Opcional: preencher nome se vier da API
        if (resultado.nome) {
          setFormData((prev: PacienteFormData) => ({
            ...prev,
            nome_completo: resultado.nome || prev.nome_completo,
          }));
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      setErrors((prev: ValidationErrors) => ({
        ...prev,
        cpf: err.message || 'Erro ao validar CPF.',
      }));
    } finally {
      setValidatingCpf(false);
    }
  };

  /**
   * BUSCA CEP (VIACEP)
   */
  const handleCepBlur = async () => {
    if (!formData.endereco?.cep || formData.endereco.cep.trim() === '') return;

    setValidatingCep(true);
    setErrors((prev: ValidationErrors) => {
      const newErrors = { ...prev };
      delete newErrors['cep'];
      return newErrors;
    });

    try {
      const resultado = await validacaoService.consultarCEP(formData.endereco.cep);

      if (!resultado.encontrado) {
        setErrors((prev: ValidationErrors) => ({
          ...prev,
          cep: resultado.erro || 'CEP não encontrado',
        }));
        return;
      }

      // Preenche automaticamente os campos
      setFormData((prev: PacienteFormData) => ({
        ...prev,
        endereco: {
          ...prev.endereco!,
          logradouro: resultado.logradouro || '',
          bairro: resultado.bairro || '',
          cidade: resultado.localidade || '',
          uf: resultado.uf || '',
        },
      }));

      toast.success('CEP encontrado e endereço preenchido!');
    } catch (error: unknown) {
      const err = error as Error;
      setErrors((prev: ValidationErrors) => ({
        ...prev,
        cep: err.message || 'Erro ao buscar CEP.',
      }));
    } finally {
      setValidatingCep(false);
    }
  };

  /**
   * VALIDAÇÃO ANTES DE SUBMETER
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Campos obrigatórios
    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = 'Nome completo é obrigatório.';
    }

    if (!formData.nome_mae.trim()) {
      newErrors.nome_mae = 'Nome da mãe é obrigatório (lei brasileira).';
    }

    if (!formData.data_nascimento.trim()) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória.';
    }

    // Campos condicionais (Convênio)
    if (formData.convenio_id && formData.convenio_id !== '') {
      if (!formData.numero_carteirinha || formData.numero_carteirinha.trim() === '') {
        newErrors.numero_carteirinha = 'Número da carteirinha é obrigatório para convênio.';
      }
      if (!formData.validade_plano) {
        newErrors.validade_plano = 'Validade do plano é obrigatória.';
      }
    }

    // LGPD
    if (!formData.consentimento_lgpd) {
      newErrors.consentimento_lgpd = 'É necessário o consentimento do paciente (LGPD).';
    }

    // Email format (se preenchido)
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de email inválido.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * SUBMIT
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await cadastrosService.criar<Paciente>('paciente', formData);

      if (error) throw error;

      toast.success(`Paciente ${formData.nome_completo} cadastrado com sucesso!`);
      navigate('/cadastros');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Erro ao cadastrar paciente.');
      console.error('Erro ao cadastrar paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CANCEL
   */
  const handleCancel = () => {
    if (
      window.confirm('Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.')
    ) {
      navigate('/cadastros');
    }
  };

  return (
    <div className="py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="neumo"
            onClick={() => navigate('/cadastros')}
            className="p-3"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Cadastro de Pacientes</h1>
            <p className="mt-1 text-sm text-muted">
              Preencha os dados do paciente. Campos com (*) são obrigatórios.
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* 1. DADOS PESSOAIS */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <UserCheck size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">1. Dados Pessoais</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Nome Completo */}
            <div className="col-span-full">
              <label
                htmlFor="nome_completo"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Nome Completo *
              </label>
              <NeuInput
                id="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                placeholder="Ex: Maria Silva Santos"
                error={errors.nome_completo}
              />
              <FormFieldError error={errors.nome_completo} />
            </div>

            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block mb-2 text-sm font-medium text-primary">
                CPF (Opcional)
              </label>
              <div className="relative">
                <NeuInput
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  onBlur={handleCpfBlur}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  error={errors.cpf}
                />
                {validatingCpf && (
                  <Loader2
                    size={16}
                    className="absolute animate-spin right-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                )}
              </div>
              <FormFieldError error={errors.cpf} />
            </div>

            {/* RG */}
            <div>
              <label htmlFor="rg" className="block mb-2 text-sm font-medium text-primary">
                RG
              </label>
              <NeuInput
                id="rg"
                value={formData.rg}
                onChange={handleChange}
                placeholder="Ex: 12.345.678-9"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label
                htmlFor="data_nascimento"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Data de Nascimento *
              </label>
              <NeuInput
                type="date"
                id="data_nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
                error={errors.data_nascimento}
              />
              <FormFieldError error={errors.data_nascimento} />
            </div>

            {/* Sexo */}
            <div>
              <label htmlFor="sexo" className="block mb-2 text-sm font-medium text-primary">
                Sexo *
              </label>
              <NeuSelect
                value={formData.sexo}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'sexo', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' },
                  { value: 'Outro', label: 'Outro' },
                ]}
              />
            </div>

            {/* Estado Civil */}
            <div>
              <label htmlFor="estado_civil" className="block mb-2 text-sm font-medium text-primary">
                Estado Civil
              </label>
              <NeuSelect
                value={formData.estado_civil}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'estado_civil', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: 'solteiro', label: 'Solteiro(a)' },
                  { value: 'casado', label: 'Casado(a)' },
                  { value: 'divorciado', label: 'Divorciado(a)' },
                  { value: 'viuvo', label: 'Viúvo(a)' },
                  { value: 'uniao_estavel', label: 'União Estável' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 2. FILIAÇÃO */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <UserCheck size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">2. Filiação</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nome da Mãe */}
            <div>
              <label htmlFor="nome_mae" className="block mb-2 text-sm font-medium text-primary">
                Nome da Mãe *
              </label>
              <NeuInput
                id="nome_mae"
                value={formData.nome_mae}
                onChange={handleChange}
                placeholder="Ex: Ana Silva Santos"
                error={errors.nome_mae}
              />
              <FormFieldError error={errors.nome_mae} />
            </div>

            {/* Nome do Pai */}
            <div>
              <label htmlFor="nome_pai" className="block mb-2 text-sm font-medium text-primary">
                Nome do Pai
              </label>
              <NeuInput
                id="nome_pai"
                value={formData.nome_pai}
                onChange={handleChange}
                placeholder="Ex: João Silva Santos"
              />
            </div>
          </div>
        </div>

        {/* 3. CONTATO */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <UserCheck size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">3. Contato</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-primary">
                Telefone Fixo
              </label>
              <NeuInput
                type="tel"
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 3456-7890"
              />
            </div>

            {/* Celular */}
            <div>
              <label htmlFor="celular" className="block mb-2 text-sm font-medium text-primary">
                Celular (WhatsApp)
              </label>
              <NeuInput
                type="tel"
                id="celular"
                value={formData.celular}
                onChange={handleChange}
                placeholder="(11) 98765-4321"
              />
            </div>

            {/* Email */}
            <div className="col-span-full lg:col-span-1">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-primary">
                Email
              </label>
              <NeuInput
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="maria.santos@example.com"
                error={errors.email}
              />
              <FormFieldError error={errors.email} />
            </div>
          </div>
        </div>

        {/* 4. ENDEREÇO */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <MapPin size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">4. Endereço</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* CEP */}
            <div>
              <label htmlFor="cep" className="block mb-2 text-sm font-medium text-primary">
                CEP
              </label>
              <div className="relative">
                <NeuInput
                  id="cep"
                  value={formData.endereco?.cep || ''}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  error={errors.cep}
                />
                {validatingCep && (
                  <Loader2
                    size={16}
                    className="absolute animate-spin right-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                )}
              </div>
              <FormFieldError error={errors.cep} />
            </div>

            {/* Logradouro */}
            <div className="col-span-2">
              <label htmlFor="logradouro" className="block mb-2 text-sm font-medium text-primary">
                Logradouro
              </label>
              <NeuInput
                id="logradouro"
                value={formData.endereco?.logradouro || ''}
                onChange={handleChange}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            {/* Número */}
            <div>
              <label htmlFor="numero" className="block mb-2 text-sm font-medium text-primary">
                Número
              </label>
              <NeuInput
                id="numero"
                value={formData.endereco?.numero || ''}
                onChange={handleChange}
                placeholder="123"
              />
            </div>

            {/* Complemento */}
            <div>
              <label htmlFor="complemento" className="block mb-2 text-sm font-medium text-primary">
                Complemento
              </label>
              <NeuInput
                id="complemento"
                value={formData.endereco?.complemento || ''}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
              />
            </div>

            {/* Bairro */}
            <div>
              <label htmlFor="bairro" className="block mb-2 text-sm font-medium text-primary">
                Bairro
              </label>
              <NeuInput
                id="bairro"
                value={formData.endereco?.bairro || ''}
                onChange={handleChange}
                placeholder="Ex: Centro"
              />
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor="cidade" className="block mb-2 text-sm font-medium text-primary">
                Cidade
              </label>
              <NeuInput
                id="cidade"
                value={formData.endereco?.cidade || ''}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
              />
            </div>

            {/* UF */}
            <div>
              <label htmlFor="uf" className="block mb-2 text-sm font-medium text-primary">
                UF
              </label>
              <NeuSelect
                value={formData.endereco?.uf || ''}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'uf', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
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
                ]}
              />
            </div>
          </div>
        </div>

        {/* 5. DADOS DO CONVÊNIO */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <Shield size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">5. Dados do Convênio</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Convênio */}
            <div>
              <label htmlFor="convenio_id" className="block mb-2 text-sm font-medium text-primary">
                Convênio *
              </label>
              <NeuSelect
                value={formData.convenio_id}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'convenio_id', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: '1', label: 'Unimed' },
                  { value: '2', label: 'Bradesco Saúde' },
                  { value: '3', label: 'SulAmérica' },
                  { value: '4', label: 'Amil' },
                  { value: '5', label: 'NotreDame Intermédica' },
                  { value: '6', label: 'Particular' },
                ]}
              />
              <FormFieldError error={errors.convenio_id} />
            </div>

            {/* Número da Carteirinha */}
            <div>
              <label
                htmlFor="numero_carteirinha"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Número da Carteirinha *
              </label>
              <NeuInput
                id="numero_carteirinha"
                value={formData.numero_carteirinha}
                onChange={handleChange}
                placeholder="Ex: 123456789012345"
                error={errors.numero_carteirinha}
              />
              <FormFieldError error={errors.numero_carteirinha} />
            </div>

            {/* Validade do Plano */}
            <div>
              <label
                htmlFor="validade_plano"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Validade do Plano
              </label>
              <NeuInput
                type="date"
                id="validade_plano"
                value={formData.validade_plano}
                onChange={handleChange}
              />
            </div>

            {/* Nome do Plano */}
            <div>
              <label htmlFor="plano" className="block mb-2 text-sm font-medium text-primary">
                Nome do Plano
              </label>
              <NeuInput
                id="plano"
                value={formData.plano}
                onChange={handleChange}
                placeholder="Ex: Premium, Executivo"
              />
            </div>

            {/* Tipo de Atendimento */}
            <div>
              <label
                htmlFor="tipo_atendimento"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Tipo de Atendimento
              </label>
              <NeuSelect
                value={formData.tipo_atendimento}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'tipo_atendimento', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: 'ambulatorial', label: 'Ambulatorial' },
                  { value: 'hospitalar', label: 'Hospitalar' },
                  { value: 'completo', label: 'Completo' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 6. INFORMAÇÕES DE SAÚDE */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <Heart size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">6. Informações de Saúde</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Grupo Sanguíneo */}
            <div>
              <label
                htmlFor="grupo_sanguineo"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Grupo Sanguíneo
              </label>
              <NeuSelect
                value={formData.grupo_sanguineo}
                onValueChange={(val) =>
                  handleChange({
                    target: { id: 'grupo_sanguineo', value: val ?? '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
              />
            </div>

            {/* Alergias */}
            <div className="col-span-full">
              <label htmlFor="alergias" className="block mb-2 text-sm font-medium text-primary">
                Alergias
              </label>
              <NeuTextarea
                id="alergias"
                value={formData.alergias}
                onChange={handleChange}
                placeholder="Liste as alergias do paciente..."
                rows={3}
              />
            </div>

            {/* Observações de Saúde (Comorbidades) */}
            <div className="col-span-full">
              <label
                htmlFor="observacoes_saude"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Comorbidades / Observações de Saúde
              </label>
              <NeuTextarea
                id="observacoes_saude"
                value={formData.observacoes_saude}
                onChange={handleChange}
                placeholder="Diabetes, Hipertensão, histórico médico..."
                rows={3}
              />
            </div>

            {/* Medicamentos em Uso */}
            <div className="col-span-full">
              <label
                htmlFor="medicamentos_uso"
                className="block mb-2 text-sm font-medium text-primary"
              >
                Medicamentos em Uso
              </label>
              <NeuTextarea
                id="medicamentos_uso"
                value={formData.medicamentos_uso}
                onChange={handleChange}
                placeholder="Liste os medicamentos..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 7. OBSERVAÇÕES */}
        <div className="p-6 mb-6 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <FileText size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">7. Observações</h2>
          </div>

          <div>
            <label htmlFor="observacoes" className="block mb-2 text-sm font-medium text-primary">
              Observações Gerais
            </label>
            <NeuTextarea
              id="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Outras informações relevantes..."
              rows={4}
            />
          </div>
        </div>

        {/* 8. LGPD */}
        <div className="p-6 mb-8 rounded-2xl neumorphic-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-primary">
              <Shield size={20} />
            </div>
            <h2 className="text-sm font-semibold text-primary">8. Consentimento e LGPD</h2>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg bg-surface border-border">
            <input
              type="checkbox"
              id="consentimento_lgpd"
              checked={formData.consentimento_lgpd}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="consentimento_lgpd" className="text-sm text-muted">
              Declaro que obtive o consentimento do paciente para o tratamento de seus dados
              pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD). As informações
              aqui coletadas serão utilizadas exclusivamente para fins de cadastro e atendimento
              médico.
            </label>
          </div>
          <FormFieldError error={errors.consentimento_lgpd} />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="neumo"
            onClick={handleCancel}
            type="button"
            className="px-6 py-3 text-primary"
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 text-white bg-primary hover:bg-primary-dark"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Paciente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
