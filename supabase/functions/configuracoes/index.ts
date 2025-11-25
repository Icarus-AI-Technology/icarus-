// Edge Function: configuracoes
// Rotas públicas (com JWT do usuário):
//   GET    /configuracoes/bootstrap
//   GET    /configuracoes/modulos
//   GET    /configuracoes/flags
//   GET    /configuracoes/eventos
//   GET    /configuracoes/preferencias
//   POST   /configuracoes/usuario
//   POST   /configuracoes/eventos
//   DELETE /configuracoes/usuario
//
// Rotas administrativas (header x-service-key):
//   POST   /configuracoes/admin/modulo
//   POST   /configuracoes/admin/submodulo
//   POST   /configuracoes/admin/ferramenta

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const UUID_EMPRESA_GLOBAL = '00000000-0000-0000-0000-000000000000'
const EVENTOS_LIMIT_DEFAULT = 50
const EVENTOS_LIMIT_MAX = 100
const PREFERENCIAS_LIMIT_DEFAULT = 100
const PREFERENCIAS_LIMIT_MAX = 500

const adminClient = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null

interface PreferenciaPayload {
  modulo_chave: string
  submodulo_chave?: string | null
  visivel?: boolean
  fixado?: boolean
  dispositivo?: 'desktop' | 'mobile' | 'tablet'
  layout_config?: Json
  filtros?: Json
  ferramentas_habilitadas?: Json
}

interface EventoManualPayload {
  modulo_chave: string
  submodulo_chave?: string | null
  dispositivo?: 'desktop' | 'mobile' | 'tablet'
  acao: string
  detalhes?: Json
}

interface AdminModuloPayload {
  empresa_id?: string | null
  chave: string
  nome: string
  descricao?: string | null
  icone?: string | null
  metadados?: Json
  ativo?: boolean
  ordem?: number
}

interface AdminSubmoduloPayload {
  empresa_id?: string | null
  modulo_chave: string
  chave: string
  nome: string
  descricao?: string | null
  ordem?: number
  ativo?: boolean
}

interface AdminFerramentaPayload {
  empresa_id?: string | null
  modulo_chave: string
  submodulo_chave?: string | null
  chave: string
  nome: string
  icone?: string | null
  tipo?: string | null
  parametros?: Json
  enriquecimentos?: Json
  ativo?: boolean
}

