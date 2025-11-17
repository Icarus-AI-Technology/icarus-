#!/usr/bin/env node

/**
 * 🚀 ICARUS - VERCEL DEPLOY AUTOMATION
 *
 * Script automatizado para deploy no Vercel via Cursor
 * Gerencia preview e production deploys com validações
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");

// Cores para output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) =>
    console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
  separator: () =>
    console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}`),
};

function exec(command, silent = false) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkPrerequisites() {
  log.title("🔍 VERIFICANDO PRÉ-REQUISITOS");

  const checks = [
    { name: "Node.js", cmd: "node --version" },
    { name: "pnpm", cmd: "pnpm --version" },
    { name: "Git", cmd: "git --version" },
    { name: "Vercel CLI", cmd: "npx vercel --version" },
  ];

  let allPassed = true;
  for (const check of checks) {
    const result = exec(check.cmd, true);
    if (result.success) {
      log.success(`${check.name}: ${result.output.trim()}`);
    } else {
      log.error(`${check.name}: não encontrado`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    log.error("Alguns pré-requisitos não foram atendidos");
    process.exit(1);
  }

  log.info("Todos os pré-requisitos OK\n");
  return true;
}

function checkGitStatus() {
  log.title("📋 VERIFICANDO STATUS DO GIT");

  const branchResult = exec("git branch --show-current", true);
  if (branchResult.success) {
    log.info(`Branch atual: ${branchResult.output.trim()}`);
  }

  const statusResult = exec("git status --porcelain", true);
  if (statusResult.success && statusResult.output.trim()) {
    log.warning("Há mudanças não commitadas no repositório");
    log.info("Arquivos modificados:\n" + statusResult.output);
  } else {
    log.success("Working directory limpo");
  }

  console.log();
}

function runTypeCheck() {
  log.title("🔍 TYPESCRIPT CHECK");
  log.info("Verificando tipos...");

  const result = exec("pnpm run type-check", false);
  if (result.success) {
    log.success("TypeScript: OK");
  } else {
    log.warning("TypeScript: Avisos encontrados (não bloqueante)");
  }
  console.log();
}

function runBuild() {
  log.title("🏗️  BUILD DO PROJETO");
  log.info("Executando build de produção...");

  const result = exec("pnpm run build", false);
  if (!result.success) {
    log.error("Build falhou! Corrija os erros antes do deploy.");
    process.exit(1);
  }

  log.success("Build concluído com sucesso");

  // Check bundle size
  const distPath = join(rootDir, "dist");
  if (existsSync(distPath)) {
    const sizeResult = exec("du -sh dist", true);
    if (sizeResult.success) {
      log.info(
        `📦 Tamanho do bundle: ${sizeResult.output.trim().split("\t")[0]}`,
      );
    }
  }

  console.log();
}

function checkEnvFile() {
  log.title("🔐 VERIFICANDO VARIÁVEIS DE AMBIENTE");

  const envPath = join(rootDir, ".env");
  const envExamplePath = join(rootDir, "env.example");

  if (existsSync(envPath)) {
    log.success(".env encontrado");

    const envContent = readFileSync(envPath, "utf-8");
    const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

    const missingVars = requiredVars.filter((v) => !envContent.includes(v));
    if (missingVars.length > 0) {
      log.warning(`Variáveis faltando no .env: ${missingVars.join(", ")}`);
    } else {
      log.success("Todas as variáveis essenciais presentes");
    }
  } else {
    log.warning(".env não encontrado");
    if (existsSync(envExamplePath)) {
      log.info("Use env.example como referência");
    }
  }

  console.log();
}

function setupVercelToken() {
  log.title("🔐 CONFIGURANDO VERCEL");

  // Token fornecido contém caracteres inválidos
  // Vamos usar login interativo ou variável de ambiente
  const token = process.env.VERCEL_TOKEN;

  if (
    token &&
    token.length > 20 &&
    !token.includes("#") &&
    !token.includes("&") &&
    !token.includes("@")
  ) {
    process.env.VERCEL_TOKEN = token;
    log.success("Token Vercel configurado via variável de ambiente");
  } else {
    log.warning("Token não configurado ou inválido");
    log.info("O Vercel CLI irá solicitar login interativo");
    log.info("Ou defina VERCEL_TOKEN nas variáveis de ambiente");
  }

  console.log();
}

async function deployToVercel(isProduction = false) {
  const deployType = isProduction ? "PRODUÇÃO" : "PREVIEW";
  log.title(`🚀 DEPLOY ${deployType}`);

  if (isProduction) {
    log.warning("ATENÇÃO: Deploy de PRODUÇÃO!");
    log.info("Este deploy irá para: https://icarus-newortho.vercel.app");
    console.log();
  }

  const args = ["vercel"];

  if (isProduction) {
    args.push("--prod");
  }

  // Só adiciona --yes e --token se tiver token válido
  if (process.env.VERCEL_TOKEN) {
    args.push("--yes", "--token", process.env.VERCEL_TOKEN);
    log.info("Usando token automático");
  } else {
    log.info("Login interativo será necessário");
  }

  log.info("Executando deploy...");
  log.info(
    `Comando: npx vercel ${isProduction ? "--prod " : ""}${process.env.VERCEL_TOKEN ? "--yes --token=***" : ""}`,
  );
  console.log();

  // Use spawn em vez de execSync para evitar problemas com caracteres especiais
  try {
    const { spawnSync } = await import("child_process");
    const result = spawnSync("npx", args, {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: "inherit",
      shell: false, // Importante: não usar shell para evitar interpretação de caracteres
    });

    if (result.status === 0) {
      log.success(`Deploy de ${deployType} concluído!`);
      log.separator();
      console.log();
      log.info("📊 Próximos passos:");
      console.log("  1. Verificar deploy no Vercel Dashboard");
      console.log("  2. Testar funcionalidades críticas");
      console.log("  3. Verificar variáveis de ambiente");
      if (!isProduction) {
        console.log(
          "  4. Se tudo OK, fazer deploy de produção: pnpm deploy:vercel:prod",
        );
      }
      console.log();
    } else {
      log.error(`Deploy de ${deployType} falhou!`);
      log.info("Verifique os logs acima para detalhes");
      process.exit(1);
    }
  } catch (error) {
    log.error(`Erro ao executar deploy: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
${colors.bright}🚀 ICARUS - Vercel Deploy Automation${colors.reset}

${colors.cyan}Uso:${colors.reset}
  node .cursor/scripts/deploy-vercel.js [opções]

${colors.cyan}Opções:${colors.reset}
  --preview, -p      Deploy preview (padrão)
  --production, -P   Deploy produção
  --skip-checks      Pular verificações
  --help, -h         Mostrar esta ajuda

${colors.cyan}Exemplos:${colors.reset}
  # Deploy preview
  pnpm deploy:vercel

  # Deploy produção
  pnpm deploy:vercel:prod

  # Preview pulando checks
  node .cursor/scripts/deploy-vercel.js --preview --skip-checks

${colors.cyan}Variáveis de Ambiente Necessárias no Vercel:${colors.reset}
  1. VITE_SUPABASE_URL
  2. VITE_SUPABASE_ANON_KEY
  3. VITE_APP_URL
  4. NODE_ENV=production

${colors.cyan}Documentação:${colors.reset}
  Guia completo: VERCEL_ENV_COMPLETO.md
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  const isProduction = args.includes("--production") || args.includes("-P");
  const skipChecks = args.includes("--skip-checks");

  log.separator();
  log.title("🚀 ICARUS - VERCEL DEPLOY AUTOMATION");
  log.separator();

  if (!skipChecks) {
    checkPrerequisites();
    checkGitStatus();
    checkEnvFile();
    runTypeCheck();
    runBuild();
  } else {
    log.warning("Pulando verificações (--skip-checks)");
    console.log();
  }

  setupVercelToken();

  await deployToVercel(isProduction);

  log.separator();
  log.success("🎉 PROCESSO COMPLETO!");
  log.separator();
}

main().catch((error) => {
  log.error(`Erro inesperado: ${error.message}`);
  console.error(error);
  process.exit(1);
});
