/**
 * Painel de Rastreabilidade Dinâmica - ICARUS v5.0
 * Exibe ciclo completo do OPME: entrada → uso → devolução → paciente
 * Conformidade: Lei 13.410/2016 + RDC 16/2013
 */

import React, { useState } from 'react';
import { Package, Activity, User, Shield, Truck } from 'lucide-react';
import { legacySupabase as supabase } from '@/lib/legacySupabase';
import { format } from 'date-fns';

interface CicloOPME {
  // Entrada
  entrada: {
    data: Date;
    fornecedor: string;
    nota_fiscal: string;
    lote: string;
    validade: Date;
    quantidade: number;
  } | null;

  // Uso
  uso: {
    data: Date;
    cirurgia_codigo: string;
    hospital: string;
    medico: string;
    procedimento: string;
    quantidade_usada: number;
  } | null;

  // Devolução (se aplicável)
  devolucao: {
    data: Date;
    quantidade: number;
    motivo: string;
    condicao: string;
  } | null;

  // Paciente (Classe IV)
  paciente: {
    iniciais: string; // LGPD
    data_cirurgia: Date;
    hospital: string;
  } | null;

  // Status
  status_rastreabilidade: 'completo' | 'parcial' | 'incompleto';
  conformidade_lei_13410: boolean; // Lei 13.410/2016
  alertas: string[];
}