const jsonHeaders = { 'Content-Type': 'application/json' }
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-key',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const isServiceRequest = checkServiceRequest(req)
  const authHeader = req.headers.get('Authorization')
  const hasUserToken = Boolean(authHeader?.startsWith('Bearer '))
  const token = hasUserToken ? authHeader!.replace('Bearer ', '') : null
  const userId = token ? decodeUserId(token) : null

  if (!isServiceRequest && (!hasUserToken || !userId)) {
    return jsonResponse({ error: 'Authorization Bearer token é obrigatório' }, 401)
  }

  const client = hasUserToken
    ? createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: authHeader! } } },
      )
    : null

  const url = new URL(req.url)
  const pathname = url.pathname.replace(/\/$/, '')

  try {
    // ---------------------- ROTAS ADMINISTRATIVAS ---------------------------
    if (req.method === 'POST' && pathname.endsWith('/admin/modulo')) {
      const guard = ensureServiceAccess(isServiceRequest)
      if (guard) return guard
      const payload = (await req.json()) as AdminModuloPayload
      return await handleAdminModulo(payload)
    }

    if (req.method === 'POST' && pathname.endsWith('/admin/submodulo')) {
      const guard = ensureServiceAccess(isServiceRequest)
      if (guard) return guard
      const payload = (await req.json()) as AdminSubmoduloPayload
      return await handleAdminSubmodulo(payload)
    }

    if (req.method === 'POST' && pathname.endsWith('/admin/ferramenta')) {
      const guard = ensureServiceAccess(isServiceRequest)
      if (guard) return guard
      const payload = (await req.json()) as AdminFerramentaPayload
      return await handleAdminFerramenta(payload)
    }

    // ---------------------- ROTAS DOS USUÁRIOS -----------------------------
    if (!client || !userId) {
      return jsonResponse({ error: 'Sessão do usuário não encontrada' }, 401)
    }

    if (req.method === 'GET' && pathname.endsWith('/bootstrap')) {
      return await handleBootstrap(client, userId)
    }

    if (req.method === 'GET' && pathname.endsWith('/modulos')) {
      return await handleModulos(client)
    }

    if (req.method === 'GET' && pathname.endsWith('/flags')) {
      return await handleFlags(client)
    }

    if (req.method === 'GET' && pathname.endsWith('/preferencias')) {
      return await handlePreferencias(client, userId, url.searchParams)
    }

    if (req.method === 'GET' && pathname.endsWith('/eventos')) {
      const limit = clampLimit(Number(url.searchParams.get('limit')) || EVENTOS_LIMIT_DEFAULT)
      return await handleEventos(client, limit)
    }

    if (req.method === 'POST' && pathname.endsWith('/eventos')) {
      const payload = (await req.json()) as EventoManualPayload
      return await handleRegistrarEventoManual(client, userId, payload)
    }

    if (req.method === 'POST' && pathname.endsWith('/usuario')) {
      const payload = (await req.json()) as PreferenciaPayload
      return await handleSalvarPreferencias(client, userId, payload)
    }

    if (req.method === 'DELETE' && pathname.endsWith('/usuario')) {
      const moduloChave = url.searchParams.get('modulo_chave')
      const submoduloChave = url.searchParams.get('submodulo_chave')
      const dispositivo = (url.searchParams.get('dispositivo') ?? 'desktop') as
        | 'desktop'
        | 'mobile'
        | 'tablet'

      if (!moduloChave) {
        return jsonResponse({ error: 'modulo_chave é obrigatório' }, 400)
      }
      return await handleRemoverPreferencias(client, userId, moduloChave, submoduloChave, dispositivo)
    }

    return jsonResponse({ error: 'Rota não encontrada' }, 404)
  } catch (error) {
    console.error('Erro na Edge Function configuracoes', error)
    return jsonResponse({ error: 'Erro inesperado na função configuracoes' }, 500)
  }
}, { headers: corsHeaders })

async function handleBootstrap(client: SupabaseClient, userId: string) {
  const empresaId = await obterEmpresaId(client)

  const [modulos, submodulos, ferramentas, preferencias, flags] = await Promise.all([
    client.from('configuracoes_modulos').select('*').order('ordem', { ascending: true }),
    client
      .from('configuracoes_submodulos')
      .select('*')
      .order('ordem', { ascending: true }),
    client
      .from('configuracoes_ferramentas')
      .select('*')
      .order('nome', { ascending: true }),
    client
      .from('configuracoes_usuarios')
      .select('*')
      .eq('user_id', userId),
    client.from('configuracoes_flags').select('*'),
  ])

  const erro = modulos.error || submodulos.error || ferramentas.error || preferencias.error || flags.error
  if (erro) {
    console.error('Erro no bootstrap', erro)
    return jsonResponse({ error: erro.message }, 400)
  }

  return jsonResponse({
    empresa_id: empresaId,
    modulos: modulos.data,
    submodulos: submodulos.data,
    ferramentas: ferramentas.data,
    preferencias: preferencias.data,
    flags: flags.data,
  })
}

async function handleModulos(client: SupabaseClient) {
  const [modulos, submodulos, ferramentas] = await Promise.all([
    client.from('configuracoes_modulos').select('*').order('ordem', { ascending: true }),
    client
      .from('configuracoes_submodulos')
      .select('*')
      .order('ordem', { ascending: true }),
    client
      .from('configuracoes_ferramentas')
      .select('*')
      .order('nome', { ascending: true }),
  ])

  const erro = modulos.error || submodulos.error || ferramentas.error
  if (erro) {
    return jsonResponse({ error: erro.message }, 400)
  }

  return jsonResponse({
    modulos: modulos.data,
    submodulos: submodulos.data,
    ferramentas: ferramentas.data,
  })
}

async function handleFlags(client: SupabaseClient) {
  const { data, error } = await client.from('configuracoes_flags').select('*')
  if (error) {
    return jsonResponse({ error: error.message }, 400)
  }
  return jsonResponse({ flags: data })
}

