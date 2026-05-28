# DescriptionList

Semantic description-list primitive for profile facts, order summaries, event rules, and compact specification blocks where label-value pairs should read as one information surface instead of many tiny cards.

## Category

`content`

## Usage

- Use DescriptionList when users need to scan stable facts, attributes, constraints, or summary fields.
- Keep labels short and values meaningful; move long explanations into Text, Alert, Accordion, or a support route.
- Use tone sparingly to mark one or two important facts, not to recolor every row.

## Decision Guidance

- Use when the content is a stable set of label-value facts and the relationship between label and value is the primary meaning.
- Use Stat when one number drives a decision, List when rows are peer entries, and Timeline when order over time is the story.

## Composition

- Pair with Text, Badge, Alert, Divider, or a single support Link when a fact needs interpretation or recovery context.
- Place inside the current surface as one information block; do not wrap each label-value pair in its own card.

## Anti-patterns

- Do not use DescriptionList for editable forms, sortable tables, timeline events, or action-heavy settings rows.
- Do not use long paragraph values that make the label-value relationship hard to scan.

## States

| State | Description |
| --- | --- |
| Single column | Single column keeps dense or narrow detail groups readable without forcing horizontal comparison. |
| Double column | Double column supports compact profile or summary surfaces when facts are short and comparable. |
| Comfortable and compact | Density changes spacing and value type scale while preserving the same semantic dl contract. |
| Semantic tones | Primary, accent, muted, success, and warning tones can highlight fact importance without becoming status badges. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicDescriptionItem[]` | - | Yes | Ordered description items with key, label, value, optional description, and optional semantic tone. |
| `columns` | `'single' \| 'double'` | 'double' | No | Controls one-column reading rhythm or two-column compact summary layout. |
| `density` | `'comfortable' \| 'compact'` | 'comfortable' | No | Controls spacing for editorial detail blocks or compact account summaries. |
| `ariaLabel` | `string` | 'Details' | No | Accessible label for the detail section. |

## Accessibility

- Uses native dl, dt, and dd elements so label-value relationships remain available to assistive technology.
- Tone is supplemental; labels and values must communicate meaning without relying on color.
- Do not place interactive controls inside value text unless the surrounding pattern owns that interaction and labels it clearly.

## Storybook Contract

- Must consume `publicComponentDocs.DescriptionList` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
