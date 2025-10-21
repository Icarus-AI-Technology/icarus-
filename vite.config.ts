import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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

