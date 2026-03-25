import { Search } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import { Kbd } from './kbd';
import { cn } from '../utils/cn';

const DEFAULT_GROUP = 'Actions';

export interface CommandSpotlightAction {
  description?: string;
  disabled?: boolean;
  external?: boolean;
  group?: string;
  href?: string;
  icon?: React.ReactNode;
  id: string;
  keywords?: string[];
  shortcut?: string[];
  title: string;
  onSelect?: () => void | Promise<void>;
}

export interface CommandSpotlightProps {
  actions: CommandSpotlightAction[];
  className?: string;
  dialogClassName?: string;
  emptyMessage?: string;
  hotkey?: string;
  onActionSelect?: (action: CommandSpotlightAction) => void;
  onOpenChange?: (isOpen: boolean) => void;
  open?: boolean;
  overlayClassName?: string;
  placeholder?: string;
  showTrigger?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

export function CommandSpotlight({
  actions,
  className,
  dialogClassName,
  emptyMessage = 'No matching commands.',
  hotkey = 'k',
  onActionSelect,
  onOpenChange,
  open,
  overlayClassName,
  placeholder = 'Search commands...',
  showTrigger = true,
  triggerClassName,
  triggerLabel = 'Search'
}: CommandSpotlightProps) {
  const [isOpenInternal, setIsOpenInternal] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedActionId, setSelectedActionId] = React.useState<string | null>(null);
  const [isMacLike, setIsMacLike] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const actionRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? (open as boolean) : isOpenInternal;

  const setIsOpen = React.useCallback(
    (nextIsOpen: boolean) => {
      if (!isControlled) {
        setIsOpenInternal(nextIsOpen);
      }
      onOpenChange?.(nextIsOpen);
    },
    [isControlled, onOpenChange]
  );

