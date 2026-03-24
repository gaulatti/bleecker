import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

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
    bgColor: 'bg-sea/10 dark:bg-accent-blue/10',
    borderColor: 'border-sea dark:border-accent-blue',
    textColor: 'text-sea dark:text-accent-blue',
    iconColor: 'text-sea dark:text-accent-blue'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-terracotta/10 dark:bg-terracotta/20',
    borderColor: 'border-terracotta dark:border-accent-oxblood',
    textColor: 'text-terracotta dark:text-terracotta',
    iconColor: 'text-terracotta dark:text-terracotta'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-sunset/10 dark:bg-sunset/20',
    borderColor: 'border-sunset dark:border-accent-gold',
    textColor: 'text-desert dark:text-accent-gold',
    iconColor: 'text-sunset dark:text-accent-gold'
  },
  info: {
    icon: Info,
    bgColor: 'bg-desert/10 dark:bg-accent-gold/10',
    borderColor: 'border-desert dark:border-accent-gold',
    textColor: 'text-text-primary dark:text-text-primary',
    iconColor: 'text-desert dark:text-accent-gold'
  }
};

export function Alert({ className, duration = 5000, message, onClose, type = 'info' }: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

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

    if (typeof window === 'undefined') {
      onClose();
      return;
    }

    window.setTimeout(onClose, 300);
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className='pointer-events-none fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-24'>
      <div
        className={cn(
          'pointer-events-auto w-full max-w-md rounded-lg border-l-4 shadow-lg backdrop-blur-xl transition-all duration-400 ease-out dark:shadow-2xl',
          config.bgColor,
          config.borderColor,
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
          className
        )}
      >
        <div className='flex items-start gap-3 p-4'>
          <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconColor)} />
          <p className={cn('flex-1 text-sm font-medium tracking-refined', config.textColor)}>{message}</p>
          <button
            type='button'
            onClick={handleClose}
            className={cn('hover:bg-black/5 dark:hover:bg-white/10 -mr-1 -mt-0.5 rounded-md p-1 transition-colors duration-200', config.textColor)}
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

let alertsState: AlertState[] = [];
let listeners: Array<(alerts: AlertState[]) => void> = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...alertsState]));
}

export function showAlert(message: string, type: AlertType = 'info') {
  const id = Math.random().toString(36).substring(2, 9);
  alertsState.push({ id, message, type });
  notifyListeners();
}

export function AlertContainer() {
  const [alerts, setAlerts] = React.useState<AlertState[]>([]);

  React.useEffect(() => {
    const listener = (nextAlerts: AlertState[]) => {
      setAlerts(nextAlerts);
    };

    listeners.push(listener);

    return () => {
      listeners = listeners.filter((entry) => entry !== listener);
    };
  }, []);

  const removeAlert = (id: string) => {
    alertsState = alertsState.filter((alert) => alert.id !== id);
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
