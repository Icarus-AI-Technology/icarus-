/**
 * Tipos para integrações externas
 */

export interface JadlogQuoteRequest {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  valorDeclarado: number;
}

export interface JadlogQuoteResponse {
  valor: number;
  prazo: number;
  servico: string;
}

export interface BraspressShipmentRequest {
  cnpjRemetente: string;
  cnpjDestinatario: string;
  peso: number;
  volumes: number;
}

export interface BraspressShipmentResponse {
  protocolo: string;
  dataColeta: string;
  valorFrete: number;
}

export interface SendGridEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface TwilioSmsRequest {
  to: string;
  body: string;
  from?: string;
}
