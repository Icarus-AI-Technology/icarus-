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
        return {
          success: true,
          verified: response.data.verified === true,
          deviceInfo: {
            serialNumber: response.data.serialNumber,
            lotNumber: response.data.lotNumber,
            gtin: response.data.gtin,
            productName: response.data.productName,
            productDescription: response.data.description,
            manufacturer: 'Abbott',
            manufacturingDate: response.data.manufactureDate,
            expirationDate: response.data.expirationDate,
            status: this.mapStatus(response.data.status),
            recallInfo: response.data.recall ? {
              isRecalled: true,
              recallDate: response.data.recall.date,
              recallReason: response.data.recall.reason,
              recallNumber: response.data.recall.recallNumber
            } : { isRecalled: false },
            certifications: {
              anvisa: response.data.anvisa,
              fda: response.data.fda,
              ce: response.data.ce
            }
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
      console.error('[OPME Traceability] Erro Abbott:', error);
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
        return {
          success: true,
          verified: response.data.isValid === true,
          deviceInfo: {
            serialNumber: response.data.serialNumber,
            lotNumber: response.data.lotNumber,
            gtin: response.data.gtin,
            productName: response.data.product?.name,
            productDescription: response.data.product?.description,
            manufacturer: 'Medtronic',
            manufacturingDate: response.data.manufacturingDate,
            expirationDate: response.data.expirationDate,
            status: this.mapStatus(response.data.deviceStatus),
            recallInfo: {
              isRecalled: response.data.recallStatus === 'recalled',
              recallDate: response.data.recallDate,
              recallReason: response.data.recallReason
            },
            certifications: {
              anvisa: response.data.regulatory?.brazil,
              fda: response.data.regulatory?.usa,
              ce: response.data.regulatory?.europe
            }
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
      console.error('[OPME Traceability] Erro Medtronic:', error);
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
        return {
          success: true,
          verified: response.data.serialization?.status === 'verified',
          deviceInfo: {
            serialNumber: response.data.serialNumber,
            lotNumber: response.data.lotNumber,
            gtin: response.data.gtin,
            productName: response.data.productInfo?.tradeName,
            productDescription: response.data.productInfo?.description,
            manufacturer: 'Johnson & Johnson',
            manufacturingDate: response.data.dates?.manufactured,
            expirationDate: response.data.dates?.expiration,
            status: this.mapStatus(response.data.serialization?.status),
            recallInfo: {
              isRecalled: response.data.recall?.isActive === true,
              recallDate: response.data.recall?.initiatedDate,
              recallReason: response.data.recall?.reason,
              recallNumber: response.data.recall?.identifier
            },
            certifications: {
              anvisa: response.data.certifications?.anvisa,
              fda: response.data.certifications?.fda,
              ce: response.data.certifications?.ce
            }
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
      console.error('[OPME Traceability] Erro J&J:', error);
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
        return {
          success: true,
          verified: response.data.verified === true,
          deviceInfo: {
            serialNumber: response.data.serialNumber,
            lotNumber: response.data.lot,
            gtin: response.data.gtin,
            productName: response.data.product?.name,
            productDescription: response.data.product?.fullDescription,
            manufacturer: 'Stryker',
            manufacturingDate: response.data.manufacturedDate,
            expirationDate: response.data.expiryDate,
            status: this.mapStatus(response.data.status),
            recallInfo: {
              isRecalled: response.data.recall?.active === true,
              recallDate: response.data.recall?.date,
              recallReason: response.data.recall?.description
            },
            certifications: {
              anvisa: response.data.compliance?.brazil,
              fda: response.data.compliance?.fda,
              ce: response.data.compliance?.ce
            }
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
      console.error('[OPME Traceability] Erro Stryker:', error);
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
        return {
          success: true,
          verified: response.data.verificationResult?.isValid === true,
          deviceInfo: {
            serialNumber: response.data.serialNumber,
            lotNumber: response.data.lotNumber,
            gtin: response.data.gtin,
            productName: response.data.productInfo?.name,
            productDescription: response.data.productInfo?.description,
            manufacturer: 'Boston Scientific',
            manufacturingDate: response.data.dates?.manufacturing,
            expirationDate: response.data.dates?.expiration,
            status: this.mapStatus(response.data.status),
            recallInfo: {
              isRecalled: response.data.recallInfo?.isActive === true,
              recallDate: response.data.recallInfo?.date,
              recallReason: response.data.recallInfo?.reason,
              recallNumber: response.data.recallInfo?.number
            },
            certifications: {
              anvisa: response.data.regulatory?.brazil,
              fda: response.data.regulatory?.us,
              ce: response.data.regulatory?.eu
            }
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
      console.error('[OPME Traceability] Erro Boston Scientific:', error);
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
      console.error('[OPME Traceability] Erro ao verificar dispositivo:', error);
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
      console.error('[OPME Traceability] Erro ao verificar múltiplos dispositivos:', error);
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
      console.error('[OPME Traceability] Erro ao verificar recall:', error);
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

