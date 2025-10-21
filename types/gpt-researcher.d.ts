declare module "gpt-researcher" {
  export interface GPTResearcherOptions {
    host?: string;
    logListener?: (data: {
      type: string;
      content: string;
      output: string;
      metadata?: Record<string, unknown>;
    }) => void;
  }

  export interface ResearchMessage {
    task: string;
    reportType?: string;
    reportSource?: string;
    tone?: string;
    queryDomains?: string[];
  }

  export default class GPTResearcher {
    constructor(options?: GPTResearcherOptions);
    sendMessage(message: ResearchMessage): Promise<void>;
  }
}
