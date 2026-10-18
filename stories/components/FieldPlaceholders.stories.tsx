import React from 'react';
import { Search, User } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Input } from '../../src/components/input';
import { Textarea } from '../../src/components/textarea';
import { ThemeProvider } from '../../src/theme/theme-provider';

type FieldKind = 'input' | 'textarea';
type Appearance = 'light' | 'dark';

function FieldSample({ kind, label, size, error = false, icons = false, override = false }: {
  kind: FieldKind;
  label: string;
  size: 'sm' | 'md' | 'lg';
  error?: boolean;
  icons?: boolean;
  override?: boolean;
}) {
  const [value, setValue] = React.useState('');
  const id = label.toLowerCase().replaceAll(' ', '-');
  const props = {
    id,
    name: id,
    value,
    error,
    placeholder: 'A helpful note about this fictional story…',
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(event.target.value),
    className: override ? 'placeholder:text-accent-oxblood dark:placeholder:text-accent-text' : undefined,
    'data-placeholder-default': override ? undefined : true,
    'data-placeholder-override': override ? true : undefined
  };
  return (
    <div className='space-y-2'>
      <label htmlFor={id} className='block text-sm font-medium'>{label}</label>
      {kind === 'input'
        ? <Input {...props} inputSize={size} startIcon={icons ? <Search size={16} aria-hidden='true' /> : undefined} endIcon={icons ? <User size={16} aria-hidden='true' /> : undefined} />
        : <Textarea {...props} textareaSize={size} rows={3} />}
    </div>
  );
}

function FieldPlaceholders({ kind, appearance }: { kind: FieldKind; appearance: Appearance }) {
  return (
    <ThemeProvider theme={appearance} onThemeChange={() => {}}>
      <main className='min-h-screen bg-background p-6 text-text-primary'>
        <div className='mx-auto max-w-xl space-y-5'>
          <h1 className='text-xl font-semibold'>{appearance === 'dark' ? 'Dark' : 'Light'} {kind} placeholders</h1>
          <p className='text-sm text-text-secondary'>Enabled fields with empty controlled values. Custom placeholder colors remain the caller's choice.</p>
          <FieldSample kind={kind} label={`Small ${kind}`} size='sm' />
          <FieldSample kind={kind} label={`Medium ${kind}${kind === 'input' ? ' with icons' : ''}`} size='md' icons={kind === 'input'} />
          <FieldSample kind={kind} label={`Large ${kind}`} size='lg' />
          <FieldSample kind={kind} label={`Error ${kind}`} size='md' error />
          <FieldSample kind={kind} label={`Custom ${kind}`} size='md' override />
          <p data-testid='override-reference' className='text-sm text-accent-oxblood dark:text-accent-text'>Caller-selected semantic color</p>
        </div>
      </main>
    </ThemeProvider>
  );
}

const meta = {
  component: FieldPlaceholders,
  title: 'Components/FieldPlaceholders',
  parameters: {
    themeProvider: 'story',
    a11y: { test: 'error' },
    layout: 'fullscreen'
  }
} satisfies Meta<typeof FieldPlaceholders>;

export default meta;
type Story = StoryObj<typeof meta>;

function paintColor(doc: Document, foreground: string, background: string) {
  const view = doc.defaultView;
  if (!view || !view.CSS.supports('color', foreground) || !view.CSS.supports('color', background)) {
    throw new Error('The browser must support the actual computed field colors');
  }
  const canvas = doc.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
  if (!context) throw new Error('A real browser Canvas2D context is required');
  context.fillStyle = background;
  context.fillRect(0, 0, 1, 1);
  if (context.getImageData(0, 0, 1, 1).data[3] !== 255) {
    throw new Error('The field fixture must have an opaque computed background');
  }
  context.fillStyle = foreground;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data];
}

function luminance(pixel: number[]) {
  const channels = pixel.slice(0, 3).map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

async function verifyPlaceholders(canvasElement: HTMLElement, kind: FieldKind, appearance: Appearance) {
  const doc = canvasElement.ownerDocument;
  const view = doc.defaultView!;
  const canvas = within(canvasElement);
  await waitFor(() => expect(doc.documentElement.classList.contains('dark')).toBe(appearance === 'dark'));
  const fields = canvas.getAllByRole('textbox').filter(field => field.hasAttribute('data-placeholder-default'));
  await expect(fields).toHaveLength(4);
  for (const field of fields) {
    await expect(field).toBeEnabled();
    await expect(field.matches(':placeholder-shown')).toBe(true);
    const styles = view.getComputedStyle(field);
    const placeholder = view.getComputedStyle(field, '::placeholder');
    await expect(styles.opacity).toBe('1');
    await expect(placeholder.opacity).toBe('1');
    const text = luminance(paintColor(doc, placeholder.color, styles.backgroundColor));
    const backing = luminance(paintColor(doc, styles.backgroundColor, styles.backgroundColor));
    const ratio = (Math.max(text, backing) + 0.05) / (Math.min(text, backing) + 0.05);
    await expect(ratio, `${field.id}: actual CSS placeholder contrast`).toBeGreaterThanOrEqual(4.5);
  }
  const custom = canvas.getByLabelText(`Custom ${kind}`);
  const background = view.getComputedStyle(custom).backgroundColor;
  const reference = view.getComputedStyle(canvas.getByTestId('override-reference')).color;
  await expect(paintColor(doc, view.getComputedStyle(custom, '::placeholder').color, background)).toEqual(paintColor(doc, reference, background));
  const writing = canvas.getByLabelText(`Medium ${kind}${kind === 'input' ? ' with icons' : ''}`);
  await userEvent.type(writing, 'Fictional note — café 東京.');
  await expect(writing).toHaveValue('Fictional note — café 東京.');
  await userEvent.clear(writing);
  await expect(writing).toHaveValue('');
  await expect(writing.matches(':placeholder-shown')).toBe(true);
}

export const InputLight: Story = {
  args: { kind: 'input', appearance: 'light' },
  play: async ({ canvasElement }) => verifyPlaceholders(canvasElement, 'input', 'light')
};

export const InputDark: Story = {
  args: { kind: 'input', appearance: 'dark' },
  play: async ({ canvasElement }) => verifyPlaceholders(canvasElement, 'input', 'dark')
};

export const TextareaLight: Story = {
  args: { kind: 'textarea', appearance: 'light' },
  play: async ({ canvasElement }) => verifyPlaceholders(canvasElement, 'textarea', 'light')
};

export const TextareaDark: Story = {
  args: { kind: 'textarea', appearance: 'dark' },
  play: async ({ canvasElement }) => verifyPlaceholders(canvasElement, 'textarea', 'dark')
};
