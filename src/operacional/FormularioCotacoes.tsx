/**
 * FORMULÁRIO DE COTAÇÕES - OraclusX DS Neumorphic 3D
 * 
 * Criação de cotações multi-fornecedor
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaCotacao = z.object({
  numero: z.string().min(1, 'Número é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['preco', 'proposta', 'orcamento']).optional(),
  data_abertura: z.string().optional(),
  data_fechamento: z.string().min(1, 'Data de fechamento é obrigatória'),
  data_limite_resposta: z.string().optional(),
  condicoes_pagamento: z.string().optional(),
  prazo_entrega_dias: z.number().optional(),
  local_entrega: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['rascunho', 'enviada', 'em_analise', 'finalizada', 'cancelada']).optional()
});

type FormCotacaoData = z.infer<typeof schemaCotacao>;

export default function FormularioCotacoes() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormCotacaoData>({
    resolver: zodResolver(schemaCotacao),
    defaultValues: { tipo: 'preco', status: 'rascunho' }
  });

  const onSubmit = async (data: FormCotacaoData) => {
    try {
      const result = await insertRecord('cotacoes', data);
      
      if (result.success) {
        toast.success('Cotação criada com sucesso!');
        navigate('/compras/cotacoes');
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
      icon: <Search className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados da Cotação',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="numero" label="Número da Cotação" required error={errors.numero?.message}>
            <NeuInput id="numero" placeholder="Ex: COT-2025-001" error={!!errors.numero} {...register('numero')} />
          </FormField>

          <FormField id="tipo" label="Tipo" className={FORM_COL.twoThirds}>
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'preco', label: 'Cotação de Preço' },
                { value: 'proposta', label: 'Proposta Comercial' },
                { value: 'orcamento', label: 'Orçamento' }
              ]} />
            )} />
          </FormField>

          <FormField id="descricao" label="Descrição" className={FORM_COL.full}>
            <NeuTextarea id="descricao" placeholder="Descreva o que está sendo cotado..." {...register('descricao')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'prazos',
      icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Prazos e Datas',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="data_abertura" label="Data de Abertura">
            <NeuInput id="data_abertura" type="date" {...register('data_abertura')} />
          </FormField>

          <FormField id="data_limite_resposta" label="Limite para Respostas">
            <NeuInput id="data_limite_resposta" type="date" {...register('data_limite_resposta')} />
          </FormField>

          <FormField id="data_fechamento" label="Data de Fechamento" required error={errors.data_fechamento?.message}>
            <NeuInput id="data_fechamento" type="date" error={!!errors.data_fechamento} {...register('data_fechamento')} />
          </FormField>

          <FormField id="prazo_entrega_dias" label="Prazo de Entrega (dias)">
            <NeuInput id="prazo_entrega_dias" type="number" placeholder="30" {...register('prazo_entrega_dias', { valueAsNumber: true })} />
          </FormField>
        </div>
      )
    },
    {
      id: 'condicoes',
      icon: <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Condições e Observações',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="condicoes_pagamento" label="Condições de Pagamento" className={FORM_COL.full}>
            <NeuTextarea id="condicoes_pagamento" placeholder="Ex: 30/60/90 dias..." {...register('condicoes_pagamento')} />
          </FormField>

          <FormField id="local_entrega" label="Local de Entrega" className={FORM_COL.full}>
            <NeuInput id="local_entrega" placeholder="Endereço de entrega..." {...register('local_entrega')} />
          </FormField>

          <FormField id="status" label="Status" className={FORM_COL.full}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'rascunho', label: 'Rascunho' },
                { value: 'enviada', label: 'Enviada' },
                { value: 'em_analise', label: 'Em Análise' },
                { value: 'finalizada', label: 'Finalizada' },
                { value: 'cancelada', label: 'Cancelada' }
              ]} />
            )} />
          </FormField>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea id="observacoes" placeholder="Informações adicionais..." {...register('observacoes')} />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cotação de Fornecedores"
      subtitulo="Preencha os dados da cotação. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/compras/cotacoes')}
      secoes={secoes}
      textoSubmit="Criar Cotação"
    />
  );
}

