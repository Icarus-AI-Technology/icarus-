/**
 * Service: API Gateway
 *
 * Gerenciamento centralizado de chamadas a APIs externas
 * com rate limiting, circuit breaker, cache e monitoramento
 */

import { supabase } from "@/lib/supabase";
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from "axios";

type Primitive = string | number | boolean | null | undefined;

type APIAuthConfig =
  | {
      type: "api_key";
      headerName?: string;
      apiKey: string;
    }
  | {
      type: "bearer";
      token: string;
    }
  | {
      type: "basic";
      username: string;
      password: string;
    };

interface APICacheEntry {
  status: number;
  body: unknown;
  headers: Record<string, string> | null;
}

interface SerializedResponse {
  status: number;
  data: unknown;
  headers: Record<string, string> | null;
}

export interface APIEndpoint {
  id: string;
  nome: string;
  descricao: string;
  servico: string;
  metodo: string;
  url_base: string;
  url_path: string;
  auth_tipo?: string | null;
  auth_config?: Record<string, unknown> | null;
  rate_limit_requests: number;
  rate_limit_window: number;
  circuit_breaker_enabled: boolean;
  cache_enabled: boolean;
  cache_ttl: number;
  retry_enabled: boolean;
  retry_max_attempts: number;
  retry_backoff_ms: number;
  timeout_ms: number;
  criticidade: string;
}

export interface APIRequest {
  endpoint: string; // Nome do endpoint
  params?: Record<string, Primitive>; // Parâmetros de URL
  query?: Record<string, Primitive>; // Query string
  body?: unknown; // Body da requisição
  headers?: Record<string, string>; // Headers adicionais
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  status?: number;
  headers?: Record<string, string>;
  fromCache?: boolean;
  responseTime?: number;
  error?: string;
  retryAttempt?: number;
}

