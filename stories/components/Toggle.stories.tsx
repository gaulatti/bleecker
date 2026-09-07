import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import toggleFixture from '../../conformance/kolibri-toggle/fixtures/toggle-family.json';
import { toggleSizes, toggleVariants, type ToggleSize, type ToggleVariant } from '../../src/core';
import { Toggle } from '../../src/components/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../src/components/toggle-group';
import { useTheme } from '../../src/theme/theme-provider';

const contractRoot = toggleFixture.components[0].tree[0];
const contractPressedStates = contractRoot.props.states.pressed;
const contractDisabledStates = contractRoot.props.states.disabled;
const contractThemes = ['light', 'dark'] as const;

const meta = {
  component: Toggle,
  title: 'Components/Toggle',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        <Bold size={16} />
        Bold
      </Toggle>
    );
  }
};

export const Outline: Story = {
  render: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <Toggle variant='outline' pressed={pressed} onPressedChange={setPressed}>
        <Italic size={16} />
        Italic
      </Toggle>
    );
  }
};

export const ToggleGroupSingle: Story = {
  render: () => {
    const [value, setValue] = React.useState('center');
    return (
      <ToggleGroup type='single' value={value} onValueChange={setValue}>
        <ToggleGroupItem value='left' aria-label='Align left'>
          <AlignLeft size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='center' aria-label='Align center'>
          <AlignCenter size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='right' aria-label='Align right'>
          <AlignRight size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }
};

export const ToggleGroupMultiple: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['bold']);
    return (
      <ToggleGroup type='multiple' value={value} onValueChange={setValue}>
        <ToggleGroupItem value='bold' aria-label='Bold'>
          <Bold size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='italic' aria-label='Italic'>
          <Italic size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='underline' aria-label='Underline'>
          <Underline size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }
};

function StoryDocumentTheme({ children, theme }: { children: React.ReactNode; theme: (typeof contractThemes)[number] }) {
  const { setTheme, storageKey } = useTheme();

  React.useLayoutEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey);
    setTheme(theme);
    return () => {
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setTheme(savedTheme);
      } else {
        setTheme('system');
        window.localStorage.removeItem(storageKey);
      }
    };
  }, [setTheme, storageKey, theme]);

  return children;
}

function KolibriContractMatrixView({ theme }: { theme: (typeof contractThemes)[number] }) {
  return (
    <StoryDocumentTheme theme={theme}>
      <main className='min-h-screen bg-background p-6 text-text-primary' data-theme={theme}>
        <h2 className='text-xl font-semibold'>Kolibri Toggle · {theme}</h2>
        <p className='font-secondary mt-1 text-sm text-text-secondary'>
          Every pinned size, visual variant, pressed state, and disabled state.
        </p>
        <div className='mt-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3'>
          {toggleVariants.flatMap((variant) =>
            toggleSizes.flatMap((size) =>
              contractPressedStates.flatMap((pressed) =>
                contractDisabledStates.map((disabled) => {
                  const state = `${variant}-${size}-${pressed ? 'pressed' : 'idle'}-${disabled ? 'disabled' : 'enabled'}`;
                  return (
                    <div
                      key={`${theme}-${state}`}
                      className='rounded-lg border border-sand/30 bg-light-sand/45 p-3 dark:border-white/10 dark:bg-white/[0.04]'
                    >
                      <p className='font-secondary mb-2 text-xs text-text-secondary'>{state}</p>
                      <Toggle
                        aria-label='Bold'
                        data-contract-size={size}
                        data-contract-state={state}
                        data-contract-theme={theme}
                        disabled={disabled}
                        pressed={pressed}
                        size={size as ToggleSize}
                        variant={variant as ToggleVariant}
                      >
                        <Bold aria-hidden='true' size={16} />
                        <span>Bold</span>
                      </Toggle>
                    </div>
                  );
                })
              )
            )
          )}
        </div>
      </main>
    </StoryDocumentTheme>
  );
}

