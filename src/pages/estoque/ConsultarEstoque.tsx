/**
 * Consultar Estoque
 * Página para consulta detalhada de itens em estoque
 */

import { useMemo, useState } from 'react';
import { Card } from '@/components/oraclusx-ds/Card';
import { Button } from '@/components/oraclusx-ds/Button';
import { Input } from '@/components/oraclusx-ds/Input';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { Search, Package, MapPin, Calendar } from 'lucide-react';
import { useEstoque } from '@/hooks/useEstoque';

// Interface estendida para incluir campos de produto relacionados
interface EstoqueItem {
  id: string;
  produto_id: string;
  empresa_id: string;
  armazem_id: string | null;
  localizacao_id: string | null;
  quantidade_disponivel: number | null;
  quantidade_reservada: number | null;
  status: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  excluido_em: string | null;
  // Campos do produto (via join ou computed)
  nome?: string;
  codigo?: string;
  lote?: string;
  localizacao?: string;
  validade?: string;
}

export default function ConsultarEstoque() {
  const [searchTerm, setSearchTerm] = useState('');
  const { estoques, loading } = useEstoque();

  const resultados = useMemo(() => {
    if (!estoques) return [];
    const query = searchTerm.toLowerCase();

    return (estoques as EstoqueItem[]).filter((item) => {
      const nomeMatch = item.nome?.toLowerCase().includes(query);
      const codigoMatch = item.codigo?.toLowerCase().includes(query);
      const loteMatch = item.lote?.toLowerCase().includes(query);
      return nomeMatch || codigoMatch || loteMatch;
    });
  }, [estoques, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultar Estoque</h1>
          <p className="text-gray-600 mt-2">Busque e visualize itens do estoque em tempo real</p>
        </div>
      </div>

      {/* Barra de Busca */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por código, nome ou lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <Button variant="primary">
            <Search size={20} className="mr-2" />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Lista de Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Carregando estoque...</p>
          </div>
        ) : resultados.length > 0 ? (
          resultados.map((item) => (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-indigo-600" />
                  <span className="font-semibold text-gray-900">{item.nome || 'Sem nome'}</span>
                </div>
                <Badge
                  variant={
                    item.quantidade_disponivel && item.quantidade_disponivel > 10
                      ? 'success'
                      : 'warning'
                  }
                >
                  {item.quantidade_disponivel || 0} un
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Local: {item.localizacao || 'Não definido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    Validade: {item.validade ? new Date(item.validade).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum item encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
