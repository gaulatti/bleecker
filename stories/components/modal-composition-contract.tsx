import React from 'react';
import { createPortal } from 'react-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AlertDialog } from '../../src/components/alert-dialog';
import { Button } from '../../src/components/button';
import { CommandSpotlight } from '../../src/components/command-spotlight';
import { Drawer } from '../../src/components/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../../src/components/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../../src/components/context-menu';
import { Tooltip } from '../../src/components/tooltip';
import { useTheme } from '../../src/theme/theme-provider';
import { Modal } from '../../src/components/modal';
import { Popover } from '../../src/components/popover';
import { Sheet } from '../../src/components/sheet';
import { useModalBranch, useModalLayer } from '../../src/utils/hooks';

export function MixedModalContract() {
  const [drawer, setDrawer] = React.useState(false);
  const [modal, setModal] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const [spotlight, setSpotlight] = React.useState(false);
  return <>
    <Button onClick={() => setDrawer(true)}>Open workspace</Button>
    <Drawer isOpen={drawer} onClose={() => setDrawer(false)} title='Workspace'>
      <Button onClick={() => setModal(true)}>Open release dialog</Button>
      <Modal isOpen={modal} onClose={() => setModal(false)} title='Release dialog'>
        <Button onClick={() => setAlert(true)}>Request confirmation</Button>
        <AlertDialog isOpen={alert} title='Release confirmation' onCancel={() => setAlert(false)} onConfirm={() => setAlert(false)} />
        <CommandSpotlight open={spotlight} onOpenChange={setSpotlight} triggerLabel='Open commands' actions={[{ id: 'save', title: 'Save revision' }]} />
        <Button>Last release action</Button>
      </Modal>
      <Button>Last workspace action</Button>
    </Drawer>
  </>;
}

export async function verifyMixedModals(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  const trigger = within(canvasElement).getByRole('button', { name: 'Open workspace' });
  const overflow = doc.body.style.overflow;
  await userEvent.click(trigger);
  const workspace = await body.findByRole('dialog', { name: 'Workspace' });
  await userEvent.click(within(workspace).getByRole('button', { name: 'Open release dialog' }));
  const modal = await body.findByRole('dialog', { name: 'Release dialog' });
  await waitFor(() => expect(within(modal).getByRole('button', { name: 'Close', exact: true })).toHaveFocus());
  await expect(workspace.inert).toBe(true);
  await userEvent.tab({ shift: true });
  await expect(within(modal).getByRole('button', { name: 'Last release action' })).toHaveFocus();
  await userEvent.click(within(modal).getByRole('button', { name: 'Request confirmation' }));
  const alert = await body.findByRole('alertdialog', { name: 'Release confirmation' });
  await waitFor(() => expect(within(alert).getByRole('button', { name: 'Cancel' })).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(modal).getByRole('button', { name: 'Request confirmation' })).toHaveFocus());
  await expect(modal.inert).toBe(false);
  await expect(workspace.inert).toBe(true);
  await userEvent.click(within(modal).getByRole('button', { name: 'Open command spotlight', exact: true }));
  const commands = await body.findByRole('dialog', { name: 'Command spotlight' });
  await waitFor(() => expect(within(commands).getByRole('textbox')).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(modal).getByRole('button', { name: 'Open command spotlight', exact: true })).toHaveFocus());
  await expect(doc.body.style.overflow).toBe('hidden');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(workspace).getByRole('button', { name: 'Open release dialog' })).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  await expect(doc.body.style.overflow).toBe(overflow);
}

export function SimultaneousNestedContract() {
  const [open, setOpen] = React.useState(false);
  const [child, setChild] = React.useState(true);
  return <>
    <Button onClick={() => setOpen(true)}>Open both panels</Button>
    {open && <Drawer isOpen onClose={() => setOpen(false)} title='Simultaneous parent'>
      <Button>Parent action</Button>
      <Sheet isOpen={child} onClose={() => setChild(false)} title='Simultaneous child'><Button>Child action</Button></Sheet>
    </Drawer>}
  </>;
}

export async function verifySimultaneousNested(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open both panels' }));
  const child = await body.findByRole('dialog', { name: 'Simultaneous child' });
  await waitFor(() => expect(within(child).getByRole('button', { name: 'Close', exact: true })).toHaveFocus());
  const parent = body.getByRole('dialog', { name: 'Simultaneous parent', hidden: true });
  await expect(parent.inert).toBe(true);
  await expect(Number(child.closest<HTMLElement>('[data-bleecker-modal-overlay]')?.style.zIndex)).toBeGreaterThan(Number(parent.closest<HTMLElement>('[data-bleecker-modal-overlay]')?.style.zIndex));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(parent).getByRole('button', { name: 'Parent action' })).toHaveFocus());
  await userEvent.keyboard('{Escape}');
}

