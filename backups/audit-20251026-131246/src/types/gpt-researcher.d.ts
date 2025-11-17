declare module "gpt-researcher" {
  export interface GPTResearcherMessage {
    task: string;
    report_type?: string;
    report_source?: string;
    query_domains?: string[];
    max_results?: number;
    language?: string;
  }

  export interface GPTResearcherResponse {
    report?: string;
    content?: string;
    sources?: Array<{
      title?: string;
      url?: string;
      snippet?: string;
      relevance?: number;
    }>;
    metadata?: Record<string, unknown>;
  }

  export interface GPTResearcherClient {
    sendMessage(message: GPTResearcherMessage): Promise<GPTResearcherResponse>;
    close?: () => void;
  }

  const client: GPTResearcherClient;
  export default client;
}
