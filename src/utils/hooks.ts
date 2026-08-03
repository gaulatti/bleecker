import * as React from 'react';

/**
 * Returns true once the component has mounted. Useful for avoiding SSR
 * hydration mismatches in components that read from `window`/`document`.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Subscribes to a media query and returns its current match state.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/**
 * Tracks whether a debounced value has settled.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handler = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

/**
 * Returns the previous value of a prop/state.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>(undefined);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Returns a stable callback that always calls the latest callback reference
 * without causing effect re-runs.
 */
export function useEventCallback<T extends (...args: any[]) => any>(callback?: T): T {
  const ref = React.useRef<T | undefined>(callback);
  React.useEffect(() => {
    ref.current = callback;
  }, [callback]);
  return React.useCallback((...args: Parameters<T>) => ref.current?.(...args), []) as T;
}
