import { expect, it } from 'vitest';
import { SceneTransitionOverlay } from '../../src/components/scene-transition-overlay';
import { render } from './helpers';

// gaulatti/alcantara#383: the scene transition overlays; the host owns the presets and supplies the brand mark.

const preset = (id: string, extra: object = {}) => ({ id, durationMs: 1450, ...extra });

it('draws nothing for a cut', async () => {
  const { container } = await render(<SceneTransitionOverlay transition={preset('cut', { durationMs: 0 })} />);
  expect(container).toBeEmptyDOMElement();
});

it('plays a stinger from its own URL, muted and inline, for the preset duration', async () => {
  const { container } = await render(<SceneTransitionOverlay transition={preset('webm-stinger', { stingerUrl: 'https://example.test/s.webm' })} />);
  const overlay = container.querySelector<HTMLElement>('.scene-transition-overlay--webm-stinger')!;
  expect(overlay.style.getPropertyValue('--scene-transition-duration')).toBe('1450ms');
  expect(overlay).toHaveAttribute('aria-hidden', 'true');
  const video = overlay.querySelector('video')!;
  expect(video).toHaveAttribute('src', 'https://example.test/s.webm');
  expect(video.muted).toBe(true);
  expect(video.autoplay).toBe(true);
});

it.each(['crescendo-prism', 'velvet-eclipse', 'breaking-radar', 'anchor-desk', 'election-wall', 'market-pulse', 'world-desk', 'festival-runway', 'hit-parade', 'unknown-preset'])(
  'draws the %s overlay for its duration, hidden from assistive technology',
  async (id) => {
    const { container } = await render(<SceneTransitionOverlay transition={preset(id)} />);
    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay).toHaveClass('scene-transition-overlay');
    expect(overlay).toHaveClass(id === 'unknown-preset' ? 'scene-transition-overlay--crescendo-prism' : `scene-transition-overlay--${id}`);
    expect(overlay.style.getPropertyValue('--scene-transition-duration')).toBe('1450ms');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay.children.length).toBeGreaterThan(0);
  }
);

it.each([
  ['election-wall', 'election', 'cool'],
  ['market-pulse', 'market', 'cool'],
  ['world-desk', 'world', 'cool'],
  ['festival-runway', 'festival', 'warm']
])('%s has its vector drawing and its %s finish', async (id, variant, tone) => {
  const { container } = await render(<SceneTransitionOverlay transition={preset(id)} />);
  expect(container.querySelector(`svg.scene-transition-overlay__vector--${variant}`)).not.toBeNull();
  expect(container.querySelector(`.scene-transition-overlay__sheen--${tone}`)).not.toBeNull();
  expect(container.querySelector('.scene-transition-overlay__grain')).not.toBeNull();
});

it('puts the host brand mark in the hit-parade wipe, and nothing there without one', async () => {
  const { container, rerender } = await render(
    <SceneTransitionOverlay transition={preset('hit-parade')} brandMark={<svg aria-label='Brand' />} />
  );
  expect(container.querySelector('.scene-transition-overlay__giorgia-mark svg[aria-label="Brand"]')).not.toBeNull();
  expect(container.querySelectorAll('.scene-transition-overlay__giorgia-light')).toHaveLength(3);
  expect(container.querySelector('.scene-transition-overlay__giorgia-bar')).not.toBeNull();
  await rerender(<SceneTransitionOverlay transition={preset('hit-parade')} />);
  expect(container.querySelector('.scene-transition-overlay__giorgia-mark')!.childElementCount).toBe(0);
});
