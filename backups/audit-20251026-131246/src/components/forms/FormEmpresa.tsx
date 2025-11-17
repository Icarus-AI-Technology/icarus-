/**
 * FormEmpresa - Formulário com validação automática de CNPJ
 * Componente reutilizável para cadastro de empresas
 * Integrado com Receita Federal Service + Cache Supabase
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, CheckCircle2, AlertCircle } from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useValidacaoCNPJ } from "@/hooks/useValidacao";
import { receitaFederalService } from "@/lib/services/ReceitaFederalService";

// Schema de validação com Zod
const empresaSchema = z.object({
  cnpj: z
    .string()
    .min(14, "CNPJ deve conter 14 dígitos")
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido")
    .refine(
      (cnpj) => receitaFederalService.validarCNPJ(cnpj),
      "CNPJ com dígito verificador inválido",
    ),
  razaoSocial: z.string().min(3, "Razão Social é obrigatória"),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type EmpresaFormData = z.infer<typeof empresaSchema>;

interface FormEmpresaProps {
  defaultValues?: Partial<EmpresaFormData>;
  onSubmit: (data: EmpresaFormData) => void;
  title?: string;
  description?: string;
}

export function FormEmpresa({
  defaultValues,
  onSubmit,
  title = "Dados da Empresa",
  description = "Preencha o CNPJ para buscar automaticamente os dados da empresa",
}: FormEmpresaProps) {
  const [cnpjBuscado, setCnpjBuscado] = useState(false);
  const [statusEmpresa, setStatusEmpresa] = useState<
    "ativa" | "inativa" | null
  >(null);

  const {
    data: _dadosCnpj,
    loading: buscandoCnpj,
    cached,
    error,
    validate: buscarCnpj,
  } = useValidacaoCNPJ();

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      cnpj: "",
      razaoSocial: "",
      nomeFantasia: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      telefone: "",
      email: "",
      ...defaultValues,
    },
  });

  // Busca automática ao sair do campo CNPJ
  const handleCnpjBlur = async () => {
    const cnpj = form.getValues("cnpj");

    if (!cnpj || cnpj.length < 14) return;

    // Valida formato primeiro
    if (!receitaFederalService.validarCNPJ(cnpj)) {
      form.setError("cnpj", {
        type: "manual",
        message: "CNPJ com dígito verificador inválido",
      });
      return;
    }

    const empresa = await buscarCnpj(cnpj);

    if (empresa) {
      // Preenche campos automaticamente
      form.setValue("razaoSocial", empresa.razaoSocial);
      form.setValue("nomeFantasia", empresa.nomeFantasia || "");

      if (empresa.contato?.telefone1) {
        form.setValue("telefone", empresa.contato.telefone1);
      }

      if (empresa.contato?.email) {
        form.setValue("email", empresa.contato.email);
      }

      setCnpjBuscado(true);
      setStatusEmpresa(empresa.status);

      // Remove erros dos campos preenchidos
      form.clearErrors(["razaoSocial", "nomeFantasia"]);
    } else {
      form.setError("cnpj", {
        type: "manual",
        message: error || "CNPJ não encontrado na Receita Federal",
      });
    }
  };

  // Formata CNPJ automaticamente (XX.XXX.XXX/XXXX-XX)
  const formatarCnpj = (value: string) => {
    const limpo = value.replace(/\D/g, "");

    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 5) return `${limpo.slice(0, 2)}.${limpo.slice(2)}`;
    if (limpo.length <= 8)
      return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5)}`;
    if (limpo.length <= 12)
      return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5, 8)}/${limpo.slice(8)}`;

    return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5, 8)}/${limpo.slice(8, 12)}-${limpo.slice(12, 14)}`;
  };

  return (
    <Card className="orx-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Status da Empresa (se consultado) */}
            {statusEmpresa && (
              <Alert
                variant={statusEmpresa === "ativa" ? "default" : "destructive"}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {statusEmpresa === "ativa"
                    ? "✅ Empresa com situação ATIVA na Receita Federal"
                    : "⚠️ Empresa com situação IRREGULAR na Receita Federal"}
                </AlertDescription>
              </Alert>
            )}

            {/* CNPJ */}
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="00.000.000/0001-00"
                        maxLength={18}
                        onChange={(e) => {
                          const formatted = formatarCnpj(e.target.value);
                          field.onChange(formatted);
                          setCnpjBuscado(false);
                        }}
                        onBlur={handleCnpjBlur}
                        disabled={buscandoCnpj}
                      />
                      {buscandoCnpj && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {cnpjBuscado && !buscandoCnpj && (
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

            {/* Razão Social */}
            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Empresa Exemplo Ltda" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome Fantasia */}
            <FormField
              control={form.control}
              name="nomeFantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome comercial" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Inscrições */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inscricaoEstadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="000.000.000.000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inscricaoMunicipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Municipal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="00000000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contato */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 3333-4444" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="contato@empresa.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botão Submit */}
            <Button type="submit" className="w-full orx-button">
              Salvar Empresa
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
