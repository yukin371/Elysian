# Table

Read-only structured table primitive for public comparisons, specifications, reward matrices, and compact audit snapshots that need rows and columns without becoming an enterprise data grid.

## Category

`content`

## Usage

- Use Table when users need to compare several attributes across rows or scan a small structured matrix.
- Keep rows bounded and readable; if the user needs sorting, filtering, selection, or row actions, use a future dedicated data-grid component or the enterprise preset.
- Use caption and description so the table has a clear reading purpose before users enter the cells.

## Decision Guidance

- Use when row and column comparison is the primary reading job, such as tiers, specifications, eligibility, or review snapshots.
- Use DescriptionList for one object's facts, List for peer rows, and the enterprise preset or a future data grid when users need sorting, filtering, selection, or row actions.

## Composition

- Pair with Text, Badge, Alert, Divider, or a single support Link when the comparison needs interpretation or recovery context.
- Place one table inside the current section; do not wrap every row, column group, or status cell in extra cards.

## Anti-patterns

- Do not use Table as an editable grid, CRUD workspace, spreadsheet, route menu, pricing wizard, or async data explorer.
- Do not rely on row tone alone for risk, success, or warning; the cell text must name the meaning.

## States

| State | Description |
| --- | --- |
| Captioned | Visible caption and helper copy frame why the comparison exists before the row data begins. |
| Comfortable and compact | Density changes cell padding only; it does not add data-grid behavior or hidden controls. |
| Aligned columns | Column alignment can support numeric or short status cells while preserving native table semantics. |
| Semantic rows | Row tone can flag one bounded outcome, but the cell text must still name success, risk, or warning. |
| Empty rows | An empty row preserves caption, headers, and table structure while explaining that there is nothing to compare yet. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `columns` | `ElyPublicTableColumn[]` | - | Yes | Ordered columns with key, label, optional description, and optional start/center/end alignment. |
| `rows` | `ElyPublicTableRow[]` | - | Yes | Ordered read-only rows with key, cell values keyed by column, and optional semantic tone. |
| `caption` | `string` | - | No | Visible table title that is also exposed through a native caption. |
| `description` | `string` | - | No | Supporting copy that explains the table's review purpose. |
| `density` | `'comfortable' \| 'compact'` | 'comfortable' | No | Controls cell rhythm for default comparison surfaces or compact review snapshots. |
| `emptyMessage` | `string` | 'No rows to compare yet.' | No | Visible copy shown in a single table row when rows is empty; keep it factual and non-decorative. |

## Accessibility

- Uses native table, thead, tbody, th, td, and caption semantics for structured reading.
- The scroll wrapper is focusable so keyboard users can reach horizontally overflowing tables on narrow screens.
- Empty rows use one cell spanning the available columns, preserving table context for screen-reader and keyboard users.
- Row tone is supplemental; cells must contain text that names the status or consequence without relying on color.

## Storybook Contract

- Must consume `publicComponentDocs.Table` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
