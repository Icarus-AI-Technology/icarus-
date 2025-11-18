/**
 * Inventário de Estoque - ICARUS v5.0
 * Contagem física e ajustes de inventário
 */

import { useState } from 'react';
import { ArrowLeft, Search, ClipboardList, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface InventarioItem {
  id: string;
  produto_nome: string;
  quantidade_sistema: number;
  quantidade_fisica?: number;
  diferenca?: number;
  status: 'pendente' | 'contado' | 'ajustado';
  data_contagem?: string;
}

const MOCK_INVENTARIO: InventarioItem[] = [
  {
    id: '1',
    produto_nome: 'Parafuso Pedicular 5.5mm x 50mm',
    quantidade_sistema: 150,
    quantidade_fisica: 148,
    diferenca: -2,
    status: 'contado',
    data_contagem: '2024-11-17'
  }
];

export default function GestaoInventario() {
  useDocumentTitle('Inventário de Estoque');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventario] = useState<InventarioItem[]>(MOCK_INVENTARIO);

  const filteredInventario = inventario.filter(item =>
    item.produto_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <NeumoButton
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/estoque')}
            className="mb-4"
          >
            Voltar
          </NeumoButton>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
                <ClipboardList className="w-6 h-6 text-orx-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-orx-text-primary">
                  Inventário de Estoque
                </h1>
                <p className="text-orx-text-secondary mt-1">
                  Contagem física e ajustes
                </p>
              </div>
            </div>
            
            <NeumoButton variant="primary" leftIcon={Package}>
              Novo Inventário
            </NeumoButton>
          </div>
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar produto..."
          />
        </div>

        <div className="space-y-4">
          {filteredInventario.map((item) => (
            <div
              key={item.id}
              className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-orx-text-primary">
                      {item.produto_nome}
                    </h3>
                    <span className={`
                      px-3 py-1 text-xs font-medium rounded-lg
                      ${item.status === 'ajustado' ? 'bg-orx-success/10 text-orx-success' : ''}
                      ${item.status === 'contado' ? 'bg-orx-info/10 text-orx-info' : ''}
                      ${item.status === 'pendente' ? 'bg-orx-warning/10 text-orx-warning' : ''}
                    `}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Qtd. Sistema</p>
                      <p className="text-lg font-bold text-orx-text-primary">
                        {item.quantidade_sistema}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Qtd. Física</p>
                      <p className="text-lg font-bold text-orx-text-primary">
                        {item.quantidade_fisica || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Diferença</p>
                      <p className={`text-lg font-bold ${
                        (item.diferenca || 0) < 0 ? 'text-orx-danger' :
                        (item.diferenca || 0) > 0 ? 'text-orx-warning' :
                        'text-orx-success'
                      }`}>
                        {item.diferenca !== undefined ? (item.diferenca > 0 ? `+${item.diferenca}` : item.diferenca) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <NeumoButton variant="secondary" size="sm">
                  Ajustar
                </NeumoButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

