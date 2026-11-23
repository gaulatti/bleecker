import { expect, it } from 'vitest';
import { CronicaBackground } from '../../src/components/cronica-background';
import { CronicaChyron } from '../../src/components/cronica-chyron';
import { render } from './helpers';

it('draws the background panel', async () => {
  const { container } = await render(<CronicaBackground />);
  expect(container.querySelector('.cronica-background')).not.toBeNull();
});

it('sets each line of the text as its own chyron line', async () => {
  const { container } = await render(<CronicaChyron text={'URGENTE\nSe cortó la luz'} />);
  const lines = Array.from(container.querySelectorAll('.cronica-chyron-line')).map((node) => node.textContent);
  expect(lines).toEqual(['URGENTE', 'Se cortó la luz']);
});

it('shows a single line when the text has no newline', async () => {
  const { container } = await render(<CronicaChyron text='UNA SOLA LÍNEA' />);
  expect(container.querySelectorAll('.cronica-chyron-line')).toHaveLength(1);
});

it('renders nothing without text', async () => {
  const empty = await render(<CronicaChyron />);
  expect(empty.container.querySelector('.cronica-layer')).toBeNull();
  expect(empty.container.innerHTML).toBe('');
});