  const filteredActions = React.useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return actions;
    }

    return actions.filter((action) => {
      const haystack = normalize(
        [
          action.title,
          action.description || '',
          action.group || '',
          ...(action.keywords || []),
          action.href || ''
        ].join(' ')
      );
      return haystack.includes(normalizedQuery);
    });
  }, [actions, query]);

  const selectableActionIds = React.useMemo(
    () => filteredActions.filter((action) => !action.disabled).map((action) => action.id),
    [filteredActions]
  );

  const groupedActions = React.useMemo(() => {
    const groups = new Map<string, CommandSpotlightAction[]>();

    filteredActions.forEach((action) => {
      const group = action.group?.trim() || DEFAULT_GROUP;
      const existing = groups.get(group);
      if (existing) {
        existing.push(action);
        return;
      }
      groups.set(group, [action]);
    });

    return Array.from(groups.entries());
  }, [filteredActions]);

  const closeSpotlight = React.useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, [setIsOpen]);

  const moveSelection = React.useCallback(
    (direction: 1 | -1) => {
      if (selectableActionIds.length === 0) {
        setSelectedActionId(null);
        return;
      }

      const currentIndex = selectedActionId ? selectableActionIds.indexOf(selectedActionId) : -1;
      const nextIndex =
        currentIndex < 0 ? 0 : (currentIndex + direction + selectableActionIds.length) % selectableActionIds.length;

      setSelectedActionId(selectableActionIds[nextIndex]);
    },
    [selectableActionIds, selectedActionId]
  );

  const runAction = React.useCallback(
    (action: CommandSpotlightAction) => {
      if (action.disabled) {
        return;
      }

      onActionSelect?.(action);

      if (action.onSelect) {
        try {
          const result = action.onSelect();
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            void (result as Promise<unknown>).catch((error) => {
              console.error('Command spotlight action failed:', error);
            });
          }
        } catch (error) {
          console.error('Command spotlight action failed:', error);
        }
      } else if (action.href && typeof window !== 'undefined') {
        if (action.external) {
          window.open(action.href, '_blank', 'noopener,noreferrer');
        } else {
          window.location.assign(action.href);
        }
      }

      closeSpotlight();
    },
    [closeSpotlight, onActionSelect]
  );

  React.useEffect(() => {
    if (typeof navigator === 'undefined') {
      return;
    }

    setIsMacLike(/mac|iphone|ipad|ipod/i.test(navigator.platform));
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedActionId((currentSelectedActionId) => {
      if (currentSelectedActionId && selectableActionIds.includes(currentSelectedActionId)) {
        return currentSelectedActionId;
      }

      return selectableActionIds[0] ?? null;
    });
  }, [isOpen, selectableActionIds]);

  React.useEffect(() => {
    if (!isOpen || !selectedActionId) {
      return;
    }

    actionRefs.current[selectedActionId]?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, selectedActionId]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const normalizedHotkey = hotkey.toLowerCase();

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && pressedKey === normalizedHotkey) {
        if (!isOpen && isEditableTarget(event.target)) {
          return;
        }

        event.preventDefault();
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);
        if (!nextIsOpen) {
          setQuery('');
        }
        return;
      }

      if (!isOpen || pressedKey !== 'escape') {
        return;
      }

      event.preventDefault();
      closeSpotlight();
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [closeSpotlight, hotkey, isOpen, setIsOpen]);

  const hotkeyHint = React.useMemo(() => {
    const modifier = isMacLike ? '⌘' : 'Ctrl';
    return [modifier, hotkey.toUpperCase()];
  }, [hotkey, isMacLike]);

  const renderTrigger = showTrigger ? (
    <button
      type='button'
      onClick={() => {
        setIsOpen(true);
      }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-sand/20 bg-white/35 px-3 py-1.5 text-sm text-text-primary shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-white/65 dark:border-sand/70 dark:bg-sand/25 dark:hover:bg-sand/35',
        triggerClassName
      )}
      aria-label='Open command spotlight'
    >
      <Search size={15} className='text-text-secondary dark:text-text-secondary' />
      <span className='hidden sm:inline'>{triggerLabel}</span>
      <Kbd keys={hotkeyHint} className='hidden sm:inline-flex' />
    </button>
  ) : null;

  const renderOverlay =
    isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className={cn('fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[12vh]', overlayClassName)}>
            <button type='button' onClick={closeSpotlight} className='absolute inset-0 bg-black/45 backdrop-blur-sm' aria-label='Close command spotlight' />

            <div
              role='dialog'
              aria-modal='true'
              className={cn(
                'relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-sand/10 bg-white/95 text-text-primary shadow-2xl backdrop-blur-xl dark:border-sand/20 dark:bg-dark-sand/95 dark:text-text-primary',
                dialogClassName
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <div className='flex items-center gap-3 border-b border-sand/15 px-4 py-3 dark:border-sand/20'>
                <Search size={18} className='flex-shrink-0 text-text-secondary dark:text-text-secondary' />
                <input
                  ref={inputRef}
                  type='text'
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      moveSelection(1);
                      return;
                    }

                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      moveSelection(-1);
                      return;
                    }

                    if (event.key === 'Enter') {
                      event.preventDefault();
                      if (!selectedActionId) {
                        return;
                      }

                      const selectedAction = filteredActions.find((action) => action.id === selectedActionId);
                      if (selectedAction) {
                        runAction(selectedAction);
                      }
                    }
                  }}
                  placeholder={placeholder}
                  className='w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-secondary dark:text-text-primary dark:placeholder:text-text-secondary'
                />
                <Kbd keys={hotkeyHint} />
              </div>

              <div className='max-h-[55vh] overflow-y-auto p-2'>
                {groupedActions.length === 0 ? (
                  <p className='px-3 py-12 text-center text-sm text-text-secondary dark:text-text-secondary'>{emptyMessage}</p>
                ) : (
                  groupedActions.map(([group, groupActions]) => (
                    <section key={group} className='mb-3 last:mb-0'>
                      <p className='px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-secondary dark:text-text-secondary'>{group}</p>
                      <div className='space-y-1'>
                        {groupActions.map((action) => {
                          const isSelected = action.id === selectedActionId;

                          return (
                            <button
                              key={action.id}
                              type='button'
                              ref={(element) => {
                                actionRefs.current[action.id] = element;
                              }}
                              disabled={action.disabled}
                              onClick={() => runAction(action)}
                              onMouseEnter={() => {
                                if (!action.disabled) {
                                  setSelectedActionId(action.id);
                                }
                              }}
                              className={cn(
                                'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                                isSelected
                                  ? 'bg-sea/10 text-sea dark:bg-accent-blue/15 dark:text-accent-blue'
                                  : 'text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15',
                                action.disabled && 'cursor-not-allowed opacity-40'
                              )}
                            >
                              <div className='flex min-w-0 items-center gap-3'>
                                {action.icon ? (
                                  <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sand/10 text-text-secondary dark:bg-sand/20 dark:text-text-secondary'>
                                    {action.icon}
                                  </span>
                                ) : null}
                                <div className='min-w-0'>
                                  <p className='truncate text-sm font-medium'>{action.title}</p>
                                  {action.description ? (
                                    <p className='truncate text-xs text-text-secondary dark:text-text-secondary'>{action.description}</p>
                                  ) : null}
                                </div>
                              </div>
                              {action.shortcut && action.shortcut.length > 0 ? <Kbd keys={action.shortcut} /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={className}>
      {renderTrigger}
      {renderOverlay}
    </div>
  );
}
