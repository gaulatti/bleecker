import React, { act } from 'react';
import { createPortal } from 'react-dom';
import { describe, expect, test, vi } from 'vitest';

import {
  ModalLayerScope,
  useDebounce,
  useEventCallback,
  useMediaQuery,
  useModalBranch,
  useModalLayer,
  useMounted,
  usePresence,
  usePrevious
} from '../../src/utils/hooks';
import { keydown, render } from './helpers';

describe('simple hooks', () => {
  test('useMounted becomes true after mount', async () => {
    const seen: boolean[] = [];
    function Probe() {
      seen.push(useMounted());
      return null;
    }
    await render(<Probe />);
    expect(seen[0]).toBe(false);
    expect(seen.at(-1)).toBe(true);
  });

  test('useMediaQuery tracks changes and unsubscribes', async () => {
    const listeners = new Set<() => void>();
    let matches = false;
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      get matches() { return matches; },
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb)
    })) as unknown as typeof window.matchMedia;
    try {
      const seen: boolean[] = [];
      function Probe() {
        seen.push(useMediaQuery('(min-width: 1px)'));
        return null;
      }
      const view = await render(<Probe />);
      expect(seen.at(-1)).toBe(false);
      expect(listeners.size).toBe(1);
      matches = true;
      await act(async () => listeners.forEach(cb => cb()));
      expect(seen.at(-1)).toBe(true);
      await view.unmount();
      expect(listeners.size).toBe(0);
    } finally {
      window.matchMedia = original;
    }
  });

  test('useDebounce settles after the delay, with a default delay', async () => {
    vi.useFakeTimers();
    try {
      const seen: string[] = [];
      function Probe({ value, delay }: { value: string; delay?: number }) {
        seen.push(useDebounce(value, delay));
        return null;
      }
      const view = await render(<Probe value='a' delay={50} />);
      await view.rerender(<Probe value='b' delay={50} />);
      expect(seen.at(-1)).toBe('a');
      await act(async () => { vi.advanceTimersByTime(60); });
      expect(seen.at(-1)).toBe('b');
      await view.rerender(<Probe value='c' />);
      await act(async () => { vi.advanceTimersByTime(299); });
      expect(seen.at(-1)).toBe('b');
      await act(async () => { vi.advanceTimersByTime(2); });
      expect(seen.at(-1)).toBe('c');
    } finally {
      vi.useRealTimers();
    }
  });

  test('usePrevious returns the prior value', async () => {
    const seen: Array<number | undefined> = [];
    function Probe({ value }: { value: number }) {
      seen.push(usePrevious(value));
      return null;
    }
    const view = await render(<Probe value={1} />);
    expect(seen.at(-1)).toBeUndefined();
    await view.rerender(<Probe value={2} />);
    expect(seen.at(-1)).toBe(1);
  });

  test('useEventCallback is stable, follows the latest callback and tolerates none', async () => {
    const calls: string[] = [];
    const captured: Array<(value: string) => unknown> = [];
    function Probe({ callback }: { callback?: (value: string) => unknown }) {
      captured.push(useEventCallback(callback));
      return null;
    }
    const view = await render(<Probe callback={(value) => calls.push(`a:${value}`)} />);
    await view.rerender(<Probe callback={(value) => calls.push(`b:${value}`)} />);
    captured.at(-1)!('x');
    expect(calls).toEqual(['b:x']);
    expect(captured[0]).toBe(captured.at(-1));
    await view.rerender(<Probe />);
    expect(captured.at(-1)!('y')).toBeUndefined();
  });

  test('usePresence keeps the surface present through its exit and cancels pending exit on reopen', async () => {
    vi.useFakeTimers();
    try {
      const seen: Array<{ present: boolean; visible: boolean }> = [];
      function Probe({ open }: { open: boolean }) {
        seen.push(usePresence(open, 100));
        return null;
      }
      const view = await render(<Probe open />);
      await act(async () => { vi.advanceTimersByTime(30); });
      expect(seen.at(-1)).toEqual({ present: true, visible: true });
      await view.rerender(<Probe open={false} />);
      expect(seen.at(-1)).toEqual({ present: true, visible: false });
      await view.rerender(<Probe open />);
      await act(async () => { vi.advanceTimersByTime(200); });
      expect(seen.at(-1)).toEqual({ present: true, visible: true });
      await view.rerender(<Probe open={false} />);
      await act(async () => { vi.advanceTimersByTime(150); });
      expect(seen.at(-1)).toEqual({ present: false, visible: false });
    } finally {
      vi.useRealTimers();
    }
  });
});

