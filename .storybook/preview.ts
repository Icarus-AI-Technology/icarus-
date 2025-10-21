import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';
import '../src/styles/oraclusx-ds.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#e0e5ec',
        },
        {
          name: 'dark',
          value: '#2d3748',
        },
      ],
    },
  },
};

export default preview;

