import { expect, it } from 'vitest';
import { Ticker } from '../../src/components/ticker';
import { render } from './helpers';

it('shows the hashtag and the url', async () => {
  const { container } = await render(<Ticker hashtag='#radio' url='modoitaliano.fm' />);
  expect(container.querySelector('.ticker-hashtag')!.textContent).toBe('#radio');
  expect(container.querySelector('.ticker-url')!.textContent).toBe('modoitaliano.fm');
});

it('renders empty slots when no hashtag or url is given', async () => {
  const { container } = await render(<Ticker />);
  expect(container.querySelector('.ticker-hashtag')!.textContent).toBe('');
  expect(container.querySelector('.ticker-url')!.textContent).toBe('');
});
