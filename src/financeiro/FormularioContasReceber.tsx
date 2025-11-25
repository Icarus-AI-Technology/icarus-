/**
 * FORMULÁRIO DE CONTAS A RECEBER - OraclusX DS Neumorphic 3D
 *
 * Cadastro completo de contas a receber
 *
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, User, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaContaReceber = z.object({
  numero: z.string().min(1, 'Número do documento é obrigatório'),
  descricao: z.string().min(3, 'Descrição é obrigatória'),
  tipo: z.enum(['venda', 'servico', 'consignacao', 'aluguel', 'outro']).optional(),
  cliente_nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  cliente_cnpj: z.string().optional(),
  cliente_id: z.string().optional(),
  valor_original: z.number().min(0, 'Valor deve ser positivo'),
  valor_juros: z.number().optional(),
  valor_desconto: z.number().optional(),
  valor_recebido: z.number().optional(),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_recebimento: z.string().optional(),
  categoria: z.string().optional(),
  forma_recebimento: z
    .enum([
      'dinheiro',
      'pix',
      'boleto',
      'transferencia',
      'cartao_credito',
      'cartao_debito',
      'cheque',
    ])
    .optional(),
  numero_parcela: z.number().optional(),
  total_parcelas: z.number().optional(),
  status: z
    .enum(['pendente', 'recebido', 'atrasado', 'cancelado', 'parcial', 'protesto'])
    .optional(),
  boleto_url: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormContaReceberData = z.infer<typeof schemaContaReceber>;

export default function FormularioContasReceber() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormContaReceberData>({
    resolver: zodResolver(schemaContaReceber),
    defaultValues: {
      tipo: 'venda',
      status: 'pendente',
      forma_recebimento: 'boleto',
      valor_juros: 0,
      valor_desconto: 0,
    },
  });

  const onSubmit = async (data: FormContaReceberData) => {
    try {
      const result = await insertRecord('contas_receber', data);

      if (result.success) {
        toast.success('Conta a receber criada com sucesso!');
        navigate('/financeiro/contas-receber');
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
          <FormField
            id="numero"
            label="Número do Documento"
            required
            error={errors.numero?.message}
          >
            <NeuInput
              id="numero"
              placeholder="Ex: 2025/001"
              error={!!errors.numero}
              {...register('numero')}
            />
          </FormField>

          <FormField id="tipo" label="Tipo" className={FORM_COL.twoThirds}>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'venda', label: 'Venda' },
                    { value: 'servico', label: 'Serviço' },
                    { value: 'consignacao', label: 'Consignação' },
                    { value: 'aluguel', label: 'Aluguel' },
                    { value: 'outro', label: 'Outro' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField
            id="descricao"
            label="Descrição"
            required
            error={errors.descricao?.message}
            className={FORM_COL.full}
          >
            <NeuInput
              id="descricao"
              placeholder="Ex: Venda de materiais OPME - Cirurgia 001"
              error={!!errors.descricao}
              {...register('descricao')}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'cliente',
      icon: <User className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Cliente',
      campos: (
        <div className={FORM_GRID}>
          <FormField
            id="cliente_nome"
            label="Nome do Cliente"
            required
            error={errors.cliente_nome?.message}
            className={FORM_COL.twoThirds}
          >
            <NeuInput
              id="cliente_nome"
              placeholder="Ex: Hospital São Lucas"
              error={!!errors.cliente_nome}
              {...register('cliente_nome')}
            />
          </FormField>

          <FormField id="cliente_cnpj" label="CNPJ/CPF">
            <NeuInput
              id="cliente_cnpj"
              placeholder="00.000.000/0000-00"
              {...register('cliente_cnpj')}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'valores',
      icon: <DollarSign className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Valores',
      campos: (
        <div className={FORM_GRID}>
          <FormField
            id="valor_original"
            label="Valor Original (R$)"
            required
            error={errors.valor_original?.message}
          >
            <NeuInput
              id="valor_original"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={!!errors.valor_original}
              {...register('valor_original', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="valor_desconto" label="Desconto (R$)">
            <NeuInput
              id="valor_desconto"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('valor_desconto', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="valor_juros" label="Juros (R$)">
            <NeuInput
              id="valor_juros"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('valor_juros', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="valor_recebido" label="Valor Recebido (R$)">
            <NeuInput
              id="valor_recebido"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('valor_recebido', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'datas',
      icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Datas',
      campos: (
        <div className={FORM_GRID}>
          <FormField
            id="data_emissao"
            label="Data de Emissão"
            required
            error={errors.data_emissao?.message}
          >
            <NeuInput
              id="data_emissao"
              type="date"
              error={!!errors.data_emissao}
              {...register('data_emissao')}
            />
          </FormField>

          <FormField
            id="data_vencimento"
            label="Data de Vencimento"
            required
            error={errors.data_vencimento?.message}
          >
            <NeuInput
              id="data_vencimento"
              type="date"
              error={!!errors.data_vencimento}
              {...register('data_vencimento')}
            />
          </FormField>

          <FormField id="data_recebimento" label="Data de Recebimento">
            <NeuInput id="data_recebimento" type="date" {...register('data_recebimento')} />
          </FormField>
        </div>
      ),
    },
    {
      id: 'pagamento',
      icon: <CreditCard className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Forma de Recebimento e Status',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="forma_recebimento" label="Forma de Recebimento">
            <Controller
              name="forma_recebimento"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'dinheiro', label: 'Dinheiro' },
                    { value: 'pix', label: 'PIX' },
                    { value: 'boleto', label: 'Boleto' },
                    { value: 'transferencia', label: 'Transferência' },
                    { value: 'cartao_credito', label: 'Cartão de Crédito' },
                    { value: 'cartao_debito', label: 'Cartão de Débito' },
                    { value: 'cheque', label: 'Cheque' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField id="numero_parcela" label="Parcela">
            <NeuInput
              id="numero_parcela"
              type="number"
              placeholder="1"
              {...register('numero_parcela', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="total_parcelas" label="Total de Parcelas">
            <NeuInput
              id="total_parcelas"
              type="number"
              placeholder="1"
              {...register('total_parcelas', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="status" label="Status" className={FORM_COL.full}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'pendente', label: 'Pendente' },
                    { value: 'recebido', label: 'Recebido' },
                    { value: 'atrasado', label: 'Atrasado' },
                    { value: 'cancelado', label: 'Cancelado' },
                    { value: 'parcial', label: 'Recebimento Parcial' },
                    { value: 'protesto', label: 'Em Protesto' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea
              id="observacoes"
              placeholder="Informações adicionais..."
              {...register('observacoes')}
            />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <FormTemplate
      titulo="Contas a Receber"
      subtitulo="Preencha os dados da conta a receber. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/financeiro/contas-receber')}
      secoes={secoes}
      textoSubmit="Cadastrar Conta"
      ajudaBadgeCount={2}
    />
  );
}
