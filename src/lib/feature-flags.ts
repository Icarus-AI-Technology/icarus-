/**
 * 🎛️ FEATURE FLAGS — Sistema de A/B Testing e Rollout Gradual
 *
 * Permite ativar/desativar features em produção sem deploy,
 * com rollout gradual por porcentagem ou segmentos de usuários.
 *
 * @version 1.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import supabaseClient from '@/lib/supabase';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const isBrowser = typeof window !== 'undefined';

const runtimeEnv: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

const viteEnv: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env
    ? ((import.meta as Record<string, unknown>).env as Record<string, string | undefined>)
    : {};

const getEnvVar = (keys: string[], fallback = ''): string => {
  for (const key of keys) {
    if (runtimeEnv[key]) return runtimeEnv[key] as string;
    if (viteEnv[key]) return viteEnv[key] as string;
  }
  return fallback;
};

const featureFlagSupabaseUrl = getEnvVar(
  ['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_URL'],
  ''
);
const featureFlagServiceKey = getEnvVar(
  ['SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY'],
  ''
);

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
};

const featureFlagServiceClient =
  featureFlagSupabaseUrl && featureFlagServiceKey
    ? createClient(featureFlagSupabaseUrl, featureFlagServiceKey, {
        auth: {
          storageKey: 'icarus-feature-flags-service',
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          multiTab: false,
          storage: isBrowser ? window.localStorage : createMemoryStorage(),
        },
      })
    : null;

// ============================================
// TIPOS
// ============================================

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  userSegments?: string[]; // ['admin', 'beta_testers', 'enterprise']
  description?: string;
}

export interface FeatureFlagConfig {
  // Substituições OSS
  ollama_enabled: FeatureFlag;
  meilisearch_enabled: FeatureFlag;
  tesseract_ocr: FeatureFlag;
  posthog_analytics: FeatureFlag;

  // Tutores IA por módulo (Onda 1 - Compliance)
  tutor_pgr: FeatureFlag;
  tutor_anvisa_compliance: FeatureFlag;
  tutor_qualidade: FeatureFlag;
  tutor_regulamentacoes: FeatureFlag;

  // Tutores IA (Onda 2 - Financeiro)
  tutor_financeiro_avancado: FeatureFlag;
  tutor_auditor_bancario: FeatureFlag;
  tutor_negociador_tarifas: FeatureFlag;
  tutor_score_credito: FeatureFlag;
  tutor_faturamento: FeatureFlag;
  tutor_plano_contas: FeatureFlag;
  tutor_fiscal_lucro_real: FeatureFlag;
  tutor_auditor_contabil: FeatureFlag;
  tutor_dre_inteligente: FeatureFlag;

  // Tutores IA (Onda 3 - Operacional)
  tutor_cirurgias: FeatureFlag;
  tutor_estoque: FeatureFlag;
  tutor_compras: FeatureFlag;
  tutor_vendas: FeatureFlag;
  tutor_logistica: FeatureFlag;

  // Tutores IA (Onda 4 - Gestão)
  tutor_bi_analytics: FeatureFlag;
  tutor_cadastros: FeatureFlag;
  tutor_rh: FeatureFlag;

  // Features avançadas
  auto_compliance_check: FeatureFlag;
  legislacao_scraper: FeatureFlag;
  document_upload_analysis: FeatureFlag;
  smart_tarifas_negotiation: FeatureFlag;
  dre_predictive_analytics: FeatureFlag;
}

// ============================================
// CONFIGURAÇÃO PADRÃO
// ============================================

const DEFAULT_FLAGS: FeatureFlagConfig = {
  // Substituições OSS (desabilitadas por padrão, rollout gradual)
  ollama_enabled: {
    name: 'ollama_enabled',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Usar Ollama local ao invés de OpenAI para Tutores IA',
  },
  meilisearch_enabled: {
    name: 'meilisearch_enabled',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Usar Meilisearch OSS para busca interna',
  },
  tesseract_ocr: {
    name: 'tesseract_ocr',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Usar Tesseract local para OCR de documentos',
  },
  posthog_analytics: {
    name: 'posthog_analytics',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Usar PostHog OSS ao invés de Google Analytics/Mixpanel',
  },

  // Tutores IA - Onda 1 (Compliance) - Início gradual
  tutor_pgr: {
    name: 'tutor_pgr',
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['admin', 'beta_testers'],
    description: 'Tutor IA para Programa de Gerenciamento de Riscos (PGR)',
  },
  tutor_anvisa_compliance: {
    name: 'tutor_anvisa_compliance',
    enabled: false,
    rolloutPercentage: 0,
    userSegments: ['admin', 'beta_testers'],
    description: 'Tutor IA para Compliance ANVISA',
  },
  tutor_qualidade: {
    name: 'tutor_qualidade',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Gestão da Qualidade',
  },
  tutor_regulamentacoes: {
    name: 'tutor_regulamentacoes',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para acompanhamento de regulamentações',
  },

  // Tutores IA - Onda 2 (Financeiro) - Desabilitados inicialmente
  tutor_financeiro_avancado: {
    name: 'tutor_financeiro_avancado',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Gestão Financeira Avançada',
  },
  tutor_auditor_bancario: {
    name: 'tutor_auditor_bancario',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Auditor IA de Contas Bancárias (conciliação, tarifas)',
  },
  tutor_negociador_tarifas: {
    name: 'tutor_negociador_tarifas',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Negociador IA de tarifas bancárias',
  },
  tutor_score_credito: {
    name: 'tutor_score_credito',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Consultor IA de Score de Crédito',
  },
  tutor_faturamento: {
    name: 'tutor_faturamento',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Faturamento e Cobrança',
  },
  tutor_plano_contas: {
    name: 'tutor_plano_contas',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Gestão do Plano de Contas',
  },
  tutor_fiscal_lucro_real: {
    name: 'tutor_fiscal_lucro_real',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Especialista IA em Lucro Real',
  },
  tutor_auditor_contabil: {
    name: 'tutor_auditor_contabil',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Auditor Contábil IA (isenções, compliance)',
  },
  tutor_dre_inteligente: {
    name: 'tutor_dre_inteligente',
    enabled: false,
    rolloutPercentage: 0,
    description: 'DRE Inteligente com análises preditivas',
  },

  // Tutores IA - Onda 3 (Operacional)
  tutor_cirurgias: {
    name: 'tutor_cirurgias',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Gestão de Cirurgias',
  },
  tutor_estoque: {
    name: 'tutor_estoque',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Gestão de Estoque',
  },
  tutor_compras: {
    name: 'tutor_compras',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Compras e Fornecedores',
  },
  tutor_vendas: {
    name: 'tutor_vendas',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Vendas e CRM',
  },
  tutor_logistica: {
    name: 'tutor_logistica',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Logística e Rotas',
  },

  // Tutores IA - Onda 4 (Gestão)
  tutor_bi_analytics: {
    name: 'tutor_bi_analytics',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para BI e Analytics',
  },
  tutor_cadastros: {
    name: 'tutor_cadastros',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Gestão de Cadastros',
  },
  tutor_rh: {
    name: 'tutor_rh',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Tutor IA para Recursos Humanos',
  },

  // Features avançadas
  auto_compliance_check: {
    name: 'auto_compliance_check',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Verificação automática de compliance em uploads',
  },
  legislacao_scraper: {
    name: 'legislacao_scraper',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Scraper automático de mudanças legislativas (ANVISA/RFB)',
  },
  document_upload_analysis: {
    name: 'document_upload_analysis',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Análise automática de documentos uploadados',
  },
  smart_tarifas_negotiation: {
    name: 'smart_tarifas_negotiation',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Negociação inteligente de tarifas bancárias',
  },
  dre_predictive_analytics: {
    name: 'dre_predictive_analytics',
    enabled: false,
    rolloutPercentage: 0,
    description: 'Analytics preditivos no DRE',
  },
};

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================

/**
 * Hash simples de string para número (0-99)
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Verifica se usuário está no segmento
 */
