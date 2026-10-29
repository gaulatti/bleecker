import React, { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { MediaLibrary, type MediaLibraryItem } from '../../src/components/media-library';
import { click, eventually, render, type } from './helpers';

afterEach(() => vi.restoreAllMocks());

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const items: MediaLibraryItem[] = [
  { id: '1', filename: 'full.png', url: '/full.png', thumbnailUrl: '/thumb.png', alt: 'Full alt', createdAt: '2024-03-05T12:00:00Z' },
  { id: '2', filename: 'urlonly.png', url: '/urlonly.png' },
  { id: '3', filename: 'bare.png' }
];
const open = (name: string) => click(document.querySelector(`button[aria-label="Open ${name}"]`)!);
const dialog = () => document.querySelector('[role=dialog]');

function props(overrides: Partial<React.ComponentProps<typeof MediaLibrary>> = {}) {
  return { title: 'Library', items, searchTerm: '', onSearchTermChange: vi.fn(), ...overrides };
}

describe('MediaLibrary', () => {
  test('renders title, actions, filter slot, thumbnails, fallbacks and previews', async () => {
    await render(<MediaLibrary {...props({ actions: <b id='act'>act</b>, filterSlot: <i id='flt'>flt</i>, className: 'mine' })} />);
    expect(document.querySelector('h1')!.textContent).toBe('Library');
    expect(document.getElementById('act')).not.toBeNull();
    expect(document.getElementById('flt')).not.toBeNull();
    const images = Array.from(document.querySelectorAll('img'));
    expect(images.map(image => image.getAttribute('src'))).toEqual(['/thumb.png', '/urlonly.png']);
    expect(images.map(image => image.alt)).toEqual(['Full alt', 'urlonly.png']);
    expect(document.body.textContent).toContain('No preview');
    expect(document.body.textContent).not.toContain('No media found.');
    expect(document.querySelector('[aria-label="Delete media item"]')).toBeNull();
  });

  test('shows the default or a custom empty message', async () => {
    await render(<MediaLibrary {...props({ items: [] })} />);
    expect(document.body.textContent).toContain('No media found.');
    await render(<MediaLibrary {...props({ items: [], emptyMessage: 'Empty!', searchPlaceholder: 'Find' })} />);
    expect(document.body.textContent).toContain('Empty!');
    expect(document.querySelector('input[placeholder=Find]')).not.toBeNull();
  });

  test('typing and clearing the search report through onSearchTermChange', async () => {
    const onSearchTermChange = vi.fn();
    await render(<MediaLibrary {...props({ onSearchTermChange, searchTerm: 'cat' })} />);
    await type(document.querySelector('input[type=search]')!, 'dog');
    expect(onSearchTermChange).toHaveBeenLastCalledWith('dog');
    await click(document.querySelector('button[aria-label="Clear search"]')!);
    expect(onSearchTermChange).toHaveBeenLastCalledWith('');
  });

  test('delete buttons call onDelete without opening the preview', async () => {
    const onDelete = vi.fn();
    await render(<MediaLibrary {...props({ onDelete })} />);
    await click(document.querySelectorAll('button[aria-label="Delete media item"]')[1]);
    expect(onDelete).toHaveBeenCalledWith('2');
    expect(dialog()).toBeNull();
  });

  test('the preview shows details, copies through onCopy and closes', async () => {
    const onCopy = vi.fn();
    await render(<MediaLibrary {...props({ onCopy })} />);
    await open('full.png');
    expect(dialog()).not.toBeNull();
    expect(dialog()!.textContent).toContain('Full alt');
    expect(dialog()!.textContent).toContain('/full.png');
    expect(dialog()!.textContent).toContain('Created');
    expect(dialog()!.querySelector('a')!.getAttribute('href')).toBe('/full.png');
    expect(dialog()!.querySelector('img')!.getAttribute('src')).toBe('/full.png');
    await click(document.querySelector('button[aria-label="Copy filename"]')!);
    expect(onCopy).toHaveBeenLastCalledWith('full.png');
    await click(document.querySelector('button[aria-label="Copy URL"]')!);
    expect(onCopy).toHaveBeenLastCalledWith('/full.png');
    await click(document.querySelector('button[aria-label="Close"]')!);
    await eventually(() => expect(dialog()).toBeNull());
  });

  test('copies to the clipboard when no onCopy handler is given', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    await render(<MediaLibrary {...props()} />);
    await open('urlonly.png');
    await click(document.querySelector('button[aria-label="Copy filename"]')!);
    expect(writeText).toHaveBeenLastCalledWith('urlonly.png');
    await click(document.querySelector('button[aria-label="Copy URL"]')!);
    expect(writeText).toHaveBeenLastCalledWith('/urlonly.png');
  });

  test('an item without a URL, alt or date shows a minimal preview', async () => {
    await render(<MediaLibrary {...props()} />);
    await open('bare.png');
    expect(dialog()!.querySelector('img')).toBeNull();
    expect(dialog()!.textContent).not.toContain('Alt text');
    expect(dialog()!.textContent).not.toContain('Created');
    expect(dialog()!.querySelector('a')).toBeNull();
    expect(document.querySelector('button[aria-label="Copy URL"]')).toBeNull();
  });
});
