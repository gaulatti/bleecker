# Dense DataTable and detail Drawer

bleecker#552 adds two opt-in variants from the bleecker#549 proposal (phase 1).
Without the new props both components render exactly as before;
`tests/unit/dense-detail-variants.test.tsx` holds snapshots of the default
markup recorded before the variants existed.

## `DataTable density="dense"`

`<DataTable density="dense" selectedKey onRowClick stickyHeader />`

- `density`: `'default'` (52px rows, unchanged) or `'dense'`. Dense draws 40px
  rows (`h-10`), 36px header cells, tighter cell padding and `tabular-nums` for
  the whole table.
- `selectedKey`: the one row tinted as selected (`data-selected="true"`). It
  adds to checkbox selection (`selectedKeys`). With `onRowClick`, rows also carry
  `aria-selected`.
- `onRowClick(row, index)`: makes each row clickable and focusable; Enter or
  Space on a focused row also calls it. A click on a row's selection checkbox
  does not.
- `stickyHeader`: the header stays visible while the rows scroll. The outer
  container becomes the scroll container, so bound its height through
  `containerClassName` (for example `max-h-[60dvh]`).
- State pills: render them through the column's `cell`, for example
  `cell: (row) => <StatusBadge label={row.state} variant="live" />`.

Story: `Components/Table/Dense`. Any density works with any other prop.

## `Drawer variant="detail"`

`<Drawer variant="detail" open onClose width="22rem" />`

A panel docked beside a list. It renders in place as an `<aside>` named by its
`title` (or "Details"), with no overlay, no portal and no focus trap, so focus
stays in the list. `open` or `isOpen` shows it; `width` defaults to `22rem`. The
close button ("Close details") calls `onClose`. See
[modal-keyboard-lifecycle.md](modal-keyboard-lifecycle.md) for the default
bottom sheet, which is unchanged.

Story: `Components/Drawer/Detail`.
