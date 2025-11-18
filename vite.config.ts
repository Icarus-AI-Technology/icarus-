import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import type { IncomingMessage } from 'http';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), contactApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts': ['recharts', '@nivo/bar', '@nivo/line', '@nivo/pie'],
          'vendor-utils': ['clsx', 'date-fns', 'lucide-react'],
          
          // Supabase isolado
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Otimizações adicionais
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});

function contactApiPlugin(): Plugin {
  return {
    name: 'dev-contact-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        const method = req.method ?? 'GET';

        if (!['POST', 'OPTIONS'].includes(method)) {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
          return;
        }

        try {
          const body = await parseRequestBody(req);
          (req as VercelRequest).body = body;
          const { default: contactHandler } = await import('./api/contact.ts');
          await contactHandler(
            req as unknown as VercelRequest,
            res as unknown as VercelResponse,
          );
        } catch (error) {
          console.error('dev-contact-api error', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Internal server error' }));
        }
      });
    },
  };
}

async function parseRequestBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
