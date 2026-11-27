import React, { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ArmTake } from '../../src/components/arm-take';
import { KeyCap } from '../../src/components/key-cap';
import { Meter } from '../../src/components/meter';
import { OnAirStrip } from '../../src/components/on-air-strip';
import { SegmentedFilter } from '../../src/components/segmented-filter';
import { StatePill } from '../../src/components/state-pill';
import { StatusBadge } from '../../src/components/status-badge';
import { Transport } from '../../src/components/transport';
import { click, keydown, render } from './helpers';

// gaulatti/bleecker#551: the console components proposed in #549, at the boundary where each
// could go wrong on a live surface: arming and taking, keyboard control, and the reduced-motion path.

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const q = (selector: string) => document.querySelector(selector)!;

async function pointer(element: Element, type: 'pointerdown' | 'pointerup' | 'pointerleave') {
  await act(async () => {
    element.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true }));
  });
}

function fakeAnimationClock() {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] });
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe('ArmTake', () => {
  test('takes after a hold of the hold time, shows progress, and the click that ends the hold does not arm', async () => {
    fakeAnimationClock();
    const onTake = vi.fn();
    await render(<ArmTake label='Hold to take' onTake={onTake} holdMs={800} />);
    const button = q('button');
    await pointer(button, 'pointerdown');
    await advance(400);
    expect((q('[data-arm-fill]') as HTMLElement).style.width).toMatch(/^[1-9]/);
    expect(onTake).not.toHaveBeenCalled();
    await advance(500);
    expect(onTake).toHaveBeenCalledTimes(1);
    await pointer(button, 'pointerup');
    await click(button);
    expect(onTake).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('data-armed')).toBe('false');
  });

  test('a release before the hold time takes nothing', async () => {
    fakeAnimationClock();
    const onTake = vi.fn();
    await render(<ArmTake label='Hold to take' onTake={onTake} holdMs={800} />);
    const button = q('button');
    await pointer(button, 'pointerdown');
    await advance(300);
    await pointer(button, 'pointerup');
    await advance(900);
    expect(onTake).not.toHaveBeenCalled();
    expect((q('[data-arm-fill]') as HTMLElement).style.width).toBe('0%');
  });

  test('one click never takes: the first press arms, the second takes', async () => {
    const onTake = vi.fn();
    await render(<ArmTake label='Take' onTake={onTake} />);
    const button = q('button');
    await click(button);
    expect(onTake).not.toHaveBeenCalled();
    expect(button.getAttribute('data-armed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Take: armed, press again to take');
    expect(button.textContent).toContain('Press again to take');
    expect(q('[role="status"]').textContent).toContain('Armed');
    await click(button);
    expect(onTake).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('data-armed')).toBe('false');
    // A single click again only arms.
    await click(button);
    expect(onTake).toHaveBeenCalledTimes(1);
  });

  test('keeps every armed string byte-identical without armedLabel', async () => {
    await render(<ArmTake label='Take' onTake={vi.fn()} />);
    const button = q('button');
    await click(button);
    expect(button.getAttribute('aria-label')).toBe('Take: armed, press again to take');
    expect(q('button > span.relative').textContent).toBe('Press again to take');
    expect(q('[role="status"]').textContent).toBe('Armed. Press again within the time shown to take.');
  });

  // gaulatti/bleecker#597: Fade to black sits under Take to program, and an armed fade that says
  // "press again to take" points the operator at the wrong control.
  test('says what the second press does with armedLabel, never "take", and still needs two presses', async () => {
    const onTake = vi.fn();
    await render(<ArmTake label='Fade to black' armedLabel='Press again to fade' onTake={onTake} />);
    const button = q('button');
    expect(button.textContent).toContain('Fade to black');
    await click(button);
    expect(onTake).not.toHaveBeenCalled();
    expect(q('button > span.relative').textContent).toBe('Press again to fade');
    expect(button.getAttribute('aria-label')).toBe('Fade to black: armed. Press again to fade');
    expect(q('[role="status"]').textContent).toBe('Armed. Press again to fade.');
    for (const text of [button.getAttribute('aria-label'), q('button > span.relative').textContent, q('[role="status"]').textContent])
      expect(text).not.toMatch(/take/i);
    await keydown(button, 'Escape');
    expect(button.getAttribute('data-armed')).toBe('false');
    expect(q('[role="status"]').textContent).toBe('');
    await click(button);
    await click(button);
    expect(onTake).toHaveBeenCalledTimes(1);
  });

  test('an armed control disarms itself after the arm time, and on Escape or blur', async () => {
    fakeAnimationClock();
    const onTake = vi.fn();
    await render(<ArmTake label='Take' onTake={onTake} armTimeoutMs={5000} />);
    const button = q('button') as HTMLButtonElement;
    await click(button);
    await advance(4900);
    expect(button.getAttribute('data-armed')).toBe('true');
    await advance(200);
    expect(button.getAttribute('data-armed')).toBe('false');
    await click(button);
    expect(onTake).not.toHaveBeenCalled();

    await keydown(button, 'Escape');
    expect(button.getAttribute('data-armed')).toBe('false');
    await click(button);
    await act(async () => {
      button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      button.blur();
    });
    await click(button);
    expect(onTake).not.toHaveBeenCalled();
  });

  test('with reduced motion there is no hold, only the two presses', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) => ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) as MediaQueryList
    );
    fakeAnimationClock();
    const onTake = vi.fn();
    await render(<ArmTake label='Take' onTake={onTake} holdMs={800} />);
    const button = q('button');
    await pointer(button, 'pointerdown');
    await advance(2000);
    expect(onTake).not.toHaveBeenCalled();
    expect((q('[data-arm-fill]') as HTMLElement).style.width).toBe('0%');
    await pointer(button, 'pointerup');
    await click(button);
    await click(button);
    expect(onTake).toHaveBeenCalledTimes(1);
  });

  test('a disabled control does nothing', async () => {
    fakeAnimationClock();
    const onTake = vi.fn();
    await render(<ArmTake label='Take' onTake={onTake} disabled />);
    const button = q('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await pointer(button, 'pointerdown');
    await advance(2000);
    await click(button);
    expect(onTake).not.toHaveBeenCalled();
  });
});

