/**
 * PostHog CE (Community Edition) Service
 * Open-source product analytics (alternative to Amplitude/Mixpanel)
 * 
 * Features:
 * - Event tracking
 * - User properties
 * - Feature flags
 * - Session recording
 * - Funnels & retention
 * - A/B testing
 * - Heatmaps
 * 
 * Custo: $0 (self-hosted) vs $300-1,200/ano (Amplitude)
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface UserProperties {
  $set?: Record<string, any>;
  $set_once?: Record<string, any>;
  $unset?: string[];
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  variant?: string;
  payload?: any;
}

export class PostHogService {
  private apiKey: string;
  private host: string;
  private enabled: boolean;
  private userId?: string;
  private userProperties: Record<string, any> = {};
  private sessionId?: string;

  constructor(apiKey?: string, host?: string) {
    this.apiKey = apiKey || process.env.VITE_POSTHOG_API_KEY || '';
    this.host = host || process.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
    this.enabled = !!this.apiKey;

    if (!this.enabled && process.env.NODE_ENV === 'production') {
      console.warn('[PostHog] Not configured. Set VITE_POSTHOG_API_KEY');
    }

    this.initSession();
  }

  /**
   * Inicializa sessão
   */
  private initSession(): void {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Identifica usuário
   */
  identify(userId: string, properties?: Record<string, any>): void {
    this.userId = userId;
    if (properties) {
      this.userProperties = { ...this.userProperties, ...properties };
      this.setUserProperties({ $set: properties });
    }

    console.log('[PostHog] User identified:', userId);
  }

  /**
   * Define propriedades do usuário
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.enabled) return;

    this.capture('$set', {
      $set: properties.$set,
      $set_once: properties.$set_once,
      $unset: properties.$unset,
    });
  }

  /**
   * Captura evento
   */
  capture(event: string, properties?: Record<string, any>): void {
    if (!this.enabled) {
      console.debug('[PostHog] Disabled, skipping event:', event);
      return;
    }

    const payload: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        $session_id: this.sessionId,
        distinct_id: this.userId || this.getAnonymousId(),
        ...this.userProperties,
      },
      timestamp: new Date(),
    };

    this.sendEvent(payload);
  }

  /**
   * Page view
   */
  pageView(pageName?: string, properties?: Record<string, any>): void {
    this.capture('$pageview', {
      $current_url: window.location.href,
      $pathname: window.location.pathname,
      $title: pageName || document.title,
      ...properties,
    });
  }

  /**
   * Feature flag check
   */
  async isFeatureEnabled(flagKey: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const response = await fetch(`${this.host}/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          distinct_id: this.userId || this.getAnonymousId(),
        }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.featureFlags?.[flagKey] === true;
    } catch (error) {
      console.error('[PostHog] Feature flag check error:', error);
      return false;
    }
  }

  /**
   * Get feature flag variant
   */
  async getFeatureFlagVariant(flagKey: string): Promise<string | null> {
    if (!this.enabled) return null;

    try {
      const response = await fetch(`${this.host}/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          distinct_id: this.userId || this.getAnonymousId(),
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.featureFlagPayloads?.[flagKey] || null;
    } catch (error) {
      console.error('[PostHog] Feature flag variant error:', error);
      return null;
    }
  }

  /**
   * Envia evento para PostHog
   */
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(`${this.host}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          event: event.event,
          properties: event.properties,
          timestamp: event.timestamp?.toISOString(),
        }),
      });
    } catch (error) {
      console.error('[PostHog] Send event error:', error);
    }
  }

  /**
   * Get or create anonymous ID
   */
  private getAnonymousId(): string {
    let anonId = localStorage.getItem('posthog_anon_id');
    if (!anonId) {
      anonId = `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('posthog_anon_id', anonId);
    }
    return anonId;
  }

  /**
   * Reset (logout)
   */
  reset(): void {
    this.userId = undefined;
    this.userProperties = {};
    this.initSession();
    localStorage.removeItem('posthog_anon_id');
  }

  /**
   * Flush (force send pending events)
   */
  async flush(): Promise<void> {
    // In real PostHog SDK, this would flush queue
    // Mock implementation doesn't queue
  }
}

// Export singleton
export const analyticsService = new PostHogService();

/**
 * Event tracking helpers para ICARUS
 */

// Track: Cirurgia criada
export function trackCirurgiaCriada(cirurgiaId: string, data: any): void {
  analyticsService.capture('cirurgia_criada', {
    cirurgia_id: cirurgiaId,
    medico_id: data.medico_id,
    hospital_id: data.hospital_id,
    procedimento: data.procedimento,
    data_cirurgia: data.data_cirurgia,
  });
}

// Track: Produto adicionado ao estoque
export function trackProdutoAdicionado(produtoId: string, quantidade: number): void {
  analyticsService.capture('produto_adicionado', {
    produto_id: produtoId,
    quantidade,
  });
}

// Track: NFe emitida
export function trackNFeEmitida(nfeId: string, valor: number): void {
  analyticsService.capture('nfe_emitida', {
    nfe_id: nfeId,
    valor,
  });
}

// Track: Relatório gerado
export function trackRelatorioGerado(tipo: string, filtros: any): void {
  analyticsService.capture('relatorio_gerado', {
    tipo,
    filtros,
  });
}

// Track: Login
export function trackLogin(userId: string, metodo: string): void {
  analyticsService.identify(userId);
  analyticsService.capture('login', {
    metodo,
  });
}

// Track: Erro
export function trackError(errorMessage: string, context?: any): void {
  analyticsService.capture('error', {
    error_message: errorMessage,
    context,
  });
}

// Track: Feature usado
export function trackFeatureUsed(featureName: string, context?: any): void {
  analyticsService.capture('feature_used', {
    feature: featureName,
    context,
  });
}

