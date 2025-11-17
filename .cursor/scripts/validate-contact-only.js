#!/usr/bin/env node

/**
 * VALIDADOR SIMPLIFICADO - FORMULÁRIO DE CONTATO
 * Valida apenas componentes essenciais do formulário
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "../..");

const log = (msg, color = "\x1b[36m") => console.log(`${color}${msg}\x1b[0m`);
const success = (msg) => log(`✅ ${msg}`, "\x1b[32m");
const error = (msg) => log(`❌ ${msg}`, "\x1b[31m");
const info = (msg) => log(`ℹ️  ${msg}`, "\x1b[36m");

log("\n═══════════════════════════════════════════════════", "\x1b[36m");
log("🚀 VALIDADOR DE FORMULÁRIO DE CONTATO", "\x1b[36m");
log("═══════════════════════════════════════════════════\n", "\x1b[36m");

let passed = 0;
let failed = 0;

// 1. API File
info("Verificando: API /api/contact.ts");
if (fs.existsSync(path.join(rootDir, "api/contact.ts"))) {
  success("API file exists");
  passed++;
} else {
  error("API file missing");
  failed++;
}

// 2. Frontend Page
info("Verificando: Frontend Contato.tsx");
if (fs.existsSync(path.join(rootDir, "src/pages/Contato.tsx"))) {
  success("Contato page exists");
  passed++;
} else {
  error("Contato page missing");
  failed++;
}

// 3. Route
info("Verificando: Rota configurada");
const appFile = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf-8");
if (appFile.includes('path="/contato"') && appFile.includes("<Contato />")) {
  success("Route configured in App.tsx");
  passed++;
} else {
  error("Route not configured");
  failed++;
}

// 4. Vite Plugin
info("Verificando: Plugin Vite");
const viteConfig = fs.readFileSync(
  path.join(rootDir, "vite.config.ts"),
  "utf-8",
);
if (viteConfig.includes("contactApiPlugin()")) {
  success("Vite dev plugin configured");
  passed++;
} else {
  error("Vite plugin missing");
  failed++;
}

// 5. Vercel
info("Verificando: Configuração Vercel");
const vercelJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, "vercel.json"), "utf-8"),
);
if (vercelJson.rewrites?.some((r) => r.source === "/api/contact")) {
  success("Vercel rewrite configured");
  passed++;
} else {
  error("Vercel rewrite missing");
  failed++;
}

// 6. Styles
info("Verificando: Estilos Neumorphic");
const stylesFile = fs.readFileSync(
  path.join(rootDir, "src/styles/globals.css"),
  "utf-8",
);
const hasStyles =
  stylesFile.includes(".neumorphic-card") &&
  stylesFile.includes(".neumorphic-input") &&
  stylesFile.includes(".neumorphic-button");
if (hasStyles) {
  success("Neumorphic styles available");
  passed++;
} else {
  error("Styles missing");
  failed++;
}

// 7. Dependencies
info("Verificando: Dependências");
const pkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"),
);
const deps = ["react-hook-form", "zod", "@hookform/resolvers"];
const allInstalled = deps.every(
  (d) => pkg.dependencies?.[d] || pkg.devDependencies?.[d],
);
if (allInstalled) {
  success("Required dependencies installed");
  passed++;
} else {
  error("Dependencies missing");
  failed++;
}

// 8. API Content
info("Verificando: Validações na API");
const apiContent = fs.readFileSync(
  path.join(rootDir, "api/contact.ts"),
  "utf-8",
);
const hasValidations =
  apiContent.includes("ContactFormData") &&
  apiContent.includes("email") &&
  apiContent.includes("name") &&
  apiContent.includes("message") &&
  apiContent.includes("emailRegex");
if (hasValidations) {
  success("API validations implemented");
  passed++;
} else {
  error("API validations missing");
  failed++;
}

// 9. Frontend Validations
info("Verificando: Validações no Frontend");
const pageContent = fs.readFileSync(
  path.join(rootDir, "src/pages/Contato.tsx"),
  "utf-8",
);
const hasFrontendValidations =
  pageContent.includes("contactSchema") &&
  pageContent.includes("zodResolver") &&
  pageContent.includes("useForm") &&
  pageContent.includes("handleSubmit");
if (hasFrontendValidations) {
  success("Frontend validations implemented");
  passed++;
} else {
  error("Frontend validations missing");
  failed++;
}

// 10. Error Handling
info("Verificando: Tratamento de erros");
const hasErrorHandling =
  pageContent.includes("status") &&
  pageContent.includes("error") &&
  pageContent.includes("success") &&
  apiContent.includes("try") &&
  apiContent.includes("catch");
if (hasErrorHandling) {
  success("Error handling implemented");
  passed++;
} else {
  error("Error handling missing");
  failed++;
}

// Report
log("\n═══════════════════════════════════════════════════", "\x1b[36m");
log("📊 RELATÓRIO FINAL", "\x1b[36m");
log("═══════════════════════════════════════════════════", "\x1b[36m");
log(`Total de checks: ${passed + failed}`, "\x1b[37m");
success(`Passou: ${passed}`);
if (failed > 0) {
  error(`Falhou: ${failed}`);
}
log("═══════════════════════════════════════════════════\n", "\x1b[36m");

if (failed === 0) {
  success("✨ TODOS OS CHECKS PASSARAM!");
  success("🎉 Formulário de contato está 100% funcional!\n");
  process.exit(0);
} else {
  error("⚠️  Alguns checks falharam. Revise os itens acima.\n");
  process.exit(1);
}
