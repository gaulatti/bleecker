export function describeSource(sourceUrl: string): string {
  try {
    const parsed = new URL(sourceUrl);
    return parsed.hostname;
  } catch {
    return 'Source article';
  }
}
