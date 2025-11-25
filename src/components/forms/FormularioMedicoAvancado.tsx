/**
 * Componente: Formulário de Médico Avançado
 * Validação com Zod + React Hook Form
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/contexts';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/oraclusx-ds';
import { User, Phone, Mail, MapPin, FileText } from 'lucide-react';

// Schema de validação Zod
const medicoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  crm: z.string().regex(/^\d{4,7}$/, 'CRM deve ter entre 4 e 7 dígitos'),
  crmUF: z.string().length(2, 'UF do CRM deve ter 2 caracteres').toUpperCase(),
  especialidade: z.string().min(3, 'Especialidade obrigatória'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone no formato (XX) XXXXX-XXXX'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP no formato XXXXX-XXX'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  volumeAnualEstimado: z.number().min(0, 'Valor deve ser positivo').optional(),
});

type MedicoFormData = z.infer<typeof medicoSchema>;

export default function FormularioMedicoAvancado() {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
  });

  const onSubmit = async (data: MedicoFormData) => {
    // Simular envio ao backend
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addToast({
      message: `Médico ${data.nome} cadastrado com sucesso!`,
      type: 'success',
      duration: 4000,
    });

    reset();
  };

  return (
    <Card variant="neumo" padding="lg">
      <CardHeader>
        <CardTitle className="text-heading flex items-center gap-2">
          <User size={24} />
          Cadastro de Médico
        </CardTitle>
        <p className="text-body-sm text-muted-foreground mt-2">
          Preencha os dados do médico. Todos os campos com * são obrigatórios.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-body-lg border-b pb-2" style={{ fontWeight: 500 }}>
              Dados Pessoais
            </h3>

            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-body-sm" style={{ fontWeight: 500 }}>
                Nome Completo *
              </label>
              <Input
                id="nome"
                {...register('nome')}
                className="w-full orx-input"
                placeholder="Ex: Dr. João Silva"
              />
              {errors.nome && (
                <p className="text-error dark:text-red-400 text-body-xs">{errors.nome.message}</p>
              )}
            </div>

            {/* CRM e UF */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="crm" className="block text-body-sm" style={{ fontWeight: 500 }}>
                  CRM *
                </label>
                <Input
                  id="crm"
                  {...register('crm')}
                  className="w-full orx-input"
                  placeholder="123456"
                  maxLength={7}
                />
                {errors.crm && (
                  <p className="text-error dark:text-red-400 text-body-xs">{errors.crm.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="crmUF" className="block text-body-sm" style={{ fontWeight: 500 }}>
                  UF *
                </label>
                <Input
                  id="crmUF"
                  {...register('crmUF')}
                  className="w-full orx-input uppercase"
                  placeholder="RJ"
                  maxLength={2}
                />
                {errors.crmUF && (
                  <p className="text-error dark:text-red-400 text-body-xs">
                    {errors.crmUF.message}
                  </p>
                )}
              </div>
            </div>

            {/* Especialidade */}
            <div className="space-y-2">
              <label
                htmlFor="especialidade"
                className="block text-body-sm"
                style={{ fontWeight: 500 }}
              >
                <FileText size={16} className="inline mr-1" />
                Especialidade *
              </label>
              <Input
                id="especialidade"
                {...register('especialidade')}
                className="w-full orx-input"
                placeholder="Ex: Ortopedia"
              />
              {errors.especialidade && (
                <p className="text-error dark:text-red-400 text-body-xs">
                  {errors.especialidade.message}
                </p>
              )}
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-body-lg border-b pb-2" style={{ fontWeight: 500 }}>
              Contato
            </h3>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-body-sm" style={{ fontWeight: 500 }}>
                <Mail size={16} className="inline mr-1" />
                E-mail *
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="w-full orx-input"
                placeholder="medico@exemplo.com"
              />
              {errors.email && (
                <p className="text-error dark:text-red-400 text-body-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label htmlFor="telefone" className="block text-body-sm" style={{ fontWeight: 500 }}>
                <Phone size={16} className="inline mr-1" />
                Telefone *
              </label>
              <Input
                id="telefone"
                {...register('telefone')}
                className="w-full orx-input"
                placeholder="(21) 98765-4321"
              />
              {errors.telefone && (
                <p className="text-error dark:text-red-400 text-body-xs">
                  {errors.telefone.message}
                </p>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-body-lg border-b pb-2" style={{ fontWeight: 500 }}>
              Endereço
            </h3>

            {/* CEP */}
            <div className="space-y-2">
              <label htmlFor="cep" className="block text-body-sm" style={{ fontWeight: 500 }}>
                <MapPin size={16} className="inline mr-1" />
                CEP *
              </label>
              <Input
                id="cep"
                {...register('cep')}
                className="w-full orx-input"
                placeholder="22640-100"
              />
              {errors.cep && (
                <p className="text-error dark:text-red-400 text-body-xs">{errors.cep.message}</p>
              )}
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <label htmlFor="endereco" className="block text-body-sm" style={{ fontWeight: 500 }}>
                Endereço Completo *
              </label>
              <Input
                id="endereco"
                {...register('endereco')}
                className="w-full orx-input"
                placeholder="Rua, número, complemento, bairro, cidade"
              />
              {errors.endereco && (
                <p className="text-error dark:text-red-400 text-body-xs">
                  {errors.endereco.message}
                </p>
              )}
            </div>
          </div>

          {/* Volume Anual (Opcional) */}
          <div className="space-y-4">
            <h3 className="text-body-lg border-b pb-2" style={{ fontWeight: 500 }}>
              Informações Adicionais
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="volumeAnualEstimado"
                className="block text-body-sm"
                style={{ fontWeight: 500 }}
              >
                Volume Anual Estimado (R$)
              </label>
              <Input
                id="volumeAnualEstimado"
                type="number"
                {...register('volumeAnualEstimado', { valueAsNumber: true })}
                className="w-full orx-input"
                placeholder="100000"
                min={0}
                step={1000}
              />
              {errors.volumeAnualEstimado && (
                <p className="text-error dark:text-red-400 text-body-xs">
                  {errors.volumeAnualEstimado.message}
                </p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="orx-button-primary flex items-center gap-2"
            >
              {isSubmitting ? 'Salvando...' : 'Cadastrar Médico'}
            </Button>

            <Button
              type="button"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="orx-button"
            >
              Limpar Formulário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
