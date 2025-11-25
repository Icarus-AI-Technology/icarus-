// src/pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { legacySupabase as supabase } from '../lib/legacySupabase';
import { Card } from '../components/oraclusx-ds/Card';
import { Badge } from '../components/oraclusx-ds/Badge';
import { CardKpi } from '../components/oraclusx-ds/CardKpi';
import { MiniCard } from '../components/oraclusx-ds/MiniCard';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  ClipboardList,
} from 'lucide-react';

interface DashboardKPIs {
  totalEmpresas: number;
  produtosAtivos: number;
  estoqueTotal: number;
  cirurgiasAgendadas: number;
  faturamentoMensal: number;
  medicosAtivos: number;
  alertasEstoque: number;
  naoConformidades: number;
}

export default function DashboardPage() {
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 0,
      }),
    []
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }),
    []
  );

  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalEmpresas: 0,
    produtosAtivos: 0,
    estoqueTotal: 0,
    cirurgiasAgendadas: 0,
    faturamentoMensal: 0,
    medicosAtivos: 0,
    alertasEstoque: 0,
    naoConformidades: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);

        // Fetch empresas
        const { count: empresasCount } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true })
          .is('excluido_em', null);

        // Fetch produtos OPME ativos
        const { count: produtosCount } = await supabase
          .from('produtos_opme')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)
          .is('excluido_em', null);

        // Fetch estoque total
        const { data: estoqueData } = await supabase
          .from('estoque')
          .select('quantidade_disponivel')
          .is('excluido_em', null);

        const estoqueTotal =
          estoqueData?.reduce((sum, item) => sum + (item.quantidade_disponivel || 0), 0) || 0;

        // Fetch cirurgias agendadas
        const { count: cirurgiasCount } = await supabase
          .from('cirurgias')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'agendada')
          .is('excluido_em', null);

        // Fetch faturamento mensal (mês atual)
        const mesAtual = new Date();
        const primeiroDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
        const ultimoDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

        const { data: transacoes } = await supabase
          .from('transacoes')
          .select('valor')
          .select('tipo, status, valor')
          .gte('data_pagamento', primeiroDiaMes.toISOString())
          .lte('data_pagamento', ultimoDiaMes.toISOString())
          .is('excluido_em', null);

        const receitas =
          transacoes
            ?.filter((t) => t.tipo === 'receita' && t.status === 'paga')
            .reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
        const despesas =
          transacoes
            ?.filter((t) => t.tipo === 'despesa' && t.status === 'paga')
            .reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
        const faturamento = receitas - despesas;

        // Fetch médicos ativos
        const { count: medicosCount } = await supabase
          .from('medicos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')
          .is('excluido_em', null);

        // Fetch alertas de estoque
        const { count: alertasCount } = await supabase
          .from('estoque_alertas')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')
          .is('excluido_em', null);

        // Fetch não conformidades abertas
        const { count: naoConformidadesCount } = await supabase
          .from('nao_conformidades')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'aberta')
          .is('excluido_em', null);

        setKpis({
          totalEmpresas: empresasCount || 0,
          produtosAtivos: produtosCount || 0,
          estoqueTotal,
          cirurgiasAgendadas: cirurgiasCount || 0,
          faturamentoMensal: faturamento,
          medicosAtivos: medicosCount || 0,
          alertasEstoque: alertasCount || 0,
          naoConformidades: naoConformidadesCount || 0,
        });
      } catch (err) {
        console.error('Erro ao buscar KPIs:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 bg-destructive/10">
          <p className="text-destructive font-semibold">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard ICARUS</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          Sistema Operacional ✅
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'empresas',
            label: 'Empresas',
            value: numberFormatter.format(kpis.totalEmpresas),
            icon: Users,
            tone: 'info' as const,
          },
          {
            id: 'produtos',
            label: 'Produtos OPME Ativos',
            value: numberFormatter.format(kpis.produtosAtivos),
            icon: Package,
            tone: 'primary' as const,
          },
          {
            id: 'estoque',
            label: 'Itens em Estoque',
            value: numberFormatter.format(kpis.estoqueTotal),
            icon: TrendingUp,
            tone: 'success' as const,
          },
          {
            id: 'cirurgias',
            label: 'Cirurgias Agendadas',
            value: numberFormatter.format(kpis.cirurgiasAgendadas),
            icon: Calendar,
            tone: 'info' as const,
          },
          {
            id: 'faturamento',
            label: 'Faturamento Mensal',
            value: currencyFormatter.format(kpis.faturamentoMensal),
            icon: DollarSign,
            tone: 'success' as const,
          },
          {
            id: 'medicos',
            label: 'Médicos Ativos',
            value: numberFormatter.format(kpis.medicosAtivos),
            icon: Users,
            tone: 'primary' as const,
          },
          {
            id: 'alertas',
            label: 'Alertas de Estoque',
            value: numberFormatter.format(kpis.alertasEstoque),
            icon: AlertTriangle,
            tone: 'warning' as const,
            badge: kpis.alertasEstoque > 0 ? 'Atenção Necessária' : undefined,
          },
          {
            id: 'conformidades',
            label: 'Não Conformidades',
            value: numberFormatter.format(kpis.naoConformidades),
            icon: AlertTriangle,
            tone: 'danger' as const,
            badge: kpis.naoConformidades > 0 ? 'Ação Necessária' : undefined,
          },
        ].map((card) => (
          <div key={card.id} className="space-y-2">
            <CardKpi
              label={card.label}
              value={card.value}
              icon={card.icon}
              tone={card.tone}
              className="ic-card-neumo"
            />
            {card.badge && (
              <Badge
                variant={card.id === 'conformidades' ? 'error' : 'warning'}
                className="inline-flex"
              >
                {card.badge}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Gerenciar Estoque',
              hint: 'Visualizar e atualizar inventário',
              icon: Package,
              variant: 'info' as const,
            },
            {
              title: 'Agendar Cirurgia',
              hint: 'Nova cirurgia no sistema',
              icon: Calendar,
              variant: 'info' as const,
            },
            {
              title: 'Financeiro',
              hint: 'Contas e transações',
              icon: DollarSign,
              variant: 'success' as const,
            },
            {
              title: 'Compliance',
              hint: 'Checklist e alertas regulatórios',
              icon: ClipboardList,
              variant: 'warning' as const,
            },
            {
              title: 'Indicadores Globais',
              hint: 'Comparativos de KPIs executivos',
              icon: TrendingUp,
              variant: 'info' as const,
            },
            {
              title: 'Equipes Médicas',
              hint: 'Status e escalas atualizadas',
              icon: Users,
              variant: 'default' as const,
            },
          ].map((action) => (
            <MiniCard
              key={action.title}
              title={action.title}
              value="Acessar"
              hint={action.hint}
              icon={action.icon}
              variant={action.variant}
              className="ic-card-neumo"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