function isInSegment(userRole: string | undefined, segments?: string[]): boolean {
  if (!segments || segments.length === 0) return true;
  if (!userRole) return false;
  return segments.includes(userRole);
}

// ============================================
// HOOK: useFeatureFlag
// ============================================

export function useFeatureFlag(flagName: keyof FeatureFlagConfig): boolean {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFlag() {
      try {
        const supabase = supabaseClient;
        if (!supabase) {
          setIsEnabled(Boolean(DEFAULT_FLAGS[flagName]?.enabled));
          setLoading(false);
          return;
        }

        // 1. Buscar flag do banco (se configurado remotamente)
        const { data: remoteFlag } = await supabase
          .from('feature_flags')
          .select('*')
          .eq('name', flagName)
          .single();

        const flag = remoteFlag || DEFAULT_FLAGS[flagName];

        if (!flag || !flag.enabled) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        // 2. Verificar usuário atual
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        // 3. Admin sempre tem acesso
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsEnabled(true);
          setLoading(false);
          return;
        }

        // 4. Verificar segmentos
        if (!isInSegment(profile?.role, flag.userSegments)) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        // 5. Rollout gradual (consistente por usuário)
        if (flag.rolloutPercentage === 100) {
          setIsEnabled(true);
        } else if (flag.rolloutPercentage === 0) {
          setIsEnabled(false);
        } else {
          const userHash = hashCode(user.id);
          setIsEnabled(userHash < flag.rolloutPercentage);
        }
      } catch (error) {
        const err = error as Error;
        console.error('Erro ao verificar feature flag:', err);
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    }

    checkFlag();
  }, [flagName]);

  return isEnabled;
}

// ============================================
// ADMIN: Gerenciamento de Flags
// ============================================

export async function setFeatureFlag(
  flagName: keyof FeatureFlagConfig,
  updates: Partial<FeatureFlag>
): Promise<void> {
  if (!featureFlagServiceClient) {
    console.warn(
      '[FeatureFlags] Cliente com chave service role não configurado. Defina SUPABASE_SERVICE_ROLE_KEY.'
  );
    return;
  }

  await featureFlagServiceClient.from('feature_flags').upsert({
    name: flagName,
    ...updates,
    atualizado_em: new Date().toISOString(),
  });
}

export async function getFeatureFlags(): Promise<FeatureFlagConfig> {
  const client = featureFlagServiceClient ?? supabaseClient;
  if (!client) {
    return DEFAULT_FLAGS;
  }

  const { data } = await client.from('feature_flags').select('*');

  if (!data) return DEFAULT_FLAGS;

  // Merge com defaults
  const flags = { ...DEFAULT_FLAGS };
  data.forEach((remoteFlag) => {
    if (remoteFlag.name in flags) {
      flags[remoteFlag.name as keyof FeatureFlagConfig] = {
        name: remoteFlag.name,
        enabled: remoteFlag.enabled,
        rolloutPercentage: remoteFlag.rollout_percentage,
        userSegments: remoteFlag.user_segments,
        description: remoteFlag.description,
      };
    }
  });

  return flags;
}

export { DEFAULT_FLAGS };
