/**
 * Gestão de Procedimentos Cirúrgicos - ICARUS v5.0
 * Catálogo completo de procedimentos com TUSS, valores e materiais
 */

import { useState } from 'react';
import { ArrowLeft, Search, Plus, FileText, DollarSign, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoInput, NeumoSearchBar } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface Procedimento {
  id: string;
  codigo_tuss?: string;
  nome: string;
  descricao?: string;
  especialidade: string;
  duracao_media_minutos?: number;
  valor_tabela?: number;
  materiais_necessarios?: string[];
  complexidade: 'baixa' | 'media' | 'alta' | 'muito_alta';
}

const MOCK_PROCEDIMENTOS: Procedimento[] = [
  {
    id: '1',
    codigo_tuss: '31601190',
    nome: 'Artroplastia Total de Joelho',
    especialidade: 'Ortopedia',
    duracao_media_minutos: 180,
    valor_tabela: 25000,
    complexidade: 'muito_alta'
  },
  {
    id: '2',
    codigo_tuss: '31511144',
    nome: 'Artroscopia de Joelho com Meniscectomia',
    especialidade: 'Ortopedia',
    duracao_media_minutos: 90,
    valor_tabela: 8500,
    complexidade: 'media'
  }
];

export default function GestaoProcedimentos() {
  useDocumentTitle('Gestão de Procedimentos Cirúrgicos');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [procedimentos] = useState<Procedimento[]>(MOCK_PROCEDIMENTOS);

  const filteredProcedimentos = procedimentos.filter(proc =>
    proc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proc.codigo_tuss?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-6 bg-orx-bg-app">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <NeumoButton
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/cirurgias')}
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
                <h1 className="text-3xl font-bold text-orx-text-primary">
                  Gestão de Procedimentos
                </h1>
                <p className="text-orx-text-secondary mt-1">
                  Catálogo TUSS e procedimentos cirúrgicos
                </p>
              </div>
            </div>
            
            <NeumoButton variant="primary" leftIcon={Plus}>
              Novo Procedimento
            </NeumoButton>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-orx-bg-surface rounded-xl p-4 shadow-neumo mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <NeumoSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nome ou código TUSS..."
              />
            </div>
            <NeumoButton variant="secondary" leftIcon={Search}>
              Filtros Avançados
            </NeumoButton>
          </div>
        </div>

        {/* Procedimentos List */}
        <div className="space-y-4">
          {filteredProcedimentos.map((proc) => (
            <div
              key={proc.id}
              className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo hover:shadow-neumo-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-orx-text-primary">
                      {proc.nome}
                    </h3>
                    {proc.codigo_tuss && (
                      <span className="px-3 py-1 bg-orx-primary/10 text-orx-primary text-xs font-medium rounded-lg">
                        TUSS: {proc.codigo_tuss}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Especialidade</p>
                      <p className="text-sm font-medium text-orx-text-primary">
                        {proc.especialidade}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Duração Média</p>
                      <p className="text-sm font-medium text-orx-text-primary">
                        {proc.duracao_media_minutos ? `${proc.duracao_media_minutos} min` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Valor Tabela
                      </p>
                      <p className="text-sm font-medium text-orx-success">
                        {proc.valor_tabela 
                          ? `R$ ${proc.valor_tabela.toLocaleString('pt-BR')}`
                          : 'Sob consulta'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-orx-text-muted mb-1">Complexidade</p>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${proc.complexidade === 'muito_alta' ? 'bg-orx-danger/10 text-orx-danger' : ''}
                        ${proc.complexidade === 'alta' ? 'bg-orx-warning/10 text-orx-warning' : ''}
                        ${proc.complexidade === 'media' ? 'bg-orx-info/10 text-orx-info' : ''}
                        ${proc.complexidade === 'baixa' ? 'bg-orx-success/10 text-orx-success' : ''}
                      `}>
                        {proc.complexidade.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <NeumoButton variant="secondary" size="sm" leftIcon={Package}>
                    Materiais
                  </NeumoButton>
                  <NeumoButton variant="secondary" size="sm">
                    Editar
                  </NeumoButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProcedimentos.length === 0 && (
          <div className="bg-orx-bg-surface rounded-xl p-12 shadow-neumo text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-orx-text-muted opacity-50" />
            <h3 className="text-xl font-semibold text-orx-text-primary mb-2">
              Nenhum procedimento encontrado
            </h3>
            <p className="text-orx-text-secondary">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

