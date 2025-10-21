/**
 * useDashboardData - Hook para dados do Dashboard Principal
 * Sistema: ICARUS v5.0
 * 
 * Fornece KPIs em tempo real com SWR (Stale-While-Revalidate)
 */

import { useState, useEffect, useCallback } from 'react';

export interface KPIData {
  id: string;
  label: string;
  value: string | number;
  trend: number; // -100 a +100 (%)
  unit?: string;
  metadata?: {
    subtitle?: string;
    average?: string;
    cities?: number;
  };
}

export interface MiniGraphData {
  values: number[]; // 8 dias
  colorScheme: 'red' | 'green' | 'blue';
  label: string;
}

export interface DashboardData {
  kpis: KPIData[];
  miniGraphs: {
    estoqueCritico: MiniGraphData;
    logistica: MiniGraphData;
    performanceIA: MiniGraphData;
  };
  lastUpdate: Date;
}

// Mock data (em produção virá do Supabase)
const MOCK_DATA: DashboardData = {
  kpis: [
    {
      id: 'sistema-status',
      label: 'Sistema Status',
      value: '98%',
      trend: 2.3,
      unit: '%'
    },
    {
      id: 'medicos-ativos',
      label: 'Médicos Ativos',
      value: 1847,
      trend: 12.5,
      unit: 'médicos'
    },
    {
      id: 'produtos-opme',
      label: 'Produtos OPME',
      value: '12.4K',
      trend: 5.2,
      unit: 'produtos'
    },
    {
      id: 'pedidos-urgentes',
      label: 'Pedidos Urgentes',
      value: 89,
      trend: -8.1,
      unit: 'pedidos'
    },
    {
      id: 'faturamento-mensal',
      label: 'Faturamento Mensal',
      value: 'R$ 3.8M',
      trend: 15.3,
      unit: 'reais',
      metadata: {
        average: 'R$ 127K',
        subtitle: 'média diária'
      }
    },
    {
      id: 'distribuicao-geografica',
      label: 'Distribuição Geográfica',
      value: 147,
      trend: 8.7,
      unit: 'hospitais',
      metadata: {
        cities: 28
      }
    },
    {
      id: 'estoque-critico',
      label: 'Estoque Crítico',
      value: 8,
      trend: -42.3,
      unit: 'produtos'
    },
    {
      id: 'logistica',
      label: 'Logística',
      value: '96.2%',
      trend: 3.8,
      unit: '%',
      metadata: {
        subtitle: 'entregas no prazo'
      }
    },
    {
      id: 'performance-ia',
      label: 'Performance IA',
      value: '97.3%',
      trend: 1.2,
      unit: '%',
      metadata: {
        subtitle: 'precisão do sistema'
      }
    }
  ],
  miniGraphs: {
    estoqueCritico: {
      values: [30, 50, 70, 45, 85, 60, 92, 75],
      colorScheme: 'red',
      label: 'Últimos 8 dias'
    },
    logistica: {
      values: [50, 70, 85, 65, 95, 80, 100, 90],
      colorScheme: 'green',
      label: 'Últimos 8 dias'
    },
    performanceIA: {
      values: [45, 60, 75, 55, 85, 70, 90, 80],
      colorScheme: 'blue',
      label: 'Últimos 8 dias'
    }
  },
  lastUpdate: new Date()
};

export const useDashboardData = (useRealData = false) => {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (useRealData) {
        // Integração Supabase
        const { supabase } = await import('@/lib/supabase');
        const { data: result, error: supabaseError } = await supabase
          .rpc('get_dashboard_kpis');
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        if (result) {
          setData({
            kpis: result.kpis,
            miniGraphs: result.miniGraphs,
            lastUpdate: new Date(result.lastUpdate)
          });
        }
      } else {
        // Mock data para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData({
          ...MOCK_DATA,
          lastUpdate: new Date()
        });
      }
    } catch (_err) {
      console.error('Erro ao carregar KPIs:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      
      // Fallback para mock data em caso de erro
      setData({
        ...MOCK_DATA,
        lastUpdate: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  }, [useRealData]);

  // Auto-refresh a cada 60 segundos
  useEffect(() => {
    refresh(); // Carregar dados inicialmente
    
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [useRealData, refresh]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
};

