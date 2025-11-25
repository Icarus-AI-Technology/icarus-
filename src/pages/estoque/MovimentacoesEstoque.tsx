/**
 * Movimentações de Estoque
 * Página para visualizar histórico de movimentações
 */

import { useState } from 'react';
import { Card } from '@/components/oraclusx-ds/Card';
import { Badge } from '@/components/oraclusx-ds/Badge';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Calendar } from 'lucide-react';

interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida' | 'transferencia';
  produto: string;
  quantidade: number;
  data: string;
  usuario: string;
}

export default function MovimentacoesEstoque() {
  const [movimentacoes] = useState<Movimentacao[]>([
    {
      id: '1',
      tipo: 'entrada',
      produto: 'Parafuso Pedicular 5.5mm',
      quantidade: 50,
      data: '2025-11-19',
      usuario: 'Admin Sistema',
    },
    {
      id: '2',
      tipo: 'saida',
      produto: 'Placa Ortopédica Titanium',
      quantidade: 10,
      data: '2025-11-18',
      usuario: 'Dr. João Silva',
    },
    {
      id: '3',
      tipo: 'transferencia',
      produto: 'Kit Cirurgia Coluna',
      quantidade: 5,
      data: '2025-11-17',
      usuario: 'Maria Santos',
    },
  ]);

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowDownCircle size={20} className="text-green-600" />;
      case 'saida':
        return <ArrowUpCircle size={20} className="text-red-600" />;
      case 'transferencia':
        return <RefreshCw size={20} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'success';
      case 'saida':
        return 'error';
      case 'transferencia':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimentações de Estoque</h1>
          <p className="text-gray-600 mt-2">
            Histórico completo de entradas, saídas e transferências
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {movimentacoes.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getIconByTipo(mov.tipo)}
                <div>
                  <p className="font-semibold text-gray-900">{mov.produto}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar size={14} />
                    <span>{new Date(mov.data).toLocaleDateString()}</span>
                    <span className="text-gray-400">•</span>
                    <span>{mov.usuario}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-gray-900">{mov.quantidade} un</span>
                <Badge variant={getBadgeVariant(mov.tipo)}>
                  {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
