/**
 * Schemas de validação usando Zod
 * Validação type-safe para todos os formulários
 *
 * @example
 * ```typescript
 * import { loginSchema } from '@/lib/validation/schemas';
 *
 * const result = loginSchema.safeParse(formData);
 * if (result.success) {
 *   // dados válidos em result.data
 * } else {
 *   // erros em result.error
 * }
 * ```
 */

import { z } from "zod";

/**
 * Validadores customizados reutilizáveis
 *
 * @remarks
 * Estes validadores implementam regras de negócio brasileiras
 * e podem ser combinados com outros validators do Zod
 */

/**
 * Validador de CPF (Cadastro de Pessoa Física)
 *
 * @description
 * Valida CPF brasileiro com verificação de dígitos verificadores.
 * Aceita formatos: "123.456.789-09" ou "12345678909"
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   cpf: cpfValidator
 * });
 *
 * schema.parse({ cpf: "123.456.789-09" }); // ✓ válido
 * schema.parse({ cpf: "000.000.000-00" }); // ✗ inválido
 * ```
 *
 * @see {@link https://www.geradorcpf.com/algoritmo_do_cpf.htm|Algoritmo CPF}
 */
export const cpfValidator = z.string().refine(
  (value) => {
    const cpf = value.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cpf.charAt(9)) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    return parseInt(cpf.charAt(10)) === digit;
  },
  { message: "CPF inválido" },
);

/**
 * Validador de CNPJ (Cadastro Nacional de Pessoa Jurídica)
 *
 * @description
 * Valida CNPJ brasileiro com verificação de dígitos verificadores.
 * Aceita formatos: "11.222.333/0001-81" ou "11222333000181"
 *
 * @example
 * ```typescript
 * const empresaSchema = z.object({
 *   cnpj: cnpjValidator,
 *   razaoSocial: z.string()
 * });
 *
 * empresaSchema.parse({
 *   cnpj: "11.222.333/0001-81",
 *   razaoSocial: "Empresa LTDA"
 * });
 * ```
 *
 * @see {@link https://www.geradorc npj.com/algoritmo_do_cnpj.htm|Algoritmo CNPJ}
 */
export const cnpjValidator = z.string().refine(
  (value) => {
    const cnpj = value.replace(/\D/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj.charAt(12)) !== digit1) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj.charAt(13)) === digit2;
  },
  { message: "CNPJ inválido" },
);

// CEP
export const cepValidator = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, "CEP inválido. Use o formato: 12345-678");

// Telefone
export const telefoneValidator = z
  .string()
  .regex(/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/, "Telefone inválido");

// Email
export const emailValidator = z.string().email("Email inválido");

// URL
export const urlValidator = z.string().url("URL inválida");

// Data futura
export const futuraDataValidator = z
  .string()
  .refine((value) => new Date(value) > new Date(), {
    message: "Data deve ser futura",
  });

// Senha forte
export const senhaValidator = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial");

/**
 * Schema de autenticação - Login
 *
 * @description
 * Valida credenciais para login do usuário.
 * Email deve ser válido e senha é obrigatória (validação de força na criação).
 *
 * @example
 * ```typescript
 * import { loginSchema, validateWithSchema } from '@/lib/validation';
 *
 * const result = validateWithSchema(loginSchema, {
 *   email: "user@example.com",
 *   password: "senha123"
 * });
 *
 * if (result.success) {
 *   await authenticateUser(result.data);
 * } else {
 *   showErrors(result.errors);
 * }
 * ```
 *
 * @see {@link SignupFormData} para criação de conta
 */
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Senha é obrigatória"),
});

/**
 * Schema de cadastro de novo usuário
 *
 * @description
 * Valida dados para criação de conta com validação de senha forte.
 * Confirma que as senhas coincidem antes de criar conta.
 *
 * @example
 * ```typescript
 * const result = validateWithSchema(signupSchema, {
 *   nome: "João Silva",
 *   email: "joao@example.com",
 *   password: "Senha@123",
 *   confirmPassword: "Senha@123"
 * });
 * ```
 *
 * @remarks
 * Requisitos de senha:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 maiúscula
 * - Pelo menos 1 minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export const signupSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: emailValidator,
    password: senhaValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: emailValidator,
});

/**
 * Schemas de Cadastros
 */

export const enderecoSchema = z.object({
  cep: cepValidator,
  logradouro: z.string().min(3, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
  pais: z.string().default("Brasil"),
});

export const pessoaFisicaSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: cpfValidator,
  rg: z.string().optional(),
  dataNascimento: z.string(),
  email: emailValidator.optional(),
  telefone: telefoneValidator.optional(),
  endereco: enderecoSchema.optional(),
});

export const pessoaJuridicaSchema = z.object({
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: cnpjValidator,
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  email: emailValidator,
  telefone: telefoneValidator,
  endereco: enderecoSchema,
});

export const medicoSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: cpfValidator,
  crm: z.string().min(4, "CRM é obrigatório"),
  uf_crm: z.string().length(2, "UF do CRM é obrigatória"),
  especialidade: z.string().min(2, "Especialidade é obrigatória"),
  email: emailValidator,
  telefone: telefoneValidator,
  whatsapp: telefoneValidator.optional(),
});

export const hospitalSchema = z.object({
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  nomeFantasia: z.string().min(3, "Nome fantasia é obrigatório"),
  cnpj: cnpjValidator,
  cnes: z.string().min(7, "CNES é obrigatório"),
  tipo: z.enum(["publico", "privado", "misto"]),
  email: emailValidator,
  telefone: telefoneValidator,
  endereco: enderecoSchema,
});

