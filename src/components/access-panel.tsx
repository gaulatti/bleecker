'use client';

import { Copy, KeyRound, Trash2 } from 'lucide-react';
import React from 'react';

import { AlertDialog } from './alert-dialog';
import { Button } from './button';
import { Card } from './card';
import { Checkbox } from './checkbox';
import { Empty } from './empty';
import { ErrorState } from './error-state';
import { Field } from './field';
import { Input } from './input';
import { Modal } from './modal';
import { RadioGroup } from './radio-group';
import { Select } from './select';
import { Switch } from './switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Textarea } from './textarea';
import { cn } from '../utils/cn';

/**
 * The access-management contract every service screen implements
 * (gaulatti/pompeii#50, pinned for ariston#230, monitor#193 and alcantara#224).
 * The service backend forwards each call to Pompeii; this panel only renders.
 */
export type AccessToken = {
  id: string;
  name: string;
  display_prefix: string;
  permissions: string[];
  created_at: string;
  expires_at: string;
  last_used_at: string;
  created_via_application: string;
  last_used_application: string;
};
export type AccessRole = { id: number; name: string; permissions: string[] };
export type AccessGrant = { id: number; user_id: number; user_email: string; role_id: number; role_name: string; team_id: number; granted_at: string };
export type AccessHistoryEntry = { at: string; action: string; actor_email: string; target: string; via_application: string; via_client: string };
export type AccessErrorCode = 'unauthenticated' | 'forbidden' | 'invalid_request' | 'tokens_off' | 'not_found' | 'access_unavailable';
export type AccessError = { status: number; error: AccessErrorCode };
export interface AccessCreateTokenInput {
  name: string;
  expires_in_days?: number;
  no_expiry?: boolean;
  permissions?: string[];
  all_held_in_application?: boolean;
}
export interface AccessClient {
  listMyTokens(): Promise<AccessToken[]>;
  createMyToken(input: AccessCreateTokenInput): Promise<{ token: AccessToken; value: string }>;
  revokeMyToken(id: string): Promise<void>;
  getTokenSwitch(): Promise<boolean>;
  setTokenSwitch(enabled: boolean): Promise<boolean>;
  listRoles(): Promise<AccessRole[]>;
  listGrants(): Promise<AccessGrant[]>;
  grant(input: { user_id: number; role_id: number }): Promise<AccessGrant>;
  revokeGrant(id: number): Promise<void>;
  listHistory(input?: { limit?: number; before?: string }): Promise<AccessHistoryEntry[]>;
  /**
   * Optional: the caller's own permission keys in this application (their
   * effective permissions there). When present, "Only these" is a picker of
   * exactly these keys; when absent, keys are typed.
   */
  listMyPermissions?(): Promise<string[]>;
}

export interface AccessPanelProps {
  application: { key: string; name: string };
  className?: string;
  client: AccessClient;
  /** Copies the new token value; defaults to the browser clipboard. */
  onCopy?: (value: string) => void;
}

const HISTORY_PAGE = 50;

const EXPIRY_OPTIONS = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
  { label: 'No expiry', value: 'none' }
];

function errorCode(cause: unknown): AccessErrorCode | 'unknown' {
  const code = (cause as Partial<AccessError> | null)?.error;
  return typeof code === 'string' ? code : 'unknown';
}

/** Plain words for a refused change; never Pompeii's own message. */
export function accessErrorMessage(cause: unknown): string {
  switch (errorCode(cause)) {
    case 'unauthenticated':
      return 'Your session has ended. Sign in again to manage access.';
    case 'forbidden':
      return 'You can only change access with permissions you hold yourself.';
    case 'invalid_request':
      return 'That request was not accepted. Check the values and try again.';
    case 'tokens_off':
      return 'Personal access tokens are turned off here.';
    case 'not_found':
      return 'That item no longer exists.';
    case 'access_unavailable':
      return 'Access management is not available yet.';
    default:
      return 'Something went wrong. Try again.';
  }
}

function personLabel(grant: AccessGrant): string {
  return grant.user_email || `user ${grant.user_id}`;
}

