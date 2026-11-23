import { act } from 'react';
import { expect, it } from 'vitest';
import { QRCodeWidget } from '../../src/components/qr-code-widget';
import { eventually, render } from './helpers';

it('shows the placeholder grid when there is nothing to draw', async () => {
  const { container } = await render(<QRCodeWidget />);
  expect(container.querySelectorAll('.qr-cell')).toHaveLength(9);
  expect(container.querySelector('img')).toBeNull();
});

it('renders no placeholder when placeholder is turned off', async () => {
  const { container } = await render(<QRCodeWidget placeholder={false} />);
  expect(container.querySelector('.qr-widget')!.childElementCount).toBe(0);
});

it('shows the given QR image as is', async () => {
  const { container } = await render(<QRCodeWidget qrCodeUrl='https://cdn.example.test/qr.png' content='ignored' />);
  expect(container.querySelector('img')!.getAttribute('src')).toBe('https://cdn.example.test/qr.png');
});

it('generates a QR image from content when no image is given', async () => {
  const { container } = await render(<QRCodeWidget content='https://example.test/a b' />);
  await eventually(() => expect(container.querySelector('img')).not.toBeNull());
  expect(container.querySelector('img')!.getAttribute('src')).toBe(
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fexample.test%2Fa%20b',
  );
  await act(async () => {});
});
