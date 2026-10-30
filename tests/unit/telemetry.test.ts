import { expect, test } from 'vitest';

import '../../src/utils/telemetry';

test('telemetry registers its hook on import', () => {
  expect((globalThis as { __bleeckerHooks?: string[] }).__bleeckerHooks).toEqual(['telemetry']);
});
