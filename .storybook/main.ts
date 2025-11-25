import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    // Keep only addons that are already installed to avoid resolve warnings
    '@storybook/addon-a11y',
  ],
  core: { builder: '@storybook/builder-vite' },
  docs: { autodocs: true },
  viteFinal: async (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      alias: { ...cfg.resolve?.alias, '@': path.resolve(__dirname, '../src') },
    },
    optimizeDeps: {
      ...(cfg as unknown as { optimizeDeps?: Record<string, unknown> }).optimizeDeps,
      // Exclude server-only libraries from pre-bundling to silence warnings
      exclude: ['pgvector', 'knex-pgvector'],
    },
  }),
};

export default config;
