# Search Input

Single-line search entry for public content discovery, local list filtering, and support lookup with visible submit and clear actions.

## Category

`form`

## Usage

- Use when the user needs to enter a query and intentionally submit it.
- Use the clear action to make recovery obvious after a query narrows the current surface.
- Keep placeholder copy example-oriented; the visible label still names what is being searched.

## Decision Guidance

- Use when a query should be submitted or cleared as a distinct user action.
- Use Input type=search only for very small forms where submit and clear behavior are owned elsewhere.

## Composition

- Pair with List, Empty State, Alert, Pagination, or Toolbar when search changes a nearby content collection.
- Keep result count, empty result recovery, and filters outside the component so search remains a small primitive.

## Anti-patterns

- Do not use Search Input as autocomplete, command palette, filter builder, global app search, or search result page.
- Do not rely on placeholder-only scope; users must see what collection or support area they are searching.

## States

| State | Description |
| --- | --- |
| Empty | The query field and submit action remain visible without implying a result state. |
| Has value | Clear action appears only when there is a query to remove. |
| Submitted | Submit emits the trimmed query while the component does not own result rendering. |
| Invalid | Invalid state keeps the visible submit path while linking repair copy through aria-describedby. |
| Disabled | Input, clear, and submit actions are disabled together while preserving layout. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `string` | '' | No | Controlled search query value. |
| `label` | `string` | 'Search' | No | Visible label naming the searchable content scope. |
| `description` | `string` | - | No | Helper copy linked to the native search input. |
| `invalidMessage` | `string` | - | No | Actionable query repair message linked to the native search input. |
| `placeholder` | `string` | 'Search' | No | Example query or short input hint. |
| `buttonLabel` | `string` | 'Search' | No | Visible submit button label. |
| `clearLabel` | `string` | 'Clear search' | No | Accessible label for the clear query button. |
| `disabled` | `boolean` | false | No | Disables query editing, clearing, and submission. |

## Accessibility

- Uses form role=search and a native input type=search.
- The visible label names the searchable scope, while helper and invalid copy are linked through aria-describedby.
- Clear and submit are native buttons with separate labels so keyboard users can recover or submit intentionally.

## Storybook Contract

- Must consume `publicComponentDocs.SearchInput` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