describe('Transport', () => {
  function transport(overrides: Partial<React.ComponentProps<typeof Transport>> = {}) {
    const props = { title: 'Harbor Lights', subtitle: 'Song', duration: 214, position: 72, playing: false, onToggle: vi.fn(), onSeek: vi.fn(), onPrev: vi.fn(), onNext: vi.fn(), ...overrides };
    return { props, node: <Transport {...props} /> };
  }

  test('shows what is loaded, the time and the cue marks, and its buttons act', async () => {
    const { props, node } = transport({ cues: [{ at: 0.4, label: 'In 0:00.4' }, { at: 209.8, label: 'Out 3:29.8' }] });
    await render(node);
    expect(document.body.textContent).toContain('Harbor Lights');
    expect(document.body.textContent).toContain('1:12 / 3:34');
    expect(document.querySelectorAll('[data-transport="cue"]')).toHaveLength(2);
    expect(q('[role="slider"]').getAttribute('aria-valuetext')).toBe('1:12 of 3:34');
    await click(q('button[aria-label="Play"]'));
    await click(q('button[aria-label="Previous"]'));
    await click(q('button[aria-label="Next"]'));
    expect(props.onToggle).toHaveBeenCalledTimes(1);
    expect(props.onPrev).toHaveBeenCalledTimes(1);
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  test('shows Pause while playing', async () => {
    await render(transport({ playing: true }).node);
    expect(q('button[aria-label="Pause"]')).toBeTruthy();
  });

  test('on the timeline Space toggles and the arrows, Home and End seek, within the length', async () => {
    const { props, node } = transport({ position: 72 });
    await render(node);
    const slider = q('[role="slider"]');
    await keydown(slider, ' ');
    expect(props.onToggle).toHaveBeenCalledTimes(1);
    await keydown(slider, 'ArrowRight');
    expect(props.onSeek).toHaveBeenLastCalledWith(77);
    await keydown(slider, 'ArrowLeft');
    expect(props.onSeek).toHaveBeenLastCalledWith(67);
    await keydown(slider, 'Home');
    expect(props.onSeek).toHaveBeenLastCalledWith(0);
    await keydown(slider, 'End');
    expect(props.onSeek).toHaveBeenLastCalledWith(214);
    await keydown(slider, 'a');
    expect(props.onSeek).toHaveBeenCalledTimes(4);
  });

  test('keeps the seek inside the length at both ends', async () => {
    const near = transport({ position: 212 });
    await render(near.node);
    await keydown(q('[role="slider"]'), 'ArrowRight');
    expect(near.props.onSeek).toHaveBeenLastCalledWith(214);
    document.body.innerHTML = '';
    const start = transport({ position: 2 });
    await render(start.node);
    await keydown(q('[role="slider"]'), 'ArrowLeft');
    expect(start.props.onSeek).toHaveBeenLastCalledWith(0);
  });

  test('a click on the timeline seeks to that place', async () => {
    const { props, node } = transport();
    await render(node);
    const slider = q('[role="slider"]') as HTMLElement;
    const box = slider.getBoundingClientRect();
    await act(async () => {
      slider.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: box.left + box.width / 2 }));
    });
    expect((props.onSeek as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeCloseTo(107, 0);
  });

  test('has no timeline when the length is unknown, and cannot seek without onSeek or while disabled', async () => {
    await render(transport({ duration: null }).node);
    expect(document.querySelector('[role="slider"]')).toBeNull();
    expect(document.body.textContent).toContain('0:00 / —'.replace('0:00', '1:12'));
    document.body.innerHTML = '';
    const readOnly = transport({ onSeek: undefined, onPrev: undefined, onNext: undefined });
    await render(readOnly.node);
    await keydown(q('[role="slider"]'), 'ArrowRight');
    expect((q('button[aria-label="Previous"]') as HTMLButtonElement).disabled).toBe(true);
    expect((q('button[aria-label="Next"]') as HTMLButtonElement).disabled).toBe(true);
    document.body.innerHTML = '';
    const off = transport({ disabled: true });
    await render(off.node);
    expect((q('button[aria-label="Play"]') as HTMLButtonElement).disabled).toBe(true);
    const slider = q('[role="slider"]') as HTMLElement;
    await act(async () => {
      slider.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10 }));
    });
    expect(off.props.onSeek).not.toHaveBeenCalled();
  });
});

