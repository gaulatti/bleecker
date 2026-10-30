import { expect, test } from 'vitest';

import '../../src/utils/telemetry-probe';

test('telemetry-probe registers its hook on import', () => {
  expect((globalThis as { __bleeckerTelemetry?: { events: string[] } }).__bleeckerTelemetry).toEqual({ events: [] });
});
