/**
 * RELATÓRIOS REGULATÓRIOS - ICARUS v5.0
 * ANVISA, SEFAZ, ANS - Compliance automático
 */

import { Shield, AlertTriangle, CheckCircle, Download, Send, Clock } from 'lucide-react';
import { ModulePage } from '@/components/templates/ModulePage';
import { Button } from '@/components/oraclusx-ds/Button';

interface Relatorio {
  id: string;
  tipo: 'ANVISA' | 'SEFAZ' | 'ANS';
  descricao: string;
  periodicidade: string;
  ultimoEnvio: string;
  proximoVencimento: string;
  status: 'em_dia' | 'proximo_vencimento' | 'atrasado';
  arquivo?: string;
}

export default function RelatoriosRegulatorios() {
  const relatorios: Relatorio[] = [
    {
      id: '1',
      tipo: 'ANVISA',
      descricao: 'Movimentação de OPME (RDC 16/2013)',
      periodicidade: 'Mensal',
      ultimoEnvio: '2025-10-05',
      proximoVencimento: '2025-11-05',
      status: 'em_dia',
    },
    {
      id: '2',
      tipo: 'ANVISA',
      descricao: 'Rastreabilidade Produtos Classe IV',
      periodicidade: 'Trimestral',
      ultimoEnvio: '2025-09-30',
      proximoVencimento: '2025-12-31',
      status: 'em_dia',
    },
    {
      id: '3',
      tipo: 'SEFAZ',
      descricao: 'SPED Fiscal (Bloco K)',
      periodicidade: 'Mensal',
      ultimoEnvio: '2025-10-10',
      proximoVencimento: '2025-11-10',
      status: 'em_dia',
    },
    {
      id: '4',
      tipo: 'SEFAZ',
      descricao: 'Arquivo Magnético Inventário',
      periodicidade: 'Anual',
      ultimoEnvio: '2025-01-31',
      proximoVencimento: '2026-01-31',
      status: 'em_dia',
    },
    {
      id: '5',
      tipo: 'ANS',
      descricao: 'Faturamento TISS',
      periodicidade: 'Mensal',
      ultimoEnvio: '2025-10-15',
      proximoVencimento: '2025-11-15',
      status: 'proximo_vencimento',
    },
    {
      id: '6',
      tipo: 'ANS',
      descricao: 'Demonstrativo de Glosas',
      periodicidade: 'Trimestral',
      ultimoEnvio: '2025-07-15',
      proximoVencimento: '2025-10-25',
      status: 'atrasado',
    },
  ];

  const kpis = [
    {
      title: 'Relatórios em Dia',
      value: '4',
      trend: '67%',
      icon: CheckCircle,
      iconBg: 'linear-gradient(135deg, var(--orx-success), #059669)',
      color: 'var(--orx-success)',
    },
    {
      title: 'Próximo Vencimento',
      value: '1',
      trend: '16%',
      icon: Clock,
      iconBg: 'linear-gradient(135deg, var(--orx-warning), #D97706)',
      color: 'var(--orx-warning)',
    },
    {
      title: 'Atrasados',
      value: '1',
      trend: '17%',
      icon: AlertTriangle,
      iconBg: 'linear-gradient(135deg, var(--orx-error), var(--orx-error-dark))',
      color: 'var(--orx-error)',
    },
    {
      title: 'Enviados (Mês)',
      value: '6',
      trend: '+2',
      icon: Send,
      iconBg: 'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
      color: 'var(--orx-primary)',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      em_dia: 'var(--orx-success)',
      proximo_vencimento: 'var(--orx-warning)',
      atrasado: 'var(--orx-error)',
    };
    return colors[status as keyof typeof colors] || 'var(--orx-gray-500)';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      em_dia: 'Em Dia',
      proximo_vencimento: 'Próximo Vencimento',
      atrasado: 'Atrasado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'em_dia') return CheckCircle;
    if (status === 'proximo_vencimento') return Clock;
    return AlertTriangle;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      ANVISA: 'var(--orx-purple-500)',
      SEFAZ: 'var(--orx-primary)',
      ANS: 'var(--orx-success)',
    };
    return colors[tipo as keyof typeof colors] || 'var(--orx-gray-500)';
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ModulePage
      title="Relatórios Regulatórios"
      description="ANVISA, SEFAZ, ANS - Compliance automático"
      icon={<Shield size={24} />}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:baixar-relatorios'))}
          >
            <Download size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Baixar Todos</span>
          </Button>
          <Button
            variant="neumorphic"
            size="default"
            className="inline-flex items-center gap-2"
            onClick={() => window.dispatchEvent(new CustomEvent('icarus:enviar-relatorios'))}
          >
            <Send size={18} strokeWidth={1.5} className="flex-shrink-0" />
            <span>Enviar Lotes</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="neumorphic-card p-6 rounded-2xl"
              style={{
                background: 'var(--orx-bg-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: kpi.iconBg,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <kpi.icon size={24} color="var(--orx-text-white)" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: '0.813rem',
                      color: 'var(--orx-text-secondary)',
                      fontFamily: 'var(--orx-font-family)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {kpi.title}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <p
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    color: 'var(--orx-text-primary)',
                    fontFamily: 'var(--orx-font-family)',
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span
                  style={{
                    fontSize: '0.813rem',
                    fontWeight: 600,
                    color: kpi.color,
                    fontFamily: 'var(--orx-font-family)',
                  }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Relatórios Grid */}
        <div className="grid grid-cols-2 gap-6">
          {relatorios.map((relatorio) => {
            const StatusIcon = getStatusIcon(relatorio.status);
            const daysUntil = getDaysUntil(relatorio.proximoVencimento);

            return (
              <div
                key={relatorio.id}
                className="neumorphic-card p-6 rounded-2xl"
                style={{
                  background: 'var(--orx-bg-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: `${getTipoColor(relatorio.tipo)}15`,
                      }}
                    >
                      <Shield size={24} style={{ color: getTipoColor(relatorio.tipo) }} />
                    </div>
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.813rem',
                          fontWeight: 700,
                          fontFamily: 'var(--orx-font-family)',
                          background: `${getTipoColor(relatorio.tipo)}`,
                          color: 'var(--orx-text-white)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {relatorio.tipo}
                      </span>
                      <h3
                        style={{
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          color: 'var(--orx-text-primary)',
                          fontFamily: 'var(--orx-font-family)',
                        }}
                      >
                        {relatorio.descricao}
                      </h3>
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      fontFamily: 'var(--orx-font-family)',
                      background: `${getStatusColor(relatorio.status)}15`,
                      color: getStatusColor(relatorio.status),
                    }}
                  >
                    <StatusIcon size={14} />
                    {getStatusLabel(relatorio.status)}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-secondary)',
                        fontFamily: 'var(--orx-font-family)',
                      }}
                    >
                      Periodicidade
                    </span>
                    <span
                      style={{
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color: 'var(--orx-text-primary)',
                        fontFamily: 'var(--orx-font-family)',
                      }}
                    >
                      {relatorio.periodicidade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-secondary)',
                        fontFamily: 'var(--orx-font-family)',
                      }}
                    >
                      Último Envio
                    </span>
                    <span
                      style={{
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color: 'var(--orx-text-primary)',
                        fontFamily: 'var(--orx-font-family)',
                      }}
                    >
                      {formatDate(relatorio.ultimoEnvio)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: '0.813rem',
                        color: 'var(--orx-text-secondary)',
                        fontFamily: 'var(--orx-font-family)',
                      }}
                    >
                      Próximo Vencimento
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: '0.813rem',
                          fontWeight: 600,
                          color: 'var(--orx-text-primary)',
                          fontFamily: 'var(--orx-font-family)',
                        }}
                      >
                        {formatDate(relatorio.proximoVencimento)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.813rem',
                          color:
                            daysUntil < 0
                              ? 'var(--orx-error)'
                              : daysUntil <= 7
                                ? 'var(--orx-warning)'
                                : 'var(--orx-success)',
                          fontFamily: 'var(--orx-font-family)',
                        }}
                      >
                        ({daysUntil < 0 ? `${Math.abs(daysUntil)}d atraso` : `${daysUntil}d`})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    style={{
                      flex: 1,
                      padding: '0.625rem 1rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.813rem',
                      fontWeight: 600,
                      fontFamily: 'var(--orx-font-family)',
                      background:
                        'linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover))',
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Send size={16} />
                    Gerar e Enviar
                  </button>
                  <Button
                    variant="neumorphic"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('icarus:download-relatorio', { detail: relatorio.id })
                      )
                    }
                  >
                    <Download size={16} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>Download</span>
                  </Button>
                  <Button
                    variant="neumorphic"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('icarus:enviar-relatorio', { detail: relatorio.id })
                      )
                    }
                  >
                    <Send size={16} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>Enviar</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModulePage>
  );
}
