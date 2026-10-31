export function describeSource(sourceUrl: string): string {
  try {
    const parsed = new URL(sourceUrl);
    return parsed.host;
  } catch {
    return 'Source article';
  }
}
