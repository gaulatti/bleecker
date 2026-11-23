'use client';

import { MoreHorizontal } from 'lucide-react';
import React from 'react';

import { AlertDialog } from './alert-dialog';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
import { IconButton } from './icon-button';
import { Tooltip } from './tooltip';
import { cn } from '../utils/cn';

export interface RowActionsPrimary {
  /** The visible, safe action of the row. With an icon it is an icon button; without one a small button. */
  icon?: React.ReactNode;
  label: string;
  onSelect: () => void;
}

interface RowActionsItemBase {
  icon?: React.ReactNode;
  label: string;
  onSelect: () => void;
}

/** A safe item runs when chosen. */
export interface RowActionsSafeItem extends RowActionsItemBase {
  confirm?: never;
  destructive?: false;
}

/**
 * A destructive item always asks first: it sits at the bottom of the menu in the danger tone, and
 * `confirm` (its dialog title or inline question) is required, so it never fires on a single click.
 */
export interface RowActionsDestructiveItem extends RowActionsItemBase {
  confirm: string;
  destructive: true;
}

export type RowActionsItem = RowActionsSafeItem | RowActionsDestructiveItem;

export interface RowActionsProps {
  className?: string;
  /** `dialog` asks in an `AlertDialog`; `inline` swaps the row's controls for a "Delete?" question with Confirm and Cancel. */
  confirmStyle?: 'dialog' | 'inline';
  items: RowActionsItem[];
  /** Names the row in every control's accessible label, for example the clip's name. */
  label: string;
  moreLabel?: string;
  primary?: RowActionsPrimary;
}

const dangerItem = 'text-terracotta focus:text-terracotta data-[highlighted]:text-terracotta dark:text-terracotta';

/**
 * The actions of a list row: one visible primary action, the rest in an overflow menu. Destructive items
 * are separated at the bottom of the menu in the danger tone, and can ask for a confirmation so one stray
 * click cannot trigger them.
 */
export function RowActions({ className, confirmStyle = 'dialog', items, label, moreLabel = 'More actions', primary }: RowActionsProps) {
  const [pending, setPending] = React.useState<RowActionsItem | null>(null);
  const safe = items.filter((item) => !item.destructive);
  const destructive = items.filter((item) => item.destructive);

  const choose = (item: RowActionsItem) => {
    if (item.destructive) setPending(item);
    else item.onSelect();
  };
  const cancel = () => setPending(null);
  const confirm = () => {
    const item = pending;
    setPending(null);
    item?.onSelect();
  };

  if (pending && confirmStyle === 'inline') {
    return (
      <div
        role='group'
        aria-label={`Confirm ${pending.label} ${label}`}
        className={cn('flex items-center justify-end gap-2', className)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            cancel();
          }
        }}
      >
        <span className='text-xs font-medium text-text-primary'>{pending.confirm}</span>
        <Button size='xs' variant='destructive' autoFocus onClick={confirm}>
          {pending.label}
        </Button>
        <Button size='xs' variant='secondary' onClick={cancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
      {primary ? (
        primary.icon ? (
          <Tooltip content={primary.label}>
            <IconButton size='sm' variant='ghost' aria-label={`${primary.label} ${label}`} onClick={primary.onSelect}>
              {primary.icon}
            </IconButton>
          </Tooltip>
        ) : (
          <Button size='xs' variant='secondary' aria-label={`${primary.label} ${label}`} onClick={primary.onSelect}>
            {primary.label}
          </Button>
        )
      ) : null}
      {items.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton size='sm' variant='ghost' aria-label={`${moreLabel} for ${label}`}>
              <MoreHorizontal size={16} aria-hidden='true' />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {safe.map((item, index) => (
              <DropdownMenuItem key={`${index}:${item.label}`} onSelect={() => choose(item)}>
                {item.icon ? <span className='mr-2 inline-flex' aria-hidden='true'>{item.icon}</span> : null}
                {item.label}
              </DropdownMenuItem>
            ))}
            {safe.length > 0 && destructive.length > 0 ? <DropdownMenuSeparator /> : null}
            {destructive.map((item, index) => (
              <DropdownMenuItem key={`${index}:${item.label}`} className={dangerItem} data-tone='danger' onSelect={() => choose(item)}>
                {item.icon ? <span className='mr-2 inline-flex' aria-hidden='true'>{item.icon}</span> : null}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <AlertDialog
        isOpen={pending !== null && confirmStyle === 'dialog'}
        title={pending?.confirm ?? ''}
        confirmLabel={pending?.label}
        variant='destructive'
        onCancel={cancel}
        onConfirm={confirm}
      />
    </div>
  );
}
