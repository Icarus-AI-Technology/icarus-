import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/styles/globals.css';
import '../src/styles/oraclusx-ds.css';

export const globalTypes = {
  theme: { name: 'Theme', defaultValue: 'light', toolbar: { icon: 'contrast', items: ['light', 'dark'] } }
};

export const decorators = [
  (Story: React.FC, ctx: { globals: { theme?: string } }) => {
    document.documentElement.classList.toggle('dark', ctx.globals.theme === 'dark');
    return Story();
  }
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/ }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#e0e5ec' },
        { name: 'dark', value: '#2d3748' }
      ]
    }
  }
};

export default preview;

