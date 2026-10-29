import React from 'react';
import { describe, expect, test } from 'vitest';

import { DashboardSection } from '../../src/components/dashboard-section';
import { IconBadge } from '../../src/components/icon-badge';
import { Input } from '../../src/components/input';
import { Label } from '../../src/components/label';
import { Metric } from '../../src/components/metric';
import { SearchInput } from '../../src/components/search-input';
import { Select } from '../../src/components/select';
import { render } from './helpers';

describe('Metric', () => {
  test.each([
    ['number', 1234.5, undefined, '1,234.5'],
    ['currency', 12, undefined, '$12.00'],
    ['percent', 0.256, undefined, '25.6%'],
    ['compact', 1500, undefined, '1.5K'],
    ['number', 3, 2, '3.00']
  ] as const)('formats %s values', async (format, value, decimals, expected) => {
    await render(<Metric value={value} format={format} decimals={decimals} prefix='>' suffix='<' className='x' />);
    expect(document.querySelector('span.x')!.textContent).toBe(`>${expected}<`);
  });

  test('defaults to a plain number, supports other currencies and renders nothing for missing values', async () => {
    await render(<Metric value={1000} />);
    expect(document.body.textContent).toBe('1,000');
    document.body.innerHTML = '';
    await render(<Metric value={5} format='currency' currency='EUR' decimals={0} />);
    expect(document.body.textContent).toMatch(/€\s?5/);
    document.body.innerHTML = '';
    await render(<Metric value={null} />);
    expect(document.querySelector('span')!.textContent).toBe('');
  });
});

describe('IconBadge', () => {
  test.each([
    [undefined, undefined, 'h-16 w-16', 'bg-deep-sea'],
    ['md', 'subtle', 'h-14 w-14', 'bg-sea/[0.06]'],
    ['lg', 'outlined', 'h-16 w-16', 'bg-white'],
    ['lg', 'primary', 'h-16 w-16', 'bg-deep-sea']
  ] as const)('size %s variant %s', async (size, variant, sizeClass, variantClass) => {
    await render(<IconBadge size={size} variant={variant} className='extra' data-x='1'>i</IconBadge>);
    const badge = document.querySelector('[data-x]')!;
    expect(badge.className).toContain(sizeClass);
    expect(badge.className).toContain(variantClass);
    expect(badge.className).toContain('extra');
    expect(badge.textContent).toBe('i');
  });
});

describe('DashboardSection', () => {
  test('renders title, description and action in a header', async () => {
    await render(<DashboardSection title='T' description='D' action={<button>A</button>} className='c' headerClassName='h'><p>body</p></DashboardSection>);
    expect(document.querySelector('h2')!.textContent).toBe('T');
    expect(document.body.textContent).toContain('D');
    expect(document.querySelector('.h button')!.textContent).toBe('A');
    expect(document.querySelector('section.c')!.textContent).toContain('body');
  });

  test.each([
    [{ title: 'only' }, 'h2'],
    [{ description: 'only' }, 'p.mt-1'],
    [{ action: <i>a</i> }, 'div.items-center i']
  ])('shows a header when only one part is given %#', async (props, selector) => {
    await render(<DashboardSection {...props}>child</DashboardSection>);
    expect(document.querySelector(selector)).not.toBeNull();
  });

  test('omits the header when nothing is given', async () => {
    await render(<DashboardSection>child</DashboardSection>);
    expect(document.querySelector('section > div')).toBeNull();
    expect(document.querySelector('section')!.textContent).toBe('child');
  });
});

describe('Label', () => {
  test('renders a label element with merged classes', async () => {
    await render(<Label htmlFor='x' className='extra'>Name</Label>);
    const label = document.querySelector('label')!;
    expect(label.getAttribute('for')).toBe('x');
    expect(label.className).toContain('extra');
  });
});

describe('Input and SearchInput', () => {
  test('applies sizes, icons, error and aria state', async () => {
    await render(
      <>
        <Input id='plain' />
        <Input id='sm' inputSize='sm' error />
        <Input id='start-sm' inputSize='sm' startIcon={<i />} />
        <Input id='start-md' startIcon={<i />} endIcon={<b />} />
        <Input id='start-lg' inputSize='lg' startIcon={<i />} aria-invalid='false' />
      </>
    );
    const input = (id: string) => document.getElementById(id) as HTMLInputElement;
    expect(input('plain').type).toBe('text');
    expect(input('plain').hasAttribute('aria-invalid')).toBe(false);
    expect(input('plain').className).toContain('h-10');
    expect(input('sm').getAttribute('aria-invalid')).toBe('true');
    expect(input('sm').className).toContain('border-terracotta');
    expect(input('start-sm').className).toContain('pl-10');
    expect(input('start-sm').className).toContain('h-9 pr-3');
    expect(input('start-md').className).toContain('pr-10');
    expect(input('start-lg').className).toContain('h-11 pr-4');
    expect(input('start-lg').getAttribute('aria-invalid')).toBe('false');
  });

  test('SearchInput shows a clear button only for a non-empty string value and a handler', async () => {
    const view = await render(<SearchInput value='' onClear={() => undefined} onChange={() => undefined} />);
    expect(document.querySelector('button')).toBeNull();
    await view.rerender(<SearchInput value='abc' onChange={() => undefined} />);
    expect(document.querySelector('button')).toBeNull();
    await view.rerender(<SearchInput value='abc' onClear={() => undefined} onChange={() => undefined} className='wrap' />);
    expect(document.querySelector('button[aria-label="Clear search"]')).not.toBeNull();
    expect(document.querySelector('.wrap')).not.toBeNull();
    await view.rerender(<SearchInput defaultValue='uncontrolled' onClear={() => undefined} />);
    expect(document.querySelector('button')).toBeNull();
    expect(document.querySelector<HTMLInputElement>('input')!.type).toBe('search');
  });
});

describe('Select styling', () => {
  test.each([
    ['sm', false],
    ['lg', true],
    ['md', false]
  ] as const)('size %s error %s', async (size, error) => {
    await render(<Select size={size} error={error} value='a' onChange={() => undefined} options={[{ label: 'A', value: 'a' }]} startIcon={<i />} aria-describedby='d' autoFocus />);
    const trigger = document.querySelector('button[role=combobox]')!;
    expect(trigger.className).toContain(error ? 'border-terracotta' : 'border-sand/40');
    expect(trigger.getAttribute('aria-invalid')).toBe(error ? 'true' : null);
  });
});
