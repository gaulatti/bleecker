'use client';

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import type { AlertType } from '../core';
import { cn } from '../utils/cn';

export type { AlertType } from '../core';

export interface AlertProps {
  className?: string;
  duration?: number;
  message: string;
  onClose: () => void;
  type?: AlertType;
}

interface AlertConfigValue {
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor: string;
  textColor: string;
}

const alertConfig: Record<AlertType, AlertConfigValue> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-white dark:bg-deep-sea',
    borderColor: 'border-sea/25 dark:border-accent-blue/25',
    textColor: 'text-text-primary dark:text-text-primary',
    iconColor: 'text-sea dark:text-accent-blue'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-white dark:bg-deep-sea',
    borderColor: 'border-terracotta/25 dark:border-terracotta/30',
    textColor: 'text-text-primary dark:text-text-primary',
    iconColor: 'text-terracotta dark:text-terracotta'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-white dark:bg-deep-sea',
    borderColor: 'border-sunset/30 dark:border-sunset/20',
    textColor: 'text-text-primary dark:text-text-primary',
    iconColor: 'text-sunset dark:text-accent-gold'
  },
  info: {
    icon: Info,
    bgColor: 'bg-white dark:bg-deep-sea',
    borderColor: 'border-desert/25 dark:border-desert/25',
    textColor: 'text-text-primary dark:text-text-primary',
    iconColor: 'text-desert dark:text-accent-gold'
  }
};

export function Alert({ className, duration = 5000, message, onClose, type = 'info' }: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    if (duration <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      handleClose();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);

    window.setTimeout(onClose, 220);
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className='pointer-events-none fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-24'>
      <div
        className={cn(
          'pointer-events-auto w-full max-w-md rounded-[var(--radius-card)] border shadow-[var(--shadow-overlay)] transition-[opacity,transform] duration-[var(--motion-surface)] ease-premium',
          config.bgColor,
          config.borderColor,
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
          className
        )}
      >
        <div className='flex items-start gap-3 p-4'>
          <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconColor)} />
          <p className={cn('flex-1 text-sm font-medium leading-6', config.textColor)}>{message}</p>
          <button
            type='button'
            onClick={handleClose}
            className={cn('-mr-1 -mt-0.5 scale-100 rounded-md p-1 transition-[background-color,transform] duration-[var(--motion-control)] ease-premium hover:bg-black/5 active:scale-[0.9] dark:hover:bg-white/10', config.textColor)}
            aria-label='Close alert'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface AlertState {
  id: string;
  message: string;
  type: AlertType;
}

type AlertListener = (alerts: AlertState[]) => void;

let alertsState: AlertState[] = [];
let listeners: AlertListener[] = [];
// Each alert is shown by exactly one container: the first one mounted when it
// is raised, or, when none is mounted yet, the first one to mount. An alert
// stays with its container until it closes or the container unmounts.
const ownerOf = new Map<string, AlertListener>();

function alertsOwnedBy(listener: AlertListener) {
  return alertsState.filter((alert) => ownerOf.get(alert.id) === listener);
}

function notifyListeners() {
  listeners.forEach((listener) => listener(alertsOwnedBy(listener)));
}

export function showAlert(message: string, type: AlertType = 'info') {
  const id = Math.random().toString(36).substring(2, 9);
  alertsState.push({ id, message, type });
  if (listeners.length > 0) {
    ownerOf.set(id, listeners[0]);
  }
  notifyListeners();
}

export function AlertContainer() {
  const [alerts, setAlerts] = React.useState<AlertState[]>([]);
  // One listener per container instance, kept across React StrictMode's
  // simulated remount so the container keeps the alerts it already claimed.
  const listenerRef = React.useRef<AlertListener | null>(null);
  listenerRef.current ??= (nextAlerts: AlertState[]) => setAlerts(nextAlerts);

  React.useEffect(() => {
    const listener = listenerRef.current!;
    listeners.push(listener);
    // Claim the alerts raised while no container was mounted.
    for (const alert of alertsState) {
      if (!ownerOf.has(alert.id)) {
        ownerOf.set(alert.id, listener);
      }
    }
    listener(alertsOwnedBy(listener));

    return () => {
      listeners = listeners.filter((entry) => entry !== listener);
      // Drop what this container showed once it has really unmounted; a
      // StrictMode remount subscribes the same listener again first.
      queueMicrotask(() => {
        if (listeners.includes(listener)) {
          return;
        }
        alertsState = alertsState.filter((alert) => {
          if (ownerOf.get(alert.id) !== listener) {
            return true;
          }
          ownerOf.delete(alert.id);
          return false;
        });
      });
    };
  }, []);

  const removeAlert = (id: string) => {
    alertsState = alertsState.filter((alert) => alert.id !== id);
    ownerOf.delete(id);
    notifyListeners();
  };

  return (
    <>
      {alerts.map((alert) => (
        <Alert key={alert.id} message={alert.message} onClose={() => removeAlert(alert.id)} type={alert.type} />
      ))}
    </>
  );
}
