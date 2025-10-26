export interface FraudeAIDetection {
  eventId: string;
  riskScore: number;
  reason?: string;
}

export class FraudeAI {
  static async detect(_: Record<string, unknown> = {}): Promise<FraudeAIDetection[]> {
    return [];
  }
}
