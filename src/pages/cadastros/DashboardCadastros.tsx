/**
 * Dashboard de Cadastros - ICARUS v5.0
 * 
 * Exibe visão geral de todos os cadastros do sistema:
 * - 8 KPIs principais
 * - Gráficos de evolução
 * - Top médicos e hospitais
 * - Alertas e duplicatas
 * - Sugestões de IA
 * 
 * Design System: OraclusX DS
 * Neumorphism Premium 3D + Liquid Glass
 * 
 * @version 5.0.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  Users,
  Shield,
  Truck,
  Package,
  AlertTriangle,
  TrendingUp,
  RefreshCcw,
  Sparkles,
  Copy,
  ChevronRight
} from 'lucide-react';
import { 
  useCadastrosKPIs, 
  useAlertasCadastros, 
  useDuplicatasDetectadas 
} from '@/hooks/useCadastrosKPIs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const DashboardCadastros: React.FC = () => {
  const navigate = useNavigate();
  const { kpis, loading, error, refresh } = useCadastrosKPIs();
  const { alertas, dismissAlerta } = useAlertasCadastros();
  const { duplicatas, ignoreDuplicata } = useDuplicatasDetectadas();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--orx-primary)' }} />
          <p style={{ color: 'var(--orx-text-primary)' }}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--orx-error)' }} />
          <p style={{ color: 'var(--orx-text-primary)' }}>{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-6 py-2 rounded-lg"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              background: 'var(--orx-primary)',
              color: '#fff'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            style={{ 
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-weight-bold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '8px'
            }}
          >
            Cadastros Inteligentes
          </h1>
          <p style={{ color: 'var(--orx-text-secondary)' }}>
            Visão geral de todos os cadastros do sistema
          </p>
        </div>
        <button
          onClick={refresh}
          className="neumorphic-button"
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--orx-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCcw size={18} />
          <span style={{ fontSize: '0.813rem' }}>Atualizar</span>
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPICards removidos conforme solicitado - estatísticas agora inline nos gráficos */}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div 
          className="neumorphic-container"
          style={{
            padding: '24px',
            borderRadius: 'var(--orx-radius-xl)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 
              style={{ 
                fontSize: '0.813rem',
                fontWeight: 'var(--orx-font-weight-semibold)',
                color: 'var(--orx-text-primary)'
              }}
            >
              Alertas de Cadastros
            </h2>
          </div>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="neumorphic-container"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--orx-radius-lg)',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '12px'
                }}
              >
                <AlertTriangle 
                  size={20} 
                  style={{ 
                    color: alerta.tipo === 'error' ? 'var(--orx-error)' : 
                           alerta.tipo === 'warning' ? 'var(--orx-warning)' : 
                           'var(--orx-info)',
                    flexShrink: 0
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 
                    style={{ 
                      fontWeight: 'var(--orx-font-weight-semibold)',
                      color: 'var(--orx-text-primary)',
                      marginBottom: '4px'
                    }}
                  >
                    {alerta.titulo}
                  </h3>
                  <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem' }}>
                    {alerta.descricao}
                  </p>
                </div>
                <button
                  onClick={() => dismissAlerta(alerta.id)}
                  style={{ 
                    color: 'var(--orx-text-muted)',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicatas Detectadas */}
      {duplicatas.length > 0 && (
        <div 
          className="neumorphic-container"
          style={{
            padding: '24px',
            borderRadius: 'var(--orx-radius-xl)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Copy size={24} style={{ color: 'var(--orx-primary)' }} />
            <h2 
              style={{ 
                fontSize: '0.813rem',
                fontWeight: 'var(--orx-font-weight-semibold)',
                color: 'var(--orx-text-primary)'
              }}
            >
              Possíveis Duplicatas Detectadas
            </h2>
          </div>
          <div className="space-y-3">
            {duplicatas.map((duplicata) => (
              <div
                key={duplicata.id}
                className="neumorphic-container"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--orx-radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h3 
                    style={{ 
                      fontWeight: 'var(--orx-font-weight-semibold)',
                      color: 'var(--orx-text-primary)',
                      marginBottom: '4px'
                    }}
                  >
                    {duplicata.nome}
                  </h3>
                  <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem' }}>
                    {duplicata.motivo} - Score: {duplicata.score}%
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => ignoreDuplicata(duplicata.id)}
                    className="neumorphic-button"
                    style={{ padding: '8px 16px', borderRadius: 'var(--orx-radius-md)' }}
                  >
                    Ignorar
                  </button>
                  <button
                    className="neumorphic-button"
                    style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem', 
                      padding: '8px 16px', 
                      borderRadius: 'var(--orx-radius-md)',
                      background: 'var(--orx-primary)',
                      color: '#fff'
                    }}
                  >
                    Revisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Cadastros */}
        <div 
          className="neumorphic-container"
          style={{
            padding: '24px',
            borderRadius: 'var(--orx-radius-xl)'
          }}
        >
          <h2 
            style={{ 
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-weight-semibold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '16px'
            }}
          >
            Evolução de Cadastros - 12 Meses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpis.evolucaoCadastros}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--orx-border)" />
              <XAxis 
                dataKey="mes" 
                stroke="var(--orx-text-secondary)"
                style={{ fontSize: '0.813rem' }}
              />
              <YAxis 
                stroke="var(--orx-text-secondary)"
                style={{ fontSize: '0.813rem' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'var(--orx-bg-light)',
                  border: '1px solid var(--orx-border)',
                  borderRadius: 'var(--orx-radius-md)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="medicos" stroke="var(--orx-primary)" strokeWidth={2} name="Médicos" />
              <Line type="monotone" dataKey="hospitais" stroke="var(--orx-pink-500)" strokeWidth={2} name="Hospitais" />
              <Line type="monotone" dataKey="pacientes" stroke="var(--orx-purple-500)" strokeWidth={2} name="Pacientes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Médicos */}
        <div 
          className="neumorphic-container"
          style={{
            padding: '24px',
            borderRadius: 'var(--orx-radius-xl)'
          }}
        >
          <h2 
            style={{ 
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-weight-semibold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '16px'
            }}
          >
            Top 10 Médicos (Cirurgias)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis.topMedicos.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--orx-border)" />
              <XAxis 
                type="number" 
                stroke="var(--orx-text-secondary)"
                style={{ fontSize: '0.813rem' }}
              />
              <YAxis 
                type="category" 
                dataKey="nome" 
                width={150}
                stroke="var(--orx-text-secondary)"
                style={{ fontSize: '0.813rem' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'var(--orx-bg-light)',
                  border: '1px solid var(--orx-border)',
                  borderRadius: 'var(--orx-radius-md)'
                }}
              />
              <Bar dataKey="cirurgias" fill="var(--orx-primary)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Hospitais */}
        <div 
          className="neumorphic-container"
          style={{
            padding: '24px',
            borderRadius: 'var(--orx-radius-xl)'
          }}
        >
          <h2 
            style={{ 
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-weight-semibold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '16px'
            }}
          >
            Top 10 Hospitais (Faturamento)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis.topHospitais.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--orx-border)" />
              <XAxis 
                type="number" 
                stroke="var(--orx-text-secondary)"
                style={{ fontSize: '0.813rem' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category" 
                dataKey="nome" 
                width={150}
                stroke="var(--orx-text-secondary)"
                style={{ fontSize: '0.813rem' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'var(--orx-bg-light)',
                  border: '1px solid var(--orx-border)',
                  borderRadius: 'var(--orx-radius-md)'
                }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Bar dataKey="faturamento" fill="var(--orx-pink-500)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Produtos por Categoria */}
        <div 
          className="neumorphic-container"
          style={{
            padding: '24px',
            borderRadius: 'var(--orx-radius-xl)'
          }}
        >
          <h2 
            style={{ 
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-weight-semibold)',
              color: 'var(--orx-text-primary)',
              marginBottom: '16px'
            }}
          >
            Produtos OPME por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kpis.produtosPorCategoria}
                dataKey="quantidade"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {kpis.produtosPorCategoria.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'var(--orx-bg-light)',
                  border: '1px solid var(--orx-border)',
                  borderRadius: 'var(--orx-radius-md)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sugestões de IA */}
      <div 
        className="neumorphic-container"
        style={{
          padding: '24px',
          borderRadius: 'var(--orx-radius-xl)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={24} style={{ color: 'var(--orx-primary)' }} />
          <h2 
            style={{ 
              fontSize: '0.813rem',
              fontWeight: 'var(--orx-font-weight-semibold)',
              color: 'var(--orx-text-primary)'
            }}
          >
            Sugestões de Atualização (IA)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SugestaoCard
            titulo="Atualizar dados de médicos"
            descricao="12 médicos com dados desatualizados há mais de 6 meses"
            acao="Revisar"
          />
          <SugestaoCard
            titulo="Verificar fornecedores inativos"
            descricao="5 fornecedores sem movimentação nos últimos 90 dias"
            acao="Verificar"
          />
          <SugestaoCard
            titulo="Completar cadastros"
            descricao="8 cadastros com campos obrigatórios pendentes"
            acao="Completar"
          />
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTES AUXILIARES
// ========================================

interface KPICardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

// KPICard component removed

interface SugestaoCardProps {
  titulo: string;
  descricao: string;
  acao: string;
}

const SugestaoCard: React.FC<SugestaoCardProps> = ({ titulo, descricao, acao }) => {
  return (
    <div
      className="neumorphic-container"
      style={{
        padding: '20px',
        borderRadius: 'var(--orx-radius-lg)'
      }}
    >
      <h3 
        style={{ 
          fontWeight: 'var(--orx-font-weight-semibold)',
          color: 'var(--orx-text-primary)',
          marginBottom: '8px'
        }}
      >
        {titulo}
      </h3>
      <p style={{ color: 'var(--orx-text-secondary)', fontSize: '0.813rem', marginBottom: '16px' }}>
        {descricao}
      </p>
      <button
        className="neumorphic-button"
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--orx-radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <span>{acao}</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// Cores para o gráfico de pizza
const COLORS = [
  'var(--orx-primary)',
  'var(--orx-pink-500)',
  'var(--orx-purple-500)',
  'var(--orx-teal-500)',
  'var(--orx-warning)',
  'var(--orx-gray-500)'
];

export default DashboardCadastros;
