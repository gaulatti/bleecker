import React from 'react';

import { type NavItem, renderDefaultLink, type RenderLink } from './nav-menu';
import { gaulattiLogoSrc } from '../assets/logo';
import { cn } from '../utils/cn';

export interface BrandLockupProps {
  className?: string;
  href: string;
  logoAlt?: string;
  logoSrc?: string;
  name: string;
  renderLink?: RenderLink<NavItem>;
  size?: 'sm' | 'lg';
}

export function BrandLockup({ className, href, logoAlt = 'gaulatti', logoSrc = gaulattiLogoSrc, name, renderLink, size = 'sm' }: BrandLockupProps) {
  const linkRenderer = renderLink ?? renderDefaultLink;
  const isLarge = size === 'lg';

  return (
    <>
      {linkRenderer({
        item: {
          href,
          label: name
        },
        className: cn('group inline-flex items-center gap-4 transition-all duration-400', className),
        children: (
          <>
            <img
              src={logoSrc}
              alt={logoAlt}
              className={cn('w-auto opacity-90 transition-opacity duration-400 group-hover:opacity-100 dark:invert', isLarge ? 'h-12' : 'h-8')}
            />
            <div className={cn('w-px bg-gradient-to-b from-sunset/0 via-sunset to-sunset/0', isLarge ? 'h-12' : 'h-8')} />
            <span
              className={cn(
                'font-[family-name:var(--font-display)] font-bold tracking-tight text-text-primary dark:text-text-primary',
                isLarge ? 'text-3xl' : 'text-xl'
              )}
            >
              {name}
            </span>
          </>
        )
      })}
    </>
  );
}
