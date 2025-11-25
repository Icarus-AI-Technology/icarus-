/**
 * FORMULÁRIO DE PEDIDOS DE COMPRA - OraclusX DS Neumorphic 3D
 *
 * Cadastro completo de pedidos de compra
 *
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaPedido = z.object({
  numero: z.string().min(1, 'Número do pedido é obrigatório'),
  fornecedor_id: z.string().optional(),
  data_pedido: z.string().optional(),
  data_entrega_prevista: z.string().optional(),
  valor_total: z.number().min(0, 'Valor deve ser positivo'),
  status: z
    .enum(['rascunho', 'aguardando', 'aprovado', 'processando', 'entregue', 'cancelado'])
    .optional(),
  urgencia: z.enum(['normal', 'urgente', 'critico']).optional(),
  observacoes: z.string().optional(),
});

type FormPedidoData = z.infer<typeof schemaPedido>;

export default function FormularioPedidosCompra() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormPedidoData>({
    resolver: zodResolver(schemaPedido),
    defaultValues: { status: 'rascunho', urgencia: 'normal' },
  });

  const onSubmit = async (data: FormPedidoData) => {
    try {
      const result = await insertRecord('pedidos_compra', data);

      if (result.success) {
        toast.success('Pedido de compra criado com sucesso!');
        navigate('/compras/pedidos');
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
      icon: <ShoppingCart className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados do Pedido',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="numero" label="Número do Pedido" required error={errors.numero?.message}>
            <NeuInput
              id="numero"
              placeholder="Ex: PC-2025-001"
              error={!!errors.numero}
              {...register('numero')}
            />
          </FormField>

          <FormField
            id="fornecedor_id"
            label="Fornecedor"
            className={FORM_COL.twoThirds}
            helpText="Busque e selecione o fornecedor"
          >
            <NeuInput
              id="fornecedor_id"
              placeholder="Buscar fornecedor..."
              {...register('fornecedor_id')}
            />
          </FormField>

          <FormField id="urgencia" label="Urgência">
            <Controller
              name="urgencia"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'urgente', label: 'Urgente' },
                    { value: 'critico', label: 'Crítico' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField id="status" label="Status" className={FORM_COL.twoThirds}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'rascunho', label: 'Rascunho' },
                    { value: 'aguardando', label: 'Aguardando Aprovação' },
                    { value: 'aprovado', label: 'Aprovado' },
                    { value: 'processando', label: 'Processando' },
                    { value: 'entregue', label: 'Entregue' },
                    { value: 'cancelado', label: 'Cancelado' },
                  ]}
                />
              )}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'datas',
      icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Datas e Prazos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="data_pedido" label="Data do Pedido">
            <NeuInput id="data_pedido" type="date" {...register('data_pedido')} />
          </FormField>

          <FormField id="data_entrega_prevista" label="Data de Entrega Prevista">
            <NeuInput
              id="data_entrega_prevista"
              type="date"
              {...register('data_entrega_prevista')}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'financeiro',
      icon: <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Informações Financeiras',
      campos: (
        <div className={FORM_GRID}>
          <FormField
            id="valor_total"
            label="Valor Total (R$)"
            required
            error={errors.valor_total?.message}
          >
            <NeuInput
              id="valor_total"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={!!errors.valor_total}
              {...register('valor_total', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea
              id="observacoes"
              placeholder="Informações adicionais sobre o pedido..."
              {...register('observacoes')}
            />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <FormTemplate
      titulo="Pedido de Compra"
      subtitulo="Preencha os dados do pedido. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/compras/pedidos')}
      secoes={secoes}
      textoSubmit="Criar Pedido"
      ajudaBadgeCount={3}
    />
  );
}
