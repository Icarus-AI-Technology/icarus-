/**
 * Serviço de Gestão de Cadastros - ICARUS v5.0
 *
 * Responsável por:
 * - CRUD de todas as entidades cadastrais
 * - Validações de negócio
 * - Regras de duplicação
 * - Sincronização FHIR
 * - Audit log
 *
 * @version 5.0.0
 */

import { supabase } from '@/lib/supabase';

// ========================================
// TIPOS E INTERFACES
// ========================================

export type TipoEntidade =
  | 'medico'
  | 'hospital'
  | 'paciente'
  | 'convenio'
  | 'fornecedor'
  | 'produto_opme'
  | 'equipe_medica'
  | 'transportadora';

export interface CadastroBase {
  id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  ativo?: boolean;
}

export interface Medico extends CadastroBase {
  nome_completo: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  sexo?: string;
  crm: string;
  uf_crm: string;
  especialidade: string;
  subespecialidades?: string[];
  registro_ans?: string;
  telefone?: string;
  celular: string;
  email: string;
  linkedin?: string;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  documentos?: Documentos;
  observacoes?: string;
}

export interface Hospital extends CadastroBase {
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
  atende_urgencia?: boolean;
  convenios_aceitos?: string[];
  observacoes?: string;
}

export interface Paciente extends CadastroBase {
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
  convenio_id: string;
  numero_carteirinha: string;
  validade_plano?: string;
  plano?: string;
  tipo_atendimento?: string;
  grupo_sanguineo?: string;
  alergias?: string;
  medicamentos_uso?: string;
  observacoes_saude?: string;
  observacoes?: string;
  consentimento_lgpd?: boolean;
  consentimento_lgpd_data?: string;
}

export interface Convenio extends CadastroBase {
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
  forma_pagamento?: string;
  dia_fechamento?: number;
  dia_pagamento?: number;
  faturamento_eletronico?: boolean;
  portal_faturamento?: string;
  login_portal?: string;
  exige_autorizacao?: boolean;
  prazo_autorizacao?: number;
  observacoes?: string;
}

export interface Fornecedor extends CadastroBase {
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
  aceita_consignacao?: boolean;
  faz_entrega?: boolean;
  raio_entrega?: number;
  avaliacao_qualidade?: number;
  avaliacao_pontualidade?: number;
  avaliacao_atendimento?: number;
  avaliacao_preco?: number;
  certificacoes?: Certificacoes;
  observacoes?: string;
}

export interface ProdutoOPME extends CadastroBase {
  codigo_interno: string;
  codigo_barras?: string;
  codigo_anvisa?: string;
  codigo_tuss?: string;
  descricao: string;
  categoria?: string;
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
  preco_tabela?: number;
  unidade_medida: string;
  estoque_minimo: number;
  estoque_maximo?: number;
  ponto_pedido?: number;
  localizacao_estoque?: string;
  rastreavel?: boolean;
  controla_lote?: boolean;
  controla_validade?: boolean;
  controla_numero_serie?: boolean;
  requer_refrigeracao?: boolean;
  temperatura_minima?: number;
  temperatura_maxima?: number;
  documentos?: Documentos;
  observacoes?: string;
}

export interface EquipeMedica extends CadastroBase {
  nome: string;
  medico_responsavel_id: string;
  especialidade?: string;
  hospital_id?: string;
  membros: MembroEquipe[];
  dias_atuacao?: string[];
  horarios_preferencia?: string;
  cirurgias_semana_media?: number;
  observacoes?: string;
}

export interface MembroEquipe {
  medico_id: string;
  funcao:
    | 'cirurgiao_principal'
    | 'cirurgiao_auxiliar'
    | 'anestesista'
    | 'instrumentador'
    | 'auxiliar_enfermagem';
}

export interface Transportadora extends CadastroBase {
  nome: string;
  cnpj?: string;
  tipo: 'rodoviario' | 'aereo' | 'courier' | 'multimodal';
  telefone?: string;
  email?: string;
  site?: string;
  prazo_entrega_medio?: number;
  custo_km?: number;
  raio_atendimento?: number;
  horario_coleta?: string;
  possui_api?: boolean;
  api_url?: string;
  api_token?: string;
  api_auth_type?: 'bearer' | 'basic' | 'api_key' | 'oauth2';
  avaliacao?: number;
  observacoes?: string;
}

// Interfaces auxiliares
export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface DadosBancarios {
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: 'corrente' | 'poupanca';
  pix?: string;
}

