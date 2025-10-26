#!/usr/bin/env python3
# ICARUS v5 - Bootstrap de Arquivos (PM2, package.json, TS/ESLint, tipos, QA)
# Uso:
#   python3 bootstrap_icarus_scaffold.py --root "/users/daxmeneghel/icarus-make"
#
# - Idempotente: roda quantas vezes precisar.
# - Nao sobrescreve arquivos existentes sem backup (.bak) quando necessario.
# - Faz merge de package.json (somente scripts/engines/type).

import argparse, json, os, shutil, sys
from pathlib import Path
from typing import Dict, Any

# ---------- Conteudos base ----------

ECOSYSTEM = """/**
 * PM2 ecosystem for ICARUS v5 - preview + integrations
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 status
 */
module.exports = {
  apps: [
    {
      name: "icarus-frontend",
      script: "npm",
      args: "run preview",
      cwd: "__ROOT__", // raiz do projeto
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
      }
    },
    {
      name: "icarus-integrations",
      script: "node",
      args: "server/integrations.js",
      cwd: "__ROOT__", // ajuste se necessario
      env: {
        NODE_ENV: "production",
        FF_MEILISEARCH: process.env.FF_MEILISEARCH || "on",
        FF_TESSERACT: process.env.FF_TESSERACT || "on",
        FF_OLLAMA: process.env.FF_OLLAMA || "on",
        FF_EMAIL_PROVIDER: process.env.FF_EMAIL_PROVIDER || "resend",
        FF_BULLMQ: process.env.FF_BULLMQ || "on",
        FF_POSTHOG: process.env.FF_POSTHOG || "on"
      }
    }
  ]
};
"""

PACKAGE_SCRIPTS = {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview --host --port 3000",
  "type-check": "tsc -p tsconfig.json --noEmit",
  "lint": "eslint .",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "check:fe-bd": "node tools/qa/check-map-fe-bd.js",
  "check:forms": "node tools/qa/check-forms.js",
  "check:buttons": "node tools/qa/check-buttons.js",
  "check:tables": "node tools/qa/check-tables.js",
  "check:meili": "node tools/qa/integrations/check-meili.js",
  "check:tesseract": "node tools/qa/integrations/check-tesseract.js",
  "check:ollama": "node tools/qa/integrations/check-ollama.js",
  "check:email": "node tools/qa/integrations/check-email.js",
  "check:bull": "node tools/qa/integrations/check-bullmq.js",
  "check:posthog": "node tools/qa/integrations/check-posthog.js",
  "qa:integrations": "npm-run-all -s check:meili check:tesseract check:ollama check:email check:bull check:posthog",
  "qa:ui": "npm-run-all -s check:forms check:buttons check:tables",
  "qa:map": "npm run check:fe-bd",
  "qa:all": "npm-run-all -s qa:map qa:ui qa:integrations",
  "pm2:start": "pm2 start ecosystem.config.cjs --only icarus-frontend && pm2 save",
  "pm2:restart": "pm2 restart icarus-frontend",
  "pm2:stop": "pm2 stop icarus-frontend",
  "pm2:logs": "pm2 logs icarus-frontend --lines 200",
  "start": "npm run preview"
}

PACKAGE_BASE = {
  "name": "icarus-v5",
  "version": "0.0.0",
  "private": True,
  "type": "module",
  "engines": { "node": ">=18.18" },
  "scripts": PACKAGE_SCRIPTS,
  "dependencies": {},
  "devDependencies": {}
}

GLOBAL_DTS = """/// <reference types="vite/client" />

/**
 * Tipagem de variaveis de ambiente para o ICARUS v5.
 * - As chaves VITE_* sao expostas no client (Vite).
 * - Chaves sensiveis (SERVICE_ROLE etc.) devem ser usadas apenas no backend/scripts.
 */

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Flags (ajuste conforme necessario)
  readonly VITE_FF_MEILISEARCH?: "on" | "off"
  readonly VITE_FF_TESSERACT?: "on" | "off"
  readonly VITE_FF_OLLAMA?: "on" | "off"
  readonly VITE_FF_EMAIL_PROVIDER?: "resend" | "ses" | "off"
  readonly VITE_FF_BULLMQ?: "on" | "off"
  readonly VITE_FF_POSTHOG?: "on" | "off"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Ambiente Node para scripts/PM2 (nao usar no client)
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL?: string
    VITE_SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE?: string
    FF_MEILISEARCH?: "on" | "off"
    FF_TESSERACT?: "on" | "off"
    FF_OLLAMA?: "on" | "off"
    FF_EMAIL_PROVIDER?: "resend" | "ses" | "off"
    FF_BULLMQ?: "on" | "off"
    FF_POSTHOG?: "on" | "off"
    PORT?: string
    NODE_ENV?: "development" | "production" | "test"
  }
}
"""

TSCONFIG_PATCH = """{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,

    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "./types/global"],

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "types", "vite.config.*", "eslint.config.*"],
  "exclude": ["dist", "build", "node_modules", "**/*.spec.ts", "**/*.test.ts"]
}
"""

