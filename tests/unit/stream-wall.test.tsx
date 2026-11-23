import { expect, it } from 'vitest';
import { StreamWall } from '../../src/components/stream-wall';
import { render } from './helpers';

// gaulatti/alcantara#184: the stream wall shows each valid stream once.

it('shows each valid http(s) stream once, up to the limit, under its title', async () => {
  const view = await render(
    <StreamWall
      maxStreams={2}
      urls={[
        ' https://vdo.example.test/?view=a ',
        'https://vdo.example.test/?view=a',
        '',
        'not a url',
        'ftp://files.example.test/stream',
        'http://vdo.example.test/?view=b',
        'https://vdo.example.test/?view=c',
      ]}
    />,
  );
  expect(view.container.querySelector('h1')?.textContent).toBe('Stream Wall');
  expect(view.container.textContent).toContain('2/2 streams');
  const frames = Array.from(view.container.querySelectorAll('iframe'));
  expect(frames.map((frame) => frame.getAttribute('src'))).toEqual([
    'https://vdo.example.test/?view=a',
    'http://vdo.example.test/?view=b',
  ]);
  expect(frames[0].getAttribute('referrerpolicy')).toBe('no-referrer');
  expect(frames[0].getAttribute('title')).toBe('Stream 1');
  expect(view.container.querySelector("[title='Stream 3']")).toBeNull();
});

it('explains how to add streams when none are valid, with the default limit', async () => {
  const view = await render(<StreamWall urls={['javascript:alert(1)']} title='Guests' />);
  expect(view.container.textContent).toContain('Guests');
  expect(view.container.textContent).toContain('0/4 streams');
  expect(view.container.textContent).toContain('No valid stream URLs provided');
  expect(view.container.textContent).toContain('(repeat up to 4)');
});

it('hides the header for a blank title and shows a suspended wall without its streams', async () => {
  const view = await render(<StreamWall urls={['https://vdo.example.test/?view=a']} title='  ' suspended />);
  expect(view.container.querySelector('h1')).toBeNull();
  expect(view.container.textContent).toContain('Stream wall suspended');
  expect(view.container.querySelector("[title='Stream 1']")).toBeNull();
});
