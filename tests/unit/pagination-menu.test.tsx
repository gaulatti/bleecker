import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '../../src/components/dropdown-menu';
import { Pagination } from '../../src/components/pagination';
import { click, render } from './helpers';

const pageNumbers = () => Array.from(document.querySelectorAll('nav button')).map(button => button.textContent).filter(Boolean);

describe('Pagination', () => {
  test('renders nothing for a single page', async () => {
    const view = await render(<Pagination currentPage={1} totalPages={1} hasNextPage={false} hasPrevPage={false} onPageChange={() => undefined} />);
    expect(view.container.innerHTML).toBe('');
  });

  test.each([
    [1, 5, ['1', '2', '3', '4', '5']],
    [1, 20, ['1', '2', '3', '4', '5', '6', '7']],
    [4, 20, ['1', '2', '3', '4', '5', '6', '7']],
    [10, 20, ['7', '8', '9', '10', '11', '12', '13']],
    [17, 20, ['14', '15', '16', '17', '18', '19', '20']],
    [20, 20, ['14', '15', '16', '17', '18', '19', '20']]
  ])('window for page %i of %i', async (currentPage, totalPages, expected) => {
    await render(<Pagination currentPage={currentPage} totalPages={totalPages} hasNextPage hasPrevPage onPageChange={() => undefined} />);
    expect(pageNumbers()).toEqual(expected);
  });

  test('navigates with previous, next and page buttons and honours disabled edges', async () => {
    const onPageChange = vi.fn();
    const view = await render(<Pagination currentPage={3} totalPages={9} hasNextPage hasPrevPage onPageChange={onPageChange} className='x' />);
    await click(document.querySelector('button[title="Previous page"]')!);
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    await click(document.querySelector('button[title="Next page"]')!);
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    await click(Array.from(document.querySelectorAll('nav button')).find(button => button.textContent === '6')!);
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    await view.rerender(<Pagination currentPage={1} totalPages={9} hasNextPage hasPrevPage={false} onPageChange={onPageChange} />);
    expect((document.querySelector('button[title="Previous page"]') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('DropdownMenu', () => {
  test('renders labels, shortcuts, separators, inset items, checkboxes, radios and submenus', async () => {
    const onSelect = vi.fn();
    const onChecked = vi.fn();
    const onRadio = vi.fn();
    await render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button id='trigger'>Open</button></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Inset label</DropdownMenuLabel>
          <DropdownMenuLabel>Plain label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem inset onSelect={onSelect}>Inset item<DropdownMenuShortcut>⌘K</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem>Plain item</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked onCheckedChange={onChecked}>Check</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value='a' onValueChange={onRadio}>
            <DropdownMenuRadioItem value='a'>Radio A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='b'>Radio B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent><DropdownMenuItem>Nested</DropdownMenuItem></DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Other</DropdownMenuSubTrigger>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await userEvent.click(document.getElementById('trigger')!);
    await vi.waitFor(() => expect(document.querySelector('[role=menu]')).not.toBeNull());
    const menu = document.querySelector('[role=menu]')!;
    expect(menu.textContent).toContain('Inset label');
    expect(menu.textContent).toContain('⌘K');
    expect(menu.querySelector('[role=separator]')).not.toBeNull();
    const item = (text: string) => Array.from(menu.querySelectorAll<HTMLElement>('[role^=menuitem]')).find(node => node.textContent?.startsWith(text))!;
    expect(item('Inset item').className).toContain('pl-8');
    expect(item('More').className).toContain('pl-8');
    expect(item('Other').className).not.toContain('pl-8');
    expect(item('Check').getAttribute('aria-checked')).toBe('true');
    expect(item('Radio A').getAttribute('aria-checked')).toBe('true');
    await userEvent.click(item('Radio B'));
    expect(onRadio).toHaveBeenCalledWith('b');
  });

  test('menu actions run their handlers', async () => {
    const onSelect = vi.fn();
    const onChecked = vi.fn();
    await render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button id='trigger'>Open</button></DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={2} className='c'>
          <DropdownMenuItem onSelect={onSelect}>Run</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onChecked}>Check</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await userEvent.click(document.getElementById('trigger')!);
    await vi.waitFor(() => expect(document.querySelector('[role=menu]')).not.toBeNull());
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find(node => node.textContent === 'Run')!);
    expect(onSelect).toHaveBeenCalled();
    await userEvent.click(document.getElementById('trigger')!);
    await vi.waitFor(() => expect(document.querySelector('[role=menu]')).not.toBeNull());
    await userEvent.click(document.querySelector('[role=menuitemcheckbox]')!);
    expect(onChecked).toHaveBeenCalledWith(true);
  });
});
