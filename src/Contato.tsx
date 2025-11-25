import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea, Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@/components/oraclusx-ds/Button';
import { ShieldCheck, Send, AlertCircle, CheckCircle2, Headset } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  email: z.string().email('E-mail inválido').max(160, 'E-mail muito longo'),
  subject: z.string().min(3, 'Assunto muito curto').max(120, 'Assunto muito longo'),
  message: z.string().min(10, 'Mensagem muito curta').max(4000, 'Mensagem muito longa'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contato() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  });

  async function onSubmit(data: ContactFormData) {
    try {
      setStatus('sending');
      setErrorMessage(null);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          source: 'web',
        }),
      });

      if (!response.ok) {
        let serverMessage: string | null = null;

        try {
          const errorData = (await response.clone().json()) as { error?: string; message?: string };
          serverMessage = errorData?.error || errorData?.message || null;
        } catch {
          // ignorar: resposta não era JSON
        }

        if (!serverMessage) {
          const fallbackText = await response.text().catch(() => '');
          serverMessage = fallbackText || `Falha ao enviar: ${response.status}`;
        }

        throw new Error(serverMessage);
      }

      setStatus('success');
      reset();
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
      
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Fale Conosco
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Entre em contato com nossa equipe de especialistas. Estamos prontos para atender sua solicitação com agilidade.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_20px_rgba(45,212,191,0.05)] h-full">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-xl font-semibold text-white">Envie sua mensagem</h3>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Nome"
                        placeholder="Seu nome completo"
                        variant="bordered"
                        classNames={{
                          inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary",
                          label: "text-slate-400",
                          input: "text-white placeholder:text-slate-600",
                        }}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name?.message}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        label="E-mail"
                        placeholder="seu@email.com"
                        variant="bordered"
                        classNames={{
                          inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary",
                          label: "text-slate-400",
                          input: "text-white placeholder:text-slate-600",
                        }}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Assunto"
                      placeholder="Como podemos ajudar?"
                      variant="bordered"
                      classNames={{
                        inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary",
                        label: "text-slate-400",
                        input: "text-white placeholder:text-slate-600",
                      }}
                      isInvalid={!!errors.subject}
                      errorMessage={errors.subject?.message}
                    />
                  )}
                />

                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Mensagem"
                      placeholder="Descreva sua solicitação com detalhes"
                      minRows={5}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "bg-white/5 border-white/10 hover:border-primary/50 focus-within:!border-primary",
                        label: "text-slate-400",
                        input: "text-white placeholder:text-slate-600",
                      }}
                      isInvalid={!!errors.message}
                      errorMessage={errors.message?.message}
                    />
                  )}
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex-1">
                    {status === 'success' && (
                      <div className="flex items-center text-emerald-400 text-sm gap-2 animate-in fade-in slide-in-from-left-2">
                        <CheckCircle2 size={18} />
                        <span>Mensagem enviada com sucesso!</span>
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="flex items-center text-rose-400 text-sm gap-2 animate-in fade-in slide-in-from-left-2">
                        <AlertCircle size={18} />
                        <span>{errorMessage || 'Falha ao enviar mensagem'}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    color="primary"
                    variant="shadow"
                    isLoading={status === 'sending'}
                    startContent={!status && <Send size={18} />}
                    className="font-medium bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20"
                  >
                    {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-xl font-semibold text-white">Canais Oficiais</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-8">
              <div className="flex gap-4 items-start group">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                  <Headset size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Suporte Técnico</h4>
                  <a 
                    href="mailto:suporte@icarusai.com.br" 
                    className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm block mb-1"
                  >
                    suporte@icarusai.com.br
                  </a>
                  <p className="text-slate-500 text-xs">Resposta em até 24h (dias úteis)</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Proteção de Dados (DPO)</h4>
                  <a 
                    href="mailto:dpo@icarusai.com.br" 
                    className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm block mb-1"
                  >
                    dpo@icarusai.com.br
                  </a>
                  <p className="text-slate-500 text-xs">Resposta em até 15 dias (LGPD)</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

