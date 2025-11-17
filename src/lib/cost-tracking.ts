/**
 * Cost Tracking Service for AI/ML Operations
 * Rastreia custos de operações com LLMs e ML services
 */

export interface CostEntry {
  id: string;
  timestamp: Date;
  service: "openai" | "anthropic" | "ollama" | "ml-service";
  model: string;
  operation: string;
  tokens_input?: number;
  tokens_output?: number;
  cost_usd: number;
  empresa_id?: string;
  usuario_id?: string;
  module?: string;
  metadata?: Record<string, any>;
}

export interface CostSummary {
  period: string;
  total_cost_usd: number;
  total_calls: number;
  by_service: Record<
    string,
    {
      cost: number;
      calls: number;
      avg_cost_per_call: number;
    }
  >;
  by_model: Record<
    string,
    {
      cost: number;
      calls: number;
      tokens_input: number;
      tokens_output: number;
    }
  >;
  by_module?: Record<
    string,
    {
      cost: number;
      calls: number;
    }
  >;
}

export interface CostAlert {
  type: "daily_limit" | "monthly_limit" | "spike" | "unusual_pattern";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  current_cost: number;
  threshold?: number;
  timestamp: Date;
}

class CostTrackingService {
  private entries: CostEntry[] = [];
  private alerts: CostAlert[] = [];

  // Cost per 1M tokens (USD)
  private readonly COSTS = {
    "openai:gpt-4-turbo": { input: 10, output: 30 },
    "anthropic:claude-3-5-sonnet": { input: 3, output: 15 },
    "ollama:*": { input: 0, output: 0 },
    "ml-service": { per_call: 0.001 }, // $0.001 per call
  };

  // Thresholds
  private readonly DAILY_LIMIT_USD = 100;
  private readonly MONTHLY_LIMIT_USD = 2000;

  /**
   * Track a cost entry
   */
  async trackCost(entry: Omit<CostEntry, "id" | "timestamp">): Promise<void> {
    const costEntry: CostEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.entries.push(costEntry);

    // Check for alerts
    await this.checkAlerts();

    // Persist to Supabase (if available)
    await this.persistToDatabase(costEntry);
  }

  /**
   * Calculate cost from token usage
   */
  calculateTokenCost(
    service: string,
    model: string,
    tokensInput: number,
    tokensOutput: number,
  ): number {
    const key = `${service}:${model}` as keyof typeof this.COSTS;
    const costs =
      this.COSTS[key] || this.COSTS[`${service}:*` as keyof typeof this.COSTS];

    if (!costs || (typeof costs === "object" && "per_call" in costs)) {
      return 0;
    }

    const inputCost = (tokensInput / 1000000) * costs.input;
    const outputCost = (tokensOutput / 1000000) * costs.output;

    return inputCost + outputCost;
  }

  /**
   * Get cost summary for a period
   */
  async getSummary(
    startDate: Date,
    endDate: Date,
    empresaId?: string,
  ): Promise<CostSummary> {
    const filtered = this.entries.filter((e) => {
      const inRange = e.timestamp >= startDate && e.timestamp <= endDate;
      const matchEmpresa = !empresaId || e.empresa_id === empresaId;
      return inRange && matchEmpresa;
    });

    const summary: CostSummary = {
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      total_cost_usd: 0,
      total_calls: filtered.length,
      by_service: {},
      by_model: {},
      by_module: {},
    };

    for (const entry of filtered) {
      summary.total_cost_usd += entry.cost_usd;

      // By service
      if (!summary.by_service[entry.service]) {
        summary.by_service[entry.service] = {
          cost: 0,
          calls: 0,
          avg_cost_per_call: 0,
        };
      }
      summary.by_service[entry.service].cost += entry.cost_usd;
      summary.by_service[entry.service].calls += 1;

      // By model
      if (!summary.by_model[entry.model]) {
        summary.by_model[entry.model] = {
          cost: 0,
          calls: 0,
          tokens_input: 0,
          tokens_output: 0,
        };
      }
      summary.by_model[entry.model].cost += entry.cost_usd;
      summary.by_model[entry.model].calls += 1;
      summary.by_model[entry.model].tokens_input += entry.tokens_input || 0;
      summary.by_model[entry.model].tokens_output += entry.tokens_output || 0;

      // By module
      if (entry.module) {
        if (!summary.by_module![entry.module]) {
          summary.by_module![entry.module] = { cost: 0, calls: 0 };
        }
        summary.by_module![entry.module].cost += entry.cost_usd;
        summary.by_module![entry.module].calls += 1;
      }
    }

    // Calculate averages
    for (const service in summary.by_service) {
      const s = summary.by_service[service];
      s.avg_cost_per_call = s.calls > 0 ? s.cost / s.calls : 0;
    }

    return summary;
  }

