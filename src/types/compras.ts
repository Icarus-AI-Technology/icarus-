/**
 * Tipos e Interfaces para Módulo Compras e Fornecedores
 * 
 * Sistema: ICARUS v5.0
 * Versão: 5.0.0
 * Última Atualização: Outubro 2025
 */

// ========================================
// 1. GESTÃO DE COTAÇÕES
// ========================================

export interface ItemCotacao {
  id?: string;
  produto_id: string;
  produto_nome?: string;
  produto_codigo?: string;
  quantidade: number;
  unidade_medida: string;
  especificacao_tecnica?: string;
  urgente?: boolean;
  observacoes?: string;
}

export interface FornecedorCotacao {
  id?: string;
  fornecedor_id: string;
  fornecedor_nome?: string;
  fornecedor_cnpj?: string;
  itens_cotados: ItemFornecedorCotacao[];
  prazo_entrega_dias: number;
  condicoes_pagamento: string;
  frete_valor?: number;
  frete_tipo?: 'CIF' | 'FOB';
  observacoes?: string;
  status: 'aguardando' | 'respondida' | 'recusada';
  data_resposta?: string;
  validade_proposta?: string;
  score_automatico?: number;
  recomendacao_ia?: string;
}

export interface ItemFornecedorCotacao {
  item_cotacao_id: string;
  preco_unitario: number;
  preco_total: number;
  marca?: string;
  modelo?: string;
  codigo_fabricante?: string;
  disponibilidade: 'estoque' | 'sob_encomenda' | 'indisponivel';
  observacoes?: string;
}

export interface Cotacao {
  id?: string;
  numero_cotacao: string;
  data_criacao: string;
  data_limite_resposta: string;
  solicitante_id: string;
  solicitante_nome?: string;
  departamento: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'rascunho' | 'enviada' | 'em_analise' | 'aprovada' | 'cancelada';
  
  // Itens e Fornecedores
  itens: ItemCotacao[];
  fornecedores: FornecedorCotacao[];
  
  // Análise e Decisão
  fornecedor_vencedor_id?: string;
  criterio_selecao?: 'menor_preco' | 'melhor_prazo' | 'qualidade' | 'score_ia';
  justificativa_escolha?: string;
  
  // Análise IA
  analise_ia?: {
    fornecedor_recomendado_id: string;
    score_confianca: number;
    fatores_considerados: string[];
    economia_estimada?: number;
    alertas?: string[];
  };
  
  // Metadados
  observacoes?: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tipo: string;
  }>;
  
  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ========================================
// 2. PEDIDOS DE COMPRA
// ========================================

export interface AprovacaoPedido {
  nivel: number;
  aprovador_id: string;
  aprovador_nome?: string;
  aprovador_cargo?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data_acao?: string;
  observacoes?: string;
}

export interface PedidoCompra {
  id?: string;
  numero_pedido: string;
  data_emissao: string;
  data_entrega_prevista: string;
  
  // Origem
  cotacao_id?: string;
  solicitante_id: string;
  solicitante_nome?: string;
  departamento: string;
  centro_custo: string;
  
  // Fornecedor
  fornecedor_id: string;
  fornecedor_nome?: string;
  fornecedor_cnpj?: string;
  
  // Itens
  itens: ItemPedidoCompra[];
  
  // Valores
  subtotal: number;
  frete: number;
  impostos: number;
  desconto: number;
  total: number;
  
  // Condições
  condicoes_pagamento: string;
  prazo_entrega_dias: number;
  local_entrega: {
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    responsavel_recebimento?: string;
    telefone?: string;
  };
  
  // Status e Aprovação
  status: 'rascunho' | 'em_aprovacao' | 'aprovado' | 'enviado' | 'recebido_parcial' | 'recebido_total' | 'cancelado';
  aprovacoes: AprovacaoPedido[];
  nivel_aprovacao_atual: number;
  
