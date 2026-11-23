import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';

import {
  accessErrorMessage,
  AccessPanel,
  type AccessClient,
  type AccessCreateTokenInput,
  type AccessError,
  type AccessGrant,
  type AccessHistoryEntry,
  type AccessRole,
  type AccessToken
} from '../../src/components/access-panel';

// Every value here is fictional. The token value is built in the story, never a
// real credential.
const FAKE_VALUE = ['pmp', 'pat', 'FICTIONALfictionalFICTIONALfictional0000000'].join('_');

const application = { key: 'monitor', name: 'Monitor' };

const someTokens: AccessToken[] = [
  {
    id: '7d1f0f3a-1111-4c2a-9b55-000000000001',
    name: 'Claude on my laptop',
    display_prefix: 'pmp_pat_AbCd',
    permissions: [],
    created_at: '2026-11-18T10:00:00Z',
    expires_at: '2026-12-18T10:00:00Z',
    last_used_at: '2026-11-19T08:30:00Z',
    created_via_application: 'monitor',
    last_used_application: 'monitor'
  },
  {
    id: '7d1f0f3a-1111-4c2a-9b55-000000000002',
    name: 'Nightly export',
    display_prefix: 'pmp_pat_EfGh',
    permissions: ['monitor:events:read'],
    created_at: '2026-10-01T10:00:00Z',
    expires_at: '',
    last_used_at: '',
    created_via_application: '',
    last_used_application: ''
  }
];

const roles: AccessRole[] = [
  { id: 1, name: 'Monitor reader', permissions: ['monitor:events:read'] },
  { id: 2, name: 'Monitor admin', permissions: ['monitor:events:read', 'monitor:events:write', 'monitor:access:manage'] }
];

const grants: AccessGrant[] = [{ id: 10, user_id: 42, user_email: 'editor@example.com', role_id: 1, role_name: 'Monitor reader', team_id: 3, granted_at: '2026-11-01T12:00:00Z' }];

const history: AccessHistoryEntry[] = [
  { at: '2026-11-19T08:00:00Z', action: 'role.assignment.create', actor_email: 'owner@example.com', target: 'role-assignment:10', via_application: 'monitor', via_client: 'console' },
  { at: '2026-11-18T09:00:00Z', action: 'application.personal_access_tokens', actor_email: 'owner@example.com', target: 'application:5', via_application: 'monitor', via_client: 'mcp' }
];

const refusal = (status: number, error: AccessError['error']): AccessError => ({ status, error });

