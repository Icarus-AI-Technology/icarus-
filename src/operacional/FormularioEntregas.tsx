/**
 * FORMULÁRIO DE ENTREGAS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro completo de entregas logísticas
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaEntrega = z.object({
  numero: z.string().min(1, 'Número da entrega é obrigatório'),
  tipo: z.enum(['venda', 'consignacao', 'devolucao', 'transferencia', 'demonstracao', 'garantia', 'outro']),
  destinatario_nome: z.string().min(1, 'Nome do destinatário é obrigatório'),
  destinatario_endereco: z.string().min(1, 'Endereço é obrigatório'),
  destinatario_cidade: z.string().min(1, 'Cidade é obrigatória'),
  destinatario_estado: z.string().min(1, 'Estado é obrigatório'),
  destinatario_cep: z.string().optional(),
  destinatario_telefone: z.string().optional(),
  data_programada: z.string().min(1, 'Data programada é obrigatória'),
  hora_programada: z.string().optional(),
  data_entrega_prevista: z.string().min(1, 'Data prevista é obrigatória'),
  tipo_transporte: z.enum(['proprio', 'transportadora', 'correios', 'motoboy', 'outro']).optional(),
  transportadora_nome: z.string().optional(),
  codigo_rastreamento: z.string().optional(),
  quantidade_volumes: z.number().optional(),
  peso_total: z.number().optional(),
  valor_declarado: z.number().optional(),
  temperatura_controlada: z.boolean().optional(),
  fragil: z.boolean().optional(),
  urgente: z.boolean().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  status: z.enum(['agendada', 'preparacao', 'em_transito', 'saiu_entrega', 'tentativa_falha', 'entregue', 'nao_entregue', 'devolvida', 'cancelada']).optional(),
  observacoes: z.string().optional(),
  instrucoes_especiais: z.string().optional()
});

type FormEntregaData = z.infer<typeof schemaEntrega>;

export default function FormularioEntregas() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormEntregaData>({
    resolver: zodResolver(schemaEntrega),
    defaultValues: { 
      tipo: 'venda', 
      tipo_transporte: 'transportadora', 
      status: 'agendada', 
      prioridade: 'media',
      quantidade_volumes: 1,
      temperatura_controlada: false,
      fragil: false,
      urgente: false
    }
  });

  const onSubmit = async (data: FormEntregaData) => {
    try {
      const result = await insertRecord('entregas', data);
      
      if (result.success) {
        toast.success('Entrega agendada com sucesso!');
        navigate('/logistica/entregas');
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
      titulo: 'Dados da Entrega',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="numero" label="Número da Entrega" required error={errors.numero?.message}>
            <NeuInput id="numero" placeholder="Ex: ENT-2025-001" error={!!errors.numero} {...register('numero')} />
          </FormField>

          <FormField id="tipo" label="Tipo de Entrega">
            <Controller name="tipo" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'venda', label: 'Venda' },
                { value: 'consignacao', label: 'Consignação' },
                { value: 'devolucao', label: 'Devolução' },
                { value: 'transferencia', label: 'Transferência' },
                { value: 'demonstracao', label: 'Demonstração' },
                { value: 'garantia', label: 'Garantia' },
                { value: 'outro', label: 'Outro' }
              ]} />
            )} />
          </FormField>

          <FormField id="status" label="Status">
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'agendada', label: 'Agendada' },
                { value: 'preparacao', label: 'Em Preparação' },
                { value: 'em_transito', label: 'Em Trânsito' },
                { value: 'saiu_entrega', label: 'Saiu para Entrega' },
                { value: 'entregue', label: 'Entregue' },
                { value: 'nao_entregue', label: 'Não Entregue' },
                { value: 'cancelada', label: 'Cancelada' }
              ]} />
            )} />
          </FormField>
        </div>
      )
    },
    {
      id: 'destinatario',
      icon: <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Destinatário',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="destinatario_nome" label="Nome do Destinatário" required error={errors.destinatario_nome?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="destinatario_nome" placeholder="Nome completo ou razão social" error={!!errors.destinatario_nome} {...register('destinatario_nome')} />
          </FormField>

          <FormField id="destinatario_telefone" label="Telefone">
            <NeuInput id="destinatario_telefone" placeholder="(11) 98765-4321" {...register('destinatario_telefone')} />
          </FormField>

          <FormField id="destinatario_endereco" label="Endereço Completo" required error={errors.destinatario_endereco?.message} className={FORM_COL.full}>
            <NeuInput id="destinatario_endereco" placeholder="Rua, número, complemento..." error={!!errors.destinatario_endereco} {...register('destinatario_endereco')} />
          </FormField>

          <FormField id="destinatario_cidade" label="Cidade" required error={errors.destinatario_cidade?.message}>
            <NeuInput id="destinatario_cidade" placeholder="São Paulo" error={!!errors.destinatario_cidade} {...register('destinatario_cidade')} />
          </FormField>

          <FormField id="destinatario_estado" label="Estado" required error={errors.destinatario_estado?.message}>
            <NeuInput id="destinatario_estado" placeholder="SP" maxLength={2} error={!!errors.destinatario_estado} {...register('destinatario_estado')} />
          </FormField>

          <FormField id="destinatario_cep" label="CEP">
            <NeuInput id="destinatario_cep" placeholder="00000-000" {...register('destinatario_cep')} />
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
          <FormField id="data_programada" label="Data Programada" required error={errors.data_programada?.message}>
            <NeuInput id="data_programada" type="date" error={!!errors.data_programada} {...register('data_programada')} />
          </FormField>

          <FormField id="hora_programada" label="Hora">
            <NeuInput id="hora_programada" type="time" {...register('hora_programada')} />
          </FormField>

          <FormField id="data_entrega_prevista" label="Previsão de Entrega" required error={errors.data_entrega_prevista?.message}>
            <NeuInput id="data_entrega_prevista" type="date" error={!!errors.data_entrega_prevista} {...register('data_entrega_prevista')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'transporte',
      icon: <Truck className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Transporte',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="tipo_transporte" label="Tipo de Transporte">
            <Controller name="tipo_transporte" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'proprio', label: 'Próprio' },
                { value: 'transportadora', label: 'Transportadora' },
                { value: 'correios', label: 'Correios' },
                { value: 'motoboy', label: 'Motoboy' },
                { value: 'outro', label: 'Outro' }
              ]} />
            )} />
          </FormField>

          <FormField id="transportadora_nome" label="Nome da Transportadora">
            <NeuInput id="transportadora_nome" placeholder="Ex: JadLog" {...register('transportadora_nome')} />
          </FormField>

          <FormField id="codigo_rastreamento" label="Código de Rastreamento">
            <NeuInput id="codigo_rastreamento" placeholder="BR123456789BR" {...register('codigo_rastreamento')} />
          </FormField>

          <FormField id="quantidade_volumes" label="Quantidade de Volumes">
            <NeuInput id="quantidade_volumes" type="number" placeholder="1" {...register('quantidade_volumes', { valueAsNumber: true })} />
          </FormField>

          <FormField id="peso_total" label="Peso Total (kg)">
            <NeuInput id="peso_total" type="number" step="0.01" placeholder="0.00" {...register('peso_total', { valueAsNumber: true })} />
          </FormField>

          <FormField id="valor_declarado" label="Valor Declarado (R$)">
            <NeuInput id="valor_declarado" type="number" step="0.01" placeholder="0.00" {...register('valor_declarado', { valueAsNumber: true })} />
          </FormField>

          {/* Checkboxes */}
          <div className="lg:col-span-12 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Controller name="temperatura_controlada" control={control} render={({ field }) => (
                <input type="checkbox" checked={field.value} onChange={field.onChange}
                       className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" />
              )} />
              <span className="text-sm text-[hsl(var(--text-secondary))]">Temperatura Controlada</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Controller name="fragil" control={control} render={({ field }) => (
                <input type="checkbox" checked={field.value} onChange={field.onChange}
                       className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" />
              )} />
              <span className="text-sm text-[hsl(var(--text-secondary))]">Frágil</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Controller name="urgente" control={control} render={({ field }) => (
                <input type="checkbox" checked={field.value} onChange={field.onChange}
                       className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" />
              )} />
              <span className="text-sm text-[hsl(var(--text-secondary))]">Urgente</span>
            </label>
          </div>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea id="observacoes" placeholder="Informações adicionais sobre a entrega..." {...register('observacoes')} />
          </FormField>

          <FormField id="instrucoes_especiais" label="Instruções Especiais" className={FORM_COL.full}>
            <NeuTextarea id="instrucoes_especiais" placeholder="Instruções especiais para o motorista..." {...register('instrucoes_especiais')} />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Agendamento de Entrega"
      subtitulo="Preencha os dados da entrega. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/logistica/entregas')}
      secoes={secoes}
      textoSubmit="Agendar Entrega"
      ajudaBadgeCount={3}
    />
  );
}

