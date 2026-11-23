import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Fader, formatFaderValue, type FaderProps } from '../../src/components/fader';
import { Meter } from '../../src/components/meter';
import { keydown, render } from './helpers';

// gaulatti/bleecker#568: the console fader. Checked where it could go wrong on a live mixer: the
// keyboard steps and limits, the way back to unity, where a pointer lands on the track, and what a
// screen reader hears.

const q = (selector: string) => document.querySelector(selector)! as HTMLElement;
const slider = () => q('[role="slider"]');

/** A fader that keeps its own value, as a page would, and reports each change. */
function Held(props: Omit<FaderProps, 'value' | 'onValueChange'> & { initial: number; onChange?: (value: number) => void }) {
  const { initial, onChange, ...rest } = props;
  const [value, setValue] = React.useState(initial);
  return (
    <Fader
      {...rest}
      value={value}
      onValueChange={(next) => {
        onChange?.(next);
        setValue(next);
      }}
    />
  );
}

async function pointerAt(element: Element, type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number, clientY: number) {
  await act(async () => {
    element.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, clientX, clientY, pointerId: 1 }));
  });
}

describe('formatFaderValue', () => {
  test('reads dB with a sign and one decimal, and percent whole', () => {
    expect(formatFaderValue(-6, 'db')).toBe('−6.0 dB');
    expect(formatFaderValue(3, 'db')).toBe('+3.0 dB');
    expect(formatFaderValue(0, 'db')).toBe('0.0 dB');
    expect(formatFaderValue(-0.01, 'db')).toBe('0.0 dB');
    expect(formatFaderValue(75, 'percent')).toBe('75 %');
    expect(formatFaderValue(-5, 'percent')).toBe('−5 %');
  });
});

