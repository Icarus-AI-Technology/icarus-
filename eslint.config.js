import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'browser-tools-mcp',
      'ml-services',
      'playwright-report',
      'storybook-static',
      'public/test-diagnostic.html',
      'docs',
    ],
  },
  {
    extends: [...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^(?:_.*|index|i|valor|uf|onProgress|pdfFile|params|empresaId|err|error)$',
          varsIgnorePattern: '^(?:_.*|err|error|errorMsg|data|loading|navigate|connectToken|CacheStat|checkIcon|CRMCacheData|WorkflowState)$',
          ignoreRestSiblings: true,
        },
      ],
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '^(useAsync|useEvent|useDebouncedCallback)$',
        },
      ],
    },
  },
  {
    files: ['supabase/functions/**/*.ts', 'src/pages/examples/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
)