function Layer({ open = true, onDismiss, children, label }: { open?: boolean; onDismiss: () => void; children?: React.ReactNode; label: string }) {
  const ref = useModalLayer<HTMLDivElement>(open, onDismiss);
  return (
    <ModalLayerScope layerRef={ref}>
      <div ref={ref} role='dialog' aria-label={label} tabIndex={-1} style={{ width: 200, height: 100 }}>
        {children}
      </div>
    </ModalLayerScope>
  );
}

const flushMicrotasks = () => act(async () => { await Promise.resolve(); });

describe('useModalLayer', () => {
  test('focuses the first control, dismisses on Escape and restores focus and scroll', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const dismiss = vi.fn();
    const view = await render(
      <Layer onDismiss={dismiss} label='one'>
        <button id='a'>a</button>
        <button id='b'>b</button>
      </Layer>
    );
    await flushMicrotasks();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement?.id).toBe('a');
    await keydown(document, 'Escape');
    expect(dismiss).toHaveBeenCalledTimes(1);
    await keydown(document, 'Enter');
    expect(dismiss).toHaveBeenCalledTimes(1);
    await view.unmount();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
  });

  test('wraps Tab and Shift+Tab, steps through the middle, and recovers stray focus', async () => {
    await render(
      <Layer onDismiss={() => undefined} label='one'>
        <button id='a'>a</button>
        <button id='b'>b</button>
        <button id='c'>c</button>
      </Layer>
    );
    await flushMicrotasks();
    const ids = () => document.activeElement?.id;
    await keydown(document, 'Tab');
    expect(ids()).toBe('b');
    await keydown(document, 'Tab', { shiftKey: true });
    expect(ids()).toBe('a');
    await keydown(document, 'Tab', { shiftKey: true });
    expect(ids()).toBe('c');
    await keydown(document, 'Tab');
    expect(ids()).toBe('a');
    (document.activeElement as HTMLElement).blur();
    await keydown(document, 'Tab');
    expect(ids()).toBe('a');
    (document.activeElement as HTMLElement).blur();
    await keydown(document, 'Tab', { shiftKey: true });
    expect(ids()).toBe('c');
    await keydown(document, 'Home');
    expect(ids()).toBe('c');
  });

  test('keeps focus on the layer when nothing inside it is focusable', async () => {
    await render(<Layer onDismiss={() => undefined} label='empty'><span>text</span></Layer>);
    await flushMicrotasks();
    const dialog = document.querySelector<HTMLElement>('[role=dialog]')!;
    expect(document.activeElement).toBe(dialog);
    await keydown(document, 'Tab');
    expect(document.activeElement).toBe(dialog);
  });

  test('treats one radio per named group as the single tab stop and honours positive tabindex ordering', async () => {
    await render(
      <Layer onDismiss={() => undefined} label='radios'>
        <form>
          <input type='radio' name='g' id='r1' />
          <input type='radio' name='g' id='r2' defaultChecked />
          <input type='radio' name='g' id='r3' />
          <input type='radio' name='solo' id='unnamed-group' />
          <input type='radio' id='noname' />
          <input type='radio' name='other' id='o1' />
          <input type='radio' name='other' id='o2' />
        </form>
        <input id='first' tabIndex={2} />
        <input id='second' tabIndex={1} />
        <input id='third' tabIndex={1} />
        <div id='editable' contentEditable suppressContentEditableWarning>x</div>
        <button id='off' disabled>off</button>
        <button id='hid' hidden>hid</button>
        <button id='aria' aria-hidden='true'>aria</button>
        <button id='invisible' style={{ visibility: 'hidden' }}>v</button>
      </Layer>
    );
    await flushMicrotasks();
    const order: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      order.push(document.activeElement?.id ?? '');
      await keydown(document, 'Tab');
    }
    expect(order.slice(0, 9)).toEqual(['second', 'third', 'first', 'r2', 'unnamed-group', 'noname', 'o1', 'editable', 'second']);
  });

  test('nested layers keep ancestry: the child is active and the parent regains focus on close', async () => {
    const outerDismiss = vi.fn();
    const innerDismiss = vi.fn();
    function Both({ inner }: { inner: boolean }) {
      return (
        <Layer onDismiss={outerDismiss} label='outer'>
          <button id='outer-btn'>outer</button>
          {inner ? createPortal(<Layer onDismiss={innerDismiss} label='inner'><button id='inner-btn'>inner</button></Layer>, document.body) : null}
        </Layer>
      );
    }
    const view = await render(<Both inner={false} />);
    await flushMicrotasks();
    expect(document.activeElement?.id).toBe('outer-btn');
    await view.rerender(<Both inner />);
    await flushMicrotasks();
    expect(document.activeElement?.id).toBe('inner-btn');
    await keydown(document, 'Escape');
    expect(innerDismiss).toHaveBeenCalledTimes(1);
    expect(outerDismiss).not.toHaveBeenCalled();
    await view.rerender(<Both inner={false} />);
    await flushMicrotasks();
    expect(document.activeElement?.id).toBe('outer-btn');
  });

  test('sibling layers stack by registration order and a closed layer is inert', async () => {
    const view = await render(
      <>
        <Layer onDismiss={() => undefined} label='first'><button id='f'>f</button></Layer>
        <Layer onDismiss={() => undefined} label='second'><button id='s'>s</button></Layer>
        <Layer open={false} onDismiss={() => undefined} label='closed'><button id='c'>c</button></Layer>
      </>
    );
    await flushMicrotasks();
    const [first, second, closed] = Array.from(document.querySelectorAll<HTMLElement>('[role=dialog]'));
    expect(first.inert).toBe(true);
    expect(second.inert).toBe(false);
    expect(closed.inert).toBe(true);
    await view.unmount();
  });

  test('recovers when the previously focused element is no longer connected', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const view = await render(<Layer onDismiss={() => undefined} label='one'><button id='a'>a</button></Layer>);
    await flushMicrotasks();
    trigger.remove();
    await view.unmount();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('useModalLayer edge cases', () => {
  test('orders sibling layers that share a parent by registration order', async () => {
    function Tree({ children }: { children: React.ReactNode }) {
      return (
        <Layer onDismiss={() => undefined} label='parent'>
          {children}
        </Layer>
      );
    }
    const view = await render(
      <Tree>
        {createPortal(<Layer onDismiss={() => undefined} label='child-a'><button id='ca'>a</button></Layer>, document.body)}
        {createPortal(<Layer onDismiss={() => undefined} label='child-b'><button id='cb'>b</button></Layer>, document.body)}
      </Tree>
    );
    await flushMicrotasks();
    expect(document.activeElement?.id).toBe('cb');
    const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role=dialog]'));
    expect(dialogs.map(dialog => dialog.inert)).toEqual([true, true, false]);
    await view.unmount();
  });

  test('treats a non-HTML focused element as having no focus to restore', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('tabindex', '0');
    document.body.append(svg);
    svg.focus();
    expect(document.activeElement).toBe(svg);
    const view = await render(<Layer onDismiss={() => undefined} label='one'><button id='a'>a</button></Layer>);
    await flushMicrotasks();
    await view.unmount();
    expect(document.activeElement).toBe(document.body);
  });

  test('works in a document without a window by focusing the layer itself', async () => {
    const detached = document.implementation.createHTMLDocument('detached');
    const host = detached.createElement('div');
    detached.body.append(host);
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(host);
    await act(async () => root.render(<Layer onDismiss={() => undefined} label='detached'><button id='a'>a</button></Layer>));
    await flushMicrotasks();
    const dialog = detached.querySelector<HTMLElement>('[role=dialog]')!;
    expect(detached.defaultView).toBeNull();
    expect(dialog.inert).toBe(false);
    await act(async () => root.unmount());
  });
});

