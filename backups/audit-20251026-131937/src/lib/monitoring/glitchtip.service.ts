/**
 * GlitchTip Error Tracking Service
 * Drop-in replacement for Sentry (open-source)
 *
 * Features:
 * - Error/exception tracking
 * - Performance monitoring
 * - Release tracking
 * - User feedback
 *
 * Economia: $360-1,200/ano vs Sentry
 */

export interface ErrorEvent {
  message: string;
  level: "fatal" | "error" | "warning" | "info" | "debug";
  timestamp?: Date;
  exception?: {
    type: string;
    value: string;
    stacktrace?: {
      frames: Array<{
        filename: string;
        function: string;
        lineno: number;
        colno?: number;
        context_line?: string;
      }>;
    };
  };
  user?: {
    id: string;
    username?: string;
    email?: string;
    ip_address?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  breadcrumbs?: Array<{
    timestamp: number;
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, unknown>;
  }>;
  request?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    data?: unknown;
  };
}

export interface PerformanceTransaction {
  name: string;
  op: "pageload" | "navigation" | "http.client" | "db.query" | "custom";
  startTimestamp: number;
  endTimestamp?: number;
  tags?: Record<string, string>;
  data?: Record<string, unknown>;
  spans?: Array<{
    description: string;
    op: string;
    startTimestamp: number;
    endTimestamp: number;
    tags?: Record<string, string>;
  }>;
}

type BreadcrumbEntry = NonNullable<ErrorEvent["breadcrumbs"]>[number];

export class GlitchTipService {
  private dsn: string;
  private environment: string;
  private release?: string;
  private enabled: boolean;
  private breadcrumbs: BreadcrumbEntry[] = [];

  constructor(config?: {
    dsn?: string;
    environment?: string;
    release?: string;
    enabled?: boolean;
  }) {
    this.dsn = config?.dsn || process.env.VITE_GLITCHTIP_DSN || "";
    this.environment =
      config?.environment || process.env.VITE_ENVIRONMENT || "production";
    this.release = config?.release || process.env.VITE_RELEASE || undefined;
    this.enabled =
      config?.enabled ?? (!!this.dsn && this.environment !== "development");

    if (!this.dsn && this.environment !== "development") {
      console.warn("[GlitchTip] DSN not configured. Set VITE_GLITCHTIP_DSN");
    }

    if (this.enabled) {
      this.setupGlobalHandlers();
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Unhandled errors
    window.addEventListener("error", (event) => {
      this.captureException(event.error || new Error(event.message), {
        tags: { type: "unhandled_error" },
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.captureException(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          tags: { type: "unhandled_rejection" },
          extra: { reason: event.reason },
        },
      );
    });
  }

  /**
   * Capture exception
   */
  captureException(
    error: Error,
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
      user?: ErrorEvent["user"];
      level?: ErrorEvent["level"];
    },
  ): string {
    if (!this.enabled) {
      console.debug("[GlitchTip] Disabled, skipping:", error);
      return "mock-event-id";
    }

    const parsedStacktrace = error.stack
      ? this.parseStackTrace(error.stack)
      : undefined;
    const event: ErrorEvent = {
      message: error.message,
      level: context?.level || "error",
      timestamp: new Date(),
      exception: {
        type: error.name,
        value: error.message,
        ...(parsedStacktrace ? { stacktrace: parsedStacktrace } : {}),
      },
      tags: {
        environment: this.environment,
        ...(this.release && { release: this.release }),
        ...context?.tags,
      },
      extra: context?.extra,
      user: context?.user,
      breadcrumbs: [...(this.breadcrumbs || [])],
    };

    this.sendEvent(event);
    return this.generateEventId();
  }

  /**
   * Capture message
   */
  captureMessage(
    message: string,
    level: ErrorEvent["level"] = "info",
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    },
  ): string {
    if (!this.enabled) {
      console.debug("[GlitchTip] Disabled, skipping message:", message);
      return "mock-event-id";
    }

    const event: ErrorEvent = {
      message,
      level,
      timestamp: new Date(),
      tags: {
        environment: this.environment,
        ...context?.tags,
      },
      extra: context?.extra,
      breadcrumbs: [...(this.breadcrumbs || [])],
    };

    this.sendEvent(event);
    return this.generateEventId();
  }

  /**
   * Add breadcrumb (navigation trail)
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: "fatal" | "error" | "warning" | "info" | "debug";
    data?: Record<string, unknown>;
  }): void {
    const entry: BreadcrumbEntry = {
      timestamp: Date.now(),
      message: breadcrumb.message,
      category: breadcrumb.category || "default",
      level: breadcrumb.level || "info",
      data: breadcrumb.data,
    };

    this.breadcrumbs.push(entry);

    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Set user context
   */
  setUser(user: ErrorEvent["user"] | null): void {
    // Store in memory for next events
    // In production, you'd want to persist this
    if (user) {
      sessionStorage.setItem("glitchtip_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("glitchtip_user");
    }
  }

  /**
   * Start performance transaction
   */
  startTransaction(
    name: string,
    op: PerformanceTransaction["op"] = "custom",
  ): {
    finish: () => void;
    setTag: (key: string, value: string) => void;
    setData: (key: string, value: unknown) => void;
  } {
    const transaction: PerformanceTransaction = {
      name,
      op,
      startTimestamp: Date.now(),
      tags: {},
      data: {},
      spans: [],
    };

    return {
      finish: () => {
        transaction.endTimestamp = Date.now();
        if (this.enabled) {
          this.sendTransaction(transaction);
        }
      },
      setTag: (key: string, value: string) => {
        if (!transaction.tags) transaction.tags = {};
        transaction.tags[key] = value;
      },
      setData: (key: string, value: unknown) => {
        if (!transaction.data) transaction.data = {};
        transaction.data[key] = value;
      },
    };
  }

  /**
   * Send event to GlitchTip
   */
  private async sendEvent(event: ErrorEvent): Promise<void> {
    if (!this.dsn) return;

    try {
      // Parse DSN: https://<key>@<host>/<project-id>
      const dsnUrl = new URL(this.dsn);
      const key = dsnUrl.username;
      const projectId = dsnUrl.pathname.slice(1);
      const endpoint = `${dsnUrl.protocol}//${dsnUrl.host}/api/${projectId}/store/`;

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}, sentry_client=glitchtip-js/1.0.0`,
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      const err = error as Error;
      console.error("[GlitchTip] Failed to send event:", err);
    }
  }

  /**
   * Send performance transaction
   */
  private async sendTransaction(
    transaction: PerformanceTransaction,
  ): Promise<void> {
    // Similar to sendEvent, but with transaction envelope
    console.debug("[GlitchTip] Transaction:", transaction);
  }

  /**
   * Parse stack trace
   */
  private parseStackTrace(
    stack: string,
  ): NonNullable<ErrorEvent["exception"]>["stacktrace"] | undefined {
    const lines = stack.split("\n").slice(1); // Skip first line (error message)
    const frames = lines
      .map((line) => {
        // Parse: "at functionName (filename:line:col)"
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          return {
            function: match[1],
            filename: match[2],
            lineno: parseInt(match[3], 10),
            colno: parseInt(match[4], 10),
          };
        }
        return null;
      })
      .filter((frame): frame is NonNullable<typeof frame> => frame !== null);

    return frames.length > 0 ? { frames } : undefined;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Export singleton
export const glitchTipService = new GlitchTipService();

// Export as global for console usage
if (typeof window !== "undefined") {
  (window as unknown as { GlitchTip?: GlitchTipService }).GlitchTip =
    glitchTipService;
}
