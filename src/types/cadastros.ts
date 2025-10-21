/**
 * Types para o módulo de Cadastros Inteligentes
 * ICARUS v5.0
 */

// Tipos base
export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'corrente' | 'poupanca';
  pix?: string;
}

// Médico
export interface Medico {
  id: string;
  nome_completo: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  sexo?: string;
  crm: string;
  uf_crm: string;
  especialidade: string;
  registro_ans?: string;
  telefone?: string;
  celular: string;
  email: string;
  linkedin?: string;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface MedicoFormData extends Omit<Medico, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
  // Form data não precisa de campos de auditoria
}

// Hospital
export interface Hospital {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  cnes?: string;
  tipo: 'hospital' | 'clinica' | 'ambulatorio';
  telefone: string;
  email: string;
  site?: string;
  endereco?: Endereco;
  responsavel_nome: string;
  responsavel_cpf: string;
  responsavel_telefone: string;
  responsavel_email?: string;
  responsavel_cargo?: string;
  quantidade_leitos?: number;
  salas_cirurgicas?: number;
  atende_urgencia: boolean;
  convenios_aceitos?: string[];
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Paciente
export interface Paciente {
  id: string;
  nome_completo: string;
  cpf?: string;
  rg?: string;
  data_nascimento: string;
  sexo: string;
  estado_civil?: string;
  nome_mae: string;
  nome_pai?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: Endereco;
  convenio_id?: string;
  numero_carteirinha?: string;
  validade_plano?: string;
  plano?: string;
  tipo_atendimento?: 'ambulatorial' | 'hospitalar' | 'completo';
  grupo_sanguineo?: string;
  alergias?: string;
  medicamentos_uso?: string;
  observacoes_saude?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Convênio
export interface Convenio {
  id: string;
  nome: string;
  cnpj?: string;
  ans_registro?: string;
  tipo: 'plano_saude' | 'seguros' | 'publico';
  telefone?: string;
  whatsapp?: string;
  email: string;
  site?: string;
  prazo_pagamento?: number;
  taxa_administrativa?: number;
  forma_pagamento?: 'ted' | 'boleto' | 'pix' | 'cheque';
  dia_fechamento?: number;
  dia_pagamento?: number;
  faturamento_eletronico: boolean;
  portal_faturamento?: string;
  login_portal?: string;
  exige_autorizacao: boolean;
  prazo_autorizacao?: number;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Fornecedor
export interface Fornecedor {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  tipo: 'fabricante' | 'distribuidor' | 'importador' | 'prestador_servicos';
  inscricao_estadual?: string;
  telefone: string;
  email: string;
  site?: string;
  contato_comercial_nome?: string;
  contato_comercial_telefone?: string;
  contato_comercial_email?: string;
  contato_financeiro_nome?: string;
  contato_financeiro_telefone?: string;
  contato_financeiro_email?: string;
  endereco?: Endereco;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  prazo_pagamento?: number;
  condicoes_pagamento?: string;
  prazo_entrega_medio?: number;
  tempo_resposta_cotacao?: number;
  pedido_minimo?: number;
  horario_atendimento?: string;
  aceita_consignacao: boolean;
  faz_entrega: boolean;
  raio_entrega?: number;
  avaliacao_qualidade?: number;
  avaliacao_pontualidade?: number;
  avaliacao_atendimento?: number;
  avaliacao_preco?: number;
  certificacoes?: {
    iso9001?: boolean;
    iso13485?: boolean;
    anvisa?: boolean;
    outras?: string;
  };
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Produto OPME
export interface ProdutoOPME {
  id: string;
  codigo_interno: string;
  codigo_barras?: string;
  codigo_anvisa?: string;
  codigo_tuss?: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  grupo_id?: string;
  classe_risco?: 'I' | 'II' | 'III' | 'IV';
  tipo_material?: string;
  fornecedor_id: string;
  fornecedores_alternativos?: string[];
  fabricante?: string;
  pais_origem?: string;
  preco_custo: number;
  margem_lucro: number;
  preco_venda: number;
  preco_minimo?: number;
  unidade_medida: 'UN' | 'CX' | 'PC' | 'KIT' | 'PAR';
  estoque_minimo: number;
  estoque_maximo?: number;
  ponto_pedido?: number;
  localizacao_estoque?: string;
  rastreavel: boolean;
  controla_lote: boolean;
  controla_validade: boolean;
  controla_numero_serie: boolean;
  requer_refrigeracao: boolean;
  temperatura_minima?: number;
  temperatura_maxima?: number;
  documentos?: {
    registro_anvisa?: string;
    laudo_tecnico?: string;
    manual_ifu?: string;
    certificado_conformidade?: string;
  };
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Validation Errors
export interface ValidationErrors {
  [key: string]: string;
}

// Duplicate Match (para detecção de duplicatas)
export interface DuplicateMatch {
  id: string;
  nome: string;
  score: number;
  motivo: string;
  dados: any;
}

// Duplicate Detection Params
export interface DuplicateDetectionParams {
  tipo: 'medico' | 'hospital' | 'paciente' | 'fornecedor' | 'produto';
  nome?: string;
  cpf?: string;
  cnpj?: string;
  crm?: string;
  uf_crm?: string;
  codigo_anvisa?: string;
  email?: string;
  excludeId?: string;
}

