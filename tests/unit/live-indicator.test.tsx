import { expect, it } from 'vitest';
import { LiveIndicator } from '../../src/components/live-indicator';
import { render } from './helpers';

it('shows the live badge, animated by default', async () => {
  const { container } = await render(<LiveIndicator />);
  expect(container.querySelector('.live-indicator .live-badge')!.classList.contains('animate')).toBe(true);
});

it('stops the pulse when animation is off', async () => {
  const { container } = await render(<LiveIndicator animate={false} />);
  expect(container.querySelector('.live-badge')!.classList.contains('animate')).toBe(false);
});
