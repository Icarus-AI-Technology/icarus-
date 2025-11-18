#!/usr/bin/env node

// tools/ia/ia-validator.js
// Valida topologia de IA do ICARUS com Supabase já integrado à Vercel:
// - Confere OPENAI_API_KEY / OPENAI_MEDICAL_MODEL / ANTHROPIC_API_KEY / ANTHROPIC_FINANCE_MODEL (sem logar valores).
// - Faz ping em /functions/v1/medical-ai e /functions/v1/finance-ai.
// - Garante que não há localhost em produção.

import fs from "node:fs";
import path from "node:path";

const env = process.env.NODE_ENV || "development";
const checks = [];
const now = () => new Date().toISOString();

function add(service, status, info = {}) {
  checks.push({ service, status, ...info });
}

function isProd() {
  return env === "production" || process.env.VITE_ENVIRONMENT === "production";
}

function hasLocalHost(url = "") {
  return /localhost|127\.0\.0\.1/i.test(String(url));
}

async function pingJSON(url, body = {}, extra = {}) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(extra.headers || {})
      },
      body: JSON.stringify(body)
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

function resolveSupabaseUrl() {
  const fromEnv =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  return fromEnv.replace(/\/$/, "");
}

function resolveFunctionsBase() {
  const explicit = process.env.SUPABASE_FUNCTIONS_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const supabaseUrl = resolveSupabaseUrl();
  if (!supabaseUrl) return null;
  return supabaseUrl + "/functions/v1";
}

// 1) ENV KEYS (sem logar valores)
function checkEnvKeys() {
  const openaiKey = !!process.env.OPENAI_API_KEY;
  const openaiModel = !!process.env.OPENAI_MEDICAL_MODEL;
  const anthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const anthropicModel = !!process.env.ANTHROPIC_FINANCE_MODEL;

  add(
    "env:OPENAI_API_KEY",
    openaiKey ? "ok" : isProd() ? "error" : "warning",
    { message: openaiKey ? "OPENAI_API_KEY presente" : "OPENAI_API_KEY ausente" }
  );

  add(
    "env:OPENAI_MEDICAL_MODEL",
    openaiModel ? "ok" : isProd() ? "error" : "warning",
    {
      message: openaiModel
        ? "OPENAI_MEDICAL_MODEL presente"
        : "OPENAI_MEDICAL_MODEL ausente"
    }
  );

  add(
    "env:ANTHROPIC_API_KEY",
    anthropicKey ? "ok" : isProd() ? "error" : "warning",
    {
      message: anthropicKey
        ? "ANTHROPIC_API_KEY presente"
        : "ANTHROPIC_API_KEY ausente"
    }
  );

  add(
    "env:ANTHROPIC_FINANCE_MODEL",
    anthropicModel ? "ok" : isProd() ? "error" : "warning",
    {
      message: anthropicModel
        ? "ANTHROPIC_FINANCE_MODEL presente"
        : "ANTHROPIC_FINANCE_MODEL ausente"
    }
  );
}

// 2) Base das Functions
function checkFunctionsBase() {
  const base = resolveFunctionsBase();

  if (!base) {
    add("supabase:functions-base", isProd() ? "error" : "warning", {
      message:
        "SUPABASE_FUNCTIONS_URL/SUPABASE_URL não configuradas no ambiente."
    });
    return null;
  }

  if (isProd() && hasLocalHost(base)) {
    add("supabase:functions-base", "error", {
      message:
        "SUPABASE_FUNCTIONS_URL não pode apontar para localhost em produção.",
      endpoint: base
    });
    return null;
  }

  add("supabase:functions-base", "ok", { endpoint: base });
  return base;
}

// 3) Ping medical-ai
async function checkMedicalAi(base) {
  const url = `${base}/medical-ai`;
  const { ok, status, data } = await pingJSON(url, { ping: true });

  if (ok && data?.ok) {
    add("edge:medical-ai", "ok", {
      endpoint: url,
      openaiKeyPresent: !!data.openaiKeyPresent,
      modelPresent: !!data.modelPresent
    });
  } else {
    add("edge:medical-ai", isProd() ? "error" : "warning", {
      endpoint: url,
      status,
      message: "Falha no ping da função medical-ai"
    });
  }
}

// 4) Ping finance-ai
async function checkFinanceAi(base) {
  const url = `${base}/finance-ai`;
  const { ok, status, data } = await pingJSON(url, { ping: true });

  if (ok && data?.ok) {
    add("edge:finance-ai", "ok", {
      endpoint: url,
      anthropicKeyPresent: !!data.anthropicKeyPresent,
      modelPresent: !!data.modelPresent
    });
  } else {
    add("edge:finance-ai", isProd() ? "error" : "warning", {
      endpoint: url,
      status,
      message: "Falha no ping da função finance-ai"
    });
  }
}

// 5) Política: sem localhost em produção
function checkNoLocalhostInProd() {
  if (!isProd()) return;

  const suspects = [
    process.env.SUPABASE_FUNCTIONS_URL,
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ].filter(Boolean);

  const hasBad = suspects.some((u) => hasLocalHost(u || ""));

  if (hasBad) {
    add("policy:localhost-in-prod", "error", {
      message:
        "Alguma URL de Supabase/Functions contém localhost/127.0.0.1 em produção."
    });
  } else {
    add("policy:localhost-in-prod", "ok", {
      message: "Nenhuma URL localhost detectada em produção."
    });
  }
}

async function main() {
  console.log(`🤖 Validando topologia de IA (NODE_ENV=${env})\n`);

  checkEnvKeys();
  const base = checkFunctionsBase();

  if (base) {
    await checkMedicalAi(base);
    await checkFinanceAi(base);
  }

  checkNoLocalhostInProd();

  const failed = checks.filter((c) => c.status === "error");

  const report = {
    timestamp: now(),
    environment: env,
    checks,
    failed: failed.length
  };

  const outPath = path.join(
    ".cursor",
    "agents",
    "ia-validator",
    `validation-${Date.now()}.json`
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("\n📊 RELATÓRIO");

  for (const c of checks) {
    console.log(
      ` - ${c.service}: ${c.status}${c.message ? " - " + c.message : ""}`
    );
  }

  console.log(`\n📄 Salvo em: ${outPath}`);

  if (failed.length) {
    console.error("\n❌ Violações detectadas (ver relatório).");
    process.exit(1);
  }

  console.log("\n✅ Topologia em conformidade.");
}

main().catch((e) => {
  console.error("Erro inesperado no ia-validator:", e?.message || e);
  process.exit(1);
});
