/**
 * FORMULÁRIO DE REMESSAS DE CONSIGNAÇÃO - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de remessas de materiais consignados
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Truck, Calendar, Building } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaRemessa = z.object({
  numero: z.string().min(1, 'Número da remessa é obrigatório'),
  tipo: z.enum(['envio', 'reposicao', 'transferencia']).optional(),
  contrato_consignacao_id: z.string().min(1, 'Contrato é obrigatório'),
  fornecedor_id: z.string().min(1, 'Fornecedor é obrigatório'),
  hospital_id: z.string().optional(),
  local_destino: z.string().min(1, 'Local de destino é obrigatório'),
  endereco_entrega: z.string().optional(),
  data_remessa: z.string().optional(),
  data_entrega_prevista: z.string().min(1, 'Data prevista é obrigatória'),
  data_entrega_realizada: z.string().optional(),
  data_vencimento_devolucao: z.string().optional(),
  responsavel_envio_id: z.string().optional(),
  responsavel_recebimento: z.string().optional(),
  valor_total_materiais: z.number().optional(),
  valor_frete: z.number().optional(),
  valor_total: z.number().optional(),
  transportadora: z.string().optional(),
  rastreamento: z.string().optional(),
  status: z.enum(['preparacao', 'enviada', 'em_transito', 'entregue', 'parcialmente_devolvida', 'totalmente_devolvida', 'faturada', 'cancelada']).optional(),
  observacoes: z.string().optional(),
  condicoes_especiais: z.string().optional()
});

type FormRemessaData = z.infer<typeof schemaRemessa>;

export default function FormularioRemessasConsignacao() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormRemessaData>({
    resolver: zodResolver(schemaRemessa),
    defaultValues: { tipo: 'envio', status: 'preparacao', valor_frete: 0 }
  });

  const onSubmit = async (data: FormRemessaData) => {
    try {
      const result = await insertRecord('remessas_consignacao', data);
      
      if (result.success) {
        toast.success('Remessa criada com sucesso!');
        navigate('/consignacao/remessas');
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
          <FormField id="numero" label="Número da Remessa" required error={errors.numero?.message}>
            <NeuInput id="numero" placeholder="Ex: REM-2025-001" error={!!errors.numero} {...register('numero')} />
          </FormField>

          <FormField id="tipo" label="Tipo">
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'envio', label: 'Envio' },
                { value: 'reposicao', label: 'Reposição' },
                { value: 'transferencia', label: 'Transferência' }
              ]} />
            )} />
          </FormField>

          <FormField id="status" label="Status">
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'preparacao', label: 'Em Preparação' },
                { value: 'enviada', label: 'Enviada' },
                { value: 'em_transito', label: 'Em Trânsito' },
                { value: 'entregue', label: 'Entregue' },
                { value: 'parcialmente_devolvida', label: 'Parcialmente Devolvida' },
                { value: 'totalmente_devolvida', label: 'Totalmente Devolvida' },
                { value: 'faturada', label: 'Faturada' },
                { value: 'cancelada', label: 'Cancelada' }
              ]} />
            )} />
          </FormField>

          <FormField id="contrato_consignacao_id" label="Contrato de Consignação" required error={errors.contrato_consignacao_id?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="contrato_consignacao_id" placeholder="Buscar contrato..." error={!!errors.contrato_consignacao_id} {...register('contrato_consignacao_id')} />
          </FormField>

          <FormField id="fornecedor_id" label="Fornecedor" required error={errors.fornecedor_id?.message}>
            <NeuInput id="fornecedor_id" placeholder="Buscar..." error={!!errors.fornecedor_id} {...register('fornecedor_id')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'destino',
      icon: <Building className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Destino',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="hospital_id" label="Hospital">
            <NeuInput id="hospital_id" placeholder="Buscar hospital..." {...register('hospital_id')} />
          </FormField>

          <FormField id="local_destino" label="Local de Destino" required error={errors.local_destino?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="local_destino" placeholder="Ex: Centro Cirúrgico - Sala 3" error={!!errors.local_destino} {...register('local_destino')} />
          </FormField>

          <FormField id="endereco_entrega" label="Endereço Completo de Entrega" className={FORM_COL.full}>
            <NeuTextarea id="endereco_entrega" placeholder="Endereço completo..." {...register('endereco_entrega')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'datas',
      icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Datas e Prazos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="data_remessa" label="Data da Remessa">
            <NeuInput id="data_remessa" type="date" {...register('data_remessa')} />
          </FormField>

          <FormField id="data_entrega_prevista" label="Entrega Prevista" required error={errors.data_entrega_prevista?.message}>
            <NeuInput id="data_entrega_prevista" type="date" error={!!errors.data_entrega_prevista} {...register('data_entrega_prevista')} />
          </FormField>

          <FormField id="data_entrega_realizada" label="Entrega Realizada">
            <NeuInput id="data_entrega_realizada" type="date" {...register('data_entrega_realizada')} />
          </FormField>

          <FormField id="data_vencimento_devolucao" label="Vencimento Devolução">
            <NeuInput id="data_vencimento_devolucao" type="date" {...register('data_vencimento_devolucao')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'transporte',
      icon: <Truck className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Transporte e Valores',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="transportadora" label="Transportadora">
            <NeuInput id="transportadora" placeholder="Ex: Correios, JadLog..." {...register('transportadora')} />
          </FormField>

          <FormField id="rastreamento" label="Código de Rastreamento" className={FORM_COL.twoThirds}>
            <NeuInput id="rastreamento" placeholder="Ex: BR123456789BR" {...register('rastreamento')} />
          </FormField>

          <FormField id="valor_total_materiais" label="Valor dos Materiais (R$)">
            <NeuInput id="valor_total_materiais" type="number" step="0.01" placeholder="0.00" {...register('valor_total_materiais', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_frete" label="Valor do Frete (R$)">
            <NeuInput id="valor_frete" type="number" step="0.01" placeholder="0.00" {...register('valor_frete', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_total" label="Valor Total (R$)">
            <NeuInput id="valor_total" type="number" step="0.01" placeholder="0.00" {...register('valor_total', { valueAsNumber: true })} />
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
      titulo="Remessas de Consignação"
      subtitulo="Preencha os dados da remessa. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/consignacao/remessas')}
      secoes={secoes}
      textoSubmit="Criar Remessa"
      ajudaBadgeCount={4}
    />
  );
}

