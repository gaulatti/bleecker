import { act } from 'react';
import { describe, expect, it } from 'vitest';

import { CoverTile, coverFallback, coverPalette, stableHash } from '../../src/components/cover-tile';
import { render } from './helpers';

const byRole = (container: HTMLElement, name: string) =>
  container.querySelector(`[role="img"][aria-label="${name}"], img[alt="${name}"]`) as HTMLElement;

describe('CoverTile', () => {
  it('gives the same fallback for the same seed, every time', () => {
    expect(coverFallback('Lucia Bianchi')).toEqual(coverFallback('Lucia Bianchi'));
    expect(stableHash('abc')).toBe(stableHash('abc'));
    expect(coverFallback('Lucia Bianchi').initials).toBe('LB');
  });

  it('renders the image with its accessible name and lazy loading', async () => {
    const { container } = await render(<CoverTile label='Evening news' seed='x' src='https://example.test/a.jpg' />);
    const img = byRole(container, 'Evening news');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('uses a video poster when there is no image', async () => {
    const { container } = await render(<CoverTile label='Clip' seed='x' posterSrc='https://example.test/p.jpg' />);
    expect(byRole(container, 'Clip').getAttribute('src')).toBe('https://example.test/p.jpg');
  });

  it('falls back to the generated art with no image, and when the image breaks', async () => {
    const { container, rerender } = await render(<CoverTile label='Scene' seed='Lucia Bianchi' />);
    const art = byRole(container, 'Scene');
    expect(art.tagName).toBe('DIV');
    expect(art.textContent).toBe('LB');
    await rerender(<CoverTile label='Scene' seed='Lucia Bianchi' src='https://example.test/broken.jpg' />);
    await act(async () => {
      byRole(container, 'Scene').dispatchEvent(new Event('error'));
    });
    await rerender(<CoverTile label='Scene' seed='Lucia Bianchi' src='https://example.test/broken.jpg' />);
    expect(byRole(container, 'Scene').tagName).toBe('DIV');
  });

  it('keeps a fixed box before the image loads, so nothing shifts', async () => {
    const { container } = await render(<CoverTile label='Box' seed='x' size='lg' src='https://example.test/a.jpg' />);
    const box = container.querySelector('[data-cover-tile]') as HTMLElement;
    expect(box.style.width).toBe('120px');
    expect(box.style.height).toBe('120px');
  });

  it('shows the kind chip and the badge over the art', async () => {
    const { container } = await render(<CoverTile label='Song' seed='x' kind='Song' badge={<span>On air</span>} />);
    expect(container.textContent).toContain('Song');
    expect(container.textContent).toContain('On air');
  });

  it('a broken image comes back when the address changes', async () => {
    const { container, rerender } = await render(<CoverTile label='Reuse' seed='x' src='https://example.test/broken.jpg' />);
    await act(async () => {
      byRole(container, 'Reuse').dispatchEvent(new Event('error'));
    });
    expect(byRole(container, 'Reuse').tagName).toBe('DIV');
    await rerender(<CoverTile label='Reuse' seed='x' src='https://example.test/fixed.jpg' />);
    const img = byRole(container, 'Reuse');
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe('https://example.test/fixed.jpg');
  });

  it('white initials meet WCAG 4.5:1 on every palette stop', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrastWithWhite = (hex: string) => 1.05 / (luminance(hex) + 0.05);
    for (const [from, to] of coverPalette) {
      expect(contrastWithWhite(from)).toBeGreaterThanOrEqual(4.5);
      expect(contrastWithWhite(to)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
