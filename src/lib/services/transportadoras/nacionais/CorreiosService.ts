/**
 * Correios Service
 * 
 * SERVIÇOS INTEGRADOS:
 * - SEDEX (04014): Entrega expressa nacional
 * - SEDEX 10 (40215): Entrega até 10h do dia seguinte
 * - SEDEX 12 (40169): Entrega até 12h do dia seguinte
 * - SEDEX Hoje (40290): Entrega no mesmo dia
 * - PAC (04510): Econômico nacional
 * 
 * API: SOAP + REST
 * Cobertura: 100% municípios brasileiros
 * Limite peso: 30kg (SEDEX), 50kg (PAC)
 */

  TransportadoraService,
  CotacaoParams,
  CotacaoResult,
  RastreamentoResult,
  StatusEntrega,
  TipoEventoRastreamento,
  AgendarColetaParams,
  AgendarColetaResult
} from '../base/types';

export class CorreiosService implements TransportadoraService {
  private baseURL = 'https://api.correios.com.br';
  private usuario = import.meta.env.VITE_CORREIOS_USUARIO || '';
  private senha = import.meta.env.VITE_CORREIOS_SENHA || '';
  private contrato = import.meta.env.VITE_CORREIOS_CONTRATO || '';

  private readonly SERVICOS = {
    '04014': 'SEDEX',
    '04510': 'PAC',
    '40215': 'SEDEX 10',
    '40169': 'SEDEX 12',
    '40290': 'SEDEX Hoje'
  };

  async cotarFrete(params: CotacaoParams): Promise<CotacaoResult[]> {
    const { origem, destino, volumes } = params;

    // Consultar múltiplos serviços
    const servicosDisponiveis = params.urgencia === 'emergencia' 
      ? ['40290', '40215'] // SEDEX Hoje, SEDEX 10
      : params.urgencia === 'urgente'
      ? ['04014', '40215'] // SEDEX, SEDEX 10
      : ['04014', '04510']; // SEDEX, PAC

    const promises = servicosDisponiveis.map(codServico =>
      this.calcularPrecoPrazo({
        codServico,
        cepOrigem: origem.cep.replace(/\D/g, ''),
        cepDestino: destino.cep.replace(/\D/g, ''),
        peso: volumes.reduce((sum, v) => sum + v.peso, 0),
        comprimento: Math.max(...volumes.map(v => v.comprimento)),
        altura: Math.max(...volumes.map(v => v.altura)),
        largura: Math.max(...volumes.map(v => v.largura)),
        valorDeclarado: params.valorDeclarado || volumes.reduce((sum, v) => sum + (v.valor || 0), 0)
      })
    );

    const resultados = await Promise.allSettled(promises);

    return resultados
      .filter((resultado): resultado is PromiseFulfilledResult<CotacaoResult | null> => resultado.status === 'fulfilled')
      .map((resultado) => resultado.value)
      .filter((cotacao): cotacao is CotacaoResult => Boolean(cotacao));
  }

