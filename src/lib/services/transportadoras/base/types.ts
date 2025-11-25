/**
 * Base Interface for all Transportadora Services
 *
 * PADRÃO:
 * Todas as transportadoras implementam esta interface
 * garantindo consistência e facilidade de manutenção
 */

export interface CotacaoParams {
  origem: {
    cep: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    uf: string;
  };
  destino: {
    cep: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    uf: string;
  };
  volumes: Volume[];
  tipoMercadoria?: 'opme' | 'geral' | 'controlado';
  urgencia?: 'normal' | 'urgente' | 'emergencia';
  valorDeclarado?: number;
}

export interface Volume {
  peso: number; // kg
  altura: number; // cm
  largura: number; // cm
  comprimento: number; // cm
  valor: number; // R$
}

export interface CotacaoResult {
  transportadora: string;
  transportadoraId: string;
  servico: string;
  codigoServico: string;
  valor: number;
  prazo: number; // dias
  valorDeclarado?: number;
  entregaDomiciliar?: boolean;
  entregaSabado?: boolean;
  observacoes?: string;
}

export interface RastreamentoResult {
  codigoRastreio: string;
  status: StatusEntrega;
  eventos: EventoRastreamento[];
  previsaoEntrega: Date | null;
  localizacaoAtual?: {
    lat: number;
    lng: number;
    descricao: string;
  };
}

export interface EventoRastreamento {
  data: Date;
  descricao: string;
  localizacao: string;
  tipo: TipoEventoRastreamento;
}

export type StatusEntrega =
  | 'pendente'
  | 'coletado'
  | 'em_transito'
  | 'saiu_entrega'
  | 'entregue'
  | 'falha'
  | 'cancelado'
  | 'devolvido';

export type TipoEventoRastreamento =
  | 'postagem'
  | 'coleta'
  | 'movimentacao'
  | 'saida_entrega'
  | 'entrega'
  | 'tentativa_falha'
  | 'devolucao'
  | 'ocorrencia';

export interface AgendarColetaParams {
  transportadoraId: string;
  enderecoColeta: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  enderecoDestino: {
    cep: string;
    cidade: string;
    uf: string;
  };
  dataColeta: string; // YYYY-MM-DD
  horaColeta: string; // HH:MM
  volumes: Volume[];
  observacoes?: string;
  contatoResponsavel?: {
    nome: string;
    telefone: string;
    email?: string;
  };
}

export interface AgendarColetaResult {
  success: boolean;
  protocolo: string;
  codigoRastreio: string;
  dataColeta: Date;
  observacoes?: string;
  etiqueta?: {
    url: string;
    formato: 'pdf' | 'zpl';
  };
}

export interface CancelamentoResult {
  success: boolean;
  protocolo: string;
  motivoCancelamento?: string;
  dataHoraCancelamento: Date;
}

export interface EtiquetaParams {
  codigoRastreio: string;
  remetente: AgendarColetaParams['enderecoColeta'];
  destinatario: AgendarColetaParams['enderecoDestino'];
  volumes: Volume[];
  valorDeclarado?: number;
}

export interface EtiquetaResult {
  url: string;
  formato: 'pdf' | 'zpl';
  dataGeracao: Date;
}

/**
 * Base Interface - Todas as transportadoras implementam
 */
export interface TransportadoraService {
  /**
   * Cotar frete em múltiplos serviços
   */
  cotarFrete(params: CotacaoParams): Promise<CotacaoResult[]>;

  /**
   * Rastrear entrega por código
   */
  rastrear(codigoRastreio: string): Promise<RastreamentoResult>;

  /**
   * Agendar coleta (se disponível)
   */
  agendarColeta?(params: AgendarColetaParams): Promise<AgendarColetaResult>;

  /**
   * Cancelar coleta/entrega (se disponível)
   */
  cancelar?(protocolo: string): Promise<CancelamentoResult>;

  /**
   * Gerar etiqueta de envio (se disponível)
   */
  gerarEtiqueta?(params: EtiquetaParams): Promise<EtiquetaResult>;

  /**
   * Health check da API
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Informações da Transportadora
 */
export interface TransportadoraInfo {
  id: string;
  codigo: string;
  nome: string;
  razaoSocial: string;
  tipo: 'nacional' | 'internacional';
  modalidades: Array<'terrestre' | 'aerea' | 'maritima'>;
  servicos: string[];
  cobertura: string;
  prazoMedio: string;
  custoMedio: string;
  rating: number; // 0-5
  ativo: boolean;
  logo?: string;
  website?: string;
  suporte?: {
    telefone: string;
    email: string;
    horario: string;
  };
}
