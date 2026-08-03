import * as React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { chartTheme, type ChartSeries } from './chart-theme';

export interface LineChartProps {
  data: Record<string, unknown>[];
  height?: number;
  series: ChartSeries[];
  xAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  yAxisTickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
}

export function LineChart({
  data,
  height = 300,
  series,
  xAxisKey,
  showGrid = true,
  showLegend = true,
  yAxisTickFormatter,
  tooltipFormatter
}: LineChartProps) {
  return (
    <div className='w-full' style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <RechartsLineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          {showGrid && <CartesianGrid stroke={chartTheme.grid.stroke} strokeDasharray={chartTheme.grid.strokeDasharray} vertical={false} />}
          <XAxis
            dataKey={xAxisKey}
            stroke={chartTheme.axis.stroke}
            tick={chartTheme.axis.tick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={chartTheme.axis.stroke}
            tick={chartTheme.axis.tick}
            tickLine={false}
            axisLine={false}
            tickFormatter={yAxisTickFormatter}
          />
          <Tooltip
            {...chartTheme.tooltip}
            formatter={(value, name) => [
              tooltipFormatter && typeof value === 'number' ? tooltipFormatter(value) : value ?? '',
              name
            ]}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '1rem' }} />}
          {series.map((s, i) => (
            <Line
              key={s.key}
              type='monotone'
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? chartTheme.palette[i % chartTheme.palette.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-card)' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
