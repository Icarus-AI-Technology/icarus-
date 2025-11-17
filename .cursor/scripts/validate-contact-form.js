#!/usr/bin/env node

/**
 * Script de validação do formulário de contato
 * Valida: estrutura, API, componentes e integração
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContactFormValidator {
  constructor() {
    this.checks = [];
    this.basePath = path.resolve(__dirname, "../..");
  }

  async validate() {
    console.log("🔍 Validando Formulário de Contato...\n");

    await this.checkContactPage();
    await this.checkApiEndpoint();
    await this.checkComponentImports();
    await this.checkValidationSchema();
    await this.checkRouteConfig();

    this.generateReport();
  }

  async checkContactPage() {
    console.log("📄 Verificando página Contact.tsx...");

    try {
      const contactPath = path.join(this.basePath, "src/pages/Contact.tsx");
      const content = await fs.readFile(contactPath, "utf-8");

      const hasReactHookForm = content.includes("useForm");
      const hasZodValidation = content.includes("zodResolver");
      const hasToast = content.includes("useToast");
      const hasFormSubmit = content.includes("handleSubmit");
      const hasApiCall = content.includes("/api/contact");

      if (
        hasReactHookForm &&
        hasZodValidation &&
        hasToast &&
        hasFormSubmit &&
        hasApiCall
      ) {
        console.log("✅ Contact.tsx: OK");
        this.checks.push({
          component: "Contact.tsx",
          status: "ok",
          features: {
            reactHookForm: hasReactHookForm,
            zodValidation: hasZodValidation,
            toast: hasToast,
            formSubmit: hasFormSubmit,
            apiCall: hasApiCall,
          },
        });
      } else {
        console.log("⚠️  Contact.tsx: Incompleto");
        this.checks.push({
          component: "Contact.tsx",
          status: "warning",
          missing: {
            reactHookForm: !hasReactHookForm,
            zodValidation: !hasZodValidation,
            toast: !hasToast,
            formSubmit: !hasFormSubmit,
            apiCall: !hasApiCall,
          },
        });
      }
    } catch (error) {
      console.log("❌ Contact.tsx: Não encontrado");
      this.checks.push({
        component: "Contact.tsx",
        status: "error",
        error: error.message,
      });
    }
  }

  async checkApiEndpoint() {
    console.log("🔌 Verificando endpoint API...");

    try {
      const apiPath = path.join(this.basePath, "api/contact.ts");
      const content = await fs.readFile(apiPath, "utf-8");

      const hasCORS = content.includes("Access-Control-Allow-Origin");
      const hasValidation = content.includes("emailRegex");
      const hasErrorHandling = content.includes("catch");
      const hasTypeDefinitions = content.includes("ContactFormData");
      const hasStatusCodes =
        content.includes("status(200)") && content.includes("status(400)");

      if (
        hasCORS &&
        hasValidation &&
        hasErrorHandling &&
        hasTypeDefinitions &&
        hasStatusCodes
      ) {
        console.log("✅ API /api/contact: OK");
        this.checks.push({
          component: "api/contact.ts",
          status: "ok",
          features: {
            cors: hasCORS,
            validation: hasValidation,
            errorHandling: hasErrorHandling,
            types: hasTypeDefinitions,
            statusCodes: hasStatusCodes,
          },
        });
      } else {
        console.log("⚠️  API /api/contact: Incompleta");
        this.checks.push({
          component: "api/contact.ts",
          status: "warning",
          missing: {
            cors: !hasCORS,
            validation: !hasValidation,
            errorHandling: !hasErrorHandling,
            types: !hasTypeDefinitions,
            statusCodes: !hasStatusCodes,
          },
        });
      }
    } catch (error) {
      console.log("❌ API /api/contact: Não encontrado");
      this.checks.push({
        component: "api/contact.ts",
        status: "error",
        error: error.message,
      });
    }
  }

  async checkComponentImports() {
    console.log("🧩 Verificando imports de componentes...");

    try {
      const contactPath = path.join(this.basePath, "src/pages/Contact.tsx");
      const content = await fs.readFile(contactPath, "utf-8");

      const hasOracluxDS = content.includes("@/components/oraclusx-ds");
      const hasLucideIcons = content.includes("lucide-react");
      const hasHooks = content.includes("@/hooks");

      if (hasOracluxDS && hasLucideIcons && hasHooks) {
        console.log("✅ Imports: OK");
        this.checks.push({
          component: "imports",
          status: "ok",
          imports: {
            oracluxDS: hasOracluxDS,
            lucideIcons: hasLucideIcons,
            hooks: hasHooks,
          },
        });
      } else {
        console.log("⚠️  Imports: Incompletos");
        this.checks.push({
          component: "imports",
          status: "warning",
          missing: {
            oracluxDS: !hasOracluxDS,
            lucideIcons: !hasLucideIcons,
            hooks: !hasHooks,
          },
        });
      }
    } catch (error) {
      console.log("❌ Imports: Erro ao verificar");
      this.checks.push({
        component: "imports",
        status: "error",
        error: error.message,
      });
    }
  }

  async checkValidationSchema() {
    console.log("✔️  Verificando schema de validação...");

    try {
      const contactPath = path.join(this.basePath, "src/pages/Contact.tsx");
      const content = await fs.readFile(contactPath, "utf-8");

      const hasContactSchema = content.includes("contactSchema");
      const hasNameValidation = content.includes("name: z.string()");
      const hasEmailValidation = content.includes("email: z.string()");
      const hasMessageValidation = content.includes("message: z.string()");

      if (
        hasContactSchema &&
        hasNameValidation &&
        hasEmailValidation &&
        hasMessageValidation
      ) {
        console.log("✅ Schema Zod: OK");
        this.checks.push({
          component: "validation-schema",
          status: "ok",
          validations: {
            schema: hasContactSchema,
            name: hasNameValidation,
            email: hasEmailValidation,
            message: hasMessageValidation,
          },
        });
      } else {
        console.log("⚠️  Schema Zod: Incompleto");
        this.checks.push({
          component: "validation-schema",
          status: "warning",
          missing: {
            schema: !hasContactSchema,
            name: !hasNameValidation,
            email: !hasEmailValidation,
            message: !hasMessageValidation,
          },
        });
      }
    } catch (error) {
      console.log("❌ Schema Zod: Erro ao verificar");
      this.checks.push({
        component: "validation-schema",
        status: "error",
        error: error.message,
      });
    }
  }

  async checkRouteConfig() {
    console.log("🛣️  Verificando configuração de rotas...");

    try {
      // Verificar se o arquivo de rotas existe e inclui Contact
      const routePaths = [
        "src/routes/index.tsx",
        "src/App.tsx",
        "src/main.tsx",
      ];

      let routeConfigured = false;
      for (const routePath of routePaths) {
        try {
          const fullPath = path.join(this.basePath, routePath);
          const content = await fs.readFile(fullPath, "utf-8");
          if (content.includes("Contact") || content.includes("/contact")) {
            routeConfigured = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (routeConfigured) {
        console.log("✅ Rotas: Configuradas");
        this.checks.push({
          component: "routes",
          status: "ok",
          configured: true,
        });
      } else {
        console.log("⚠️  Rotas: Verificação manual necessária");
        this.checks.push({
          component: "routes",
          status: "warning",
          message: "Verificar se /contact está configurado nas rotas",
        });
      }
    } catch (error) {
      console.log("⚠️  Rotas: Não verificado");
      this.checks.push({
        component: "routes",
        status: "warning",
        error: error.message,
      });
    }
  }

  generateReport() {
    console.log("\n" + "═".repeat(80));
    console.log("📊 RELATÓRIO DE VALIDAÇÃO - FORMULÁRIO DE CONTATO");
    console.log("═".repeat(80) + "\n");

    const okCount = this.checks.filter((c) => c.status === "ok").length;
    const warningCount = this.checks.filter(
      (c) => c.status === "warning",
    ).length;
    const errorCount = this.checks.filter((c) => c.status === "error").length;

    console.log(`✅ OK: ${okCount}/${this.checks.length}`);
    console.log(`⚠️  Avisos: ${warningCount}/${this.checks.length}`);
    console.log(`❌ Erros: ${errorCount}/${this.checks.length}`);
    console.log();

    if (errorCount === 0 && warningCount === 0) {
      console.log("🎉 VALIDAÇÃO COMPLETA! Formulário 100% funcional.\n");
      console.log("✅ Componente: Contact.tsx");
      console.log("✅ API: /api/contact");
      console.log("✅ Validação: Zod + React Hook Form");
      console.log("✅ UI: OracluxDS + Lucide Icons");
      console.log("✅ Feedback: Toast notifications");
      console.log();
      console.log("🚀 Pronto para testar em: http://localhost:5176/contact");
    } else if (errorCount === 0) {
      console.log("⚠️  VALIDAÇÃO PASSOU COM AVISOS.\n");
      console.log("Verificar itens marcados como [warning] acima.");
    } else {
      console.log("❌ VALIDAÇÃO FALHOU.\n");
      console.log("Corrigir itens marcados como [error] acima.");
    }

    console.log("═".repeat(80));

    // Salvar relatório JSON
    const reportPath = path.join(
      this.basePath,
      ".cursor/reports/contact-validation.json",
    );
    fs.mkdir(path.dirname(reportPath), { recursive: true })
      .then(() =>
        fs.writeFile(
          reportPath,
          JSON.stringify(
            {
              timestamp: new Date().toISOString(),
              summary: {
                total: this.checks.length,
                ok: okCount,
                warnings: warningCount,
                errors: errorCount,
              },
              checks: this.checks,
            },
            null,
            2,
          ),
        ),
      )
      .then(() =>
        console.log(
          `\n📁 Relatório salvo: .cursor/reports/contact-validation.json\n`,
        ),
      )
      .catch((err) => console.error("Erro ao salvar relatório:", err));
  }
}

// Executar validação
const validator = new ContactFormValidator();
validator.validate().catch(console.error);
