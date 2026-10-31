import { cn } from './cn';

export function mergeClasses(base: string, extra?: string): string {
  return cn(base, extra);
}