export default function PainelRastreabilidade() {
  const [loteId, setLoteId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [ciclo, setCiclo] = useState<CicloOPME | null>(null);

  const buscarRastreabilidade = async () => {
    if (!loteId.trim()) return;

    setLoading(true);

    try {
      // Buscar lote
      const { data: lote } = await supabase
        .from('lotes')
        .select(
          `
          *,
          produto:produtos(descricao, classe_risco_anvisa, registro_anvisa)
        `
        )
        .eq('id', loteId)
        .single();

      if (!lote) {
        alert('Lote não encontrado');
        return;
      }

      // 1. ENTRADA (movimentação de entrada)
      const { data: entrada } = await supabase
        .from('estoque_movimentacoes')
        .select(
          `
          data_movimentacao,
          quantidade,
          documento_numero
        `
        )
        .eq('lote_id', loteId)
        .eq('tipo', 'entrada_compra')
        .order('data_movimentacao', { ascending: true })
        .limit(1)
        .maybeSingle();

      // 2. USO (cirurgia)
      const { data: uso } = await supabase
        .from('cirurgia_materiais')
        .select(
          `
          data_uso,
          quantidade_utilizada,
          cirurgia:cirurgias(
            codigo_interno,
            procedimento,
            data_cirurgia,
            hora_cirurgia,
            paciente_iniciais,
            hospital:hospitais(nome),
            medico:medicos(nome)
          )
        `
        )
        .eq('lote_id', loteId)
        .eq('status', 'utilizado')
        .maybeSingle();

      // 3. DEVOLUÇÃO (se consignação)
      const { data: devolucao } = await supabase
        .from('devolucoes_consignacao')
        .select(
          `
          data_devolucao,
          valor_total_devolvido,
          motivo,
          status
        `
        )
        .eq('remessa_consignacao_id', loteId)
        .maybeSingle();

      // Montar ciclo
      const cicloCompleto: CicloOPME = {
        entrada: entrada
          ? {
              data: new Date(entrada.data_movimentacao),
              fornecedor: 'Fornecedor XYZ', // Mock - em produção, buscar FK
              nota_fiscal: entrada.documento_numero || 'N/A',
              lote: lote.numero_lote,
              validade: new Date(lote.data_validade),
              quantidade: entrada.quantidade,
            }
          : null,

        uso: uso?.cirurgia
          ? {
              data: new Date(uso.data_uso || uso.cirurgia.data_cirurgia),
              cirurgia_codigo: uso.cirurgia.codigo_interno,
              hospital: uso.cirurgia.hospital?.nome || 'N/A',
              medico: uso.cirurgia.medico?.nome || 'N/A',
              procedimento: uso.cirurgia.procedimento,
              quantidade_usada: uso.quantidade_utilizada,
            }
          : null,

        devolucao: devolucao
          ? {
              data: new Date(devolucao.data_devolucao),
              quantidade: 1, // Mock
              motivo: devolucao.motivo || 'N/A',
              condicao: devolucao.status || 'N/A',
            }
          : null,

        paciente: uso?.cirurgia?.paciente_iniciais
          ? {
              iniciais: uso.cirurgia.paciente_iniciais,
              data_cirurgia: new Date(uso.cirurgia.data_cirurgia),
              hospital: uso.cirurgia.hospital?.nome || 'N/A',
            }
          : null,

        status_rastreabilidade: 'completo',
        conformidade_lei_13410: false,
        alertas: [],
      };

      // Validar conformidade Lei 13.410/2016
      const alertas: string[] = [];

      if (!entrada) alertas.push('🔴 Entrada não registrada');
      if (!uso && lote.produto.classe_risco_anvisa === 'IV')
        alertas.push('🟡 Material Classe IV ainda não utilizado');
      if (!cicloCompleto.paciente && lote.produto.classe_risco_anvisa === 'IV') {
        alertas.push('🔴 CRÍTICO: Classe IV sem paciente vinculado (Lei 13.410/2016)');
      }
      if (!lote.numero_serie && lote.produto.classe_risco_anvisa === 'IV') {
        alertas.push('🔴 CRÍTICO: Classe IV sem número de série');
      }

      cicloCompleto.alertas = alertas;
      cicloCompleto.status_rastreabilidade =
        alertas.filter((a) => a.includes('CRÍTICO')).length > 0
          ? 'incompleto'
          : alertas.length > 0
            ? 'parcial'
            : 'completo';
      cicloCompleto.conformidade_lei_13410 =
        lote.produto.classe_risco_anvisa === 'IV'
          ? !!cicloCompleto.paciente && !!lote.numero_serie
          : true;

      setCiclo(cicloCompleto);
    } catch (error) {
      console.error('[Rastreabilidade] Erro:', error);
      alert('Erro ao buscar rastreabilidade');
    } finally {
      setLoading(false);
    }
  };

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
          Painel de Rastreabilidade Dinâmica
        </h1>
        <p style={{ color: 'var(--orx-text-secondary)' }}>
          Ciclo completo do OPME: Entrada → Uso → Devolução → Paciente (Lei 13.410/2016)
        </p>
      </div>

      {/* Busca */}
      <div className="neumorphic-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--orx-text-primary)',
              }}
            >
              Número do Lote ou ID
            </label>
            <input
              type="text"
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarRastreabilidade()}
              placeholder="Digite o número do lote ou ID"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--orx-border)',
                background: 'var(--orx-bg-light)',
                color: 'var(--orx-text-primary)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <button
            type="button"
            onClick={buscarRastreabilidade}
            disabled={loading || !loteId.trim()}
            className="colored-button"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'var(--orx-primary)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: loading || !loteId.trim() ? 0.5 : 1,
            }}
          >
            {loading ? 'Buscando...' : 'Rastrear'}
          </button>
        </div>
      </div>

      {/* Timeline do Ciclo */}
      {ciclo && (
        <>
          {/* Status Geral */}
          <div
            className="neumorphic-card"
            style={{
              padding: '1.5rem',
              marginBottom: '2rem',
              background:
                ciclo.status_rastreabilidade === 'completo'
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
                  : ciclo.status_rastreabilidade === 'parcial'
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.05))'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
              border: `2px solid ${
                ciclo.status_rastreabilidade === 'completo'
                  ? 'var(--orx-success)'
                  : ciclo.status_rastreabilidade === 'parcial'
                    ? 'var(--orx-warning)'
                    : 'var(--orx-error)'
              }`,
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
            >
              <Shield
                size={32}
                color={
                  ciclo.status_rastreabilidade === 'completo'
                    ? 'var(--orx-success)'
                    : ciclo.status_rastreabilidade === 'parcial'
                      ? 'var(--orx-warning)'
                      : 'var(--orx-error)'
                }
              />
              <div>
                <div
                  style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--orx-text-primary)' }}
                >
                  Rastreabilidade: {ciclo.status_rastreabilidade.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--orx-text-secondary)' }}>
                  Lei 13.410/2016:{' '}
                  {ciclo.conformidade_lei_13410 ? '✅ Conforme' : '🔴 Não Conforme'}
                </div>
              </div>
            </div>

            {ciclo.alertas.length > 0 && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid var(--orx-border)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--orx-text-primary)',
                  }}
                >
                  Alertas:
                </div>
                {ciclo.alertas.map((alerta, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--orx-text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {alerta}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline Visual */}
          <div style={{ position: 'relative', paddingLeft: '3rem' }}>
            {/* Linha Vertical */}
            <div
              style={{
                position: 'absolute',
                left: '1.5rem',
                top: '1rem',
                bottom: '1rem',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--orx-primary), var(--orx-success))',
              }}
            />

            {/* Etapa 1: Entrada */}
            {ciclo.entrada && (
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.25rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'var(--orx-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--orx-bg-light)',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                  }}
                >
                  <Package size={18} color="white" />
                </div>

                <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--orx-primary)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    1. ENTRADA DO MATERIAL
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📅 Data
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {format(ciclo.entrada.data, 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        🏢 Fornecedor
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.entrada.fornecedor}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📄 NF-e
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.entrada.nota_fiscal}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📦 Lote
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.entrada.lote}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        ⏰ Validade
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {format(ciclo.entrada.validade, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📊 Quantidade
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.entrada.quantidade} unid.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Uso em Cirurgia */}
            {ciclo.uso && (
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.25rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'var(--orx-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--orx-bg-light)',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  }}
                >
                  <Activity size={18} color="white" />
                </div>

                <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--orx-success)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    2. USO EM CIRURGIA
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📅 Data
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {format(ciclo.uso.data, 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        🏥 Hospital
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.uso.hospital}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        👨‍⚕️ Médico
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.uso.medico}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        ⚕️ Procedimento
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.uso.procedimento}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        💉 Cirurgia
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.uso.cirurgia_codigo}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📊 Qtd. Usada
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.uso.quantidade_usada} unid.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Paciente (Classe IV) */}
            {ciclo.paciente && (
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.25rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'var(--orx-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--orx-bg-light)',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  }}
                >
                  <User size={18} color="white" />
                </div>

                <div
                  className="neumorphic-card"
                  style={{ padding: '1.5rem', border: '2px solid var(--orx-info)' }}
                >
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--orx-info)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    3. PACIENTE VINCULADO (Classe IV)
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(59,130,246,0.05)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Iniciais:</strong> {ciclo.paciente.iniciais} (anonimizado - LGPD)
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Data Cirurgia:</strong>{' '}
                      {format(ciclo.paciente.data_cirurgia, 'dd/MM/yyyy')}
                    </div>
                    <div>
                      <strong>Hospital:</strong> {ciclo.paciente.hospital}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      background: 'rgba(16,185,129,0.1)',
                      fontSize: '0.75rem',
                      color: 'var(--orx-success)',
                      fontWeight: 600,
                    }}
                  >
                    ✅ Rastreabilidade individual conforme Lei 13.410/2016
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 4: Devolução (se houver) */}
            {ciclo.devolucao && (
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.25rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'var(--orx-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--orx-bg-light)',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                  }}
                >
                  <Truck size={18} color="white" />
                </div>

                <div className="neumorphic-card" style={{ padding: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--orx-warning)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    4. DEVOLUÇÃO
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📅 Data
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {format(ciclo.devolucao.data, 'dd/MM/yyyy')}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📊 Quantidade
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.devolucao.quantidade} unid.
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        💬 Motivo
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.devolucao.motivo}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--orx-text-secondary)', marginBottom: '0.25rem' }}>
                        📦 Condição
                      </div>
                      <div style={{ color: 'var(--orx-text-primary)', fontWeight: 500 }}>
                        {ciclo.devolucao.condicao}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Estado vazio */}
      {!ciclo && !loading && (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'var(--orx-text-secondary)',
          }}
        >
          <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Digite um número de lote para rastrear
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            Visualize o ciclo completo do OPME: Entrada → Uso → Devolução → Paciente
          </div>
        </div>
      )}
    </div>
  );
}
