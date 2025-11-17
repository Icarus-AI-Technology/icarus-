/**
 * Jadlog Service
 *
 * SERVIÇOS INTEGRADOS:
 * - .Package: Entregas rápidas (1-3 dias)
 * - .Com: E-commerce (2-5 dias)
 * - .Doc: Documentos urgentes (1-2 dias)
 * - .Cargo: Cargas grandes
 * - .International: Internacional
 *
 * API: REST
 * Cobertura: Principais capitais e regiões
 * Limite peso: 150kg
 */
import {
  TransportadoraService,
  CotacaoParams,
  CotacaoResult,
  RastreamentoResult,
  StatusEntrega,
  AgendarColetaParams,
  AgendarColetaResult,
} from "../base/types";

export class JadlogService implements TransportadoraService {
  private baseURL = "https://api.jadlog.com.br/v1";
  private token = import.meta.env.VITE_JADLOG_TOKEN || "";
  private cnpj = import.meta.env.VITE_JADLOG_CNPJ || "";

  async cotarFrete(params: CotacaoParams): Promise<CotacaoResult[]> {
    try {
      // Mock para desenvolvimento
      if (!this.token) {
        return this.getMockCotacoes(params);
      }

      const response = await fetch(`${this.baseURL}/freight/calculate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: {
            zipcode: params.origem.cep.replace(/\D/g, ""),
          },
          destination: {
            zipcode: params.destino.cep.replace(/\D/g, ""),
          },
          packages: params.volumes.map((v) => ({
            weight: v.peso,
            height: v.altura,
            width: v.largura,
            length: v.comprimento,
            value: v.valor,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return data.services.map(
        (service: {
          name: string;
          code: string;
          price: number;
          deliveryTime: number;
          description?: string;
        }) => ({
          transportadora: "Jadlog",
          transportadoraId: "jadlog",
          servico: service.name,
          codigoServico: service.code,
          valor: service.price,
          prazo: service.deliveryTime,
          observacoes: service.description,
        }),
      );
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao cotar Jadlog:", err.message ?? err);
      return [];
    }
  }

  async rastrear(codigoRastreio: string): Promise<RastreamentoResult> {
    try {
      // Mock para desenvolvimento
      if (!this.token) {
        return this.getMockRastreamento(codigoRastreio);
      }

      const response = await fetch(
        `${this.baseURL}/tracking/${codigoRastreio}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        codigoRastreio,
        status: this.mapearStatus(data.status),
        eventos: data.tracking.map(
          (e: { date: string; description: string; location: string }) => ({
            data: new Date(e.date),
            descricao: e.description,
            localizacao: e.location,
            tipo: "movimentacao" as const,
          }),
        ),
        previsaoEntrega: data.estimatedDelivery
          ? new Date(data.estimatedDelivery)
          : null,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao rastrear Jadlog:", err.message ?? err);
      throw err;
    }
  }

  async agendarColeta(
    params: AgendarColetaParams,
  ): Promise<AgendarColetaResult> {
    try {
      if (!this.token) {
        throw new Error("Token não configurado");
      }

      const response = await fetch(`${this.baseURL}/pickup/schedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: this.cnpj,
          address: {
            street: params.enderecoColeta.logradouro,
            number: params.enderecoColeta.numero,
            complement: params.enderecoColeta.complemento,
            neighborhood: params.enderecoColeta.bairro,
            city: params.enderecoColeta.cidade,
            state: params.enderecoColeta.uf,
            zipcode: params.enderecoColeta.cep.replace(/\D/g, ""),
          },
          date: params.dataColeta,
          time: params.horaColeta,
          packages: params.volumes.map((v) => ({
            weight: v.peso,
            height: v.altura,
            width: v.largura,
            length: v.comprimento,
          })),
          notes: params.observacoes,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        protocolo: data.protocol,
        codigoRastreio: data.trackingCode,
        dataColeta: new Date(`${params.dataColeta}T${params.horaColeta}`),
        observacoes: data.notes,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Erro ao agendar coleta Jadlog:", err.message ?? err);
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private mapearStatus(status: string): StatusEntrega {
    const mapeamento: Record<string, StatusEntrega> = {
      pending: "pendente",
      collected: "coletado",
      in_transit: "em_transito",
      out_for_delivery: "saiu_entrega",
      delivered: "entregue",
      failed: "falha",
      returned: "devolvido",
    };
    return mapeamento[status] || "pendente";
  }

  // Mock data
  private getMockCotacoes(params: CotacaoParams): CotacaoResult[] {
    const peso = params.volumes.reduce((sum, v) => sum + v.peso, 0);
    const basePrice = peso * 4;

    return [
      {
        transportadora: "Jadlog",
        transportadoraId: "jadlog",
        servico: ".Package",
        codigoServico: "package",
        valor: basePrice * 1.5,
        prazo: 2,
        observacoes: "Entrega rápida",
      },
      {
        transportadora: "Jadlog",
        transportadoraId: "jadlog",
        servico: ".Com",
        codigoServico: "com",
        valor: basePrice,
        prazo: 4,
        observacoes: "E-commerce econômico",
      },
    ];
  }

  private getMockRastreamento(codigo: string): RastreamentoResult {
    return {
      codigoRastreio: codigo,
      status: "em_transito",
      eventos: [
        {
          data: new Date(Date.now() - 24 * 60 * 60 * 1000),
          descricao: "Coletado",
          localizacao: "Hub São Paulo",
          tipo: "coleta",
        },
        {
          data: new Date(),
          descricao: "Em trânsito",
          localizacao: "Hub Campinas",
          tipo: "movimentacao",
        },
      ],
      previsaoEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    };
  }
}
