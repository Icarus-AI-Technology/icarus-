/**
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
      cwd: "/users/daxmeneghel/icarus-make", // raiz do projeto
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
      cwd: "/users/daxmeneghel/icarus-make", // ajuste se necessario
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
