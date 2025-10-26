/**
 * useConsignacao - Hook para gestão de materiais em consignação
 * Sistema: ICARUS v5.0
 * 
 * Funcionalidades:
 * - CRUD completo de materiais consignados
 * - Sistema de filtros avançados
 * - Cálculo de métricas e KPIs
 * - Gestão de movimentações
 * - Faturamento automático
 * - Alertas de conferência semanal
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// INTERFACES
// ============================================

export interface MaterialConsignado {
  id: string;
  codigo_interno: string;
  
  // Produto
  produto_id?: string | null;
  nome: string;
  fabricante?: string | null;
  fornecedor?: string | null;
  
  // Categoria
  categoria: 'implantes' | 'instrumentais' | 'descartaveis' | 'equipamentos' | 'outros';
  
  // Lote e Validade
  lote?: string | null;
  serie?: string | null;
  validade?: string | null;
  data_recebimento: string;
  
  // Quantidade e Valores
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  
  // Status
  status: 'disponivel' | 'reservado' | 'utilizado' | 'devolvido' | 'vencido' | 'danificado';
  
  // Hospital
  contrato_id?: string | null;
  hospital_id?: string | null;
  hospital_nome: string;
  
  // Análise Financeira
  custo_carregamento?: number | null;
  dias_estoque?: number | null;
  rotatividade?: 'alta' | 'media' | 'baixa' | null;
  
  // Última Movimentação
  ultima_movimentacao_data?: string | null;
  ultima_movimentacao_tipo?: string | null;
  ultima_movimentacao_responsavel?: string | null;
  
  // Observações
  observacoes?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ContratoConsignacao {
  id: string;
  numero_contrato: string;
  hospital_id?: string | null;
  hospital_nome: string;
  hospital_cnpj: string;
  hospital_endereco?: string | null;
  responsavel_hospital?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  prazo_vencimento?: string | null;
  percentual_comissao: number;
  condicoes_pagamento?: string | null;
  valor_minimo_faturamento?: number | null;
  status: 'ativo' | 'suspenso' | 'cancelado' | 'vencido';
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoConsignacao {
  id?: string;
  material_consignado_id: string;
  tipo: 'entrada' | 'saida' | 'utilizacao' | 'devolucao' | 'transferencia' | 'ajuste';
  quantidade: number;
  data_movimentacao: string;
  hospital_origem_id?: string | null;
  hospital_destino_id?: string | null;
  cirurgia_id?: string | null;
  responsavel: string;
  usuario_id?: string | null;
  documento_tipo?: string | null;
  documento_numero?: string | null;
  motivo?: string | null;
  observacoes?: string | null;
}

export interface FaturamentoConsignacao {
  id: string;
  numero_fatura: string;
  periodo: string;
  hospital_id?: string | null;
  hospital_nome: string;
  valor_bruto: number;
  desconto: number;
  impostos: number;
  valor_liquido: number;
  status: 'pendente' | 'faturado' | 'pago' | 'vencido' | 'cancelado';
  data_emissao?: string | null;
  data_vencimento: string;
  data_pagamento?: string | null;
  numero_nf?: string | null;
  chave_nf?: string | null;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertaConsignacao {
  id: string;
  tipo: 'conferencia_semanal' | 'material_vencendo' | 'material_parado' | 'faturamento_pendente' | 'contrato_vencendo';
  contrato_id?: string | null;
  material_id?: string | null;
  hospital_id?: string | null;
  titulo: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'ativo' | 'lido' | 'resolvido' | 'ignorado';
  destinatario_nome?: string | null;
  destinatario_email?: string | null;
  destinatario_cargo?: string | null;
  data_geracao: string;
  data_leitura?: string | null;
  data_resolucao?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetricasConsignacao {
  totalMateriais: number;
  valorTotalConsignado: number;
  materiaisDisponiveis: number;
  materiaisUtilizados: number;
  materiaisDevolvidos: number;
  materiaisReservados: number;
  taxaUtilizacao: number;
  valorUtilizado: number;
  valorDevolvido: number;
  valorDisponivel: number;
  diasMedioEstoque: number;
  custoCarregamentoTotal: number;
  faturamentoPendente: number;
  hospitaisAtivos: number;
}

interface FiltrosConsignacao {
  searchTerm?: string;
  status?: string;
  hospital?: string;
  categoria?: string;
  rotatividade?: string;
}

// ============================================
// HOOK
// ============================================

export const useConsignacao = () => {
  const [materiais, setMateriais] = useState<MaterialConsignado[]>([]);
  const [contratos, setContratos] = useState<ContratoConsignacao[]>([]);
  const [faturamentos, setFaturamentos] = useState<FaturamentoConsignacao[]>([]);
  const [alertas, setAlertas] = useState<AlertaConsignacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosConsignacao>({
    searchTerm: '',
    status: 'todos',
    hospital: 'todos'
  });

  // ============================================
  // FETCH MATERIAIS
  // ============================================

  const fetchMateriais = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('materiais_consignados')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }
      
      if (filtros.hospital && filtros.hospital !== 'todos') {
        query = query.eq('hospital_nome', filtros.hospital);
      }
      
      if (filtros.categoria && filtros.categoria !== 'todos') {
        query = query.eq('categoria', filtros.categoria);
      }
      
      if (filtros.rotatividade && filtros.rotatividade !== 'todos') {
        query = query.eq('rotatividade', filtros.rotatividade);
      }

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      let materiaisFiltrados = data || [];
      
      // Filtro de busca (client-side para busca em múltiplos campos)
      if (filtros.searchTerm && filtros.searchTerm.trim() !== '') {
        const searchLower = filtros.searchTerm.toLowerCase();
        materiaisFiltrados = materiaisFiltrados.filter(m =>
          m.nome.toLowerCase().includes(searchLower) ||
          m.codigo_interno.toLowerCase().includes(searchLower) ||
          (m.lote && m.lote.toLowerCase().includes(searchLower)) ||
          (m.fabricante && m.fabricante.toLowerCase().includes(searchLower)) ||
          m.hospital_nome.toLowerCase().includes(searchLower)
        );
      }
      
      setMateriais(materiaisFiltrados);
    } catch (error) {
   const err = error as Error;
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar materiais';
      setError(errorMsg);
      console.error('Erro ao carregar materiais:', err.message ?? err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // ============================================
  // FETCH CONTRATOS
  // ============================================

  const fetchContratos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contratos_consignacao')
        .select('*')
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao carregar contratos:', err);
    }
  }, []);

  // ============================================
  // FETCH FATURAMENTOS
  // ============================================

  const fetchFaturamentos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('faturamento_consignacao')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFaturamentos(data || []);
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao carregar faturamentos:', err);
    }
  }, []);

  // ============================================
  // FETCH ALERTAS
  // ============================================

  const fetchAlertas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('alertas_consignacao')
        .select('*')
        .eq('status', 'ativo')
        .order('data_geracao', { ascending: false });
      
      if (error) throw error;
      setAlertas(data || []);
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao carregar alertas:', err);
    }
  }, []);

  // ============================================
  // CALCULAR MÉTRICAS
  // ============================================

  const calcularMetricas = useCallback((): MetricasConsignacao => {
    const totalMateriais = materiais.length;
    const valorTotalConsignado = materiais.reduce((sum, m) => sum + (m.valor_total || 0), 0);
    
    const materiaisDisponiveis = materiais.filter(m => m.status === 'disponivel').length;
    const materiaisUtilizados = materiais.filter(m => m.status === 'utilizado').length;
    const materiaisDevolvidos = materiais.filter(m => m.status === 'devolvido').length;
    const materiaisReservados = materiais.filter(m => m.status === 'reservado').length;
    
    const taxaUtilizacao = totalMateriais > 0 
      ? (materiaisUtilizados / totalMateriais) * 100 
      : 0;
    
    const valorUtilizado = materiais
      .filter(m => m.status === 'utilizado')
      .reduce((sum, m) => sum + (m.valor_total || 0), 0);
    
    const valorDevolvido = materiais
      .filter(m => m.status === 'devolvido')
      .reduce((sum, m) => sum + (m.valor_total || 0), 0);
    
    const valorDisponivel = materiais
      .filter(m => m.status === 'disponivel')
      .reduce((sum, m) => sum + (m.valor_total || 0), 0);
    
    const diasMedioEstoque = totalMateriais > 0
      ? materiais.reduce((sum, m) => sum + (m.dias_estoque || 0), 0) / totalMateriais
      : 0;
    
    const custoCarregamentoTotal = materiais.reduce((sum, m) => sum + (m.custo_carregamento || 0), 0);
    
    const faturamentoPendente = faturamentos
      .filter(f => f.status === 'pendente')
      .reduce((sum, f) => sum + (f.valor_liquido || 0), 0);
    
    const hospitaisAtivos = new Set(materiais.map(m => m.hospital_nome)).size;
    
    return {
      totalMateriais,
      valorTotalConsignado,
      materiaisDisponiveis,
      materiaisUtilizados,
      materiaisDevolvidos,
      materiaisReservados,
      taxaUtilizacao,
      valorUtilizado,
      valorDevolvido,
      valorDisponivel,
      diasMedioEstoque: Math.round(diasMedioEstoque),
      custoCarregamentoTotal,
      faturamentoPendente,
      hospitaisAtivos
    };
  }, [materiais, faturamentos]);

  // ============================================
  // CRUD MATERIAIS
  // ============================================

  const addMaterial = useCallback(async (material: Omit<MaterialConsignado, 'id' | 'created_at' | 'updated_at' | 'valor_total'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materiais_consignados')
        .insert([material])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Material adicionado à consignação');
      
      await fetchMateriais();
      return data;
    } catch (error) {
   const err = error as Error;
      const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar material';
      console.error('Erro ao adicionar material:', err.message ?? err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMateriais]);

  const updateMaterial = useCallback(async (id: string, updates: Partial<MaterialConsignado>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materiais_consignados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Material atualizado');
      
      await fetchMateriais();
      return data;
    } catch (error) {
   const err = error as Error;
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar material';
      console.error('Erro ao atualizar material:', err.message ?? err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMateriais]);

  const deleteMaterial = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('materiais_consignados')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Material removido');
      
      await fetchMateriais();
    } catch (error) {
   const err = error as Error;
      const errorMsg = err instanceof Error ? err.message : 'Erro ao remover material';
      console.error('Erro ao remover material:', err.message ?? err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMateriais]);

  // ============================================
  // MOVIMENTAÇÕES
  // ============================================

  const registrarMovimentacao = useCallback(async (movimentacao: MovimentacaoConsignacao) => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes_consignacao')
        .insert([movimentacao])
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar status do material
      if (movimentacao.tipo === 'utilizacao') {
        await updateMaterial(movimentacao.material_consignado_id, { status: 'utilizado' });
      } else if (movimentacao.tipo === 'devolucao') {
        await updateMaterial(movimentacao.material_consignado_id, { status: 'devolvido' });
      }
      
      console.log(`Movimentação registrada: ${movimentacao.tipo}`);
      
      return data;
    } catch (error) {
   const err = error as Error;
      const errorMsg = err instanceof Error ? err.message : 'Erro ao registrar movimentação';
      console.error('Erro ao registrar movimentação:', err.message ?? err);
      throw err;
    }
  }, [updateMaterial]);

  // ============================================
  // ATUALIZAR MÉTRICAS
  // ============================================

  const atualizarMetricasConsignacao = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('atualizar_metricas_consignacao');
      if (error) throw error;
      
      await fetchMateriais();
      
      console.log('Métricas atualizadas');
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao atualizar métricas:', err);
    }
  }, [fetchMateriais]);

  // ============================================
  // GERAR ALERTAS
  // ============================================

  const gerarAlertasConferencia = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('gerar_alertas_conferencia_semanal');
      if (error) throw error;
      
      await fetchAlertas();
      
      console.log('Alertas de conferência gerados');
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao gerar alertas:', err);
    }
  }, [fetchAlertas]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchMateriais();
  }, [fetchMateriais]);

  useEffect(() => {
    fetchContratos();
    fetchFaturamentos();
    fetchAlertas();
  }, [fetchContratos, fetchFaturamentos, fetchAlertas]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    materiais,
    contratos,
    faturamentos,
    alertas,
    loading,
    error,
    
    // Filtros
    filtros,
    setFiltros,
    
    // Métricas
    metricas: calcularMetricas(),
    
    // CRUD
    addMaterial,
    updateMaterial,
    deleteMaterial,
    
    // Movimentações
    registrarMovimentacao,
    
    // Utilitários
    atualizarMetricasConsignacao,
    gerarAlertasConferencia,
    refresh: fetchMateriais
  };
};

