/**
 * FORMULÁRIO DE CIRURGIAS - OraclusX DS Neumorphic 3D
 *
 * Agendamento completo de cirurgias
 *
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaCirurgia = z.object({
  codigo_interno: z.string().optional(),
  medico_id: z.string().optional(),
  hospital_id: z.string().optional(),
  paciente_iniciais: z.string().min(2, 'Informe as iniciais do paciente'),
  procedimento: z.string().min(3, 'Descreva o procedimento'),
  data_cirurgia: z.string().min(1, 'Data é obrigatória'),
  hora_cirurgia: z.string().optional(),
  sala: z.string().optional(),
  status: z
    .enum([
      'agendada',
      'confirmada',
      'preparacao',
      'andamento',
      'recuperacao',
      'concluida',
      'cancelada',
    ])
    .optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
  valor_estimado: z.number().optional(),
  observacoes: z.string().optional(),
});

type FormCirurgiaData = z.infer<typeof schemaCirurgia>;

export default function FormularioCirurgias() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormCirurgiaData>({
    resolver: zodResolver(schemaCirurgia),
    defaultValues: { status: 'agendada', prioridade: 'media' },
  });

  const onSubmit = async (data: FormCirurgiaData) => {
    try {
      const result = await insertRecord('cirurgias', data);

      if (result.success) {
        toast.success('Cirurgia agendada com sucesso!');
        navigate('/cirurgias');
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
      icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados da Cirurgia',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="codigo_interno" label="Código Interno">
            <NeuInput
              id="codigo_interno"
              placeholder="Ex: CIR-2025-001"
              {...register('codigo_interno')}
            />
          </FormField>

          <FormField
            id="procedimento"
            label="Procedimento"
            required
            error={errors.procedimento?.message}
            className={FORM_COL.twoThirds}
          >
            <NeuInput
              id="procedimento"
              placeholder="Ex: Artroplastia Total de Joelho"
              error={!!errors.procedimento}
              {...register('procedimento')}
            />
          </FormField>

          <FormField
            id="paciente_iniciais"
            label="Iniciais do Paciente"
            required
            error={errors.paciente_iniciais?.message}
            helpText="Proteção LGPD - use apenas iniciais"
          >
            <NeuInput
              id="paciente_iniciais"
              placeholder="Ex: M.S.S."
              error={!!errors.paciente_iniciais}
              {...register('paciente_iniciais')}
            />
          </FormField>

          <FormField
            id="data_cirurgia"
            label="Data da Cirurgia"
            required
            error={errors.data_cirurgia?.message}
          >
            <NeuInput
              id="data_cirurgia"
              type="date"
              error={!!errors.data_cirurgia}
              {...register('data_cirurgia')}
            />
          </FormField>

          <FormField id="hora_cirurgia" label="Hora">
            <NeuInput id="hora_cirurgia" type="time" {...register('hora_cirurgia')} />
          </FormField>

          <FormField id="sala" label="Sala Cirúrgica" className={FORM_COL.twoThirds}>
            <NeuInput id="sala" placeholder="Ex: Sala 3 - Centro Cirúrgico" {...register('sala')} />
          </FormField>

          <FormField id="prioridade" label="Prioridade">
            <Controller
              name="prioridade"
              control={control}
              render={({ field }) => (
                <NeuSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'baixa', label: 'Baixa' },
                    { value: 'media', label: 'Média' },
                    { value: 'alta', label: 'Alta' },
                    { value: 'urgente', label: 'Urgente' },
                  ]}
                />
              )}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'responsaveis',
      icon: <User className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Médico e Hospital',
      campos: (
        <div className={FORM_GRID}>
          <FormField
            id="medico_id"
            label="Médico Responsável"
            helpText="Selecione o médico cirurgião"
          >
            <NeuInput id="medico_id" placeholder="Buscar médico..." {...register('medico_id')} />
          </FormField>

          <FormField id="hospital_id" label="Hospital">
            <NeuInput
              id="hospital_id"
              placeholder="Buscar hospital..."
              {...register('hospital_id')}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'financeiro',
      icon: <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Informações Financeiras e Observações',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="valor_estimado" label="Valor Estimado (R$)">
            <NeuInput
              id="valor_estimado"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('valor_estimado', { valueAsNumber: true })}
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
                    { value: 'agendada', label: 'Agendada' },
                    { value: 'confirmada', label: 'Confirmada' },
                    { value: 'preparacao', label: 'Em Preparação' },
                    { value: 'andamento', label: 'Em Andamento' },
                    { value: 'recuperacao', label: 'Recuperação' },
                    { value: 'concluida', label: 'Concluída' },
                    { value: 'cancelada', label: 'Cancelada' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField id="observacoes" label="Observações" className={FORM_COL.full}>
            <NeuTextarea
              id="observacoes"
              placeholder="Informações adicionais sobre a cirurgia..."
              {...register('observacoes')}
            />
          </FormField>
        </div>
      ),
    },
  ];

  return (
    <FormTemplate
      titulo="Agendamento de Cirurgias"
      subtitulo="Preencha os dados da cirurgia. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cirurgias')}
      secoes={secoes}
      textoSubmit="Agendar Cirurgia"
      ajudaBadgeCount={5}
    />
  );
}
