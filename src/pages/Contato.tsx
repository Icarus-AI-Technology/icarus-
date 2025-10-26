import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo"),
  email: z
    .string()
    .email("E-mail inválido")
    .max(160, "E-mail muito longo"),
  subject: z
    .string()
    .min(3, "Assunto muito curto")
    .max(120, "Assunto muito longo"),
  message: z
    .string()
    .min(10, "Mensagem muito curta")
    .max(4000, "Mensagem muito longa"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contato() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ContactFormData) {
    try {
      setStatus("sending");
      setErrorMessage(null);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          source: "web",
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Falha ao enviar: ${response.status}`);
      }

      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--orx-text-primary)" }}>
        Fale Conosco
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="neumorphic-card">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                type="text"
                className="neumorphic-input w-full"
                placeholder="Seu nome completo"
                {...register("name")}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="neumorphic-input w-full"
                placeholder="seu@email.com"
                {...register("email")}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="subject">
                Assunto
              </label>
              <input
                id="subject"
                type="text"
                className="neumorphic-input w-full"
                placeholder="Como podemos ajudar?"
                {...register("subject")}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject && (
                <p id="subject-error" className="mt-1 text-sm text-red-600">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium" htmlFor="message">
                Mensagem
              </label>
              <textarea
                id="message"
                rows={6}
                className="neumorphic-input w-full"
                placeholder="Descreva sua solicitação com detalhes"
                {...register("message")}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <p id="message-error" className="mt-1 text-sm text-red-600">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="neumorphic-button colored-button"
                style={{ background: "rgba(99, 102, 241, 0.95)", color: "#fff" }}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Enviando..." : "Enviar"}
              </button>
              {status === "success" && (
                <span className="text-green-600 text-sm">Mensagem enviada com sucesso!</span>
              )}
              {status === "error" && (
                <span className="text-red-600 text-sm">{errorMessage || "Falha ao enviar"}</span>
              )}
            </div>
          </form>
        </div>

        <div className="neumorphic-card">
          <h2 className="text-xl font-semibold mb-3">Canais Oficiais</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">🛠️ Suporte Técnico</p>
              <a className="text-blue-600 hover:underline" href="mailto:suporte@icarusai.com.br">
                suporte@icarusai.com.br
              </a>
              <p className="text-gray-500">Resposta em até 24h (dias úteis)</p>
            </div>
            <div>
              <p className="font-medium">🛡️ Proteção de Dados (DPO)</p>
              <a className="text-blue-600 hover:underline" href="mailto:dpo@icarusai.com.br">
                dpo@icarusai.com.br
              </a>
              <p className="text-gray-500">Resposta em até 15 dias (LGPD)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


