import { act } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { WebrtcGuestSource } from '../../src/components/webrtc-guest-source';
import { eventually, render } from './helpers';

// The room is faked: no network, only the events the component listens to.
const hooks = vi.hoisted(() => ({ connect: null as null | (() => Promise<void>) }));
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
    connect = vi.fn(() => (hooks.connect ? hooks.connect() : Promise.resolve()));
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

const guest = (identity: string, metadata: string, tracks: Array<{ kind: string; attach: ReturnType<typeof vi.fn>; detach: ReturnType<typeof vi.fn> }>) => ({
  identity,
  metadata,
  trackPublications: new Map(tracks.map((track, index) => [String(index), { track }])),
});

it('reads an unreadable gain as full, mutes at zero, and holds the audio at zero when suppressed', async () => {
  const { container, rerender } = await render(<WebrtcGuestSource getCredentials={credentials} channelGain='loud' />);
  const audio = container.querySelector('audio')!;
  expect(audio.volume).toBe(1);
  expect(audio.muted).toBe(false);
  await rerender(<WebrtcGuestSource getCredentials={credentials} channelGain={0} />);
  expect(audio.muted).toBe(true);
  await rerender(<WebrtcGuestSource getCredentials={credentials} channelGain={1} suppressAudio />);
  expect(audio.volume).toBe(0);
  expect(audio.muted).toBe(true);
});

it('fits the video to contain only when asked, and covers the frame otherwise', async () => {
  const { container, rerender } = await render(<WebrtcGuestSource getCredentials={credentials} objectFit='contain' />);
  expect((container.querySelector('video') as HTMLVideoElement).style.objectFit).toBe('contain');
  await rerender(<WebrtcGuestSource getCredentials={credentials} objectFit='fill' />);
  expect((container.querySelector('video') as HTMLVideoElement).style.objectFit).toBe('cover');
});

it('ignores non-guest and metadata-less participants, and attaches audio to the audio element', async () => {
  const { container } = await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={1} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  const audioTrack = { kind: 'audio', attach: vi.fn(), detach: vi.fn() };
  const host = guest('host-1', JSON.stringify({ slotNumber: 1 }), [audioTrack]);
  rooms[0].handlers.trackSubscribed(audioTrack, {}, host);
  expect(audioTrack.attach).not.toHaveBeenCalled();

  const noMetadata = guest('guest-1', '', [audioTrack]);
  rooms[0].remoteParticipants.set('guest-1', noMetadata);
  await act(async () => rooms[0].handlers.participantConnected());
  expect(audioTrack.attach).not.toHaveBeenCalled();

  const target = guest('guest-2', JSON.stringify({ slotNumber: 1 }), [audioTrack]);
  rooms[0].remoteParticipants.set('guest-2', target);
  await act(async () => rooms[0].handlers.trackSubscribed(audioTrack, {}, target));
  expect(audioTrack.attach).toHaveBeenCalledWith(container.querySelector('audio'));
});

it('skips a publication that has no track yet', async () => {
  const { container } = await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={1} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  rooms[0].remoteParticipants.set('guest-1', { identity: 'guest-1', metadata: JSON.stringify({ slotNumber: 1 }), trackPublications: new Map([['a', {}]]) });
  await act(async () => rooms[0].handlers.participantConnected());
  expect(container.querySelector('video')).not.toBeNull();
});

it('detaches a slot guest that unsubscribes, and leaves other tracks alone', async () => {
  await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={1} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  const track = { kind: 'video', attach: vi.fn(), detach: vi.fn() };
  const target = guest('guest-1', JSON.stringify({ slotNumber: 1 }), []);
  const other = guest('host-1', JSON.stringify({ slotNumber: 1 }), []);
  rooms[0].remoteParticipants.set('guest-1', target);
  await act(async () => rooms[0].handlers.trackUnsubscribed(track, {}, other));
  expect(track.detach).not.toHaveBeenCalled();
  await act(async () => rooms[0].handlers.trackUnsubscribed(track, {}, target));
  expect(track.detach).toHaveBeenCalled();
});

it('does not join or report once it has closed, including a failed authorization', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  let resolveCredentials!: (value: { serverUrl: string; token: string }) => void;
  const pendingView = await render(
    <WebrtcGuestSource getCredentials={() => new Promise((resolve) => (resolveCredentials = resolve))} />,
  );
  await pendingView.unmount();
  resolveCredentials({ serverUrl: 'wss://rtc.example.test', token: 'late' });
  await act(async () => {});
  expect(rooms[rooms.length - 1].connect).not.toHaveBeenCalled();

  let rejectCredentials!: (error: Error) => void;
  const failedView = await render(
    <WebrtcGuestSource getCredentials={() => new Promise((_resolve, reject) => (rejectCredentials = reject))} />,
  );
  await failedView.unmount();
  rejectCredentials(new Error('late failure'));
  await eventually(() => expect(errors).toHaveBeenCalledWith('WebRTC guest slot failed:', expect.any(Error)));
});

it('does not refresh a room that closed while it was connecting', async () => {
  let finishConnect!: () => void;
  hooks.connect = () => new Promise<void>((resolve) => (finishConnect = resolve));
  const view = await render(<WebrtcGuestSource getCredentials={credentials} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  await view.unmount();
  finishConnect();
  await act(async () => {});
  expect(rooms[0].disconnect).toHaveBeenCalled();
  hooks.connect = null;
});

it('ignores room events that arrive after it has closed', async () => {
  const track = { kind: 'video', attach: vi.fn(), detach: vi.fn() };
  const view = await render(<WebrtcGuestSource getCredentials={credentials} slotNumber={1} />);
  await eventually(() => expect(rooms[0].connect).toHaveBeenCalled());
  const room = rooms[0];
  await view.unmount();
  room.handlers.trackSubscribed(track, {}, guest('guest-1', JSON.stringify({ slotNumber: 1 }), []));
  expect(track.attach).not.toHaveBeenCalled();
});
