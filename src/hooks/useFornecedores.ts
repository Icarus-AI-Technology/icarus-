import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types.generated';

type FornecedorRow = Database['public']['Tables']['fornecedores']['Row'];
type FornecedorInsert = Database['public']['Tables']['fornecedores']['Insert'];
type FornecedorUpdate = Database['public']['Tables']['fornecedores']['Update'];
type FornecedorOrigem = Database['public']['Enums']['fornecedor_origem_enum'];
type FornecedorSegmento = Database['public']['Enums']['fornecedor_segmento_enum'];

export interface EnderecoFornecedor {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
}

export interface Fornecedor {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: EnderecoFornecedor | null;
  tipo: FornecedorOrigem;
  segmento?: FornecedorSegmento;
  categoria: string;
  ativo: boolean;
  observacoes?: string;
  condicoes_pagamento?: string;
  prazo_pagamento?: number;
  prazo_entrega_medio?: number;
  pedido_minimo?: number;
  aceita_consignacao?: boolean;
  faz_entrega?: boolean;
  raio_entrega?: number;
  avaliacao_qualidade?: number;
  avaliacao_pontualidade?: number;
  avaliacao_preco?: number;
  avaliacao_atendimento?: number;
  site?: string;
  volume_compras?: number | null;
  created_at?: string;
  updated_at?: string;
}

const isJsonRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const normalizeEndereco = (value: FornecedorRow['endereco']): EnderecoFornecedor | null => {
  if (!isJsonRecord(value)) return null;
  const endereco: EnderecoFornecedor = {
    rua: typeof value.rua === 'string' ? value.rua : undefined,
    numero: typeof value.numero === 'string' ? value.numero : undefined,
    complemento: typeof value.complemento === 'string' ? value.complemento : undefined,
    bairro: typeof value.bairro === 'string' ? value.bairro : undefined,
    cidade: typeof value.cidade === 'string' ? value.cidade : undefined,
    estado: typeof value.estado === 'string' ? value.estado : undefined,
    cep: typeof value.cep === 'string' ? value.cep : undefined,
    pais: typeof value.pais === 'string' ? value.pais : undefined,
  };
  return Object.values(endereco).some(Boolean) ? endereco : null;
};

const serializeEndereco = (endereco?: EnderecoFornecedor | null): FornecedorRow['endereco'] => {
  if (!endereco) return {};
  const payload: Record<string, string | null> = {};
  Object.entries(endereco).forEach(([key, value]) => {
    payload[key] = value ?? null;
  });
  return payload;
};

