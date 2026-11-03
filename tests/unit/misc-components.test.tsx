import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Avatar, AvatarGroup } from '../../src/components/avatar';
import { PageHeader } from '../../src/components/page-header';
import { StatCard } from '../../src/components/stat-card';
import { Stepper } from '../../src/components/stepper';
import { Timeline } from '../../src/components/timeline';
import { Header } from '../../src/layout/header';
import { PanelColumn, PanelLayout } from '../../src/layout/panel-layout';
import { LoginScreen } from '../../src/login-screen';
import { click, render } from './helpers';

describe('Avatar', () => {
  test('shows initials, an icon, or the image and falls back when the image fails', async () => {
    await render(
      <>
        <Avatar fallback='ada lovelace byron' size='xl' data-x />
        <Avatar fallback='  ' />
        <Avatar />
        <Avatar src='/broken.png' alt='Pic' />
        <Avatar src='/other.png' fallback='Zed' />
        <Avatar src='/third.png' />
      </>
    );
    const spans = Array.from(document.querySelectorAll('span.relative'));
    expect(spans[0].textContent).toBe('AL');
    expect(spans[1].querySelector('svg')).not.toBeNull();
    expect(spans[2].querySelector('svg')).not.toBeNull();
    const img = spans[3].querySelector('img')!;
    expect(img.alt).toBe('Pic');
    expect(spans[4].querySelector('img')!.alt).toBe('Zed');
    expect(spans[5].querySelector('img')!.alt).toBe('');
    await act(async () => { img.dispatchEvent(new Event('error')); });
    expect(spans[3].querySelector('img')).toBeNull();
    expect(spans[3].querySelector('svg')).not.toBeNull();
  });

  test('AvatarGroup collapses overflow into a counter and supports every size', async () => {
    const avatars = ['A', 'B', 'C', 'D', 'E', 'F'].map(fallback => ({ fallback }));
    await render(<AvatarGroup avatars={avatars} max={3} size='sm' className='g' />);
    expect(document.body.textContent).toContain('+3');
    for (const size of ['xs', 'md', 'lg', 'xl'] as const) {
      await render(<AvatarGroup avatars={avatars} max={1} size={size} />);
    }
    await render(<AvatarGroup avatars={avatars.slice(0, 2)} />);
    expect(document.body.textContent).not.toContain('+0');
  });
});

describe('PageHeader', () => {
  test('renders the title with optional description, breadcrumbs and actions', async () => {
    await render(<PageHeader title='Title' description='Desc' breadcrumbs={<i id='bc' />} actions={<b id='act' />} className='ph' />);
    expect(document.querySelector('h1')!.textContent).toBe('Title');
    expect(document.getElementById('bc')).not.toBeNull();
    expect(document.getElementById('act')).not.toBeNull();
    expect(document.body.textContent).toContain('Desc');
    expect(document.querySelector('button, a')).toBeNull();
  });

  test('offers a back link or a back button', async () => {
    const onBack = vi.fn();
    await render(<><PageHeader title='A' backHref='/back' /><PageHeader title='B' onBack={onBack} /></>);
    expect(document.querySelector('a')!.getAttribute('href')).toBe('/back');
    await click(document.querySelector('button')!);
    expect(onBack).toHaveBeenCalled();
  });
});

describe('StatCard', () => {
  test('renders trends, descriptions, icons, sparklines and footers', async () => {
    await render(
      <>
        <StatCard title='Up' value='1' trend={{ value: '+5%', direction: 'up', label: 'vs last' }} description='hidden by trend' icon={<i id='ic' />} footer={<u id='ft' />} />
        <StatCard title='Down' value='2' trend={{ value: '-1%', direction: 'down' }} />
        <StatCard title='Flat' value='3' trend={{ value: '0', direction: 'neutral' }} />
        <StatCard title='Plain' value='4' description='shown' sparklineData={[{ v: 1 }, { v: 3 }]} sparklineDataKey='v' sparklineColor='red' className='c' />
        <StatCard title='Spark no key' value='5' sparklineData={[{ v: 1 }]} />
      </>
    );
    const text = document.body.textContent!;
    expect(text).toContain('vs last');
    expect(text).not.toContain('hidden by trend');
    expect(text).toContain('shown');
    expect(document.getElementById('ic')).not.toBeNull();
    expect(document.getElementById('ft')).not.toBeNull();
  });
});

describe('Timeline', () => {
  test('derives default statuses and numbers, honouring icons, descriptions and timestamps', async () => {
    await render(
      <Timeline
        className='t'
        items={[
          { id: '1', title: 'First' },
          { id: '2', title: 'Second', description: 'More', timestamp: 'Today', status: 'completed' },
          { id: '3', title: 'Third', icon: <i id='ic' />, status: 'error' }
        ]}
      />
    );
    expect(document.body.textContent).toContain('Today');
    expect(document.body.textContent).toContain('More');
    expect(document.getElementById('ic')).not.toBeNull();
    const badges = Array.from(document.querySelectorAll('div.z-10'));
    expect(badges[0].className).toContain('bg-desert');
    expect(badges[1].className).toContain('bg-sea');
    expect(badges[0].textContent).toBe('1');
  });

  test('later items without a status are pending', async () => {
    await render(<Timeline items={[{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }]} />);
    expect(document.querySelectorAll('div.z-10')[1].className).toContain('bg-sand/20');
  });
});