export interface Documentos {
  [key: string]: string | undefined;
  diploma?: string;
  rqe?: string;
  certificados?: string;
  registro_anvisa?: string;
  laudo_tecnico?: string;
  manual_ifu?: string;
  certificado_conformidade?: string;
}

export interface Certificacoes {
  iso9001?: boolean;
  iso13485?: boolean;
  anvisa?: boolean;
  outras?: string;
}

// ========================================
// SERVIÇO PRINCIPAL
// ========================================

type CadastrosTableName =
  | 'medicos'
  | 'hospitais'
  | 'pacientes'
  | 'convenios'
  | 'fornecedores'
  | 'produtos_opme'
  | 'equipes_medicas'
  | 'transportadoras';

type AuditPayload = {
  antes?: Record<string, unknown> | null;
  depois?: Record<string, unknown> | null;
  descricao?: string | null;
  empresa_id?: string | null;
  usuario_id?: string | null;
};

export class CadastrosService {
  private tabelaMap: Record<TipoEntidade, CadastrosTableName> = {
    medico: 'medicos',
    hospital: 'hospitais',
    paciente: 'pacientes',
    convenio: 'convenios',
    fornecedor: 'fornecedores',
    produto_opme: 'produtos_opme',
    equipe_medica: 'equipes_medicas',
    transportadora: 'transportadoras',
  };

  private getTableName(tipo: TipoEntidade): CadastrosTableName {
    return this.tabelaMap[tipo];
  }

