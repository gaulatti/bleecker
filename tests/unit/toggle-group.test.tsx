import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { ToggleGroup, ToggleGroupItem } from '../../src/components/toggle-group';
import { click, render } from './helpers';

const buttons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('button'));

describe('ToggleGroup', () => {
  test('single mode selects, toggles off and reports through onValueChange', async () => {
    const onValueChange = vi.fn();
    const view = await render(
      <ToggleGroup type='single' value='a' onValueChange={onValueChange} size='sm' variant='outline'>
        <ToggleGroupItem value='a'>A</ToggleGroupItem>
        <ToggleGroupItem value='b' disabled>B</ToggleGroupItem>
        <ToggleGroupItem value='c' size='lg' variant='default'>C</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(buttons().map(button => button.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    expect(buttons()[1].disabled).toBe(true);
    await click(buttons()[0]);
    expect(onValueChange).toHaveBeenLastCalledWith('');
    await click(buttons()[2]);
    expect(onValueChange).toHaveBeenLastCalledWith('c');
    await view.rerender(<ToggleGroup type='single'><ToggleGroupItem value='a'>A</ToggleGroupItem></ToggleGroup>);
    await click(buttons()[0]);
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
  });

  test('multiple mode adds and removes values', async () => {
    const onValueChange = vi.fn();
    await render(
      <ToggleGroup type='multiple' value={['a']} onValueChange={onValueChange} disabled>
        <ToggleGroupItem value='a'>A</ToggleGroupItem>
        <ToggleGroupItem value='b' disabled={false}>B</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(buttons().map(button => button.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
    expect(buttons().map(button => button.disabled)).toEqual([true, false]);
    await click(buttons()[1]);
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
    onValueChange.mockClear();
  });

  test('multiple mode removes a selected value and tolerates missing value and handler', async () => {
    const onValueChange = vi.fn();
    const view = await render(
      <ToggleGroup type='multiple' value={['a', 'b']} onValueChange={onValueChange}>
        <ToggleGroupItem value='a'>A</ToggleGroupItem>
      </ToggleGroup>
    );
    await click(buttons()[0]);
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
    await view.rerender(<ToggleGroup type='multiple'><ToggleGroupItem value='a'>A</ToggleGroupItem></ToggleGroup>);
    await click(buttons()[0]);
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
  });

  test('an item outside a group fails fast', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<ToggleGroupItem value='x'>X</ToggleGroupItem>)).rejects.toThrow('ToggleGroupItem must be used inside ToggleGroup');
    error.mockRestore();
  });
});
