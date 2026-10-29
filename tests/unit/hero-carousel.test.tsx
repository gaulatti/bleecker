import React, { act } from 'react';
import { describe, expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';

import { HeroCarousel, type HeroCarouselItem } from '../../src/components/hero-carousel';
import { click, eventually, keydown, render } from './helpers';

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const slides = () => Array.from(document.querySelectorAll<HTMLElement>('.hero-carousel > div[aria-hidden]'));
const visibleTitle = () => slides().find(slide => slide.getAttribute('aria-hidden') === 'false')!.querySelector('h1')!.textContent;

const items: HeroCarouselItem[] = [
  { id: 'a', title: 'Alpha', description: 'First', href: '/a', kind: 'post', imageUrl: '/img/a.png', ctaLabel: 'Go now' },
  { id: 'b', title: 'Beta', description: 'Second', href: 'https://example.invalid/b', kind: 'project', tags: ['x', 'y'], external: true },
  { title: 'Gamma', description: 'Third', href: '/c', imageUrl: '/img/c.png', tags: ['ignored'] }
];

describe('HeroCarousel', () => {
  test('shows the default empty state, or a custom one, with a custom fallback background', async () => {
    await render(<HeroCarousel items={[]} />);
    expect(document.body.textContent).toContain('No featured content available');
    await render(<HeroCarousel items={[]} emptyState={<b>Nothing</b>} defaultBackgroundClassName='bg-custom' className='mine' />);
    expect(document.querySelector('.bg-custom')!.textContent).toBe('Nothing');
    expect(document.querySelector('.mine')).not.toBeNull();
  });

  test('renders slide content: kickers, CTA labels, tags, images and link attributes', async () => {
    await render(<HeroCarousel items={items} defaultBackgroundClassName='bg-fallback' />);
    const [a, b, c] = slides();
    expect(a.textContent).toContain('From the Blog');
    expect(a.textContent).toContain('Go now');
    expect(a.querySelector('a')!.getAttribute('aria-label')).toBe('Read article: Alpha');
    expect(a.querySelector('img')!.getAttribute('loading')).toBe('eager');
    expect(a.querySelector('a')!.getAttribute('target')).toBeNull();
    expect(b.textContent).toContain('Featured Project');
    expect(b.textContent).toContain('View Project');
    expect(Array.from(b.querySelectorAll('span.inline-block')).map(tag => tag.textContent)).toEqual(['x', 'y']);
    expect(b.querySelector('a')!.getAttribute('target')).toBe('_blank');
    expect(b.querySelector('a')!.getAttribute('rel')).toBe('noreferrer noopener');
    expect(b.querySelector('a')!.getAttribute('aria-label')).toBe('View project: Beta');
    expect(b.querySelector('img')).toBeNull();
    expect(b.querySelector('.bg-fallback')).not.toBeNull();
    expect(c.querySelector('img')!.getAttribute('loading')).toBe('lazy');
    expect(c.querySelectorAll('span.inline-block')).toHaveLength(0);
    expect(c.textContent).toContain('View Project');
  });

  test('previous, next and indicators change the visible slide with wrap-around', async () => {
    await render(<HeroCarousel items={items} autoAdvanceMs={100000} />);
    expect(visibleTitle()).toBe('Alpha');
    await click(document.querySelector('[data-carousel-prev]')!);
    expect(visibleTitle()).toBe('Gamma');
    await click(document.querySelector('[data-carousel-next]')!);
    expect(visibleTitle()).toBe('Alpha');
    await click(document.querySelector('[data-dot="1"]')!);
    expect(visibleTitle()).toBe('Beta');
    expect(document.querySelector('[data-dot="1"]')!.className).toContain('active');
  });

  test('controls and indicators can be hidden independently, and single items have no navigation', async () => {
    await render(<HeroCarousel items={items} showIndicators={false} />);
    expect(document.querySelector('[data-carousel-next]')).not.toBeNull();
    expect(document.querySelector('[data-dot]')).toBeNull();
    await render(<HeroCarousel items={items} showControls={false} />);
    expect(document.querySelectorAll('[data-carousel-next]')).toHaveLength(1);
    await render(<HeroCarousel items={[items[0]]} />);
    expect(document.querySelectorAll('[data-carousel-next]')).toHaveLength(1);
  });

  test('auto-advances, pauses while hovered and resumes afterwards', async () => {
    await render(<HeroCarousel items={items} autoAdvanceMs={40} />);
    const container = document.querySelector('.hero-carousel')!;
    // Earlier real clicks can leave the browser's pointer resting over the carousel, which pauses it.
    // Park the pointer on a corner outside the carousel so the first phase runs unpaused.
    const corner = document.createElement('div');
    corner.style.cssText = 'position:fixed;right:0;bottom:0;width:6px;height:6px';
    document.body.append(corner);
    await userEvent.hover(corner);
    await eventually(() => expect(visibleTitle()).not.toBe('Alpha'));
    await act(async () => { container.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body })); });
    const paused = visibleTitle();
    await wait(120);
    expect(visibleTitle()).toBe(paused);
    await act(async () => { container.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })); });
    await eventually(() => expect(visibleTitle()).not.toBe(paused));
  });

  test('arrow keys navigate except while typing in an input or textarea', async () => {
    await render(
      <>
        <input id='field' />
        <textarea id='area' />
        <HeroCarousel items={items} autoAdvanceMs={100000} />
      </>
    );
    await keydown(document, 'ArrowRight');
    expect(visibleTitle()).toBe('Beta');
    await keydown(document, 'ArrowLeft');
    expect(visibleTitle()).toBe('Alpha');
    await keydown(document, 'Enter');
    expect(visibleTitle()).toBe('Alpha');
    document.getElementById('field')!.focus();
    await keydown(document, 'ArrowRight');
    expect(visibleTitle()).toBe('Alpha');
    document.getElementById('area')!.focus();
    await keydown(document, 'ArrowRight');
    expect(visibleTitle()).toBe('Alpha');
  });

  test('falls back to the default article label and keys tags by href when an item has no id', async () => {
    await render(
      <HeroCarousel
        items={[
          { title: 'Post', description: 'd', href: '/post', kind: 'post' },
          { title: 'Project', description: 'd', href: '/project', kind: 'project', tags: ['solo'] }
        ]}
      />
    );
    expect(slides()[0].textContent).toContain('Read Article');
    expect(slides()[1].textContent).toContain('solo');
  });

  test('supports a custom link renderer and items without an id', async () => {
    await render(
      <HeroCarousel
        items={[{ title: 'One', description: 'd', href: '/one' }, { title: 'Two', description: 'd', href: '/two' }]}
        renderLink={({ item, children, ariaLabel, className }) => <button data-custom={item.href} aria-label={ariaLabel} className={className}>{children}</button>}
      />
    );
    expect(document.querySelectorAll('[data-custom]')).toHaveLength(2);
    expect(document.querySelectorAll('[data-dot]')).toHaveLength(2);
  });
});
