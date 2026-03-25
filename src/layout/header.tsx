import React from 'react';

import { BrandLockup, type BrandLockupProps } from '../components/brand-lockup';
import { NavMenu, type NavItem, type RenderLink } from '../components/nav-menu';
import { cn } from '../utils/cn';

export interface HeaderProps {
  actions?: React.ReactNode;
  brand: BrandLockupProps;
  className?: string;
  fullWidth?: boolean;
  mobileActions?: React.ReactNode;
  navigation: NavItem[];
  renderLink?: RenderLink;
}

export function Header({ actions, brand, className, fullWidth = false, mobileActions, navigation, renderLink }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full bg-white/90 font-[family-name:var(--font-header)] backdrop-blur-2xl shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] dark:bg-dark-sand/95 dark:shadow-[0_1px_3px_0_rgb(0,0,0,0.3)]',
        className
      )}
    >
      <div className={cn(fullWidth ? 'w-full px-4' : 'container mx-auto px-4')}>
        <div className='flex h-20 items-center justify-between gap-6'>
          <BrandLockup {...brand} renderLink={renderLink} />

          <div className='hidden md:flex md:flex-1 md:items-center md:justify-center'>
            <NavMenu items={navigation} renderLink={renderLink} />
          </div>

          <div className='hidden md:flex md:items-center md:gap-3'>{actions}</div>

          <button className='group md:hidden' aria-label='Toggle navigation menu' type='button' onClick={() => setMobileMenuOpen((value) => !value)}>
            <div className='flex h-5 w-6 flex-col justify-between'>
              <span className={cn('h-px w-full bg-text-primary transition-all duration-400', mobileMenuOpen && 'translate-y-2 rotate-45')}></span>
              <span className={cn('h-px w-full bg-text-primary transition-all duration-400', mobileMenuOpen && 'opacity-0')}></span>
              <span className={cn('h-px w-full bg-text-primary transition-all duration-400', mobileMenuOpen && '-translate-y-2 -rotate-45')}></span>
            </div>
          </button>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden absolute left-0 top-20 w-full origin-top overflow-hidden border-t border-sand/10 bg-white/95 shadow-lg backdrop-blur-xl transition-all duration-400 dark:bg-sand/95',
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn(fullWidth ? 'w-full' : 'container mx-auto', 'flex flex-col gap-5 px-4 py-6')}>
          {mobileActions ? <div className='flex items-center gap-3'>{mobileActions}</div> : null}
          <NavMenu direction='vertical' items={navigation} onItemClick={() => setMobileMenuOpen(false)} renderLink={renderLink} />
        </div>
      </div>

      <div className='h-px w-full bg-gradient-to-r from-transparent via-sunset/30 to-transparent'></div>
    </header>
  );
}