ESLINT_FLAT = """// ESLint v9 Flat Config - ICARUS v5 (TypeScript + React + Vite)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  { ignores: ["dist/**", "build/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "unused-imports": unusedImports
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    settings: { react: { version: "detect" } },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/array-type": ["error", { "default": "array-simple" }],
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-undef": "off",
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"], "object", "type"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react/jsx-no-useless-fragment": "warn",
      "react/no-unknown-property": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn"
    }
  }
];
"""

CHECK_FILES = {
  "tools/qa/check-map-fe-bd.js": "// TODO: implementa verificacao mapeamento FE<->BD\n",
  "tools/qa/check-forms.js": "// TODO: valida formularios (required, aria, submit handlers)\n",
  "tools/qa/check-buttons.js": "// TODO: verifica handlers e estados (loading/disabled)\n",
  "tools/qa/check-tables.js": "// TODO: checa paginacao/empty/error/loading\n",
  "tools/qa/integrations/check-meili.js": "// TODO: healthcheck/bench Meilisearch\n",
  "tools/qa/integrations/check-tesseract.js": "// TODO: healthcheck/bench Tesseract\n",
  "tools/qa/integrations/check-ollama.js": "// TODO: healthcheck/bench Ollama\n",
  "tools/qa/integrations/check-email.js": "// TODO: healthcheck Resend/SES\n",
  "tools/qa/integrations/check-bullmq.js": "// TODO: healthcheck BullMQ/Redis\n",
  "tools/qa/integrations/check-posthog.js": "// TODO: healthcheck PostHog\n",
  "server/integrations.js": "// TODO: servidor minimo para integracoes sob PM2\n"
}

# ---------- Funcoes utilitarias ----------

def write_file(path: Path, content: str, overwrite: bool = False, replace_markers: Dict[str, str] = None):
  path.parent.mkdir(parents=True, exist_ok=True)
  if replace_markers:
    for k, v in replace_markers.items():
      content = content.replace(k, v)
  if path.exists() and not overwrite:
    current = path.read_text(encoding="utf-8")
    if current.strip() == content.strip():
      print(f"= mantido: {path}")
      return
    bak = path.with_suffix(path.suffix + ".bak")
    shutil.copy2(path, bak)
    print(f"* backup: {bak}")
  path.write_text(content, encoding="utf-8")
  print(f"+ escrito: {path}")

def merge_package_json(path: Path, base_data: Dict[str, Any]):
  if path.exists():
    try:
      existing = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
      print(f"! package.json invalido, gerando backup: {e}")
      shutil.copy2(path, path.with_suffix(".json.bak"))
      existing = {}

    existing.setdefault("type", base_data.get("type"))
    existing.setdefault("engines", base_data.get("engines"))

    scripts = existing.get("scripts", {})
    for k, v in base_data["scripts"].items():
      if k not in scripts:
        scripts[k] = v
    existing["scripts"] = scripts

    path.write_text(json.dumps(existing, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"+ merged: {path}")
  else:
    path.write_text(json.dumps(base_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"+ criado: {path}")

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--root", default=os.environ.get("ICARUS_ROOT", "/users/daxmeneghel/icarus-make"), help="raiz do projeto")
  args = ap.parse_args()

  root = Path(args.root).expanduser().resolve()
  print(f"Raiz do projeto: {root}")
  if not root.exists():
    print(f"!! Diretorio nao existe: {root}")
    sys.exit(1)

  # 1) ecosystem.config.cjs
  write_file(root / "ecosystem.config.cjs", ECOSYSTEM, overwrite=False, replace_markers={"__ROOT__": str(root)})

  # 2) package.json (merge)
  merge_package_json(root / "package.json", PACKAGE_BASE)

  # 3) types/global.d.ts
  write_file(root / "types" / "global.d.ts", GLOBAL_DTS)

  # 4) tsconfig.patch.json
  write_file(root / "tsconfig.patch.json", TSCONFIG_PATCH)

  # 5) eslint.config.mjs
  write_file(root / "eslint.config.mjs", ESLINT_FLAT)

  # 6) arquivos de QA/bench/integrations (stubs)
  for rel, content in CHECK_FILES.items():
    write_file(root / rel, content)

  print("\n✅ Concluido.")
  print("Proximos passos:")
  print("  1) Verifique/ajuste o caminho root em ecosystem.config.cjs (ja aponta para sua raiz).")
  print("  2) Rode: npm install")
  print("  3) Build/Preview: npm run build && npm run preview   # http://localhost:3000")
  print("  4) PM2: npm run pm2:start && pm2 status")
  print("  5) Ajuste tsconfig.json para 'extends: ./tsconfig.patch.json' ou faca merge manual.")
  print("  6) Instale peer deps do ESLint flat se ainda nao tiver:")
  print("     npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-unused-imports")
  print("")

if __name__ == "__main__":
  main()