function formatTime(value: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function Section({ title, description, children, actions }: { title: string; description: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
  const headingId = React.useId();
  return (
    <Card aria-labelledby={headingId} padding='lg' role='region'>
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h2 id={headingId} className='text-base font-semibold text-text-primary'>
            {title}
          </h2>
          <p className='mt-1 text-sm text-text-secondary'>{description}</p>
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}

function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className='mt-3 text-sm text-terracotta' role='alert'>
      {message}
    </p>
  );
}

type LoadState = 'loading' | 'ready' | 'unavailable';

type OnFailure = (cause: unknown, show: (message: string) => void, forbidden?: string) => void;

export function AccessPanel({ application, className, client, onCopy }: AccessPanelProps) {
  const [state, setState] = React.useState<LoadState>('loading');
  const [tokens, setTokens] = React.useState<AccessToken[]>([]);
  const [tokenSwitch, setTokenSwitchState] = React.useState(false);
  const [canManage, setCanManage] = React.useState(false);
  const [roles, setRoles] = React.useState<AccessRole[]>([]);
  const [grants, setGrants] = React.useState<AccessGrant[]>([]);
  const [history, setHistory] = React.useState<AccessHistoryEntry[]>([]);
  const [historyDone, setHistoryDone] = React.useState(false);

  const unavailable = (cause: unknown) => {
    if (errorCode(cause) === 'access_unavailable') {
      setState('unavailable');
      return true;
    }
    return false;
  };
  // A refused change: the whole panel goes "not available" when Pompeii is
  // unreachable; otherwise the section shows the reason in plain words.
  const fail: OnFailure = (cause, show, forbidden) => {
    if (unavailable(cause)) return;
    show(forbidden && errorCode(cause) === 'forbidden' ? forbidden : accessErrorMessage(cause));
  };

  const load = React.useCallback(async () => {
    setState('loading');
    try {
      const [mine, enabled, recent] = await Promise.all([client.listMyTokens(), client.getTokenSwitch(), client.listHistory({ limit: HISTORY_PAGE })]);
      setTokens(mine);
      setTokenSwitchState(enabled);
      setHistory(recent);
      setHistoryDone(recent.length < HISTORY_PAGE);
      // Holding <app>:access:manage is learned from Pompeii: roles answer 403 otherwise.
      try {
        const [allRoles, allGrants] = await Promise.all([client.listRoles(), client.listGrants()]);
        setRoles(allRoles);
        setGrants(allGrants);
        setCanManage(true);
      } catch (cause) {
        if (unavailable(cause)) return;
        setCanManage(false);
      }
      setState('ready');
    } catch (cause) {
      if (!unavailable(cause)) setState('unavailable');
    }
  }, [client]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (state === 'unavailable') {
    return (
      <ErrorState
        className={className}
        title='Access management is not available yet.'
        description={`${application.name} cannot reach Pompeii's access service right now.`}
        onRetry={() => void load()}
        retryLabel='Try again'
      />
    );
  }

  if (state === 'loading') {
    return (
      <p aria-live='polite' className={cn('text-sm text-text-secondary', className)}>
        Loading access…
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <MyTokens application={application} client={client} onCopy={onCopy} onFailure={fail} setTokens={setTokens} tokenSwitch={tokenSwitch} tokens={tokens} />
      {canManage ? (
        <>
          <TokenSwitchSection application={application} client={client} enabled={tokenSwitch} onChange={setTokenSwitchState} onFailure={fail} />
          <PeopleSection application={application} client={client} grants={grants} onFailure={fail} roles={roles} setGrants={setGrants} />
        </>
      ) : null}
      <HistorySection
        client={client}
        done={historyDone}
        entries={history}
        onMore={(more) => {
          setHistory((current) => [...current, ...more]);
          setHistoryDone(more.length < HISTORY_PAGE);
        }}
        onFailure={fail}
      />
    </div>
  );
}

interface MyTokensProps {
  application: AccessPanelProps['application'];
  client: AccessClient;
  onCopy?: (value: string) => void;
  onFailure: OnFailure;
  setTokens: React.Dispatch<React.SetStateAction<AccessToken[]>>;
  tokenSwitch: boolean;
  tokens: AccessToken[];
}

function MyTokens({ application, client, onCopy, onFailure, setTokens, tokenSwitch, tokens }: MyTokensProps) {
  const [creating, setCreating] = React.useState(false);
  const [revoking, setRevoking] = React.useState<AccessToken | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  // The new value lives only while its dialog is open (gaulatti/bleecker#546).
  const [created, setCreated] = React.useState<{ name: string; value: string } | null>(null);

  // The confirm dialog is open only while a token is chosen.
  const revoke = async (target: AccessToken) => {
    setBusy(true);
    setError(null);
    try {
      await client.revokeMyToken(target.id);
      setTokens((current) => current.filter((token) => token.id !== target.id));
      setRevoking(null);
    } catch (cause) {
      onFailure(cause, setError);
      setRevoking(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      title='Your tokens'
      description={`Tokens made here reach only ${application.name}'s permissions, and only the ones you hold.`}
      actions={
        <Button disabled={!tokenSwitch} onClick={() => setCreating(true)} size='sm'>
          <KeyRound size={15} />
          New token
        </Button>
      }
    >
      {!tokenSwitch ? <p className='mb-3 text-sm text-text-secondary'>Personal access tokens are turned off here, so new tokens can't be created.</p> : null}
      {tokens.length === 0 ? (
        <Empty title='No tokens yet' description='Create a token to let a tool act as you here.' />
      ) : (
        <Table aria-label='Your tokens'>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Created in</TableHead>
              <TableHead>Last used in</TableHead>
              <TableHead>
                <span className='sr-only'>Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell>
                  <div className='font-medium text-text-primary'>{token.name}</div>
                  <div className='font-mono text-xs text-text-secondary'>{token.display_prefix}…</div>
                </TableCell>
                <TableCell className='text-xs'>{token.permissions.length === 0 ? 'All of yours' : token.permissions.join(', ')}</TableCell>
                <TableCell>{formatTime(token.created_at)}</TableCell>
                <TableCell>{token.expires_at ? formatTime(token.expires_at) : 'Never'}</TableCell>
                <TableCell>{formatTime(token.last_used_at)}</TableCell>
                <TableCell>{token.created_via_application || 'Pompeii'}</TableCell>
                <TableCell>{token.last_used_application || '—'}</TableCell>
                <TableCell className='text-right'>
                  <Button aria-label={`Revoke ${token.name}`} onClick={() => setRevoking(token)} size='xs' variant='ghost'>
                    <Trash2 size={14} />
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <InlineError message={error} />
      <CreateTokenDialog
        application={application}
        client={client}
        isOpen={creating}
        onClose={() => setCreating(false)}
        onCreated={(token, value) => {
          setTokens((current) => [token, ...current]);
          setCreating(false);
          setCreated({ name: token.name, value });
        }}
        onFailure={onFailure}
      />
      <Modal isOpen={created !== null} onClose={() => setCreated(null)} title='Copy your new token'>
        {created ? (
          <div className='flex flex-col gap-4'>
            <p className='text-sm text-text-secondary'>
              This is the only time you'll see <strong>{created.name}</strong>'s value. You won't see it again.
            </p>
            <code className='block break-all rounded-md border border-black/[0.08] bg-light-sand/50 p-3 font-mono text-sm text-text-primary dark:border-white/10 dark:bg-deep-sea/50' data-testid='access-token-value'>
              {created.value}
            </code>
            <div className='flex justify-end gap-2'>
              <Button
                onClick={() => {
                  // A click only happens in a browser, where navigator exists.
                  if (onCopy) onCopy(created.value);
                  else void navigator.clipboard?.writeText(created.value);
                }}
                variant='secondary'
              >
                <Copy size={15} />
                Copy
              </Button>
              <Button onClick={() => setCreated(null)}>Done</Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <AlertDialog
        confirmLabel='Revoke'
        confirmLoading={busy}
        description={`Tools using ${revoking?.name ?? 'it'} stop working on their next call.`}
        isOpen={revoking !== null}
        onCancel={() => setRevoking(null)}
        onConfirm={() => void revoke(revoking as AccessToken)}
        title={`Revoke ${revoking?.name ?? 'token'}?`}
        variant='destructive'
      />
    </Section>
  );
}

interface CreateTokenDialogProps {
  application: AccessPanelProps['application'];
  client: AccessClient;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (token: AccessToken, value: string) => void;
  onFailure: OnFailure;
}

function CreateTokenDialog({ application, client, isOpen, onClose, onCreated, onFailure }: CreateTokenDialogProps) {
  const [name, setName] = React.useState('');
  const [expiry, setExpiry] = React.useState('30');
  const [scope, setScope] = React.useState<'all' | 'some'>('all');
  const [keys, setKeys] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const picks = typeof client.listMyPermissions === 'function';
  // null while loading; the picker offers only these keys.
  const [held, setHeld] = React.useState<string[] | null>(null);
  const [heldError, setHeldError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [picked, setPicked] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!isOpen) {
      setName('');
      setExpiry('30');
      setScope('all');
      setKeys('');
      setError(null);
      setHeld(null);
      setHeldError(null);
      setSearch('');
      setPicked([]);
      return;
    }
    if (!client.listMyPermissions) return;
    let current = true;
    client.listMyPermissions().then(
      (value) => {
        if (current) setHeld([...new Set(value)].sort());
      },
      (cause) => {
        if (!current) return;
        setHeld([]);
        onFailure(cause, setHeldError);
      }
    );
    return () => {
      current = false;
    };
  }, [isOpen, client]);

  const listed = picks
    ? picked
    : keys
        .split(/[\s,]+/)
        .map((key) => key.trim())
        .filter(Boolean);
  const valid = name.trim() !== '' && (scope === 'all' || listed.length > 0);
  const shown = (held ?? []).filter((key) => key.toLowerCase().includes(search.trim().toLowerCase()));

  // The submit button is disabled while invalid, which also blocks implicit
  // (Enter) submission.
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const input: AccessCreateTokenInput = { name: name.trim() };
    if (expiry === 'none') input.no_expiry = true;
    else input.expires_in_days = Number(expiry);
    if (scope === 'all') input.all_held_in_application = true;
    else input.permissions = listed;
    try {
      const { token, value } = await client.createMyToken(input);
      onCreated(token, value);
    } catch (cause) {
      onFailure(cause, setError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='New token'>
      <form className='flex flex-col gap-4' onSubmit={(event) => void submit(event)}>
        <Field label='Name' required>
          <Input autoFocus maxLength={100} onChange={(event) => setName(event.target.value)} placeholder='For example, Claude on my laptop' value={name} />
        </Field>
        <Field label='Expires'>
          <Select aria-label='Expires' onChange={setExpiry} options={EXPIRY_OPTIONS} value={expiry} />
        </Field>
        <Field label='Permissions'>
          <RadioGroup
            name='access-token-scope'
            onChange={(value) => setScope(value as 'all' | 'some')}
            options={[
              { label: `All of mine in ${application.name}`, value: 'all', description: 'Follows what you hold here, now and later.' },
              {
                label: 'Only these',
                value: 'some',
                description: picks ? `Pick from the permissions you hold in ${application.name}.` : `Permission keys of ${application.name} you hold, one per line.`
              }
            ]}
            value={scope}
          />
        </Field>
        {scope === 'some' && !picks ? (
          <Field label='Permission keys' required>
            <Textarea onChange={(event) => setKeys(event.target.value)} placeholder={`${application.key}:read`} rows={3} value={keys} />
          </Field>
        ) : null}
        {scope === 'some' && picks ? (
          <fieldset className='flex flex-col gap-3'>
            <legend className='mb-2 text-[13px] font-medium text-text-primary'>Permissions you hold here</legend>
            <Input aria-label='Search permissions' onChange={(event) => setSearch(event.target.value)} placeholder='Search' value={search} />
            {held === null ? (
              <p aria-live='polite' className='text-sm text-text-secondary'>
                Loading your permissions…
              </p>
            ) : heldError ? (
              <InlineError message={heldError} />
            ) : held.length === 0 ? (
              <p className='text-sm text-text-secondary'>You hold no permissions in {application.name}.</p>
            ) : (
              <div className='flex max-h-56 flex-col gap-2 overflow-y-auto'>
                {shown.length === 0 ? <p className='text-sm text-text-secondary'>No permission matches.</p> : null}
                {shown.map((key) => (
                  <Checkbox
                    checked={picked.includes(key)}
                    key={key}
                    label={<span className='font-mono text-xs'>{key}</span>}
                    onChange={(event) => {
                      const on = event.target.checked;
                      setPicked((current) => (on ? [...current, key] : current.filter((item) => item !== key)));
                    }}
                  />
                ))}
              </div>
            )}
          </fieldset>
        ) : null}
        <InlineError message={error} />
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose} type='button' variant='ghost'>
            Cancel
          </Button>
          <Button disabled={!valid || busy} loading={busy} type='submit'>
            Create token
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface TokenSwitchSectionProps {
  application: AccessPanelProps['application'];
  client: AccessClient;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  onFailure: OnFailure;
}

function TokenSwitchSection({ application, client, enabled, onChange, onFailure }: TokenSwitchSectionProps) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const change = async (next: boolean) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await client.setTokenSwitch(next));
    } catch (cause) {
      onFailure(cause, setError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title='Token switch' description={`Whether ${application.name} accepts personal access tokens at all. Off refuses every token on its next call.`}>
      <Switch checked={enabled} disabled={busy} label={enabled ? 'Personal access tokens are on' : 'Personal access tokens are off'} onCheckedChange={(next) => void change(next)} />
      <InlineError message={error} />
    </Section>
  );
}

interface PeopleSectionProps {
  application: AccessPanelProps['application'];
  client: AccessClient;
  grants: AccessGrant[];
  onFailure: OnFailure;
  roles: AccessRole[];
  setGrants: React.Dispatch<React.SetStateAction<AccessGrant[]>>;
}

function PeopleSection({ application, client, grants, onFailure, roles, setGrants }: PeopleSectionProps) {
  const [userId, setUserId] = React.useState('');
  const [roleId, setRoleId] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [revoking, setRevoking] = React.useState<AccessGrant | null>(null);

  const people = Array.from(new Map(grants.map((grant) => [grant.user_id, grant.user_email])).entries());
  const parsedUser = Number(userId);
  const valid = Number.isInteger(parsedUser) && parsedUser > 0 && roleId !== '';

  const grant = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const record = await client.grant({ user_id: parsedUser, role_id: Number(roleId) });
      setGrants((current) => [...current, record]);
      setUserId('');
      setRoleId('');
    } catch (cause) {
      onFailure(cause, setError, 'You can only grant a role whose permissions you all hold yourself.');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (target: AccessGrant) => {
    setBusy(true);
    setError(null);
    try {
      await client.revokeGrant(target.id);
      setGrants((current) => current.filter((item) => item.id !== target.id));
    } catch (cause) {
      onFailure(cause, setError, 'You can only revoke a role whose permissions you all hold yourself.');
    } finally {
      setRevoking(null);
      setBusy(false);
    }
  };

  return (
    <Section title='People' description={`Who holds ${application.name}'s roles. You can grant or revoke only a role whose permissions you all hold.`}>
      {grants.length === 0 ? (
        <Empty title='Nobody holds a role yet' />
      ) : (
        <Table aria-label='Role holders'>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Granted</TableHead>
              <TableHead>
                <span className='sr-only'>Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{personLabel(item)}</TableCell>
                <TableCell>{item.role_name}</TableCell>
                <TableCell>{formatTime(item.granted_at)}</TableCell>
                <TableCell className='text-right'>
                  <Button aria-label={`Revoke ${item.role_name} from ${personLabel(item)}`} onClick={() => setRevoking(item)} size='xs' variant='ghost'>
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <form aria-label='Grant a role' className='mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end' onSubmit={(event) => void grant(event)}>
        <Field description='Their Pompeii user id. They must have signed in once.' label='Person'>
          <Input inputMode='numeric' list='access-panel-people' onChange={(event) => setUserId(event.target.value.trim())} placeholder='User id' value={userId} />
        </Field>
        <datalist id='access-panel-people'>
          {people.map(([id, email]) => (
            <option key={id} label={email} value={String(id)} />
          ))}
        </datalist>
        <Field label='Role'>
          <Select aria-label='Role' onChange={setRoleId} options={roles.map((role) => ({ label: role.name, value: String(role.id) }))} placeholder='Choose a role' value={roleId} />
        </Field>
        <Button disabled={!valid || busy} loading={busy} type='submit'>
          Grant
        </Button>
      </form>
      <InlineError message={error} />
      <AlertDialog
        confirmLabel='Revoke'
        confirmLoading={busy}
        description='They lose what this role allows on their next request.'
        isOpen={revoking !== null}
        onCancel={() => setRevoking(null)}
        onConfirm={() => void revoke(revoking as AccessGrant)}
        title={revoking ? `Revoke ${revoking.role_name} from ${personLabel(revoking)}?` : 'Revoke role?'}
        variant='destructive'
      />
    </Section>
  );
}

interface HistorySectionProps {
  client: AccessClient;
  done: boolean;
  entries: AccessHistoryEntry[];
  onMore: (entries: AccessHistoryEntry[]) => void;
  onFailure: OnFailure;
}

function HistorySection({ client, done, entries, onMore, onFailure }: HistorySectionProps) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Offered only while the last page was full, so there is a last entry.
  const more = async () => {
    setBusy(true);
    setError(null);
    try {
      onMore(await client.listHistory({ limit: HISTORY_PAGE, before: entries[entries.length - 1].at }));
    } catch (cause) {
      onFailure(cause, setError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title='History' description='Access changes made through this service, from its screen or from an MCP client.'>
      {entries.length === 0 ? (
        <Empty title='No access changes yet' />
      ) : (
        <Table aria-label='Access history'>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>What</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>On</TableHead>
              <TableHead>Through</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow key={`${entry.at}-${index}`}>
                <TableCell>{formatTime(entry.at)}</TableCell>
                <TableCell>{entry.action}</TableCell>
                <TableCell>{entry.actor_email || '—'}</TableCell>
                <TableCell className='text-xs'>{entry.target}</TableCell>
                <TableCell>
                  {entry.via_application || '—'}
                  {entry.via_client ? ` (${entry.via_client === 'mcp' ? 'MCP' : 'screen'})` : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!done ? (
        <Button className='mt-4' disabled={busy} loading={busy} onClick={() => void more()} size='sm' variant='secondary'>
          Show older
        </Button>
      ) : null}
      <InlineError message={error} />
    </Section>
  );
}