/** A promise the story releases itself, so timing never decides a test. */
type Gate = { promise: Promise<void>; release: () => void };
function gate(): Gate {
  let release = () => undefined as void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

interface FakeOptions {
  tokens?: AccessToken[];
  enabled?: boolean;
  manage?: boolean;
  grants?: AccessGrant[];
  history?: AccessHistoryEntry[];
  unavailable?: boolean;
  grantRefusal?: AccessError;
  /** When set, the client offers listMyPermissions with these keys. */
  held?: string[];
  /** Calls that fail: an AccessError, or 'plain' for an Error without a code. */
  fail?: Partial<Record<string, AccessError | 'plain'>>;
  /** Every listMyPermissions call waits for the gate held here at call time. */
  heldGate?: { current?: Gate };
  /** Successive answers of listHistory, one page per call ('fail' rejects not_found). */
  historyPages?: Array<AccessHistoryEntry[] | 'fail'>;
}

/** An in-memory AccessClient that behaves like a service backend in front of Pompeii. */
function fakeClient(options: FakeOptions = {}): AccessClient & { calls: string[]; created: AccessCreateTokenInput[] } {
  let tokens = [...(options.tokens ?? [])];
  let enabled = options.enabled ?? true;
  let held = [...(options.grants ?? [])];
  const calls: string[] = [];
  const created: AccessCreateTokenInput[] = [];
  const answer = <T,>(name: string, value: () => T, manageOnly = false): Promise<T> => {
    calls.push(name);
    if (options.unavailable) return Promise.reject(refusal(503, 'access_unavailable'));
    const failure = options.fail?.[name];
    if (failure) return Promise.reject(failure === 'plain' ? new Error(`${name} failed`) : failure);
    if (manageOnly && !options.manage) return Promise.reject(refusal(403, 'forbidden'));
    try {
      return Promise.resolve(value());
    } catch (cause) {
      return Promise.reject(cause);
    }
  };
  const client: AccessClient & { calls: string[]; created: AccessCreateTokenInput[] } = {
    calls,
    created,
    listMyTokens: () => answer('listMyTokens', () => tokens),
    createMyToken: (input) =>
      answer('createMyToken', () => {
        if (!enabled) throw refusal(409, 'tokens_off');
        created.push(input);
        const token: AccessToken = {
          id: '7d1f0f3a-1111-4c2a-9b55-000000000099',
          name: input.name,
          display_prefix: FAKE_VALUE.slice(0, 12),
          permissions: input.permissions ?? [],
          created_at: '2026-11-19T09:00:00Z',
          expires_at: input.no_expiry ? '' : '2026-12-19T09:00:00Z',
          last_used_at: '',
          created_via_application: 'monitor',
          last_used_application: ''
        };
        tokens = [token, ...tokens];
        return { token, value: FAKE_VALUE };
      }),
    revokeMyToken: (id) =>
      answer('revokeMyToken', () => {
        tokens = tokens.filter((token) => token.id !== id);
      }),
    getTokenSwitch: () => answer('getTokenSwitch', () => enabled),
    setTokenSwitch: (next) =>
      answer(
        'setTokenSwitch',
        () => {
          enabled = next;
          return enabled;
        },
        true
      ),
    listRoles: () => answer('listRoles', () => roles, true),
    listGrants: () => answer('listGrants', () => held, true),
    grant: (input) =>
      answer(
        'grant',
        () => {
          if (options.grantRefusal) throw options.grantRefusal;
          const role = roles.find((item) => item.id === input.role_id);
          const record: AccessGrant = { id: 11, user_id: input.user_id, user_email: 'new.person@example.com', role_id: input.role_id, role_name: role?.name ?? '', team_id: 3, granted_at: '2026-11-19T09:05:00Z' };
          held = [...held, record];
          return record;
        },
        true
      ),
    revokeGrant: (id) =>
      answer(
        'revokeGrant',
        () => {
          held = held.filter((item) => item.id !== id);
        },
        true
      ),
    listHistory: () => {
      const pages = options.historyPages;
      if (!pages) return answer('listHistory', () => options.history ?? []);
      const page = pages.shift() ?? [];
      return page === 'fail' ? Promise.reject(refusal(404, 'not_found')) : answer('listHistory', () => page);
    }
  };
  if (options.held) {
    const held = options.held;
    client.listMyPermissions = () =>
      (options.heldGate?.current?.promise ?? Promise.resolve()).then(() => answer('listMyPermissions', () => held));
  }
  return client;
}

const meta = {
  component: AccessPanel,
  title: 'Components/AccessPanel',
  args: { application, client: fakeClient() },
  // Accessibility violations fail these stories (the repo default only reports them).
  parameters: { layout: 'padded', a11y: { test: 'error' } }
} satisfies Meta<typeof AccessPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoTokens: Story = {
  args: { client: fakeClient() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('No tokens yet')).toBeVisible();
    await expect(canvas.getByText("Tokens made here reach only Monitor's permissions, and only the ones you hold.")).toBeVisible();
    // Without the manage key there is no switch and no people section.
    await expect(canvas.queryByRole('region', { name: 'Token switch' })).toBeNull();
    await expect(canvas.queryByRole('region', { name: 'People' })).toBeNull();
    await expect(canvas.getByRole('region', { name: 'History' })).toBeVisible();
  }
};

