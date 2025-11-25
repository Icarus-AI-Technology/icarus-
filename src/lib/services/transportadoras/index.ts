/**
 * Factory Pattern for Transportadora Services
 *
 * FUNÇÃO:
 * Centralizar criação de instâncias de serviços de transportadoras
 *
 * USO:
 * ```typescript
 * const service = getTransportadoraService('correios');
 * const cotacoes = await service.cotarFrete(params);
 * ```
 */

import type { TransportadoraService, TransportadoraInfo } from './base/types';
import { CorreiosService } from './nacionais/CorreiosService';
import { JadlogService } from './nacionais/JadlogService';
import { TNTService } from './nacionais/TNTService';

/**
 * Informações de todas as transportadoras disponíveis
 */
export const TRANSPORTADORAS_DISPONIVEIS: TransportadoraInfo[] = [
  {
    id: '1',
    codigo: 'correios',
    nome: 'Correios',
    razaoSocial: 'Empresa Brasileira de Correios e Telégrafos',
    tipo: 'nacional',
    modalidades: ['terrestre', 'aerea'],
    servicos: ['SEDEX', 'SEDEX 10', 'SEDEX 12', 'SEDEX Hoje', 'PAC'],
    cobertura: 'Nacional (100% dos municípios)',
    prazoMedio: '3-7 dias',
    custoMedio: 'R$ 25-80',
    rating: 4.2,
    ativo: true,
  },
  {
    id: '2',
    codigo: 'jadlog',
    nome: 'Jadlog',
    razaoSocial: 'Jadlog Logística S.A.',
    tipo: 'nacional',
    modalidades: ['terrestre', 'aerea'],
    servicos: ['.Package', '.Com', '.Doc', '.Cargo', '.International'],
    cobertura: 'Nacional (principais capitais)',
    prazoMedio: '2-5 dias',
    custoMedio: 'R$ 20-60',
    rating: 4.5,
    ativo: true,
  },
  {
    id: '3',
    codigo: 'tnt',
    nome: 'TNT (FedEx)',
    razaoSocial: 'FedEx Brasil Logística e Transporte S.A.',
    tipo: 'nacional',
    modalidades: ['terrestre', 'aerea'],
    servicos: ['Rodoviário', 'Aéreo Doméstico', 'Express'],
    cobertura: 'Nacional',
    prazoMedio: '1-4 dias',
    custoMedio: 'R$ 35-90',
    rating: 4.6,
    ativo: true,
  },
  // Placeholder para transportadoras futuras
  {
    id: '4',
    codigo: 'total-express',
    nome: 'Total Express',
    razaoSocial: 'Total Express Logística Ltda.',
    tipo: 'nacional',
    modalidades: ['terrestre', 'aerea'],
    servicos: ['Convencional', 'Urgente', 'Expresso'],
    cobertura: 'Nacional',
    prazoMedio: '2-6 dias',
    custoMedio: 'R$ 22-70',
    rating: 4.3,
    ativo: false, // Implementação futura
  },
  {
    id: '5',
    codigo: 'azul-cargo',
    nome: 'Azul Cargo Express',
    razaoSocial: 'Azul Linhas Aéreas Brasileiras S.A.',
    tipo: 'nacional',
    modalidades: ['aerea'],
    servicos: ['Azul Cargo Express', 'Azul Cargo Urgente'],
    cobertura: 'Nacional (principais aeroportos)',
    prazoMedio: '1-2 dias',
    custoMedio: 'R$ 80-200',
    rating: 4.7,
    ativo: false, // Implementação futura
  },
];

/**
 * Mapa de serviços disponíveis
 */
const servicesMap: Record<string, () => TransportadoraService> = {
  correios: () => new CorreiosService(),
  jadlog: () => new JadlogService(),
  tnt: () => new TNTService(),
  // Adicionar mais conforme implementação
};

/**
 * Get instance of transportadora service
 *
 * @param codigo - Código da transportadora (ex: 'correios', 'jadlog')
 * @returns Instance of TransportadoraService
 * @throws Error se transportadora não encontrada ou não implementada
 */
export function getTransportadoraService(codigo: string): TransportadoraService {
  const factory = servicesMap[codigo.toLowerCase()];

  if (!factory) {
    throw new Error(
      `Transportadora '${codigo}' não encontrada. ` +
        `Disponíveis: ${Object.keys(servicesMap).join(', ')}`
    );
  }

  return factory();
}

/**
 * Get all active transportadora services
 *
 * @returns Array of TransportadoraService instances
 */
export function getAllActiveServices(): TransportadoraService[] {
  return TRANSPORTADORAS_DISPONIVEIS.filter((t) => t.ativo).map((t) =>
    getTransportadoraService(t.codigo)
  );
}

/**
 * Get transportadora info by codigo
 */
export function getTransportadoraInfo(codigo: string): TransportadoraInfo | undefined {
  return TRANSPORTADORAS_DISPONIVEIS.find((t) => t.codigo.toLowerCase() === codigo.toLowerCase());
}

/**
 * Get transportadoras by type
 */
export function getTransportadorasByTipo(tipo: 'nacional' | 'internacional'): TransportadoraInfo[] {
  return TRANSPORTADORAS_DISPONIVEIS.filter((t) => t.tipo === tipo && t.ativo);
}

/**
 * Get transportadoras by modalidade
 */
export function getTransportadorasByModalidade(
  modalidade: 'terrestre' | 'aerea' | 'maritima'
): TransportadoraInfo[] {
  return TRANSPORTADORAS_DISPONIVEIS.filter((t) => t.modalidades.includes(modalidade) && t.ativo);
}

// Exports
export * from './base/types';
export * from './base/APIGateway';
export { CorreiosService } from './nacionais/CorreiosService';
export { JadlogService } from './nacionais/JadlogService';
export { TNTService } from './nacionais/TNTService';
