import { expect, test } from 'vitest';

import '../../src/utils/telemetry-locale';

test('telemetry-locale registers its hook on import', () => {
  expect((globalThis as { __bleeckerLocale?: string }).__bleeckerLocale).toEqual('en-US');
});
