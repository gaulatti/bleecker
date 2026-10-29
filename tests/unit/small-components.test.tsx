import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { BauhausBackground } from '../../src/components/bauhaus-background';
import { Breadcrumb } from '../../src/components/breadcrumb';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { Checkbox } from '../../src/components/checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../../src/components/context-menu';
import { FieldHelpTooltip } from '../../src/components/field-help-tooltip';
import { FileInput } from '../../src/components/file-input';
import { FilterChip, FilterGroup } from '../../src/components/filter-chip';
import { HeaderSelect } from '../../src/components/header-select';
import { HoverCard } from '../../src/components/hover-card';
import { NotificationBadge } from '../../src/components/notification-badge';
import { ProgressStack } from '../../src/components/progress-stack';
import { RadioGroup } from '../../src/components/radio-group';
import { ScrollArea } from '../../src/components/scroll-area';
import { Separator } from '../../src/components/separator';
import { Slider } from '../../src/components/slider';
import { Switch } from '../../src/components/switch';
import { DetailLayout } from '../../src/layout/detail-layout';
import { FeedColumn } from '../../src/layout/feed-column';
import { FeedGrid } from '../../src/layout/feed-grid';
import { Footer } from '../../src/layout/footer';
import { click, pickSelectOption, render } from './helpers';

describe('BauhausBackground', () => {
  test.each([
    ['nazca', 'rounded-full'],
    ['autostrada', 'border-l-2'],
    ['pompeii', 'border-2'],
    ['monitor', 'rounded-full']
  ] as const)('draws the %s pattern', async (type, marker) => {
    await render(<BauhausBackground type={type} className='x' />);
    expect(document.querySelector(`.${marker.replace('/', '\\/')}`)).not.toBeNull();
  });

  test('uses the default or a provided image', async () => {
    await render(<BauhausBackground type='nazca' />);
    expect(document.querySelector('img')!.getAttribute('src')).toBe('/hero/pompeii.avif');
    await render(<BauhausBackground type='nazca' imageUrl='/mine.png' defaultImageUrl='/other.png' />);
    expect(document.querySelectorAll('img')[1].getAttribute('src')).toBe('/mine.png');
    await render(<BauhausBackground type='nazca' defaultImageUrl='/other.png' />);
    expect(document.querySelectorAll('img')[2].getAttribute('src')).toBe('/other.png');
  });
});

describe('Button and Card', () => {
  test('buttons show a spinner and disable themselves while loading, as button or anchor', async () => {
    await render(
      <>
        <Button loading id='b'>b</Button>
        <Button id='plain' fullWidth>plain</Button>
        <Button as='a' href='#x' loading id='a'>a</Button>
        <Button href='#y' id='h' disabled>h</Button>
      </>
    );
    const b = document.getElementById('b') as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.getAttribute('aria-busy')).toBe('true');
    expect(b.querySelector('svg')).not.toBeNull();
    expect((document.getElementById('plain') as HTMLButtonElement).querySelector('svg')).toBeNull();
    expect(document.getElementById('a')!.querySelector('svg')).not.toBeNull();
    expect(document.getElementById('a')!.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById('h')!.getAttribute('aria-disabled')).toBe('true');
  });

  test('anchors without loading have no spinner', async () => {
    await render(<Button as='a' href='#z' id='z'>z</Button>);
    expect(document.getElementById('z')!.querySelector('svg')).toBeNull();
    expect(document.getElementById('z')!.hasAttribute('aria-busy')).toBe(false);
  });

  test.each(['surface', 'outlined', 'elevated', 'subtle', 'transparent'] as const)('card variant %s', async variant => {
    await render(<Card variant={variant} padding='lg' data-v={variant} />);
    expect(document.querySelector(`[data-v=${variant}]`)!.className).toContain('p-8');
  });
});