describe('StatePill, KeyCap and Meter', () => {
  test('StatePill states its tone and label, and pulses only when asked', async () => {
    await render(<StatePill tone='live' label='On air' pulse title='Live now' className='x' />);
    const pill = q('[data-tone="live"]');
    expect(pill.textContent).toBe('On air');
    expect(pill.getAttribute('title')).toBe('Live now');
    expect(pill.className).toContain('x');
    expect(pill.querySelector('i')!.className).toContain('animate-pulse');
    document.body.innerHTML = '';
    await render(<StatePill tone='bad' label='Failed' />);
    expect(q('[data-tone="bad"] i').className).not.toContain('animate-pulse');
  });

  // gaulatti/bleecker#588: the console shows no text under 12 px, so the default size is 12 px.
  test('StatePill and StatusBadge are 12 px by default, and 11 px only when asked', async () => {
    await render(<><StatePill tone='ok' label='Ready' /><StatePill tone='ok' label='Dense' size='sm' /></>);
    const [medium, small] = [...document.querySelectorAll('[data-tone="ok"]')];
    expect(medium.getAttribute('data-size')).toBe('md');
    expect(medium.className).toContain('text-xs');
    expect(medium.className).toContain('h-6');
    expect(medium.className).not.toContain('text-[11px]');
    expect(small.getAttribute('data-size')).toBe('sm');
    expect(small.className).toContain('text-[11px]');
    expect(small.className).toContain('h-[22px]');
    document.body.innerHTML = '';
    await render(<><StatusBadge label='LIVE' variant='live' /><StatusBadge label='Dense' size='sm' description='note' className='wrap' /></>);
    const [badge, dense] = [...document.querySelectorAll('[data-size]')];
    expect(badge.getAttribute('data-size')).toBe('md');
    expect(badge.className).toContain('text-xs');
    expect(badge.className).not.toContain('text-[11px]');
    expect(dense.className).toContain('text-[11px]');
    expect(dense.parentElement!.className).toContain('wrap');
    expect(dense.parentElement!.textContent).toBe('Densenote');
  });

  test('KeyCap renders one cap, or a chord with its name', async () => {
    await render(<><KeyCap>Space</KeyCap><KeyCap keys={['⌘', 'K']} className='c' /></>);
    const caps = document.querySelectorAll('kbd');
    expect([...caps].map((cap) => cap.textContent)).toEqual(['Space', '⌘', 'K']);
    expect(q('[role="group"]').getAttribute('aria-label')).toBe('⌘ K');
    expect(caps[1].className).toContain('c');
  });

  test('Meter draws the level, peak and hold on its scale, with the warning zone and a hold in it', async () => {
    await render(<Meter label='Level' value={25} min={0} max={100} peak={50} hold={95} warnFrom={90} unit='%' />);
    const meter = q('[role="meter"]');
    expect(meter.getAttribute('aria-valuenow')).toBe('25');
    expect(meter.getAttribute('aria-valuetext')).toBe('25.0 %');
    expect((q('[data-meter="fill"]') as HTMLElement).style.width).toBe('25%');
    expect((q('[data-meter="peak"]') as HTMLElement).style.left).toBe('calc(50% - 1px)');
    expect((q('[data-meter="warn"]') as HTMLElement).style.left).toBe('90%');
    expect(q('[data-meter="hold"]').className).toContain('bg-terracotta');
  });

  test('Meter shows no level for null, clamps out of range values and has no zone without warnFrom', async () => {
    await render(<Meter label='Level' value={null} min={-30} max={0} />);
    expect(q('[role="meter"]').getAttribute('aria-valuetext')).toBe('No level');
    expect(document.querySelector('[data-meter="fill"]')).toBeNull();
    expect(document.querySelector('[data-meter="warn"]')).toBeNull();
    document.body.innerHTML = '';
    await render(<Meter label='Level' value={999} min={0} max={10} hold={-5} />);
    expect((q('[data-meter="fill"]') as HTMLElement).style.width).toBe('100%');
    expect(q('[data-meter="hold"]').className).toContain('bg-accent-text');
    document.body.innerHTML = '';
    await render(<Meter label='Flat' value={1} min={5} max={5} />);
    expect((q('[data-meter="fill"]') as HTMLElement).style.width).toBe('0%');
  });
});

