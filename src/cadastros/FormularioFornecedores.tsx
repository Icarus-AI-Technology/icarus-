/**
 * FORMULÁRIO DE FORNECEDORES - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de fornecedores OPME
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaFornecedor = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional().or(z.literal('')),
  categoria: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  volume_compras: z.number().optional(),
  status: z.enum(['ativo', 'inativo', 'bloqueado']).optional()
});

type FormFornecedorData = z.infer<typeof schemaFornecedor>;

const CATEGORIAS = [
  { value: 'implantes_ortopedicos', label: 'Implantes Ortopédicos' },
  { value: 'implantes_cardiacos', label: 'Implantes Cardíacos' },
  { value: 'materiais_neurocirurgia', label: 'Materiais de Neurocirurgia' },
  { value: 'proteses', label: 'Próteses' },
  { value: 'instrumentais', label: 'Instrumentais Cirúrgicos' },
  { value: 'descartaveis', label: 'Materiais Descartáveis' }
];

const ESTADOS = [
  { value: 'SP', label: 'São Paulo' }, { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'MG', label: 'Minas Gerais' }
];


export default function FormularioFornecedores() {
  const navigate = useNavigate();
  const [validatingCEP, setValidatingCEP] = useState(false);

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormFornecedorData>({
    resolver: zodResolver(schemaFornecedor),
    defaultValues: { status: 'ativo', rating: 0 }
  });

  const onSubmit = async (data: FormFornecedorData) => {
    try {
      const result = await insertRecord('fornecedores', data);
      
      if (result.success) {
        toast.success('Fornecedor cadastrado com sucesso!');
        navigate('/cadastros/fornecedores');
      } else {
        throw result.error;
      }
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error));
    }
  };

  const secoes = [
    {
      id: 'dados-basicos',
      icon: <Truck className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="nome" label="Razão Social/Nome Fantasia" required error={errors.nome?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="nome" placeholder="Ex: Distribuidora OPME LTDA" error={!!errors.nome} {...register('nome')} />
          </FormField>

          <FormField id="cnpj" label="CNPJ" error={errors.cnpj?.message} className={FORM_COL.third}>
            <Controller name="cnpj" control={control} render={({ field }) => (
              <InputMask mask="99.999.999/9999-99" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00.000.000/0000-00" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="categoria" label="Categoria" error={errors.categoria?.message} className={FORM_COL.third}>
            <Controller name="categoria" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={CATEGORIAS} placeholder="Selecione" />
            )} />
          </FormField>

          <FormField id="rating" label="Avaliação (0-5)" error={errors.rating?.message} className={FORM_COL.third}>
            <NeuInput id="rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" {...register('rating', { valueAsNumber: true })} />
          </FormField>

          <FormField id="status" label="Status" error={errors.status?.message} className={FORM_COL.third}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' },
                { value: 'bloqueado', label: 'Bloqueado' }
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
          <FormField id="telefone" label="Telefone" className={FORM_COL.half}>
            <Controller name="telefone" control={control} render={({ field }) => (
              <InputMask mask="(99) 9999-9999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="(11) 3456-7890" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message} className={FORM_COL.half}>
            <NeuInput id="email" type="email" placeholder="comercial@fornecedor.com" error={!!errors.email} {...register('email')} />
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
          <FormField id="cep" label="CEP" className={FORM_COL.quarter}>
            <Controller name="cep" control={control} render={({ field }) => (
              <InputMask mask="99999-999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00000-000" />}
              </InputMask>
            )} />
          </FormField>
          <FormField id="endereco" label="Logradouro" className={FORM_COL.threeQuarters}><NeuInput id="endereco" {...register('endereco')} /></FormField>
          <FormField id="numero" label="Número" className={FORM_COL.quarter}><NeuInput id="numero" {...register('numero')} /></FormField>
          <FormField id="complemento" label="Complemento" className={FORM_COL.quarter}><NeuInput id="complemento" {...register('complemento')} /></FormField>
          <FormField id="bairro" label="Bairro" className={FORM_COL.quarter}><NeuInput id="bairro" {...register('bairro')} /></FormField>
          <FormField id="cidade" label="Cidade" className={FORM_COL.quarter}><NeuInput id="cidade" {...register('cidade')} /></FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Fornecedores"
      subtitulo="Preencha os dados do fornecedor OPME. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/fornecedores')}
      secoes={secoes}
      textoSubmit="Cadastrar Fornecedor"
    />
  );
}

