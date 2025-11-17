/**
 * Dashboard de Monitoramento de Services
 * Exibe status em tempo real de todos os services OSS
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { ollamaService } from "@/lib/llm/ollama.service";
import { brasilAPIService } from "@/lib/integrations/brasilapi.service";
import { meilisearchService } from "@/lib/search/meilisearch.service";
import { queueService } from "@/lib/queue/bullmq.service";

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded" | "checking";
  responseTime?: number;
  lastCheck?: Date;
  details?: string;
  icon: React.ReactNode;
}

export default function MonitoringDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Ollama (LLM)",
      status: "checking",
      icon: <Activity size={20} />,
    },
    {
      name: "BrasilAPI",
      status: "checking",
      icon: <Activity size={20} />,
    },
    {
      name: "Meilisearch",
      status: "checking",
      icon: <Activity size={20} />,
    },
    {
      name: "BullMQ",
      status: "checking",
      icon: <Activity size={20} />,
    },
    {
      name: "Resend",
      status: "checking",
      icon: <Activity size={20} />,
    },
    {
      name: "GlitchTip",
      status: "checking",
      icon: <Activity size={20} />,
    },
    {
      name: "PostHog",
      status: "checking",
      icon: <Activity size={20} />,
    },
  ]);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const checkAllServices = useCallback(async () => {
    const checks = await Promise.all([
      checkOllama(),
      checkBrasilAPI(),
      checkMeilisearch(),
      checkBullMQ(),
      checkResend(),
      checkGlitchTip(),
      checkPostHog(),
    ]);

    setServices(checks);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    checkAllServices();

    if (autoRefresh) {
      const interval = setInterval(checkAllServices, 60000); // Check a cada 1 minuto
      return () => clearInterval(interval);
    }
  }, [autoRefresh, checkAllServices]);

  async function checkOllama(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const isOnline = await ollamaService.healthCheck();
      const responseTime = Date.now() - startTime;

      if (isOnline) {
        const models = await ollamaService.listModels();
        return {
          name: "Ollama (LLM)",
          status: "online",
          responseTime,
          lastCheck: new Date(),
          details: `${models.length} modelo(s) disponível(is)`,
          icon: (
            <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />
          ),
        };
      } else {
        return {
          name: "Ollama (LLM)",
          status: "offline",
          responseTime,
          lastCheck: new Date(),
          details: "Serviço não disponível",
          icon: <XCircle size={20} style={{ color: "var(--orx-error)" }} />,
        };
      }
    } catch {
      return {
        name: "Ollama (LLM)",
        status: "offline",
        lastCheck: new Date(),
        details: "Não instalado ou offline",
        icon: <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />,
      };
    }
  }

  async function checkBrasilAPI(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const isOnline = await brasilAPIService.healthCheck();
      const responseTime = Date.now() - startTime;

      return {
        name: "BrasilAPI",
        status: isOnline ? "online" : "offline",
        responseTime,
        lastCheck: new Date(),
        details: isOnline ? "API pública funcionando" : "API indisponível",
        icon: isOnline ? (
          <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />
        ) : (
          <XCircle size={20} style={{ color: "var(--orx-error)" }} />
        ),
      };
    } catch {
      return {
        name: "BrasilAPI",
        status: "offline",
        lastCheck: new Date(),
        details: "Erro ao conectar",
        icon: <XCircle size={20} style={{ color: "var(--orx-error)" }} />,
      };
    }
  }

  async function checkMeilisearch(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const isOnline = await meilisearchService.healthCheck();
      const responseTime = Date.now() - startTime;

      return {
        name: "Meilisearch",
        status: isOnline ? "online" : "offline",
        responseTime,
        lastCheck: new Date(),
        details: isOnline ? "Search engine ativo" : "Serviço offline",
        icon: isOnline ? (
          <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />
        ) : (
          <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />
        ),
      };
    } catch {
      return {
        name: "Meilisearch",
        status: "offline",
        lastCheck: new Date(),
        details: "Não configurado",
        icon: <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />,
      };
    }
  }

  async function checkBullMQ(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const isOnline = await queueService.healthCheck();
      const responseTime = Date.now() - startTime;

      if (isOnline) {
        const stats = await queueService.getStats();
        const totalJobs =
          stats.waiting + stats.active + stats.completed + stats.failed;

        return {
          name: "BullMQ",
          status: "online",
          responseTime,
          lastCheck: new Date(),
          details: `${totalJobs} jobs (${stats.active} ativos)`,
          icon: (
            <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />
          ),
        };
      } else {
        return {
          name: "BullMQ",
          status: "offline",
          responseTime,
          lastCheck: new Date(),
          details: "Queue service offline",
          icon: (
            <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />
          ),
        };
      }
    } catch {
      return {
        name: "BullMQ",
        status: "degraded",
        lastCheck: new Date(),
        details: "Usando mock (Redis não configurado)",
        icon: <Clock size={20} style={{ color: "var(--orx-info)" }} />,
      };
    }
  }

  async function checkResend(): Promise<ServiceStatus> {
    try {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;

      if (!apiKey) {
        return {
          name: "Resend",
          status: "offline",
          lastCheck: new Date(),
          details: "API key não configurada",
          icon: (
            <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />
          ),
        };
      }

      return {
        name: "Resend",
        status: "online",
        lastCheck: new Date(),
        details: "API key configurada",
        icon: <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />,
      };
    } catch {
      return {
        name: "Resend",
        status: "offline",
        lastCheck: new Date(),
        details: "Erro ao verificar",
        icon: <XCircle size={20} style={{ color: "var(--orx-error)" }} />,
      };
    }
  }

  async function checkGlitchTip(): Promise<ServiceStatus> {
    try {
      const dsn = import.meta.env.VITE_GLITCHTIP_DSN;

      if (!dsn) {
        return {
          name: "GlitchTip",
          status: "offline",
          lastCheck: new Date(),
          details: "DSN não configurado",
          icon: (
            <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />
          ),
        };
      }

      return {
        name: "GlitchTip",
        status: "online",
        lastCheck: new Date(),
        details: "Monitoramento ativo",
        icon: <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />,
      };
    } catch {
      return {
        name: "GlitchTip",
        status: "offline",
        lastCheck: new Date(),
        details: "Erro ao verificar",
        icon: <XCircle size={20} style={{ color: "var(--orx-error)" }} />,
      };
    }
  }

  async function checkPostHog(): Promise<ServiceStatus> {
    try {
      const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;

      if (!apiKey) {
        return {
          name: "PostHog",
          status: "offline",
          lastCheck: new Date(),
          details: "API key não configurada",
          icon: (
            <AlertCircle size={20} style={{ color: "var(--orx-warning)" }} />
          ),
        };
      }

      return {
        name: "PostHog",
        status: "online",
        lastCheck: new Date(),
        details: "Analytics ativo",
        icon: <CheckCircle size={20} style={{ color: "var(--orx-success)" }} />,
      };
    } catch {
      return {
        name: "PostHog",
        status: "offline",
        lastCheck: new Date(),
        details: "Erro ao verificar",
        icon: <XCircle size={20} style={{ color: "var(--orx-error)" }} />,
      };
    }
  }

  const onlineCount = services.filter((s) => s.status === "online").length;
  const offlineCount = services.filter((s) => s.status === "offline").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "600",
            color: "var(--orx-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Dashboard de Monitoramento
        </h1>
        <p style={{ color: "var(--orx-text-secondary)", fontSize: "0.875rem" }}>
          Status em tempo real dos services OSS do ICARUS v5.0
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="neumorphic-card" style={{ padding: "1.5rem" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <CheckCircle size={24} style={{ color: "var(--orx-success)" }} />
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--orx-text-primary)",
                }}
              >
                {onlineCount}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--orx-text-secondary)",
                }}
              >
                Online
              </div>
            </div>
          </div>
        </div>

        <div className="neumorphic-card" style={{ padding: "1.5rem" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <XCircle size={24} style={{ color: "var(--orx-error)" }} />
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--orx-text-primary)",
                }}
              >
                {offlineCount}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--orx-text-secondary)",
                }}
              >
                Offline
              </div>
            </div>
          </div>
        </div>

        <div className="neumorphic-card" style={{ padding: "1.5rem" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Clock size={24} style={{ color: "var(--orx-info)" }} />
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--orx-text-primary)",
                }}
              >
                {degradedCount}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--orx-text-secondary)",
                }}
              >
                Degradado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{ fontSize: "0.75rem", color: "var(--orx-text-secondary)" }}
        >
          Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.813rem",
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
            />
            Auto-refresh (1 min)
          </label>
          <button
            onClick={checkAllServices}
            className="neumorphic-button"
            style={{ padding: "0.5rem 1rem", fontSize: "0.813rem" }}
          >
            Atualizar Agora
          </button>
        </div>
      </div>

      {/* Services List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {services.map((service) => (
          <div
            key={service.name}
            className="neumorphic-card"
            style={{
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {service.icon}
              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "var(--orx-text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {service.name}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--orx-text-secondary)",
                  }}
                >
                  {service.details || "Verificando..."}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color:
                    service.status === "online"
                      ? "var(--orx-success)"
                      : service.status === "offline"
                        ? "var(--orx-error)"
                        : service.status === "degraded"
                          ? "var(--orx-info)"
                          : "var(--orx-text-secondary)",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                {service.status === "online" && "Online"}
                {service.status === "offline" && "Offline"}
                {service.status === "degraded" && "Degradado"}
                {service.status === "checking" && "Verificando..."}
              </div>
              {service.responseTime && (
                <div
                  style={{
                    fontSize: "0.688rem",
                    color: "var(--orx-text-secondary)",
                  }}
                >
                  {service.responseTime}ms
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          borderTop: "1px solid var(--orx-border)",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--orx-text-secondary)",
        }}
      >
        ICARUS v5.0 - Monitoramento OSS Services
      </div>
    </div>
  );
}