export const produtoSchema = z.object({
  nome: z.string().min(3, "Nome do produto é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  categoria: z.string().min(2, "Categoria é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  valor_unitario: z.number().min(0.01, "Valor deve ser maior que zero"),
  estoque_minimo: z.number().min(0, "Estoque mínimo não pode ser negativo"),
  estoque_atual: z.number().min(0, "Estoque atual não pode ser negativo"),
  anvisa: z.string().optional(),
  fabricante: z.string().optional(),
  lote: z.string().optional(),
  validade: z.string().optional(),
});

/**
 * Schemas de Operações
 */

export const pedidoSchema = z.object({
  fornecedor_id: z.string().uuid("Fornecedor inválido"),
  data_entrega: futuraDataValidator.optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
  items: z
    .array(
      z.object({
        produto_id: z.string().uuid("Produto inválido"),
        quantidade: z.number().min(1, "Quantidade deve ser maior que zero"),
        valor_unitario: z.number().min(0.01, "Valor deve ser maior que zero"),
      }),
    )
    .min(1, "Pedido deve ter pelo menos um item"),
});

export const cirurgiaSchema = z.object({
  paciente_id: z.string().uuid("Paciente inválido"),
  medico_id: z.string().uuid("Médico inválido"),
  hospital_id: z.string().uuid("Hospital inválido"),
  tipo: z.string().min(3, "Tipo de cirurgia é obrigatório"),
  data_agendada: futuraDataValidator,
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:MM)"),
  duracao_estimada: z.number().min(30, "Duração mínima: 30 minutos"),
  materiais: z.array(
    z.object({
      material_id: z.string().uuid(),
      quantidade: z.number().min(1),
    }),
  ),
  observacoes: z.string().max(1000).optional(),
});

export const consignacaoSchema = z.object({
  hospital_id: z.string().uuid("Hospital inválido"),
  medico_id: z.string().uuid("Médico inválido").optional(),
  data_inicio: z.string(),
  data_fim: futuraDataValidator.optional(),
  items: z
    .array(
      z.object({
        produto_id: z.string().uuid("Produto inválido"),
        quantidade: z.number().min(1, "Quantidade deve ser maior que zero"),
        valor_unitario: z.number().min(0.01),
        lote: z.string().optional(),
        validade: z.string().optional(),
      }),
    )
    .min(1, "Consignação deve ter pelo menos um item"),
  observacoes: z.string().max(500).optional(),
});

export const contratoSchema = z
  .object({
    fornecedor_id: z.string().uuid("Fornecedor inválido"),
    tipo: z.enum(["fornecimento", "servico", "locacao", "parceria"]),
    numero: z.string().min(1, "Número do contrato é obrigatório"),
    data_inicio: z.string(),
    data_fim: z.string(),
    valor_total: z.number().min(0.01, "Valor deve ser maior que zero"),
    forma_pagamento: z.enum([
      "avista",
      "parcelado",
      "mensal",
      "trimestral",
      "anual",
    ]),
    clausulas: z
      .array(z.string())
      .min(1, "Contrato deve ter pelo menos uma cláusula"),
    observacoes: z.string().max(1000).optional(),
  })
  .refine((data) => new Date(data.data_fim) > new Date(data.data_inicio), {
    message: "Data fim deve ser posterior à data início",
    path: ["data_fim"],
  });

/**
 * Schema de Contato (página de contato)
 */
export const contactFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: emailValidator,
  phone: telefoneValidator.optional(),
  subject: z.string().min(3, "Assunto é obrigatório").optional(),
  message: z.string().min(10, "Mensagem deve ter no mínimo 10 caracteres"),
});

/**
 * Valida dados e retorna resultado formatado
 *
 * @template T - Tipo dos dados validados
 * @param schema - Schema Zod para validação
 * @param data - Dados a serem validados
 * @returns Objeto com sucesso/erro e dados/erros formatados
 *
 * @example
 * ```typescript
 * const result = validateWithSchema(loginSchema, formData);
 *
 * if (result.success) {
 *   // result.data está tipado como LoginFormData
 *   console.log(result.data.email);
 * } else {
 *   // result.errors é Record<string, string>
 *   setFieldError('email', result.errors.email);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Com React Hook Form
 * const { handleSubmit } = useForm();
 *
 * const onSubmit = (data) => {
 *   const result = validateWithSchema(produtoSchema, data);
 *   if (!result.success) {
 *     Object.entries(result.errors).forEach(([field, message]) => {
 *       setError(field, { message });
 *     });
 *   }
 * };
 * ```
 *
 * @remarks
 * - Retorna erros formatados como objeto plano (field: message)
 * - Type-safe: dados retornados são automaticamente tipados
 * - Usa safeParse internamente para não lançar exceções
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true as const, data: result.data, errors: null };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return { success: false as const, data: null, errors };
}

/**
 * Type exports para uso nos componentes
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type EnderecoFormData = z.infer<typeof enderecoSchema>;
export type PessoaFisicaFormData = z.infer<typeof pessoaFisicaSchema>;
export type PessoaJuridicaFormData = z.infer<typeof pessoaJuridicaSchema>;
export type MedicoFormData = z.infer<typeof medicoSchema>;
export type HospitalFormData = z.infer<typeof hospitalSchema>;
export type ProdutoFormData = z.infer<typeof produtoSchema>;
export type PedidoFormData = z.infer<typeof pedidoSchema>;
export type CirurgiaFormData = z.infer<typeof cirurgiaSchema>;
export type ConsignacaoFormData = z.infer<typeof consignacaoSchema>;
export type ContratoFormData = z.infer<typeof contratoSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
