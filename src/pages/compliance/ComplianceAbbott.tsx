/**
 * Compliance Abbott - ICARUS v5.0
 * Monitoramento de conformidade Abbott (Score: 98.2%)
 */

import { useState } from 'react';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton } from '@/components/oraclusx-ds';
import { useDocumentTitle } from '@/hooks';

interface RequisitoAbbott {
  codigo: string;
  descricao: string;
  score: number;
  status: 'conforme' | 'atencao' | 'nao_conforme';
  ultima_auditoria: string;
}

const REQUISITOS_ABBOTT: RequisitoAbbott[] = [
  { codigo: 'REQ-001', descricao: 'Rastreabilidade Completa', score: 100, status: 'conforme', ultima_auditoria: '2024-11-15' },
  { codigo: 'REQ-002', descricao: 'Documentação Técnica', score: 95, status: 'conforme', ultima_auditoria: '2024-11-15' },
  { codigo: 'REQ-003', descricao: 'Controle de Validade', score: 100, status: 'conforme', ultima_auditoria: '2024-11-15' },
  { codigo: 'REQ-004', descricao: 'Registro ANVISA', score: 100, status: 'conforme', ultima_auditoria: '2024-11-15' },
  { codigo: 'REQ-005', descricao: 'Auditoria e Logs', score: 100, status: 'conforme', ultima_auditoria: '2024-11-15' },
  { codigo: 'REQ-006', descricao: 'Controle de Temperatura', score: 90, status: 'atencao', ultima_auditoria: '2024-11-15' },
  { codigo: 'REQ-007', descricao: 'Notificação Incidentes', score: 98, status: 'conforme', ultima_auditoria: '2024-11-15' }
];

export default function ComplianceAbbott() {
  useDocumentTitle('Compliance Abbott');
  const navigate = useNavigate();
  const [requisitos] = useState<RequisitoAbbott[]>(REQUISITOS_ABBOTT);
  
  const scoreGlobal = (requisitos.reduce((acc, req) => acc + req.score, 0) / requisitos.length).toFixed(1);

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
              <h1 className="orx-text-3xl orx-font-bold text-orx-text-primary">Compliance Abbott</h1>
              <p className="text-orx-text-secondary mt-1">Monitoramento de conformidade e auditoria</p>
            </div>
          </div>
        </div>

        {/* Score Global */}
        <div className="bg-orx-bg-surface rounded-xl p-8 shadow-neumo mb-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-orx-success" />
            <div>
              <h2 className="text-6xl orx-font-bold text-orx-success">{scoreGlobal}%</h2>
              <p className="text-orx-text-secondary orx-text-lg mt-2">Score Global de Conformidade</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 orx-text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orx-success" />
              <span className="text-orx-text-primary">6 Conformes</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orx-warning" />
              <span className="text-orx-text-primary">1 Atenção</span>
            </div>
          </div>
        </div>

        {/* Requisitos */}
        <div className="space-y-4">
          {requisitos.map((req) => (
            <div key={req.codigo} className="bg-orx-bg-surface rounded-xl p-6 shadow-neumo">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-orx-primary/10 text-orx-primary orx-text-xs orx-font-medium rounded-lg">
                      {req.codigo}
                    </span>
                    <h3 className="orx-text-lg orx-font-semibold text-orx-text-primary">{req.descricao}</h3>
                    <span className={`px-3 py-1 orx-text-xs orx-font-medium rounded-lg flex items-center gap-1 ${
                      req.status === 'conforme' ? 'bg-orx-success/10 text-orx-success' :
                      req.status === 'atencao' ? 'bg-orx-warning/10 text-orx-warning' :
                      'bg-orx-danger/10 text-orx-danger'
                    }`}>
                      {req.status === 'conforme' && <CheckCircle className="w-3 h-3" />}
                      {req.status === 'atencao' && <AlertCircle className="w-3 h-3" />}
                      {req.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Score
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-orx-bg-app rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${req.score >= 95 ? 'bg-orx-success' : req.score >= 90 ? 'bg-orx-warning' : 'bg-orx-danger'}`}
                            style={{ width: `${req.score}%` }}
                          />
                        </div>
                        <span className={`orx-text-sm orx-font-bold ${
                          req.score >= 95 ? 'text-orx-success' : req.score >= 90 ? 'text-orx-warning' : 'text-orx-danger'
                        }`}>
                          {req.score}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="orx-text-xs text-orx-text-muted mb-1">Última Auditoria</p>
                      <p className="orx-text-sm orx-font-medium text-orx-text-primary">
                        {new Date(req.ultima_auditoria).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <NeumoButton variant="secondary" size="sm" leftIcon={FileText}>
                  Evidências
                </NeumoButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

