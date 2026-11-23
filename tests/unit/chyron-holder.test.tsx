import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ChyronHolder } from '../../src/components/chyron-holder';
import { render } from './helpers';

// gaulatti/alcantara#183: the generic on-air chyron.

/** The innermost element whose own text is `text`: the line itself, not its wrapper. */
function textNode(container: HTMLElement, text: string): Element | undefined {
  return Array.from(container.querySelectorAll('*')).filter((node) => node.textContent === text).pop();
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
});

it('shows nothing until it is shown with text', async () => {
  const view = await render(<ChyronHolder text='Breaking' />);
  expect(view.container).toBeEmptyDOMElement();
  await view.rerender(<ChyronHolder show />);
  expect(view.container).toBeEmptyDOMElement();
  await view.rerender(<ChyronHolder show text='Breaking' />);
  const chyron = view.container.querySelector('.chyron-holder');
  expect(chyron).toHaveClass('chyron-visible');
  expect(chyron?.textContent).toContain('Breaking');
});

it('fades the old text out before showing new text', async () => {
  const view = await render(<ChyronHolder show text='First line' />);
  await view.rerender(<ChyronHolder show text='Second line' />);
  const first = textNode(view.container, 'First line');
  expect(first).toHaveClass('is-changing');
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  const second = textNode(view.container, 'Second line');
  expect(second).not.toHaveClass('is-changing');
});

it('hides when it is taken off air', async () => {
  const view = await render(<ChyronHolder show text='Breaking' />);
  await view.rerender(<ChyronHolder show={false} text='Breaking' />);
  expect(view.container).toBeEmptyDOMElement();
});
