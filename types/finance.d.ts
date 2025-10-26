declare module '@/types/finance' {
  export interface ProjecaoFluxo {
    data: string;
    valor_projetado: number;
    confianca_inferior: number;
    confianca_superior: number;
    probabilidade?: number;
  }

  export interface FluxoCaixaDia {
    data: string;
    entradas: number;
    saidas: number;
    saldo_inicial?: number;
    saldo_final: number;
  }

  export interface CenarioFluxo {
    tipo: 'otimista' | 'realista' | 'pessimista';
    projecao: ProjecaoFluxo[];
    saldo_final_projetado: number;
    premissas: string[];
  }

  export interface ContaReceber {
    id: string;
    cliente_id?: string;
    valor_original: number;
    data_vencimento: string;
    data_emissao?: string;
    data_pagamento?: string | null;
    dias_atraso?: number;
    status?: string;
    tipo_receita?: string;
  }

  export interface LoteFaturamento {
    id: string;
    numero_lote?: string;
    valor_total?: number;
    status?: string;
    convenio_id?: string;
    itens?: Array<{
      id: string;
      paciente_nome?: string;
      procedimento?: string;
      quantidade?: number;
      valor_total?: number;
      percentual_glosa?: number;
    }>;
    mes_referencia?: string;
    arquivo_envio_url?: string;
  }
}
