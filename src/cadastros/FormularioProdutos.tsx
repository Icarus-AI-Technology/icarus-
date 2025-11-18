/**
 * FORMULÁRIO DE PRODUTOS OPME - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de produtos com registro ANVISA
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Barcode, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaProduto = z.object({
  codigo_sku: z.string().min(1, 'Código SKU é obrigatório'),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  fabricante: z.string().optional(),
  registro_anvisa: z.string().optional(),
  categoria: z.string().optional(),
  subcategoria: z.string().optional(),
  unidade_medida: z.string().optional(),
  valor_unitario: z.number().min(0, 'Valor deve ser positivo').optional(),
  status: z.enum(['ativo', 'inativo', 'descontinuado']).optional()
});

type FormProdutoData = z.infer<typeof schemaProduto>;

const CATEGORIAS = [
  { value: 'implantes_ortopedicos', label: 'Implantes Ortopédicos' },
  { value: 'implantes_cardiacos', label: 'Implantes Cardíacos' },
  { value: 'materiais_neurocirurgia', label: 'Materiais de Neurocirurgia' },
  { value: 'proteses', label: 'Próteses' },
  { value: 'orteses', label: 'Órteses' },
  { value: 'instrumentais', label: 'Instrumentais Cirúrgicos' }
];

const UNIDADES = [
  { value: 'UN', label: 'Unidade (UN)' },
  { value: 'CX', label: 'Caixa (CX)' },
  { value: 'PC', label: 'Peça (PC)' },
  { value: 'KT', label: 'Kit (KT)' },
  { value: 'JG', label: 'Jogo (JG)' }
];

export default function FormularioProdutos() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormProdutoData>({
    resolver: zodResolver(schemaProduto),
    defaultValues: { status: 'ativo', unidade_medida: 'UN' }
  });

  const onSubmit = async (data: FormProdutoData) => {
    try {
      const result = await insertRecord('produtos', data);
      
      if (result.success) {
        toast.success('Produto cadastrado com sucesso!');
        navigate('/cadastros/produtos');
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
      icon: <Package className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="codigo_sku" label="Código SKU" required error={errors.codigo_sku?.message}>
            <NeuInput id="codigo_sku" placeholder="Ex: OPM-001" error={!!errors.codigo_sku} {...register('codigo_sku')} />
          </FormField>

          <FormField id="descricao" label="Descrição" required error={errors.descricao?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="descricao" placeholder="Ex: Parafuso Pedicular Titanio 5.5mm" error={!!errors.descricao} {...register('descricao')} />
          </FormField>

          <FormField id="fabricante" label="Fabricante" error={errors.fabricante?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="fabricante" placeholder="Ex: Medtronic" {...register('fabricante')} />
          </FormField>

          <FormField id="registro_anvisa" label="Registro ANVISA" error={errors.registro_anvisa?.message} className={FORM_COL.third}>
            <NeuInput id="registro_anvisa" placeholder="Ex: 80123456789" {...register('registro_anvisa')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'classificacao',
      icon: <Barcode className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Classificação',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="categoria" label="Categoria" className={FORM_COL.third}>
            <Controller name="categoria" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={CATEGORIAS} placeholder="Selecione" />
            )} />
          </FormField>

          <FormField id="subcategoria" label="Subcategoria" className={FORM_COL.third}>
            <NeuInput id="subcategoria" placeholder="Ex: Parafusos" {...register('subcategoria')} />
          </FormField>

          <FormField id="unidade_medida" label="Unidade" className={FORM_COL.third}>
            <Controller name="unidade_medida" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={UNIDADES} />
            )} />
          </FormField>
        </div>
      )
    },
    {
      id: 'valores',
      icon: <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Valores e Status',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="valor_unitario" label="Valor Unitário (R$)" error={errors.valor_unitario?.message} className={FORM_COL.third}>
            <NeuInput id="valor_unitario" type="number" step="0.01" placeholder="0.00" error={!!errors.valor_unitario} {...register('valor_unitario', { valueAsNumber: true })} />
          </FormField>

          <FormField id="status" label="Status" error={errors.status?.message} className={FORM_COL.twoThirds}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' },
                { value: 'descontinuado', label: 'Descontinuado' }
              ]} />
            )} />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Produtos OPME"
      subtitulo="Preencha os dados do produto. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/produtos')}
      secoes={secoes}
      textoSubmit="Cadastrar Produto"
    />
  );
}

