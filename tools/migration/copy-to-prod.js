import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FROM = "/Users/daxmeneghel/icarus-make/";
const TO = "/Users/daxmeneghel/icarus-v5.0/";

console.log("🚀 Copiando arquivos para produção...\n");

// Usar rsync para copiar (mais eficiente e seguro)
const items = [
  "src/",
  "public/",
  "supabase/",
  "package.json",
  "pnpm-lock.yaml",
  "vite.config.ts",
  "tsconfig.json",
  "tsconfig.typecheck.json",
  "playwright.config.ts",
  "tailwind.config.js",
  "postcss.config.js",
  "eslint.config.js",
  "components.json",
  "index.html",
];

for (const item of items) {
  const src = path.join(FROM, item);
  const dst = path.join(TO, item);

  try {
    if (item.endsWith("/")) {
      // Diretório
      execSync(
        `rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' "${src}" "${TO}"`,
        { stdio: "inherit" },
      );
      console.log(`✅ ${item}`);
    } else {
      // Arquivo
      execSync(`cp "${src}" "${dst}"`, { stdio: "inherit" });
      console.log(`✅ ${item}`);
    }
  } catch (error) {
    console.error(`❌ ${item}`);
  }
}

console.log("\n✅ Migração completa!");
