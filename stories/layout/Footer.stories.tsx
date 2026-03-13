import type { Meta, StoryObj } from '@storybook/react-vite';

import type { FooterProps } from '../../src/layout/footer';
import { Footer } from '../../src/layout/footer';

const logoSrc = new URL('../../src/assets/logo.svg', import.meta.url).href;

type FooterStoryArgs = Omit<FooterProps, 'bottomLeft' | 'bottomRight'> & {
  brandName: string;
  description: string;
  bottomLeftText: string;
  bottomRightText: string;
};

const meta = {
  component: Footer,
  title: 'Layout/Footer',
  args: {
    brandName: 'bleecker',
    description: 'Shared web UI components and layout primitives for Gaulatti products.',
    sections: [
      {
        title: 'Navigation',
        items: [
          { href: '/', label: 'Home' },
          { href: '/components', label: 'Components' },
          { href: '/tokens', label: 'Tokens' }
        ]
      },
      {
        title: 'Resources',
        items: [
          { href: 'https://github.com/gaulatti/bleecker', label: 'GitHub', external: true },
          { href: '/storybook', label: 'Storybook' },
          { href: '/privacy', label: 'Privacy Policy' },
          { href: '/terms', label: 'Terms of Service' }
        ]
      }
    ],
    bottomLeftText: '© 2026 gaulatti. All rights reserved.',
    bottomRightText: ''
  },
  argTypes: {
    brand: {
      control: false
    },
    brandName: {
      control: 'text'
    },
    description: {
      control: 'text'
    },
    sections: {
      control: 'object'
    },
    renderLink: {
      control: false
    },
    className: {
      control: 'text'
    },
    showBottomAccent: {
      control: 'boolean'
    },
    bottomLeftText: {
      control: 'text'
    },
    bottomRightText: {
      control: 'text'
    }
  },
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<FooterStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ bottomLeftText, bottomRightText, brandName, description, ...args }) => (
    <div className='min-h-screen bg-light-sand dark:bg-deep-sea'>
      <div className='h-[70vh]'></div>
      <Footer
        {...args}
        brand={{
          href: '/',
          logoAlt: 'gaulatti',
          logoSrc,
          name: brandName,
          description
        }}
        bottomLeft={bottomLeftText}
        bottomRight={bottomRightText || undefined}
      />
    </div>
  )
};
