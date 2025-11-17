// PostHog Analytics Configuration
// URL: https://app.posthog.com

import posthog from "posthog-js";

// Configuration
export const posthogConfig = {
  apiKey:
    import.meta.env.VITE_POSTHOG_KEY ||
    "phx_nlBCJxYa8wDWU3eLGRHh242t9Nt3t8RP9xuxatDkEN7C48T",
  host: import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com",
  enabled: import.meta.env.VITE_POSTHOG_ENABLED !== "false",
};

// Initialize PostHog
export function initPostHog() {
  if (!posthogConfig.enabled || !posthogConfig.apiKey) {
    console.log("📊 PostHog analytics disabled");
    return false;
  }

  try {
    const initOptions = {
      api_host: posthogConfig.host,
      autocapture: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
      disable_session_recording: false,
      mask_all_text: false,
      mask_all_element_attributes: false,
    } as Parameters<typeof posthog.init>[1];

    posthog.init(posthogConfig.apiKey, initOptions);

    console.log("✅ PostHog analytics initialized");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar PostHog:", error);
    return false;
  }
}

// Helper functions
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  if (!posthogConfig.enabled) return;

  try {
    posthog?.capture?.(eventName, properties);
  } catch (error) {
    console.error("Erro ao rastrear evento:", error);
  }
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  if (!posthogConfig.enabled) return;

  try {
    posthog?.identify?.(userId, properties);
  } catch (error) {
    console.error("Erro ao identificar usuário:", error);
  }
}

export function trackPageView(pageName?: string) {
  if (!posthogConfig.enabled) return;

  try {
    posthog?.capture?.("$pageview", {
      page: pageName || window.location.pathname,
    });
  } catch (error) {
    console.error("Erro ao rastrear pageview:", error);
  }
}

// EDR-specific tracking
export function trackResearchSession(sessionId: string, query: string) {
  trackEvent("edr_research_started", {
    session_id: sessionId,
    query,
    timestamp: new Date().toISOString(),
  });
}

export function trackAgentPerformance(
  agentType: string,
  metrics: {
    responseTime: number;
    confidence: number;
    resultsCount: number;
  },
) {
  trackEvent("edr_agent_performance", {
    agent_type: agentType,
    response_time: metrics.responseTime,
    confidence_score: metrics.confidence,
    results_count: metrics.resultsCount,
  });
}

export function trackSearchQuery(query: string, resultsCount: number) {
  trackEvent("search_query", {
    query,
    results_count: resultsCount,
    search_engine: "meilisearch",
  });
}

// Export singleton
export default posthog;
