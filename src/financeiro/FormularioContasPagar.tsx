/**
 * FORMULÁRIO DE CONTAS A PAGAR - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de contas a pagar
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Truck, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaContaPagar = z.object({
  numero: z.string().min(1, 'Número do documento é obrigatório'),
  descricao: z.string().min(3, 'Descrição é obrigatória'),
  tipo: z.enum(['fornecedor', 'folha', 'tributo', 'servico', 'aluguel', 'financiamento', 'outro']).optional(),
  fornecedor_nome: z.string().optional(),
  fornecedor_cnpj: z.string().optional(),
  fornecedor_id: z.string().optional(),
  numero_documento: z.string().optional(),
  valor_original: z.number().min(0, 'Valor deve ser positivo'),
  valor_juros: z.number().optional(),
  valor_multa: z.number().optional(),
  valor_desconto: z.number().optional(),
  valor_pago: z.number().optional(),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_pagamento: z.string().optional(),
  categoria: z.string().optional(),
  forma_pagamento: z.enum(['dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque']).optional(),
  numero_parcela: z.number().optional(),
  total_parcelas: z.number().optional(),
  status: z.enum(['pendente', 'agendado', 'pago', 'atrasado', 'cancelado', 'parcial']).optional(),
  observacoes: z.string().optional()
});

type FormContaPagarData = z.infer<typeof schemaContaPagar>;

export default function FormularioContasPagar() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormContaPagarData>({
    resolver: zodResolver(schemaContaPagar),
    defaultValues: { tipo: 'fornecedor', status: 'pendente', forma_pagamento: 'transferencia', valor_juros: 0, valor_multa: 0, valor_desconto: 0 }
  });

  const onSubmit = async (data: FormContaPagarData) => {
    try {
      const result = await insertRecord('contas_pagar', data);
      
      if (result.success) {
        toast.success('Conta a pagar criada com sucesso!');
        navigate('/financeiro/contas-pagar');
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
      icon: <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="numero" label="Número do Documento" required error={errors.numero?.message}>
            <NeuInput id="numero" placeholder="Ex: 2025/001" error={!!errors.numero} {...register('numero')} />
          </FormField>

          <FormField id="tipo" label="Tipo" className={FORM_COL.twoThirds}>
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'fornecedor', label: 'Fornecedor' },
                { value: 'folha', label: 'Folha de Pagamento' },
                { value: 'tributo', label: 'Tributo' },
                { value: 'servico', label: 'Serviço' },
                { value: 'aluguel', label: 'Aluguel' },
                { value: 'financiamento', label: 'Financiamento' },
                { value: 'outro', label: 'Outro' }
              ]} />
            )} />
          </FormField>

          <FormField id="descricao" label="Descrição" required error={errors.descricao?.message} className={FORM_COL.full}>
            <NeuInput id="descricao" placeholder="Ex: Compra de materiais OPME - NF 12345" error={!!errors.descricao} {...register('descricao')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'fornecedor',
      icon: <Truck className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Fornecedor',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="fornecedor_nome" label="Nome do Fornecedor" className={FORM_COL.twoThirds}>
            <NeuInput id="fornecedor_nome" placeholder="Ex: Distribuidora ABC" {...register('fornecedor_nome')} />
          </FormField>

          <FormField id="fornecedor_cnpj" label="CNPJ">
            <NeuInput id="fornecedor_cnpj" placeholder="00.000.000/0000-00" {...register('fornecedor_cnpj')} />
          </FormField>

          <FormField id="numero_documento" label="Número da Nota Fiscal">
            <NeuInput id="numero_documento" placeholder="Ex: 12345" {...register('numero_documento')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'valores',
      icon: <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Valores',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="valor_original" label="Valor Original (R$)" required error={errors.valor_original?.message}>
            <NeuInput id="valor_original" type="number" step="0.01" placeholder="0.00" error={!!errors.valor_original} {...register('valor_original', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_desconto" label="Desconto (R$)">
            <NeuInput id="valor_desconto" type="number" step="0.01" placeholder="0.00" {...register('valor_desconto', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_juros" label="Juros (R$)">
            <NeuInput id="valor_juros" type="number" step="0.01" placeholder="0.00" {...register('valor_juros', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_multa" label="Multa (R$)">
            <NeuInput id="valor_multa" type="number" step="0.01" placeholder="0.00" {...register('valor_multa', { valueAsNumber: true })} />
          </FormField>
        </div>
      )
    },
    {
      id: 'datas',
      icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Datas',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="data_emissao" label="Data de Emissão" required error={errors.data_emissao?.message}>
            <NeuInput id="data_emissao" type="date" error={!!errors.data_emissao} {...register('data_emissao')} />
          </FormField>

          <FormField id="data_vencimento" label="Data de Vencimento" required error={errors.data_vencimento?.message}>
            <NeuInput id="data_vencimento" type="date" error={!!errors.data_vencimento} {...register('data_vencimento')} />
          </FormField>

          <FormField id="data_pagamento" label="Data de Pagamento">
            <NeuInput id="data_pagamento" type="date" {...register('data_pagamento')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'pagamento',
      icon: <CreditCard className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Forma de Pagamento e Status',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="forma_pagamento" label="Forma de Pagamento">
            <Controller name="forma_pagamento" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'dinheiro', label: 'Dinheiro' },
                { value: 'pix', label: 'PIX' },
                { value: 'boleto', label: 'Boleto' },
                { value: 'transferencia', label: 'Transferência' },
                { value: 'cartao_credito', label: 'Cartão de Crédito' },
                { value: 'cartao_debito', label: 'Cartão de Débito' },
                { value: 'cheque', label: 'Cheque' }
              ]} />
            )} />
          </FormField>

          <FormField id="numero_parcela" label="Parcela">
            <NeuInput id="numero_parcela" type="number" placeholder="1" {...register('numero_parcela', { valueAsNumber: true })} />
          </FormField>

          <FormField id="total_parcelas" label="Total">
            <NeuInput id="total_parcelas" type="number" placeholder="1" {...register('total_parcelas', { valueAsNumber: true })} />
          </FormField>

          <FormField id="status" label="Status" className={FORM_COL.full}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'agendado', label: 'Agendado' },
                { value: 'pago', label: 'Pago' },
                { value: 'atrasado', label: 'Atrasado' },
                { value: 'cancelado', label: 'Cancelado' },
                { value: 'parcial', label: 'Pagamento Parcial' }
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
      titulo="Contas a Pagar"
      subtitulo="Preencha os dados da conta a pagar. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/financeiro/contas-pagar')}
      secoes={secoes}
      textoSubmit="Cadastrar Conta"
    />
  );
}

