import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { SectionHeader } from '../../src/components/section-header';
import { ThemeToggle } from '../../src/components/theme-toggle';
import { AppShell } from '../../src/layout/app-shell';
import { Footer } from '../../src/layout/footer';
import { Header } from '../../src/layout/header';

const logoSrc = new URL('../../src/assets/logo.svg', import.meta.url).href;

const meta = {
  title: 'Layout/AppShell',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  render: () => {
    const brand = {
      href: '/',
      logoAlt: 'gaulatti',
      logoSrc,
      name: 'bleecker'
    };

    return (
      <AppShell
        footer={
          <Footer
            bottomLeft={
              <>
                © {new Date().getFullYear()} <span className='font-semibold'>gaulatti</span>
              </>
            }
            brand={{
              ...brand,
              description: 'A brokaw-style package for the Gaulatti web UI layer.'
            }}
            sections={[
              {
                title: 'Navigation',
                items: [
                  { href: '/', label: 'Overview' },
                  { href: '/devices', label: 'Devices' },
                  { href: '/settings', label: 'Settings' }
                ]
              },
              {
                title: 'Resources',
                items: [
                  { href: 'https://github.com/gaulatti/bleecker', label: 'Repository', external: true },
                  { href: '/storybook', label: 'Storybook' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/terms', label: 'Terms' }
                ]
              }
            ]}
          />
        }
        header={
          <Header
            actions={<ThemeToggle />}
            brand={brand}
            mobileActions={<ThemeToggle />}
            navigation={[
              { href: '/', label: 'Overview' },
              { href: '/devices', label: 'Devices' },
              { href: '/groups', label: 'Groups' },
              { href: '/settings', label: 'Settings' }
            ]}
          />
        }
      >
        <section className='bg-light-sand px-4 py-10 dark:bg-deep-sea'>
          <div className='mx-auto max-w-6xl space-y-8'>
            <SectionHeader
              eyebrow='Bleecker'
              title='Shared browser UI for Gaulatti products'
              description='This story exercises the reusable shell, typography, card system, and call-to-action primitives together.'
            />

            <div className='grid gap-6 lg:grid-cols-3'>
              <Card className='space-y-4'>
                <h3 className='text-2xl'>Shell</h3>
                <p className='text-text-secondary dark:text-text-secondary'>Common app framing for admin surfaces, dashboards, and tooling frontends.</p>
                <Button>Open shell docs</Button>
              </Card>
              <Card className='space-y-4'>
                <h3 className='text-2xl'>Theme</h3>
                <p className='text-text-secondary dark:text-text-secondary'>One color system, one dark-mode runtime, and one typography baseline across products.</p>
                <Button variant='secondary'>Review tokens</Button>
              </Card>
              <Card className='space-y-4'>
                <h3 className='text-2xl'>Components</h3>
                <p className='text-text-secondary dark:text-text-secondary'>Low-risk reusable primitives first, then deeper product components once the API settles.</p>
                <Button variant='ghost'>Browse stories</Button>
              </Card>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }
};
