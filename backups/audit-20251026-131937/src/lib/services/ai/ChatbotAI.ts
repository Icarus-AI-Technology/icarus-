export interface ChatbotAIResponse {
  message: string;
  metadata?: Record<string, unknown>;
}

export class ChatbotAI {
  static async respond(_: string): Promise<ChatbotAIResponse> {
    return { message: "" };
  }
}
