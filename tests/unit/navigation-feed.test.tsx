import React, { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { AttentionSurface } from '../../src/components/attention-surface';
import { DashboardGrid, DashboardSpan } from '../../src/components/dashboard-grid';
import { FeedItem } from '../../src/components/feed-item';
import { NavigationMenu, type NavigationMenuEntry } from '../../src/components/navigation-menu';
import { Panel } from '../../src/components/panel';
import { Sidebar, type SidebarItem } from '../../src/components/sidebar';
import { click, eventually, render } from './helpers';

afterEach(() => vi.useRealTimers());

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });

describe('NavigationMenu', () => {
  const entries: NavigationMenuEntry[] = [
    { label: 'Home', href: '/home' },
    { trigger: 'Products', items: [{ label: 'One', href: '/one', description: 'The first' }, { label: 'Two', href: '/two' }] },
    { trigger: 'Company', items: [{ label: 'About', href: '/about' }] }
  ];
  const renderLink = ({ item, className, children, onClick }: { item: { href: string }; className?: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={item.href} className={className} onClick={(event) => { event.preventDefault(); onClick?.(); }}>{children}</a>
  );
  const trigger = (name: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')).find(button => button.textContent === name)!;

  test('opens a group, switches groups, closes on the same trigger and after choosing an item', async () => {
    await render(<NavigationMenu entries={entries} renderLink={renderLink as never} className='x' />);
    expect(document.querySelector('a[href="/home"]')).not.toBeNull();
    expect(document.querySelector('a[href="/one"]')).toBeNull();
    await click(trigger('Products'));
    expect(trigger('Products').getAttribute('aria-expanded')).toBe('true');
    expect(document.body.textContent).toContain('The first');
    await eventually(() => expect(document.querySelector('a[href="/one"]')!.parentElement!.className).toContain('opacity-100'));
    await click(trigger('Company'));
    expect(trigger('Products').getAttribute('aria-expanded')).toBe('false');
    await click(trigger('Company'));
    expect(trigger('Company').getAttribute('aria-expanded')).toBe('false');
    await eventually(() => expect(document.querySelector('a[href="/about"]')).toBeNull());
    await click(trigger('Products'));
    await click(document.querySelector('a[href="/two"]')!);
    expect(trigger('Products').getAttribute('aria-expanded')).toBe('false');
    await eventually(() => expect(document.body.textContent).not.toContain('The first'));
  });

  test('closes on an outside pointer press but not an inside one', async () => {
    await render(<NavigationMenu entries={entries} />);
    await click(trigger('Products'));
    await act(async () => { trigger('Products').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    expect(trigger('Products').getAttribute('aria-expanded')).toBe('true');
    await act(async () => { document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    expect(trigger('Products').getAttribute('aria-expanded')).toBe('false');
  });
});

describe('FeedItem', () => {
  const base = { author: 'Ada', content: 'Hello', language: 'en', relevance: 7.6, sourceUrl: 'https://news.example.invalid/story' };

  test('renders author, relevance, languages, categories and the source host', async () => {
    await render(<FeedItem {...base} postedAt={new Date(Date.now() - 60_000)} categories={[' Tech ', '', 'World']} className='x' init='Zed Q' />);
    expect(document.body.textContent).toContain('Ada');
    expect(document.body.textContent).toContain('8');
    expect(document.body.textContent).toContain('tech');
    expect(document.body.textContent).toContain('world');
    expect(document.body.textContent).toContain('news.example.invalid');
    expect(document.body.textContent).toContain('ZQ');
    expect(document.body.textContent).toContain('en');
  });

  test('formats old dates, string dates, future dates and invalid dates', async () => {
    const view = await render(<FeedItem {...base} postedAt='2020-01-02T03:04:05Z' />);
    expect(document.body.textContent).toMatch(/2020/);
    await view.rerender(<FeedItem {...base} postedAt={new Date(Date.now() + 86_400_000)} />);
    expect(document.body.textContent).toMatch(/·/);
    await view.rerender(<FeedItem {...base} postedAt='garbage' />);
    expect(document.body.textContent).toContain('Unknown time');
    await view.rerender(<FeedItem {...base} postedAt={new Date(Number.NaN)} />);
    expect(document.body.textContent).toContain('Unknown time');
  });

  test('falls back for a blank language, author initials and unparsable sources', async () => {
    await render(<FeedItem {...base} language='' author='  bob' postedAt='2020-01-02' sourceUrl='not a url' avatarSrc='/a.png' />);
    expect(document.body.textContent).toContain('n/a');
    expect(document.body.textContent).toContain('Source article');
    await render(<FeedItem {...base} author='   ' postedAt='2020-01-02' />);
    expect(document.body.textContent).toContain('?');
    document.body.innerHTML = '';
    await render(<FeedItem {...base} author='carl' postedAt='2020-01-02' />);
    expect(document.body.textContent).toContain('C');
  });
});

describe('Sidebar', () => {
  const items: SidebarItem[] = [
    { id: 'home', label: 'Home', href: '/home', icon: <i data-testid='icon' />, badge: <b>3</b>, active: true },
    { id: 'off', label: 'Off', href: '/off', disabled: true },
    {
      id: 'group',
      label: 'Group',
      icon: <i />,
      badge: <b id='group-badge'>9</b>,
      active: true,
      items: [{ id: 'c1', label: 'Child 1', href: '/c1', active: true }, { id: 'c2', label: 'No link' }]
    },
    { id: 'closed', label: 'Closed group', items: [{ id: 'c3', label: 'Child 3', href: '/c3' }] },
    { id: 'empty', label: 'Empty', items: [] },
    { id: 'linkless', label: 'Nothing' }
  ];
  const renderLink = ({ item, className, children, onClick }: { item: { href: string }; className?: string; children: React.ReactNode; onClick?: () => void }) => (
    <a data-custom href={item.href} className={className} onClick={(event) => { event.preventDefault(); onClick?.(); }}>{children}</a>
  );

  test('renders links, badges, groups and the header and footer', async () => {
    const onItemClick = vi.fn();
    await render(<Sidebar items={items} header={<h1>Head</h1>} footer={<p>Foot</p>} onItemClick={onItemClick} className='x' />);
    expect(document.querySelector('a[href="/home"]')!.getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('a[href="/off"]')!.className).toContain('pointer-events-none');
    expect(document.querySelector('a[href="/c1"]')).not.toBeNull();
    expect(document.querySelector('a[href="/c3"]')).toBeNull();
    expect(document.body.textContent).toContain('Head');
    expect(document.body.textContent).toContain('Foot');
    expect(document.getElementById('group-badge')).not.toBeNull();
    expect(document.body.textContent).not.toContain('Nothing');
    await act(async () => { document.querySelector<HTMLAnchorElement>('a[href="/home"]')!.addEventListener('click', e => e.preventDefault(), { once: true }); });
    await click(document.querySelector('a[href="/home"]')!);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
    const closedTrigger = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Closed group')!;
    await click(closedTrigger);
    expect(document.querySelector('a[href="/c3"]')).not.toBeNull();
    document.querySelector<HTMLAnchorElement>('a[href="/c3"]')!.addEventListener('click', e => e.preventDefault(), { once: true });
    await click(document.querySelector('a[href="/c3"]')!);
    expect(onItemClick).toHaveBeenLastCalledWith(items[3].items![0]);
  });

  test('collapsed mode shows only icons of linked entries and uses a custom link renderer', async () => {
    const onItemClick = vi.fn();
    await render(<Sidebar items={items} collapsed renderLink={renderLink as never} onItemClick={onItemClick} />);
    expect(document.querySelector('aside')!.className).toContain('w-16');
    expect(document.body.textContent).not.toContain('Home');
    const links = Array.from(document.querySelectorAll('a[data-custom]'));
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/home', '/off']);
    await click(links[0]);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  test('renders without header, footer or click handler', async () => {
    await render(<Sidebar items={[{ id: 'a', label: 'A', href: '#a' }]} />);
    document.querySelector<HTMLAnchorElement>('a')!.addEventListener('click', e => e.preventDefault(), { once: true });
    await click(document.querySelector('a')!);
    expect(document.querySelector('aside')!.className).toContain('w-64');
  });

  test('collapsed mode centres header and footer', async () => {
    await render(<Sidebar items={[]} collapsed header={<i id='h' />} footer={<i id='f' />} />);
    expect(document.getElementById('h')!.parentElement!.className).toContain('justify-center');
    expect(document.getElementById('f')!.parentElement!.className).toContain('justify-center');
  });
});

describe('DashboardGrid and DashboardSpan', () => {
  test.each([1, 2, 3, 4, 5, 6])('%i columns', async columns => {
    await render(<DashboardGrid columns={columns as 1} className='g'>x</DashboardGrid>);
    expect(document.querySelector('.g')!.className).not.toContain('dashboard-grid');
  });

  test('auto grid when no columns are given, and every span', async () => {
    await render(<DashboardGrid>x</DashboardGrid>);
    expect(document.querySelector('.dashboard-grid')).not.toBeNull();
    for (const span of [undefined, 1, 2, 3, 4, 'full'] as const) {
      await render(<DashboardSpan span={span} className='s'>x</DashboardSpan>);
    }
    const spans = Array.from(document.querySelectorAll('.s')).map(node => node.className);
    expect(spans[0]).toContain('col-span-1');
    expect(spans[2]).toContain('sm:col-span-2');
    expect(spans[3]).toContain('lg:col-span-3');
    expect(spans[4]).toContain('xl:col-span-4');
    expect(spans[5]).toContain('col-span-full');
  });
});

describe('AttentionSurface', () => {
  test('is a non-interactive article by default and exposes its intensity', async () => {
    await render(<AttentionSurface hue={200} intensity={4} data-x style={{ color: 'red' }}>child</AttentionSurface>);
    const surface = document.querySelector('article')!;
    expect(surface.getAttribute('data-attention-intensity')).toBe('4');
    expect(surface.getAttribute('data-attention-red-mix')).toBe('40');
    expect(surface.className).toContain('px-5');
    expect(surface.className).not.toContain('hover:');
    expect(surface.style.color).toBe('red');
  });

  test('buttons default to type button and are interactive; interactive can be forced either way', async () => {
    await render(
      <>
        <AttentionSurface as='button' hue={0} intensity={1} id='btn' density='compact' />
        <AttentionSurface as='button' hue={0} intensity={1} id='sub' type='submit' interactive={false} />
        <AttentionSurface as='div' hue={0} intensity={1} id='div' interactive />
      </>
    );
    expect((document.getElementById('btn') as HTMLButtonElement).type).toBe('button');
    expect(document.getElementById('btn')!.className).toContain('px-4');
    expect(document.getElementById('btn')!.className).toContain('hover:-translate-y-px');
    expect((document.getElementById('sub') as HTMLButtonElement).type).toBe('submit');
    expect(document.getElementById('sub')!.className).not.toContain('hover:-translate-y-px');
    expect(document.getElementById('div')!.className).toContain('hover:-translate-y-px');
    expect(document.getElementById('div')!.hasAttribute('type')).toBe(false);
  });

  test('forwards refs', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<AttentionSurface ref={ref} hue={0} intensity={0} />);
    expect(ref.current?.tagName).toBe('ARTICLE');
  });
});

describe('Panel', () => {
  test('renders title, count, handle, filter, toolbar and an accent', async () => {
    await render(<Panel title='Feed' count={0} accent='red' width={320} dragHandle={<i id='h' />} filter={<i id='f' />} toolbar={<i id='t' />} className='x'>body</Panel>);
    const panel = document.querySelector<HTMLElement>('div.group')!;
    expect(panel.style.width).toBe('320px');
    expect(panel.style.getPropertyValue('--panel-accent')).toBe('red');
    expect(document.body.textContent).toContain('Feed');
    expect(document.body.textContent).toContain('0');
    for (const id of ['h', 'f', 't']) expect(document.getElementById(id)).not.toBeNull();
  });

  test('defaults to the sea accent without optional parts', async () => {
    await render(<Panel title='Plain' width='20rem'>body</Panel>);
    const panel = document.querySelector<HTMLElement>('div.group')!;
    expect(panel.style.width).toBe('20rem');
    expect(panel.style.getPropertyValue('--panel-accent')).toBe('');
    expect(panel.style.borderLeftColor).toBe('var(--color-sea)');
    expect(document.querySelector('span.tabular-nums')).toBeNull();
    await render(<Panel title='Widthless'>body</Panel>);
    expect(document.querySelectorAll<HTMLElement>('div.group')[1].style.width).toBe('');
  });
});