async function handleEventos(client: SupabaseClient, limit: number) {
  const { data, error } = await client
    .from('configuracoes_eventos')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(limit)

  if (error) {
    return jsonResponse({ error: error.message }, 400)
  }
  return jsonResponse({ eventos: data })
}

async function handlePreferencias(client: SupabaseClient, userId: string, params: URLSearchParams) {
  const moduloChave = params.get('modulo_chave')
  const submoduloChave = params.get('submodulo_chave')
  const dispositivoParam = params.get('dispositivo')
  const dispositivo = dispositivoParam
    ? validarDispositivo(dispositivoParam)
    : null
  if (dispositivoParam && !dispositivo) {
    return jsonResponse({ error: 'dispositivo inválido (desktop, mobile ou tablet)' }, 400)
  }

  const limit = clampLimit(
    Number(params.get('limit')) || PREFERENCIAS_LIMIT_DEFAULT,
    PREFERENCIAS_LIMIT_MAX,
  )

  let query = client
    .from('configuracoes_usuarios')
    .select('*')
    .eq('user_id', userId)
    .order('atualizado_em', { ascending: false })
    .limit(limit)

  if (moduloChave) {
    query = query.eq('modulo_chave', moduloChave)
  }
  if (submoduloChave) {
    query = query.eq('submodulo_chave', submoduloChave)
  }
  if (dispositivo) {
    query = query.eq('dispositivo', dispositivo)
  }

  const { data, error } = await query
  if (error) {
    return jsonResponse({ error: error.message }, 400)
  }

  return jsonResponse({ preferencias: data })
}

async function handleSalvarPreferencias(
  client: SupabaseClient,
  userId: string,
  payload: PreferenciaPayload,
) {
  if (!payload.modulo_chave) {
    return jsonResponse({ error: 'modulo_chave é obrigatório' }, 400)
  }

  const empresaId = await obterEmpresaId(client)
  const dispositivo = payload.dispositivo ?? 'desktop'

  const upsertPayload = {
    user_id: userId,
    empresa_id: empresaId,
    modulo_chave: payload.modulo_chave,
    submodulo_chave: payload.submodulo_chave ?? null,
    dispositivo,
    visivel: payload.visivel ?? true,
    fixado: payload.fixado ?? false,
    layout_config: payload.layout_config ?? {},
    filtros: payload.filtros ?? {},
    ferramentas_habilitadas: payload.ferramentas_habilitadas ?? {},
  }

  const { data, error } = await client
    .from('configuracoes_usuarios')
    .upsert(upsertPayload, {
      onConflict: 'user_id,empresa_id,modulo_chave,submodulo_chave_norm,dispositivo',
    })
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao salvar preferências', error)
    return jsonResponse({ error: 'Não foi possível salvar as preferências' }, 400)
  }

  await registrarEvento(client, {
    empresaId,
    userId,
    moduloChave: payload.modulo_chave,
    submoduloChave: payload.submodulo_chave ?? null,
    dispositivo,
    acao: 'atualizar_preferencia',
    detalhes: {
      visivel: upsertPayload.visivel,
      fixado: upsertPayload.fixado,
    },
  })

  return jsonResponse({ sucesso: true, preferencia: data })
}

async function handleRemoverPreferencias(
  client: SupabaseClient,
  userId: string,
  moduloChave: string,
  submoduloChave: string | null,
  dispositivo: 'desktop' | 'mobile' | 'tablet',
) {
  let query = client.from('configuracoes_usuarios').delete().eq('user_id', userId).eq('modulo_chave', moduloChave)
  if (submoduloChave) {
    query = query.eq('submodulo_chave', submoduloChave)
  } else {
    query = query.is('submodulo_chave', null)
  }
  query = query.eq('dispositivo', dispositivo)

  const { error } = await query
  if (error) {
    console.error('Erro ao remover preferências', error)
    return jsonResponse({ error: 'Não foi possível remover as preferências' }, 400)
  }

  const empresaId = await obterEmpresaId(client)
  await registrarEvento(client, {
    empresaId,
    userId,
    moduloChave,
    submoduloChave: submoduloChave ?? null,
    dispositivo,
    acao: 'remover_preferencia',
    detalhes: {},
  })

  return jsonResponse({ sucesso: true })
}

