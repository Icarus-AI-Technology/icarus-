/**
 * TNT (FedEx Brasil) Service
 * 
 * SERVIÇOS INTEGRADOS:
 * - Rodoviário: Entrega terrestre
 * - Aéreo Doméstico: Entrega aérea nacional
 * - Express: Entrega expressa
 * 
 * API: REST
 * Cobertura: Nacional
 * Limite peso: 70kg
 */

  TransportadoraService,
  CotacaoParams,
  CotacaoResult,
  RastreamentoResult,
  StatusEntrega
} from '../base/types';

export class TNTService implements TransportadoraService {
  private baseURL = 'https://api.fedex.com/v1';
  private apiKey = import.meta.env.VITE_FEDEX_API_KEY || '';
  private secretKey = import.meta.env.VITE_FEDEX_SECRET_KEY || '';

  async cotarFrete(params: CotacaoParams): Promise<CotacaoResult[]> {
    try {
      // Mock para desenvolvimento
      if (!this.apiKey) {
        return this.getMockCotacoes(params);
      }

      // Implementação real da API
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseURL}/rate/v1/rates/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountNumber: { value: '123456789' },
          requestedShipment: {
            shipper: {
              address: {
                postalCode: params.origem.cep.replace(/\D/g, ''),
                countryCode: 'BR'
              }
            },
            recipient: {
              address: {
                postalCode: params.destino.cep.replace(/\D/g, ''),
                countryCode: 'BR'
              }
            },
            requestedPackageLineItems: params.volumes.map(v => ({
              weight: {
                value: v.peso,
                units: 'KG'
              },
              dimensions: {
                length: v.comprimento,
                width: v.largura,
                height: v.altura,
                units: 'CM'
              }
            }))
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: {
        output: {
          rateReplyDetails: Array<{
            serviceName: string;
            serviceType: string;
            serviceDescription?: string;
            ratedShipmentDetails: Array<{ totalNetCharge: string }>;
            commit?: {
              dateDetail?: {
                dayOfWeek: string;
              };
            };
          }>;
        };
      } = await response.json();

      return data.output.rateReplyDetails.map((rate) => ({
        transportadora: 'TNT (FedEx)',
        transportadoraId: 'tnt',
        servico: rate.serviceName,
        codigoServico: rate.serviceType,
        valor: parseFloat(rate.ratedShipmentDetails[0].totalNetCharge),
        prazo: rate.commit?.dateDetail?.dayOfWeek ? this.calcularPrazo(rate.commit.dateDetail.dayOfWeek) : 5,
        observacoes: rate.serviceDescription
      }));
    } catch (_error) {
      console.error('Erro ao cotar TNT:', _error);
      return [];
    }
  }

  async rastrear(codigoRastreio: string): Promise<RastreamentoResult> {
    try {
      if (!this.apiKey) {
        return this.getMockRastreamento(codigoRastreio);
      }

      const token = await this.getAuthToken();

      const response = await fetch(
        `${this.baseURL}/track/v1/trackingnumbers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trackingInfo: [{
              trackingNumberInfo: {
                trackingNumber: codigoRastreio
              }
            }],
            includeDetailedScans: true
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: {
        output: {
          completeTrackResults: Array<{
            trackResults: Array<{
              latestStatusDetail: { code: string };
              scanEvents: Array<{
                date: string;
                eventDescription: string;
                scanLocation: { city: string; stateOrProvinceCode: string };
              }>;
              estimatedDeliveryTimeWindow?: { window?: { ends?: string } };
            }>;
          }>;
        };
      } = await response.json();
      const trackingData = data.output.completeTrackResults[0].trackResults[0];

      return {
        codigoRastreio,
        status: this.mapearStatus(trackingData.latestStatusDetail.code),
        eventos: trackingData.scanEvents.map((e) => ({
          data: new Date(e.date),
          descricao: e.eventDescription,
          localizacao: `${e.scanLocation.city} - ${e.scanLocation.stateOrProvinceCode}`,
          tipo: 'movimentacao' as const
        })),
        previsaoEntrega: trackingData.estimatedDeliveryTimeWindow?.window?.ends 
          ? new Date(trackingData.estimatedDeliveryTimeWindow.window.ends)
          : null
      };
    } catch (_error) {
      console.error('Erro ao rastrear TNT:', _error);
      throw _error;
    }
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

  private async getAuthToken(): Promise<string> {
    // Implementar OAuth 2.0
    const response = await fetch('https://apis.fedex.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.secretKey
      })
    });

    const data = await response.json();
    return data.access_token;
  }

  private mapearStatus(code: string): StatusEntrega {
    const mapeamento: Record<string, StatusEntrega> = {
      'PU': 'coletado',
      'IT': 'em_transito',
      'OD': 'saiu_entrega',
      'DL': 'entregue',
      'DE': 'falha'
    };
    return mapeamento[code] || 'pendente';
  }

  private calcularPrazo(dayOfWeek: string): number {
    const hoje = new Date();
    const entrega = new Date(dayOfWeek);
    if (Number.isNaN(entrega.getTime())) {
      return 5;
    }
    const diff = Math.ceil((entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }

  // Mock data
  private getMockCotacoes(params: CotacaoParams): CotacaoResult[] {
    const peso = params.volumes.reduce((sum, v) => sum + v.peso, 0);
    const basePrice = peso * 6;

    return [
      {
        transportadora: 'TNT (FedEx)',
        transportadoraId: 'tnt',
        servico: 'Rodoviário',
        codigoServico: 'road',
        valor: basePrice,
        prazo: 5,
        observacoes: 'Entrega terrestre econômica'
      },
      {
        transportadora: 'TNT (FedEx)',
        transportadoraId: 'tnt',
        servico: 'Express',
        codigoServico: 'express',
        valor: basePrice * 2,
        prazo: 2,
        observacoes: 'Entrega expressa'
      }
    ];
  }

  private getMockRastreamento(codigo: string): RastreamentoResult {
    return {
      codigoRastreio: codigo,
      status: 'em_transito',
      eventos: [
        {
          data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          descricao: 'Pacote coletado',
          localizacao: 'São Paulo - SP',
          tipo: 'coleta'
        },
        {
          data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          descricao: 'Em trânsito',
          localizacao: 'Curitiba - PR',
          tipo: 'movimentacao'
        }
      ],
      previsaoEntrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  }
}

