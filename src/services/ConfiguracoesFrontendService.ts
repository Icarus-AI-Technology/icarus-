/**
 * Serviço: Configurações Frontend Personalizáveis
 * Responsável por consumir a Edge Function "configuracoes"
 * para listar preferências e registrar eventos de UX.
 */

import { supabase } from '@/lib/supabase';

export type DispositivoPreferencia = 'desktop' | 'mobile' | 'tablet';

export interface PreferenciaUsuario {
  id: string;
  user_id: string;
  empresa_id: string;
  modulo_chave: string;
  submodulo_chave: string | null;
  dispositivo: DispositivoPreferencia;
  visivel: boolean;
  fixado: boolean;
  layout_config: Record<string, unknown>;
  filtros: Record<string, unknown>;
  ferramentas_habilitadas: Record<string, unknown>;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ListarPreferenciasParams {
  moduloChave?: string;
  submoduloChave?: string;
  dispositivo?: DispositivoPreferencia;
  limit?: number;
}

export interface RegistrarEventoParams {
  moduloChave: string;
  submoduloChave?: string | null;
  dispositivo?: DispositivoPreferencia;
  acao: string;
  detalhes?: Record<string, unknown>;
}

const SUPABASE_URL = (
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  ''
).replace(/\/$/, '');

const EDGE_BASE_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/configuracoes`
  : '';

async function obterToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error('Falha ao obter sessão do usuário.');
  }
  const token = data?.session?.access_token;
  if (!token) {
    throw new Error('Sessão do usuário não encontrada.');
  }
  return token;
}

async function chamarConfiguracoes<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!EDGE_BASE_URL) {
    throw new Error('VITE_SUPABASE_URL não configurada para chamar a função configuracoes.');
  }

  const token = await obterToken();
  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${EDGE_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const isJson = response.headers.get('Content-Type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const mensagem =
      (payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error?: string }).error
        : null) ?? 'Falha ao consumir a função configuracoes.';
    throw new Error(mensagem);
  }

  return (payload ?? {}) as T;
}

export async function listarPreferenciasUsuario(
  params: ListarPreferenciasParams = {},
): Promise<PreferenciaUsuario[]> {
  const searchParams = new URLSearchParams();
  if (params.moduloChave) searchParams.append('modulo_chave', params.moduloChave);
  if (params.submoduloChave) searchParams.append('submodulo_chave', params.submoduloChave);
  if (params.dispositivo) searchParams.append('dispositivo', params.dispositivo);
  if (params.limit) searchParams.append('limit', String(params.limit));

  const query = searchParams.toString();
  const endpoint = `/preferencias${query ? `?${query}` : ''}`;

  const data = await chamarConfiguracoes<{ preferencias?: PreferenciaUsuario[] }>(endpoint, {
    method: 'GET',
  });

  return data.preferencias ?? [];
}

export async function registrarEventoConfiguracoes(
  params: RegistrarEventoParams,
): Promise<void> {
  await chamarConfiguracoes('/eventos', {
    method: 'POST',
    body: JSON.stringify({
      modulo_chave: params.moduloChave,
      submodulo_chave: params.submoduloChave ?? null,
      dispositivo: params.dispositivo ?? 'desktop',
      acao: params.acao,
      detalhes: params.detalhes ?? {},
    }),
  });
}

