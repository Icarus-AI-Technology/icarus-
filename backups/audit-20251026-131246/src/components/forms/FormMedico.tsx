/**
 * FormMedico - Formulário com validação automática de CRM
 * Componente reutilizável para cadastro de médicos
 * Integrado com CFM Service + Cache Supabase
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Stethoscope, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { useValidacaoCRM } from "@/hooks/useValidacao";
import { cfmService } from "@/lib/services/CFMService";

// Schema de validação com Zod
const medicoSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  crm: z
    .string()
    .min(5, "CRM deve conter 5 ou 6 dígitos")
    .max(6, "CRM deve conter 5 ou 6 dígitos")
    .regex(/^\d+$/, "CRM deve conter apenas números"),
  uf: z.string().length(2, "UF é obrigatória"),
  cpf: z
    .string()
    .min(11, "CPF deve conter 11 dígitos")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  especialidade: z.string().optional(),
});

export type MedicoFormData = z.infer<typeof medicoSchema>;

interface FormMedicoProps {
  defaultValues?: Partial<MedicoFormData>;
  onSubmit: (data: MedicoFormData) => void;
  title?: string;
  description?: string;
}

export function FormMedico({
  defaultValues,
  onSubmit,
  title = "Dados do Médico",
  description = "Preencha o CRM para validar o registro profissional",
}: FormMedicoProps) {
  const [crmBuscado, setCrmBuscado] = useState(false);
  const [statusCRM, setStatusCRM] = useState<"ativo" | "inativo" | null>(null);
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  const {
    data: _dadosCrm,
    loading: buscandoCrm,
    cached,
    error,
    validate: buscarCrm,
  } = useValidacaoCRM();

  const form = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      nome: "",
      crm: "",
      uf: "",
      cpf: "",
      telefone: "",
      email: "",
      especialidade: "",
      ...defaultValues,
    },
  });

  // Busca automática ao sair do campo CRM
  const handleCrmBlur = async () => {
    const crm = form.getValues("crm");
    const uf = form.getValues("uf");

    if (!crm || !uf) return;

    // Valida formato primeiro
    const validacao = cfmService.validarCRMLocal(crm, uf);

    if (!validacao.formatoValido) {
      form.setError("crm", {
        type: "manual",
        message: validacao.mensagem,
      });
      return;
    }

    const medico = await buscarCrm(`${crm}/${uf}`);

    if (medico) {
      // Preenche nome se encontrado
      if (medico.nome && medico.nome !== "VALIDAÇÃO LOCAL - FORMATO OK") {
        form.setValue("nome", medico.nome);
      }

      setCrmBuscado(true);
      setStatusCRM(medico.situacao);

      if (medico.especialidades && medico.especialidades.length > 0) {
        setEspecialidades(medico.especialidades.map((e) => e.nome));
        form.setValue("especialidade", medico.especialidades[0].nome);
      }

      // Remove erros
      form.clearErrors("crm");
    } else {
      form.setError("crm", {
        type: "manual",
        message: error || "CRM não encontrado no CFM",
      });
    }
  };

  // Formata CPF automaticamente (XXX.XXX.XXX-XX)
  const formatarCpf = (value: string) => {
    const limpo = value.replace(/\D/g, "");

    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9)
      return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;

    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  };

  // UFs brasileiras
  const UFS = cfmService.getUFsValidas();

  return (
    <Card className="orx-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Status do CRM (se consultado) */}
            {statusCRM && (
              <Alert
                variant={statusCRM === "ativo" ? "default" : "destructive"}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {statusCRM === "ativo"
                    ? "✅ CRM com situação ATIVA no Conselho Federal de Medicina"
                    : "⚠️ CRM com situação IRREGULAR no CFM"}
                </AlertDescription>
              </Alert>
            )}

            {/* Especialidades (se encontradas) */}
            {especialidades.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-muted-foreground"
                  style={{ fontSize: "0.813rem" }}
                >
                  Especialidades:
                </span>
                {especialidades.map((esp, idx) => (
                  <Badge key={idx} variant="secondary">
                    {esp}
                  </Badge>
                ))}
              </div>
            )}

            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dr. João da Silva" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CRM e UF */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="crm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="123456"
                            maxLength={6}
                            onChange={(e) => {
                              const limpo = e.target.value.replace(/\D/g, "");
                              field.onChange(limpo);
                              setCrmBuscado(false);
                            }}
                            onBlur={handleCrmBlur}
                            disabled={buscandoCrm}
                          />
                          {buscandoCrm && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {crmBuscado && !buscandoCrm && (
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
                          ⚡ Dados do cache
                        </p>
                      )}
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UFS.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CPF */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      onChange={(e) => {
                        const formatted = formatarCpf(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contato */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-8888" />
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
                        placeholder="medico@email.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Especialidade */}
            <FormField
              control={form.control}
              name="especialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade Principal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Ortopedia, Cardiologia"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botão Submit */}
            <Button type="submit" className="w-full orx-button">
              Salvar Médico
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
