/**
 * Dashboard de Auditoria e Conformidade - ICARUS v5.0
 * Pontua fornecedores conforme ANVISA, validade, tecnovigilância
 * Integra todos os 6 agentes + 4 modelos preditivos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, TrendingUp, TrendingDown, Minus, Award, AlertTriangle } from 'lucide-react';
import { RadialProgress } from '@/components/oraclusx-ds/RadialProgress';
import { useQualityAgents } from '@/hooks/useQualityAgents';
import { supabase } from '@/lib/supabase';
import type { ChecklistAuditoria } from '@/services/quality/QualityAgentsService';

interface RankingFornecedor {
  id: string;
  nome: string;
  score_conformidade: number;
  nivel: 'A' | 'B' | 'C' | 'D' | 'E';
  afe_status: string;
  eventos_adversos: number;
  tendencia: 'melhorando' | 'estavel' | 'piorando';
}

type ChecklistItem = ChecklistAuditoria['itens'][number];

export default function AuditoriaConformidadeDashboard() {
  const { loading, calcularConformidade, analisarTendenciaFalhas, gerarChecklistAuditoria } =
    useQualityAgents();

  const [fornecedores, setFornecedores] = useState<RankingFornecedor[]>([]);
  const [checklists, setChecklists] = useState<ChecklistAuditoria[]>([]);
  const [scoreGeral, setScoreGeral] = useState(0);

  const carregarDados = useCallback(async () => {
    // Carregar fornecedores ativos
    const { data: fornecedoresData } = await supabase
      .from('fornecedores')
      .select(
        `
        id,
        nome,
        status,
        fornecedores_afe(afe_situacao, afe_validade)
      `
      )
      .eq('status', 'ativo')
      .limit(10);

    if (fornecedoresData) {
      // Calcular score para cada um
      const rankings: RankingFornecedor[] = [];

      for (const f of fornecedoresData) {
        // Score de conformidade
        const scoreData = await calcularConformidade(f.id);

        // Tendência de falhas
        const tendenciaData = await analisarTendenciaFalhas(f.id);

        if (scoreData && tendenciaData) {
          rankings.push({
            id: f.id,
            nome: f.nome,
            score_conformidade: scoreData.score_total,
            nivel: scoreData.nivel_conformidade,
            afe_status: f.fornecedores_afe?.[0]?.afe_situacao || 'Não consultada',
            eventos_adversos: tendenciaData.total_eventos,
            tendencia: tendenciaData.tendencia,
          });
        }
      }

      // Ordenar por score (maior primeiro)
      rankings.sort((a, b) => b.score_conformidade - a.score_conformidade);

      setFornecedores(rankings);

      // Score geral (média)
      const media = rankings.reduce((sum, r) => sum + r.score_conformidade, 0) / rankings.length;
      setScoreGeral(Math.round(media));
    }

    // Carregar checklists BPD
    const checklistsData = await gerarChecklistAuditoria();
    if (checklistsData) setChecklists(checklistsData);
  }, [analisarTendenciaFalhas, calcularConformidade, gerarChecklistAuditoria]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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
          Dashboard de Auditoria e Conformidade
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Pontuação de fornecedores: ANVISA + Validade + Tecnovigilância + BPD
        </p>
      </div>

      {/* KPIs Principais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Score Geral */}
        <div className="neumorphic-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <RadialProgress
            value={scoreGeral}
            max={100}
            size={120}
            strokeWidth={12}
            label={`${scoreGeral}%`}
            color={scoreGeral >= 90 ? 'success' : scoreGeral >= 75 ? 'warning' : 'error'}
          />
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
            Score Geral de Conformidade
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
            Média de {fornecedores.length} fornecedores
          </div>
        </div>

        {/* Fornecedores Nível A */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Award size={32} color="var(--orx-success)" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}>
                {fornecedores.filter((f) => f.nivel === 'A').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                Fornecedores Nível A
              </div>
            </div>
          </div>
        </div>

        {/* AFEs Válidas */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={32} color="var(--orx-primary)" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}>
                {fornecedores.filter((f) => f.afe_status === 'Ativa').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                AFEs Vigentes
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Adversos */}
        <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={32} color="var(--orx-warning)" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}>
                {fornecedores.reduce((sum, f) => sum + f.eventos_adversos, 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--orx-text-secondary)' }}>
                Eventos Adversos (12m)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking de Fornecedores */}
      <div className="neumorphic-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem',
          }}
        >
          Ranking de Conformidade Regulatória
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--orx-border)' }}>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  Fornecedor
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  Score
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  Nível
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  AFE
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  Eventos
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  Tendência
                </th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((forn, idx) => (
                <tr key={forn.id} style={{ borderBottom: '1px solid var(--orx-border)' }}>
                  <td
                    style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--orx-text-secondary)',
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--orx-text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {forn.nome}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        background:
                          forn.score_conformidade >= 90
                            ? 'var(--orx-success)'
                            : forn.score_conformidade >= 75
                              ? 'var(--orx-primary)'
                              : forn.score_conformidade >= 60
                                ? 'var(--orx-warning)'
                                : 'var(--orx-error)',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {forn.score_conformidade}%
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        background:
                          forn.nivel === 'A'
                            ? 'var(--orx-success)'
                            : forn.nivel === 'B'
                              ? 'var(--orx-primary)'
                              : forn.nivel === 'C'
                                ? 'var(--orx-warning)'
                                : 'var(--orx-error)',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {forn.nivel}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem' }}>
                    <span
                      style={{
                        color:
                          forn.afe_status === 'Ativa' ? 'var(--orx-success)' : 'var(--orx-error)',
                      }}
                    >
                      {forn.afe_status === 'Ativa' ? '✅' : '🔴'} {forn.afe_status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        color:
                          forn.eventos_adversos === 0 ? 'var(--orx-success)' : 'var(--orx-warning)',
                      }}
                    >
                      {forn.eventos_adversos}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {forn.tendencia === 'melhorando' && (
                      <TrendingUp size={18} color="var(--orx-success)" />
                    )}
                    {forn.tendencia === 'piorando' && (
                      <TrendingDown size={18} color="var(--orx-error)" />
                    )}
                    {forn.tendencia === 'estavel' && (
                      <Minus size={18} color="var(--orx-text-secondary)" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fornecedores.length === 0 && !loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--orx-text-secondary)' }}>
            Clique em "Atualizar Ranking" para carregar dados
          </div>
        )}
      </div>

      {/* Checklists BPD */}
      <div>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--orx-text-primary)',
            marginBottom: '1.5rem',
          }}
        >
          Checklists de Boas Práticas de Distribuição (RDC 16/2013)
        </h2>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {checklists.map((checklist, idx) => (
            <div key={idx} className="neumorphic-card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--orx-text-primary)' }}>
                  {checklist.categoria}
                </h3>
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
                    fontWeight: 700,
                  }}
                >
                  {checklist.score}%
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {checklist.itens.map((item: ChecklistItem, i: number) => (
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
                          : 'rgba(239,68,68,0.05)',
                      border: `1px solid ${item.status === 'conforme' ? 'var(--orx-success)' : 'var(--orx-error)'}`,
                    }}
                  >
                    {item.status === 'conforme' ? (
                      <Shield size={16} color="var(--orx-success)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--orx-error)" />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--orx-text-primary)' }}>
                        {item.descricao}
                      </div>
                      {item.acao_corretiva && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--orx-error)',
                            marginTop: '0.25rem',
                          }}
                        >
                          ⚠️ {item.acao_corretiva}
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

      {/* Botões de Ação */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
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
          {loading ? 'Carregando...' : 'Atualizar Ranking'}
        </button>
      </div>
    </div>
  );
}