  /**
   * Buscar todos os registros de um tipo
   */
  async listar<T extends CadastroBase>(
    tipo: TipoEntidade,
    options?: {
      filtros?: Record<string, unknown>;
      ordenacao?: { campo: string; direcao: 'asc' | 'desc' };
      limite?: number;
      offset?: number;
    }
  ): Promise<{ data: T[]; count: number; error?: Error }> {
    try {
      const tabela = this.getTableName(tipo);
      let query = supabase.from(tabela).select('*', { count: 'exact' });

      // Aplicar filtros
      if (options?.filtros) {
        Object.entries(options.filtros).forEach(([campo, valor]) => {
          if (valor !== undefined && valor !== null && valor !== '') {
            query = query.eq(campo, valor);
          }
        });
      }

      // Aplicar ordenação
      if (options?.ordenacao) {
        query = query.order(options.ordenacao.campo, {
          ascending: options.ordenacao.direcao === 'asc',
        });
      }

      // Aplicar paginação
      if (options?.limite) {
        query = query.limit(options.limite);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limite || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        const err = error as Error;
        console.error(`Erro ao listar ${tipo}:`, err.message ?? err);
        return { data: [], count: 0, error: err };
      }

      return { data: data as T[], count: count || 0 };
    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao listar ${tipo}:`, err.message ?? err);
      return { data: [], count: 0, error: err };
    }
  }

  /**
   * Buscar um registro por ID
   */
  async buscarPorId<T extends CadastroBase>(
    tipo: TipoEntidade,
    id: string
  ): Promise<{ data: T | null; error?: Error }> {
    try {
      const tabela = this.getTableName(tipo);
      const { data, error } = await supabase.from(tabela).select('*').eq('id', id).single();

      if (error) {
        const err = error as Error;
        console.error(`Erro ao buscar ${tipo} por ID:`, err.message ?? err);
        return { data: null, error: err };
      }

      return { data: data as T };
    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao buscar ${tipo} por ID:`, err.message ?? err);
      return { data: null, error: err };
    }
  }

  /**
   * Criar um novo registro
   */
  async criar<T extends CadastroBase>(
    tipo: TipoEntidade,
    dados: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: T | null; error?: Error }> {
    try {
      const tabela = this.getTableName(tipo);

      // Adicionar metadados
      const dadosCompletos = {
        ...dados,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ativo: true,
      };

      const { data, error } = await supabase.from(tabela).insert(dadosCompletos).select().single();

      if (error) {
        const err = error as Error;
        console.error(`Erro ao criar ${tipo}:`, err.message ?? err);
        return { data: null, error: err };
      }

      // Registrar no audit log
      await this.registrarAuditLog(tabela, 'INSERT', data.id, {
        depois: data as Record<string, unknown>,
      });

      return { data: data as T };
    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao criar ${tipo}:`, err.message ?? err);
      return { data: null, error: err };
    }
  }

  /**
   * Atualizar um registro existente
   */
  async atualizar<T extends CadastroBase>(
    tipo: TipoEntidade,
    id: string,
    dados: Partial<T>
  ): Promise<{ data: T | null; error?: Error }> {
    try {
      const tabela = this.tabelaMap[tipo];

      // Buscar dados antigos para audit log
      const { data: dadosAntigos } = await this.buscarPorId(tipo, id);

      // Adicionar metadados de atualização
      const dadosCompletos = {
        ...dados,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(tabela)
        .update(dadosCompletos)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const err = error as Error;
        console.error(`Erro ao atualizar ${tipo}:`, err.message ?? err);
        return { data: null, error: err };
      }

      // Registrar no audit log
      await this.registrarAuditLog(tabela, 'UPDATE', id, {
        antes: (dadosAntigos as Record<string, unknown> | null) ?? null,
        depois: data as Record<string, unknown>,
      });

      return { data: data as T };
    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao atualizar ${tipo}:`, err.message ?? err);
      return { data: null, error: err };
    }
  }

  /**
   * Deletar (soft delete) um registro
   */
  async deletar(tipo: TipoEntidade, id: string): Promise<{ success: boolean; error?: Error }> {
    try {
      const tabela = this.tabelaMap[tipo];

      // Buscar dados para audit log
      const { data: dadosAntigos } = await this.buscarPorId(tipo, id);

      // Soft delete (marcar como inativo)
      const { error } = await supabase
        .from(tabela)
        .update({
          ativo: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        const err = error as Error;
        console.error(`Erro ao deletar ${tipo}:`, err.message ?? err);
        return { success: false, error: err };
      }

      // Registrar no audit log
      await this.registrarAuditLog(tabela, 'DELETE', id, {
        antes: (dadosAntigos as Record<string, unknown> | null) ?? null,
      });

      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao deletar ${tipo}:`, err.message ?? err);
      return { success: false, error: err };
    }
  }

  /**
   * Buscar com filtros avançados
   */
  async buscar<T extends CadastroBase>(
    tipo: TipoEntidade,
    termo: string,
    campos: string[] = ['nome', 'nome_completo', 'razao_social', 'descricao']
  ): Promise<{ data: T[]; error?: Error }> {
    try {
      const tabela = this.getTableName(tipo);

      // Construir query com OR para múltiplos campos
      let query = supabase.from(tabela).select('*');

      // Adicionar condições OR para cada campo
      const condicoes = campos.map((campo) => `${campo}.ilike.%${termo}%`).join(',');
      query = query.or(condicoes);

      const { data, error } = await query.limit(50);

      if (error) {
        const err = error as Error;
        console.error(`Erro ao buscar ${tipo}:`, err.message ?? err);
        return { data: [], error: err };
      }

      return { data: data as T[] };
    } catch (error) {
      const err = error as Error;
      console.error(`Erro ao buscar ${tipo}:`, err.message ?? err);
      return { data: [], error: err };
    }
  }

  /**
   * Registrar no audit log
   */
  private async registrarAuditLog(
    tabela: CadastrosTableName,
    acao: 'INSERT' | 'UPDATE' | 'DELETE',
    registroId: string,
    dados?: AuditPayload | null
  ): Promise<void> {
    try {
      await supabase.from('audit_log').insert({
        tabela,
        registro_id: registroId,
        acao,
        dados_antes: dados?.antes ?? null,
        dados_depois: dados?.depois ?? null,
        descricao: dados?.descricao ?? null,
        empresa_id: dados?.empresa_id ?? null,
        usuario_id: dados?.usuario_id ?? null,
      });
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao registrar audit log:', err.message ?? err);
    }
  }

  /**
   * Gerar código interno para produto
   */
  gerarCodigoInterno(prefixo: string = 'PRD'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefixo}-${timestamp}-${random}`;
  }

  /**
   * Calcular avaliação geral de fornecedor
   */
  calcularAvaliacaoGeral(fornecedor: Fornecedor): number {
    const avaliacoes = [
      fornecedor.avaliacao_qualidade || 0,
      fornecedor.avaliacao_pontualidade || 0,
      fornecedor.avaliacao_atendimento || 0,
      fornecedor.avaliacao_preco || 0,
    ];

    const soma = avaliacoes.reduce((acc, val) => acc + val, 0);
    return soma / avaliacoes.length;
  }
}

// Exportar instância singleton
export const cadastrosService = new CadastrosService();
