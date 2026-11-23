import { act } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { WebrtcGuestSource } from '../../src/components/webrtc-guest-source';
import { eventually, render } from './helpers';

// The room is faked: no network, only the events the component listens to.
const rooms = vi.hoisted(() => [] as Array<{
  handlers: Record<string, (...args: unknown[]) => void>;
  remoteParticipants: Map<string, unknown>;
  connect: ReturnType<typeof import('vitest').vi.fn>;
  disconnect: ReturnType<typeof import('vitest').vi.fn>;
}>);

vi.mock('livekit-client', () => {
  class Room {
    handlers: Record<string, (...args: unknown[]) => void> = {};
    remoteParticipants = new Map<string, unknown>();
    connect = vi.fn(async () => {});
    disconnect = vi.fn();
    constructor() {
      rooms.push(this);
    }
    on(event: string, handler: (...args: unknown[]) => void) {
      this.handlers[event] = handler;
      return this;
    }
  }
  return {
    Room,
    ConnectionState: { Connected: 'connected', Disconnected: 'disconnected' },
    RoomEvent: {
      ConnectionStateChanged: 'connectionStateChanged',
      TrackSubscribed: 'trackSubscribed',
      TrackUnsubscribed: 'trackUnsubscribed',
      ParticipantConnected: 'participantConnected',
      ParticipantDisconnected: 'participantDisconnected',
    },
    Track: { Kind: { Video: 'video', Audio: 'audio' } },
  };
});

afterEach(() => {
  rooms.length = 0;
  vi.restoreAllMocks();
});

const credentials = () => Promise.resolve({ serverUrl: 'wss://rtc.example.test', token: 'token-1' });
const statusText = (container: HTMLElement) => container.querySelector('p')?.textContent ?? null;

it('joins the room with the credentials it is given', async () => {
  const getCredentials = vi.fn(credentials);
  await render(<WebrtcGuestSource getCredentials={getCredentials} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalledWith('wss://rtc.example.test', 'token-1', { autoSubscribe: true }));
  expect(getCredentials).toHaveBeenCalledTimes(1);
});

it('shows the connecting card until the room connects', async () => {
  const { container } = await render(<WebrtcGuestSource getCredentials={() => new Promise(() => {})} />);
  expect(statusText(container)).toBe('Connecting guest source');
});

it('reports a failed credential request as disconnected', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = await render(
    <WebrtcGuestSource getCredentials={() => Promise.reject(new Error('Guest source authorization failed (401).'))} />,
  );
  await eventually(() => expect(errors).toHaveBeenCalledWith('WebRTC guest slot failed:', expect.any(Error)));
  expect(statusText(container)).toBe('Connecting guest source');
});

it('shows the slot offline when connected with no guest in it', async () => {
  const { container } = await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={3} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  await act(async () => rooms[0].handlers.connectionStateChanged('connected'));
  expect(statusText(container)).toBe('Guest slot 3 offline');
});

it('attaches the video of the guest in its slot and hides the status card', async () => {
  const { container } = await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={2} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  const video = { kind: 'video', detach: vi.fn(), attach: vi.fn() };
  const guest = {
    identity: 'guest-a',
    metadata: JSON.stringify({ slotNumber: 2 }),
    trackPublications: new Map([['v', { track: video }]]),
  };
  rooms[0].remoteParticipants.set('guest-a', guest);
  await act(async () => {
    rooms[0].handlers.connectionStateChanged('connected');
    rooms[0].handlers.participantConnected();
  });
  await eventually(() => expect(video.attach).toHaveBeenCalledWith(container.querySelector('video')));
  expect(statusText(container)).toBeNull();
});

it('ignores participants that are not guests of this slot', async () => {
  const video = { kind: 'video', detach: vi.fn(), attach: vi.fn() };
  const { container } = await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={1} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  rooms[0].remoteParticipants.set('host-1', {
    identity: 'host-1',
    metadata: JSON.stringify({ slotNumber: 1 }),
    trackPublications: new Map([['v', { track: video }]]),
  });
  rooms[0].remoteParticipants.set('guest-bad', { identity: 'guest-bad', metadata: 'not json', trackPublications: new Map() });
  await act(async () => {
    rooms[0].handlers.connectionStateChanged('connected');
    rooms[0].handlers.participantConnected();
  });
  expect(video.attach).not.toHaveBeenCalled();
  expect(statusText(container)).toBe('Guest slot 1 offline');
});

it('leaves the room when unmounted', async () => {
  const { unmount } = await render(<WebrtcGuestSource getCredentials={credentials} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  await unmount();
  expect(rooms[0].disconnect).toHaveBeenCalled();
});
