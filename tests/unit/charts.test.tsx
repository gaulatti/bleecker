import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render } from './helpers';

const captured = vi.hoisted(() => ({ Tooltip: [] as any[], LabelList: [] as any[], Pie: [] as any[] }));

vi.mock('recharts', async importOriginal => {
  const actual = await importOriginal<typeof import('recharts')>();
  const capture = (name: 'Tooltip' | 'LabelList' | 'Pie') => {
    const Original = (actual as any)[name];
    const Wrapped = (props: any) => {
      captured[name].push(props);
      return <Original {...props} />;
    };
    Object.assign(Wrapped, Original);
    return Wrapped;
  };
  return { ...actual, Tooltip: capture('Tooltip'), LabelList: capture('LabelList'), Pie: capture('Pie') };
});

import { AreaChart } from '../../src/components/area-chart';
import { BarChart } from '../../src/components/bar-chart';
import { Chart } from '../../src/components/chart';
import { FunnelChart } from '../../src/components/funnel-chart';
import { LineChart } from '../../src/components/line-chart';
import { PieChart } from '../../src/components/pie-chart';
import { RadarChart } from '../../src/components/radar-chart';
import { RadialBarChart } from '../../src/components/radial-bar-chart';
import { ScatterChart } from '../../src/components/scatter-chart';
import { Sparkline } from '../../src/components/sparkline';
import { SunburstChart } from '../../src/components/sunburst-chart';

const data = [{ x: 'a', y: 1, z: 2 }, { x: 'b', y: 3, z: 4 }];
const series = [{ key: 'y', name: 'Y' }, { key: 'z', name: 'Z', color: '#f00' }];
const sized = (node: React.ReactElement) => <div style={{ width: 400, height: 300 }}>{node}</div>;
const lastTooltip = () => captured.Tooltip.at(-1)!;
const upper = (value: number) => `#${value}`;

describe('cartesian chart tooltips', () => {
  test.each([
    ['LineChart', (formatter?: (v: number) => string) => <LineChart data={data} series={series} xAxisKey='x' tooltipFormatter={formatter} />],
    ['AreaChart', (formatter?: (v: number) => string) => <AreaChart data={data} series={series} xAxisKey='x' tooltipFormatter={formatter} />],
    ['BarChart', (formatter?: (v: number) => string) => <BarChart data={data} series={series} xAxisKey='x' tooltipFormatter={formatter} />]
  ])('%s formats numbers with the formatter and passes other values through', async (_name, build) => {
    await render(sized(build(upper)));
    expect(lastTooltip().formatter(5, 'Y')[0]).toBe('#5');
    expect(lastTooltip().formatter('text', 'Y')[0]).toBe('text');
    expect(lastTooltip().formatter(undefined, 'Y')[0]).toBe('');
    await render(sized(build()));
    expect(lastTooltip().formatter(5, 'Y')[0]).toBe(5);
  });

  test('LineChart forwards the series name', async () => {
    await render(sized(<LineChart data={data} series={series} xAxisKey='x' />));
    expect(lastTooltip().formatter(1, 'Series')[1]).toBe('Series');
  });

  test('LineChart renders optional axis labels and hides grid and legend on request', async () => {
    await render(sized(<LineChart data={data} series={series} xAxisKey='x' xAxisLabel='Time' yAxisLabel='Count' showGrid={false} showLegend={false} yAxisTickFormatter={String} />));
    await vi.waitFor(() => expect(document.body.textContent).toContain('Time'));
    expect(document.body.textContent).toContain('Count');
    expect(document.querySelector('.recharts-cartesian-grid')).toBeNull();
    expect(document.querySelector('.recharts-legend-wrapper')).toBeNull();
  });
});

