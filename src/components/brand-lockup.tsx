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
}

export function BrandLockup({ className, href, logoAlt = 'gaulatti', logoSrc = gaulattiLogoSrc, name, renderLink }: BrandLockupProps) {
  const linkRenderer = renderLink ?? renderDefaultLink;

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
            <img src={logoSrc} alt={logoAlt} className='h-8 w-auto opacity-90 transition-opacity duration-400 group-hover:opacity-100 dark:invert' />
            <div className='h-8 w-px bg-gradient-to-b from-sunset/0 via-sunset to-sunset/0'></div>
            <span className='font-[family-name:var(--font-header)] text-xl font-bold tracking-tight text-text-primary dark:text-text-primary'>{name}</span>
          </>
        )
      })}
    </>
  );
}