export function NativeFocusContract() {
  const [open, setOpen] = React.useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>Open native controls</Button>
    <Drawer isOpen={open} onClose={() => setOpen(false)} title='Native controls'>
      <button tabIndex={2}>Second priority</button>
      <button tabIndex={1}>First priority</button>
      <details><summary>Disclosure</summary><p>Details</p></details>
      <div contentEditable='' suppressContentEditableWarning role='textbox' aria-label='Rich editor'>Rich content</div>
      <div contentEditable='plaintext-only' suppressContentEditableWarning role='textbox' aria-label='Plain editor'>Plain content</div>
    </Drawer>
  </>;
}

export async function verifyNativeFocus(canvasElement: HTMLElement) {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open native controls' }));
  const dialog = within(await body.findByRole('dialog', { name: 'Native controls' }));
  await waitFor(() => expect(dialog.getByRole('button', { name: 'First priority' })).toHaveFocus());
  await userEvent.tab();
  await expect(dialog.getByRole('button', { name: 'Second priority' })).toHaveFocus();
  await userEvent.tab();
  await expect(dialog.getByText('Disclosure')).toHaveFocus();
  await userEvent.tab();
  await expect(dialog.getByRole('textbox', { name: 'Rich editor' })).toHaveFocus();
  await userEvent.tab();
  await expect(dialog.getByRole('textbox', { name: 'Plain editor' })).toHaveFocus();
  await userEvent.tab();
  await expect(dialog.getByRole('button', { name: 'First priority' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
}

export function PortaledWidgetContract() {
  const [open, setOpen] = React.useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>Open popup workspace</Button>
    <Drawer isOpen={open} onClose={() => setOpen(false)} title='Popup workspace'>
      <Popover content={<div className='space-y-2'><Button>First popup action</Button><Button>Second popup action</Button></div>}>
        <Button>Open popup</Button>
      </Popover>
      <Button>Last workspace control</Button>
    </Drawer>
  </>;
}

export async function verifyPortaledWidget(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open popup workspace' }));
  const workspace = await body.findByRole('dialog', { name: 'Popup workspace' });
  await userEvent.click(within(workspace).getByRole('button', { name: 'Open popup' }));
  const first = await body.findByRole('button', { name: 'First popup action' });
  await waitFor(() => expect(first).toHaveFocus());
  await userEvent.tab();
  await expect(body.getByRole('button', { name: 'Second popup action' })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(workspace).getByRole('button', { name: 'Open popup' })).toHaveFocus());
  await expect(doc.body.style.overflow).toBe('hidden');
  await userEvent.keyboard('{Escape}');
}

function FramePanel({ doc, open, onClose }: { doc: Document; open: boolean; onClose: () => void }) {
  const panelRef = useModalLayer<HTMLDivElement>(open, onClose);
  return open ? createPortal(<div ref={panelRef} role='dialog' aria-label='Frame panel' tabIndex={-1}><button>Frame action</button><button onClick={onClose}>Close frame panel</button></div>, doc.body) : null;
}

export function FrameRealmContract() {
  const [doc, setDoc] = React.useState<Document | null>(null);
  const [open, setOpen] = React.useState(false);
  return <>
    <iframe title='Modal test frame' onLoad={(event) => setDoc(event.currentTarget.contentDocument)} srcDoc='<!doctype html><html><body></body></html>' />
    {doc && createPortal(<button onClick={() => setOpen(true)}>Frame opener</button>, doc.body)}
    {doc && <FramePanel doc={doc} open={open} onClose={() => setOpen(false)} />}
  </>;
}

export async function verifyFrameRealm(canvasElement: HTMLElement) {
  const frame = within(canvasElement).getByTitle('Modal test frame') as HTMLIFrameElement;
  await waitFor(() => expect(frame.contentDocument?.body.querySelector('button')).not.toBeNull());
  const body = within(frame.contentDocument!.body);
  const opener = body.getByRole('button', { name: 'Frame opener' });
  await userEvent.click(opener);
  await waitFor(() => expect(body.getByRole('button', { name: 'Frame action' })).toHaveFocus());
  await userEvent.click(body.getByRole('button', { name: 'Close frame panel' }));
  await waitFor(() => expect(opener).toHaveFocus());
}

export function PortaledMenusContract() {
  const { theme, setTheme } = useTheme();
  const initialTheme = React.useRef(theme);
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  return <>
    <Button onClick={() => setOpen(true)}>Open menu workspace</Button>
    <Drawer isOpen={open} onClose={() => setOpen(false)} title='Menu workspace'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button>Story actions</Button></DropdownMenuTrigger>
        <DropdownMenuContent ref={menuRef}>
          <DropdownMenuItem>Save story</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Release options</DropdownMenuSubTrigger>
            <DropdownMenuPortal><DropdownMenuSubContent><DropdownMenuItem>Release tomorrow</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <ContextMenu>
        <ContextMenuTrigger asChild><Button>Story context</Button></ContextMenuTrigger>
        <ContextMenuContent><ContextMenuItem>Inspect story</ContextMenuItem></ContextMenuContent>
      </ContextMenu>
      <Tooltip content='Review before release' delayDuration={0}><Button>Release help</Button></Tooltip>
      <div className='mt-3 flex flex-wrap gap-2'>
        <Button onClick={() => setTheme('light')}>Light theme</Button>
        <Button onClick={() => setTheme('dark')}>Dark theme</Button>
        <Button onClick={() => setTheme(initialTheme.current)}>Restore theme</Button>
      </div>
    </Drawer>
  </>;
}

export async function verifyPortaledMenus(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  const trigger = within(canvasElement).getByRole('button', { name: 'Open menu workspace' });
  await userEvent.click(trigger);
  const workspace = await body.findByRole('dialog', { name: 'Menu workspace' });
  const actions = within(workspace).getByRole('button', { name: 'Story actions' });
  await userEvent.click(actions);
  const menu = await body.findByRole('menu');
  await expect(menu.closest('[inert]')).toBeNull();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(body.getByRole('menuitem', { name: 'Save story' })).toHaveFocus());
  await userEvent.keyboard('{ArrowDown}{ArrowRight}');
  const release = await body.findByRole('menuitem', { name: 'Release tomorrow' });
  await waitFor(() => expect(release).toHaveFocus());
  await expect(release.closest('[inert]')).toBeNull();
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() => expect(body.getByRole('menuitem', { name: 'Release options' })).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(actions).toHaveFocus());
  const context = within(workspace).getByRole('button', { name: 'Story context' });
  await userEvent.pointer({ target: context, keys: '[MouseRight]' });
  const inspect = await body.findByRole('menuitem', { name: 'Inspect story' });
  await expect(inspect.closest('[inert]')).toBeNull();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(doc.querySelector('[role="menu"]')).toBeNull());
  await expect(workspace.inert).toBe(false);
  const help = within(workspace).getByRole('button', { name: 'Release help' });
  for (const theme of ['Light theme', 'Dark theme']) {
    await userEvent.click(within(workspace).getByRole('button', { name: theme }));
    await userEvent.hover(help);
    const tooltip = await body.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Review before release');
    await expect(tooltip.closest('[inert]')).toBeNull();
    const surface = tooltip;
    const styles = doc.defaultView!.getComputedStyle(surface);
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const linear = rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const foreground = luminance(styles.color);
    const background = luminance(styles.backgroundColor);
    await expect((Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)).toBeGreaterThanOrEqual(4.5);
    await userEvent.unhover(help);
    await waitFor(() => expect(doc.querySelector('[role="tooltip"]')).toBeNull());
  }
  await userEvent.click(within(workspace).getByRole('button', { name: 'Restore theme' }));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
}

