import { expect, test } from 'vitest';

import '../../src/utils/telemetry-flags';

test('telemetry-flags registers its hook on import', () => {
  expect((globalThis as { __bleeckerFlags?: { reducedMotion: boolean } }).__bleeckerFlags).toEqual({ reducedMotion: false });
});
