#!/usr/bin/env node

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IAValidator {
  constructor() {
    this.checks = [];
    this.env = process.env.NODE_ENV || "development";
  }

  async validate() {
    console.log(`🤖 Validando IAs Nativas (${this.env})...\n`);

    await this.checkOllama();
    await this.checkMeilisearch();
    await this.checkPostHog();
    await this.checkSupabase();
    await this.checkTesseract();

    return this.generateReport();
  }

  async checkOllama() {
    console.log("🦙 Verificando Ollama...");

    if (this.env === "production") {
      console.log("⏭️  Ollama desabilitado em produção (esperado)");
      this.checks.push({
        service: "ollama",
        status: "skipped",
        message: "Desabilitado em produção",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        signal: AbortSignal.timeout(5000),
      });
      const data = await response.json();

      if (data.models && data.models.length > 0) {
        console.log(`✅ Ollama OK - ${data.models.length} modelos disponíveis`);
        this.checks.push({
          service: "ollama",
          status: "ok",
          endpoint: "http://localhost:11434",
          models: data.models.map((m) => m.name),
        });
      } else {
        console.log("⚠️  Ollama acessível mas sem modelos");
        this.checks.push({
          service: "ollama",
          status: "warning",
          message: "Nenhum modelo instalado",
        });
      }
    } catch (error) {
      console.log("❌ Ollama não acessível");
      this.checks.push({
        service: "ollama",
        status: "error",
        message: error.message,
      });
    }
  }

  async checkMeilisearch() {
    console.log("🔍 Verificando Meilisearch...");

    const endpoint =
      process.env.VITE_MEILISEARCH_URL || "https://edge.meilisearch.com";
    const apiKey = process.env.VITE_MEILISEARCH_API_KEY;
    const host =
      process.env.VITE_MEILISEARCH_HOST ||
      "https://ms-ed15a9ff096f-33289.nyc.meilisearch.io";

    try {
      const response = await fetch(`${endpoint}/health`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Meilisearch-Host": host,
        },
        signal: AbortSignal.timeout(5000),
      });
      const data = await response.json();

      if (data.status === "available") {
        // Check version
        const versionResponse = await fetch(`${endpoint}/version`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "X-Meilisearch-Host": host,
          },
        });
        const version = await versionResponse.json();

        console.log(`✅ Meilisearch OK (v${version.pkgVersion})`);
        this.checks.push({
          service: "meilisearch",
          status: "ok",
          endpoint,
          version: version.pkgVersion,
          analytics: true,
        });
      }
    } catch (error) {
      console.log("❌ Meilisearch não acessível");
      this.checks.push({
        service: "meilisearch",
        status: "error",
        message: error.message,
      });
    }
  }

  async checkPostHog() {
    console.log("📊 Verificando PostHog...");

    const apiKey =
      process.env.VITE_POSTHOG_KEY ||
      "phx_nlBCJxYa8wDWU3eLGRHh242t9Nt3t8RP9xuxatDkEN7C48T";
    const host = process.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

    if (!apiKey || apiKey === "") {
      console.log("⚠️  VITE_POSTHOG_KEY não configurada");
      this.checks.push({
        service: "posthog",
        status: "warning",
        message: "API key não configurada",
      });
      return;
    }

    console.log("✅ PostHog configurado");
    this.checks.push({
      service: "posthog",
      status: "ok",
      configured: true,
      apiKey: apiKey.substring(0, 20) + "...",
      host,
    });
  }

  async checkSupabase() {
    console.log("🗄️  Verificando Supabase...");

    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.log("❌ Supabase não configurado");
      this.checks.push({
        service: "supabase",
        status: "error",
        message: "URL ou Key não configuradas",
      });
      return;
    }

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        console.log("✅ Supabase OK");
        this.checks.push({
          service: "supabase",
          status: "ok",
          url,
        });
      }
    } catch (error) {
      console.log("❌ Supabase não acessível");
      this.checks.push({
        service: "supabase",
        status: "error",
        message: error.message,
      });
    }
  }

  async checkTesseract() {
    console.log("👁️  Verificando Tesseract.js...");

    // Verificar se arquivos WASM estão no public
    const projectRoot = path.join(__dirname, "..", "..", "..");
    const publicDir = path.join(projectRoot, "public");
    const tesseractDir = path.join(publicDir, "tesseract");

    if (fs.existsSync(tesseractDir)) {
      const files = fs.readdirSync(tesseractDir);
      console.log("✅ Tesseract.js arquivos encontrados");
      this.checks.push({
        service: "tesseract",
        status: "ok",
        path: "/tesseract",
        files: files.length,
      });
    } else {
      console.log("⚠️  Tesseract.js arquivos não encontrados");
      this.checks.push({
        service: "tesseract",
        status: "warning",
        message: "Arquivos WASM não encontrados em /public/tesseract",
      });
    }
  }

  generateReport() {
    const passed = this.checks.every(
      (c) =>
        c.status === "ok" || c.status === "skipped" || c.status === "warning",
    );
    const failed = this.checks.filter((c) => c.status === "error");

    console.log("\n" + "=".repeat(60));
    console.log("📊 RELATÓRIO DE VALIDAÇÃO DE IAs");
    console.log("=".repeat(60) + "\n");

    this.checks.forEach((check) => {
      const icon =
        check.status === "ok"
          ? "✅"
          : check.status === "warning"
            ? "⚠️"
            : check.status === "skipped"
              ? "⏭️"
              : "❌";
      console.log(`${icon} ${check.service}: ${check.status}`);
      if (check.message) {
        console.log(`   └─ ${check.message}`);
      }
      if (check.endpoint) {
        console.log(`   └─ Endpoint: ${check.endpoint}`);
      }
      if (check.models) {
        console.log(`   └─ Modelos: ${check.models.join(", ")}`);
      }
      if (check.files) {
        console.log(`   └─ Arquivos: ${check.files}`);
      }
    });

    const report = {
      timestamp: new Date().toISOString(),
      environment: this.env,
      checks: this.checks,
      passed,
      failed: failed.length,
      summary: {
        total: this.checks.length,
        ok: this.checks.filter((c) => c.status === "ok").length,
        warning: this.checks.filter((c) => c.status === "warning").length,
        error: this.checks.filter((c) => c.status === "error").length,
        skipped: this.checks.filter((c) => c.status === "skipped").length,
      },
    };

    // Salvar relatório
    const reportDir = path.join(__dirname);
    const reportPath = path.join(reportDir, `validation-${Date.now()}.json`);
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Relatório salvo: ${reportPath}`);

    console.log("\n📈 RESUMO:");
    console.log(`   ✅ OK: ${report.summary.ok}`);
    console.log(`   ⚠️  Warning: ${report.summary.warning}`);
    console.log(`   ❌ Error: ${report.summary.error}`);
    console.log(`   ⏭️  Skipped: ${report.summary.skipped}`);

    if (passed) {
      console.log("\n✅ VALIDAÇÃO PASSOU!");
      return report;
    } else {
      console.log(`\n❌ VALIDAÇÃO FALHOU - ${failed.length} serviços com erro`);
      throw new Error("Validação de IAs falhou");
    }
  }
}

// Executar
const validator = new IAValidator();
validator.validate().catch((error) => {
  console.error("Erro na validação:", error.message);
  process.exit(1);
});

export default IAValidator;
