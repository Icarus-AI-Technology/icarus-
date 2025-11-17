/**
 * Workers Starter - Inicializa todos os workers
 *
 * Execute com: npx tsx src/queues/start-workers.ts
 */

import { emailWorker } from "./workers/email.worker";
import { smsWorker } from "./workers/sms.worker";

console.log("🚀 Iniciando workers...\n");

// Verificar se Redis está disponível
import { redis } from "../config/queue";

redis
  .ping()
  .then(() => {
    console.log("✅ Redis conectado!\n");

    console.log("📧 Email Worker: Rodando");
    console.log("📱 SMS Worker: Rodando");

    console.log("\n✅ Todos os workers foram iniciados!");
    console.log("Pressione Ctrl+C para parar\n");
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com Redis:", error);
    console.error("\n💡 Certifique-se de que o Redis está rodando:");
    console.error("   docker run -d --name redis -p 6379:6379 redis:alpine");
    process.exit(1);
  });

// Tratamento de erros não capturados
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  process.exit(1);
});
