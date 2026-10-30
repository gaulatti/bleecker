'use client';

import React from 'react';

import type { MetricFormat } from '../core';
import { cn } from '../utils/cn';
import { formatNumber, formatCurrency, formatPercent, formatCompact } from '../utils/format';

export type { MetricFormat } from '../core';

export interface MetricProps {
  value: number | undefined | null;
  format?: MetricFormat;
  currency?: string;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  decimals?: number;
}

export function Metric({ value, format = 'number', currency = 'USD', className, prefix, suffix, decimals }: MetricProps) {
  const formatted = React.useMemo(() => {
    const options = decimals !== undefined ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {};
    switch (format) {
      case 'currency':
        return formatCurrency(value, currency, options);
      case 'percent':
        return formatPercent(value, options);
      case 'compact':
        return formatCompact(value, options);
      case 'number':
      default:
        return formatNumber(value, options);
    }
  }, [value, format, currency, decimals]);

  return (
    <span className={cn('tabular-nums tracking-refined', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