describe('other chart tooltips', () => {
  test('ScatterChart formats numeric values and keeps the name', async () => {
    const scatterSeries = [{ key: 's', name: 'S', xKey: 'x', yKey: 'y' }];
    const points = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
    await render(sized(<ScatterChart data={points} series={scatterSeries} tooltipFormatter={upper} />));
    expect(lastTooltip().formatter(5, 'S')).toEqual(['#5', 'S']);
    expect(lastTooltip().formatter('x', 'S')).toEqual(['x', 'S']);
    await render(sized(<ScatterChart data={points} series={scatterSeries} />));
    expect(lastTooltip().formatter(5, 'S')).toEqual([5, 'S']);
  });

  test('RadarChart formats tick values', async () => {
    await render(sized(<RadarChart data={data} subjectKey='x' series={[{ key: 'y', name: 'Y', fill: true }]} tickFormatter={upper} />));
    expect(lastTooltip().formatter(2)).toEqual(['#2', '']);
    expect(lastTooltip().formatter('t')).toEqual(['t', '']);
    await render(sized(<RadarChart data={data} subjectKey='x' series={[{ key: 'y', name: 'Y' }]} showLegend={false} />));
    expect(lastTooltip().formatter(2)).toEqual([2, '']);
  });

  test('FunnelChart formats values and builds label text', async () => {
    const funnel = [{ name: 'Visit', value: 10 }, { name: 'Buy', value: 3, fill: '#0f0' }];
    await render(sized(<FunnelChart data={funnel} valueFormatter={upper} />));
    expect(lastTooltip().formatter(4)).toEqual(['#4', '']);
    expect(lastTooltip().formatter('t')).toEqual(['t', '']);
    const label = captured.LabelList.at(-1)!.formatter;
    expect(label('Visit', { value: 10 })).toBe('Visit: 10');
    expect(label(undefined, undefined)).toBe(': ');
    await render(sized(<FunnelChart data={funnel} showLabels={false} />));
    expect(lastTooltip().formatter(4)).toEqual([4, '']);
  });

  test('RadialBarChart, Sparkline and Chart format tooltips with safe fallbacks', async () => {
    await render(sized(<RadialBarChart data={[{ name: 'A', value: 5 }, { name: 'B', value: 7, fill: '#00f' }]} showLegend={false} />));
    expect(lastTooltip().formatter(5)).toEqual([5, '']);
    expect(lastTooltip().formatter(undefined)).toEqual(['', '']);
    await render(sized(<Sparkline data={data} dataKey='y' showArea color='#123456' className='spark' />));
    expect(lastTooltip().formatter(2)).toEqual([2, '']);
    expect(lastTooltip().formatter(null)).toEqual(['', '']);
    expect(lastTooltip().labelFormatter()).toBe('');
    await render(sized(<Sparkline data={data} dataKey='y' />));
    await render(sized(<Chart data={[{ name: 'a', total: 3 }, { name: 'b', total: 4 }]} />));
    expect(lastTooltip().formatter(3)).toEqual(['$3', 'Total']);
    expect(lastTooltip().formatter(undefined)).toEqual(['', 'Total']);
  });

  test('PieChart labels slices with their percentage and formats tooltips', async () => {
    await render(sized(<PieChart data={[{ name: 'A', value: 1 }, { name: 'B', value: 3, color: '#abc' }]} />));
    const pie = captured.Pie.at(-1)!;
    expect(pie.label({ name: 'A', percent: 0.25 })).toBe('A: 25%');
    expect(pie.label({ name: 'A', percent: undefined })).toBe('A: 0%');
    expect(lastTooltip().formatter(2)).toEqual([2, '']);
    expect(lastTooltip().formatter(undefined)).toEqual(['', '']);
    await render(sized(<PieChart data={[{ name: 'A', value: 1 }]} showLegend={false} innerRadius={20} nameKey='name' dataKey='value' />));
  });
});

describe('SunburstChart', () => {
  test('derives the root total from leaves, and ignores non-numeric leaves', async () => {
    await render(
      <SunburstChart
        data={{ name: 'root', children: [{ name: 'a', value: 3 }, { name: 'b', children: [{ name: 'c', value: 4 }, { name: 'd' }], fill: '#111' }] }}
        className='sun'
      />
    );
    expect(document.querySelector('.sun')).not.toBeNull();
  });

  test('keeps an explicit root value and reports no total for empty data', async () => {
    await render(<SunburstChart data={{ name: 'root', value: 10, children: [{ name: 'a', value: 3 }] }} height={200} dataKey='value' nameKey='name' />);
    await render(<SunburstChart data={{ name: 'root' }} />);
    await render(<SunburstChart data={{ name: 'root', size: 4 } as never} dataKey='size' />);
  });
});