async function verifyContractMatrix(canvasElement: HTMLElement, theme: (typeof contractThemes)[number]) {
  const canvas = within(canvasElement);
  await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(theme === 'dark'));
  await expect([...toggleSizes]).toEqual(contractRoot.props.variants.size);
  await expect([...toggleVariants]).toEqual(contractRoot.props.variants.variant);
  const expectedCount =
    toggleSizes.length *
    toggleVariants.length *
    contractPressedStates.length *
    contractDisabledStates.length;
  const buttons = canvas.getAllByRole('button');
  await expect(buttons).toHaveLength(expectedCount);
  await expect(canvasElement.querySelector('main')).toHaveAttribute('data-theme', theme);
  for (const button of buttons) {
    await expect(button).toHaveAttribute('type', 'button');
    await expect(['false', 'true']).toContain(button.getAttribute('aria-pressed'));
    await expect(button).toHaveAccessibleName('Bold');
    await expect(button).toHaveAttribute('data-contract-theme', theme);
  }
  for (const size of toggleSizes) {
    for (const variant of toggleVariants) {
      const matchingButtons = buttons.filter(
        (button) =>
          button.getAttribute('data-contract-size') === size &&
          button.getAttribute('data-contract-state')?.startsWith(`${variant}-`)
      );
      const dimensions = matchingButtons.map((button) => {
        const { height, width } = button.getBoundingClientRect();
        return `${width}x${height}`;
      });
      await expect([...new Set(dimensions)]).toHaveLength(1);
    }
  }
}

export const KolibriContractMatrix: Story = {
  parameters: {
    a11y: { test: 'error' },
    chromatic: { viewports: [390, 1280] },
    layout: 'fullscreen'
  },
  render: () => <KolibriContractMatrixView theme='light' />,
  play: async ({ canvasElement }) => verifyContractMatrix(canvasElement, 'light')
};

export const KolibriDarkContractMatrix: Story = {
  parameters: {
    a11y: { test: 'error' },
    chromatic: { viewports: [390, 1280] },
    layout: 'fullscreen'
  },
  render: () => <KolibriContractMatrixView theme='dark' />,
  play: async ({ canvasElement }) => verifyContractMatrix(canvasElement, 'dark')
};

function KolibriInteractionHarness({ theme }: { theme: (typeof contractThemes)[number] }) {
  const [pressed, setPressed] = React.useState(false);
  const [events, setEvents] = React.useState<string[]>([]);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const record = (event: string) => setEvents((current) => [...current, event]);

  return (
    <StoryDocumentTheme theme={theme}>
      <div className='flex min-h-64 flex-col items-start justify-center gap-4 bg-background p-8 text-text-primary'>
        <Toggle
          aria-label='Bold'
          ref={toggleRef}
          pressed={pressed}
          onPressedChange={(next) => {
            setPressed(next);
            record(`pressed-change:${next}`);
          }}
          onClick={() => record('click')}
        >
          <Bold aria-hidden='true' size={16} />
          <span>Bold</span>
        </Toggle>
        <Toggle
          aria-label='Disabled bold'
          disabled
          pressed={false}
          onPressedChange={(next) => record(`disabled-pressed-change:${next}`)}
          onClick={() => record('disabled-click')}
        >
          <Bold aria-hidden='true' size={16} />
          <span>Disabled bold</span>
        </Toggle>
        <output aria-live='polite' data-testid='event-order'>
          {events.join(' > ') || 'No events'}
        </output>
        <button type='button' onClick={() => toggleRef.current?.focus()}>
          Focus bold through forwarded ref
        </button>
      </div>
    </StoryDocumentTheme>
  );
}

export const KolibriKeyboardAndScreenReaderContract: Story = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'fullscreen'
  },
  render: () => <KolibriInteractionHarness theme='light' />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('button', { name: 'Bold' });
    const disabled = canvas.getByRole('button', { name: 'Disabled bold' });
    const events = canvas.getByTestId('event-order');
    const refTrigger = canvas.getByRole('button', { name: 'Focus bold through forwarded ref' });

    await expect(active).toHaveAttribute('type', 'button');
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    await expect(active.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(disabled).toBeDisabled();

    await userEvent.tab();
    await expect(active).toHaveFocus();
    await expect(getComputedStyle(active).boxShadow).not.toBe('none');

    await userEvent.keyboard(' ');
    await expect(active).toHaveAttribute('aria-pressed', 'true');
    await expect(events).toHaveTextContent('pressed-change:true > click');

    await userEvent.keyboard('{Enter}');
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    await expect(events).toHaveTextContent('pressed-change:true > click > pressed-change:false > click');

    disabled.click();
    await expect(events).toHaveTextContent('pressed-change:true > click > pressed-change:false > click');
    await userEvent.tab();
    await expect(disabled).not.toHaveFocus();

    await userEvent.click(refTrigger);
    await expect(active).toHaveFocus();
  }
};

export const KolibriDarkFocusContract: Story = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'fullscreen'
  },
  render: () => <KolibriInteractionHarness theme='dark' />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('button', { name: 'Bold' });

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    await userEvent.tab();
    await expect(active).toHaveFocus();
    await expect(getComputedStyle(active).boxShadow).not.toBe('none');
  }
};
