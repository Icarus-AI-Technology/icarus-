import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
function contactApiPlugin() {
  return {
    name: 'dev-contact-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res, next) => {
        // CORS headers
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        // Handle preflight request
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        // Only allow POST requests
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
          return;
        }

        try {
          const chunks: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (c) => chunks.push(Buffer.from(c)))
            req.on('end', () => resolve())
            req.on('error', reject)
          })
          const raw = Buffer.concat(chunks).toString('utf-8') || '{}'
          const data = JSON.parse(raw)
          
          // Validação básica
          if (!data.name || typeof data.name !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Nome é obrigatório' }));
            return;
          }

          if (!data.email || typeof data.email !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Email é obrigatório' }));
            return;
          }

          if (!data.message || typeof data.message !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Mensagem é obrigatória' }));
            return;
          }

          // Validação de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Email inválido' }));
            return;
          }

          // Log da mensagem (DEV MODE)
          console.log('📧 [DEV] Nova mensagem de contato:', {
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
            timestamp: new Date().toISOString(),
          });

          // Simular delay de processamento
          setTimeout(() => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              ok: true, 
              message: 'Mensagem enviada com sucesso!' 
            }));
          }, 500);
        } catch (err) {
          console.error('❌ [DEV] Erro ao processar mensagem de contato:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Erro interno do servidor' }));
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), contactApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['@nivo/core', '@nivo/line', '@nivo/bar', '@nivo/pie'],
          ui: ['lucide-react'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* em produção
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false, // Melhora velocidade de build
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: [
        '**/gpt-researcher-env/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/testsprite_tests/**',
        '**/*.log',
      ]
    }
  },
  preview: {
    port: 4173,
    host: true,
  },
  optimizeDeps: {
    exclude: ['gpt-researcher-env']
  }
})

