/**
 * Faturamento - ICARUS v5.0
 * Gestão de faturamento hospitalar e convênios
 */

import { useState } from 'react';
import { ArrowLeft, Search, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface Fatura {
  id: string;
  numero: string;
  cirurgia_id: string;
  convenio: string;
  valor: number;
  status: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'paga';
  data_emissao: string;
}

const MOCK_FATURAS: Fatura[] = [
  {
    id: '1',
    numero: 'FAT-2024-001',
    cirurgia_id: 'CIR-123',
    convenio: 'Amil',
    valor: 15000,
    status: 'aprovada',
    data_emissao: '2024-11-01'
  }
];

export default function GestaoFaturamento() {
  useDocumentTitle('Faturamento');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturas] = useState<Fatura[]>(MOCK_FATURAS);

  const filteredFaturas = faturas.filter(fat =>
    fat.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fat.convenio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <NeumoButton variant="secondary" leftIcon={ArrowLeft} onClick={() => navigate('/financeiro')} className="mb-4">
            Voltar
          </NeumoButton>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
                <FileText className="w-6 h-6 text-orx-primary" />
              </div>
              <div>
                <h1 className="orx-text-3xl orx-font-bold text-orx-text-primary">Faturamento</h1>
                <p className="text-orx-text-secondary mt-1">Gestão de faturamento hospitalar</p>
              </div>
            </div>
            <NeumoButton variant="primary" leftIcon={FileText}>Nova Fatura</NeumoButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Faturas', value: '156', icon: FileText, color: 'bg-orx-primary/10 text-orx-primary' },
            { label: 'Aprovadas', value: '98', icon: TrendingUp, color: 'bg-orx-success/10 text-orx-success' },
            { label: 'Pendentes', value: '45', icon: AlertCircle, color: 'bg-orx-warning/10 text-orx-warning' },
            { label: 'Faturamento Total', value: 'R$ 2.3M', icon: DollarSign, color: 'bg-orx-info/10 text-orx-info' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo">
              <div className="flex items-center justify-between">
                <div>
                  <p className="orx-text-xs text-orx-text-muted mb-1">{stat.label}</p>
                  <p className="orx-text-2xl orx-font-bold text-orx-text-primary">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar fatura ou convênio..." />
        </div>

        <div className="space-y-4">
          {filteredFaturas.map((fatura) => (
            <div key={fatura.id} className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="orx-text-lg orx-font-semibold text-orx-text-primary">{fatura.numero}</h3>
                    <span className={`px-3 py-1 orx-text-xs orx-font-medium rounded-lg ${
                      fatura.status === 'paga' ? 'bg-orx-success/10 text-orx-success' :
                      fatura.status === 'aprovada' ? 'bg-orx-info/10 text-orx-info' :
                      fatura.status === 'em_analise' ? 'bg-orx-warning/10 text-orx-warning' :
                      fatura.status === 'rejeitada' ? 'bg-orx-danger/10 text-orx-danger' :
                      'bg-orx-text-muted/10 text-orx-text-muted'
                    }`}>
                      {fatura.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Convênio</p>
                      <p className="orx-text-sm orx-font-medium text-orx-text-primary">{fatura.convenio}</p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Valor</p>
                      <p className="orx-text-sm orx-font-semibold text-orx-success">R$ {fatura.valor.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Emissão</p>
                      <p className="orx-text-sm orx-font-medium text-orx-text-primary">
                        {new Date(fatura.data_emissao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                <NeumoButton variant="secondary" size="sm">Detalhes</NeumoButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

