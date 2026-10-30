export function normalizeHue(hue: number): number {
  return ((Math.round(Number.isFinite(hue) ? hue : 210) % 360) + 360) % 360;
}
