/**
 * Dashboard de Cache - Visualização de Estatísticas
 * Componente para monitorar performance do cache Supabase
 * Mostra hit rate, consultas mais frequentes, economia
 */

import { useEffect, useState } from 'react';
import { BarChart, TrendingUp, Database, Zap, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCacheStats } from '@/hooks/useValidacao';

interface CacheStat {
  tipo: string;
  fonte: string;
  total_consultas: number;
  hit_rate: number;
  consultas_por_dia: number;
  mais_consultado: string;
}

export function DashboardCache() {
  const { stats, loading, fetchStats } = useCacheStats();
  const [periodo, setPeriodo] = useState(7); // 7 dias padrão
  const [totalConsultas, setTotalConsultas] = useState(0);
  const [hitRateGeral, setHitRateGeral] = useState(0);
  const [economiaEstimada, setEconomiaEstimada] = useState(0);

  // Carrega estatísticas ao montar
  useEffect(() => {
    fetchStats(undefined, periodo);
  }, [fetchStats, periodo]);

  // Calcula totais
  useEffect(() => {
    if (stats.length === 0) return;

    const total = stats.reduce((acc, stat) => acc + stat.total_consultas, 0);
    const hitRateMedia = stats.reduce((acc, stat) => acc + stat.hit_rate, 0) / stats.length;
    
    // Economia estimada (R$ 0,05 por consulta evitada)
    const consultasEvitadas = total * (hitRateMedia / 100);
    const economia = consultasEvitadas * 0.05;

    setTotalConsultas(total);
    setHitRateGeral(Math.round(hitRateMedia));
    setEconomiaEstimada(economia);
  }, [stats]);

  // Mapeia cores por tipo
  const getColorByType = (tipo: string): string => {
    const colors: Record<string, string> = {
      cep: 'bg-blue-500',
      cnpj: 'bg-green-500',
      cpf: 'bg-purple-500',
      crm: 'bg-orange-500',
      veiculo: 'bg-red-500',
      anvisa: 'bg-pink-500',
    };
    return colors[tipo.toLowerCase()] || 'bg-gray-500';
  };

  // Formata números grandes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="tracking-tight flex items-center gap-2 text-[0.813rem] font-bold">
          <Database className="h-8 w-8 text-primary" />
          Dashboard de Cache
        </h2>
        <p className="text-muted-foreground mt-2">
          Monitore a performance e economia do sistema de cache Supabase
        </p>
      </div>

      {/* Filtro de Período */}
      <div className="flex gap-2">
        {[7, 15, 30].map((days) => (
          <button
            key={days}
            onClick={() => setPeriodo(days)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodo === days
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            Últimos {days} dias
          </button>
        ))}
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Consultas */}
        <Card className="orx-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.813rem] font-medium">Total de Consultas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-[0.813rem] font-bold">{formatNumber(totalConsultas)}</div>
            <p className="text-muted-foreground text-[0.813rem]">
              Últimos {periodo} dias
            </p>
          </CardContent>
        </Card>

        {/* Hit Rate Geral */}
        <Card className="orx-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.813rem] font-medium">Hit Rate Geral</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-[0.813rem] font-bold">{hitRateGeral}%</div>
            <p className="text-muted-foreground text-[0.813rem]">
              {hitRateGeral >= 70 ? '🎉 Excelente!' : hitRateGeral >= 50 ? '✅ Bom' : '⚠️ Pode melhorar'}
            </p>
          </CardContent>
        </Card>

        {/* Economia Estimada */}
        <Card className="orx-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.813rem] font-medium">Economia Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-[0.813rem] font-bold">
              R$ {economiaEstimada.toFixed(2)}
            </div>
            <p className="text-muted-foreground text-[0.813rem]">
              Últimos {periodo} dias
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="orx-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.813rem] font-medium">Latência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-[0.813rem] font-bold">~50ms</div>
            <p className="text-muted-foreground text-[0.813rem]">
              10-20x mais rápido que API
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas por Tipo */}
      <Card className="orx-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Estatísticas por Tipo
          </CardTitle>
          <CardDescription>
            Detalhamento de consultas e hit rate por tipo de validação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : stats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma estatística disponível no período selecionado
            </div>
          ) : (
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div
                  key={`${stat.tipo}-${stat.fonte}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  {/* Tipo e Fonte */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getColorByType(stat.tipo)}`} />
                    <div>
                      <div className="capitalize font-medium">
                        {stat.tipo}
                        <Badge variant="outline" className="ml-2 text-[0.813rem]">
                          {stat.fonte}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-[0.813rem]">
                        Mais consultado: {stat.mais_consultado || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-6">
                    {/* Total de Consultas */}
                    <div className="text-right">
                      <div className="text-muted-foreground text-[0.813rem]">Consultas</div>
                      <div className="font-bold">{formatNumber(stat.total_consultas)}</div>
                    </div>

                    {/* Hit Rate */}
                    <div className="text-right">
                      <div className="text-muted-foreground text-[0.813rem]">Hit Rate</div>
                      <div className="text-green-600 font-bold">
                        {stat.hit_rate.toFixed(1)}%
                      </div>
                    </div>

                    {/* Consultas por Dia */}
                    <div className="text-right">
                      <div className="text-muted-foreground text-[0.813rem]">Por Dia</div>
                      <div className="font-bold">{stat.consultas_por_dia.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="orx-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">💡 Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[0.813rem]">
          {hitRateGeral < 50 && (
            <p>
              ⚠️ <strong>Hit rate abaixo de 50%:</strong> Considere aumentar o TTL do cache (atualmente 7-30 dias)
            </p>
          )}
          {totalConsultas > 10000 && (
            <p>
              🎉 <strong>Alto volume de consultas:</strong> Cache está economizando significativamente em custos de API
            </p>
          )}
          <p>
            ✅ <strong>Dica:</strong> Execute limpeza de cache expirado periodicamente usando{' '}
            <code className="bg-secondary px-1 py-0.5 rounded">cleanup_validacoes_cache()</code>
          </p>
          <p>
            📊 <strong>Análise:</strong> Consultas com hit rate alto indicam dados estáveis (CEP, CNPJ)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

