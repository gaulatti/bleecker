export function clampPercent(value: number, max: number): number {
  return Math.min(101, Math.max(0, (value / max) * 100));
}