  // Observações
  observacoes?: string;
  observacoes_internas?: string;
  
  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ItemPedidoCompra {
  id?: string;
  produto_id: string;
  produto_nome: string;
  produto_codigo?: string;
  quantidade: number;
  unidade_medida: string;
  preco_unitario: number;
  preco_total: number;
  quantidade_recebida?: number;
  status_recebimento?: 'pendente' | 'parcial' | 'total';
}

// ========================================
// 3. NOTAS DE COMPRA (NF-e)
// ========================================

export interface NotaFiscalCompra {
  id?: string;
  numero_nfe: string;
  serie: string;
  chave_acesso: string;
  data_emissao: string;
  data_entrada: string;
  
  // Origem
  pedido_compra_id?: string;
  
  // Fornecedor (Emitente)
  fornecedor_id: string;
  fornecedor_nome: string;
  fornecedor_cnpj: string;
  
  // Valores
  valor_produtos: number;
  valor_frete: number;
  valor_seguro: number;
  valor_desconto: number;
  valor_ipi: number;
  valor_icms: number;
  valor_pis: number;
  valor_cofins: number;
  valor_total: number;
  
  // Itens
  itens: ItemNotaFiscal[];
  
  // Status e Validações
  status: 'pendente' | 'validada' | 'divergente' | 'recusada' | 'contabilizada';
  status_sefaz: 'autorizada' | 'cancelada' | 'denegada' | 'nao_validada';
  validacao_sefaz_data?: string;
  divergencias?: Array<{
    tipo: 'quantidade' | 'preco' | 'produto' | 'valor_total';
    descricao: string;
    item_id?: string;
  }>;
  
  // Documentos
  xml_nfe?: string;
  pdf_danfe?: string;
  
  // Recebimento
  data_recebimento?: string;
  responsavel_recebimento?: string;
  conferencia_completa?: boolean;
  
  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ItemNotaFiscal {
  id?: string;
  numero_item: number;
  produto_codigo: string;
  produto_descricao: string;
  ncm: string;
  cfop: string;
  unidade_comercial: string;
  quantidade_comercial: number;
  valor_unitario: number;
  valor_total: number;
  
  // Impostos
  base_calculo_icms?: number;
  aliquota_icms?: number;
  valor_icms?: number;
  aliquota_ipi?: number;
  valor_ipi?: number;
  
  // Conferência
  quantidade_recebida?: number;
  conformidade?: 'conforme' | 'divergente' | 'recusado';
  observacoes_recebimento?: string;
}

// ========================================
// 4. COMPRAS INTERNACIONAIS
// ========================================

export interface CompraInternacional {
  id?: string;
  numero_processo: string;
  data_inicio: string;
  
  // Fornecedor Internacional
  fornecedor_id: string;
  fornecedor_nome: string;
  fornecedor_pais: string;
  fornecedor_dados_fiscais?: string;
  
  // Itens
  itens: ItemCompraInternacional[];
  
  // Valores
  moeda_origem: string;
  valor_produtos_moeda_origem: number;
  taxa_conversao: number;
  valor_produtos_brl: number;
  valor_frete_internacional: number;
  valor_seguro_internacional: number;
  valor_impostos_importacao: number;
  valor_total_brl: number;
  
  // Documentos de Importação
  numero_di?: string; // Declaração de Importação
  numero_dsi?: string; // Declaração Simplificada de Importação
  numero_licenca_importacao?: string;
  data_registro_di?: string;
  
  // Incoterm
  incoterm: 'EXW' | 'FCA' | 'CPT' | 'CIP' | 'DAP' | 'DPU' | 'DDP' | 'FAS' | 'FOB' | 'CFR' | 'CIF';
  
  // Logística
  modal_transporte: 'aereo' | 'maritimo' | 'rodoviario' | 'multimodal';
  empresa_logistica?: string;
  numero_tracking?: string;
  data_embarque?: string;
  data_chegada_prevista?: string;
  data_chegada_real?: string;
  
  // Status
  status: 'cotacao' | 'pedido_enviado' | 'aguardando_embarque' | 'em_transito' | 'aguardando_desembaraco' | 'liberado' | 'recebido' | 'cancelado';
  
  // Desembaraço Aduaneiro
  despachante_aduaneiro?: string;
  data_inicio_desembaraco?: string;
  data_fim_desembaraco?: string;
  custos_adicionais_desembaraco?: number;
  
