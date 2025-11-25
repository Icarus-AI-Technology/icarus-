import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardBody, CardHeader, Input, Textarea } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const contactSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .regex(/^[\d\s()+-]+$/, 'Apenas números e símbolos permitidos'),
  assunto: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres'),
  mensagem: z.string().min(20, 'Mensagem deve ter pelo menos 20 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function Contato() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  });

  async function onSubmit(data: ContactFormData) {
    setStatus('sending');
    setErrorMessage(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar mensagem');
      }

      setStatus('success');
      reset();

      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-mail',
      value: 'contato@icarus.med.br',
      link: 'mailto:contato@icarus.med.br'
    },
    {
      icon: Phone,
      title: 'Telefone',
      value: '+55 (21) 3333-4444',
      link: 'tel:+552133334444'
    },
    {
      icon: MapPin,
      title: 'Endereço',
      value: 'Av. Rio Branco, 156 - Centro, Rio de Janeiro - RJ',
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-orx-bg-app py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Fale Conosco
          </h1>
          <p className="text-default-400 text-lg max-w-2xl mx-auto">
            Tem dúvidas ou sugestões? Entre em contato conosco e nossa equipe responderá o mais breve possível.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
            <CardHeader className="border-b border-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">Envie sua Mensagem</h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                {/* Nome */}
                <Input
                  {...register('nome')}
                  label="Nome Completo"
                  placeholder="Digite seu nome"
                  variant="bordered"
                  isInvalid={!!errors.nome}
                  errorMessage={errors.nome?.message}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary/80 data-[hover=true]:bg-white/10",
                    label: "text-default-400",
                    errorMessage: "text-danger"
                  }}
                />

                {/* Email */}
                <Input
                  {...register('email')}
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  variant="bordered"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary/80 data-[hover=true]:bg-white/10",
                    label: "text-default-400",
                    errorMessage: "text-danger"
                  }}
                />

                {/* Telefone */}
                <Input
                  {...register('telefone')}
                  type="tel"
                  label="Telefone"
                  placeholder="(XX) XXXXX-XXXX"
                  variant="bordered"
                  isInvalid={!!errors.telefone}
                  errorMessage={errors.telefone?.message}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary/80 data-[hover=true]:bg-white/10",
                    label: "text-default-400",
                    errorMessage: "text-danger"
                  }}
                />

                {/* Assunto */}
                <Input
                  {...register('assunto')}
                  label="Assunto"
                  placeholder="Sobre o que você quer falar?"
                  variant="bordered"
                  isInvalid={!!errors.assunto}
                  errorMessage={errors.assunto?.message}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary/80 data-[hover=true]:bg-white/10",
                    label: "text-default-400",
                    errorMessage: "text-danger"
                  }}
                />

                {/* Mensagem */}
                <Textarea
                  {...register('mensagem')}
                  label="Mensagem"
                  placeholder="Digite sua mensagem aqui..."
                  variant="bordered"
                  minRows={6}
                  isInvalid={!!errors.mensagem}
                  errorMessage={errors.mensagem?.message}
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary/80 data-[hover=true]:bg-white/10",
                    label: "text-default-400",
                    errorMessage: "text-danger"
                  }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)]"
                  isDisabled={status === 'sending'}
                  startContent={
                    status === 'sending' ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )
                  }
                >
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20 text-success">
                    <CheckCircle2 size={20} />
                    <p className="text-sm font-medium">Mensagem enviada com sucesso! Entraremos em contato em breve.</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger">
                    <XCircle size={20} />
                    <p className="text-sm font-medium">{errorMessage || 'Erro ao enviar mensagem. Tente novamente.'}</p>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>

          {/* Contact Information */}
          <div className="flex flex-col gap-6">
            <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
              <CardHeader className="border-b border-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">Canais Oficiais</h2>
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <info.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-default-400 mb-1">{info.title}</h3>
                      {info.link ? (
                        <a 
                          href={info.link}
                          className="text-white hover:text-primary transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Business Hours */}
            <Card className="bg-orx-bg-surface/60 border border-white/5 backdrop-blur-md shadow-xl">
              <CardHeader className="border-b border-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">Horário de Atendimento</h2>
              </CardHeader>
              <CardBody className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-default-400">Segunda a Sexta</span>
                  <span className="text-white font-semibold">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-default-400">Sábado</span>
                  <span className="text-white font-semibold">08:00 - 12:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-default-400">Domingo e Feriados</span>
                  <span className="text-danger font-semibold">Fechado</span>
                </div>
              </CardBody>
            </Card>

            {/* Support Notice */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-md shadow-xl">
              <CardBody className="p-6">
                <h3 className="text-white font-semibold mb-2">Suporte 24/7</h3>
                <p className="text-default-400 text-sm">
                  Para emergências técnicas, nossa equipe de suporte está disponível 24 horas por dia, 7 dias por semana através do chat online.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
