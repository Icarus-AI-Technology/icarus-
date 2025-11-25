import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface BehaviorProfile {
  usuario_id: string;
  total_atividades: number;
  total_erros: number;
  taxa_erro_geral: number;
  ultima_atividade: string;
  modulos_mais_usados: Record<string, number>;
}

interface SystemAlert {
  id: string;
  tipo: string;
  severidade: string;
  titulo: string;
  descricao: string;
  criado_em: string;
  resolvido: boolean;
}

interface AnomalousUser {
  usuario_id: string;
  anomalia: string;
  detalhes: string;
  severidade: string;
}

export const ObservabilityDashboard: React.FC = () => {
  const [behaviorProfiles, setBehaviorProfiles] = useState<BehaviorProfile[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalousUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profiles' | 'alerts' | 'anomalies'>('profiles');

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar perfis comportamentais
      const { data: profiles } = await supabase
        .from('user_behavior_profile')
        .select('*')
        .order('total_atividades', { ascending: false })
        .limit(20);

      // Carregar alertas não resolvidos
      const { data: alerts } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('resolvido', false)
        .order('criado_em', { ascending: false })
        .limit(10);

      // Detectar comportamentos anômalos
      const { data: anomalousUsers } = await supabase.rpc('detectar_comportamento_anomalo');

      setBehaviorProfiles(profiles || []);
      setSystemAlerts(alerts || []);
      setAnomalies(anomalousUsers || []);
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'critico':
        return 'text-red-600 bg-red-100';
      case 'urgente':
        return 'text-orange-600 bg-orange-100';
      case 'atencao':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await supabase.from('system_alerts').update({ resolvido: true }).eq('id', alertId);

      loadData();
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao resolver alerta:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="orx-text-3xl orx-orx-font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Observabilidade Comportamental
          </h1>
          <p className="text-gray-600 mt-2">
            Monitoramento em tempo real de atividades, alertas e anomalias
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-gray-600">Usuários Ativos</p>
                <p className="orx-text-2xl orx-orx-font-bold text-gray-900">
                  {behaviorProfiles.length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-gray-600">Alertas Pendentes</p>
                <p className="orx-text-2xl orx-orx-font-bold text-orange-600">
                  {systemAlerts.length}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-gray-600">Anomalias Detectadas</p>
                <p className="orx-text-2xl orx-orx-font-bold text-red-600">{anomalies.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="orx-text-sm text-gray-600">Taxa Média de Sucesso</p>
                <p className="orx-text-2xl orx-orx-font-bold text-green-600">
                  {behaviorProfiles.length > 0
                    ? Math.round(
                        (behaviorProfiles.reduce((sum, p) => sum + (1 - p.taxa_erro_geral), 0) /
                          behaviorProfiles.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profiles')}
                className={`px-6 py-4 orx-text-sm orx-orx-font-medium border-b-2 ${
                  activeTab === 'profiles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Perfis Comportamentais
                </div>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-4 orx-text-sm orx-orx-font-medium border-b-2 ${
                  activeTab === 'alerts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas ({systemAlerts.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('anomalies')}
                className={`px-6 py-4 orx-text-sm orx-orx-font-medium border-b-2 ${
                  activeTab === 'anomalies'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Anomalias ({anomalies.length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Perfis Comportamentais */}
            {activeTab === 'profiles' && (
              <div className="space-y-4">
                {behaviorProfiles.map((profile) => (
                  <div
                    key={profile.usuario_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="orx-orx-font-semibold text-gray-900">
                            {profile.usuario_id.substring(0, 8)}
                          </h3>
                          <p className="orx-text-sm text-gray-500">
                            Última atividade:{' '}
                            {new Date(profile.ultima_atividade).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="orx-text-sm text-gray-600">Taxa de Erro</p>
                        <p
                          className={`orx-text-lg orx-orx-font-bold ${
                            profile.taxa_erro_geral > 0.3 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {(profile.taxa_erro_geral * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 orx-text-sm">
                      <div>
                        <p className="text-gray-600">Total de Atividades</p>
                        <p className="orx-orx-font-semibold text-gray-900">
                          {profile.total_atividades}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total de Erros</p>
                        <p className="orx-orx-font-semibold text-red-600">{profile.total_erros}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Módulos Usados</p>
                        <p className="orx-orx-font-semibold text-blue-600">
                          {profile.modulos_mais_usados
                            ? Object.keys(profile.modulos_mais_usados).length
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alertas */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <h3 className="orx-orx-font-semibold text-gray-900">{alert.titulo}</h3>
                          <p className="orx-text-sm text-gray-600 mt-1">{alert.descricao}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full orx-text-xs orx-orx-font-medium ${getSeverityColor(alert.severidade)}`}
                      >
                        {alert.severidade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="orx-text-xs text-gray-500">
                        {new Date(alert.criado_em).toLocaleString('pt-BR')}
                      </p>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-4 py-2 bg-green-600 text-white orx-text-sm rounded-lg hover:bg-green-700 transition"
                      >
                        Resolver
                      </button>
                    </div>
                  </div>
                ))}
                {systemAlerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <p>Nenhum alerta pendente!</p>
                  </div>
                )}
              </div>
            )}

            {/* Anomalias */}
            {activeTab === 'anomalies' && (
              <div className="space-y-4">
                {anomalies.map((anomaly, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="orx-orx-font-semibold text-gray-900 mb-1">
                          {anomaly.anomalia.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <p className="orx-text-sm text-gray-700">{anomaly.detalhes}</p>
                        <p className="orx-text-xs text-gray-500 mt-2">
                          Usuário: {anomaly.usuario_id.substring(0, 8)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full orx-text-xs orx-orx-font-medium ${getSeverityColor(anomaly.severidade)}`}
                      >
                        {anomaly.severidade}
                      </span>
                    </div>
                  </div>
                ))}
                {anomalies.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <p>Nenhuma anomalia detectada!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservabilityDashboard;
