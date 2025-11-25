import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type FinancialRecord = Database['public']['Views']['financial_records']['Row'];

interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  recentTransactions: FinancialRecord[];
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch financial records (view over transacoes)
      const { data: transactions, error: fetchError } = await supabase
        .from('financial_records')
        .select('*')
        .order('data_vencimento', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      const records = transactions || [];

      // Calculate metrics
      const totalRevenue = records
        .filter((t) => t.tipo === 'receita')
        .reduce((sum, t) => sum + (t.valor || 0), 0);

      const totalExpenses = records
        .filter((t) => t.tipo === 'despesa')
        .reduce((sum, t) => sum + (t.valor || 0), 0);

      const netProfit = totalRevenue - totalExpenses;

      setMetrics({
        totalRevenue,
        totalExpenses,
        netProfit,
        transactionCount: records.length,
        recentTransactions: records.slice(0, 10),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar métricas';
      setError(errorMessage);
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('financial-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transacoes',
        },
        () => {
          // Refetch when changes occur
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

