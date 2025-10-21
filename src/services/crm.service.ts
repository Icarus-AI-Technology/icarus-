/**
 * API CFM - Consulta CRM de Médicos
 * ICARUS v5.0
 * 
 * Consulta dados de médicos via CRM (Conselho Regional de Medicina)
 * Preenchimento automático de nome completo e informações profissionais
 * 
 * IMPORTANTE: Esta é uma integração com a API do Supabase Edge Function
 * que consulta o CFM (conforme implementado em supabase/functions/valida_crm_cfm)
 */

export interface CRMData {
  crm: string;
  uf: string;
  nome: string;
  situacao: string;
  inscricao: string;
  especialidades: string[];
  dataCadastro?: string;
}

export interface CFMResponse {
  success: boolean;
  data?: CRMData;
  error?: string;
}

/**
 * Consulta CRM via Supabase Edge Function
 * Utiliza a função já implementada: valida_crm_cfm
 */
export async function consultarCRM(crm: string, uf: string): Promise<CRMData> {
  // Remove formatação
  const crmLimpo = crm.replace(/[^\d]/g, '');
  const ufUpper = uf.toUpperCase();
  
  if (crmLimpo.length < 4 || crmLimpo.length > 7) {
    throw new Error('CRM inválido');
  }
  
  if (ufUpper.length !== 2) {
    throw new Error('UF inválida');
  }
  
  try {
    // Consulta via Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(
      `${supabaseUrl}/functions/v1/valida_crm_cfm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          crm: crmLimpo,
          uf: ufUpper,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.status}`);
    }
    
    const result: CFMResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'CRM não encontrado ou inválido');
    }
    
    return result.data;
    
  } catch (_error) {
    console.error('Erro ao consultar CRM:', error);
    
    // Fallback: API pública do CFM (se disponível)
    try {
      // API alternativa (exemplo - ajustar conforme API real)
      const response = await fetch(
        `https://portal.cfm.org.br/api/v1/medicos?crm=${crmLimpo}&uf=${ufUpper}`
      );
      
      if (!response.ok) {
        throw new Error('CRM não encontrado');
      }
      
      const data = await response.json();
      
      return {
        crm: crmLimpo,
        uf: ufUpper,
        nome: data.nome || '',
        situacao: data.situacao || 'ATIVO',
        inscricao: data.inscricao || '',
        especialidades: data.especialidades || [],
        dataCadastro: data.dataCadastro,
      };
      
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      throw new Error('Não foi possível consultar o CRM. Verifique os dados informados.');
    }
  }
}

/**
 * Lista de UFs brasileiras
 */
export const UFS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

/**
 * Hook React para consulta de CRM
 */
import { useState } from 'react';

export function useCRM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CRMData | null>(null);
  
  const buscar = async (crm: string, uf: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const resultado = await consultarCRM(crm, uf);
      setData(resultado);
      return resultado;
    } catch (_err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const limpar = () => {
    setData(null);
    setError(null);
  };
  
  return {
    data,
    loading,
    error,
    buscar,
    limpar,
  };
}