function OwnedReleaseWidget() {
  const branchRef = useModalBranch<HTMLDivElement>();
  const [open, setOpen] = React.useState(false);
  return createPortal(<div ref={branchRef} className='fixed left-4 top-4 rounded-lg bg-card p-4'>
    <Button onClick={() => setOpen(true)}>Release from owned widget</Button>
    <Modal isOpen={open} onClose={() => setOpen(false)} title='Widget release'><Button>Release story</Button></Modal>
  </div>, document.body);
}

export function NestedBranchContract() {
  const [open, setOpen] = React.useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>Open branch workspace</Button>
    <Drawer isOpen={open} onClose={() => setOpen(false)} title='Branch workspace'>
      <Button>Workspace action</Button>
      <OwnedReleaseWidget />
    </Drawer>
  </>;
}

export async function verifyNestedBranch(canvasElement: HTMLElement) {
  const doc = canvasElement.ownerDocument;
  const body = within(doc.body);
  const opener = within(canvasElement).getByRole('button', { name: 'Open branch workspace' });
  await userEvent.click(opener);
  const trigger = await body.findByRole('button', { name: 'Release from owned widget' });
  await userEvent.click(trigger);
  const child = await body.findByRole('dialog', { name: 'Widget release' });
  await waitFor(() => expect(within(child).getByRole('button', { name: 'Close', exact: true })).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(opener).toHaveFocus());
}
