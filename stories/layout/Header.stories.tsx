import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemeToggle } from '../../src/components/theme-toggle';
import type { HeaderProps } from '../../src/layout/header';
import { Header } from '../../src/layout/header';

const logoSrc = new URL('../../src/assets/logo.svg', import.meta.url).href;

type HeaderStoryArgs = Omit<HeaderProps, 'actions' | 'mobileActions'> & {
  brandName: string;
  showThemeToggle: boolean;
};

const meta = {
  component: Header,
  title: 'Layout/Header',
  args: {
    brandName: 'bleecker',
    navigation: [
      { href: '/', label: 'Home' },
      { href: '/devices', label: 'Devices' },
      { href: '/channels', label: 'Channels' },
      { href: '/settings', label: 'Settings' }
    ],
    showThemeToggle: true
  },
  argTypes: {
    brand: {
      control: false
    },
    brandName: {
      control: 'text'
    },
    navigation: {
      control: 'object'
    },
    renderLink: {
      control: false
    },
    className: {
      control: 'text'
    },
    showThemeToggle: {
      control: 'boolean'
    }
  },
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<HeaderStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ brandName, showThemeToggle, ...args }) => (
    <div className='min-h-screen bg-light-sand dark:bg-deep-sea'>
      <Header
        {...args}
        actions={showThemeToggle ? <ThemeToggle /> : null}
        brand={{
          href: '/',
          logoAlt: 'gaulatti',
          logoSrc,
          name: brandName
        }}
        mobileActions={showThemeToggle ? <ThemeToggle /> : null}
      />
      <div className='mx-auto max-w-6xl px-4 pt-32'>
        <div className='rounded-[32px] border border-sand/10 bg-white/70 p-10 shadow-sm dark:border-dark-sand/30 dark:bg-dark-sand/70'>
          <h1 className='text-5xl text-text-primary dark:text-text-primary'>A reusable Gaulatti web shell</h1>
        </div>
      </div>
    </div>
  )
};
