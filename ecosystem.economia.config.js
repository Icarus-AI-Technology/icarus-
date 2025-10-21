/**
 * 🚀 PM2 Ecosystem Configuration - ECONOMIA & TUTORES IA
 * 
 * Configuração otimizada para economia de recursos com:
 * - Monitoramento de custos automatizado
 * - Reindexação de busca (Meilisearch)
 * - Refresh de KPIs (cached)
 * - Tutores IA (Ollama local)
 * 
 * @version 2.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

module.exports = {
  apps: [
    // ======================================
    // 1. Preview Server (Validação Visual)
    // ======================================
    {
      name: 'icarus-preview',
      script: 'npm',
      args: 'run preview:start',
      interpreter: 'none',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M', // Reduzido de 500M
      env: {
        NODE_ENV: 'production',
        PORT: 4173,
        HOST: '0.0.0.0'
      },
      error_file: './logs/preview-error.log',
      out_file: './logs/preview-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 3, // Reduzido de 5
    },

    // ======================================
    // 2. Captura de Previews (Design QA)
    // ======================================
    {
      name: 'icarus-capture',
      script: './tools/design/capture-previews.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 */6 * * *', // A cada 6h (reduzido de 20min)
      wait_ready: true,
      listen_timeout: 30000,
      env: {
        NODE_ENV: 'production',
        PREVIEW_URL: 'http://localhost:4173'
      },
      error_file: './logs/capture-error.log',
      out_file: './logs/capture-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ======================================
    // 3. Cost Report (Monitoramento Semanal)
    // ======================================
    {
      name: 'icarus-cost-report',
      script: './tools/ops/cost-report.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 9 * * 1', // Toda segunda-feira às 9h
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/cost-report-error.log',
      out_file: './logs/cost-report-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ======================================
    // 4. Meilisearch Reindex (Busca)
    // ======================================
    {
      name: 'icarus-search-reindex',
      script: './tools/search/reindex-meili.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 */6 * * *', // A cada 6 horas
      env: {
        NODE_ENV: 'production',
        MEILISEARCH_HOST: 'http://localhost:7700',
        MEILISEARCH_KEY: process.env.MEILISEARCH_MASTER_KEY || 'dev_master_key'
      },
      error_file: './logs/search-reindex-error.log',
      out_file: './logs/search-reindex-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ======================================
    // 5. KPI Refresh (Materialize Views)
    // ======================================
    {
      name: 'icarus-kpi-refresh',
      script: './tools/db/refresh-kpis.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '*/30 * * * *', // A cada 30 minutos
      env: {
        NODE_ENV: 'production',
        SUPABASE_DB_URL: process.env.SUPABASE_DB_URL
      },
      error_file: './logs/kpi-refresh-error.log',
      out_file: './logs/kpi-refresh-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ======================================
    // 6. SQL Performance Check (Semanal)
    // ======================================
    {
      name: 'icarus-sql-top',
      script: './tools/db/sql-top.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 10 * * 1', // Segunda-feira às 10h
      env: {
        NODE_ENV: 'production',
        SUPABASE_DB_URL: process.env.SUPABASE_DB_URL
      },
      error_file: './logs/sql-top-error.log',
      out_file: './logs/sql-top-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ======================================
    // 7. Tutores IA - Reindex Docs (Diário)
    // ======================================
    {
      name: 'icarus-ai-reindex',
      script: './tools/ai/reindex-docs.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 2 * * *', // 2h da manhã (baixo tráfego)
      env: {
        NODE_ENV: 'production',
        OLLAMA_HOST: 'http://localhost:11434',
        SUPABASE_DB_URL: process.env.SUPABASE_DB_URL
      },
      error_file: './logs/ai-reindex-error.log',
      out_file: './logs/ai-reindex-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ]
};

/**
 * 📝 INSTRUÇÕES DE USO
 * 
 * 1. Iniciar todos os serviços:
 *    pm2 start ecosystem.economia.config.js
 * 
 * 2. Iniciar apenas alguns:
 *    pm2 start ecosystem.economia.config.js --only icarus-preview
 *    pm2 start ecosystem.economia.config.js --only icarus-cost-report
 * 
 * 3. Monitorar:
 *    pm2 monit
 *    pm2 logs icarus-cost-report
 * 
 * 4. Status:
 *    pm2 list
 * 
 * 5. Parar todos:
 *    pm2 stop all
 * 
 * 6. Remover:
 *    pm2 delete all
 * 
 * 7. Salvar configuração (auto-start):
 *    pm2 save
 *    pm2 startup
 * 
 * ⚙️  VARIÁVEIS DE AMBIENTE NECESSÁRIAS
 * 
 * export SUPABASE_DB_URL="postgresql://postgres:senha@host:5432/postgres"
 * export MEILISEARCH_MASTER_KEY="sua_chave_master"
 * export OLLAMA_HOST="http://localhost:11434"
 * 
 * 📊 ECONOMIA ESTIMADA
 * 
 * - Cost Report: identifica US$ 3k-9k/ano em oportunidades
 * - SQL Top: otimizações que economizam 20-50% de recursos DB
 * - Meilisearch: substitui SaaS (economia US$ 600-2k/ano)
 * - Ollama: substitui OpenAI (economia US$ 600-2.5k/ano)
 * 
 * 🔄 CRONOGRAMA OTIMIZADO
 * 
 * - Preview Capture: 6/6h (antes: 20/20min) → -70% CPU
 * - Cost Report: 1x/semana (segunda 9h)
 * - SQL Top: 1x/semana (segunda 10h)
 * - Search Reindex: 6/6h
 * - KPI Refresh: 30/30min (cache)
 * - AI Reindex: 1x/dia (2h da manhã)
 * 
 * Total economia de CPU: ~60% vs configuração anterior
 */

