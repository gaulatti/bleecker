import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              { browser: 'chromium' },
              {
                browser: 'chromium',
                name: 'modal-mobile-reduced-motion',
                include: ['stories/components/{Drawer,Sheet}.stories.tsx'],
                provider: playwright({ contextOptions: { reducedMotion: 'reduce' } })
              }
            ]
          }
        }
      },
      {
        extends: true,
        resolve: { dedupe: ['react', 'react-dom'] },
        optimizeDeps: {
          include: [
            'react',
            'react/jsx-dev-runtime',
            'react-dom',
            'react-dom/client',
            'clsx',
            'tailwind-merge',
            'lucide-react',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-compose-refs',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-tooltip',
            '@tanstack/react-table',
            'recharts'
          ]
        },
        test: {
          name: 'unit',
          // Run after the Storybook and contrast projects instead of beside them: parallel
          // browsers on a small CI runner slow the timing-sensitive interaction stories.
          sequence: { groupOrder: 1 },
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }]
          }
        }
      },
      {
        extends: true,
        test: {
          name: 'ssr',
          sequence: { groupOrder: 1 },
          environment: 'node',
          include: ['tests/ssr/**/*.test.{ts,tsx}']
        }
      },
      {
        extends: true,
        plugins: [tailwindcss()],
        test: {
          name: 'button-link-contrast',
          include: ['tests/button-link.browser.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }]
          }
        }
      },
      {
        extends: true,
        plugins: [tailwindcss()],
        test: {
          name: 'control-focus-contrast',
          include: ['tests/control-focus.browser.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }]
          }
        }
      }
    ]
  }
});