describe('Fader', () => {
  test('is a labelled vertical slider that announces its value with its unit', async () => {
    await render(<Held label='Music' unit='db' min={-60} max={10} unity={0} initial={-6} />);
    const s = slider();
    expect(s.getAttribute('aria-label')).toBe('Music');
    expect(s.getAttribute('aria-orientation')).toBe('vertical');
    expect(s.getAttribute('aria-valuemin')).toBe('-60');
    expect(s.getAttribute('aria-valuemax')).toBe('10');
    expect(s.getAttribute('aria-valuenow')).toBe('-6');
    expect(s.getAttribute('aria-valuetext')).toBe('−6.0 dB');
    expect(s.tabIndex).toBe(0);
    expect(q('output').textContent).toBe('−6.0 dB');
    expect(q('output').className).toContain('tabular-nums');
    expect(parseFloat(q('[data-fader="unity"]').style.bottom)).toBeCloseTo((60 / 70) * 100, 3);
  });

  test('arrows step, Shift and Page keys step coarse, Home and End go to the limits, and 0 returns to unity', async () => {
    const onChange = vi.fn();
    await render(<Held label='Music' unit='db' min={-60} max={10} unity={0} initial={-6} onChange={onChange} />);
    const s = slider();
    await keydown(s, 'ArrowUp');
    expect(s.getAttribute('aria-valuetext')).toBe('−5.5 dB');
    await keydown(s, 'ArrowLeft');
    await keydown(s, 'ArrowDown');
    expect(s.getAttribute('aria-valuenow')).toBe('-6.5');
    await keydown(s, 'ArrowUp', { shiftKey: true });
    expect(s.getAttribute('aria-valuenow')).toBe('-1.5');
    await keydown(s, 'ArrowRight', { shiftKey: true });
    expect(s.getAttribute('aria-valuenow')).toBe('3.5');
    await keydown(s, 'PageUp');
    expect(s.getAttribute('aria-valuenow')).toBe('8.5');
    await keydown(s, 'PageUp');
    expect(s.getAttribute('aria-valuenow')).toBe('10');
    await keydown(s, 'PageDown');
    expect(s.getAttribute('aria-valuenow')).toBe('5');
    await keydown(s, 'Home');
    expect(s.getAttribute('aria-valuenow')).toBe('-60');
    await keydown(s, 'End');
    expect(s.getAttribute('aria-valuenow')).toBe('10');
    await keydown(s, '0');
    expect(s.getAttribute('aria-valuetext')).toBe('0.0 dB');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  test('does not report a change at a limit, and leaves keys it does not use to the page', async () => {
    const onChange = vi.fn();
    await render(<Held label='Master' unit='db' min={-60} max={0} initial={0} onChange={onChange} />);
    await keydown(slider(), 'ArrowUp');
    expect(onChange).not.toHaveBeenCalled();
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    await act(async () => {
      slider().dispatchEvent(other);
    });
    expect(other.defaultPrevented).toBe(false);
    // No unity given: 0 does nothing and draws no mark.
    await keydown(slider(), '0');
    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector('[data-fader="unity"]')).toBeNull();
  });

  test('double-click returns to unity', async () => {
    await render(<Held label='Cartwall' unit='percent' min={0} max={100} unity={80} initial={25} />);
    await act(async () => {
      slider().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });
    expect(slider().getAttribute('aria-valuetext')).toBe('80 %');
  });

  test('a pointer sets the value where it lands on the track, and a drag follows it, from the bottom when vertical', async () => {
    await render(<Held label='Music' unit='percent' min={0} max={100} initial={0} length='200px' />);
    const box = slider().getBoundingClientRect();
    expect(Math.round(box.height)).toBe(200);
    const x = box.left + box.width / 2;
    await pointerAt(slider(), 'pointerdown', x, box.bottom - 50);
    expect(slider().getAttribute('aria-valuenow')).toBe('25');
    expect(document.activeElement).toBe(slider());
    await pointerAt(slider(), 'pointermove', x, box.top + 20);
    expect(slider().getAttribute('aria-valuenow')).toBe('90');
    await pointerAt(slider(), 'pointermove', x, box.top - 500);
    expect(slider().getAttribute('aria-valuenow')).toBe('100');
    await pointerAt(slider(), 'pointerup', x, box.top);
    // After release a move no longer changes it.
    await pointerAt(slider(), 'pointermove', x, box.bottom);
    expect(slider().getAttribute('aria-valuenow')).toBe('100');
    expect(q('[data-fader="fill"]').style.height).toBe('100%');
  });

  test('horizontal: from the left, with the fill as a width', async () => {
    await render(<Held label='Fade' unit='db' min={-20} max={0} initial={-20} orientation='horizontal' length='200px' step={1} />);
    expect(slider().getAttribute('aria-orientation')).toBe('horizontal');
    const box = slider().getBoundingClientRect();
    await pointerAt(slider(), 'pointerdown', box.left + 150, box.top + box.height / 2);
    expect(slider().getAttribute('aria-valuenow')).toBe('-5');
    expect(q('[data-fader="fill"]').style.width).toBe('75%');
    expect(q('[data-fader="horizontal"]')).not.toBeNull();
  });

  test('disabled: out of the tab order, and keys, pointer and double-click change nothing', async () => {
    const onChange = vi.fn();
    await render(<Held label='Stream' unit='db' min={-60} max={10} unity={0} initial={-12} disabled onChange={onChange} />);
    const s = slider();
    expect(s.tabIndex).toBe(-1);
    expect(s.getAttribute('aria-disabled')).toBe('true');
    await keydown(s, 'ArrowUp');
    const box = s.getBoundingClientRect();
    await pointerAt(s, 'pointerdown', box.left + 2, box.top + 2);
    await act(async () => {
      s.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  test('shows a value outside its range at the limit, and snaps to its step', async () => {
    const onChange = vi.fn();
    const { rerender } = await render(<Fader label='Trim' unit='db' min={-12} max={12} value={40} onValueChange={onChange} />);
    expect(slider().getAttribute('aria-valuenow')).toBe('12');
    await rerender(<Fader label='Trim' unit='db' min={-12} max={12} step={0.5} value={1.26} onValueChange={onChange} />);
    await keydown(slider(), 'ArrowUp');
    expect(onChange).toHaveBeenLastCalledWith(1.5);
    await keydown(slider(), 'ArrowDown');
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  test('pairs with a meter on the same scale, beside it and in its orientation', async () => {
    await render(<Held label='Music' unit='db' min={-60} max={0} initial={-6} meter={{ value: -30, peak: -15, hold: -3, warnFrom: -6 }} />);
    const meter = q('[role="meter"]');
    expect(meter.getAttribute('aria-label')).toBe('Music level');
    expect(meter.getAttribute('aria-valuemin')).toBe('-60');
    expect(meter.getAttribute('aria-valuemax')).toBe('0');
    expect(meter.getAttribute('aria-valuetext')).toBe('-30.0 dB');
    expect(meter.dataset.orientation).toBe('vertical');
    expect(q('[data-meter="fill"]').style.height).toBe('50%');
  });
});

describe('Fader edges', () => {
  test('a step of 0 leaves the value unsnapped', async () => {
    await render(<Held label='Free' unit='percent' min={0} max={100} initial={0} step={0} length='300px' />);
    const box = slider().getBoundingClientRect();
    await pointerAt(slider(), 'pointerdown', box.left + 1, box.bottom - 100);
    expect(Number(slider().getAttribute('aria-valuenow'))).toBeCloseTo(33.333, 2);
  });

  test('an empty range draws nothing filled, and a track with no size reads its minimum', async () => {
    await render(<Held label='Fixed' unit='db' min={0} max={0} initial={0} />);
    expect(q('[data-fader="fill"]').style.height).toBe('0%');
    document.body.innerHTML = '';
    const onChange = vi.fn();
    await render(<Held label='Flat' unit='db' min={-10} max={0} initial={-5} length='0px' onChange={onChange} />);
    await pointerAt(slider(), 'pointerdown', 0, 0);
    expect(onChange).toHaveBeenLastCalledWith(-10);
    document.body.innerHTML = '';
    await render(<Held label='Flat' unit='db' min={-10} max={0} initial={-5} length='0px' orientation='horizontal' onChange={onChange} />);
    await pointerAt(slider(), 'pointerdown', 0, 0);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test('stepping down from between steps goes to the step below it', async () => {
    const onChange = vi.fn();
    await render(<Fader label='Trim' unit='db' min={-12} max={12} value={1.74} onValueChange={onChange} />);
    await keydown(slider(), 'ArrowDown');
    expect(onChange).toHaveBeenLastCalledWith(1.5);
  });

  test('horizontal: the unity mark is placed from the left, and a percent meter reads in %', async () => {
    await render(<Held label='Send' unit='percent' min={0} max={100} unity={50} initial={20} orientation='horizontal' meter={{ value: 30 }} />);
    expect(q('[data-fader="unity"]').style.left).toBe('50%');
    expect(q('[role="meter"]').getAttribute('aria-valuetext')).toBe('30.0 %');
    expect(q('[data-meter="fill"]').style.width).toBe('30%');
  });
});

describe('Meter, vertical', () => {
  test('fills from the bottom and marks the peak, hold and warning zone along its height', async () => {
    await render(<Meter label='Level' value={25} min={0} max={100} peak={50} hold={95} warnFrom={90} orientation='vertical' />);
    expect(q('[role="meter"]').dataset.orientation).toBe('vertical');
    expect(q('[data-meter="fill"]').style.height).toBe('25%');
    expect(q('[data-meter="peak"]').style.bottom).toBe('calc(50% - 1px)');
    expect(q('[data-meter="warn"]').style.bottom).toBe('90%');
    expect(q('[data-meter="hold"]').className).toContain('bg-terracotta');
  });

  test('horizontal stays the default, with no orientation attribute', async () => {
    await render(<Meter label='Level' value={25} min={0} max={100} />);
    expect(q('[role="meter"]').dataset.orientation).toBeUndefined();
    expect(q('[data-meter="fill"]').style.width).toBe('25%');
  });
});
