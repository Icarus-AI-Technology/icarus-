/**
 * Gestão de Contratos - ICARUS v5.0
 * Contratos comerciais e jurídicos
 */

import { useState } from 'react';
import { ArrowLeft, FileSignature, Calendar, Building2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface Contrato {
  id: string;
  numero: string;
  tipo: 'fornecimento' | 'consignacao' | 'prestacao_servicos' | 'parceria';
  cliente: string;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  status: 'ativo' | 'expirado' | 'suspenso' | 'cancelado';
  renovacao_automatica: boolean;
}

const MOCK_CONTRATOS: Contrato[] = [
  {
    id: '1',
    numero: 'CONT-2024-001',
    tipo: 'fornecimento',
    cliente: 'Hospital Sírio-Libanês',
    valor_total: 500000,
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31',
    status: 'ativo',
    renovacao_automatica: true
  }
];

export default function GestaoContratos() {
  useDocumentTitle('Gestão de Contratos');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [contratos] = useState<Contrato[]>(MOCK_CONTRATOS);

  const filteredContratos = contratos.filter(cont =>
    cont.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cont.cliente.toLowerCase().includes(searchTerm.toLowerCase())
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
                <FileSignature className="w-6 h-6 text-orx-primary" />
              </div>
              <div>
                <h1 className="orx-text-3xl orx-orx-font-bold text-orx-text-primary">
                  Gestão de Contratos
                </h1>
                <p className="text-orx-text-secondary mt-1">
                  Contratos comerciais e jurídicos
                </p>
              </div>
            </div>
            
            <NeumoButton variant="primary" leftIcon={FileSignature}>
              Novo Contrato
            </NeumoButton>
          </div>
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar contrato ou cliente..."
          />
        </div>

        <div className="space-y-4">
          {filteredContratos.map((contrato) => (
            <div
              key={contrato.id}
              className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo hover:shadow-neumo-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary">
                      {contrato.numero}
                    </h3>
                    <span className={`
                      px-3 py-1 orx-text-xs orx-orx-font-medium rounded-lg
                      ${contrato.status === 'ativo' ? 'bg-orx-success/10 text-orx-success' : ''}
                      ${contrato.status === 'expirado' ? 'bg-orx-danger/10 text-orx-danger' : ''}
                      ${contrato.status === 'suspenso' ? 'bg-orx-warning/10 text-orx-warning' : ''}
                      ${contrato.status === 'cancelado' ? 'bg-orx-text-muted/10 text-orx-text-muted' : ''}
                    `}>
                      {contrato.status.toUpperCase()}
                    </span>
                    {contrato.renovacao_automatica && (
                      <span className="px-3 py-1 bg-orx-info/10 text-orx-info orx-text-xs orx-orx-font-medium rounded-lg flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Renovação Automática
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-orx-text-secondary" />
                    <p className="text-orx-text-secondary">{contrato.cliente}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Tipo</p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary capitalize">
                        {contrato.tipo.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Valor Total</p>
                      <p className="orx-text-sm orx-orx-font-semibold text-orx-success">
                        R$ {contrato.valor_total.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Início
                      </p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary">
                        {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Término
                      </p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary">
                        {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
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

