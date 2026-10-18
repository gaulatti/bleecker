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
