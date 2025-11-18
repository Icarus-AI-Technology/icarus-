// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/oraclusx-ds/Card'
import { Badge } from '../components/oraclusx-ds/Badge'
import { Package, TrendingUp, AlertTriangle, Calendar, DollarSign, Users } from 'lucide-react'

interface DashboardKPIs {
  totalEmpresas: number
  produtosAtivos: number
  estoqueTotal: number
  cirurgiasAgendadas: number
  faturamentoMensal: number
  medicosAtivos: number
  alertasEstoque: number
  naoConformidades: number
}

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalEmpresas: 0,
    produtosAtivos: 0,
    estoqueTotal: 0,
    cirurgiasAgendadas: 0,
    faturamentoMensal: 0,
    medicosAtivos: 0,
    alertasEstoque: 0,
    naoConformidades: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true)

        // Fetch empresas
        const { count: empresasCount } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true })
          .is('excluido_em', null)

        // Fetch produtos OPME ativos
        const { count: produtosCount } = await supabase
          .from('produtos_opme')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)
          .is('excluido_em', null)

        // Fetch estoque total
        const { data: estoqueData } = await supabase
          .from('estoque')
          .select('quantidade_disponivel')
          .is('excluido_em', null)

        const estoqueTotal = estoqueData?.reduce(
          (sum, item) => sum + (item.quantidade_disponivel || 0),
          0
        ) || 0

        // Fetch cirurgias agendadas
        const { count: cirurgiasCount } = await supabase
          .from('cirurgias')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'agendada')
          .is('excluido_em', null)

        // Fetch faturamento mensal (mês atual)
        const mesAtual = new Date()
        const primeiroDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
        const ultimoDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)

        const { data: faturamentoData } = await supabase
          .from('transacoes')
          .select('valor')
          .eq('tipo', 'receita')
          .eq('status', 'pago')
          .gte('data_pagamento', primeiroDiaMes.toISOString())
          .lte('data_pagamento', ultimoDiaMes.toISOString())
          .is('excluido_em', null)

        const faturamento = faturamentoData?.reduce(
          (sum, t) => sum + (parseFloat(t.valor as string) || 0),
          0
        ) || 0

        // Fetch médicos ativos
        const { count: medicosCount } = await supabase
          .from('medicos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')
          .is('excluido_em', null)

        // Fetch alertas de estoque
        const { count: alertasCount } = await supabase
          .from('estoque_alertas')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')
          .is('excluido_em', null)

        // Fetch não conformidades abertas
        const { count: naoConformidadesCount } = await supabase
          .from('nao_conformidades')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'aberta')
          .is('excluido_em', null)

        setKpis({
          totalEmpresas: empresasCount || 0,
          produtosAtivos: produtosCount || 0,
          estoqueTotal,
          cirurgiasAgendadas: cirurgiasCount || 0,
          faturamentoMensal: faturamento,
          medicosAtivos: medicosCount || 0,
          alertasEstoque: alertasCount || 0,
          naoConformidades: naoConformidadesCount || 0,
        })
      } catch (err) {
        console.error('Erro ao buscar KPIs:', err)
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 bg-destructive/10">
          <p className="text-destructive font-semibold">{error}</p>
        </Card>
      </div>
    )
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
        {/* Card: Empresas */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Empresas</p>
              <h3 className="text-3xl font-bold mt-2">{kpis.totalEmpresas}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Card: Produtos OPME */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produtos OPME Ativos</p>
              <h3 className="text-3xl font-bold mt-2">{kpis.produtosAtivos}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        {/* Card: Estoque Total */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Itens em Estoque</p>
              <h3 className="text-3xl font-bold mt-2">{kpis.estoqueTotal}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Card: Cirurgias Agendadas */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cirurgias Agendadas</p>
              <h3 className="text-3xl font-bold mt-2">{kpis.cirurgiasAgendadas}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        {/* Card: Faturamento Mensal */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Faturamento Mensal</p>
              <h3 className="text-3xl font-bold mt-2">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(kpis.faturamentoMensal)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        {/* Card: Médicos Ativos */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Médicos Ativos</p>
              <h3 className="text-3xl font-bold mt-2">{kpis.medicosAtivos}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-cyan-500" />
            </div>
          </div>
        </Card>

        {/* Card: Alertas de Estoque */}
        <Card className="p-6 hover:shadow-lg transition-shadow border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alertas de Estoque</p>
              <h3 className="text-3xl font-bold mt-2 text-orange-600">{kpis.alertasEstoque}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          {kpis.alertasEstoque > 0 && (
            <Badge variant="destructive" className="mt-2">
              Atenção Necessária
            </Badge>
          )}
        </Card>

        {/* Card: Não Conformidades */}
        <Card className="p-6 hover:shadow-lg transition-shadow border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
              <h3 className="text-3xl font-bold mt-2 text-red-600">{kpis.naoConformidades}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          {kpis.naoConformidades > 0 && (
            <Badge variant="destructive" className="mt-2">
              Ação Necessária
            </Badge>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left">
            <Package className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold">Gerenciar Estoque</h3>
            <p className="text-sm text-muted-foreground">Visualizar e atualizar inventário</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left">
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold">Agendar Cirurgia</h3>
            <p className="text-sm text-muted-foreground">Nova cirurgia no sistema</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left">
            <DollarSign className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold">Financeiro</h3>
            <p className="text-sm text-muted-foreground">Contas e transações</p>
          </button>
        </div>
      </Card>
    </div>
  )
}

