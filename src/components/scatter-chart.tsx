import * as React from 'react';
import { CartesianGrid, Legend, ResponsiveContainer, Scatter as RechartsScatter, ScatterChart as RechartsScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';

import { chartTheme } from './chart-theme';

export interface ScatterSeries {
  key: string;
  name: string;
  xKey: string;
  yKey: string;
  zKey?: string;
  color?: string;
}

export interface ScatterChartProps {
  data: Record<string, unknown>[];
  height?: number;
  series: ScatterSeries[];
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisTickFormatter?: (value: number | string) => string;
  yAxisTickFormatter?: (value: number | string) => string;
  tooltipFormatter?: (value: number) => string;
}

export function ScatterChart({
  data,
  height = 350,
  series,
  showGrid = true,
  showLegend = true,
  xAxisTickFormatter,
  yAxisTickFormatter,
  tooltipFormatter
}: ScatterChartProps) {
  return (
    <div className='w-full' style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <RechartsScatterChart margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          {showGrid && <CartesianGrid stroke={chartTheme.grid.stroke} strokeDasharray={chartTheme.grid.strokeDasharray} />}
          <XAxis
            type='number'
            dataKey={(entry: Record<string, unknown>) => entry[series[0].xKey] as number}
            stroke={chartTheme.axis.stroke}
            tick={chartTheme.axis.tick}
            tickLine={false}
            axisLine={false}
            tickFormatter={xAxisTickFormatter}
          />
          <YAxis
            type='number'
            dataKey={(entry: Record<string, unknown>) => entry[series[0].yKey] as number}
            stroke={chartTheme.axis.stroke}
            tick={chartTheme.axis.tick}
            tickLine={false}
            axisLine={false}
            tickFormatter={yAxisTickFormatter}
          />
          <ZAxis type='number' dataKey={(entry: Record<string, unknown>) => (series[0].zKey ? entry[series[0].zKey] : 1) as number} range={[60, 400]} />
          <Tooltip
            {...chartTheme.tooltip}
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value) => [tooltipFormatter && typeof value === 'number' ? tooltipFormatter(value) : value, '']}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '1rem' }} />}
          {series.map((s, i) => (
            <RechartsScatter
              key={s.key}
              name={s.name}
              data={data}
              fill={s.color ?? chartTheme.palette[i % chartTheme.palette.length]}
            />
          ))}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
