import { Check, ChevronRight } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MenubarItemBase {
  label: string;
  disabled?: boolean;
  shortcut?: string;
}

export interface MenubarActionItem extends MenubarItemBase {
  type: 'item';
  onSelect: () => void;
  icon?: React.ReactNode;
}

export interface MenubarCheckboxItem extends MenubarItemBase {
  type: 'checkbox';
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface MenubarRadioItem extends MenubarItemBase {
  type: 'radio';
  value: string;
}

export interface MenubarRadioGroup {
  type: 'radioGroup';
  value: string;
  onValueChange: (value: string) => void;
  items: MenubarRadioItem[];
}

export interface MenubarSeparator {
  type: 'separator';
}

export interface MenubarSubMenu extends MenubarItemBase {
  type: 'sub';
  items: MenubarMenuItem[];
}

export type MenubarMenuItem = MenubarActionItem | MenubarCheckboxItem | MenubarRadioGroup | MenubarSeparator | MenubarSubMenu;

export interface MenubarMenu {
  trigger: string;
  items: MenubarMenuItem[];
}

export interface MenubarProps {
  className?: string;
  menus: MenubarMenu[];
}

// ─── MenuItem renderer ───────────────────────────────────────────────────────

function MenuItems({ items, radioGroupValue, onClose }: { items: MenubarMenuItem[]; radioGroupValue?: string; onClose: () => void }) {
  const [openSub, setOpenSub] = React.useState<number | null>(null);

  return (
    <div className='flex flex-col py-1'>
      {items.map((item, i) => {
        if (item.type === 'separator') {
          return <div key={i} className='my-1 h-px bg-sand/15 dark:bg-sand/25' role='separator' />;
        }

        if (item.type === 'radioGroup') {
          return (
            <div key={i} role='group'>
              {item.items.map((rItem) => {
                const isChecked = item.value === rItem.value;
                return (
                  <button
                    key={rItem.value}
                    type='button'
                    role='menuitemradio'
                    aria-checked={isChecked}
                    disabled={rItem.disabled}
                    onClick={() => {
                      item.onValueChange(rItem.value);
                      onClose();
                    }}
                    className='flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-sand/10 disabled:opacity-50 dark:text-text-primary dark:hover:bg-sand/15'
                  >
                    <span className='flex h-4 w-4 items-center justify-center'>
                      {isChecked ? <span className='h-2 w-2 rounded-full bg-sea dark:bg-accent-blue' /> : null}
                    </span>
                    {rItem.label}
                    {rItem.shortcut ? <span className='ml-auto text-xs text-text-secondary'>{rItem.shortcut}</span> : null}
                  </button>
                );
              })}
            </div>
          );
        }

        if (item.type === 'checkbox') {
          return (
            <button
              key={i}
              type='button'
              role='menuitemcheckbox'
              aria-checked={item.checked}
              disabled={item.disabled}
              onClick={() => {
                item.onCheckedChange(!item.checked);
                onClose();
              }}
              className='flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-sand/10 disabled:opacity-50 dark:text-text-primary dark:hover:bg-sand/15'
            >
              <span className='flex h-4 w-4 items-center justify-center'>
                {item.checked ? <Check size={12} className='text-sea dark:text-accent-blue' /> : null}
              </span>
              {item.label}
              {item.shortcut ? <span className='ml-auto text-xs text-text-secondary'>{item.shortcut}</span> : null}
            </button>
          );
        }

        if (item.type === 'sub') {
          const isSubOpen = openSub === i;
          return (
            <div key={i} className='relative'>
              <button
                type='button'
                role='menuitem'
                aria-haspopup='menu'
                aria-expanded={isSubOpen}
                disabled={item.disabled}
                onPointerEnter={() => setOpenSub(i)}
                onPointerLeave={() => setOpenSub(null)}
                className='flex w-full items-center rounded-lg px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-sand/10 disabled:opacity-50 dark:text-text-primary dark:hover:bg-sand/15'
              >
                <span className='flex-1'>{item.label}</span>
                <ChevronRight size={14} className='text-text-secondary' />
              </button>
              {isSubOpen && (
                <div
                  className='absolute left-full top-0 z-10 min-w-[12rem] rounded-xl border border-sand/10 bg-white shadow-xl dark:border-sand/20 dark:bg-dark-sand'
                  onPointerEnter={() => setOpenSub(i)}
                  onPointerLeave={() => setOpenSub(null)}
                >
                  <MenuItems items={item.items} onClose={onClose} />
                </div>
              )}
            </div>
          );
        }

        // type === 'item'
        return (
          <button
            key={i}
            type='button'
            role='menuitem'
            disabled={item.disabled}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className='flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-sand/10 disabled:opacity-50 dark:text-text-primary dark:hover:bg-sand/15'
          >
            {item.icon ? <span className='flex-shrink-0 text-text-secondary'>{item.icon}</span> : <span className='w-4' />}
            <span className='flex-1'>{item.label}</span>
            {item.shortcut ? <span className='ml-auto text-xs text-text-secondary'>{item.shortcut}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Menubar ─────────────────────────────────────────────────────────────────

export function Menubar({ className, menus }: MenubarProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setActiveIndex(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [activeIndex]);

  return (
    <div
      ref={barRef}
      role='menubar'
      className={cn(
        'flex items-center gap-1 rounded-xl border border-sand/10 bg-white/80 px-1 py-1 shadow-sm backdrop-blur-md dark:border-sand/20 dark:bg-dark-sand/80',
        className
      )}
    >
      {menus.map((menu, i) => {
        const isOpen = activeIndex === i;
        return (
          <div key={menu.trigger} className='relative'>
            <button
              type='button'
              role='menuitem'
              aria-haspopup='menu'
              aria-expanded={isOpen}
              onClick={() => setActiveIndex(isOpen ? null : i)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sea dark:focus-visible:ring-accent-blue',
                isOpen
                  ? 'bg-sea text-white dark:bg-accent-blue'
                  : 'text-text-secondary hover:bg-sand/10 hover:text-text-primary dark:text-text-secondary dark:hover:bg-sand/15 dark:hover:text-text-primary'
              )}
            >
              {menu.trigger}
            </button>
            {isOpen && (
              <div
                role='menu'
                className='absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-xl border border-sand/10 bg-white p-1 shadow-xl dark:border-sand/20 dark:bg-dark-sand'
              >
                <MenuItems items={menu.items} onClose={() => setActiveIndex(null)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
