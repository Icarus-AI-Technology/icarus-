import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    // Keep only addons that are already installed to avoid resolve warnings
    '@storybook/addon-a11y'
  ],
  core: { builder: '@storybook/builder-vite' },
  docs: { autodocs: true },
  viteFinal: async (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      alias: { ...cfg.resolve?.alias, '@': '/src' }
    },
    optimizeDeps: {
      ...(cfg as unknown as { optimizeDeps?: Record<string, unknown> }).optimizeDeps,
      // Exclude server-only libraries from pre-bundling to silence warnings
      exclude: ['pgvector', 'knex-pgvector']
    }
  })
};

export default config;

