/**
 * Service: OPME Traceability Service
 * 
 * Integração com sistemas de rastreabilidade dos principais fabricantes OPME:
 * - Abbott Track&Trace
 * - Medtronic VISION
 * - J&J TraceLink
 * - Stryker Connect
 * - Boston Scientific iTrace
 */

import { APIGatewayService, APIRequest } from './APIGatewayService';

export interface DeviceInfo {
  serialNumber: string;
  lotNumber?: string;
  gtin?: string; // Global Trade Item Number
  expirationDate?: string;
  manufacturingDate?: string;
  manufacturer: 'abbott' | 'medtronic' | 'jj' | 'stryker' | 'boston_scientific';
}

export interface TraceabilityResult {
  success: boolean;
  verified: boolean;
  deviceInfo?: {
    serialNumber: string;
    lotNumber?: string;
    gtin?: string;
    productName?: string;
    productDescription?: string;
    manufacturer?: string;
    manufacturingDate?: string;
    expirationDate?: string;
    status?: 'active' | 'recalled' | 'expired' | 'invalid';
    recallInfo?: {
      isRecalled: boolean;
      recallDate?: string;
      recallReason?: string;
      recallNumber?: string;
    };
    certifications?: {
      anvisa?: {
        registrationNumber: string;
        validUntil: string;
        status: string;
      };
      fda?: {
        deviceClass: string;
        clearanceNumber: string;
      };
      ce?: {
        markingNumber: string;
        notifiedBody: string;
      };
    };
  };
  error?: string;
  source?: string; // Qual fabricante respondeu
}

