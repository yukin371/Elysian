# List

Flat structured list primitive for settings rows, content indexes, activity summaries, and lightweight navigation where repeated information should stay readable without becoming a stack of cards.

## Category

`content`

## Usage

- Use List when several peer items share the same structure and should scan as one surface.
- Use href only when the row genuinely navigates; otherwise keep the item as static content and put actions nearby.
- Use compact density for side panels, account history, and mobile review lanes where vertical space is constrained.

## Decision Guidance

- Use when a group of peer items needs one readable rhythm instead of many nested cards.
- Use Card when the whole group is a featured surface, Timeline when chronological order is the message, and Tabs when the user switches local sections.

## Composition

- Pair with Badge, Text, Link, Alert, or a single Button row when the list needs status, support copy, or one recovery path.
- Place inside a parent Card or section only once; the rows themselves should use dividers and spacing rather than new card shells.

## Anti-patterns

- Do not use List as a full route menu, data table, or unbounded activity feed with live updating behavior.
- Do not make disabled or current rows rely on color alone; labels must explain why the item is unavailable or selected.

## States

| State | Description |
| --- | --- |
| Plain row | Static rows present title, optional meta, and optional description without introducing a new action surface. |
| Linked row | Rows with href render as anchors with a trailing affordance while preserving list semantics. |
| Current and disabled | Current rows expose aria-current for links, while disabled rows stay visible but are not navigable. |
| Comfortable and compact | Density changes spacing only; it does not change the row contract or turn the list into navigation tabs. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicListItem[]` | - | Yes | Ordered row items with key, title, optional meta, optional description, optional href, optional current/disabled flags, and optional tone. |
| `density` | `'comfortable' \| 'compact'` | 'comfortable' | No | Controls row rhythm for normal content lanes or denser review/history lanes. |
| `divided` | `boolean` | true | No | Shows subtle separators between rows instead of making every row a separate card. |
| `ariaLabel` | `string` | 'List' | No | Accessible label for the structured list section. |

## Accessibility

- Uses a semantic list so repeated rows remain understandable as one grouped collection.
- Rows with href render as native anchors; current linked rows expose aria-current=page.
- Tone and marker are supplemental; row title and description must carry status or destination meaning.

## Storybook Contract

- Must consume `publicComponentDocs.List` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
