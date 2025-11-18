/**
 * FORMULÁRIO DE PACIENTES - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de pacientes com LGPD
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, Phone, MapPin, Heart, Shield } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaPaciente = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  sexo: z.enum(['M', 'F', 'outro', 'nao_informado']).optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  peso: z.number().optional(),
  altura: z.number().optional(),
  tipo_sanguineo: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  alergias: z.string().optional(),
  comorbidades: z.string().optional(),
  medicamentos_uso: z.string().optional(),
  observacoes_medicas: z.string().optional(),
  consentimento_lgpd: z.boolean().refine(val => val === true, 'Consentimento LGPD é obrigatório'),
  status: z.enum(['ativo', 'inativo', 'bloqueado', 'anonimizado']).optional()
});

type FormPacienteData = z.infer<typeof schemaPaciente>;

const ESTADOS = [
  { value: 'SP', label: 'São Paulo' }, { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'MG', label: 'Minas Gerais' },
  { value: 'BA', label: 'Bahia' }, { value: 'PR', label: 'Paraná' }, { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'SC', label: 'Santa Catarina' }, { value: 'GO', label: 'Goiás' }, { value: 'PE', label: 'Pernambuco' }
];

export default function FormularioPacientes() {
  const navigate = useNavigate();
  const [validatingCEP, setValidatingCEP] = useState(false);

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormPacienteData>({
    resolver: zodResolver(schemaPaciente),
    defaultValues: { sexo: 'M', tipo_sanguineo: 'O+', status: 'ativo', consentimento_lgpd: false }
  });

  const onSubmit = async (data: FormPacienteData) => {
    try {
      const result = await insertRecord('pacientes', data);
      
      if (result.success) {
        toast.success('Paciente cadastrado com sucesso!');
        navigate('/cadastros/pacientes');
      } else {
        throw result.error;
      }
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error));
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
      } finally {
        setValidatingCEP(false);
      }
    }
  };

  const secoes = [
    {
      id: 'dados-pessoais',
      icon: <UserCheck className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Pessoais',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="nome_completo" label="Nome Completo" required error={errors.nome_completo?.message} className={FORM_COL.full}>
            <NeuInput id="nome_completo" placeholder="Ex: Maria Silva Santos" error={!!errors.nome_completo} {...register('nome_completo')} />
          </FormField>

          <FormField id="cpf" label="CPF" error={errors.cpf?.message}>
            <Controller name="cpf" control={control} render={({ field }) => (
              <InputMask mask="999.999.999-99" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="000.000.000-00" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="rg" label="RG" error={errors.rg?.message}>
            <NeuInput id="rg" placeholder="00.000.000-0" {...register('rg')} />
          </FormField>

          <FormField id="data_nascimento" label="Data de Nascimento" error={errors.data_nascimento?.message}>
            <NeuInput id="data_nascimento" type="date" error={!!errors.data_nascimento} {...register('data_nascimento')} />
          </FormField>

          <FormField id="sexo" label="Sexo" error={errors.sexo?.message} className={FORM_COL.full}>
            <Controller name="sexo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Feminino' },
                { value: 'outro', label: 'Outro' },
                { value: 'nao_informado', label: 'Prefiro não informar' }
              ]} />
            )} />
          </FormField>
        </div>
      )
    },
    {
      id: 'contato',
      icon: <Phone className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Contato',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="telefone" label="Telefone" error={errors.telefone?.message}>
            <Controller name="telefone" control={control} render={({ field }) => (
              <InputMask mask="(99) 9999-9999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="(11) 3456-7890" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="celular" label="Celular" error={errors.celular?.message}>
            <Controller name="celular" control={control} render={({ field }) => (
              <InputMask mask="(99) 99999-9999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="(11) 98765-4321" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message}>
            <NeuInput id="email" type="email" placeholder="paciente@email.com" error={!!errors.email} {...register('email')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'endereco',
      icon: <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Endereço',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="cep" label="CEP" error={errors.cep?.message} className={FORM_COL.quarter}>
            <Controller name="cep" control={control} render={({ field }) => (
              <InputMask mask="99999-999" value={field.value} onChange={field.onChange} onBlur={(e) => handleCEPBlur(e.target.value)}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00000-000" loading={validatingCEP} />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="endereco" label="Logradouro" className={FORM_COL.threeQuarters}>
            <NeuInput id="endereco" placeholder="Rua, Avenida..." {...register('endereco')} />
          </FormField>

          <FormField id="numero" label="Número" className={FORM_COL.quarter}><NeuInput id="numero" placeholder="123" {...register('numero')} /></FormField>
          <FormField id="complemento" label="Complemento" className={FORM_COL.quarter}><NeuInput id="complemento" {...register('complemento')} /></FormField>
          <FormField id="bairro" label="Bairro" className={FORM_COL.quarter}><NeuInput id="bairro" {...register('bairro')} /></FormField>
          <FormField id="cidade" label="Cidade" className={FORM_COL.quarter}><NeuInput id="cidade" {...register('cidade')} /></FormField>
        </div>
      )
    },
    {
      id: 'dados-clinicos',
      icon: <Heart className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Informações de Saúde',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="peso" label="Peso (kg)"><NeuInput id="peso" type="number" step="0.1" placeholder="70.5" {...register('peso', { valueAsNumber: true })} /></FormField>
          <FormField id="altura" label="Altura (m)"><NeuInput id="altura" type="number" step="0.01" placeholder="1.75" {...register('altura', { valueAsNumber: true })} /></FormField>
          
          <FormField id="tipo_sanguineo" label="Tipo Sanguíneo">
            <Controller name="tipo_sanguineo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
              ]} />
            )} />
          </FormField>

          <FormField id="alergias" label="Alergias" className={FORM_COL.full}>
            <NeuTextarea id="alergias" placeholder="Descreva alergias conhecidas..." {...register('alergias')} />
          </FormField>

          <FormField id="comorbidades" label="Comorbidades" className={FORM_COL.full}>
            <NeuTextarea id="comorbidades" placeholder="Descreva comorbidades..." {...register('comorbidades')} />
          </FormField>

          <FormField id="medicamentos_uso" label="Medicamentos em Uso" className={FORM_COL.full}>
            <NeuTextarea id="medicamentos_uso" placeholder="Lista de medicamentos..." {...register('medicamentos_uso')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'lgpd',
      icon: <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Consentimento LGPD',
      campos: (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsla(var(--primary),0.25)] bg-[hsla(var(--primary),0.12)] p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Controller
                name="consentimento_lgpd"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1 h-5 w-5 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                  />
                )}
              />
              <div className="flex-1">
                <p className="orx-text-sm orx-font-medium text-[hsl(var(--text-primary))]">
                  Autorizo o tratamento dos meus dados pessoais <span className="text-[hsl(var(--destructive))]">*</span>
                </p>
                <p className="mt-1 orx-text-xs text-[hsl(var(--text-muted))]">
                  Conforme Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), autorizo o tratamento dos meus dados pessoais para fins de atendimento médico e gestão hospitalar.
                </p>
              </div>
            </label>
            {errors.consentimento_lgpd && (
              <p className="mt-2 orx-text-sm text-[hsl(var(--destructive))]">{errors.consentimento_lgpd.message}</p>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Pacientes"
      subtitulo="Preencha os dados do paciente. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/pacientes')}
      secoes={secoes}
      textoSubmit="Cadastrar Paciente"
      ajudaBadgeCount={4}
    />
  );
}

