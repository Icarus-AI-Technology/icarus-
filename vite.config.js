import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import path from 'path'

// Plugin para mockar a API de contato em desenvolvimento
function contactApiPlugin() {
  return {
    name: "dev-contact-api",
    configureServer(server) {
      server.middlewares.use("/api/contact", async (req, res, next) => {
        if (req.method === 'POST') {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simular processamento
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', () => {
            console.log('📧 [DEV API] Contact Form Received:', body);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Mensagem recebida com sucesso (DEV MODE)' }));
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    contactApiPlugin(),
    // Gzip compression para arquivos > 10KB
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10KB
    }),
    // Brotli compression (melhor compressão)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Aumentar limite de aviso para 1MB (ainda vamos otimizar)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Estratégia de chunking manual para melhor code-splitting
        manualChunks: (id) => {
          // Vendor chunks - bibliotecas externas
          if (id.includes('node_modules')) {
            // React core - separar react-dom que é maior
            if (id.includes('react-dom')) {
              return 'vendor-react-dom';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // UI Libraries
            if (id.includes('@heroui') || id.includes('@nextui')) {
              return 'vendor-heroui';
            }
            // Framer Motion (animações)
            if (id.includes('framer-motion') || id.includes('popmotion')) {
              return 'vendor-motion';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Microsoft Graph / MSAL
            if (id.includes('@microsoft') || id.includes('msal')) {
              return 'vendor-microsoft';
            }
            // Outros vendors
            return 'vendor-misc';
          }
          
          // App chunks - código da aplicação
          // Services de IA
          if (id.includes('/lib/services/ai/')) {
            return 'app-ai-services';
          }
          // Hooks
          if (id.includes('/hooks/')) {
            return 'app-hooks';
          }
          // Design System
          if (id.includes('/oraclusx-ds/')) {
            return 'app-design-system';
          }
        },
      },
    },
    // Otimizações adicionais
    minify: 'esbuild',
    sourcemap: false, // Desabilitar sourcemaps em produção
    target: 'es2020',
  },
})