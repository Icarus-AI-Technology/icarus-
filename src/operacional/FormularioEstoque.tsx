/**
 * FORMULÁRIO DE MOVIMENTAÇÃO DE ESTOQUE - OraclusX DS Neumorphic 3D
 *
 * Cadastro de movimentações de estoque (entrada/saída)
 *
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, TrendingUp, TrendingDown, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaEstoque = z.object({
  tipo: z.enum([
    'entrada_compra',
    'entrada_devolucao',
    'entrada_transferencia',
    'entrada_ajuste',
    'saida_venda',
    'saida_consignacao',
    'saida_transferencia',
    'saida_perda',
    'saida_ajuste',
    'reserva',
    'liberacao_reserva',
    'inventario',
  ]),
  produto_id: z.string().min(1, 'Produto é obrigatório'),
  lote_id: z.string().optional(),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  valor_unitario: z.number().optional(),
  valor_total: z.number().optional(),
  localizacao: z.string().optional(),
  secao: z.string().optional(),
  corredor: z.string().optional(),
  prateleira: z.string().optional(),
  documento_tipo: z.string().optional(),
  documento_numero: z.string().optional(),
  motivo: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormEstoqueData = z.infer<typeof schemaEstoque>;

export default function FormularioEstoque() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormEstoqueData>({
    resolver: zodResolver(schemaEstoque),
    defaultValues: { tipo: 'entrada_compra' },
  });

  const tipoMovimentacao = watch('tipo');

  const onSubmit = async (data: FormEstoqueData) => {
    try {
      const result = await insertRecord('estoque_movimentacoes', data);

      if (result.success) {
        toast.success('Movimentação registrada com sucesso!');
        navigate('/estoque/movimentacoes');
      } else {
        throw result.error;
      }
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error));
    }
  };

  const getTipoIcon = () => {
    if (tipoMovimentacao?.startsWith('entrada')) {
      return <TrendingUp className="w-6 h-6 text-green-600" />;
    } else if (tipoMovimentacao?.startsWith('saida')) {
      return <TrendingDown className="w-6 h-6 text-red-600" />;
    }
    return <Package className="h-6 w-6 text-[hsl(var(--primary))]" />;
  };

  const secoes = [
    {
      id: 'tipo-movimentacao',
      icon: getTipoIcon(),
      titulo: 'Tipo de Movimentação',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="tipo" label="Tipo de Movimentação" required className={FORM_COL.twoThirds}>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'entrada_compra', label: '⬆️ Entrada - Compra' },
                    { value: 'entrada_devolucao', label: '⬆️ Entrada - Devolução' },
                    { value: 'entrada_transferencia', label: '⬆️ Entrada - Transferência' },
                    { value: 'entrada_ajuste', label: '⬆️ Entrada - Ajuste' },
                    { value: 'saida_venda', label: '⬇️ Saída - Venda' },
                    { value: 'saida_consignacao', label: '⬇️ Saída - Consignação' },
                    { value: 'saida_transferencia', label: '⬇️ Saída - Transferência' },
                    { value: 'saida_perda', label: '⬇️ Saída - Perda' },
                    { value: 'saida_ajuste', label: '⬇️ Saída - Ajuste' },
                    { value: 'reserva', label: '🔒 Reserva' },
                    { value: 'liberacao_reserva', label: '🔓 Liberação de Reserva' },
                    { value: 'inventario', label: '📊 Inventário' },
                  ]}
                />
              )}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'produto',
      icon: <Package className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Produto e Lote',
      campos: (
        <div className={FORM_GRID}>
          <FormField
            id="produto_id"
            label="Produto"
            required
            error={errors.produto_id?.message}
            className={FORM_COL.twoThirds}
          >
            <NeuInput
              id="produto_id"
              placeholder="Buscar produto..."
              error={!!errors.produto_id}
              {...register('produto_id')}
            />
          </FormField>

          <FormField id="lote_id" label="Lote (Opcional)">
            <NeuInput id="lote_id" placeholder="Buscar lote..." {...register('lote_id')} />
          </FormField>

          <FormField id="quantidade" label="Quantidade" required error={errors.quantidade?.message}>
            <NeuInput
              id="quantidade"
              type="number"
              placeholder="1"
              error={!!errors.quantidade}
              {...register('quantidade', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="valor_unitario" label="Valor Unitário (R$)">
            <NeuInput
              id="valor_unitario"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('valor_unitario', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="valor_total" label="Valor Total (R$)">
            <NeuInput
              id="valor_total"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('valor_total', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'localizacao',
      icon: <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Localização Física',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="localizacao" label="Armazém/Localização">
            <NeuInput
              id="localizacao"
              placeholder="Ex: Armazém Principal"
              {...register('localizacao')}
            />
          </FormField>

          <FormField id="secao" label="Seção">
            <NeuInput id="secao" placeholder="Ex: A" {...register('secao')} />
          </FormField>

          <FormField id="corredor" label="Corredor">
            <NeuInput id="corredor" placeholder="Ex: 01" {...register('corredor')} />
          </FormField>

          <FormField id="prateleira" label="Prateleira">
            <NeuInput id="prateleira" placeholder="Ex: 03" {...register('prateleira')} />
          </FormField>
        </div>
      ),
    },
    {
      id: 'documento',
      icon: <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Documento e Observações',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="documento_tipo" label="Tipo de Documento">
            <NeuInput
              id="documento_tipo"
              placeholder="Ex: NF-e, Pedido..."
              {...register('documento_tipo')}
            />
          </FormField>

          <FormField
            id="documento_numero"
            label="Número do Documento"
            className={FORM_COL.twoThirds}
          >
            <NeuInput
              id="documento_numero"
              placeholder="Ex: 12345"
              {...register('documento_numero')}
            />
          </FormField>

          <FormField id="motivo" label="Motivo" className={FORM_COL.full}>
            <NeuInput
              id="motivo"
              placeholder="Ex: Compra planejada, Ajuste de inventário..."
              {...register('motivo')}
            />
          </FormField>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea
              id="observacoes"
              placeholder="Informações adicionais sobre a movimentação..."
              {...register('observacoes')}
            />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <FormTemplate
      titulo="Movimentação de Estoque"
      subtitulo="Registre entradas, saídas e ajustes de estoque. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/estoque/movimentacoes')}
      secoes={secoes}
      textoSubmit="Registrar Movimentação"
      ajudaBadgeCount={2}
    />
  );
}