  // Observações
  observacoes?: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tipo: string;
  }>;
  
  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ItemCompraInternacional {
  id?: string;
  produto_codigo: string;
  produto_descricao: string;
  quantidade: number;
  unidade_medida: string;
  preco_unitario_moeda_origem: number;
  preco_total_moeda_origem: number;
  preco_total_brl: number;
  ncm: string;
  peso_liquido_kg?: number;
  peso_bruto_kg?: number;
}

// ========================================
// 5. IA PARA COMPRAS
// ========================================

export interface PrevisaoDemanda {
  produto_id: string;
  produto_nome: string;
  periodo: string;
  demanda_prevista: number;
  confianca: number;
  tendencia: 'crescente' | 'estavel' | 'decrescente';
  sazonalidade?: {
    mes: number;
    fator: number;
  }[];
}

export interface RecomendacaoFornecedor {
  fornecedor_id: string;
  fornecedor_nome: string;
  score_geral: number;
  fatores: {
    preco_competitivo: number;
    prazo_entrega: number;
    qualidade_historica: number;
    pontualidade: number;
    atendimento: number;
  };
  produtos_recomendados: string[];
  economia_estimada?: number;
  alertas?: string[];
}

export interface AnaliseHistoricoCompras {
  periodo_inicio: string;
  periodo_fim: string;
  total_compras: number;
  valor_total: number;
  produtos_mais_comprados: Array<{
    produto_id: string;
    produto_nome: string;
    quantidade_total: number;
    valor_total: number;
    frequencia_compra_dias: number;
  }>;
  fornecedores_principais: Array<{
    fornecedor_id: string;
    fornecedor_nome: string;
    total_pedidos: number;
    valor_total: number;
    score_desempenho: number;
  }>;
  insights_ia: string[];
  recomendacoes: string[];
}

// ========================================
// 6. INTEGRAÇÃO FORNECEDORES (B2B)
// ========================================

export interface ConectorFornecedor {
  id?: string;
  fornecedor_id: string;
  fornecedor_nome: string;
  tipo_integracao: 'api_rest' | 'api_soap' | 'edi' | 'sftp' | 'manual';
  
  // Configurações API
  api_base_url?: string;
  api_key?: string;
  api_secret?: string;
  api_versao?: string;
  
  // Configurações EDI
  edi_protocolo?: string;
  edi_identificador?: string;
  
  // Configurações SFTP
  sftp_host?: string;
  sftp_porta?: number;
  sftp_usuario?: string;
  sftp_senha?: string;
  
  // Status e Sincronização
  status: 'ativo' | 'inativo' | 'erro' | 'manutencao';
  ultima_sincronizacao?: string;
  proxima_sincronizacao?: string;
  frequencia_sincronizacao: 'tempo_real' | 'hora' | 'diaria' | 'semanal';
  
  // Funcionalidades Habilitadas
  catalogo_online: boolean;
  consulta_estoque: boolean;
  envio_pedidos_automatico: boolean;
  rastreamento_pedidos: boolean;
  
  // Mapeamento de Campos
  mapeamento_campos?: Record<string, string>;
  
  // Logs
  logs_integracao?: Array<{
    data: string;
    tipo: 'sucesso' | 'erro' | 'alerta';
    mensagem: string;
  }>;
  
  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CatalogoFornecedor {
  id?: string;
  fornecedor_id: string;
  data_sincronizacao: string;
  total_produtos: number;
  produtos: Array<{
    codigo_fornecedor: string;
    codigo_interno?: string;
    descricao: string;
    marca?: string;
    modelo?: string;
    preco: number;
    disponibilidade: 'disponivel' | 'sob_encomenda' | 'indisponivel';
    estoque_atual?: number;
    prazo_entrega_dias?: number;
    unidade_medida: string;
  }>;
}

// ========================================
// TIPOS AUXILIARES
// ========================================

export interface ValidationErrors {
  [field: string]: string;
}

export interface ComprasKPIs {
  total_cotacoes_abertas: number;
  total_pedidos_pendentes: number;
  valor_compras_mes: number;
  economia_ia_estimada: number;
  notas_pendentes_validacao: number;
  compras_internacionais_transito: number;
}