describe('Checkbox, Switch, RadioGroup, Slider, FileInput', () => {
  test('Checkbox renders a bare control, or with label and description', async () => {
    await render(<><Checkbox id='bare' /><Checkbox id='full' label='Label' description='Desc' /><Checkbox id='desc' description='Only desc' /><Checkbox id='lab' label='Only label' /></>);
    expect(document.body.textContent).toContain('Label');
    expect(document.body.textContent).toContain('Desc');
    expect(document.body.textContent).toContain('Only desc');
    expect(document.querySelectorAll('input')).toHaveLength(4);
  });

  test('Switch reports toggles and supports labels, custom ids and disabled', async () => {
    const onCheckedChange = vi.fn();
    await render(<><Switch label='Wifi' onCheckedChange={onCheckedChange} /><Switch checked id='custom' disabled /><Switch /></>);
    await click(document.querySelector('input[role=switch]')!);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(document.getElementById('custom')!.getAttribute('aria-checked')).toBe('true');
    await click(document.querySelectorAll('input[role=switch]')[2]);
    expect(document.body.textContent).toContain('Wifi');
  });

  test('RadioGroup selects options, supports orientation, names and disabled states', async () => {
    const onChange = vi.fn();
    const options = [{ label: 'A', value: 'a', description: 'first' }, { label: 'B', value: 'b', disabled: true }, { label: 'C', value: 'c' }];
    const view = await render(<RadioGroup options={options} value='a' onChange={onChange} />);
    await click(document.querySelector('input[value=c]')!);
    expect(onChange).toHaveBeenCalledWith('c');
    expect(document.body.textContent).toContain('first');
    expect(document.querySelector<HTMLInputElement>('input[value=b]')!.disabled).toBe(true);
    await view.rerender(<RadioGroup options={options} orientation='horizontal' name='grp' disabled />);
    expect(document.querySelector('[role=radiogroup]')!.className).toContain('flex-row');
    expect(document.querySelector<HTMLInputElement>('input[value=a]')!.name).toBe('grp');
    expect(document.querySelector<HTMLInputElement>('input[value=a]')!.disabled).toBe(true);
    await view.rerender(<RadioGroup options={options} />);
    await click(document.querySelector('input[value=a]')!);
  });

  test('Slider reports numeric changes and renders label, value and disabled state', async () => {
    const onChange = vi.fn();
    const view = await render(<Slider label='Volume' showValue value={25} min={0} max={50} onChange={onChange} />);
    expect(document.body.textContent).toContain('Volume');
    expect(document.body.textContent).toContain('25');
    const input = document.querySelector('input')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '30');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith(30);
    await view.rerender(<Slider showValue disabled />);
    expect(document.querySelector('input')!.disabled).toBe(true);
    expect(document.querySelector('span')).not.toBeNull();
    await view.rerender(<Slider />);
    await act(async () => {
      const el = document.querySelector('input')!;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, '3');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  test('FileInput styles its error state and sizes', async () => {
    await render(<><FileInput id='ok' /><FileInput id='bad' error inputSize='lg' /><FileInput id='sm' inputSize='sm' /></>);
    expect(document.getElementById('ok')!.className).toContain('border-sand/30');
    expect(document.getElementById('bad')!.className).toContain('border-terracotta');
    expect(document.getElementById('sm')!.className).toContain('text-sm');
  });
});

describe('simple display components', () => {
  test('ProgressStack computes widths from the total or max and can hide the legend', async () => {
    const items = [{ label: 'A', value: 1, color: 'red' }, { label: 'B', value: 3, className: 'cls' }];
    const view = await render(<ProgressStack items={items} />);
    const bars = () => Array.from(document.querySelectorAll<HTMLElement>('[title]'));
    expect(bars().map(bar => bar.style.width)).toEqual(['25%', '75%']);
    await view.rerender(<ProgressStack items={items} max={8} showLegend={false} className='x' barClassName='y' />);
    expect(bars().map(bar => bar.style.width)).toEqual(['12.5%', '37.5%']);
    expect(document.body.textContent).not.toContain('A');
    await view.rerender(<ProgressStack items={[{ label: 'Z', value: 0 }]} />);
    expect(bars()[0].style.width).toBe('0%');
  });

  test('ScrollArea picks overflow classes per orientation', async () => {
    await render(<><ScrollArea id='v' maxHeight='10px' style={{ color: 'red' }}>v</ScrollArea><ScrollArea id='h' orientation='horizontal'>h</ScrollArea><ScrollArea id='b' orientation='both'>b</ScrollArea></>);
    expect(document.getElementById('v')!.className).toContain('overflow-y-auto');
    expect(document.getElementById('v')!.style.maxHeight).toBe('10px');
    expect(document.getElementById('h')!.className).toContain('overflow-x-auto');
    expect(document.getElementById('b')!.className).toContain('overflow-auto');
  });

  test('Separator is decorative by default and semantic on request, in both orientations', async () => {
    await render(<><Separator id='d' /><Separator id='s' decorative={false} orientation='vertical' /></>);
    expect(document.getElementById('d')!.getAttribute('role')).toBe('presentation');
    expect(document.getElementById('s')!.getAttribute('role')).toBe('separator');
    expect(document.getElementById('s')!.className).toContain('w-px');
  });

  test('HoverCard positions its content at the bottom or top', async () => {
    await render(<><HoverCard content='below'>t</HoverCard><HoverCard content='above' side='top'>t</HoverCard></>);
    const tips = Array.from(document.querySelectorAll('[role=tooltip]'));
    expect(tips[0].className).toContain('top-full');
    expect(tips[1].className).toContain('bottom-full');
  });

  test('FieldHelpTooltip hides for blank text and shows the help button otherwise', async () => {
    await render(<><FieldHelpTooltip text='   ' /><FieldHelpTooltip text='Helpful' className='k' /></>);
    expect(document.querySelectorAll('button')).toHaveLength(1);
    expect(document.querySelector('button')!.getAttribute('aria-label')).toBe('Helpful');
  });

  test('FilterChip and FilterGroup render values, removal and clearing', async () => {
    const onRemove = vi.fn();
    const onClearAll = vi.fn();
    const view = await render(<FilterGroup filters={[]} />);
    expect(view.container.innerHTML).toBe('');
    await view.rerender(<FilterGroup filters={[{ label: 'A', value: 'x', onRemove }, { label: 'B' }]} onClearAll={onClearAll} className='g' />);
    expect(document.body.textContent).toContain('x');
    await click(document.querySelector('button[aria-label="Remove A filter"]')!);
    expect(onRemove).toHaveBeenCalled();
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Clear all')!);
    expect(onClearAll).toHaveBeenCalled();
    await view.rerender(<FilterGroup filters={[{ label: 'only' }]} />);
    expect(document.querySelector('button')).toBeNull();
    await view.rerender(<FilterChip label='solo' className='c' />);
    expect(document.body.textContent).toBe('solo');
  });
});

describe('layouts', () => {
  test('DetailLayout shows an optional, sticky side rail on either side', async () => {
    await render(<DetailLayout id='none'>content</DetailLayout>);
    expect(document.querySelector('aside')).toBeNull();
    await render(<DetailLayout id='rail' side='start' ratio='balanced' sticky={false} sideRail='rail' sideRailLabel='Related'>content</DetailLayout>);
    const aside = document.querySelector('aside')!;
    expect(aside.getAttribute('aria-label')).toBe('Related');
    expect(aside.className).toContain('lg:order-first');
    expect(aside.className).not.toContain('lg:sticky');
    await render(<DetailLayout sideRail='end rail'>content</DetailLayout>);
    expect(document.querySelectorAll('aside')[1].className).toContain('lg:sticky');
  });

  test('FeedGrid and FeedColumn accept numeric or string widths', async () => {
    await render(<><FeedGrid id='n'>x</FeedGrid><FeedGrid id='s' minColumnWidth='20rem' style={{ color: 'red' }}>x</FeedGrid></>);
    expect(document.getElementById('n')!.style.gridTemplateColumns).toContain('340px');
    expect(document.getElementById('s')!.style.gridTemplateColumns).toContain('20rem');
    await render(
      <>
        <FeedColumn title='One' count={3} filter={<i id='flt' />} accent='red' viewportRef={React.createRef()}>a</FeedColumn>
        <FeedColumn title='Two' width='30rem' id='two'>b</FeedColumn>
      </>
    );
    expect(document.body.textContent).toContain('3');
    expect(document.getElementById('flt')).not.toBeNull();
    expect(document.getElementById('two')!.style.width).toBe('30rem');
    expect(document.querySelector('section')!.style.width).toBe('372px');
  });

  test('Footer lays out the brand column by the number of sections and links GitHub by default', async () => {
    const section = (title: string, href = `/${title}`) => ({ title, items: [{ label: title, href }] });
    await render(<Footer brand={{ name: 'Brand' } as never} sections={[section('One'), section('Two', 'https://github.com/x/y')]} bottomLeft='left' />);
    expect(document.querySelector('.lg\\:col-span-2')).not.toBeNull();
    expect(document.body.textContent).toContain('View source on GitHub');
    await render(<Footer brand={{ name: 'Brand', description: 'About us' } as never} sections={[section('A'), section('B'), section('C')]} bottomRight='right' showBottomAccent={false} />);
    expect(document.body.textContent).toContain('About us');
    expect(document.querySelectorAll('footer')[1].querySelector('.lg\\:col-span-2')).toBeNull();
    await render(<Footer brand={{ name: 'Brand' } as never} sections={[section('A')]} />);
  });

  test('Breadcrumb collapses long trails and expands on demand', async () => {
    const items = ['Home', 'A', 'B', 'C', 'D'].map(label => ({ label, href: `/${label}` }));
    await render(<Breadcrumb items={items} collapsedAfter={2} />);
    expect(Array.from(document.querySelectorAll('li')).map(li => li.textContent).filter(Boolean)).toEqual(['Home', 'D']);
    await click(document.querySelector('button[aria-label="Show full path"]')!);
    expect(document.body.textContent).toContain('B');
    expect(document.querySelector('button[aria-label="Show full path"]')).toBeNull();
  });
});

describe('menus', () => {
  test('HeaderSelect adds a placeholder option unless an empty option exists', async () => {
    const onChange = vi.fn();
    const view = await render(<HeaderSelect options={[{ label: 'One', value: '1' }]} onChange={onChange} placeholder='Pick' icon={<i />} />);
    await pickSelectOption(document.querySelector('button[role=combobox]')!, 'One');
    expect(onChange).toHaveBeenCalledWith('1');
    await view.rerender(<HeaderSelect options={[{ label: 'None', value: '' }, { label: 'One', value: '1' }]} onChange={onChange} value='1' aria-label='Header' wrapperClassName='w' className='c' />);
    expect(document.querySelector('button[role=combobox]')!.getAttribute('aria-label')).toBe('Header');
  });

  test('ContextMenu items can be inset and run their handlers', async () => {
    const onSelect = vi.fn();
    await render(
      <ContextMenu>
        <ContextMenuTrigger><div id='area'>area</div></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem inset onSelect={onSelect}>Inset</ContextMenuItem>
          <ContextMenuItem>Plain</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await act(async () => {
      document.getElementById('area')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }));
    });
    await vi.waitFor(() => expect(document.querySelector('[role=menu]')).not.toBeNull());
    const inset = Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find(node => node.textContent === 'Inset')!;
    expect(inset.className).toContain('pl-8');
    await userEvent.click(inset);
    expect(onSelect).toHaveBeenCalled();
  });

  test('NotificationBadge shows counts, unread items and mark-all-read', async () => {
    const onMarkAllRead = vi.fn();
    const onClick = vi.fn();
    const view = await render(
      <NotificationBadge
        count={120}
        onMarkAllRead={onMarkAllRead}
        items={[{ id: '1', title: 'New', description: 'desc', timestamp: 'now', unread: true, onClick }, { id: '2', title: 'Old' }]}
      />
    );
    expect(document.body.textContent).toContain('99+');
    await userEvent.click(document.querySelector('[aria-label=Notifications]')!);
    await vi.waitFor(() => expect(document.querySelector('[role=menu]')).not.toBeNull());
    expect(document.querySelector('[role=menu]')!.textContent).toContain('Mark all read');
    expect(document.querySelector('[role=menu]')!.textContent).toContain('desc');
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]'))[0]);
    expect(onClick).toHaveBeenCalled();
    await view.unmount();
    await render(<NotificationBadge items={[{ id: '1', title: 'Unread', unread: true }]} onMarkAllRead={onMarkAllRead} />);
    await userEvent.click(document.querySelector('[aria-label=Notifications]')!);
    await vi.waitFor(() => expect(document.querySelector('[role=menu]')).not.toBeNull());
    expect(document.querySelector('[role=menu]')!.textContent).toContain('Mark all read');
    await render(<NotificationBadge count={2} />);
    expect(document.body.textContent).toContain('2');
  });
});