  private async calcularPrecoPrazo(params: {
    codServico: string;
    cepOrigem: string;
    cepDestino: string;
    peso: number;
    comprimento: number;
    altura: number;
    largura: number;
    valorDeclarado: number;
  }): Promise<CotacaoResult | null> {
    try {
      // Mock para desenvolvimento - substituir por chamada real
      if (!this.usuario || !this.senha) {
        return this.getMockCotacao(params);
      }

      const response = await fetch(`${this.baseURL}/preco-prazo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.usuario}:${this.senha}`)}`
        },
        body: JSON.stringify({
          ...params,
          contrato: this.contrato,
          formato: 1, // Caixa/pacote
          maoPropria: 'N',
          avisoRecebimento: 'N'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: {
        Valor: string;
        PrazoEntrega: string;
        ValorDeclarado?: string;
        EntregaDomiciliar?: string;
        EntregaSabado?: string;
        ObsFim?: string;
        Erro?: string;
        MsgErro?: string;
      } = await response.json();

      if (data.Erro && data.Erro !== '0') {
        console.warn(`Erro Correios ${params.codServico}:`, data.MsgErro);
        return null;
      }

      return {
        transportadora: 'Correios',
        transportadoraId: 'correios',
        servico: this.SERVICOS[params.codServico as keyof typeof this.SERVICOS],
        codigoServico: params.codServico,
        valor: parseFloat(data.Valor.replace(',', '.')),
        prazo: parseInt(data.PrazoEntrega),
        valorDeclarado: parseFloat(data.ValorDeclarado || '0'),
        entregaDomiciliar: data.EntregaDomiciliar === 'S',
        entregaSabado: data.EntregaSabado === 'S',
        observacoes: data.ObsFim || undefined
      };
    } catch (_error) {
      console.error(`Erro ao cotar Correios ${params.codServico}:`, _error);
      return null;
    }
  }

  async rastrear(codigoRastreio: string): Promise<RastreamentoResult> {
    try {
      // Mock para desenvolvimento
      if (!this.usuario || !this.senha) {
        return this.getMockRastreamento(codigoRastreio);
      }

      const response = await fetch(
        `${this.baseURL}/rastreamento/v1/objetos/${codigoRastreio}`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`${this.usuario}:${this.senha}`)}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: {
        status: string;
        eventos: Array<{
          dtHrCriado: string;
          descricao: string;
          unidade: { nome: string; endereco: { cidade: string; uf: string } };
          tipo: string;
        }>;
        previsaoEntrega?: string;
        localizacao?: { lat: number; lng: number; descricao: string };
      } = await response.json();

      return {
        codigoRastreio,
        status: this.mapearStatus(data.status),
        eventos: data.eventos.map((e) => ({
          data: new Date(e.dtHrCriado),
          descricao: e.descricao,
          localizacao: `${e.unidade.nome} - ${e.unidade.endereco.cidade}/${e.unidade.endereco.uf}`,
          tipo: this.mapearTipoEvento(e.tipo)
        })),
        previsaoEntrega: data.previsaoEntrega ? new Date(data.previsaoEntrega) : null,
        localizacaoAtual: data.localizacao ? {
          lat: data.localizacao.lat,
          lng: data.localizacao.lng,
          descricao: data.localizacao.descricao
        } : undefined
      };
    } catch (_error) {
      console.error('Erro ao rastrear Correios:', _error);
      throw _error;
    }
  }

  async agendarColeta(_params: AgendarColetaParams): Promise<AgendarColetaResult> {
    // Correios não tem API pública para agendamento
    // Apenas grandes clientes via contrato específico
    throw new Error('Agendamento de coleta não disponível para Correios via API pública');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Mappers
  private mapearStatus(status: string): StatusEntrega {
    const mapeamento: Record<string, StatusEntrega> = {
      'postado': 'coletado',
      'em_transito': 'em_transito',
      'saiu_para_entrega': 'saiu_entrega',
      'entregue': 'entregue',
      'aguardando_retirada': 'falha',
      'devolvido': 'devolvido'
    };
    return mapeamento[status] || 'pendente';
  }

  private mapearTipoEvento(tipo: string): TipoEventoRastreamento {
    const mapeamento: Record<string, TipoEventoRastreamento> = {
      'PO': 'postagem',
      'RO': 'coleta',
      'DO': 'movimentacao',
      'OEC': 'saida_entrega',
      'BDE': 'entrega',
      'BR': 'tentativa_falha',
      'PMT': 'devolucao'
    };
    return mapeamento[tipo] || 'movimentacao';
  }

  // Mock data para desenvolvimento
  private getMockCotacao(params: { codServico: string; peso: number; comprimento: number; valorDeclarado: number; }): CotacaoResult {
    const servico = this.SERVICOS[params.codServico as keyof typeof this.SERVICOS];
    const basePrice = params.peso * 5 + params.comprimento * 0.1;
    const urgencyMultiplier = params.codServico === '40290' ? 3 : 
                              params.codServico === '40215' ? 2 : 1;

    return {
      transportadora: 'Correios',
      transportadoraId: 'correios',
      servico,
      codigoServico: params.codServico,
      valor: basePrice * urgencyMultiplier,
      prazo: params.codServico === '40290' ? 1 : 
             params.codServico === '40215' ? 1 :
             params.codServico === '04014' ? 3 : 7,
      valorDeclarado: params.valorDeclarado,
      entregaDomiciliar: true,
      entregaSabado: params.codServico !== '04510'
    };
  }

  private getMockRastreamento(codigo: string): RastreamentoResult {
    return {
      codigoRastreio: codigo,
      status: 'em_transito',
      eventos: [
        {
          data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          descricao: 'Objeto postado',
          localizacao: 'CDD São Paulo - SP',
          tipo: 'postagem'
        },
        {
          data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          descricao: 'Objeto em trânsito',
          localizacao: 'CTE Campinas - SP',
          tipo: 'movimentacao'
        },
        {
          data: new Date(),
          descricao: 'Objeto saiu para entrega',
          localizacao: 'CDD Florianópolis - SC',
          tipo: 'saida_entrega'
        }
      ],
      previsaoEntrega: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      localizacaoAtual: {
        lat: -27.5954,
        lng: -48.5480,
        descricao: 'Florianópolis - SC'
      }
    };
  }
}

