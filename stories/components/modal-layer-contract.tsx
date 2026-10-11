import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../../src/components/button';
import { Drawer } from '../../src/components/drawer';
import { Sheet } from '../../src/components/sheet';
import { Select } from '../../src/components/select';

export function ModalLayerContract({ kind, initiallyOpen = false }: { kind: 'drawer' | 'sheet'; initiallyOpen?: boolean }) {
  const [open, setOpen] = React.useState(initiallyOpen);
  const [nested, setNested] = React.useState(false);
  const [extra, setExtra] = React.useState(false);
  const [mounted, setMounted] = React.useState(true);
  const [dismissals, setDismissals] = React.useState(0);
  const [section, setSection] = React.useState('news');
  const Surface = kind === 'drawer' ? Drawer : Sheet;
  return (
    <React.StrictMode>
      <div className='space-y-4 p-6'>
        <Button onClick={() => { setMounted(true); setOpen(true); }}>Open panel</Button>
        <Button variant='secondary'>Background action</Button>
        <output aria-label='Dismissals'>{dismissals}</output>
        {mounted && <Surface isOpen={open} onClose={() => { setOpen(false); setDismissals((n) => n + 1); }} title='Keyboard workspace'>
          <div className='space-y-3'>
            <Button hidden>Hidden action</Button>
            <div style={{ display: 'none' }}><Button>CSS hidden action</Button></div>
            <Button disabled>Disabled action</Button>
            <fieldset disabled><Button>Disabled group action</Button></fieldset>
            <Button tabIndex={-1}>Programmatic action</Button>
            <Button onClick={() => setNested(true)}>Open nested sheet</Button>
            <Select aria-label='Section' value={section} onChange={setSection} options={[{ value: 'news', label: 'News' }, { value: 'culture', label: 'Culture' }]} />
            <Button onClick={() => setExtra((value) => !value)}>Change actions</Button>
            {extra && <Button>Added action</Button>}
            <Button onClick={() => setMounted(false)}>Unmount panel</Button>
            <Button onClick={() => setOpen(false)}>Finish</Button>
          </div>
        </Surface>}
        <Sheet isOpen={nested} onClose={() => setNested(false)} title='Nested workspace'>
          <Button onClick={() => { setMounted(false); }}>Unmount parent</Button>
          <Button onClick={() => setNested(false)}>Finish nested</Button>
        </Sheet>
      </div>
    </React.StrictMode>
  );
}

export async function verifyModalLayer(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const doc = canvasElement.ownerDocument;
  const originalOverflow = doc.body.style.overflow;
  const trigger = canvas.getByRole('button', { name: 'Open panel' });
  await userEvent.click(trigger);
  const dialog = await body.findByRole('dialog', { name: 'Keyboard workspace' });
  const panel = within(dialog);
  const first = kindFirst(dialog);
  const last = panel.getByRole('button', { name: 'Finish', exact: true });
  await waitFor(() => expect(first).toHaveFocus());
  if (doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await expect(parseFloat(getComputedStyle(dialog).transitionDuration)).toBeLessThan(0.001);
    await expect(doc.defaultView.innerWidth).toBe(390);
  }
  await expect(doc.body.style.overflow).toBe('hidden');
  await userEvent.tab({ shift: true });
  await expect(last).toHaveFocus();
  await userEvent.tab();
  await expect(first).toHaveFocus();
  await userEvent.click(panel.getByRole('combobox', { name: 'Section' }));
  await expect(await body.findByRole('listbox')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(panel.getByRole('combobox', { name: 'Section' })).toHaveFocus());
  await expect(canvas.getByRole('status', { name: 'Dismissals' })).toHaveTextContent('0');
  await userEvent.click(panel.getByRole('button', { name: 'Change actions' }));
  await userEvent.tab();
  await expect(panel.getByRole('button', { name: 'Added action' })).toHaveFocus();
  // Programmatic-only controls do not become stops in the Tab cycle.
  panel.getByRole('button', { name: 'Programmatic action' }).focus();
  await userEvent.tab();
  await expect(first).toHaveFocus();
  await userEvent.click(panel.getByRole('button', { name: 'Open nested sheet' }));
  const nested = await body.findByRole('dialog', { name: 'Nested workspace' });
  await waitFor(() => expect(within(nested).getByRole('button', { name: 'Close', exact: true })).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(panel.getByRole('button', { name: 'Open nested sheet' })).toHaveFocus());
  await expect(doc.body.style.overflow).toBe('hidden');
  await expect(canvas.getByRole('status', { name: 'Dismissals' })).toHaveTextContent('0');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  await expect(dialog.inert).toBe(true);
  await expect(doc.body.style.overflow).toBe(originalOverflow);
  await expect(canvas.getByRole('status', { name: 'Dismissals' })).toHaveTextContent('1');
  // Reopen during the exit-presence window, with a new onClose closure.
  await userEvent.click(trigger);
  await waitFor(() => expect(kindFirst(dialog)).toHaveFocus());
  await userEvent.click(panel.getByRole('button', { name: 'Unmount panel' }));
  await waitFor(() => expect(trigger).toHaveFocus());
  await expect(doc.body.style.overflow).toBe(originalOverflow);
  await userEvent.keyboard('{Escape}');
  await expect(canvas.getByRole('status', { name: 'Dismissals' })).toHaveTextContent('1');
}

export async function verifyInitiallyOpen(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const dialog = await within(doc.body).findByRole('dialog', { name: 'Keyboard workspace' });
  await waitFor(() => expect(kindFirst(dialog)).toHaveFocus());
  await expect(doc.body.style.overflow).toBe('hidden');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(doc.body.style.overflow).not.toBe('hidden'));
}

export async function verifyParentUnmount(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  const trigger = within(canvasElement).getByRole('button', { name: 'Open panel' });
  const originalOverflow = doc.body.style.overflow;
  await userEvent.click(trigger);
  const parent = await body.findByRole('dialog', { name: 'Keyboard workspace' });
  await userEvent.click(within(parent).getByRole('button', { name: 'Open nested sheet' }));
  const child = await body.findByRole('dialog', { name: 'Nested workspace' });
  await userEvent.click(within(child).getByRole('button', { name: 'Unmount parent' }));
  await expect(doc.body.style.overflow).toBe('hidden');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  await expect(doc.body.style.overflow).toBe(originalOverflow);
}

export function EmptyModalContract() {
  const [open, setOpen] = React.useState(false);
  const [control, setControl] = React.useState(false);
  return <div onKeyDown={(event) => { if (open && event.key === 'ArrowDown') setControl(true); }}>
    <Button onClick={() => setOpen(true)}>Open empty drawer</Button>
    <Drawer isOpen={open} onClose={() => setOpen(false)} title='Empty workspace' description='Press Arrow Down to add an action.'>
      {control && <Button>Arriving action</Button>}
    </Drawer>
  </div>;
}

export async function verifyEmptyModal(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  const trigger = within(canvasElement).getByRole('button', { name: 'Open empty drawer' });
  await userEvent.click(trigger);
  const dialog = await body.findByRole('dialog', { name: 'Empty workspace' });
  await waitFor(() => expect(dialog).toHaveFocus());
  await userEvent.tab({ shift: true });
  await expect(dialog).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  const action = await within(dialog).findByRole('button', { name: 'Arriving action' });
  await userEvent.tab();
  await expect(action).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
}

function kindFirst(dialog: HTMLElement) {
  const panel = within(dialog);
  return panel.queryByRole('button', { name: 'Close', exact: true }) ?? panel.getByRole('button', { name: 'Open nested sheet' });
}
