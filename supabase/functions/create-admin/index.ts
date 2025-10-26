// Deno Deploy / Supabase Edge Function: cria admin se não existir
// Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE, ADMIN_INITIAL_EMAIL, ADMIN_INITIAL_PASSWORD, ADMIN_INITIAL_NAME

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");
const ADMIN_EMAIL = Deno.env.get("ADMIN_INITIAL_EMAIL");
const ADMIN_PASSWORD = Deno.env.get("ADMIN_INITIAL_PASSWORD");
const ADMIN_NAME = Deno.env.get("ADMIN_INITIAL_NAME") ?? "Admin";

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
}

Deno.serve(async (_req: Request) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return json({ ok: false, error: "Missing required environment variables" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verifica se já existe usuário com o e-mail informado (paginando os primeiros 200)
    const { data: usersByEmail, error: findErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (findErr) throw findErr;

    const exists = usersByEmail?.users?.some((u) => (u.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (exists) {
      return json({ ok: true, message: "admin já existe" }, { status: 200 });
    }

    // Cria usuário admin
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { nome: ADMIN_NAME, role: "admin" },
    });
    if (createErr) throw createErr;

    return json({ ok: true, user_id: created?.user?.id }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    return json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
});


