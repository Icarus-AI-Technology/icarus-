/**
 * Gestão de Propostas Comerciais - ICARUS v5.0
 * CRM - Pipeline de vendas e propostas
 */

import { useState } from 'react';
import { ArrowLeft, FileText, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface Proposta {
  id: string;
  numero: string;
  cliente: string;
  valor_total: number;
  status: 'rascunho' | 'enviada' | 'em_negociacao' | 'aprovada' | 'rejeitada';
  data_criacao: string;
  validade: string;
  vendedor: string;
}

const MOCK_PROPOSTAS: Proposta[] = [
  {
    id: '1',
    numero: 'PROP-2024-001',
    cliente: 'Hospital São Paulo',
    valor_total: 125000,
    status: 'em_negociacao',
    data_criacao: '2024-11-10',
    validade: '2024-12-10',
    vendedor: 'João Silva'
  }
];

export default function GestaoPropostas() {
  useDocumentTitle('Gestão de Propostas');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [propostas] = useState<Proposta[]>(MOCK_PROPOSTAS);

  const filteredPropostas = propostas.filter(prop =>
    prop.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <NeumoButton
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/vendas')}
            className="mb-4"
          >
            Voltar
          </NeumoButton>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
                <FileText className="w-6 h-6 text-orx-primary" />
              </div>
              <div>
                <h1 className="orx-text-3xl orx-orx-font-bold text-orx-text-primary">
                  Gestão de Propostas
                </h1>
                <p className="text-orx-text-secondary mt-1">
                  Pipeline de vendas e negociações
                </p>
              </div>
            </div>
            
            <NeumoButton variant="primary" leftIcon={FileText}>
              Nova Proposta
            </NeumoButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Propostas', value: '24', icon: FileText, color: 'bg-orx-primary/10 text-orx-primary' },
            { label: 'Em Negociação', value: '8', icon: TrendingUp, color: 'bg-orx-warning/10 text-orx-warning' },
            { label: 'Aprovadas', value: '12', icon: DollarSign, color: 'bg-orx-success/10 text-orx-success' },
            { label: 'Valor Total', value: 'R$ 1.2M', icon: DollarSign, color: 'bg-orx-info/10 text-orx-info' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo">
              <div className="flex items-center justify-between">
                <div>
                  <p className="orx-text-xs text-orx-text-muted mb-1">{stat.label}</p>
                  <p className="orx-text-2xl orx-orx-font-bold text-orx-text-primary">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar proposta ou cliente..."
          />
        </div>

        <div className="space-y-4">
          {filteredPropostas.map((prop) => (
            <div
              key={prop.id}
              className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo hover:shadow-neumo-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary">
                      {prop.numero}
                    </h3>
                    <span className={`
                      px-3 py-1 orx-text-xs orx-orx-font-medium rounded-lg
                      ${prop.status === 'aprovada' ? 'bg-orx-success/10 text-orx-success' : ''}
                      ${prop.status === 'em_negociacao' ? 'bg-orx-warning/10 text-orx-warning' : ''}
                      ${prop.status === 'enviada' ? 'bg-orx-info/10 text-orx-info' : ''}
                      ${prop.status === 'rejeitada' ? 'bg-orx-danger/10 text-orx-danger' : ''}
                      ${prop.status === 'rascunho' ? 'bg-orx-text-muted/10 text-orx-text-muted' : ''}
                    `}>
                      {prop.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-orx-text-secondary mb-4">{prop.cliente}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Valor Total
                      </p>
                      <p className="orx-text-sm orx-orx-font-semibold text-orx-success">
                        R$ {prop.valor_total.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Vendedor</p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary">
                        {prop.vendedor}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Validade
                      </p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary">
                        {new Date(prop.validade).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <NeumoButton variant="secondary" size="sm">
                    Ver Detalhes
                  </NeumoButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

