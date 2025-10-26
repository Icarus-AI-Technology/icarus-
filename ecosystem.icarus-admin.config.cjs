module.exports = {
  apps: [
    {
      name: 'icarus-admin-bootstrap',
      script: 'node',
      args: 'tools/admin/bootstrap-admin.mjs',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'dax@newortho.com.br',
        SUPABASE_DB_URL: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || ''
      }
    }
  ]
};


