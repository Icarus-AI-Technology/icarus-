/**
 * FORMULÁRIO DE NOTAS FISCAIS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de notas fiscais (entrada/saída)
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, User, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaNotaFiscal = z.object({
  tipo: z.enum(['entrada', 'saida', 'devolucao']),
  modelo: z.string().optional(),
  serie: z.string().optional(),
  numero: z.string().min(1, 'Número da NF é obrigatório'),
  chave_acesso: z.string().optional(),
  fornecedor_cnpj: z.string().optional(),
  fornecedor_nome: z.string().optional(),
  destinatario_cnpj: z.string().optional(),
  destinatario_nome: z.string().optional(),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_entrada_saida: z.string().optional(),
  natureza_operacao: z.string().optional(),
  cfop: z.string().optional(),
  valor_produtos: z.number().min(0),
  valor_frete: z.number().optional(),
  valor_seguro: z.number().optional(),
  valor_desconto: z.number().optional(),
  valor_outras_despesas: z.number().optional(),
  valor_icms: z.number().optional(),
  valor_ipi: z.number().optional(),
  valor_pis: z.number().optional(),
  valor_cofins: z.number().optional(),
  valor_total: z.number().min(0),
  status: z.enum(['rascunho', 'emitida', 'recebida', 'cancelada']).optional(),
  status_sefaz: z.enum(['pendente', 'autorizada', 'cancelada', 'denegada', 'rejeitada']).optional(),
  observacoes: z.string().optional(),
  observacoes_internas: z.string().optional()
});

type FormNotaFiscalData = z.infer<typeof schemaNotaFiscal>;

export default function FormularioNotasFiscais() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormNotaFiscalData>({
    resolver: zodResolver(schemaNotaFiscal),
    defaultValues: { tipo: 'saida', status: 'rascunho', status_sefaz: 'pendente', modelo: '55', valor_frete: 0, valor_seguro: 0, valor_desconto: 0, valor_outras_despesas: 0, valor_icms: 0, valor_ipi: 0, valor_pis: 0, valor_cofins: 0 }
  });

  const onSubmit = async (data: FormNotaFiscalData) => {
    try {
      const result = await insertRecord('notas_fiscais', data);
      
      if (result.success) {
        toast.success('Nota fiscal criada com sucesso!');
        navigate('/faturamento/notas-fiscais');
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
      icon: <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos da NF-e',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="tipo" label="Tipo de NF" required>
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'entrada', label: 'Entrada' },
                { value: 'saida', label: 'Saída' },
                { value: 'devolucao', label: 'Devolução' }
              ]} />
            )} />
          </FormField>

          <FormField id="modelo" label="Modelo">
            <NeuInput id="modelo" placeholder="55" {...register('modelo')} />
          </FormField>

          <FormField id="serie" label="Série">
            <NeuInput id="serie" placeholder="1" {...register('serie')} />
          </FormField>

          <FormField id="numero" label="Número" required error={errors.numero?.message}>
            <NeuInput id="numero" placeholder="000001" error={!!errors.numero} {...register('numero')} />
          </FormField>

          <FormField id="chave_acesso" label="Chave de Acesso" className={FORM_COL.quarter} helpText="44 dígitos">
            <NeuInput id="chave_acesso" placeholder="12345678901234567890123456789012345678901234" {...register('chave_acesso')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'partes',
      icon: <User className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Emitente e Destinatário',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="fornecedor_nome" label="Nome do Emitente/Fornecedor">
            <NeuInput id="fornecedor_nome" placeholder="Razão Social" {...register('fornecedor_nome')} />
          </FormField>

          <FormField id="fornecedor_cnpj" label="CNPJ do Emitente">
            <NeuInput id="fornecedor_cnpj" placeholder="00.000.000/0000-00" {...register('fornecedor_cnpj')} />
          </FormField>

          <FormField id="destinatario_nome" label="Nome do Destinatário">
            <NeuInput id="destinatario_nome" placeholder="Razão Social" {...register('destinatario_nome')} />
          </FormField>

          <FormField id="destinatario_cnpj" label="CNPJ do Destinatário">
            <NeuInput id="destinatario_cnpj" placeholder="00.000.000/0000-00" {...register('destinatario_cnpj')} />
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
          <FormField id="valor_produtos" label="Valor dos Produtos (R$)" required error={errors.valor_produtos?.message}>
            <NeuInput id="valor_produtos" type="number" step="0.01" placeholder="0.00" error={!!errors.valor_produtos} {...register('valor_produtos', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_frete" label="Frete (R$)">
            <NeuInput id="valor_frete" type="number" step="0.01" placeholder="0.00" {...register('valor_frete', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_seguro" label="Seguro (R$)">
            <NeuInput id="valor_seguro" type="number" step="0.01" placeholder="0.00" {...register('valor_seguro', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_desconto" label="Desconto (R$)">
            <NeuInput id="valor_desconto" type="number" step="0.01" placeholder="0.00" {...register('valor_desconto', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_icms" label="ICMS (R$)">
            <NeuInput id="valor_icms" type="number" step="0.01" placeholder="0.00" {...register('valor_icms', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_ipi" label="IPI (R$)">
            <NeuInput id="valor_ipi" type="number" step="0.01" placeholder="0.00" {...register('valor_ipi', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_pis" label="PIS (R$)">
            <NeuInput id="valor_pis" type="number" step="0.01" placeholder="0.00" {...register('valor_pis', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_cofins" label="COFINS (R$)">
            <NeuInput id="valor_cofins" type="number" step="0.01" placeholder="0.00" {...register('valor_cofins', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_total" label="Valor Total (R$)" required error={errors.valor_total?.message} className={FORM_COL.quarter}>
            <NeuInput id="valor_total" type="number" step="0.01" placeholder="0.00" error={!!errors.valor_total} {...register('valor_total', { valueAsNumber: true })} />
          </FormField>
        </div>
      )
    },
    {
      id: 'fiscal',
      icon: <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Informações Fiscais',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="natureza_operacao" label="Natureza da Operação">
            <NeuInput id="natureza_operacao" placeholder="Ex: Venda de produção do estabelecimento" {...register('natureza_operacao')} />
          </FormField>

          <FormField id="cfop" label="CFOP">
            <NeuInput id="cfop" placeholder="Ex: 5.101" {...register('cfop')} />
          </FormField>

          <FormField id="data_emissao" label="Data de Emissão" required error={errors.data_emissao?.message}>
            <NeuInput id="data_emissao" type="date" error={!!errors.data_emissao} {...register('data_emissao')} />
          </FormField>

          <FormField id="status" label="Status">
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'rascunho', label: 'Rascunho' },
                { value: 'emitida', label: 'Emitida' },
                { value: 'recebida', label: 'Recebida' },
                { value: 'cancelada', label: 'Cancelada' }
              ]} />
            )} />
          </FormField>

          <FormField id="status_sefaz" label="Status SEFAZ" className={FORM_COL.twoThirds}>
            <Controller name="status_sefaz" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'autorizada', label: 'Autorizada' },
                { value: 'cancelada', label: 'Cancelada' },
                { value: 'denegada', label: 'Denegada' },
                { value: 'rejeitada', label: 'Rejeitada' }
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
      titulo="Nota Fiscal Eletrônica"
      subtitulo="Preencha os dados da NF-e. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/faturamento/notas-fiscais')}
      secoes={secoes}
      textoSubmit="Emitir NF-e"
      ajudaBadgeCount={6}
    />
  );
}

