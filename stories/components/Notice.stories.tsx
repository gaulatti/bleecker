import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button';
import { Notice, type NoticeTone } from '../../src/components/notice';
import { InTheme } from './theme-story';

const meta = {
  component: Notice,
  title: 'Components/Notice',
  args: { tone: 'warn', children: 'Live preview is not available: the media service is not configured on this server.' },
  argTypes: { tone: { control: 'select', options: ['info', 'warn', 'bad', 'ok'] } },
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

const MESSAGES: Record<NoticeTone, string> = {
  info: 'Only selected sources are subscribed. No output is routed to Program.',
  warn: 'Live preview is not available: the media service is not configured on this server.',
  bad: 'Live preview could not connect.',
  ok: 'The private link was copied.'
};
const TONES: NoticeTone[] = ['info', 'warn', 'bad', 'ok'];

const All = () => (
  <div className='max-w-2xl space-y-3'>
    {TONES.map((tone) => (
      <Notice key={tone} tone={tone}>
        {MESSAGES[tone]}
      </Notice>
    ))}
    <Notice tone='bad' title='Preview failed' action={<Button size='sm' variant='secondary'>Retry</Button>}>
      {MESSAGES.bad}
    </Notice>
    <Notice tone='warn' title='Quota nearly used' onDismiss={() => undefined}>
      90 % of the recording quota is in use.
    </Notice>
    <Notice tone='info' title='Sources' action={<Button size='sm' variant='secondary'>Refresh</Button>} onDismiss={() => undefined}>
      The list refreshes every ten seconds.
    </Notice>
    <Notice tone='ok' title='Saved' />
  </div>
);

/** Persistent and inline: it stays in the layout until the condition clears. `Alert` is the transient toast. */
export const Default: Story = {};
export const Tones: Story = { render: () => <All /> };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><All /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><All /></InTheme> };
export const InsideACard: Story = {
  render: () => (
    <div className='max-w-2xl rounded-[var(--radius-card)] border border-border bg-card p-4'>
      <h3 className='mb-3 text-sm font-semibold'>Managed external sources</h3>
      <Notice tone='bad' title='Preview failed' action={<Button size='sm' variant='secondary'>Retry</Button>}>
        {MESSAGES.bad}
      </Notice>
    </div>
  )
};
