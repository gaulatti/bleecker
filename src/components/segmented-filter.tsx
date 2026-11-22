import { cn } from '../utils/cn';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

export interface SegmentedFilterOption {
  /** Shown after the label, in tabular numerals. */
  count?: number;
  label: string;
  value: string;
}

export interface SegmentedFilterProps {
  className?: string;
  /** Names the group for assistive technology. */
  label: string;
  onChange: (value: string) => void;
  options: SegmentedFilterOption[];
  value: string;
}

/**
 * One choice of several, always one chosen: a segmented filter built on ToggleGroup. Pressing the
 * chosen segment again keeps it chosen (a filter has no "none").
 */
export function SegmentedFilter({ className, label, onChange, options, value }: SegmentedFilterProps) {
  return (
    <div role='group' aria-label={label} className={cn('inline-flex', className)}>
      <ToggleGroup
        type='single'
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        size='sm'
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined ? <span className='font-mono text-[11px] tabular-nums text-text-secondary'>{option.count}</span> : null}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
