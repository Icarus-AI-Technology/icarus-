/**
 * FORMULÁRIO DE TRANSPORTADORAS - OraclusX DS Neumorphic 3D
 * 
 * Cadastro de transportadoras (Fornecedores tipo transporte)
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

import { FormTemplate, FormField, NeuInput, NeuSelect, NeuTextarea } from '@/components/forms';
import { FORM_GRID, FORM_COL } from '@/components/forms/formLayout';
import { insertRecord, getSupabaseErrorMessage } from '@/lib/form-helpers';

const schemaTransportadora = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cnpj: z.string().optional(),
  categoria: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['ativo', 'inativo', 'bloqueado']).optional()
});

type FormTransportadoraData = z.infer<typeof schemaTransportadora>;

export default function FormularioTransportadoras() {
  const navigate = useNavigate();
  const [validatingCEP, setValidatingCEP] = useState(false);

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormTransportadoraData>({
    resolver: zodResolver(schemaTransportadora),
    defaultValues: { categoria: 'transportadora', status: 'ativo', rating: 0 }
  });

  const onSubmit = async (data: FormTransportadoraData) => {
    try {
      const result = await insertRecord('fornecedores', { ...data, categoria: 'transportadora' });
      
      if (result.success) {
        toast.success('Transportadora cadastrada com sucesso!');
        navigate('/cadastros/transportadoras');
      } else {
        throw result.error;
      }
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error));
    }
  };

  const handleCEPBlur = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      setValidatingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue('endereco', data.logradouro);
          setValue('bairro', data.bairro);
          setValue('cidade', data.localidade);
          setValue('estado', data.uf);
        }
      } finally {
        setValidatingCEP(false);
      }
    }
  };

  const secoes = [
    {
      id: 'dados-basicos',
      icon: <Truck className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Dados Básicos',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="nome" label="Nome da Transportadora" required error={errors.nome?.message} className={FORM_COL.twoThirds}>
            <NeuInput id="nome" placeholder="Ex: Transportes Rápidos LTDA" error={!!errors.nome} {...register('nome')} />
          </FormField>

          <FormField id="cnpj" label="CNPJ">
            <Controller name="cnpj" control={control} render={({ field }) => (
              <InputMask mask="99.999.999/9999-99" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00.000.000/0000-00" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="rating" label="Avaliação (0-5)">
            <NeuInput id="rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" {...register('rating', { valueAsNumber: true })} />
          </FormField>

          <FormField id="status" label="Status" className={FORM_COL.twoThirds}>
            <Controller name="status" control={control} render={({ field }) => (
              <NeuSelect value={field.value} onValueChange={field.onChange} options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' },
                { value: 'bloqueado', label: 'Bloqueado' }
              ]} />
            )} />
          </FormField>
        </div>
      )
    },
    {
      id: 'contato',
      icon: <Phone className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Contato',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="telefone" label="Telefone">
            <Controller name="telefone" control={control} render={({ field }) => (
              <InputMask mask="(99) 9999-9999" value={field.value} onChange={field.onChange}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="(11) 3456-7890" />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message}>
            <NeuInput id="email" type="email" placeholder="contato@transportadora.com" error={!!errors.email} {...register('email')} />
          </FormField>
        </div>
      )
    },
    {
      id: 'endereco',
      icon: <MapPin className="h-6 w-6 text-[hsl(var(--primary))]" />,
      titulo: 'Endereço',
      campos: (
        <div className={FORM_GRID}>
          <FormField id="cep" label="CEP">
            <Controller name="cep" control={control} render={({ field }) => (
              <InputMask mask="99999-999" value={field.value} onChange={field.onChange} onBlur={(e) => handleCEPBlur(e.target.value)}>
                {(inputProps: unknown) => <NeuInput {...inputProps} placeholder="00000-000" loading={validatingCEP} />}
              </InputMask>
            )} />
          </FormField>

          <FormField id="endereco" label="Logradouro" className={FORM_COL.full}>
            <NeuInput id="endereco" placeholder="Rua, Avenida..." {...register('endereco')} />
          </FormField>

          <FormField id="numero" label="Número"><NeuInput id="numero" placeholder="123" {...register('numero')} /></FormField>
          <FormField id="complemento" label="Complemento"><NeuInput id="complemento" {...register('complemento')} /></FormField>
          <FormField id="bairro" label="Bairro"><NeuInput id="bairro" {...register('bairro')} /></FormField>
          <FormField id="cidade" label="Cidade"><NeuInput id="cidade" {...register('cidade')} /></FormField>
        </div>
      )
    }
  ];

  return (
    <FormTemplate
      titulo="Cadastro de Transportadoras"
      subtitulo="Preencha os dados da transportadora. Campos com (*) são obrigatórios."
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate('/cadastros/transportadoras')}
      secoes={secoes}
      textoSubmit="Cadastrar Transportadora"
    />
  );
}

