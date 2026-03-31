import * as React from 'react';
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartProps {
  data: any[];
  height?: number;
}

export function Chart({ data, height = 300 }: ChartProps) {
  return (
    <div className='w-full' style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis
            dataKey='name'
            stroke='#1a374d' // color-sea idea
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke='#1a374d' fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)'
            }}
            itemStyle={{ color: '#1a374d' }}
          />
          <Line
            type='monotone'
            dataKey='total'
            stroke='#c8825f' // color-terracotta or similar accent
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#c8825f', stroke: '#fff', strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
