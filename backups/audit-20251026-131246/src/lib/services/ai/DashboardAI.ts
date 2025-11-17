export interface DashboardAIResult {
  status: "ok";
  summary?: string;
  details?: Record<string, unknown>;
}

export class DashboardAI {
  static async analyze(
    _: Record<string, unknown> = {},
  ): Promise<DashboardAIResult> {
    return { status: "ok" };
  }
}
