'use client';

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
 * Keeps a conditional surface mounted long enough for its exit motion to
 * complete, and separates DOM presence from visual visibility.
 */
export function usePresence(open: boolean, exitDuration = 150) {
  const [present, setPresent] = React.useState(open);
  const [visible, setVisible] = React.useState(false);
  const enterTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (open) {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setPresent(true);
      return;
    }

    setVisible(false);
    if (present) {
      exitTimerRef.current = setTimeout(() => setPresent(false), exitDuration);
    }
  }, [exitDuration, open, present]);

  React.useLayoutEffect(() => {
    if (!open || !present) return;
    enterTimerRef.current = setTimeout(() => setVisible(true), 20);
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [open, present]);

  React.useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  return { present, visible };
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

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Supplies the focus, Escape, and scroll-lock behavior expected of custom
 * modal surfaces such as sheets and drawers.
 */
export function useModalLayer<T extends HTMLElement>(open: boolean, onDismiss: () => void) {
  const layerRef = React.useRef<T>(null);
  const dismiss = useEventCallback(onDismiss);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;

    const layer = layerRef.current;
    if (!layer) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = Array.from(layer.querySelectorAll<HTMLElement>(focusableSelector));
    (focusable[0] ?? layer).focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key !== 'Tab') return;
      const currentFocusable = Array.from(layer.querySelectorAll<HTMLElement>(focusableSelector));
      if (currentFocusable.length === 0) {
        event.preventDefault();
        layer.focus();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [dismiss, open]);

  return layerRef;
}
