export interface ContasReceberAIScore {
  invoiceId: string;
  risk: number;
  notes?: string;
}

export class ContasReceberAI {
  static async scoreInvoices(): Promise<ContasReceberAIScore[]> {
    return [];
  }
}
