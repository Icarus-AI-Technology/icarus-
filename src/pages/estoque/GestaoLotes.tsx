/**
 * Gestão de Lotes - ICARUS v5.0
 * Rastreabilidade completa de lotes OPME (ANVISA RDC 16/2013)
 */

import { useState } from 'react';
import { ArrowLeft, Search, Package, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface Lote {
  id: string;
  numero_lote: string;
  produto_nome: string;
  fabricante: string;
  data_fabricacao: string;
  data_validade: string;
  quantidade: number;
  status: 'ativo' | 'vencido' | 'bloqueado' | 'recall';
}

const MOCK_LOTES: Lote[] = [
  {
    id: '1',
    numero_lote: 'LT2024001',
    produto_nome: 'Prótese de Joelho Titanium',
    fabricante: 'Abbott Medical',
    data_fabricacao: '2024-01-15',
    data_validade: '2027-01-15',
    quantidade: 25,
    status: 'ativo'
  }
];

export default function GestaoLotes() {
  useDocumentTitle('Gestão de Lotes');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [lotes] = useState<Lote[]>(MOCK_LOTES);

  const filteredLotes = lotes.filter(lote =>
    lote.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lote.produto_nome.toLowerCase().includes(searchTerm.toLowerCase())
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
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
              <Package className="w-6 h-6 text-orx-primary" />
            </div>
            <div>
              <h1 className="orx-text-3xl orx-font-bold text-orx-text-primary">
                Gestão de Lotes
              </h1>
              <p className="text-orx-text-secondary mt-1">
                Rastreabilidade completa ANVISA RDC 16/2013
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por lote ou produto..."
          />
        </div>

        <div className="space-y-4">
          {filteredLotes.map((lote) => (
            <div
              key={lote.id}
              className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="orx-text-lg orx-font-semibold text-orx-text-primary">
                      Lote: {lote.numero_lote}
                    </h3>
                    <span className={`
                      px-3 py-1 orx-text-xs orx-font-medium rounded-lg
                      ${lote.status === 'ativo' ? 'bg-orx-success/10 text-orx-success' : ''}
                      ${lote.status === 'vencido' ? 'bg-orx-danger/10 text-orx-danger' : ''}
                      ${lote.status === 'bloqueado' ? 'bg-orx-warning/10 text-orx-warning' : ''}
                    `}>
                      {lote.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-orx-text-secondary mb-4">{lote.produto_nome}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Fabricante</p>
                      <p className="orx-text-sm orx-font-medium text-orx-text-primary">
                        {lote.fabricante}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Validade
                      </p>
                      <p className="orx-text-sm orx-font-medium text-orx-text-primary">
                        {new Date(lote.data_validade).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Quantidade</p>
                      <p className="orx-text-sm orx-font-medium text-orx-text-primary">
                        {lote.quantidade} unidades
                      </p>
                    </div>
                  </div>
                </div>
                
                <NeumoButton variant="secondary" size="sm">
                  Detalhes
                </NeumoButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

