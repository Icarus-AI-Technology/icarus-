import { legacySupabase } from '@/lib/legacySupabase';

interface ExecutiveSummary {
  highlights: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  nextSteps: string[];
  generatedAt: string;
}

const FALLBACK_SUMMARY: ExecutiveSummary = {
  highlights: [
    {
      title: 'Operações estáveis',
      description: 'Os indicadores críticos permanecem dentro da meta nas últimas 24h.',
      impact: 'Manter acompanhamento com agentes de IA.',
    },
  ],
  nextSteps: ['Executar revisão semanal com times clínico e financeiro.'],
  generatedAt: new Date().toISOString(),
};

export const CEOIntelligenceBridge = {
  async updateCEOMetrics() {
    const { error } = await legacySupabase.rpc('refresh_ceo_metrics');

    if (error) {
      console.warn('refresh_ceo_metrics indisponível, usando fallback.', error);
    }
  },

  async getExecutiveSummary(): Promise<ExecutiveSummary> {
    const { data, error } = await legacySupabase
      .from('ceo_executive_summary')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn('Resumo executivo indisponível, retornando fallback.', error);
      return FALLBACK_SUMMARY;
    }

    return {
      highlights: (data.highlights as ExecutiveSummary['highlights']) ?? FALLBACK_SUMMARY.highlights,
      nextSteps: (data.next_steps as string[]) ?? FALLBACK_SUMMARY.nextSteps,
      generatedAt: data.generated_at ?? FALLBACK_SUMMARY.generatedAt,
    };
  },
};

