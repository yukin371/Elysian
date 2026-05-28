# Pagination

Paged collection navigation primitive for public lists, archives, reviews, and search results where users need bounded movement without confusing pagination with progress.

## Category

`navigation`

## Usage

- Use Pagination when a collection is split into stable pages and the user needs to move through nearby results.
- Keep page counts bounded and understandable; use a different pattern for infinite feeds or live streams.
- Place Pagination near the affected collection so previous and next actions feel local to that list.

## Decision Guidance

- Use when the user moves through a bounded list, archive, search result, or review history page by page.
- Use pageLabel, currentPageLabel, and ellipsisLabel when the surrounding product language is localized or domain-specific.
- Use Progress instead when the number describes completion, and Tabs when the user switches local sections.

## Composition

- Pair with Text or Stat to state the result range, and place near the collection it controls.
- Use after cards, editorial lists, or history rows without wrapping the control in another decorative card.

## Anti-patterns

- Do not use Pagination as a wizard stepper, progress meter, or category filter.
- Do not show huge uncollapsed page ranges that force horizontal scrolling on mobile.

## States

| State | Description |
| --- | --- |
| Current page | The active page is marked with aria-current=page and a stronger but still governed theme surface. |
| Previous and next | Previous and next buttons disable at the beginning and end of the bounded page range. |
| Ellipsis | Large page ranges collapse distant pages while keeping the first, last, and nearby pages visible; the skipped range has screen-reader text. |
| Compact wrapping | The control wraps on narrow public surfaces instead of creating horizontal overflow. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `pageCount` | `number` | - | Yes | Total number of pages in the bounded collection. |
| `modelValue` | `number` | 1 | No | Controlled current page number. |
| `ariaLabel` | `string` | 'Pagination' | No | Accessible label for the pagination navigation region. |
| `previousLabel` | `string` | 'Previous page' | No | Visible label for the previous-page button. |
| `nextLabel` | `string` | 'Next page' | No | Visible label for the next-page button. |
| `pageLabel` | `string` | 'Page' | No | Accessible prefix used when announcing individual page buttons. |
| `currentPageLabel` | `string` | 'Current page' | No | Accessible prefix added to the current page button label. |
| `ellipsisLabel` | `string` | 'Skipped pages' | No | Screen-reader-only text for collapsed page ranges. |

## Accessibility

- Uses a nav landmark so the control is announced as collection navigation.
- The current page exposes aria-current=page and remains reachable in the page list.
- Page, current page, and ellipsis labels are configurable so localized public pages do not inherit hard-coded English announcements.
- Previous and next use native disabled behavior at collection boundaries.

## Storybook Contract

- Must consume `publicComponentDocs.Pagination` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