const normalizeFornecedor = (row: FornecedorRow): Fornecedor => ({
  id: row.id,
  empresa_id: row.empresa_id,
  razao_social: row.razao_social,
  nome_fantasia: row.nome_fantasia || undefined,
  cnpj: row.cnpj ?? '',
  email: row.email,
  telefone: row.telefone || undefined,
  whatsapp: row.whatsapp || undefined,
  endereco: normalizeEndereco(row.endereco),
  tipo: row.tipo,
  segmento: row.segmento,
  categoria: row.categoria,
  ativo: row.ativo,
  observacoes: row.observacoes || undefined,
  condicoes_pagamento: row.condicoes_pagamento || undefined,
  prazo_pagamento: row.prazo_pagamento,
  prazo_entrega_medio: row.prazo_entrega_medio,
  pedido_minimo: Number(row.pedido_minimo ?? 0),
  aceita_consignacao: row.aceita_consignacao,
  faz_entrega: row.faz_entrega,
  raio_entrega: row.raio_entrega,
  avaliacao_qualidade: row.avaliacao_qualidade,
  avaliacao_pontualidade: row.avaliacao_pontualidade,
  avaliacao_preco: row.avaliacao_preco,
  avaliacao_atendimento: row.avaliacao_atendimento,
  site: row.site || undefined,
  volume_compras: row.volume_compras,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const buildFornecedorInsert = (
  fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>
): FornecedorInsert => ({
  empresa_id: fornecedor.empresa_id,
  razao_social: fornecedor.razao_social,
  nome_fantasia: fornecedor.nome_fantasia ?? fornecedor.razao_social,
  nome: fornecedor.razao_social,
  cnpj: fornecedor.cnpj,
  email: fornecedor.email,
  telefone: fornecedor.telefone ?? '',
  whatsapp: fornecedor.whatsapp ?? fornecedor.telefone ?? '',
  tipo: fornecedor.tipo,
  segmento: fornecedor.segmento ?? 'distribuidor',
  categoria: fornecedor.categoria,
  ativo: fornecedor.ativo,
  observacoes: fornecedor.observacoes ?? '',
  condicoes_pagamento: fornecedor.condicoes_pagamento ?? '',
  prazo_pagamento: fornecedor.prazo_pagamento ?? 30,
  prazo_entrega_medio: fornecedor.prazo_entrega_medio ?? 7,
  pedido_minimo: fornecedor.pedido_minimo ?? 0,
  aceita_consignacao: fornecedor.aceita_consignacao ?? false,
  faz_entrega: fornecedor.faz_entrega ?? true,
  raio_entrega: fornecedor.raio_entrega ?? 0,
  avaliacao_qualidade: fornecedor.avaliacao_qualidade ?? 0,
  avaliacao_pontualidade: fornecedor.avaliacao_pontualidade ?? 0,
  avaliacao_preco: fornecedor.avaliacao_preco ?? 0,
  avaliacao_atendimento: fornecedor.avaliacao_atendimento ?? 0,
  site: fornecedor.site ?? '',
  endereco: serializeEndereco(fornecedor.endereco),
});

const buildFornecedorUpdate = (updates: Partial<Fornecedor>): FornecedorUpdate => {
  const payload: FornecedorUpdate = {};
  const assign = <K extends keyof FornecedorUpdate>(
    key: K,
    value: FornecedorUpdate[K] | undefined
  ) => {
    if (value !== undefined) payload[key] = value;
  };

  assign('razao_social', updates.razao_social);
  assign('nome_fantasia', updates.nome_fantasia);
  assign('nome', updates.razao_social ?? updates.nome_fantasia);
  assign('cnpj', updates.cnpj);
  assign('email', updates.email);
  assign('telefone', updates.telefone);
  assign('whatsapp', updates.whatsapp);
  assign('tipo', updates.tipo);
  assign('segmento', updates.segmento);
  assign('categoria', updates.categoria);
  assign('ativo', updates.ativo);
  assign('observacoes', updates.observacoes);
  assign('condicoes_pagamento', updates.condicoes_pagamento);
  assign('prazo_pagamento', updates.prazo_pagamento);
  assign('prazo_entrega_medio', updates.prazo_entrega_medio);
  assign('pedido_minimo', updates.pedido_minimo);
  assign('aceita_consignacao', updates.aceita_consignacao);
  assign('faz_entrega', updates.faz_entrega);
  assign('raio_entrega', updates.raio_entrega);
  assign('avaliacao_qualidade', updates.avaliacao_qualidade);
  assign('avaliacao_pontualidade', updates.avaliacao_pontualidade);
  assign('avaliacao_preco', updates.avaliacao_preco);
  assign('avaliacao_atendimento', updates.avaliacao_atendimento);
  assign('site', updates.site);
  assign('empresa_id', updates.empresa_id);

  if (updates.endereco !== undefined) {
    payload.endereco = serializeEndereco(updates.endereco);
  }

  return payload;
};

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFornecedores = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('fornecedores')
        .select('*')
        .order('razao_social');

      if (fetchError) throw fetchError;

      const rows = (data as FornecedorRow[] | null) ?? [];
      setFornecedores(rows.map(normalizeFornecedor));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar fornecedores';
      setError(message);
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const criarFornecedor = useCallback(
    async (fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const payload = buildFornecedorInsert(fornecedor);
        const { data, error: insertError } = await supabase
          .from('fornecedores')
          .insert(payload)
          .select()
          .single();

        if (insertError) throw insertError;

        const normalized = normalizeFornecedor(data as FornecedorRow);
        setFornecedores((prev) => [normalized, ...prev]);
        return normalized;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar fornecedor';
        setError(message);
        throw err;
      }
    },
    []
  );

  const atualizarFornecedor = useCallback(async (id: string, updates: Partial<Fornecedor>) => {
    try {
      const payload = buildFornecedorUpdate(updates);
      const { data, error: updateError } = await supabase
        .from('fornecedores')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      const normalized = normalizeFornecedor(data as FornecedorRow);
      setFornecedores((prev) => prev.map((item) => (item.id === id ? normalized : item)));
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar fornecedor';
      setError(message);
      throw err;
    }
  }, []);

  const deletarFornecedor = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('fornecedores').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setFornecedores((prev) => prev.filter((fornecedor) => fornecedor.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar fornecedor';
      setError(message);
      throw err;
    }
  }, []);

  return {
    fornecedores,
    loading,
    error,
    fetchFornecedores,
    criarFornecedor,
    atualizarFornecedor,
    deletarFornecedor,
  };
};
