import React from 'react';

import { ToggleGroup, ToggleGroupItem } from '../../src/components/toggle-group';
import { ThemeProvider } from '../../src/theme/theme-provider';
import type { ThemeMode } from '../../src/theme/types';

/**
 * A segmented control in the outline style (gaulatti/bleecker#557): Day, Week and Month in one
 * group. The group draws the one rounded outline and the dividers; hovering, focusing or choosing
 * a segment changes only its colour.
 */
export function SegmentedOutlineFixture({ theme }: { theme: Exclude<ThemeMode, 'system'> }) {
  const [range, setRange] = React.useState('day');
  return (
    <ThemeProvider theme={theme} onThemeChange={() => {}}>
      <div className='space-y-4 p-6 text-text-primary'>
        <p>Segmented control · {theme}</p>
        <button type='button' data-focus-start>
          Before the control
        </button>
        <div data-segmented>
          <ToggleGroup type='single' variant='outline' size='sm' value={range} onValueChange={(next) => next && setRange(next)}>
            <ToggleGroupItem value='day'>Day</ToggleGroupItem>
            <ToggleGroupItem value='week'>Week</ToggleGroupItem>
            <ToggleGroupItem value='month'>Month</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </ThemeProvider>
  );
}
