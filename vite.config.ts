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
        if (req.method !== 'POST') return next();
        try {
          const chunks: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (c) => chunks.push(Buffer.from(c)))
            req.on('end', () => resolve())
            req.on('error', reject)
          })
          const raw = Buffer.concat(chunks).toString('utf-8') || '{}'
          const data = JSON.parse(raw)
          // Minimal validation in dev to avoid noisy errors
          const hasRequired = typeof data?.name === 'string' && typeof data?.email === 'string' && typeof data?.message === 'string'
          if (!hasRequired) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: 'Invalid body' }))
            return
          }
          // Simulate async processing
          setTimeout(() => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          }, 150)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false }))
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
    port: 3000,
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

