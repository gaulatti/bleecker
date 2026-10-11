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
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[tabindex]'
].join(',');

function focusableElements(layer: HTMLElement) {
  return Array.from(layer.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) =>
    element.tabIndex >= 0 &&
    !element.matches(':disabled') &&
    !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility === 'visible'
  );
}

interface ModalEntry {
  layer: HTMLElement;
  previousFocus: HTMLElement | null;
}

interface ModalStack {
  entries: ModalEntry[];
  overflow: string;
}

// One scroll lock per document, including nested portals and out-of-order unmounts.
const modalStacks = new WeakMap<Document, ModalStack>();

/**
 * Attach the returned ref to the panel. Activation follows actual DOM
 * attachment, including panels mounted after an entrance-presence update.
 */
export function useModalLayer<T extends HTMLElement>(open: boolean, onDismiss: () => void) {
  const [layer, setLayer] = React.useState<T | null>(null);
  const layerRef = React.useRef<T>(null);
  const dismiss = useEventCallback(onDismiss);

  // Presence can attach the DOM on a later commit without changing `open`.
  // Preserve the public object-ref contract while tracking those attachments.
  React.useLayoutEffect(() => {
    const node = layerRef.current;
    // An exit animation keeps the panel mounted after it stops being modal.
    if (node) node.inert = !open;
    setLayer(node);
  });

  React.useEffect(() => {
    if (!open || !layer) return undefined;

    const doc = layer.ownerDocument;
    let stack = modalStacks.get(doc);
    if (!stack) {
      stack = { entries: [], overflow: doc.body.style.overflow };
      modalStacks.set(doc, stack);
      doc.body.style.overflow = 'hidden';
    }
    const entry: ModalEntry = {
      layer,
      previousFocus: doc.activeElement instanceof HTMLElement ? doc.activeElement : null
    };
    stack.entries.push(entry);
    const isActive = () => stack.entries.at(-1) === entry;
    const focusFirst = () => (focusableElements(layer)[0] ?? layer).focus({ preventScroll: true });
    focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive() || event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = focusableElements(layer);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        layer.focus({ preventScroll: true });
      } else if (!focusable.includes(doc.activeElement as HTMLElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    doc.addEventListener('keydown', handleKeyDown);
    return () => {
      doc.removeEventListener('keydown', handleKeyDown);
      const wasActive = isActive();
      const index = stack.entries.indexOf(entry);
      // A child must return to the original trigger if its parent disappears.
      for (const successor of stack.entries.slice(index + 1)) {
        if (successor.previousFocus && layer.contains(successor.previousFocus)) successor.previousFocus = entry.previousFocus;
      }
      stack.entries.splice(index, 1);
      const parent = stack.entries.at(-1);
      if (!parent) {
        doc.body.style.overflow = stack.overflow;
        modalStacks.delete(doc);
      }
      if (!wasActive) return;
      const previous = entry.previousFocus;
      if (previous?.isConnected && (!parent || parent.layer.contains(previous))) {
        previous.focus({ preventScroll: true });
      } else if (parent) {
        (focusableElements(parent.layer)[0] ?? parent.layer).focus({ preventScroll: true });
      }
    };
  }, [dismiss, layer, open]);

  return layerRef;
}
