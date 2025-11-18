/**
 * FORMULÁRIO DE CONVÊNIOS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de convênios e planos de saúde
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Phone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaConvenio = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  razao_social: z.string().optional(),
  cnpj: z.string().optional(),
  ans_registro: z.string().optional(),
  tipo: z.enum(['plano_saude', 'operadora', 'autogestao', 'cooperativa', 'particular']).optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  site: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  prazo_pagamento_dias: z.number().optional(),
  percentual_desconto: z.number().min(0).max(100).optional(),
  observacoes: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'suspenso', 'em_negociacao']).optional()
});

type FormConvenioData = z.infer<typeof schemaConvenio>;

export default function FormularioConvenios() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormConvenioData>({
    resolver: zodResolver(schemaConvenio),
    defaultValues: { tipo: 'plano_saude', status: 'ativo', prazo_pagamento_dias: 30, percentual_desconto: 0 }
  });

  const onSubmit = async (data: FormConvenioData) => {
    try {
      const result = await insertRecord('convenios', data);
      
      if (result.success) {
        toast.success('Convênio cadastrado com sucesso!');
        navigate('/cadastros/convenios');
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
      icon: <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="nome" label="Nome do Convênio" required error={errors.nome?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="nome" placeholder="Ex: Unimed São Paulo" error={!!errors.nome} {...register('nome')} />
          </FormField>

          <FormField id="tipo" label="Tipo" className={FORM_COL.third}>
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'plano_saude', label: 'Plano de Saúde' },
                { value: 'operadora', label: 'Operadora' },
                { value: 'autogestao', label: 'Autogestão' },
                { value: 'cooperativa', label: 'Cooperativa' },
                { value: 'particular', label: 'Particular' }
              ]} />
            )} />
          </FormField>

          <FormField id="razao_social" label="Razão Social" className={FORM_COL.twoThirds}>
            <NeuInput id="razao_social" {...register('razao_social')} />
          </FormField>

          <FormField id="cnpj" label="CNPJ" className={FORM_COL.third}>
            <Controller name="cnpj" control={control} render={({ field }) => (
              <InputMask mask="99.999.999/9999-99" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00.000.000/0000-00" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="ans_registro" label="Registro ANS" className={FORM_COL.twoThirds}>
            <NeuInput id="ans_registro" placeholder="Ex: 123456" {...register('ans_registro')} />
          </FormField>

          <FormField id="status" label="Status" className={FORM_COL.third}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' },
                { value: 'suspenso', label: 'Suspenso' },
                { value: 'em_negociacao', label: 'Em Negociação' }
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
          <FormField id="telefone" label="Telefone" className={FORM_COL.third}>
            <Controller name="telefone" control={control} render={({ field }) => (
              <InputMask mask="(99) 9999-9999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="(11) 3456-7890" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message} className={FORM_COL.third}>
            <NeuInput id="email" type="email" placeholder="contato@convenio.com" error={!!errors.email} {...register('email')} />
          </FormField>

          <FormField id="site" label="Site" className={FORM_COL.third}>
            <NeuInput id="site" type="url" placeholder="https://www.convenio.com" {...register('site')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'comercial',
      icon: <CreditCard className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Condições Comerciais',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="prazo_pagamento_dias" label="Prazo de Pagamento (dias)" className={FORM_COL.third}>
            <NeuInput id="prazo_pagamento_dias" type="number" placeholder="30" {...register('prazo_pagamento_dias', { valueAsNumber: true })} />
          </FormField>

          <FormField id="percentual_desconto" label="Desconto (%)" error={errors.percentual_desconto?.message} className={FORM_COL.third}>
            <NeuInput id="percentual_desconto" type="number" step="0.01" placeholder="0.00" error={!!errors.percentual_desconto} {...register('percentual_desconto', { valueAsNumber: true })} />
          </FormField>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea id="observacoes" placeholder="Informações adicionais sobre o convênio..." {...register('observacoes')} />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Convênios"
      subtitulo="Preencha os dados do convênio. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/convenios')}
      secoes={secoes}
      textoSubmit="Cadastrar Convênio"
    />
  );
}