describe('SegmentedFilter', () => {
  const options = [
    { value: 'all', label: 'All', count: 8 },
    { value: 'failed', label: 'Failed' }
  ];

  test('names the group, shows counts, reports a change, and never deselects', async () => {
    const onChange = vi.fn();
    await render(<SegmentedFilter label='Analysis state' options={options} value='all' onChange={onChange} />);
    expect(q('[aria-label="Analysis state"]')).toBeTruthy();
    const buttons = [...document.querySelectorAll('button')];
    expect(buttons[0].textContent).toBe('All8');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    await click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith('failed');
    await click(buttons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('OnAirStrip', () => {
  test('says on air with what plays, what is next, the chips and the clock', async () => {
    await render(
      <OnAirStrip state='live' now={{ title: 'Harbor Lights', detail: 'Marisol' }} next={{ title: 'Copper', detail: '4:01' }} pills={[{ tone: 'ok', label: 'Stream verified' }]} clock='13:14:48' />
    );
    const strip = q('section[aria-label="On air"]');
    expect(strip.getAttribute('data-state')).toBe('live');
    expect(strip.textContent).toContain('On air');
    expect(strip.textContent).toContain('Harbor Lights');
    expect(strip.textContent).toContain('Copper');
    expect(strip.textContent).toContain('Stream verified');
    expect(strip.textContent).toContain('13:14:48');
  });

  test('says armed and off air, with its own words when given', async () => {
    await render(<OnAirStrip state='armed' now={{ title: 'Station ID' }} />);
    expect(q('[data-tone="arm"]').textContent).toBe('Armed');
    document.body.innerHTML = '';
    await render(<OnAirStrip state='idle' idleText='Nothing cued' />);
    expect(q('[data-tone="idle"]').textContent).toBe('Off air');
    expect(document.body.textContent).toContain('Nothing cued');
    expect(document.querySelector('[aria-label="On air"] p + p')).toBeNull();
    document.body.innerHTML = '';
    await render(<OnAirStrip state='live' stateLabel='Status delayed' now={{ title: 'x' }} />);
    expect(q('[data-tone="live"]').textContent).toBe('Status delayed');
  });
});

describe('edges that only show on a live surface', () => {
  test('ArmTake ignores a frame that arrives after the hold has ended, and stops its frame when removed mid-hold', async () => {
    vi.useFakeTimers({ toFake: ['performance', 'setTimeout', 'clearTimeout'] });
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => callbacks.push(callback));
    const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const onTake = vi.fn();
    const view = await render(<ArmTake label='Hold to take' onTake={onTake} holdMs={800} />);
    const button = q('button');
    await pointer(button, 'pointerdown');
    await pointer(button, 'pointerup');
    // The browser delivers the frame that was already queued: the released hold takes nothing.
    await act(async () => callbacks[0](performance.now() + 2000));
    expect(onTake).not.toHaveBeenCalled();
    await pointer(button, 'pointerdown');
    await view.unmount();
    expect(cancel).toHaveBeenCalled();
  });

  test('ArmTake: another key, or Escape while not armed, changes nothing', async () => {
    const onTake = vi.fn();
    await render(<ArmTake label='Take' onTake={onTake} />);
    const button = q('button');
    await keydown(button, 'Escape');
    await click(button);
    await keydown(button, 'a');
    expect(button.getAttribute('data-armed')).toBe('true');
    expect(onTake).not.toHaveBeenCalled();
  });

  test('OnAirStrip shows a next item without detail, and Transport a title without subtitle', async () => {
    await render(<OnAirStrip state='live' now={{ title: 'Harbor Lights' }} next={{ title: 'Copper' }} />);
    expect(document.body.textContent).toContain('Copper');
    expect(document.body.textContent).not.toContain('·');
    document.body.innerHTML = '';
    await render(<Transport title='Only title' duration={100} position={10} playing={false} onToggle={vi.fn()} onSeek={vi.fn()} />);
    expect(document.body.textContent).toContain('Only title');
  });

  test('a click on a timeline with no width seeks nowhere', async () => {
    const onSeek = vi.fn();
    await render(<Transport title='x' duration={100} position={10} playing={false} onToggle={vi.fn()} onSeek={onSeek} />);
    const slider = q('[role="slider"]') as HTMLElement;
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 0, top: 0, right: 0, bottom: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
    await act(async () => {
      slider.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10 }));
    });
    expect(onSeek).not.toHaveBeenCalled();
  });

  test('a disabled Transport ignores the keyboard on its timeline', async () => {
    const onToggle = vi.fn();
    const onSeek = vi.fn();
    await render(<Transport title='x' duration={100} position={10} playing={false} disabled onToggle={onToggle} onSeek={onSeek} />);
    const slider = q('[role="slider"]');
    for (const key of [' ', 'ArrowRight', 'ArrowLeft', 'Home', 'End']) await keydown(slider, key);
    expect(onToggle).not.toHaveBeenCalled();
    expect(onSeek).not.toHaveBeenCalled();
  });
});
