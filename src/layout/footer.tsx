import React from 'react';

import type { BrandLockupProps } from '../components/brand-lockup';
import { type NavItem, type RenderLink, renderDefaultLink } from '../components/nav-menu';
import { cn } from '../utils/cn';

export interface FooterSection {
  items: NavItem[];
  title: string;
}

export interface FooterProps {
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
  brand: BrandLockupProps & {
    description?: string;
  };
  className?: string;
  renderLink?: RenderLink;
  sections: FooterSection[];
  showBottomAccent?: boolean;
}

export function Footer({ bottomLeft, bottomRight, brand, className, renderLink, sections, showBottomAccent = true }: FooterProps) {
  const linkRenderer = renderLink ?? renderDefaultLink;
  const githubItem = sections.flatMap((section) => section.items).find((item) => item.href.includes('github.com'));
  const brandColumnClassName = sections.length <= 2 ? 'lg:col-span-2' : undefined;
  const brandLink = linkRenderer({
    item: {
      href: brand.href,
      label: brand.name
    },
    className: 'group inline-flex items-center gap-4 transition-all duration-400',
    children: (
      <>
        <img src={brand.logoSrc} alt={brand.logoAlt} className='h-12 w-auto fill-current opacity-90 transition-opacity duration-400 group-hover:opacity-100 dark:invert' />
        <div className='h-12 w-px bg-gradient-to-b from-sunset/0 via-sunset to-sunset/0'></div>
        <span className='font-[family-name:var(--font-header)] text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary'>{brand.name}</span>
      </>
    )
  });
  const resolvedBottomRight =
    bottomRight ??
    (githubItem
      ? linkRenderer({
          item: githubItem,
          className: 'hover:underline underline-offset-4',
          children: 'View source on GitHub'
        })
      : null);

  return (
    <footer className={cn('bg-light-sand text-text-primary dark:bg-sand dark:text-text-primary', className)}>
      <div className='h-px w-full bg-gradient-to-r from-transparent via-sunset/30 to-transparent'></div>

      <div className='container mx-auto px-4 py-20'>
        <div className='grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4'>
          <div className={cn(brandColumnClassName)}>
            {brandLink}
            {brand.description ? (
              <p className='mt-8 max-w-md leading-relaxed tracking-refined text-text-secondary dark:text-text-secondary'>{brand.description}</p>
            ) : null}
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className='mb-8 text-sm font-medium uppercase tracking-elegant text-desert dark:text-desert'>{section.title}</h3>
              <ul className='space-y-4'>
                {section.items.map((item) => (
                  <li key={`${section.title}:${item.href}:${item.label}`}>
                    {linkRenderer({
                      item,
                      className: 'text-text-secondary transition-colors duration-400 hover:text-sunset dark:text-text-secondary dark:hover:text-sunset',
                      children: item.label
                    })}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-20 flex flex-col items-center justify-between gap-4 border-t border-sand/10 pt-8 md:flex-row'>
          <div className='text-sm tracking-refined text-text-secondary dark:text-text-secondary'>{bottomLeft}</div>
          <div className='text-sm tracking-refined text-text-secondary/70 dark:text-text-secondary/70'>{resolvedBottomRight}</div>
        </div>
      </div>

      {showBottomAccent ? <div className='h-1 w-full bg-gradient-to-r from-desert via-sunset to-sea opacity-80'></div> : null}
    </footer>
  );
}