async function handleRegistrarEventoManual(
  client: SupabaseClient,
  userId: string,
  payload: EventoManualPayload,
) {
  if (!payload.modulo_chave || !payload.acao) {
    return jsonResponse({ error: 'modulo_chave e acao são obrigatórios' }, 400)
  }

  const dispositivo = payload.dispositivo ? validarDispositivo(payload.dispositivo) : 'desktop'
  if (!dispositivo) {
    return jsonResponse({ error: 'dispositivo inválido (desktop, mobile ou tablet)' }, 400)
  }

  const empresaId = await obterEmpresaId(client)
  if (!empresaId) {
    return jsonResponse({ error: 'empresa atual não encontrada' }, 400)
  }

  await registrarEvento(client, {
    empresaId,
    userId,
    moduloChave: payload.modulo_chave,
    submoduloChave: payload.submodulo_chave ?? null,
    dispositivo,
    acao: payload.acao,
    detalhes: payload.detalhes ?? {},
  })

  return jsonResponse({ sucesso: true })
}

async function handleAdminModulo(payload: AdminModuloPayload) {
  if (!adminClient) {
    return jsonResponse({ error: 'SERVICE ROLE não configurado' }, 500)
  }

  if (!payload.chave || !payload.nome) {
    return jsonResponse({ error: 'chave e nome são obrigatórios' }, 400)
  }

  const empresaId = payload.empresa_id ?? UUID_EMPRESA_GLOBAL

  const { data, error } = await adminClient
    .from('configuracoes_modulos')
    .upsert(
      {
        empresa_id: empresaId,
        chave: payload.chave,
        nome: payload.nome,
        descricao: payload.descricao ?? null,
        icone: payload.icone ?? null,
        metadados: payload.metadados ?? {},
        ativo: payload.ativo ?? true,
        ordem: payload.ordem ?? 0,
      },
      { onConflict: 'empresa_id,chave_normalizada' },
    )
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao salvar módulo admin', error)
    return jsonResponse({ error: 'Não foi possível salvar o módulo' }, 400)
  }

  return jsonResponse({ sucesso: true, modulo: data })
}

async function handleAdminSubmodulo(payload: AdminSubmoduloPayload) {
  if (!adminClient) {
    return jsonResponse({ error: 'SERVICE ROLE não configurado' }, 500)
  }

  if (!payload.modulo_chave || !payload.chave || !payload.nome) {
    return jsonResponse({ error: 'modulo_chave, chave e nome são obrigatórios' }, 400)
  }

  const empresaId = payload.empresa_id ?? UUID_EMPRESA_GLOBAL
  const moduloId = await obterModuloIdAdmin(adminClient, empresaId, payload.modulo_chave)
  if (!moduloId) {
    return jsonResponse({ error: 'Módulo não encontrado para o submódulo' }, 400)
  }

  const { data, error } = await adminClient
    .from('configuracoes_submodulos')
    .upsert(
      {
        empresa_id: empresaId,
        modulo_id: moduloId,
        chave: payload.chave,
        nome: payload.nome,
        descricao: payload.descricao ?? null,
        ordem: payload.ordem ?? 0,
        ativo: payload.ativo ?? true,
      },
      { onConflict: 'empresa_id,modulo_id,chave_normalizada' },
    )
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao salvar submódulo admin', error)
    return jsonResponse({ error: 'Não foi possível salvar o submódulo' }, 400)
  }

  return jsonResponse({ sucesso: true, submodulo: data })
}

