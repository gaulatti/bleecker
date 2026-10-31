export function avatarInitial(author: string, init?: string): string {
  return init || (author.trim().slice(0, 1) || '?').toUpperCase();
}
