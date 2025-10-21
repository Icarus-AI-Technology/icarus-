/**
 * 🔄 PM2 Ecosystem Configuration - Preview Automation
 * 
 * Gerencia o servidor de preview e a captura automática de screenshots
 * para validação visual contínua do ICARUS v5.0
 * 
 * @version 1.0.0
 * @date 2025-10-20
 */

module.exports = {
  apps: [
    // ======================================
    // 1. Servidor de Preview (Vite)
    // ======================================
    {
      name: 'icarus-preview-server',
      script: 'npm',
      args: 'run preview',
      interpreter: 'none',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4173,
        HOST: '0.0.0.0'
      },
      error_file: './logs/preview-server-error.log',
      out_file: './logs/preview-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 5,
    },
    
    // ======================================
    // 2. Captura de Screenshots (Agendado)
    // ======================================
    {
      name: 'icarus-preview-capture',
      script: './tools/design/capture-previews.js',
      interpreter: 'node',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      
      // Agendar execução: a cada 20 minutos
      // Formato cron: minuto hora dia mês dia-da-semana
      cron_restart: '*/20 * * * *',
      
      // Aguardar 30s após início do servidor antes da primeira captura
      wait_ready: true,
      listen_timeout: 30000,
      
      env: {
        NODE_ENV: 'production',
        PREVIEW_URL: 'http://localhost:4173'
      },
      error_file: './logs/preview-capture-error.log',
      out_file: './logs/preview-capture-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ]
};

/**
 * 📝 INSTRUÇÕES DE USO
 * 
 * 1. Instalar PM2 globalmente (se não tiver):
 *    npm install -g pm2
 * 
 * 2. Iniciar ambos os processos:
 *    pm2 start ecosystem.preview.config.js
 * 
 * 3. Monitorar:
 *    pm2 monit
 * 
 * 4. Ver logs:
 *    pm2 logs icarus-preview-server
 *    pm2 logs icarus-preview-capture
 * 
 * 5. Listar processos:
 *    pm2 list
 * 
 * 6. Parar processos:
 *    pm2 stop all
 *    pm2 stop icarus-preview-server
 *    pm2 stop icarus-preview-capture
 * 
 * 7. Reiniciar:
 *    pm2 restart all
 * 
 * 8. Remover processos:
 *    pm2 delete all
 * 
 * 9. Salvar configuração (iniciar no boot):
 *    pm2 save
 *    pm2 startup
 * 
 * ⏱️  CRONOGRAMA PADRÃO
 * - Servidor: sempre ativo
 * - Capturas: a cada 20 minutos (*/20 * * * *)
 * 
 * 🔧 AJUSTAR CRONOGRAMA
 * Edite a propriedade `cron_restart` conforme necessário:
 * - A cada 10 min: '*/10 * * * *'
 * - A cada 30 min: '*/30 * * * *'
 * - A cada 1 hora: '0 * * * *'
 * - A cada 2 horas: '0 */2 * * *'
 * - Diariamente às 9h: '0 9 * * *'
 */

