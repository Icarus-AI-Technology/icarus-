/**
 * Módulo: Configurações Sistema IA
 * Central de configurações com IA
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/oraclusx-ds';
import {
  listarPreferenciasUsuario,
  registrarEventoConfiguracoes,
  type PreferenciaUsuario,
} from '@/services/ConfiguracoesFrontendService';
import { Settings, Shield, Bell, Users, TrendingUp, CheckCircle } from 'lucide-react';

export const ConfiguracoesSistema: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('geral');
  const [preferencias, setPreferencias] = useState<PreferenciaUsuario[]>([]);
  const [preferenciasCarregando, setPreferenciasCarregando] = useState(true);
  const [preferenciasErro, setPreferenciasErro] = useState<string | null>(null);

  const categories = [
    { id: 'geral', label: 'Geral', icon: Settings, count: 24, trend: 'configs' },
    { id: 'seguranca', label: 'Segurança', icon: Shield, count: 12, trend: 'políticas' },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, count: 8, trend: 'canais' },
    { id: 'usuarios', label: 'Usuários', icon: Users, count: 847, trend: 'ativos' },
  ];

  const estatisticasPreferencias = useMemo(() => {
    const total = preferencias.length;
    const visiveis = preferencias.filter((pref) => pref.visivel).length;
    const fixadas = preferencias.filter((pref) => pref.fixado).length;
    const porDispositivo = preferencias.reduce<Record<string, number>>((acc, pref) => {
      acc[pref.dispositivo] = (acc[pref.dispositivo] ?? 0) + 1;
      return acc;
    }, {});
    return {
      total,
      visiveis,
      fixadas,
      destaqueDispositivo: Object.entries(porDispositivo)
        .sort(([, a], [, b]) => b - a)[0]?.[0],
    };
  }, [preferencias]);

  const kpis = [
    {
      title: 'Configs Ativas',
      value: estatisticasPreferencias.visiveis || 0,
      trend: 'visíveis',
      icon: Settings,
      color: 'blue',
    },
    {
      title: 'Preferências Fixadas',
      value: estatisticasPreferencias.fixadas || 0,
      trend: 'favoritos',
      icon: Shield,
      color: 'green',
    },
    {
      title: 'Dispositivo Líder',
      value: estatisticasPreferencias.destaqueDispositivo ?? 'desktop',
      trend: 'uso atual',
      icon: TrendingUp,
      color: 'indigo',
    },
    { title: 'Uptime', value: '99.97%', trend: '30 dias', icon: CheckCircle, color: 'yellow' },
  ];

  useEffect(() => {
    let ativo = true;
    const carregarPreferencias = async () => {
      setPreferenciasCarregando(true);
      try {
        const resultado = await listarPreferenciasUsuario({
          moduloChave: 'configuracoes',
          limit: 200,
        });
        if (!ativo) return;
        setPreferencias(resultado);
        setPreferenciasErro(null);
        void registrarEventoConfiguracoes({
          moduloChave: 'configuracoes',
          acao: 'carregar_preferencias',
          detalhes: { total_preferencias: resultado.length },
        });
      } catch (error) {
        if (!ativo) return;
        const mensagem = error instanceof Error ? error.message : 'Falha ao carregar preferências.';
        setPreferenciasErro(mensagem);
      } finally {
        if (ativo) {
          setPreferenciasCarregando(false);
        }
      }
    };

    carregarPreferencias();
    return () => {
      ativo = false;
    };
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    void registrarEventoConfiguracoes({
      moduloChave: 'configuracoes',
      submoduloChave: categoryId,
      acao: 'selecionar_categoria',
      detalhes: { origem: 'configuracoes_sistema' },
    });
  };

  const preferenciasRecentes = preferencias.slice(0, 6);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-heading-lg font-display text-primary dark:text-gray-100 mb-2">
              Configurações Sistema IA
            </h1>
            <p className="text-secondary dark:text-muted">
              Central de configurações e preferências
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full">
            <Settings className="text-inverse animate-spin-slow" size={20} />
            <div className="text-left">
              <p className="text-inverse text-body-sm orx-orx-font-medium">IA Otimização</p>
              <p className="text-indigo-100 text-body-xs">98.4% ativa</p>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`relative p-4 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-inverse shadow-lg scale-105' : 'bg-surface dark:bg-card text-secondary dark:text-muted hover:shadow-md hover:scale-102'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${isActive ? 'bg-surface/20' : 'bg-surface dark:bg-muted'}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-body-xs mb-1 orx-orx-font-medium">{category.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-heading font-display text-[0.813rem]">
                          {category.count}
                        </span>
                        <span
                          className={`text-body-xs ${isActive ? 'text-inverse/80' : 'text-secondary dark:text-muted'}`}
                        >
                          {category.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClasses = {
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-accent dark:text-accent-light',
              green: 'bg-success/10 dark:bg-green-900/30 text-success dark:text-green-400',
              indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-primary dark:text-indigo-400',
              yellow: 'bg-warning/10 dark:bg-yellow-900/30 text-warning dark:text-yellow-400',
            };
            return (
              <Card key={index} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-sm text-secondary dark:text-muted">{kpi.title}</p>
                    <p className="text-heading font-display text-primary dark:text-gray-100 mt-1">
                      {kpi.value}
                    </p>
                    <Badge variant="default" size="sm" className="mt-2">
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]}`}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Personalizadas</CardTitle>
              <CardDescription>
                {preferenciasCarregando
                  ? 'Sincronizando preferências do usuário...'
                  : `${estatisticasPreferencias.total ?? 0} registro(s) encontrado(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preferenciasErro && (
                <p className="text-sm text-red-500 mb-2">{preferenciasErro}</p>
              )}
              {!preferenciasCarregando && preferenciasErro === null && preferenciasRecentes.length === 0 && (
                <p className="text-sm text-secondary dark:text-muted">
                  Nenhuma preferência personalizada foi registrada ainda.
                </p>
              )}
              <div className="space-y-3">
                {preferenciasCarregando &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="h-16 rounded-lg bg-surface/60 dark:bg-muted animate-pulse"
                    />
                  ))}
                {!preferenciasCarregando &&
                  preferenciasRecentes.map((pref) => (
                    <div
                      key={pref.id}
                      className="p-3 rounded-lg border border-surface dark:border-muted bg-surface dark:bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-body-sm text-primary dark:text-gray-100 font-medium">
                            {pref.submodulo_chave ?? pref.modulo_chave}
                          </p>
                          <p className="text-body-xs text-secondary dark:text-muted">
                            {pref.modulo_chave} • {pref.visivel ? 'Visível' : 'Oculto'}
                          </p>
                        </div>
                        <Badge variant="default" size="sm">
                          {pref.dispositivo}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-secondary dark:text-muted">
                        <span>{pref.fixado ? 'Fixado' : 'Não fixado'}</span>
                        <span>
                          Atualizado em{' '}
                          {pref.atualizado_em
                            ? new Date(pref.atualizado_em).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Preferências do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Tema escuro/claro', 'Idioma do sistema', 'Fuso horário', 'Formato de data'].map(
                  (config, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-surface dark:bg-card rounded-lg"
                    >
                      <span className="text-body-sm text-primary dark:text-gray-100">{config}</span>
                      <CheckCircle className="text-success" size={18} />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Políticas e proteções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  '2FA obrigatório',
                  'Firewall ativo',
                  'Backup automático',
                  'Criptografia end-to-end',
                ].map((sec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-surface dark:bg-card rounded-lg"
                  >
                    <span className="text-body-sm text-primary dark:text-gray-100">{sec}</span>
                    <Shield className="text-success" size={18} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesSistema;
