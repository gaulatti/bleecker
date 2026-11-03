import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { OtpInput } from '../../src/components/otp-input';
import { keydown, render, type } from './helpers';

const inputs = () => Array.from(document.querySelectorAll<HTMLInputElement>('input'));

function Harness({ initial = '', length, ...rest }: { initial?: string; length?: number; secure?: boolean; disabled?: boolean }) {
  const [value, setValue] = React.useState(initial);
  return <OtpInput value={value} length={length} onChange={setValue} {...rest} />;
}

describe('OtpInput', () => {
  test('renders one labelled input per digit and masks when secure', async () => {
    await render(<OtpInput length={4} secure />);
    expect(inputs().map(input => input.getAttribute('aria-label'))).toEqual(['Digit 1', 'Digit 2', 'Digit 3', 'Digit 4']);
    expect(inputs().every(input => input.type === 'password')).toBe(true);
    expect(document.querySelector('[role=group]')?.getAttribute('aria-label')).toBe('One-time password input');
  });

  test('typing a digit stores it and advances; non-digits and the last slot do not advance', async () => {
    await render(<Harness length={3} />);
    inputs()[0].focus();
    await type(inputs()[0], '7');
    expect(inputs().map(input => input.value)).toEqual(['7', '', '']);
    expect(document.activeElement).toBe(inputs()[1]);
    await type(inputs()[1], 'x');
    expect(inputs()[1].value).toBe('');
    expect(document.activeElement).toBe(inputs()[1]);
    await type(inputs()[1], '8');
    inputs()[2].focus();
    await type(inputs()[2], '9');
    expect(inputs().map(input => input.value)).toEqual(['7', '8', '9']);
    expect(document.activeElement).toBe(inputs()[2]);
  });

  test('works without an onChange handler', async () => {
    await render(<OtpInput length={2} />);
    await type(inputs()[0], '1');
    expect(inputs()[0].value).toBe('');
  });

  test('Backspace clears the current digit, or the previous one when empty, and ignores the first empty slot', async () => {
    const onChange = vi.fn();
    const view = await render(<OtpInput length={3} value='12' onChange={onChange} />);
    await keydown(inputs()[1], 'Backspace');
    expect(onChange).toHaveBeenLastCalledWith('1');
    inputs()[2].focus();
    await keydown(inputs()[2], 'Backspace');
    expect(onChange).toHaveBeenLastCalledWith('1');
    expect(document.activeElement).toBe(inputs()[1]);
    const calls = onChange.mock.calls.length;
    await view.rerender(<OtpInput length={3} value='' onChange={onChange} />);
    await keydown(inputs()[0], 'Backspace');
    expect(onChange).toHaveBeenCalledTimes(calls);
  });

  test('arrow keys move focus within bounds', async () => {
    await render(<OtpInput length={3} />);
    inputs()[1].focus();
    await keydown(inputs()[1], 'ArrowLeft');
    expect(document.activeElement).toBe(inputs()[0]);
    await keydown(inputs()[0], 'ArrowLeft');
    expect(document.activeElement).toBe(inputs()[0]);
    await keydown(inputs()[0], 'ArrowRight');
    await keydown(inputs()[1], 'ArrowRight');
    expect(document.activeElement).toBe(inputs()[2]);
    await keydown(inputs()[2], 'ArrowRight');
    expect(document.activeElement).toBe(inputs()[2]);
    await keydown(inputs()[2], 'a');
    expect(document.activeElement).toBe(inputs()[2]);
  });

  test('pasting keeps only digits up to the length and focuses the next empty slot', async () => {
    const onChange = vi.fn();
    await render(<OtpInput length={4} onChange={onChange} />);
    const paste = async (text: string) => {
      const data = new DataTransfer();
      data.setData('text', text);
      await act(async () => {
        inputs()[0].dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
      });
    };
    await paste('1a2');
    expect(onChange).toHaveBeenLastCalledWith('12');
    expect(document.activeElement).toBe(inputs()[2]);
    await paste('987654');
    expect(onChange).toHaveBeenLastCalledWith('9876');
    expect(document.activeElement).toBe(inputs()[3]);
  });

  test('focus selects the content and disabled inputs carry the disabled state', async () => {
    await render(<Harness length={2} initial='5' disabled />);
    expect(inputs().every(input => input.disabled)).toBe(true);
    expect(inputs()[0].className).toContain('cursor-not-allowed');
  });

  test('focusing an input selects its text', async () => {
    await render(<OtpInput length={2} value='45' />);
    inputs()[0].focus();
    expect(inputs()[0].selectionStart).toBe(0);
    expect(inputs()[0].selectionEnd).toBe(1);
  });
});