async function handleAdminFerramenta(payload: AdminFerramentaPayload) {
  if (!adminClient) {
    return jsonResponse({ error: 'SERVICE ROLE não configurado' }, 500)
  }

  if (!payload.modulo_chave || !payload.chave || !payload.nome) {
    return jsonResponse({ error: 'modulo_chave, chave e nome são obrigatórios' }, 400)
  }

  const empresaId = payload.empresa_id ?? UUID_EMPRESA_GLOBAL
  const moduloId = await obterModuloIdAdmin(adminClient, empresaId, payload.modulo_chave)
  if (!moduloId) {
    return jsonResponse({ error: 'Módulo não encontrado para a ferramenta' }, 400)
  }

  let submoduloId: string | null = null
  if (payload.submodulo_chave) {
    submoduloId = await obterSubmoduloIdAdmin(adminClient, empresaId, payload.modulo_chave, payload.submodulo_chave)
    if (!submoduloId) {
      return jsonResponse({ error: 'Submódulo não encontrado para a ferramenta' }, 400)
    }
  }

  const { data, error } = await adminClient
    .from('configuracoes_ferramentas')
    .upsert(
      {
        empresa_id: empresaId,
        modulo_id: moduloId,
        submodulo_id: submoduloId,
        chave: payload.chave,
        nome: payload.nome,
        icone: payload.icone ?? null,
        tipo: payload.tipo ?? null,
        parametros: payload.parametros ?? {},
        enriquecimentos: payload.enriquecimentos ?? [],
        ativo: payload.ativo ?? true,
      },
      { onConflict: 'empresa_id,chave_normalizada' },
    )
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao salvar ferramenta admin', error)
    return jsonResponse({ error: 'Não foi possível salvar a ferramenta' }, 400)
  }

  return jsonResponse({ sucesso: true, ferramenta: data })
}

async function registrarEvento(
  client: SupabaseClient,
  params: {
    empresaId: string | null
    userId: string
    moduloChave: string
    submoduloChave: string | null
    dispositivo: 'desktop' | 'mobile' | 'tablet'
    acao: string
    detalhes: Json
  },
) {
  if (!params.empresaId) return

  const { error } = await client.from('configuracoes_eventos').insert({
    empresa_id: params.empresaId,
    user_id: params.userId,
    modulo_chave: params.moduloChave,
    submodulo_chave: params.submoduloChave,
    dispositivo: params.dispositivo,
    acao: params.acao,
    detalhes: params.detalhes,
  })

  if (error) {
    console.error('Falha ao registrar evento de configuração', error)
  }
}

async function obterModuloIdAdmin(client: SupabaseClient, empresaId: string, moduloChave: string) {
  const { data } = await client
    .from('configuracoes_modulos')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('chave_normalizada', normalizarChave(moduloChave))
    .maybeSingle()
  return data?.id ?? null
}

async function obterSubmoduloIdAdmin(client: SupabaseClient, empresaId: string, moduloChave: string, submoduloChave: string) {
  const moduloId = await obterModuloIdAdmin(client, empresaId, moduloChave)
  if (!moduloId) return null
  const { data } = await client
    .from('configuracoes_submodulos')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('modulo_id', moduloId)
    .eq('chave_normalizada', normalizarChave(submoduloChave))
    .maybeSingle()
  return data?.id ?? null
}

async function obterEmpresaId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.rpc('current_empresa')
  if (error) {
    console.error('Erro ao obter empresa atual', error)
    return null
  }
  if (Array.isArray(data)) {
    return data[0] ?? null
  }
  return data as string | null
}

function decodeUserId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.sub ?? null
  } catch {
    return null
  }
}

function checkServiceRequest(req: Request) {
  const serviceKeyHeader = req.headers.get('x-service-key')
  return Boolean(SUPABASE_SERVICE_ROLE_KEY && serviceKeyHeader === SUPABASE_SERVICE_ROLE_KEY)
}

function ensureServiceAccess(isServiceRequest: boolean) {
  if (!isServiceRequest) {
    return jsonResponse({ error: 'Acesso restrito a operações administrativas' }, 403)
  }
  if (!adminClient) {
    return jsonResponse({ error: 'SERVICE ROLE Key não configurada' }, 500)
  }
  return null
}

function normalizarChave(valor?: string | null) {
  if (!valor) return ''
  return valor.toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function clampLimit(limit: number, max = EVENTOS_LIMIT_MAX) {
  return Math.max(1, Math.min(max, limit))
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeaders, ...corsHeaders },
  })
}

function validarDispositivo(
  value: string,
): 'desktop' | 'mobile' | 'tablet' | null {
  if (value === 'desktop' || value === 'mobile' || value === 'tablet') {
    return value
  }
  return null
}

