/**
 * FormEndereco - Formulário com validação automática de CEP
 * Componente reutilizável para cadastro de endereços
 * Integrado com ViaCEP Service + Cache Supabase
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useValidacaoCep } from "@/hooks/useValidacao";

// Schema de validação com Zod
const enderecoSchema = z.object({
  cep: z
    .string()
    .min(8, "CEP deve conter 8 dígitos")
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  logradouro: z.string().min(3, "Logradouro é obrigatório"),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  uf: z.string().length(2, "UF deve conter 2 letras"),
});

export type EnderecoFormData = z.infer<typeof enderecoSchema>;

interface FormEnderecoProps {
  defaultValues?: Partial<EnderecoFormData>;
  onSubmit: (data: EnderecoFormData) => void;
  title?: string;
  description?: string;
}

export function FormEndereco({
  defaultValues,
  onSubmit,
  title = "Endereço",
  description = "Preencha o CEP para buscar automaticamente o endereço",
}: FormEnderecoProps) {
  const [cepBuscado, setCepBuscado] = useState(false);
  const {
    data: _dadosCep,
    loading: buscandoCep,
    cached,
    validate: buscarCep,
  } = useValidacaoCep();

  const form = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      ...defaultValues,
    },
  });

  // Busca automática ao sair do campo CEP
  const handleCepBlur = async () => {
    const cep = form.getValues("cep");

    if (!cep || cep.length < 8) return;

    const endereco = await buscarCep(cep);

    if (endereco) {
      // Preenche campos automaticamente
      form.setValue("logradouro", endereco.logradouro);
      form.setValue("bairro", endereco.bairro);
      form.setValue("cidade", endereco.cidade);
      form.setValue("uf", endereco.uf);

      setCepBuscado(true);

      // Remove erros dos campos preenchidos
      form.clearErrors(["logradouro", "bairro", "cidade", "uf"]);

      // Foca no campo número
      setTimeout(() => {
        const numeroInput = document.querySelector<HTMLInputElement>(
          'input[name="numero"]',
        );
        numeroInput?.focus();
      }, 100);
    } else {
      form.setError("cep", {
        type: "manual",
        message: "CEP não encontrado",
      });
    }
  };

  // Formata CEP automaticamente (XXXXX-XXX)
  const formatarCep = (value: string) => {
    const limpo = value.replace(/\D/g, "");

    if (limpo.length <= 5) {
      return limpo;
    }

    return `${limpo.slice(0, 5)}-${limpo.slice(5, 8)}`;
  };

  return (
    <Card className="orx-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* CEP */}
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="00000-000"
                        maxLength={9}
                        onChange={(e) => {
                          const formatted = formatarCep(e.target.value);
                          field.onChange(formatted);
                          setCepBuscado(false);
                        }}
                        onBlur={handleCepBlur}
                        disabled={buscandoCep}
                      />
                      {buscandoCep && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {cepBuscado && !buscandoCep && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {cached && (
                    <p
                      className="text-muted-foreground mt-1"
                      style={{ fontSize: "0.813rem" }}
                    >
                      ⚡ Dados do cache (consulta instantânea)
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Logradouro */}
            <FormField
              control={form.control}
              name="logradouro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Rua, Avenida, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Número e Complemento */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Apto, Sala, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bairro */}
            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do bairro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cidade e UF */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da cidade" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="SP"
                        maxLength={2}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botão Submit */}
            <Button type="submit" className="w-full orx-button">
              Salvar Endereço
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
