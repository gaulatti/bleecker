import { expect, it } from 'vitest';
import { CronicaReiteramos } from '../../src/components/cronica-reiteramos';
import { render } from './helpers';

it('shows the reiteramos line, defaulting to REITERAMOS', async () => {
  const defaults = await render(<CronicaReiteramos />);
  expect(defaults.container.querySelector('.cronica-reiteramos')!.textContent).toBe('REITERAMOS');
  await defaults.unmount();

  const custom = await render(<CronicaReiteramos text='OTRA VEZ' />);
  expect(custom.container.querySelector('.cronica-reiteramos')!.textContent).toBe('OTRA VEZ');
});

it('shows nothing when hidden', async () => {
  const { container } = await render(<CronicaReiteramos show={false} />);
  expect(container.innerHTML).toBe('');
});
