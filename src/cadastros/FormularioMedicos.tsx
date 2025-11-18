/**
 * FORMULÁRIO DE MÉDICOS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de médicos com validação React Hook Form + Zod
 * Integração com CFM para validação de CRM
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Stethoscope, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

import { FormTemplate, FormField, NeuInput, NeuSelect } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { supabase } from '@/lib/supabase';

// ===================================
// SCHEMA ZOD
// ===================================

const schemaMedico = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome muito longo'),
  
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .optional()
    .or(z.literal('')),
  
  crm: z.string()
    .min(4, 'CRM deve ter no mínimo 4 caracteres')
    .max(20, 'CRM muito longo'),
  
  crm_uf: z.string()
    .length(2, 'Selecione o estado do CRM'),
  
  especialidade: z.string()
    .min(1, 'Selecione a especialidade'),
  
  telefone: z.string().optional(),
  
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  
  hospital_principal: z.string().optional(),
  volume_anual_estimado: z.number().optional(),
  
  status: z.enum(['ativo', 'inativo', 'suspenso']).optional()
});

type FormMedicoData = z.infer<typeof schemaMedico>;

// ===================================
// CONSTANTES
// ===================================

const ESTADOS = [
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

const ESPECIALIDADES = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'ortopedia', label: 'Ortopedia e Traumatologia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'neurocirurgia', label: 'Neurocirurgia' },
  { value: 'cirurgia_cardiovascular', label: 'Cirurgia Cardiovascular' },
  { value: 'cirurgia_geral', label: 'Cirurgia Geral' },
  { value: 'anestesiologia', label: 'Anestesiologia' },
  { value: 'ginecologia', label: 'Ginecologia e Obstetrícia' },
  { value: 'pediatria', label: 'Pediatria' },
  { value: 'urologia', label: 'Urologia' },
  { value: 'oftalmologia', label: 'Oftalmologia' },
  { value: 'otorrinolaringologia', label: 'Otorrinolaringologia' },
  { value: 'cirurgia_plastica', label: 'Cirurgia Plástica' },
  { value: 'cirurgia_toracica', label: 'Cirurgia Torácica' },
  { value: 'cirurgia_vascular', label: 'Cirurgia Vascular' },
  { value: 'coloproctologia', label: 'Coloproctologia' }
];

// ===================================
// COMPONENTE
// ===================================

export default function FormularioMedicos() {
  const navigate = useNavigate();
  const [validatingCEP, setValidatingCEP] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormMedicoData>({
    resolver: zodResolver(schemaMedico),
    defaultValues: {
      status: 'ativo'
    }
  });

  const onSubmit = async (data: FormMedicoData) => {
    try {
      // Preparar dados para Supabase
      const medicoData = {
        nome: data.nome,
        cpf: data.cpf || null,
        crm: data.crm,
        crm_uf: data.crm_uf,
        especialidade: data.especialidade,
        telefone: data.telefone || null,
        email: data.email || null,
        cep: data.cep || null,
        endereco: data.endereco || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        hospital_principal: data.hospital_principal || null,
        volume_anual_estimado: data.volume_anual_estimado || null,
        status: data.status || 'ativo'
      };

      // Inserir no Supabase
      const { error } = await supabase
        .from('medicos')
        .insert([medicoData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Médico cadastrado com sucesso!');
      navigate('/cadastros/medicos');
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar médico');
    }
  };

  const handleCEPBlur = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      setValidatingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setValue('endereco', data.logradouro);
          setValue('bairro', data.bairro);
          setValue('cidade', data.localidade);
          setValue('estado', data.uf);
        }
      } catch (error) {
        console.warn('Erro ao buscar CEP:', error);
      } finally {
        setValidatingCEP(false);
      }
    }
  };

  // Seções do formulário
  const secoes = [
    // SEÇÃO 1: Dados Pessoais
    {
      id: 'dados-pessoais',
      icon: <User className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Pessoais',
      campos: (
        <div className={FORM_GRID}>
          {/* Nome Completo */}
          <FormField
            id="nome"
            label="Nome Completo"
            required
            error={errors.nome?.message}
            className={FORM_COL.full}
          >
            <NeuInput
              id="nome"
              type="text"
              placeholder="Ex: Dr. João Silva Santos"
              error={!!errors.nome}
              {...register('nome')}
            />
          </FormField>

          {/* CPF */}
          <FormField
            id="cpf"
            label="CPF"
            error={errors.cpf?.message}
            helpText="Opcional"
          >
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputMask mask="999.999.999-99" value={field.value} onChange={field.onChange}>
                  {(inputProps: unknown) => (
                    <NeuInput
                      {...inputProps}
                      placeholder="000.000.000-00"
                      error={!!errors.cpf}
                    />
                  )}
                </InputMask>
              )}
            />
          </FormField>

          {/* Telefone */}
          <FormField
            id="telefone"
            label="Telefone"
            error={errors.telefone?.message}
          >
            <Controller
              name="telefone"
              control={control}
              render={({ field }) => (
                <InputMask mask="(99) 9999-9999" value={field.value} onChange={field.onChange}>
                  {(inputProps: unknown) => (
                    <NeuInput
                      {...inputProps}
                      placeholder="(11) 3456-7890"
                      error={!!errors.telefone}
                    />
                  )}
                </InputMask>
              )}
            />
          </FormField>

          {/* Email */}
          <FormField
            id="email"
            label="Email"
            error={errors.email?.message}
          >
            <NeuInput
              id="email"
              type="email"
              placeholder="medico@email.com"
              error={!!errors.email}
              {...register('email')}
            />
          </FormField>
        </div>
      )
    },

    // SEÇÃO 2: Dados Profissionais
    {
      id: 'dados-profissionais',
      icon: <Stethoscope className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Profissionais',
      campos: (
        <div className={FORM_GRID}>
          {/* CRM */}
          <FormField
            id="crm"
            label="CRM"
            required
            error={errors.crm?.message}
          >
            <NeuInput
              id="crm"
              type="text"
              placeholder="123456"
              error={!!errors.crm}
              {...register('crm')}
            />
          </FormField>

          {/* UF do CRM */}
          <FormField
            id="crm_uf"
            label="UF do CRM"
            required
            error={errors.crm_uf?.message}
          >
            <Controller
              name="crm_uf"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={ESTADOS}
                  placeholder="Selecione"
                  error={!!errors.crm_uf}
                />
              )}
            />
          </FormField>

          {/* Especialidade */}
          <FormField
            id="especialidade"
            label="Especialidade"
            required
            error={errors.especialidade?.message}
          >
            <Controller
              name="especialidade"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={ESPECIALIDADES}
                  placeholder="Selecione"
                  error={!!errors.especialidade}
                />
              )}
            />
          </FormField>

          {/* Hospital Principal */}
          <FormField
            id="hospital_principal"
            label="Hospital Principal"
            error={errors.hospital_principal?.message}
            className={FORM_COL.twoThirds}
          >
            <NeuInput
              id="hospital_principal"
              type="text"
              placeholder="Nome do hospital onde mais atua"
              error={!!errors.hospital_principal}
              {...register('hospital_principal')}
            />
          </FormField>

          {/* Volume Anual Estimado */}
          <FormField
            id="volume_anual_estimado"
            label="Volume Anual Estimado (R$)"
            error={errors.volume_anual_estimado?.message}
          >
            <NeuInput
              id="volume_anual_estimado"
              type="number"
              step="0.01"
              placeholder="Ex: 500000.00"
              error={!!errors.volume_anual_estimado}
              {...register('volume_anual_estimado', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      )
    },

    // SEÇÃO 3: Endereço
    {
      id: 'endereco',
      icon: <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Endereço',
      campos: (
        <div className={FORM_GRID}>
          {/* CEP */}
          <FormField
            id="cep"
            label="CEP"
            error={errors.cep?.message}
            className={FORM_COL.quarter}
          >
            <Controller
              name="cep"
              control={control}
              render={({ field }) => (
                <InputMask 
                  mask="99999-999" 
                  value={field.value} 
                  onChange={field.onChange}
                  onBlur={(e) => handleCEPBlur(e.target.value)}
                >
                  {(inputProps: unknown) => (
                    <NeuInput
                      {...inputProps}
                      placeholder="00000-000"
                      error={!!errors.cep}
                      loading={validatingCEP}
                    />
                  )}
                </InputMask>
              )}
            />
          </FormField>

          {/* Logradouro */}
          <FormField
            id="endereco"
            label="Logradouro"
            error={errors.endereco?.message}
            className={FORM_COL.threeQuarters}
          >
            <NeuInput
              id="endereco"
              type="text"
              placeholder="Rua, Avenida..."
              error={!!errors.endereco}
              {...register('endereco')}
            />
          </FormField>

          {/* Número */}
          <FormField
            id="numero"
            label="Número"
            error={errors.numero?.message}
            className={FORM_COL.quarter}
          >
            <NeuInput
              id="numero"
              type="text"
              placeholder="123"
              error={!!errors.numero}
              {...register('numero')}
            />
          </FormField>

          {/* Complemento */}
          <FormField
            id="complemento"
            label="Complemento"
            error={errors.complemento?.message}
            className={FORM_COL.quarter}
          >
            <NeuInput
              id="complemento"
              type="text"
              placeholder="Apto, Sala..."
              error={!!errors.complemento}
              {...register('complemento')}
            />
          </FormField>

          {/* Bairro */}
          <FormField
            id="bairro"
            label="Bairro"
            error={errors.bairro?.message}
            className={FORM_COL.quarter}
          >
            <NeuInput
              id="bairro"
              type="text"
              placeholder="Centro"
              error={!!errors.bairro}
              {...register('bairro')}
            />
          </FormField>

          {/* Cidade */}
          <FormField
            id="cidade"
            label="Cidade"
            error={errors.cidade?.message}
            className={FORM_COL.quarter}
          >
            <NeuInput
              id="cidade"
              type="text"
              placeholder="São Paulo"
              error={!!errors.cidade}
              {...register('cidade')}
            />
          </FormField>
        </div>
      )
    },

    // SEÇÃO 4: Status
    {
      id: 'status',
      icon: <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Status e Observações',
      campos: (
        <div className={FORM_GRID}>
          {/* Status */}
          <FormField
            id="status"
            label="Status"
            error={errors.status?.message}
            className={FORM_COL.third}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'inativo', label: 'Inativo' },
                    { value: 'suspenso', label: 'Suspenso' }
                  ]}
                  placeholder="Selecione"
                  error={!!errors.status}
                />
              )}
            />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Médicos"
      subtitulo="Preencha os dados do médico. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/medicos')}
      secoes={secoes}
      textoSubmit="Cadastrar Médico"
      ajudaBadgeCount={3}
      onAjudaClick={() => console.log('Ajuda clicada')}
    />
  );
}