export class OPMETraceabilityService {
  /**
   * Rastrear dispositivo Abbott
   */
  static async trackAbbott(serialNumber: string): Promise<TraceabilityResult> {
    try {
      const apiRequest: APIRequest = {
        endpoint: 'abbott_track_device',
        params: { serialNumber }
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        const d = response.data as Record<string, unknown>;
        return {
          success: true,
          verified: (d.verified as boolean) === true,
          deviceInfo: {
            serialNumber: d.serialNumber as string,
            lotNumber: d.lotNumber as (string | undefined),
            gtin: d.gtin as (string | undefined),
            productName: d.productName as (string | undefined),
            productDescription: d.description as (string | undefined),
            manufacturer: 'Abbott',
            manufacturingDate: d.manufactureDate as (string | undefined),
            expirationDate: d.expirationDate as (string | undefined),
            status: this.mapStatus(d.status as (string | undefined)),
            recallInfo: (d.recall as Record<string, unknown> | undefined) ? {
              isRecalled: true,
              recallDate: (d.recall as Record<string, unknown>).date as (string | undefined),
              recallReason: (d.recall as Record<string, unknown>).reason as (string | undefined),
              recallNumber: (d.recall as Record<string, unknown>).recallNumber as (string | undefined)
            } : { isRecalled: false }
          },
          source: 'Abbott Track&Trace'
        };
      } else {
        return {
          success: false,
          verified: false,
          error: response.error || 'Dispositivo não encontrado no sistema Abbott'
        };
      }
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro Abbott:', err);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar dispositivo Medtronic VISION
   */
  static async verifyMedtronic(serialNumber: string, lotNumber?: string): Promise<TraceabilityResult> {
    try {
      const apiRequest: APIRequest = {
        endpoint: 'medtronic_verify_device',
        body: {
          serialNumber,
          ...(lotNumber && { lotNumber })
        }
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        const d = response.data as Record<string, unknown>;
        return {
          success: true,
          verified: (d.isValid as boolean) === true,
          deviceInfo: {
            serialNumber: d.serialNumber as string,
            lotNumber: d.lotNumber as (string | undefined),
            gtin: d.gtin as (string | undefined),
            productName: (d.product as Record<string, unknown> | undefined)?.name as (string | undefined),
            productDescription: (d.product as Record<string, unknown> | undefined)?.description as (string | undefined),
            manufacturer: 'Medtronic',
            manufacturingDate: d.manufacturingDate as (string | undefined),
            expirationDate: d.expirationDate as (string | undefined),
            status: this.mapStatus(d.deviceStatus as (string | undefined)),
            recallInfo: {
              isRecalled: (d.recallStatus as string) === 'recalled',
              recallDate: d.recallDate as (string | undefined),
              recallReason: d.recallReason as (string | undefined)
            },
            // certifications omitted in stubbed typing
          },
          source: 'Medtronic VISION'
        };
      } else {
        return {
          success: false,
          verified: false,
          error: response.error || 'Dispositivo não encontrado no sistema Medtronic'
        };
      }
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro Medtronic:', err);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Consultar dispositivo J&J TraceLink
   */
  static async queryJJ(gtin: string, serialNumber: string): Promise<TraceabilityResult> {
    try {
      const apiRequest: APIRequest = {
        endpoint: 'jj_tracelink_query',
        params: { gtin, serialNumber }
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        const d = response.data as Record<string, unknown>;
        return {
          success: true,
          verified: ((d.serialization as Record<string, unknown> | undefined)?.status as string) === 'verified',
          deviceInfo: {
            serialNumber: d.serialNumber as string,
            lotNumber: d.lotNumber as (string | undefined),
            gtin: d.gtin as (string | undefined),
            productName: (d.productInfo as Record<string, unknown> | undefined)?.tradeName as (string | undefined),
            productDescription: (d.productInfo as Record<string, unknown> | undefined)?.description as (string | undefined),
            manufacturer: 'Johnson & Johnson',
            manufacturingDate: (d.dates as Record<string, unknown> | undefined)?.manufactured as (string | undefined),
            expirationDate: (d.dates as Record<string, unknown> | undefined)?.expiration as (string | undefined),
            status: this.mapStatus(((d.serialization as Record<string, unknown> | undefined)?.status as (string | undefined))),
            recallInfo: {
              isRecalled: ((d.recall as Record<string, unknown> | undefined)?.isActive as boolean) === true,
              recallDate: (d.recall as Record<string, unknown> | undefined)?.initiatedDate as (string | undefined),
              recallReason: (d.recall as Record<string, unknown> | undefined)?.reason as (string | undefined),
              recallNumber: (d.recall as Record<string, unknown> | undefined)?.identifier as (string | undefined)
            },
            // certifications omitted in stubbed typing
          },
          source: 'J&J TraceLink'
        };
      } else {
        return {
          success: false,
          verified: false,
          error: response.error || 'Dispositivo não encontrado no sistema J&J'
        };
      }
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro J&J:', err);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Consultar dispositivo Stryker Connect
   */
  static async lookupStryker(deviceId: string): Promise<TraceabilityResult> {
    try {
      const apiRequest: APIRequest = {
        endpoint: 'stryker_device_lookup',
        params: { deviceId }
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        const d = response.data as Record<string, unknown>;
        return {
          success: true,
          verified: (d.verified as boolean) === true,
          deviceInfo: {
            serialNumber: d.serialNumber as string,
            lotNumber: d.lot as (string | undefined),
            gtin: d.gtin as (string | undefined),
            productName: (d.product as Record<string, unknown> | undefined)?.name as (string | undefined),
            productDescription: (d.product as Record<string, unknown> | undefined)?.fullDescription as (string | undefined),
            manufacturer: 'Stryker',
            manufacturingDate: d.manufacturedDate as (string | undefined),
            expirationDate: d.expiryDate as (string | undefined),
            status: this.mapStatus(d.status as (string | undefined)),
            recallInfo: {
              isRecalled: ((d.recall as Record<string, unknown> | undefined)?.active as boolean) === true,
              recallDate: (d.recall as Record<string, unknown> | undefined)?.date as (string | undefined),
              recallReason: (d.recall as Record<string, unknown> | undefined)?.description as (string | undefined)
            },
            // certifications omitted in stubbed typing
          },
          source: 'Stryker Connect'
        };
      } else {
        return {
          success: false,
          verified: false,
          error: response.error || 'Dispositivo não encontrado no sistema Stryker'
        };
      }
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro Stryker:', err);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar dispositivo Boston Scientific iTrace
   */
  static async verifyBostonScientific(serialNumber: string, lotNumber?: string): Promise<TraceabilityResult> {
    try {
      const apiRequest: APIRequest = {
        endpoint: 'bostonsci_itrace_verify',
        body: {
          serialNumber,
          ...(lotNumber && { lotNumber })
        }
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        const d = response.data as Record<string, unknown>;
        return {
          success: true,
          verified: ((d.verificationResult as Record<string, unknown> | undefined)?.isValid as boolean) === true,
          deviceInfo: {
            serialNumber: d.serialNumber as string,
            lotNumber: d.lotNumber as (string | undefined),
            gtin: d.gtin as (string | undefined),
            productName: (d.productInfo as Record<string, unknown> | undefined)?.name as (string | undefined),
            productDescription: (d.productInfo as Record<string, unknown> | undefined)?.description as (string | undefined),
            manufacturer: 'Boston Scientific',
            manufacturingDate: (d.dates as Record<string, unknown> | undefined)?.manufacturing as (string | undefined),
            expirationDate: (d.dates as Record<string, unknown> | undefined)?.expiration as (string | undefined),
            status: this.mapStatus(d.status as (string | undefined)),
            recallInfo: {
              isRecalled: ((d.recallInfo as Record<string, unknown> | undefined)?.isActive as boolean) === true,
              recallDate: (d.recallInfo as Record<string, unknown> | undefined)?.date as (string | undefined),
              recallReason: (d.recallInfo as Record<string, unknown> | undefined)?.reason as (string | undefined),
              recallNumber: (d.recallInfo as Record<string, unknown> | undefined)?.number as (string | undefined)
            },
            // certifications omitted in stubbed typing
          },
          source: 'Boston Scientific iTrace'
        };
      } else {
        return {
          success: false,
          verified: false,
          error: response.error || 'Dispositivo não encontrado no sistema Boston Scientific'
        };
      }
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro Boston Scientific:', err);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar dispositivo automaticamente (detecta fabricante)
   */
  static async verifyDevice(device: DeviceInfo): Promise<TraceabilityResult> {
    try {
      switch (device.manufacturer) {
        case 'abbott':
          return await this.trackAbbott(device.serialNumber);
        
        case 'medtronic':
          return await this.verifyMedtronic(device.serialNumber, device.lotNumber);
        
        case 'jj':
          if (!device.gtin) {
            throw new Error('GTIN é obrigatório para J&J TraceLink');
          }
          return await this.queryJJ(device.gtin, device.serialNumber);
        
        case 'stryker':
          return await this.lookupStryker(device.serialNumber);
        
        case 'boston_scientific':
          return await this.verifyBostonScientific(device.serialNumber, device.lotNumber);
        
        default:
          return {
            success: false,
            verified: false,
            error: 'Fabricante não suportado'
          };
      }
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro ao verificar dispositivo:', err);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar múltiplos dispositivos em paralelo
   */
  static async verifyMultipleDevices(devices: DeviceInfo[]): Promise<TraceabilityResult[]> {
    try {
      const promises = devices.map(device => this.verifyDevice(device));
      return await Promise.all(promises);
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro ao verificar múltiplos dispositivos:', err);
      return [];
    }
  }

  /**
   * Mapear status do dispositivo para padrão interno
   */
  private static mapStatus(status: string | undefined): 'active' | 'recalled' | 'expired' | 'invalid' {
    if (!status) return 'invalid';
    
    const normalized = status.toLowerCase();
    
    if (normalized.includes('active') || normalized.includes('valid')) {
      return 'active';
    } else if (normalized.includes('recall')) {
      return 'recalled';
    } else if (normalized.includes('expired') || normalized.includes('expir')) {
      return 'expired';
    } else {
      return 'invalid';
    }
  }

  /**
   * Verificar se dispositivo está em recall
   */
  static async checkRecallStatus(device: DeviceInfo): Promise<{
    isRecalled: boolean;
    recallInfo?: {
      date: string;
      reason: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    };
  }> {
    try {
      const result = await this.verifyDevice(device);
      
      if (result.success && result.deviceInfo?.recallInfo) {
        return {
          isRecalled: result.deviceInfo.recallInfo.isRecalled,
          ...(result.deviceInfo.recallInfo.isRecalled && {
            recallInfo: {
              date: result.deviceInfo.recallInfo.recallDate || '',
              reason: result.deviceInfo.recallInfo.recallReason || '',
              severity: this.assessRecallSeverity(result.deviceInfo.recallInfo.recallReason || '')
            }
          })
        };
      }
      
      return { isRecalled: false };
    } catch (error) {
   const err = error as Error;
      console.error('[OPME Traceability] Erro ao verificar recall:', err);
      return { isRecalled: false };
    }
  }

  /**
   * Avaliar severidade do recall
   */
  private static assessRecallSeverity(reason: string): 'low' | 'medium' | 'high' | 'critical' {
    const normalized = reason.toLowerCase();
    
    if (normalized.includes('death') || normalized.includes('mortal') || normalized.includes('fatal')) {
      return 'critical';
    } else if (normalized.includes('serious') || normalized.includes('injury')) {
      return 'high';
    } else if (normalized.includes('adverse') || normalized.includes('defect')) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

export const opmeTraceabilityService = new OPMETraceabilityService();

