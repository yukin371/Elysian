# Divider

Section rhythm primitive for separating content lanes without adding another card or heading layer.

## Category

`content`

## Usage

- Use dividers to mark rhythm changes inside a surface.
- Use labels sparingly; they should not compete with real section headings.
- Use accent only when the division itself carries product meaning.

## Decision Guidance

- Use when content needs a rhythm break without adding another surface or heading.
- Use labels only when the break itself clarifies review, archive, or handoff context.

## Composition

- Pair with Text, Stat groups, or Card internals to separate local sections.
- Use accent only for meaningful transition points, not visual variety.

## Anti-patterns

- Do not replace structural headings with labeled dividers.
- Do not add dividers between every small element just to create density.

## States

| State | Description |
| --- | --- |
| Plain | Simple separator line for low-emphasis grouping. |
| Labeled | Inline label explains the break without adding a heading. |
| Alignment | start, center, and end align labels to fit editorial layout. |
| Accent | Higher-emphasis divider for review or hand-off moments. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `align` | `'center' \| 'end' \| 'start'` | 'center' | No | Label alignment when a label exists. |
| `label` | `string` | - | No | Optional inline divider label. |
| `tone` | `'accent' \| 'default'` | 'default' | No | Visual emphasis level. |

## Accessibility

- Uses role=separator.
- Decorative lines are hidden from assistive technology.
- Labels should be concise and not replace structural headings.

## Storybook Contract

- Must consume `publicComponentDocs.Divider` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
