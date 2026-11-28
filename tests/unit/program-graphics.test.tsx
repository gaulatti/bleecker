import { expect, it } from 'vitest';
import { CornerBug } from '../../src/components/corner-bug';
import { FadeToBlack } from '../../src/components/fade-to-black';
import { FullScreen } from '../../src/components/full-screen';
import { LowerThird } from '../../src/components/lower-third';
import { SceneNotice } from '../../src/components/scene-notice';
import { render } from './helpers';

// The program's generic graphics, moved from Alcantara's program renderer (frontend/app/routes/program.tsx):
// the same markup and classes, so the host's Tailwind draws them exactly as before.

it('draws the lower third bar with its text, or "Lower Third" when it has none', async () => {
  const { container, rerender } = await render(<LowerThird text='Maria Rossi, host' />);
  const bar = container.firstElementChild as HTMLElement;
  expect(bar.className).toBe('absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center px-16');
  expect(bar.querySelector('.text-white > .text-5xl.font-bold')!.textContent).toBe('Maria Rossi, host');
  await rerender(<LowerThird text='' />);
  expect(container.textContent).toBe('Lower Third');
  await rerender(<LowerThird />);
  expect(container.textContent).toBe('Lower Third');
});

it('draws the full-screen card with its text, or "Full Screen" when it has none', async () => {
  const { container, rerender } = await render(<FullScreen text='Back after the break' />);
  const card = container.firstElementChild as HTMLElement;
  expect(card.className).toBe('w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900');
  expect(card.firstElementChild!.className).toBe('text-white text-8xl font-bold text-center px-16');
  expect(card.textContent).toBe('Back after the break');
  await rerender(<FullScreen text='' />);
  expect(container.textContent).toBe('Full Screen');
  await rerender(<FullScreen />);
  expect(container.textContent).toBe('Full Screen');
});

it('draws the corner bug with its text, or "LIVE" when it has none', async () => {
  const { container, rerender } = await render(<CornerBug text='REPLAY' />);
  const bug = container.firstElementChild as HTMLElement;
  expect(bug.className).toBe('absolute top-8 right-8 bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl');
  expect(bug.firstElementChild!.className).toBe('text-3xl font-bold');
  expect(bug.textContent).toBe('REPLAY');
  await rerender(<CornerBug text='' />);
  expect(container.textContent).toBe('LIVE');
  await rerender(<CornerBug />);
  expect(container.textContent).toBe('LIVE');
});

it('fills the frame with a large scene notice by default', async () => {
  const { container } = await render(<SceneNotice message='No Active Scene' />);
  const notice = container.firstElementChild as HTMLElement;
  expect(notice.className).toBe('w-full h-full flex items-center justify-center text-white text-4xl');
  expect(notice.getAttribute('style')).toBeNull();
  expect(notice.textContent).toBe('No Active Scene');
});

it('centres a body-size component notice over the frame', async () => {
  const { container } = await render(<SceneNotice message='Unknown component: retired-widget' variant='component' />);
  const notice = container.firstElementChild as HTMLElement;
  expect(notice.className).toBe('');
  expect(notice.style.position).toBe('absolute');
  expect(notice.style.top).toBe('50%');
  expect(notice.style.left).toBe('50%');
  expect(notice.style.transform).toBe('translate(-50%, -50%)');
  expect(notice.style.color).toBe('white');
  expect(notice.textContent).toBe('Unknown component: retired-widget');
});

it('covers the program in black above every layer while active, and clears it while not', async () => {
  const { container, rerender } = await render(<FadeToBlack active animate={false} />);
  const frame = container.firstElementChild as HTMLElement;
  expect(frame.className).toBe('pointer-events-none absolute inset-0 z-[2000] bg-black');
  expect(frame.dataset.fadeToBlack).toBe('active');
  expect(frame.style.opacity).toBe('1');
  expect(frame.style.transition).toBe('none');
  expect(frame.childElementCount).toBe(0);
  await rerender(<FadeToBlack active={false} animate={false} />);
  expect(frame.dataset.fadeToBlack).toBe('inactive');
  expect(frame.style.opacity).toBe('0');
});

it('fades over one linear second only when asked to animate', async () => {
  const { container, rerender } = await render(<FadeToBlack active={false} animate />);
  const frame = container.firstElementChild as HTMLElement;
  expect(frame.style.transition).toBe('opacity 1000ms linear');
  await rerender(<FadeToBlack active animate />);
  expect(frame.style.opacity).toBe('1');
  expect(frame.style.transition).toBe('opacity 1000ms linear');
});

it('passes the host its own attributes, such as a confidence-monitor marker, without changing the look', async () => {
  const { container } = await render(<FadeToBlack active animate={false} data-confidence-fade-to-black='active' aria-hidden />);
  const frame = container.firstElementChild as HTMLElement;
  expect(frame.dataset.confidenceFadeToBlack).toBe('active');
  expect(frame.getAttribute('aria-hidden')).toBe('true');
  expect(frame.className).toBe('pointer-events-none absolute inset-0 z-[2000] bg-black');
});
