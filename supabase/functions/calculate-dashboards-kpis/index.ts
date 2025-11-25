// Edge Function: calculate-dashboards-kpis
// Cálculo otimizado de KPIs do dashboard (chamado via webhook ou cron)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { empresa_id } = await req.json()

    // 1. Total de Cirurgias (mês atual)
    const { count: totalCirurgias } = await supabase
      .from('cirurgias')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresa_id)
      .gte('data', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    // 2. Estoque Crítico (< ponto reposição)
    const { data: produtosBaixo } = await supabase
      .from('produtos_opme')
      .select('id, nome, estoque(quantidade_disponivel), ponto_reposicao')
      .eq('empresa_id', empresa_id)

    const estoqueCritico = produtosBaixo?.filter(p => {
      const qtd = p.estoque?.reduce((sum, e) => sum + (e.quantidade_disponivel || 0), 0) || 0
      return qtd < (p.ponto_reposicao || 10)
    }).length || 0

    // 3. Receita do Mês
    const { data: faturamento } = await supabase
      .from('financeiro')
      .select('valor_total')
      .eq('empresa_id', empresa_id)
      .eq('tipo', 'receita')
      .gte('data', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const receitaMes = faturamento?.reduce((sum, f) => sum + (f.valor_total || 0), 0) || 0

    // 4. Compliance ANVISA (% de produtos conformes)
    const { data: produtos } = await supabase
      .from('produtos_opme')
      .select('registro_anvisa, validade_registro')
      .eq('empresa_id', empresa_id)

    const produtosConformes = produtos?.filter(p =>
      p.registro_anvisa && new Date(p.validade_registro) > new Date()
    ).length || 0
    const compliancePercent = produtos?.length ? (produtosConformes / produtos.length) * 100 : 100

    // Salvar KPIs em cache (materialized view ou tabela)
    await supabase.from('dashboard_kpis_cache').upsert({
      empresa_id,
      total_cirurgias: totalCirurgias || 0,
      estoque_critico: estoqueCritico,
      receita_mes: receitaMes,
      compliance_anvisa: compliancePercent,
      atualizado_em: new Date().toISOString(),
    })

    return new Response(JSON.stringify({
      success: true,
      kpis: {
        totalCirurgias,
        estoqueCritico,
        receitaMes,
        compliancePercent: compliancePercent.toFixed(1),
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

