import type { Preview } from '@storybook/react-vite';

import '../src/styles/compiled.css';
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
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Foundations', 'Components', 'Layout']
      }
    }
  }
};

export default preview;
