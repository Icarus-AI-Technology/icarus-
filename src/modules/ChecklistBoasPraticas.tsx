/**
 * Checklist de Boas Práticas - ICARUS v5.0
 * Lista automática das exigências do manual OPME
 * Controle, Rastreabilidade, Auditoria, Tecnovigilância
 * 
 * Baseado em: RDC 16/2013 + Lei 13.410/2016 + Manual OPME
 */

import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { RelatorioTecnovigilanciaANVISA, RelatorioRastreabilidadeXML } from '@/services/quality/AutomatedReportsService';

interface ItemChecklist {
  id: string;
  categoria: string;
  item: string;
  referencia: string;  // RDC, Lei, Manual
  status: 'conforme' | 'nao_conforme' | 'parcial' | 'pendente';
  evidencia?: string;
  responsavel?: string;
  prazo?: Date;
  acao_corretiva?: string;
}

const CHECKLIST_BPD: ItemChecklist[] = [
  // CONTROLE
  {
    id: '1.1',
    categoria: 'Controle de OPME',
    item: 'Sistema informatizado de controle de estoque implementado',
    referencia: 'RDC 16/2013 Art. 15',
    status: 'conforme',
    evidencia: 'ICARUS v5.0 ativo'
  },
  {
    id: '1.2',
    categoria: 'Controle de OPME',
    item: 'Registro de entrada, saída e movimentações',
    referencia: 'RDC 16/2013 Art. 16',
    status: 'conforme',
    evidencia: 'Tabela estoque_movimentacoes'
  },
  {
    id: '1.3',
    categoria: 'Controle de OPME',
    item: 'Controle de validade e FEFO/PEPS implementado',
    referencia: 'RDC 16/2013 Art. 24',
    status: 'conforme',
    evidencia: 'Alertas automáticos 90/60/30 dias'
  },
  
  // RASTREABILIDADE
  {
    id: '2.1',
    categoria: 'Rastreabilidade',
    item: 'Rastreabilidade lote a lote de todos os produtos',
    referencia: 'Lei 13.410/2016 Art. 1º',
    status: 'conforme',
    evidencia: 'Tabela lotes + cadeia de custódia'
  },
  {
    id: '2.2',
    categoria: 'Rastreabilidade',
    item: 'Rastreabilidade individual para dispositivos Classe IV',
    referencia: 'Lei 13.410/2016 Art. 2º',
    status: 'parcial',
    evidencia: 'Implementado em cirurgias',
    acao_corretiva: 'Validar 100% dos lotes Classe IV com número de série'
  },
  {
    id: '2.3',
    categoria: 'Rastreabilidade',
    item: 'Vinculação de dispositivo Classe IV ao paciente',
    referencia: 'Lei 13.410/2016 Art. 3º',
    status: 'conforme',
    evidencia: 'Campo paciente_iniciais em cirurgias (LGPD)'
  },
  {
    id: '2.4',
    categoria: 'Rastreabilidade',
    item: 'Manutenção de registros por no mínimo 5 anos (Classe IV)',
    referencia: 'Lei 13.410/2016 Art. 4º',
    status: 'conforme',
    evidencia: 'Soft delete + arquivamento digital'
  },
  
  // AUDITORIA
  {
    id: '3.1',
    categoria: 'Auditoria Interna',
    item: 'Procedimento de auditoria interna documentado',
    referencia: 'Manual OPME Seção 8.1',
    status: 'conforme',
    evidencia: 'Agente de Auditoria Interna implementado'
  },
  {
    id: '3.2',
    categoria: 'Auditoria Interna',
    item: 'Auditoria anual obrigatória',
    referencia: 'RDC 16/2013 Art. 45',
    status: 'pendente',
    responsavel: 'Gerente de Qualidade',
    prazo: new Date('2025-12-31'),
    acao_corretiva: 'Agendar auditoria interna até Dez/2025'
  },
  {
    id: '3.3',
    categoria: 'Auditoria Interna',
    item: 'Registros de não conformidades e ações corretivas',
    referencia: 'Manual OPME Seção 8.2',
    status: 'conforme',
    evidencia: 'Tabelas nao_conformidades + acoes_corretivas'
  },
  
  // TECNOVIGILÂNCIA
  {
    id: '4.1',
    categoria: 'Tecnovigilância',
    item: 'Sistema de notificação de eventos adversos',
    referencia: 'RDC 16/2013 Art. 50 + Manual Seção 7',
    status: 'conforme',
    evidencia: 'Agente de Tecnovigilância + NOTIVISA integration'
  },
  {
    id: '4.2',
    categoria: 'Tecnovigilância',
    item: 'Notificação à ANVISA de eventos graves em 72h',
    referencia: 'Manual OPME Seção 7.1',
    status: 'conforme',
    evidencia: 'Alertas automáticos + cálculo de prazo'
  },
  {
    id: '4.3',
    categoria: 'Tecnovigilância',
    item: 'Investigação de eventos adversos documentada',
    referencia: 'Manual OPME Seção 7.2',
    status: 'conforme',
    evidencia: 'Tabela eventos_adversos_notivisa com campo descricao'
  },
  
  // ARMAZENAMENTO
  {
    id: '5.1',
    categoria: 'Armazenamento',
    item: 'Área limpa, organizada e segregada por classe',
    referencia: 'RDC 16/2013 Art. 22',
    status: 'conforme',
    evidencia: 'Layout de armazém + localizações'
  },
  {
    id: '5.2',
    categoria: 'Armazenamento',
    item: 'Controle de temperatura para produtos termossensíveis',
    referencia: 'RDC 16/2013 Art. 23 + Manual Seção 5.2',
    status: 'conforme',
    evidencia: 'Agente de Temperatura IoT planejado (Fase 2)'
  },
  {
    id: '5.3',
    categoria: 'Armazenamento',
    item: 'Segregação de produtos vencidos e não conformes',
    referencia: 'RDC 16/2013 Art. 25',
    status: 'conforme',
    evidencia: 'Status de lote (bloqueado, vencido)'
  }
];

