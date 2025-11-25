/**
 * Gestão de NF-e - ICARUS v5.0
 * Emissão e acompanhamento de Notas Fiscais Eletrônicas
 */

import { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface NFe {
  id: string;
  numero: string;
  chave_acesso: string;
  cliente: string;
  valor_total: number;
  status: 'emitida' | 'autorizada' | 'cancelada' | 'denegada' | 'processando';
  data_emissao: string;
}

const MOCK_NFES: NFe[] = [
  {
    id: '1',
    numero: '123456',
    chave_acesso: '35241012345678901234567890123456789012345678',
    cliente: 'Hospital São Paulo',
    valor_total: 25000,
    status: 'autorizada',
    data_emissao: '2024-11-15',
  },
];

export default function GestaoNFe() {
  useDocumentTitle('Gestão de NF-e');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [nfes] = useState<NFe[]>(MOCK_NFES);

  const filteredNFes = nfes.filter(
    (nfe) =>
      nfe.numero.includes(searchTerm) ||
      nfe.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/financeiro')}
            className="mb-4"
          >
            Voltar
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orx-bg-surface shadow-neumo-sm">
                <FileText className="w-6 h-6 text-orx-primary" />
              </div>
              <div>
                <h1 className="orx-text-3xl orx-orx-font-bold text-orx-text-primary">
                  Gestão de NF-e
                </h1>
                <p className="text-orx-text-secondary mt-1">Notas Fiscais Eletrônicas</p>
              </div>
            </div>
            <Button variant="primary" leftIcon={FileText}>
              Emitir NF-e
            </Button>
          </div>
        </div>

        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <NeumoSearchBar
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Buscar por número ou cliente..."
          />
        </div>

        <div className="space-y-4">
          {filteredNFes.map((nfe) => (
            <div key={nfe.id} className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="orx-text-lg orx-orx-font-semibold text-orx-text-primary">
                      NF-e: {nfe.numero}
                    </h3>
                    <span
                      className={`px-3 py-1 orx-text-xs orx-orx-font-medium rounded-lg flex items-center gap-1 ${
                        nfe.status === 'autorizada'
                          ? 'bg-orx-success/10 text-orx-success'
                          : nfe.status === 'emitida'
                            ? 'bg-orx-info/10 text-orx-info'
                            : nfe.status === 'processando'
                              ? 'bg-orx-warning/10 text-orx-warning'
                              : 'bg-orx-danger/10 text-orx-danger'
                      }`}
                    >
                      {nfe.status === 'autorizada' && <CheckCircle className="w-3 h-3" />}
                      {nfe.status === 'cancelada' && <XCircle className="w-3 h-3" />}
                      {nfe.status === 'processando' && <Clock className="w-3 h-3" />}
                      {nfe.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="orx-text-xs text-orx-text-muted mb-2">Chave: {nfe.chave_acesso}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Cliente</p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary">
                        {nfe.cliente}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Valor Total</p>
                      <p className="orx-text-sm orx-orx-font-semibold text-orx-success">
                        R$ {nfe.valor_total.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Emissão</p>
                      <p className="orx-text-sm orx-orx-font-medium text-orx-text-primary">
                        {new Date(nfe.data_emissao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    Download
                  </Button>
                  <Button variant="secondary" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