describe('Stepper', () => {
  const steps = [{ id: 'a', label: 'A', description: 'first' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C', disabled: true }, { id: 'd', label: 'D', status: 'error' as const }];

  test('derives statuses from the active step and reports clicks', async () => {
    const onStepClick = vi.fn();
    await render(<Stepper steps={steps} activeStep='b' onStepClick={onStepClick} />);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
    expect(buttons[0].querySelector('svg')).not.toBeNull();
    expect(buttons[1].className).toContain('ring-sea');
    expect(buttons[2].disabled).toBe(true);
    expect(buttons[2].className).toContain('cursor-not-allowed');
    expect(buttons[3].className).toContain('bg-terracotta');
    await click(buttons[0]);
    expect(onStepClick).toHaveBeenCalledWith(steps[0]);
    expect(document.body.textContent).toContain('first');
  });

  test('without an active step or click handler every step is pending and inert, in either orientation', async () => {
    await render(<Stepper steps={steps.slice(0, 2)} orientation='vertical' className='s' />);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
    expect(buttons.every(button => button.disabled)).toBe(true);
    expect(buttons[0].className).toContain('ring-sand/30');
    await click(buttons[0]);
  });
});

describe('Header', () => {
  const navigation = [{ label: 'Docs', href: '/docs' }];
  const renderLink = ({ item, className, children, onClick }: { item: { href: string }; className?: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={item.href} className={className} onClick={(event) => { event.preventDefault(); onClick?.(); }}>{children}</a>
  );
  test.each([
    ['fixed', 'fixed'],
    ['sticky', 'sticky'],
    ['static', 'relative']
  ] as const)('%s position', async (position, expected) => {
    await render(<Header brand={{ name: 'Brand' } as never} navigation={navigation} position={position} renderLink={renderLink as never} />);
    expect(document.querySelector('header')!.className).toContain(expected);
  });

  test('toggles the mobile menu, closes it on navigation and shows mobile actions', async () => {
    await render(<Header brand={{ name: 'Brand' } as never} navigation={navigation} renderLink={renderLink as never} actions={<i id='act' />} mobileActions={<i id='mob' />} fullWidth />);
    const toggle = document.querySelector<HTMLButtonElement>('button[aria-label="Toggle navigation menu"]')!;
    const panel = () => document.querySelector('header > div:last-child')!;
    expect(panel().className).toContain('max-h-0');
    await click(toggle);
    expect(panel().className).toContain('max-h-96');
    expect(document.getElementById('mob')).not.toBeNull();
    await click(panel().querySelector('a')!);
    expect(panel().className).toContain('max-h-0');
    await click(toggle);
    await click(toggle);
    expect(panel().className).toContain('max-h-0');
  });
});

describe('PanelLayout', () => {
  test('wraps children, passes text through and respects grow', async () => {
    await render(
      <PanelLayout className='pl' padding='p-4'>
        plain text
        <section id='fixed' />
        <section id='grow' {...({ grow: true } as object)} />
        <PanelColumn className='col'>
          also text
          <section id='stacked' />
          <section id='stacked-grow' {...({ grow: true } as object)} />
        </PanelColumn>
      </PanelLayout>
    );
    expect(document.body.textContent).toContain('plain text');
    expect(document.body.textContent).toContain('also text');
    expect(document.getElementById('fixed')!.parentElement!.className).toContain('shrink-0');
    expect(document.getElementById('grow')!.parentElement!.className).toContain('flex-1');
    expect(document.getElementById('stacked-grow')!.parentElement!.className).toContain('flex-1');
    expect(document.getElementById('stacked')!.parentElement!.className).toContain('shrink-0');
  });

  test('uses default padding', async () => {
    await render(<PanelLayout><section /></PanelLayout>);
    expect(document.querySelector('div.overflow-x-auto')!.className).toContain('p-0');
  });
});

describe('LoginScreen', () => {
  const submit = () => {
    const form = document.querySelector('form')!;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    act(() => { form.dispatchEvent(event); });
    return event;
  };

  test('renders the default copy and prevents submission without a handler', async () => {
    await render(<LoginScreen />);
    expect(document.querySelector('h1')!.textContent).toBe('Welcome back');
    expect(document.body.textContent).toContain('Sign in to your account to continue.');
    expect(submit().defaultPrevented).toBe(true);
  });

  test('forwards submission to the handler and supports custom copy and links', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    await render(<LoginScreen title='Hi' description='Desc' forgotPasswordHref='/forgot' signUpHref='/signup' brand={<i id='brand' />} onSubmit={onSubmit} />);
    expect(onSubmit).not.toHaveBeenCalled();
    submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[href="/forgot"]')).not.toBeNull();
    expect(document.querySelector('a[href="/signup"]')).not.toBeNull();
    expect(document.getElementById('brand')).not.toBeNull();
  });
});