export const Tokens: Story = {
  args: { client: fakeClient({ tokens: someTokens, history }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = await canvas.findByRole('table', { name: 'Your tokens' });
    await expect(within(table).getByRole('columnheader', { name: 'Created in' })).toBeVisible();
    await expect(within(table).getByRole('columnheader', { name: 'Last used in' })).toBeVisible();
    await expect(within(table).getByText('Pompeii')).toBeVisible();
    await expect(within(table).getByText('Never')).toBeVisible();
    await expect(within(table).getByText('All of yours')).toBeVisible();
  }
};

export const RevokeToken: Story = {
  args: { client: fakeClient({ tokens: someTokens }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Revoke Nightly export' }));
    const page = within(document.body);
    await waitFor(() => expect(page.getByText('Revoke Nightly export?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Revoke' }));
    await waitFor(() => expect(canvas.queryByText('Nightly export')).toBeNull());
  }
};

const copied = fn();

export const JustCreatedValue: Story = {
  args: { client: fakeClient(), onCopy: copied },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.type(await page.findByLabelText(/Name/), 'Cursor');
    await userEvent.click(page.getByRole('button', { name: 'Create token' }));
    const value = await page.findByTestId('access-token-value');
    await expect(value).toHaveTextContent(FAKE_VALUE);
    await waitFor(() => expect(page.getByText(/You won't see it again/)).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Copy' }));
    await expect(copied).toHaveBeenCalledWith(FAKE_VALUE);
    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    // Once the dialog closes the value is gone from the page and from state:
    // nothing on the page can bring it back.
    await waitFor(() => expect(document.body.textContent ?? '').not.toContain(FAKE_VALUE));
    await expect(canvas.getByText('Cursor')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'New token' }));
    await expect(await page.findByRole('button', { name: 'Create token' })).toBeDisabled();
    await expect(document.body.textContent ?? '').not.toContain(FAKE_VALUE);
  }
};

export const SwitchOff: Story = {
  args: { client: fakeClient({ enabled: false, manage: true, grants }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('region', { name: 'Token switch' });
    await expect(within(section).getByText('Personal access tokens are off')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'New token' })).toBeDisabled();
    await userEvent.click(within(section).getByRole('switch'));
    await expect(await within(section).findByText('Personal access tokens are on')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'New token' })).toBeEnabled();
  }
};

