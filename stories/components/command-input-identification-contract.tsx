import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CommandSpotlight, type CommandSpotlightProps } from '../../src/components/command-spotlight';

export function InputIdentificationFixture({ args, includeCustom = false }: { args: CommandSpotlightProps; includeCustom?: boolean }) {
  const [open, setOpen] = React.useState({ default: false, custom: false });
  const [events, setEvents] = React.useState<string[]>([]);
  const instances: Array<'default' | 'custom'> = includeCustom ? ['default', 'custom'] : ['default'];
  const record = (event: string) => setEvents(previous => [...previous, event]);

  return (
    <div className='space-y-6'>
      {instances.map(instance => {
        // A plain object spread lets the regression run against the old API
        // before inputLabel exists, without a cast or a suppressed type error.
        // The old component ignores it; actual input assertions must fail RED.
        const inputIdentity = instance === 'custom' ? { inputLabel: 'Find a workflow action' } : {};
        return (
          <section key={instance} aria-label={`${instance} command input fixture`}>
            <CommandSpotlight
              {...args}
              {...inputIdentity}
              triggerLabel={`Open ${instance} command input`}
              placeholder={instance === 'custom' ? 'Filter workflow actions…' : 'Search commands...'}
              actions={[
                { id: 'preview', title: 'Open component preview', onSelect: () => record(`${instance}:ran:preview`) },
                { id: 'save', title: 'Save draft', onSelect: () => record(`${instance}:ran:save`) }
              ]}
              open={open[instance]}
              onOpenChange={next => {
                record(`${instance}:${next ? 'open' : 'closed'}`);
                setOpen(previous => ({ ...previous, [instance]: next }));
              }}
              onActionSelect={action => record(`${instance}:selected:${action.id}`)}
            />
          </section>
        );
      })}
      <p role='status' aria-label='Command callbacks'>{events.join(' → ') || 'No command callbacks yet'}</p>
    </div>
  );
}

async function openIdentifiedInput(canvasElement: HTMLElement, instance: 'default' | 'custom') {
  const section = within(canvasElement).getByRole('region', { name: `${instance} command input fixture` });
  const trigger = within(section).getByRole('button', { name: 'Open command spotlight' });
  await userEvent.click(trigger);
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: 'Command spotlight' });
  const input = within(dialog).getByRole('textbox');
  if (!(input instanceof HTMLInputElement)) throw new Error('Command search must be an actual input element');
  console.info('command-input-identification', JSON.stringify({ instance, id: input.id, ariaLabel: input.getAttribute('aria-label'), placeholder: input.placeholder, value: input.value }));
  return { trigger, dialog, input };
}

async function waitForInputExit(input: HTMLInputElement, trigger: HTMLElement) {
  await waitFor(() => expect(input.isConnected).toBe(false));
  await waitFor(() => expect(trigger).toHaveFocus());
}


export async function verifyDefaultInputIdentification(canvasElement: HTMLElement) {
  const first = await openIdentifiedInput(canvasElement, 'default');
  // Assert the explicit authored name, not a placeholder-derived fallback.
  await expect(first.input).toHaveAttribute('aria-label', 'Search commands');
  await expect(first.input).toHaveAccessibleName('Search commands');
  await expect(first.input.id).not.toBe('');
  const id = first.input.id;
  await expect(first.input).not.toHaveAttribute('name');
  await expect(first.input).not.toHaveAttribute('autocomplete');
  await userEvent.click(first.input);
  await userEvent.type(first.input, 'preview');
  await expect(first.input.id).toBe(id);
  await expect(first.input).toHaveAccessibleName('Search commands');
  await expect(within(first.dialog).getByRole('button', { name: 'Open component preview' })).toBeVisible();
  await expect(within(first.dialog).queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  await waitForInputExit(first.input, first.trigger);
  await expect(within(canvasElement).getByRole('status', { name: 'Command callbacks' }).textContent).toBe('default:open → default:selected:preview → default:ran:preview → default:closed');
  const reopened = await openIdentifiedInput(canvasElement, 'default');
  await expect(reopened.input.id).toBe(id);
  await expect(reopened.input).toHaveValue('');
  await expect(reopened.input).toHaveAccessibleName('Search commands');
  await userEvent.click(reopened.input);
  await userEvent.keyboard('{Escape}');
  await waitForInputExit(reopened.input, reopened.trigger);
}

export async function verifyCustomInputIdentification(canvasElement: HTMLElement) {
  const first = await openIdentifiedInput(canvasElement, 'default');
  await expect(first.input.id).not.toBe('');
  const firstId = first.input.id;
  await userEvent.click(first.input);
  await userEvent.keyboard('{Escape}');
  await waitForInputExit(first.input, first.trigger);
  const custom = await openIdentifiedInput(canvasElement, 'custom');
  await expect(custom.input.id).not.toBe('');
  await expect(custom.input.id).not.toBe(firstId);
  const customId = custom.input.id;
  await expect(custom.input).toHaveAttribute('aria-label', 'Find a workflow action');
  await expect(custom.input).toHaveAccessibleName('Find a workflow action');
  await expect(custom.input).toHaveAttribute('placeholder', 'Filter workflow actions…');
  await expect(custom.input).not.toHaveAttribute('name');
  await expect(custom.input).not.toHaveAttribute('autocomplete');
  await userEvent.click(custom.input);
  await userEvent.type(custom.input, 'preview');
  await expect(custom.input.id).toBe(customId);
  await expect(custom.input).toHaveAccessibleName('Find a workflow action');
  await expect(within(custom.dialog).getByRole('button', { name: 'Open component preview' })).toBeVisible();
  await expect(within(custom.dialog).queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  await waitForInputExit(custom.input, custom.trigger);
  await expect(within(canvasElement).getByRole('status', { name: 'Command callbacks' }).textContent).toBe('default:open → default:closed → custom:open → custom:selected:preview → custom:ran:preview → custom:closed');
  const reopened = await openIdentifiedInput(canvasElement, 'custom');
  await expect(reopened.input.id).toBe(customId);
  await expect(reopened.input).toHaveValue('');
  await expect(reopened.input).toHaveAccessibleName('Find a workflow action');
  await userEvent.click(reopened.input);
  await userEvent.keyboard('{Escape}');
  await waitForInputExit(reopened.input, reopened.trigger);
}
