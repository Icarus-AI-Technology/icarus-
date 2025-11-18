/**
 * Compliance ANVISA - ICARUS v5.0
 * Rastreabilidade OPME conforme RDC 16/2013
 */

import { useState } from 'react';
import { ArrowLeft, Shield, Package, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface ProdutoRastreavel {
  id: string;
  nome: string;
  lote: string;
  registro_anvisa: string;
  status_rastreabilidade: 'completa' | 'parcial' | 'pendente';
  fabricante: string;
  validade: string;
}

const MOCK_PRODUTOS: ProdutoRastreavel[] = [
  {
    id: '1',
    nome: 'Prótese de Joelho Titanium Pro',
    lote: 'LT2024001',
    registro_anvisa: '80149230001',
    status_rastreabilidade: 'completa',
    fabricante: 'Abbott Medical',
    validade: '2027-01-15'
  }
];

export default function ComplianceANVISA() {
  useDocumentTitle('Compliance ANVISA');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos] = useState<ProdutoRastreavel[]>(MOCK_PRODUTOS);

  const filteredProdutos = produtos.filter(prod =>
    prod.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.lote.includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <NeumoButton variant="secondary" leftIcon={ArrowLeft} onClick={() => navigate('/compliance')} className="mb-4">
            Voltar
          </NeumoButton>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
              <Shield className="w-6 h-6 text-orx-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orx-text-primary">Compliance ANVISA</h1>
              <p className="text-orx-text-secondary mt-1">Rastreabilidade OPME - RDC 16/2013</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Rastreabilidade Completa', value: '245', icon: Shield, color: 'bg-orx-success/10 text-orx-success' },
            { label: 'Rastreabilidade Parcial', value: '12', icon: AlertTriangle, color: 'bg-orx-warning/10 text-orx-warning' },
            { label: 'Pendentes', value: '3', icon: Package, color: 'bg-orx-danger/10 text-orx-danger' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orx-text-muted mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-orx-text-primary">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por produto ou lote..." />
        </div>

        <div className="space-y-4">
          {filteredProdutos.map((prod) => (
            <div key={prod.id} className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-orx-text-primary">{prod.nome}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      prod.status_rastreabilidade === 'completa' ? 'bg-orx-success/10 text-orx-success' :
                      prod.status_rastreabilidade === 'parcial' ? 'bg-orx-warning/10 text-orx-warning' :
                      'bg-orx-danger/10 text-orx-danger'
                    }`}>
                      {prod.status_rastreabilidade.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Lote</p>
                      <p className="text-sm font-medium text-orx-text-primary">{prod.lote}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Registro ANVISA</p>
                      <p className="text-sm font-medium text-orx-text-primary">{prod.registro_anvisa}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Fabricante</p>
                      <p className="text-sm font-medium text-orx-text-primary">{prod.fabricante}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Validade</p>
                      <p className="text-sm font-medium text-orx-text-primary">
                        {new Date(prod.validade).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <NeumoButton variant="secondary" size="sm" leftIcon={FileText}>
                  Rastreio Completo
                </NeumoButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