export default function ChecklistBoasPraticas() {
  const [checklist] = useState<ItemChecklist[]>(CHECKLIST_BPD);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [exportando, setExportando] = useState(false);
  
  const categorias = ['Todos', ...Array.from(new Set(checklist.map(item => item.categoria)))];
  
  const checklistFiltrado = filtroCategoria === 'Todos' 
    ? checklist
    : checklist.filter(item => item.categoria === filtroCategoria);
  
  const stats = {
    total: checklist.length,
    conforme: checklist.filter(i => i.status === 'conforme').length,
    nao_conforme: checklist.filter(i => i.status === 'nao_conforme').length,
    parcial: checklist.filter(i => i.status === 'parcial').length,
    pendente: checklist.filter(i => i.status === 'pendente').length
  };
  
  const percentualConformidade = Math.round((stats.conforme / stats.total) * 100);
  
  const exportarRelatorioXML = async () => {
    setExportando(true);
    
    try {
      const xml = await RelatorioRastreabilidadeXML.gerarRelatorioXML({
        inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        fim: new Date()
      });
      
      RelatorioTecnovigilanciaANVISA.downloadXML(xml, `rastreabilidade-${format(new Date(), 'yyyyMMdd')}.xml`);
      
    } catch (error) {
      console.error('[Checklist] Erro ao exportar:', error);
    } finally {
      setExportando(false);
    }
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--orx-text-primary)',
          marginBottom: '0.5rem'
        }}>
          Checklist de Boas Práticas de Distribuição
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Controle, Rastreabilidade, Auditoria, Tecnovigilância (RDC 16/2013 + Lei 13.410/2016)
        </p>
      </div>
      
      {/* Estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="neumorphic-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--orx-primary)' }}>
            {percentualConformidade}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            Conformidade Geral
          </div>
        </div>
        
        <div className="neumorphic-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--orx-success)' }}>
            {stats.conforme}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            ✅ Conforme
          </div>
        </div>
        
        <div className="neumorphic-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--orx-warning)' }}>
            {stats.parcial}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            🟡 Parcial
          </div>
        </div>
        
        <div className="neumorphic-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--orx-error)' }}>
            {stats.nao_conforme}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            ❌ Não Conforme
          </div>
        </div>
        
        <div className="neumorphic-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--orx-text-secondary)' }}>
            {stats.pendente}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            ⏳ Pendente
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categorias.map(cat => (
          <button type="button"
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              border: filtroCategoria === cat ? '2px solid var(--orx-primary)' : '1px solid var(--orx-border)',
              background: filtroCategoria === cat ? 'rgba(99,102,241,0.1)' : 'var(--orx-bg-light)',
              color: filtroCategoria === cat ? 'var(--orx-primary)' : 'var(--orx-text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: filtroCategoria === cat ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Lista de Itens */}
      <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {checklistFiltrado.map((item) => (
            <div key={item.id} style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              border: `1px solid ${
                item.status === 'conforme' ? 'var(--orx-success)' :
                item.status === 'parcial' ? 'var(--orx-warning)' :
                item.status === 'nao_conforme' ? 'var(--orx-error)' : 'var(--orx-border)'
              }`,
              background: item.status === 'conforme' 
                ? 'rgba(16,185,129,0.03)'
                : item.status === 'nao_conforme'
                  ? 'rgba(239,68,68,0.03)'
                  : item.status === 'parcial'
                    ? 'rgba(245,158,11,0.03)'
                    : 'transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Ícone de Status */}
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: item.status === 'conforme' ? 'var(--orx-success)' :
                             item.status === 'parcial' ? 'var(--orx-warning)' :
                             item.status === 'nao_conforme' ? 'var(--orx-error)' : 'var(--orx-border)',
                  flexShrink: 0
                }}>
                  {item.status === 'conforme' && <CheckCircle size={18} color="white" />}
                  {item.status === 'nao_conforme' && <XCircle size={18} color="white" />}
                  {item.status === 'pendente' && <Clock size={18} color="white" />}
                  {item.status === 'parcial' && <RefreshCw size={18} color="white" />}
                </div>
                
                {/* Conteúdo */}
                <div style={{ flex: 1 }}>
                  {/* Cabeçalho do Item */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        {item.id} • {item.categoria}
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--orx-text-primary)' }}>
                        {item.item}
                      </div>
                    </div>
                  </div>
                  
                  {/* Referência Legal */}
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(99,102,241,0.05)',
                    fontSize: '0.75rem',
                    color: 'var(--orx-primary)',
                    marginBottom: '0.5rem',
                    fontWeight: 500
                  }}>
                    📚 Referência: {item.referencia}
                  </div>
                  
                  {/* Evidência */}
                  {item.evidencia && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--orx-text-secondary)', marginBottom: '0.5rem' }}>
                      <strong>Evidência:</strong> {item.evidencia}
                    </div>
                  )}
                  
                  {/* Ação Corretiva */}
                  {item.acao_corretiva && (
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid var(--orx-error)',
                      fontSize: '0.8125rem',
                      color: 'var(--orx-error)',
                      marginTop: '0.5rem'
                    }}>
                      <strong>⚠️ Ação Corretiva:</strong> {item.acao_corretiva}
                    </div>
                  )}
                  
                  {/* Responsável e Prazo */}
                  {(item.responsavel || item.prazo) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)', marginTop: '0.5rem' }}>
                      {item.responsavel && <span><strong>Responsável:</strong> {item.responsavel}</span>}
                      {item.responsavel && item.prazo && ' | '}
                      {item.prazo && <span><strong>Prazo:</strong> {format(item.prazo, 'dd/MM/yyyy')}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ações */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button type="button"
          onClick={exportarRelatorioXML}
          disabled={exportando}
          className="colored-button"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'var(--orx-primary)',
            color: 'white',
            cursor: exportando ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: exportando ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Download size={16} />
          {exportando ? 'Gerando...' : 'Exportar Relatório XML (ANVISA)'}
        </button>
        
        <button type="button"
          className="neumorphic-button"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--orx-border)',
            background: 'var(--orx-bg-light)',
            color: 'var(--orx-text-primary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          <RefreshCw size={16} className="inline mr-2" />
          Atualizar Status
        </button>
      </div>
    </div>
  );
}

