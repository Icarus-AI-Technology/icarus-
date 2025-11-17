/**
 * Página: Contact
 * Formulário de contato com validação e integração API
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
} from "@/components/oraclusx-ds";
import { useToast } from "@/hooks";
import {
  Mail,
  User,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

// Schema de validação
const contactSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").min(5, "Email é obrigatório"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Telefone deve ter no mínimo 10 dígitos",
    }),
  subject: z
    .string()
    .min(3, "Assunto deve ter no mínimo 3 caracteres")
    .max(200, "Assunto muito longo")
    .optional(),
  message: z
    .string()
    .min(10, "Mensagem deve ter no mínimo 10 caracteres")
    .max(1000, "Mensagem muito longa"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { addToast } = useToast();
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erro ao enviar mensagem");
      }

      setSubmitStatus("success");
      addToast({
        message:
          "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        type: "success",
        duration: 5000,
      });

      reset();

      // Reset status após 5 segundos
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      setSubmitStatus("error");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao enviar mensagem. Tente novamente.";

      addToast({
        message: errorMessage,
        type: "error",
        duration: 5000,
      });

      console.error("Erro ao enviar formulário:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-heading flex items-center gap-2">
              <MessageSquare size={28} />
              Entre em Contato
            </CardTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              Preencha o formulário abaixo e nossa equipe entrará em contato em
              breve. Todos os campos marcados com * são obrigatórios.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-body-sm font-medium"
                >
                  <User size={16} className="inline mr-1" />
                  Nome Completo *
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  className="w-full orx-input"
                  placeholder="Digite seu nome completo"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-error dark:text-red-400 text-body-xs flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-body-sm font-medium"
                >
                  <Mail size={16} className="inline mr-1" />
                  E-mail *
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full orx-input"
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-error dark:text-red-400 text-body-xs flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Grid para Telefone e Assunto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telefone (opcional) */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-body-sm font-medium"
                  >
                    <Phone size={16} className="inline mr-1" />
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="w-full orx-input"
                    placeholder="(11) 98765-4321"
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-error dark:text-red-400 text-body-xs flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Assunto (opcional) */}
                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="block text-body-sm font-medium"
                  >
                    <FileText size={16} className="inline mr-1" />
                    Assunto
                  </label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    className="w-full orx-input"
                    placeholder="Assunto da mensagem"
                    disabled={isSubmitting}
                  />
                  {errors.subject && (
                    <p className="text-error dark:text-red-400 text-body-xs flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.subject.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="block text-body-sm font-medium"
                >
                  <MessageSquare size={16} className="inline mr-1" />
                  Mensagem *
                </label>
                <Textarea
                  id="message"
                  {...register("message")}
                  className="w-full orx-input min-h-[150px] resize-y"
                  placeholder="Digite sua mensagem aqui..."
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-error dark:text-red-400 text-body-xs flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Status de envio */}
              {submitStatus === "success" && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 text-body-sm flex items-center gap-2">
                    <CheckCircle size={18} />
                    Mensagem enviada com sucesso! Entraremos em contato em
                    breve.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300 text-body-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    Erro ao enviar mensagem. Por favor, tente novamente.
                  </p>
                </div>
              )}

              {/* Botão de envio */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" padding="md" className="text-center">
            <Mail size={32} className="mx-auto mb-2 text-primary" />
            <h3 className="text-body-md font-semibold mb-1">E-mail</h3>
            <p className="text-body-sm text-muted-foreground">
              contato@icarus.com.br
            </p>
          </Card>

          <Card variant="default" padding="md" className="text-center">
            <Phone size={32} className="mx-auto mb-2 text-primary" />
            <h3 className="text-body-md font-semibold mb-1">Telefone</h3>
            <p className="text-body-sm text-muted-foreground">(11) 3456-7890</p>
          </Card>

          <Card variant="default" padding="md" className="text-center">
            <MessageSquare size={32} className="mx-auto mb-2 text-primary" />
            <h3 className="text-body-md font-semibold mb-1">Horário</h3>
            <p className="text-body-sm text-muted-foreground">
              Seg-Sex: 8h às 18h
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
