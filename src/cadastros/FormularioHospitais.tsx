/**
 * FORMULÁRIO DE HOSPITAIS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de hospitais/clínicas
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

import { FormTemplate, FormField, NeuInput, NeuSelect } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

// SCHEMA ZOD
const schemaHospital = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional().or(z.literal('')),
  tipo: z.enum(['hospital', 'clinica', 'centro_cirurgico']).optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional()
});

type FormHospitalData = z.infer<typeof schemaHospital>;

const ESTADOS = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AM', label: 'Amazonas' },
  { value: 'AP', label: 'Amapá' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' }, { value: 'MG', label: 'Minas Gerais' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MT', label: 'Mato Grosso' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
  { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' }, { value: 'PR', label: 'Paraná' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' }, { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SE', label: 'Sergipe' }, { value: 'SP', label: 'São Paulo' }, { value: 'TO', label: 'Tocantins' }
];

export default function FormularioHospitais() {
  const navigate = useNavigate();
  const [validatingCEP, setValidatingCEP] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormHospitalData>({
    resolver: zodResolver(schemaHospital),
    defaultValues: { tipo: 'hospital', status: 'ativo' }
  });

  const onSubmit = async (data: FormHospitalData) => {
    try {
      const result = await insertRecord('hospitais', data);
      
      if (result.success) {
        toast.success('Hospital cadastrado com sucesso!');
        navigate('/cadastros/hospitais');
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
      } catch (error) {
        console.warn('Erro ao buscar CEP');
      } finally {
        setValidatingCEP(false);
      }
    }
  };

  const secoes = [
    {
      id: 'dados-basicos',
      icon: <Building className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="nome" label="Nome do Hospital/Clínica" required error={errors.nome?.message} className={FORM_COL.full}>
            <NeuInput id="nome" placeholder="Ex: Hospital São Lucas" error={!!errors.nome} {...register('nome')} />
          </FormField>

          <FormField id="cnpj" label="CNPJ" error={errors.cnpj?.message}>
            <Controller name="cnpj" control={control} render={({ field }) => (
              <InputMask mask="99.999.999/9999-99" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00.000.000/0000-00" error={!!errors.cnpj} />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="tipo" label="Tipo" error={errors.tipo?.message}>
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'hospital', label: 'Hospital' },
                { value: 'clinica', label: 'Clínica' },
                { value: 'centro_cirurgico', label: 'Centro Cirúrgico' }
              ]} placeholder="Selecione" error={!!errors.tipo} />
            )} />
          </FormField>

          <FormField id="status" label="Status" error={errors.status?.message}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' }
              ]} placeholder="Selecione" error={!!errors.status} />
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
          <FormField id="telefone" label="Telefone" error={errors.telefone?.message} className={FORM_COL.half}>
            <Controller name="telefone" control={control} render={({ field }) => (
              <InputMask mask="(99) 9999-9999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="(11) 3456-7890" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message} className={FORM_COL.half}>
            <NeuInput id="email" type="email" placeholder="contato@hospital.com" error={!!errors.email} {...register('email')} />
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

          <FormField id="endereco" label="Logradouro" error={errors.endereco?.message} className={FORM_COL.threeQuarters}>
            <NeuInput id="endereco" placeholder="Rua, Avenida..." {...register('endereco')} />
          </FormField>

          <FormField id="numero" label="Número" error={errors.numero?.message} className={FORM_COL.quarter}>
            <NeuInput id="numero" placeholder="123" {...register('numero')} />
          </FormField>

          <FormField id="complemento" label="Complemento" error={errors.complemento?.message} className={FORM_COL.quarter}>
            <NeuInput id="complemento" placeholder="Bloco, Torre..." {...register('complemento')} />
          </FormField>

          <FormField id="bairro" label="Bairro" error={errors.bairro?.message} className={FORM_COL.quarter}>
            <NeuInput id="bairro" {...register('bairro')} />
          </FormField>

          <FormField id="cidade" label="Cidade" error={errors.cidade?.message} className={FORM_COL.quarter}>
            <NeuInput id="cidade" {...register('cidade')} />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Hospitais e Clínicas"
      subtitulo="Preencha os dados do hospital/clínica. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/hospitais')}
      secoes={secoes}
      textoSubmit="Cadastrar Hospital"
      ajudaBadgeCount={2}
    />
  );
}