describe('useModalBranch', () => {
  test('registers a portaled branch with its owner so focus and activity include it', async () => {
    function Branch() {
      const ref = useModalBranch<HTMLDivElement>();
      return <div ref={ref} id='branch'><button id='branch-btn'>b</button></div>;
    }
    function Outside() {
      const ref = useModalBranch<HTMLDivElement>();
      return <div ref={ref} id='outside'><button>x</button></div>;
    }
    await render(<Outside />);
    expect((document.querySelector('#outside') as HTMLElement).inert).toBe(false);
    function Owner({ branch }: { branch: boolean }) {
      return (
        <div data-bleecker-modal-overlay style={{ zIndex: 50 }}>
          <Layer onDismiss={() => undefined} label='owner'>
            <button id='own'>own</button>
            {branch ? <Branch /> : null}
          </Layer>
        </div>
      );
    }
    const view = await render(<Owner branch={false} />);
    await flushMicrotasks();
    await view.rerender(<Owner branch />);
    await flushMicrotasks();
    const branch = document.querySelector<HTMLElement>('#branch')!;
    expect(branch.inert).toBe(false);
    await keydown(document, 'Tab');
    expect(document.activeElement?.id).toBe('branch-btn');
    await keydown(document, 'Tab');
    expect(document.activeElement?.id).toBe('own');
    await view.unmount();
  });
});
