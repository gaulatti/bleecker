import type { Preview } from '@storybook/react-vite';

import './storybook.css';
import { ThemeProvider } from '../src/theme/theme-provider';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ],
  parameters: {
    a11y: {
      test: 'todo'
    },
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Foundations', 'Components', 'Layout', 'Templates']
      }
    }
  }
};

export default preview;