export class APIGatewayService {
  /**
   * Fazer requisição a API externa via Gateway
   */
  static async request<T = unknown>(
    request: APIRequest,
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    let endpoint: APIEndpoint | null = null;
    let retryAttempt = 0;

    try {
      // 1. Buscar configuração do endpoint
      endpoint = await this.getEndpointConfig(request.endpoint);
      if (!endpoint) {
        throw new Error(`Endpoint '${request.endpoint}' não encontrado`);
      }

      // 2. Verificar rate limit
      const canProceed = await this.checkRateLimit(endpoint.id);
      if (!canProceed) {
        throw new Error("Rate limit excedido. Tente novamente mais tarde.");
      }

      // 3. Verificar circuit breaker
      const circuitState = await this.getCircuitBreakerState(endpoint.id);
      if (circuitState === "open") {
        throw new Error(
          "Circuito aberto devido a falhas recentes. Aguarde antes de tentar novamente.",
        );
      }

      // 4. Tentar obter do cache (se habilitado)
      if (endpoint.cache_enabled && request.body === undefined) {
        const cacheKey = this.generateCacheKey(endpoint, request);
        const cached = await this.getFromCache(endpoint.id, cacheKey);
        if (cached) {
          await this.logRequest(
            endpoint,
            request,
            {
              status: cached.status,
              data: cached.body,
              headers: cached.headers ?? null,
            },
            true,
            0,
            Date.now() - startTime,
          );
          return {
            success: true,
            data: cached.body as T,
            status: cached.status,
            headers: cached.headers ?? undefined,
            fromCache: true,
            responseTime: Date.now() - startTime,
          };
        }
      }

      // 5. Fazer requisição com retry
      let response: AxiosResponse<unknown> | null = null;
      let lastError: Error | null = null;

      const maxAttempts = endpoint.retry_enabled
        ? endpoint.retry_max_attempts
        : 1;

      for (retryAttempt = 0; retryAttempt < maxAttempts; retryAttempt++) {
        try {
          response = await this.makeRequest(endpoint, request);
          break; // Sucesso, sair do loop
        } catch (error) {
          const err = error as Error;
          lastError = err;
          if (retryAttempt < maxAttempts - 1) {
            // Esperar com backoff exponencial
            const backoff =
              endpoint.retry_backoff_ms * Math.pow(2, retryAttempt);
            await this.sleep(backoff);
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Falha na requisição");
      }

      // 6. Salvar no cache (se habilitado e GET)
      if (endpoint.cache_enabled && endpoint.metodo === "GET") {
        const cacheKey = this.generateCacheKey(endpoint, request);
        await this.saveToCache(
          endpoint.id,
          cacheKey,
          response.status,
          response.data,
          this.normalizeHeaders(response.headers),
          endpoint.cache_ttl,
        );
      }

      // 7. Atualizar circuit breaker (sucesso)
      await this.updateCircuitBreaker(endpoint.id, true);

      // 8. Log da requisição
      await this.logRequest(
        endpoint,
        request,
        this.serializeResponse(response),
        false,
        retryAttempt,
        Date.now() - startTime,
      );

      return {
        success: true,
        data: response.data as T,
        status: response.status,
        headers: this.normalizeHeaders(response.headers),
        fromCache: false,
        responseTime: Date.now() - startTime,
        retryAttempt,
      };
    } catch (error: unknown) {
      const err = error as Error;
      const responseTime = Date.now() - startTime;

      // Atualizar circuit breaker (falha)
      if (endpoint) {
        await this.updateCircuitBreaker(endpoint.id, false);
      }

      // Log da requisição (erro)
      if (endpoint) {
        await this.logRequest(
          endpoint,
          request,
          null,
          false,
          retryAttempt,
          responseTime,
          err.message,
        );
      }

      console.error("[APIGateway] Erro na requisição:", err);

      return {
        success: false,
        error: err.message || "Erro desconhecido",
        responseTime,
        retryAttempt,
      };
    }
  }

  /**
   * Fazer requisição HTTP real
   */
  private static async makeRequest(
    endpoint: APIEndpoint,
    request: APIRequest,
  ): Promise<AxiosResponse<unknown>> {
    // Montar URL
    let url = endpoint.url_base + endpoint.url_path;

    // Substituir parâmetros na URL
    if (request.params) {
      Object.keys(request.params).forEach((key) => {
        const value = request.params ? request.params[key] : undefined;
        if (value !== undefined) {
          url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
        }
      });
    }

    // Montar configuração Axios
    const config: AxiosRequestConfig = {
      method: endpoint.metodo,
      url,
      timeout: endpoint.timeout_ms,
      params: request.query,
      data: request.body,
      headers: {
        ...request.headers,
      },
    };

    // Adicionar autenticação
    const authConfig = this.parseAuthConfig(
      endpoint.auth_tipo,
      endpoint.auth_config,
    );
    if (authConfig) {
      switch (authConfig.type) {
        case "api_key":
          config.headers![authConfig.headerName || "X-API-Key"] =
            authConfig.apiKey;
          break;
        case "bearer":
          config.headers!["Authorization"] = `Bearer ${authConfig.token}`;
          break;
        case "basic":
          config.auth = {
            username: authConfig.username,
            password: authConfig.password,
          };
          break;
      }
    }

    return axios(config);
  }

  /**
   * Obter configuração de endpoint
   */
  private static async getEndpointConfig(
    nome: string,
  ): Promise<APIEndpoint | null> {
    try {
      const { data, error } = await supabase
        .from("api_endpoints")
        .select("*")
        .eq("nome", nome)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao buscar endpoint:", err);
      return null;
    }
  }

  /**
   * Verificar rate limit
   */
  private static async checkRateLimit(endpointId: string): Promise<boolean> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id || null;

      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_endpoint_id: endpointId,
        p_user_id: userId,
      });

      if (error) throw error;

