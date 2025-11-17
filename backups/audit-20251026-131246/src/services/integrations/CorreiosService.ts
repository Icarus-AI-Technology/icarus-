/**
 * Correios Service - Rastreamento e Cotação de Frete
 *
 * Funcionalidades:
 * - Rastreamento de encomendas
 * - Cálculo de frete
 * - Consulta de CEP
 * - Criação de etiquetas
 *
 * Documentação API: https://www.correios.com.br/para-sua-empresa/correios-api
 */

import axios, { AxiosInstance } from "axios";

export interface RastreioResponse {
  codigo: string;
  eventos: Array<{
    data: string;
    hora: string;
    local: string;
    status: string;
    descricao: string;
  }>;
}

export interface FreteParams {
  cepOrigem: string;
  cepDestino: string;
  peso: number; // em gramas
  formato: 1 | 2 | 3; // 1=caixa, 2=rolo, 3=envelope
  comprimento?: number; // em cm
  altura?: number; // em cm
  largura?: number; // em cm
  diametro?: number; // em cm
  valorDeclarado?: number;
  avisoRecebimento?: boolean;
}

export interface FreteResponse {
  servico: string;
  valor: number;
  prazoEntrega: number;
  valorSemAdicionais: number;
  valorMaoPropria: number;
  valorAvisoRecebimento: number;
  valorValorDeclarado: number;
  erro?: string;
}

export class CorreiosService {
  private api: AxiosInstance;
  private apiKey: string;
  private user: string;
  private password: string;
  private baseUrl = "https://api.correios.com.br";

  constructor() {
    this.apiKey = process.env.CORREIOS_API_KEY || "";
    this.user = process.env.CORREIOS_USER || "";
    this.password = process.env.CORREIOS_PASSWORD || "";

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Interceptor para adicionar auth
    this.api.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.headers["Authorization"] = `Bearer ${this.apiKey}`;
      }
      return config;
    });

    // Interceptor para retry em caso de erro
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry < 3) {
          config.retry += 1;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * config.retry),
          );
          return this.api(config);
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Rastreia uma encomenda pelo código de rastreamento
   */
  async rastrear(codigoRastreio: string): Promise<RastreioResponse> {
    try {
      const response = await this.api.get(`/sro/v1/objetos/${codigoRastreio}`);

      return {
        codigo: response.data.codigo,
        eventos: response.data.eventos.map((evento: any) => ({
          data: evento.dtHrCriado.split("T")[0],
          hora: evento.dtHrCriado.split("T")[1],
          local: `${evento.unidade.nome} - ${evento.unidade.endereco.cidade}/${evento.unidade.endereco.uf}`,
          status: evento.tipo,
          descricao: evento.descricao,
        })),
      };
    } catch (error: any) {
      console.error("Erro ao rastrear Correios:", error);
      throw new Error(`Falha ao rastrear encomenda: ${error.message}`);
    }
  }

  /**
   * Calcula o frete para diferentes serviços dos Correios
   */
  async calcularFrete(params: FreteParams): Promise<FreteResponse[]> {
    try {
      // Validar parâmetros
      this.validarParametrosFrete(params);

      // Serviços: 04014=SEDEX, 04510=PAC, 04782=SEDEX 10, 04790=SEDEX Hoje
      const servicos = ["04014", "04510", "04782", "04790"];

      const requests = servicos.map(async (codServico) => {
        try {
          const response = await this.api.post("/preco/v1/nacional", {
            idLoja: this.user,
            idObjeto: "01",
            cepOrigem: params.cepOrigem.replace(/\D/g, ""),
            cepDestino: params.cepDestino.replace(/\D/g, ""),
            psObjeto: params.peso,
            tpObjeto: params.formato,
            comprimento: params.comprimento || 16,
            altura: params.altura || 2,
            largura: params.largura || 11,
            diametro: params.diametro || 5,
            servicosAdicionais: this.montarServicosAdicionais(params),
          });

          const data = response.data;

          return {
            servico: this.getNomeServico(codServico),
            valor: parseFloat(data.pcFinal),
            prazoEntrega: parseInt(data.prazoEntrega),
            valorSemAdicionais: parseFloat(data.pcBase),
            valorMaoPropria: parseFloat(data.pcMaoPropria || "0"),
            valorAvisoRecebimento: parseFloat(data.pcAvisoRecebimento || "0"),
            valorValorDeclarado: parseFloat(data.pcValorDeclarado || "0"),
          };
        } catch (error: any) {
          return {
            servico: this.getNomeServico(codServico),
            valor: 0,
            prazoEntrega: 0,
            valorSemAdicionais: 0,
            valorMaoPropria: 0,
            valorAvisoRecebimento: 0,
            valorValorDeclarado: 0,
            erro: error.message,
          };
        }
      });

      const resultados = await Promise.all(requests);
      return resultados.filter((r) => !r.erro);
    } catch (error: any) {
      console.error("Erro ao calcular frete Correios:", error);
      throw new Error(`Falha ao calcular frete: ${error.message}`);
    }
  }

  /**
   * Consulta um CEP
   */
  async consultarCEP(cep: string): Promise<{
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  }> {
    try {
      const cepLimpo = cep.replace(/\D/g, "");
      const response = await this.api.get(`/cep/v1/${cepLimpo}`);

      return {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        complemento: response.data.complemento,
        bairro: response.data.bairro,
        cidade: response.data.localidade,
        uf: response.data.uf,
      };
    } catch (error: any) {
      console.error("Erro ao consultar CEP:", error);
      throw new Error(`CEP não encontrado: ${error.message}`);
    }
  }

  /**
   * Cria uma postagem (etiqueta)
   */
  async criarPostagem(params: {
    destinatario: {
      nome: string;
      endereco: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
    remetente: {
      nome: string;
      endereco: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
    servico: string;
    peso: number;
  }): Promise<{
    etiqueta: string;
    dataPostagem: string;
  }> {
    try {
      const response = await this.api.post("/postagem/v1", {
        remetente: params.remetente,
        destinatario: params.destinatario,
        servico: params.servico,
        peso: params.peso,
        formato: 1, // caixa/pacote
      });

      return {
        etiqueta: response.data.numero_etiqueta,
        dataPostagem: response.data.data_postagem,
      };
    } catch (error: any) {
      console.error("Erro ao criar postagem:", error);
      throw new Error(`Falha ao criar postagem: ${error.message}`);
    }
  }

  // ===== Métodos Auxiliares =====

  private validarParametrosFrete(params: FreteParams): void {
    if (!params.cepOrigem || !params.cepDestino) {
      throw new Error("CEP de origem e destino são obrigatórios");
    }

    if (!params.peso || params.peso <= 0) {
      throw new Error("Peso deve ser maior que zero");
    }

    if (![1, 2, 3].includes(params.formato)) {
      throw new Error("Formato inválido (1=caixa, 2=rolo, 3=envelope)");
    }
  }

  private montarServicosAdicionais(params: FreteParams): string {
    const servicos: string[] = [];

    if (params.valorDeclarado && params.valorDeclarado > 0) {
      servicos.push("019"); // Valor declarado
    }

    if (params.avisoRecebimento) {
      servicos.push("001"); // Aviso de recebimento
    }

    return servicos.join(",");
  }

  private getNomeServico(codigo: string): string {
    const nomes: Record<string, string> = {
      "04014": "SEDEX",
      "04510": "PAC",
      "04782": "SEDEX 10",
      "04790": "SEDEX Hoje",
      "04804": "SEDEX 12",
    };
    return nomes[codigo] || "Desconhecido";
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.user && this.password);
  }
}

export default CorreiosService;