export const SwitchOn: Story = {
  args: { client: fakeClient({ enabled: true, manage: true, grants }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('region', { name: 'Token switch' });
    await expect(within(section).getByText('Personal access tokens are on')).toBeVisible();
  }
};

export const NoManageRight: Story = {
  args: { client: fakeClient({ tokens: someTokens, manage: false, history }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('table', { name: 'Your tokens' });
    await expect(canvas.queryByRole('region', { name: 'Token switch' })).toBeNull();
    await expect(canvas.queryByRole('region', { name: 'People' })).toBeNull();
    await expect(canvas.getByRole('table', { name: 'Access history' })).toBeVisible();
    await expect(canvas.getByText('monitor (MCP)')).toBeVisible();
  }
};

export const People: Story = {
  args: { client: fakeClient({ manage: true, grants }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('region', { name: 'People' });
    await expect(within(section).getByText('editor@example.com')).toBeVisible();
    const form = within(section).getByRole('form', { name: 'Grant a role' });
    await userEvent.type(within(form).getByPlaceholderText('User id'), '77');
    await userEvent.click(within(form).getByRole('combobox', { name: 'Role' }));
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Monitor reader' }));
    await userEvent.click(within(form).getByRole('button', { name: 'Grant' }));
    await expect(await within(section).findByText('new.person@example.com')).toBeVisible();
    await userEvent.click(within(section).getByRole('button', { name: 'Revoke Monitor reader from editor@example.com' }));
    const page = within(document.body);
    await waitFor(() => expect(page.getByText('Revoke Monitor reader from editor@example.com?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Revoke' }));
    await waitFor(() => expect(within(section).queryByText('editor@example.com')).toBeNull());
  }
};

export const BoundingRefusal: Story = {
  args: { client: fakeClient({ manage: true, grants, grantRefusal: refusal(403, 'forbidden') }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('region', { name: 'People' });
    const form = within(section).getByRole('form', { name: 'Grant a role' });
    await userEvent.type(within(form).getByPlaceholderText('User id'), '77');
    await userEvent.click(within(form).getByRole('combobox', { name: 'Role' }));
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Monitor admin' }));
    await userEvent.click(within(form).getByRole('button', { name: 'Grant' }));
    await expect(await within(section).findByRole('alert')).toHaveTextContent('You can only grant a role whose permissions you all hold yourself.');
  }
};

export const Unavailable: Story = {
  args: { client: fakeClient({ unavailable: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Access management is not available yet.')).toBeVisible();
    await expect(canvas.queryByRole('region', { name: 'Your tokens' })).toBeNull();
  }
};

const pickingClient = fakeClient({ held: ['monitor:events:read', 'monitor:events:write', 'monitor:access:manage'] });

export const PickPermissions: Story = {
  args: { client: pickingClient, onCopy: () => undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.type(await page.findByLabelText(/Name/), 'Read-only export');
    await userEvent.click(page.getByRole('radio', { name: /Only these/ }));
    // Only the keys the person holds are offered, and the search narrows them.
    await expect(await page.findByRole('checkbox', { name: 'monitor:events:write' })).toBeVisible();
    await expect(page.queryByRole('textbox', { name: /Permission keys/ })).toBeNull();
    await userEvent.type(page.getByRole('textbox', { name: 'Search permissions' }), 'read');
    await waitFor(() => expect(page.queryByRole('checkbox', { name: 'monitor:events:write' })).toBeNull());
    await expect(page.getByRole('button', { name: 'Create token' })).toBeDisabled();
    await userEvent.click(page.getByRole('checkbox', { name: 'monitor:events:read' }));
    await userEvent.click(page.getByRole('button', { name: 'Create token' }));
    await page.findByTestId('access-token-value');
    await expect(pickingClient.created.at(-1)).toEqual({ name: 'Read-only export', expires_in_days: 30, permissions: ['monitor:events:read'] });
  }
};

const typingClient = fakeClient();

export const TypePermissions: Story = {
  args: { client: typingClient, onCopy: () => undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.type(await page.findByLabelText(/Name/), 'Typed');
    await userEvent.click(page.getByRole('radio', { name: /Only these/ }));
    // Without listMyPermissions the keys are typed, one per line.
    await expect(page.queryByRole('textbox', { name: 'Search permissions' })).toBeNull();
    await userEvent.type(page.getByRole('textbox', { name: /Permission keys/ }), 'monitor:events:read{enter}monitor:events:write');
    await userEvent.click(page.getByRole('button', { name: 'Create token' }));
    await page.findByTestId('access-token-value');
    await expect(typingClient.created.at(-1)).toEqual({ name: 'Typed', expires_in_days: 30, permissions: ['monitor:events:read', 'monitor:events:write'] });
  }
};

export const RefusalsInPlainWords: Story = {
  args: { client: fakeClient({ tokens: someTokens, fail: { revokeMyToken: refusal(404, 'not_found'), createMyToken: refusal(400, 'invalid_request') } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    // Cancel keeps the token; a refused revoke says why, in plain words.
    await userEvent.click(await canvas.findByRole('button', { name: 'Revoke Nightly export' }));
    await waitFor(() => expect(page.getByText('Revoke Nightly export?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Revoke Nightly export' }));
    await waitFor(() => expect(page.getByText('Revoke Nightly export?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Revoke' }));
    await expect(await canvas.findByText('That item no longer exists.')).toBeVisible();
    await expect(canvas.getByText('Nightly export')).toBeVisible();
    // A refused create keeps the dialog open with the reason; Cancel closes it.
    await userEvent.click(canvas.getByRole('button', { name: 'New token' }));
    await userEvent.type(await page.findByLabelText(/Name/), 'Refused');
    await userEvent.click(page.getByRole('combobox', { name: 'Expires' }));
    await userEvent.click(await page.findByRole('option', { name: 'No expiry' }));
    await userEvent.click(page.getByRole('radio', { name: /Only these/ }));
    await userEvent.click(page.getByRole('radio', { name: /All of mine/ }));
    await userEvent.click(page.getByRole('button', { name: 'Create token' }));
    await expect(await page.findByText('That request was not accepted. Check the values and try again.')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(page.queryByRole('button', { name: 'Create token' })).toBeNull());
  }
};

export const ManagerRefusals: Story = {
  args: {
    client: fakeClient({
      manage: true,
      grants: [...grants, { id: 12, user_id: 51, user_email: '', role_id: 2, role_name: 'Monitor admin', team_id: 3, granted_at: 'not a time' }],
      fail: { setTokenSwitch: 'plain', grant: refusal(400, 'invalid_request'), revokeGrant: refusal(403, 'forbidden') }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    const switchSection = await canvas.findByRole('region', { name: 'Token switch' });
    await userEvent.click(within(switchSection).getByRole('switch'));
    await expect(await within(switchSection).findByText('Something went wrong. Try again.')).toBeVisible();
    const people = canvas.getByRole('region', { name: 'People' });
    // A grant without an email shows the user id; an unreadable time shows as given.
    await expect(within(people).getByText('user 51')).toBeVisible();
    await expect(within(people).getByText('not a time')).toBeVisible();
    const form = within(people).getByRole('form', { name: 'Grant a role' });
    await userEvent.type(within(form).getByPlaceholderText('User id'), '77');
    await userEvent.click(within(form).getByRole('combobox', { name: 'Role' }));
    await userEvent.click(await page.findByRole('option', { name: 'Monitor reader' }));
    await userEvent.click(within(form).getByRole('button', { name: 'Grant' }));
    await expect(await within(people).findByText('That request was not accepted. Check the values and try again.')).toBeVisible();
    await userEvent.click(within(people).getByRole('button', { name: 'Revoke Monitor admin from user 51' }));
    await waitFor(() => expect(page.getByText('Revoke Monitor admin from user 51?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(within(people).getByRole('button', { name: 'Revoke Monitor admin from user 51' }));
    await waitFor(() => expect(page.getByText('Revoke Monitor admin from user 51?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Revoke' }));
    await expect(await within(people).findByText('You can only revoke a role whose permissions you all hold yourself.')).toBeVisible();
  }
};

export const NobodyHoldsARole: Story = {
  args: { client: fakeClient({ manage: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Nobody holds a role yet')).toBeVisible();
  }
};

const fullPage = Array.from({ length: 50 }, (_, index): AccessHistoryEntry => ({
  at: `2026-11-${String(19 - (index % 18)).padStart(2, '0')}T08:00:00Z`,
  action: 'role.assignment.create',
  actor_email: index === 0 ? '' : 'owner@example.com',
  target: `role-assignment:${index}`,
  via_application: index === 0 ? '' : 'monitor',
  via_client: index === 0 ? '' : 'console'
}));

export const HistoryPaging: Story = {
  args: { client: fakeClient({ historyPages: [fullPage, 'fail', [history[1]]] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = await canvas.findByRole('region', { name: 'History' });
    await expect(within(section).getAllByRole('row')).toHaveLength(51);
    // The first older page fails and says so; the retry loads it and ends paging.
    await userEvent.click(within(section).getByRole('button', { name: 'Show older' }));
    await expect(await within(section).findByText('That item no longer exists.')).toBeVisible();
    await userEvent.click(within(section).getByRole('button', { name: 'Show older' }));
    await waitFor(() => expect(within(section).getAllByRole('row')).toHaveLength(52));
    await expect(within(section).queryByRole('button', { name: 'Show older' })).toBeNull();
  }
};

export const BecomesUnavailableOnAChange: Story = {
  args: { client: fakeClient({ tokens: someTokens, fail: { revokeMyToken: refusal(503, 'access_unavailable') } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Revoke Nightly export' }));
    await waitFor(() => expect(page.getByText('Revoke Nightly export?')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: 'Revoke' }));
    await expect(await canvas.findByText('Access management is not available yet.')).toBeVisible();
  }
};

export const ManageCheckUnavailable: Story = {
  args: { client: fakeClient({ fail: { listRoles: refusal(503, 'access_unavailable') } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Access management is not available yet.')).toBeVisible();
    // Retry runs the whole load again.
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(await canvas.findByText('Access management is not available yet.')).toBeVisible();
  }
};

export const FirstLoadFailsWithoutACode: Story = {
  args: { client: fakeClient({ fail: { listMyTokens: 'plain' } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Access management is not available yet.')).toBeVisible();
  }
};

// Held by the client; each play sets the gate its next calls wait on. React's
// development double effects may call twice per open; both wait on one gate.
const edgeGate: { current?: Gate } = {};

export const PickerEdges: Story = {
  args: { client: fakeClient({ held: ['monitor:events:read', 'monitor:events:write'], heldGate: edgeGate }), onCopy: () => undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    const [first, second] = [gate(), gate()];
    edgeGate.current = first;
    // Closing before the list arrives drops the late answer.
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.click(await page.findByRole('button', { name: 'Cancel' }));
    first.release();
    await settle();
    edgeGate.current = second;
    await userEvent.click(canvas.getByRole('button', { name: 'New token' }));
    await userEvent.click(await page.findByRole('radio', { name: /Only these/ }));
    await waitFor(() => expect(page.getByText('Loading your permissions…')).toBeVisible());
    second.release();
    const read = await page.findByRole('checkbox', { name: 'monitor:events:read' });
    await userEvent.click(read);
    await userEvent.click(read);
    await expect(read).not.toBeChecked();
    await userEvent.type(page.getByRole('textbox', { name: 'Search permissions' }), 'nothing-like-this');
    await waitFor(() => expect(page.getByText('No permission matches.')).toBeVisible());
  }
};

export const PickerWithNothingHeld: Story = {
  args: { client: fakeClient({ held: [] }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.click(await page.findByRole('radio', { name: /Only these/ }));
    await waitFor(() => expect(page.getByText('You hold no permissions in Monitor.')).toBeVisible());
  }
};

export const PickerListFails: Story = {
  args: { client: fakeClient({ held: ['monitor:events:read'], fail: { listMyPermissions: refusal(401, 'unauthenticated') } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.click(await page.findByRole('radio', { name: /Only these/ }));
    await waitFor(() => expect(page.getByText('Your session has ended. Sign in again to manage access.')).toBeVisible());
  }
};

export const CopiesToTheClipboardAndClosesWithEscape: Story = {
  args: { client: fakeClient() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    const write = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.type(await page.findByLabelText(/Name/), 'Clipboard');
    await userEvent.click(page.getByRole('button', { name: 'Create token' }));
    await page.findByTestId('access-token-value');
    await userEvent.click(page.getByRole('button', { name: 'Copy' }));
    await expect(write).toHaveBeenCalledWith(FAKE_VALUE);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.body.textContent ?? '').not.toContain(FAKE_VALUE));
    write.mockRestore();
  }
};

const lateGate: { current?: Gate } = {};

export const LateFailureAfterClosing: Story = {
  args: { client: fakeClient({ held: ['monitor:events:read'], heldGate: lateGate, fail: { listMyPermissions: refusal(401, 'unauthenticated') } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    const late = gate();
    lateGate.current = late;
    // The list fails after the dialog closed: nothing is shown for it.
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await userEvent.click(await page.findByRole('button', { name: 'Cancel' }));
    late.release();
    await settle();
    await settle();
    await expect(document.body.textContent ?? '').not.toContain('Your session has ended');
  }
};

export const PickerUnavailable: Story = {
  args: { client: fakeClient({ held: ['monitor:events:read'], fail: { listMyPermissions: refusal(503, 'access_unavailable') } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'New token' }));
    await expect(await canvas.findByText('Access management is not available yet.')).toBeVisible();
  }
};

export const PlainWordsForEveryRefusal: Story = {
  args: { client: fakeClient() },
  play: async () => {
    // Every refusal reads in plain words; none repeats Pompeii's own message.
    await expect(accessErrorMessage(refusal(401, 'unauthenticated'))).toBe('Your session has ended. Sign in again to manage access.');
    await expect(accessErrorMessage(refusal(403, 'forbidden'))).toBe('You can only change access with permissions you hold yourself.');
    await expect(accessErrorMessage(refusal(400, 'invalid_request'))).toBe('That request was not accepted. Check the values and try again.');
    await expect(accessErrorMessage(refusal(409, 'tokens_off'))).toBe('Personal access tokens are turned off here.');
    await expect(accessErrorMessage(refusal(404, 'not_found'))).toBe('That item no longer exists.');
    await expect(accessErrorMessage(refusal(503, 'access_unavailable'))).toBe('Access management is not available yet.');
    await expect(accessErrorMessage(new Error('anything'))).toBe('Something went wrong. Try again.');
    await expect(accessErrorMessage(null)).toBe('Something went wrong. Try again.');
  }
};