      return data === true;
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao verificar rate limit:", err);
      return false;
    }
  }

  /**
   * Obter estado do circuit breaker
   */
  private static async getCircuitBreakerState(
    endpointId: string,
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("api_circuit_breaker")
        .select("state, next_attempt_at")
        .eq("endpoint_id", endpointId)
        .single();

      if (error || !data) {
        return "closed"; // Default
      }

      // Se está open, verificar se pode tentar reabrir
      if (data.state === "open" && data.next_attempt_at) {
        if (new Date(data.next_attempt_at) <= new Date()) {
          // Transicionar para half_open
          await supabase
            .from("api_circuit_breaker")
            .update({ state: "half_open" })
            .eq("endpoint_id", endpointId);
          return "half_open";
        }
      }

      return data.state;
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao obter circuit breaker:", err);
      return "closed";
    }
  }

  /**
   * Atualizar circuit breaker
   */
  private static async updateCircuitBreaker(
    endpointId: string,
    success: boolean,
  ): Promise<void> {
    try {
      await supabase.rpc("update_circuit_breaker", {
        p_endpoint_id: endpointId,
        p_success: success,
      });
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao atualizar circuit breaker:", err);
    }
  }

  /**
   * Gerar chave de cache
   */
  private static generateCacheKey(
    endpoint: APIEndpoint,
    request: APIRequest,
  ): string {
    const parts = [
      endpoint.nome,
      JSON.stringify(request.params || {}),
      JSON.stringify(request.query || {}),
    ];
    return parts.join("|");
  }

  /**
   * Obter do cache
   */
  private static async getFromCache(
    endpointId: string,
    cacheKey: string,
  ): Promise<APICacheEntry | null> {
    try {
      const { data, error } = await supabase.rpc("get_from_cache", {
        p_endpoint_id: endpointId,
        p_cache_key: cacheKey,
      });

      if (error || !data) {
        return null;
      }

      const entry = data as APICacheEntry;
      return {
        status: entry.status,
        body: entry.body,
        headers: entry.headers ?? null,
      };
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao obter do cache:", err);
      return null;
    }
  }

  /**
   * Salvar no cache
   */
  private static async saveToCache(
    endpointId: string,
    cacheKey: string,
    status: number,
    body: unknown,
    headers: Record<string, string> | null,
    ttl: number,
  ): Promise<void> {
    try {
      await supabase.rpc("save_to_cache", {
        p_endpoint_id: endpointId,
        p_cache_key: cacheKey,
        p_response_status: status,
        p_response_body: body,
        p_response_headers: headers,
        p_ttl: ttl,
      });
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao salvar no cache:", err);
    }
  }

  /**
   * Log de requisição
   */
  private static async logRequest(
    endpoint: APIEndpoint,
    request: APIRequest,
    response: SerializedResponse | null,
    fromCache: boolean,
    retryAttempt: number,
    responseTime: number,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id || null;

      await supabase.from("api_requests_log").insert({
        endpoint_id: endpoint.id,
        endpoint_nome: endpoint.nome,
        user_id: userId,
        request_method: endpoint.metodo,
        request_url: endpoint.url_base + endpoint.url_path,
        request_params: request.params ?? null,
        request_body: request.body ?? null,
        response_status: response?.status ?? null,
        response_body: response?.data ?? null,
        response_time_ms: responseTime,
        from_cache: fromCache,
        retry_attempt: retryAttempt,
        error_message: errorMessage || null,
        response_headers: response?.headers ?? null,
      });
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao registrar log:", err);
    }
  }

  /**
   * Sleep helper
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obter métricas de endpoints
   */
  static async getMetrics(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase.from("vw_api_metrics").select("*");

      if (error) throw error;

      return (data as Record<string, unknown>[]) || [];
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao obter métricas:", err);
      return [];
    }
  }

  /**
   * Obter alertas ativos
   */
  static async getActiveAlerts(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from("api_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as Record<string, unknown>[]) || [];
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao obter alertas:", err);
      return [];
    }
  }

  /**
   * Resolver alerta
   */
  static async resolveAlert(alertId: string) {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { error } = await supabase
        .from("api_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
        })
        .eq("id", alertId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao resolver alerta:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Limpar cache expirado
   */
  static async cleanupCache(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc("cleanup_expired_cache");

      if (error) throw error;

      console.log(`[APIGateway] ${data} entradas de cache expiradas removidas`);
      return data || 0;
    } catch (error) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao limpar cache:", err);
      return 0;
    }
  }

  /**
   * Resetar circuit breaker manualmente
   */
  static async resetCircuitBreaker(endpointId: string) {
    try {
      const { error } = await supabase
        .from("api_circuit_breaker")
        .update({
          state: "closed",
          failure_count: 0,
          success_count: 0,
        })
        .eq("endpoint_id", endpointId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[APIGateway] Erro ao resetar circuit breaker:", err);
      return { success: false, error: err.message };
    }
  }

  private static normalizeHeaders(
    headers: AxiosResponse<unknown>["headers"] | undefined,
  ): Record<string, string> {
    const result: Record<string, string> = {};
    if (!headers) {
      return result;
    }

    const rawHeaders = headers as
      | AxiosResponseHeaders
      | RawAxiosResponseHeaders;
    Object.entries(rawHeaders).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result[key] = value.join(",");
      } else if (value !== undefined) {
        result[key] = String(value);
      }
    });

    return result;
  }

  private static serializeResponse(
    response: AxiosResponse<unknown>,
  ): SerializedResponse {
    return {
      status: response.status,
      data: response.data,
      headers: this.normalizeHeaders(response.headers),
    };
  }

  private static parseAuthConfig(
    authType: string | null | undefined,
    authConfig: Record<string, unknown> | null | undefined,
  ): APIAuthConfig | null {
    if (!authType || !authConfig) {
      return null;
    }

    switch (authType) {
      case "api_key": {
        const headerName =
          typeof authConfig.header_name === "string"
            ? authConfig.header_name
            : undefined;
        const apiKey =
          typeof authConfig.api_key === "string"
            ? authConfig.api_key
            : undefined;
        if (!apiKey) {
          return null;
        }
        return {
          type: "api_key",
          headerName,
          apiKey,
        };
      }
      case "bearer": {
        const token =
          typeof authConfig.token === "string" ? authConfig.token : undefined;
        if (!token) {
          return null;
        }
        return {
          type: "bearer",
          token,
        };
      }
      case "basic": {
        const username =
          typeof authConfig.username === "string"
            ? authConfig.username
            : undefined;
        const password =
          typeof authConfig.password === "string"
            ? authConfig.password
            : undefined;
        if (!username || !password) {
          return null;
        }
        return {
          type: "basic",
          username,
          password,
        };
      }
      default:
        return null;
    }
  }
}