  /**
   * Get daily cost
   */
  async getDailyCost(
    date: Date = new Date(),
    empresaId?: string,
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await this.getSummary(startOfDay, endOfDay, empresaId);
    return summary.total_cost_usd;
  }

  /**
   * Get monthly cost
   */
  async getMonthlyCost(
    month: Date = new Date(),
    empresaId?: string,
  ): Promise<number> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const summary = await this.getSummary(startOfMonth, endOfMonth, empresaId);
    return summary.total_cost_usd;
  }

  /**
   * Check for cost alerts
   */
  private async checkAlerts(): Promise<void> {
    const dailyCost = await this.getDailyCost();
    const monthlyCost = await this.getMonthlyCost();

    // Daily limit check
    if (dailyCost > this.DAILY_LIMIT_USD * 0.9) {
      this.addAlert({
        type: "daily_limit",
        severity: dailyCost > this.DAILY_LIMIT_USD ? "critical" : "high",
        message: `Daily cost reached ${dailyCost.toFixed(2)} USD (limit: ${this.DAILY_LIMIT_USD} USD)`,
        current_cost: dailyCost,
        threshold: this.DAILY_LIMIT_USD,
        timestamp: new Date(),
      });
    }

    // Monthly limit check
    if (monthlyCost > this.MONTHLY_LIMIT_USD * 0.8) {
      this.addAlert({
        type: "monthly_limit",
        severity: monthlyCost > this.MONTHLY_LIMIT_USD ? "critical" : "medium",
        message: `Monthly cost reached ${monthlyCost.toFixed(2)} USD (limit: ${this.MONTHLY_LIMIT_USD} USD)`,
        current_cost: monthlyCost,
        threshold: this.MONTHLY_LIMIT_USD,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Add alert
   */
  private addAlert(alert: CostAlert): void {
    this.alerts.push(alert);
    console.warn(
      `[CostTracking] ${alert.severity.toUpperCase()}: ${alert.message}`,
    );

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 10): CostAlert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Persist to database
   */
  private async persistToDatabase(entry: CostEntry): Promise<void> {
    // TODO: Persist to Supabase ai_cost_tracking table
    // await supabase.from('ai_cost_tracking').insert({
    //   service: entry.service,
    //   model: entry.model,
    //   operation: entry.operation,
    //   tokens_input: entry.tokens_input,
    //   tokens_output: entry.tokens_output,
    //   cost_usd: entry.cost_usd,
    //   empresa_id: entry.empresa_id,
    //   usuario_id: entry.usuario_id,
    //   module: entry.module,
    //   metadata: entry.metadata,
    // });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export data for analysis
   */
  exportCSV(startDate: Date, endDate: Date): string {
    const filtered = this.entries.filter(
      (e) => e.timestamp >= startDate && e.timestamp <= endDate,
    );

    const header =
      "timestamp,service,model,operation,tokens_input,tokens_output,cost_usd,empresa_id,module\n";
    const rows = filtered
      .map(
        (e) =>
          `${e.timestamp.toISOString()},${e.service},${e.model},${e.operation},${e.tokens_input || 0},${e.tokens_output || 0},${e.cost_usd},${e.empresa_id || ""},${e.module || ""}`,
      )
      .join("\n");

    return header + rows;
  }
}

// Global cost tracking service
export const costTrackingService = new CostTrackingService();

/**
 * Example usage:
 *
 * import { costTrackingService } from '@/lib/cost-tracking';
 *
 * // Track a cost
 * await costTrackingService.trackCost({
 *   service: 'openai',
 *   model: 'gpt-4-turbo',
 *   operation: 'chat_completion',
 *   tokens_input: 1000,
 *   tokens_output: 500,
 *   cost_usd: 0.045,
 *   empresa_id: 'uuid',
 *   module: 'compliance',
 * });
 *
 * // Get daily summary
 * const dailyCost = await costTrackingService.getDailyCost();
 * console.log(`Today's cost: $${dailyCost.toFixed(2)}`);
 *
 * // Get detailed summary
 * const summary = await costTrackingService.getSummary(
 *   new Date('2025-10-01'),
 *   new Date('2025-10-31')
 * );
 *
 * // Check alerts
 * const alerts = costTrackingService.getAlerts();
 */
