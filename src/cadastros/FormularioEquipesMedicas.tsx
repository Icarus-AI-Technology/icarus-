/**
 * FORMULÁRIO DE EQUIPES MÉDICAS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro de equipes médicas multidisciplinares
 * 
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaEquipe = z.object({
  nome: z.string().min(3, 'Nome da equipe é obrigatório'),
  codigo: z.string().optional(),
  especialidade_principal: z.string().optional(),
  lider_id: z.string().optional(),
  descricao: z.string().optional(),
  hospital_principal: z.string().optional(),
  ativo: z.boolean().optional(),
  observacoes: z.string().optional()
});

type FormEquipeData = z.infer<typeof schemaEquipe>;

const ESPECIALIDADES = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'cirurgia_geral', label: 'Cirurgia Geral' }
];

export default function FormularioEquipesMedicas() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormEquipeData>({
    resolver: zodResolver(schemaEquipe),
    defaultValues: { ativo: true }
  });

  const onSubmit = async (data: FormEquipeData) => {
    try {
      const result = await insertRecord('equipes_medicas', data);
      
      if (result.success) {
        toast.success('Equipe médica cadastrada com sucesso!');
        navigate('/cadastros/equipes');
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
      icon: <Users className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados da Equipe',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="nome" label="Nome da Equipe" required error={errors.nome?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="nome" placeholder="Ex: Equipe Cardiovascular A" error={!!errors.nome} {...register('nome')} />
          </FormField>

          <FormField id="codigo" label="Código">
            <NeuInput id="codigo" placeholder="Ex: EQ-001" {...register('codigo')} />
          </FormField>

          <FormField id="especialidade_principal" label="Especialidade Principal">
            <Controller name="especialidade_principal" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={ESPECIALIDADES} placeholder="Selecione" />
            )} />
          </FormField>

          <FormField id="hospital_principal" label="Hospital Principal" className={FORM_COL.twoThirds}>
            <NeuInput id="hospital_principal" placeholder="Buscar hospital..." {...register('hospital_principal')} />
          </FormField>

          <FormField id="descricao" label="Descrição" className={FORM_COL.full}>
            <NeuTextarea id="descricao" placeholder="Descreva a equipe e sua atuação..." {...register('descricao')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'lideranca',
      icon: <User className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Liderança',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="lider_id" label="Líder da Equipe" helpText="Médico responsável">
            <NeuInput id="lider_id" placeholder="Buscar médico..." {...register('lider_id')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'observacoes',
      icon: <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Observações',
      campos: (
        <div className="grid gap-6">
          <FormField id="observacoes" label="Observações">
            <NeuTextarea id="observacoes" placeholder="Informações adicionais sobre a equipe..." {...register('observacoes')} />
          </FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Equipes Médicas"
      subtitulo="Preencha os dados da equipe. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/equipes')}
      secoes={secoes}
      textoSubmit="Cadastrar Equipe"
    />
  );
}