// =====================================================
// Wrappers para APIs específicas
// =====================================================

/**
 * Wrapper para SEFAZ
 */
export class SEFAZService {
  static async emitirNFe<TPayload extends Record<string, unknown>>(
    dadosNFe: TPayload,
  ) {
    return APIGatewayService.request({
      endpoint: "sefaz_nfe_emitir",
      body: dadosNFe,
    });
  }

  static async consultarNFe(chaveAcesso: string) {
    return APIGatewayService.request({
      endpoint: "sefaz_nfe_consultar",
      body: { chaveAcesso },
    });
  }

  static async cancelarNFe(chaveAcesso: string, motivo: string) {
    return APIGatewayService.request({
      endpoint: "sefaz_nfe_cancelar",
      body: { chaveAcesso, motivo },
    });
  }
}

/**
 * Wrapper para ANVISA
 */
export class ANVISAGatewayService {
  static async consultarRegistro(numeroRegistro: string) {
    return APIGatewayService.request({
      endpoint: "anvisa_consultar_registro",
      query: { registro: numeroRegistro },
    });
  }

  static async rastrearDispositivo(numeroSerie: string, lote: string) {
    return APIGatewayService.request({
      endpoint: "anvisa_rastreabilidade",
      body: { numeroSerie, lote },
    });
  }
}

/**
 * Wrapper para CFM
 */
export class CFMGatewayService {
  static async consultarMedico(crm: string, uf: string) {
    return APIGatewayService.request({
      endpoint: "cfm_consultar_medico",
      query: { crm, uf },
    });
  }
}

/**
 * Wrapper para Receita Federal
 */
export class ReceitaFederalGatewayService {
  static async consultarCNPJ(cnpj: string) {
    return APIGatewayService.request({
      endpoint: "receita_consultar_cnpj",
      params: { cnpj },
    });
  }

  static async consultarCPF(cpf: string) {
    return APIGatewayService.request({
      endpoint: "receita_consultar_cpf",
      params: { cpf },
    });
  }
}

/**
 * Wrapper para ViaCEP
 */
export class ViaCEPGatewayService {
  static async consultarCEP(cep: string) {
    return APIGatewayService.request({
      endpoint: "viacep_consultar",
      params: { cep },
    });
  }
}

/**
 * Wrapper para Infosimples
 */
export class InfosimplesGatewayService {
  static async consultarCNPJCompleto(cnpj: string) {
    return APIGatewayService.request({
      endpoint: "infosimples_cnpj_completo",
      query: { cnpj },
    });
  }
}
