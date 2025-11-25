/**
 * Dashboard de Qualidade - Módulo Qualidade ICARUS v5.0
 * Integra 6 Agentes de IA + 4 Modelos Preditivos + APIs Regulatórias
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, FileText, Bell } from 'lucide-react';
import { RadialProgress } from '@/components/oraclusx-ds/RadialProgress';
import { useQualityAgents } from '@/hooks/useQualityAgents';
import type { ChecklistAuditoria } from '@/services/quality/QualityAgentsService';

export default function QualidadeDashboard() {
  const { gerarChecklistAuditoria } = useQualityAgents();

  const [checklists, setChecklists] = useState<ChecklistAuditoria[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
    // Carregar checklist de auditoria
    const check = await gerarChecklistAuditoria();
    if (check) setChecklists(check);

    // Calcular score de conformidade (exemplo: primeiro fornecedor)
    // Em produção, calcular para todos e agregar
    } finally {
      setLoading(false);
    }
  }, [gerarChecklistAuditoria]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const scoreGeral =
    checklists.length > 0
      ? Math.round(checklists.reduce((sum, c) => sum + c.score, 0) / checklists.length)
      : 0;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--orx-text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Módulo Qualidade - Agentes de IA
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          6 Agentes de IA + 4 Modelos Preditivos + Integração APIs Regulatórias (ANVISA, NOTIVISA,
          SIGTAP)
        </p>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Score Geral de Conformidade */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <RadialProgress
            value={scoreGeral}
            max={100}
            size={120}
            strokeWidth={12}
            label={`${scoreGeral}%`}
            critical={scoreGeral < 75}
          />
          <div
            style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--orx-text-primary)',
            }}
          >
            Score Geral BPD
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            Boas Práticas Distribuição
          </div>
        </div>

        {/* Agentes Ativos */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Shield size={32} color="var(--orx-primary)" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}>
                6
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                Agentes Ativos
              </div>
            </div>
          </div>
          <div
            style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)', lineHeight: '1.6' }}
          >
            • Padronização
            <br />
            • Rastreabilidade
            <br />
            • Qualificação
            <br />
            • Tecnovigilância
            <br />
            • Justificativas
            <br />• Auditoria Interna
          </div>
        </div>

        {/* Modelos Preditivos */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <TrendingUp size={32} color="var(--orx-success)" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}>
                4
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                Modelos IA
              </div>
            </div>
          </div>
          <div
            style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)', lineHeight: '1.6' }}
          >
            • Risco de Glosa
            <br />
            • Falhas Fornecedor
            <br />
            • Estoque Crítico
            <br />• Score Conformidade
          </div>
        </div>

        {/* APIs Integradas */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Bell size={32} color="var(--orx-warning)" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}>
                3
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                APIs Governamentais
              </div>
            </div>
          </div>
          <div
            style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)', lineHeight: '1.6' }}
          >
            • ANVISA DataVisa
            <br />
            • NOTIVISA (eventos)
            <br />• SIGTAP (procedimentos)
          </div>
        </div>
      </div>

      {/* Checklists de Auditoria */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1rem',
          }}
        >
          Checklist BPD - RDC 16/2013
        </h2>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {checklists.map((checklist, idx) => (
            <div key={idx} className="neumorphic-card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {checklist.categoria}
                  </h3>
                </div>
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    background:
                      checklist.score >= 90
                        ? 'var(--orx-success)'
                        : checklist.score >= 75
                          ? 'var(--orx-warning)'
                          : 'var(--orx-error)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {checklist.score}%
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {checklist.itens.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background:
                        item.status === 'conforme'
                          ? 'rgba(16,185,129,0.05)'
                          : item.status === 'nao_conforme'
                            ? 'rgba(239,68,68,0.05)'
                            : 'rgba(245,158,11,0.05)',
                      border: `1px solid ${
                        item.status === 'conforme'
                          ? 'var(--orx-success)'
                          : item.status === 'nao_conforme'
                            ? 'var(--orx-error)'
                            : 'var(--orx-warning)'
                      }`,
                    }}
                  >
                    {item.status === 'conforme' ? (
                      <Shield size={18} color="var(--orx-success)" />
                    ) : (
                      <AlertTriangle size={18} color="var(--orx-error)" />
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--orx-text-primary)',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {item.descricao}
                      </div>
                      {item.evidencia && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                          Evidência: {item.evidencia}
                        </div>
                      )}
                      {item.acao_corretiva && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--orx-error)',
                            marginTop: '0.25rem',
                          }}
                        >
                          ⚠️ Ação: {item.acao_corretiva}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Agentes */}
      <div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1rem',
          }}
        >
          Agentes de IA Disponíveis
        </h2>

        <div className="neumorphic-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--orx-border)' }}>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: 'var(--orx-text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Agente
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: 'var(--orx-text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Função
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    color: 'var(--orx-text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  nome: 'Agente de Padronização',
                  funcao:
                    'Automatiza processo de padronização de materiais e atualização de catálogos com registro ANVISA',
                },
                {
                  nome: 'Agente de Rastreabilidade',
                  funcao:
                    'Verifica se lote tem número ANVISA, validade, lote e paciente vinculados. Gera alertas automáticos.',
                },
                {
                  nome: 'Agente de Qualificação',
                  funcao:
                    'Avalia cumprimento dos requisitos de qualidade dos fornecedores. Gera score de 0-100.',
                },
                {
                  nome: 'Agente de Tecnovigilância',
                  funcao:
                    'Monitora eventos técnicos e adversos. Integração com NOTIVISA para notificação automática.',
                },
                {
                  nome: 'Agente de Justificativas OPME',
                  funcao:
                    'Gera textos automáticos de justificativa de uso conforme RN 465/2021 da ANS.',
                },
                {
                  nome: 'Agente de Auditoria Interna',
                  funcao:
                    'Automatiza checklists de auditoria, sugere ações preventivas e corretivas.',
                },
              ].map((agente, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--orx-border)' }}>
                  <td
                    style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--orx-text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {agente.nome}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      fontSize: '0.8125rem',
                      color: 'var(--orx-text-secondary)',
                      lineHeight: '1.5',
                    }}
                  >
                    {agente.funcao}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        background: 'var(--orx-success)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      ✅ ATIVO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modelos Preditivos */}
      <div style={{ marginTop: '2rem' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1rem',
          }}
        >
          Modelos Preditivos de IA
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              titulo: 'Detecção de Risco de Glosa',
              descricao: 'Modelo supervisionado treinado com históricos de glosa',
              fonte: 'Seções 2.3 e 6.3 - Objetivos e Controle de OPME',
              icon: AlertTriangle,
              color: 'var(--orx-error)',
            },
            {
              titulo: 'Análise de Falhas de Fornecedor',
              descricao: 'Clustering + correlação de queixas técnicas e lotes',
              fonte: 'Seções 7.1 e 7.2 - Tecnovigilância',
              icon: TrendingDown,
              color: 'var(--orx-warning)',
            },
            {
              titulo: 'Previsão de Estoque Crítico',
              descricao: 'Modelo preditivo com consumo médio e curva ABC',
              fonte: 'Seção 5.2 - Armazenagem',
              icon: TrendingUp,
              color: 'var(--orx-primary)',
            },
            {
              titulo: 'Score de Conformidade Regulatória',
              descricao: 'IA gera pontuação para cada fornecedor/material',
              fonte: 'Seção 8.1 - Auditoria Interna',
              icon: Shield,
              color: 'var(--orx-success)',
            },
          ].map((modelo, i) => (
            <div key={i} className="neumorphic-card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: `${modelo.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <modelo.icon size={24} color={modelo.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {modelo.titulo}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--orx-text-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {modelo.descricao}
                  </p>
                  <div
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      background: 'rgba(99,102,241,0.05)',
                      fontSize: '0.75rem',
                      color: 'var(--orx-text-secondary)',
                    }}
                  >
                    📚 {modelo.fonte}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APIs Regulatórias */}
      <div style={{ marginTop: '2rem' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1rem',
          }}
        >
          Integrações Regulatórias
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              nome: 'ANVISA DataVisa',
              status: '✅ Integrado',
              descricao: 'Consultas de produtos e empresas',
            },
            {
              nome: 'NOTIVISA',
              status: '✅ Integrado',
              descricao: 'Notificação de eventos adversos',
            },
            { nome: 'SIGTAP', status: '✅ Integrado', descricao: 'Tabela de procedimentos SUS' },
          ].map((api, i) => (
            <div key={i} className="neumorphic-card" style={{ padding: '1rem' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--orx-text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                {api.nome}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--orx-text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                {api.descricao}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-success)', fontWeight: 600 }}>
                {api.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={carregarDados}
          disabled={loading}
          className="colored-button"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'var(--orx-primary)',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Carregando...' : 'Atualizar Checklist'}
        </button>

        <button
          type="button"
          className="neumorphic-button"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--orx-border)',
            background: 'var(--orx-bg-light)',
            color: 'var(--orx-text-primary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <FileText size={16} className="inline mr-2" />
          Exportar Relatório
        </button>
      </div>
    </div>
  );
}
