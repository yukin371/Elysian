# Stat

Compact summary block for public dashboards, hero strips, and content cards where one headline metric needs supporting context without reverting to ad hoc markup.

## Category

`content`

## Usage

- Use Stat for short, high-signal summaries such as theme counts, conversion health, or release readiness.
- Keep the value concise and pair it with a label that explains what the number or phrase represents.
- Use helper text for brief context only; if the explanation becomes long, move it into a card or detail lane.

## Decision Guidance

- Use when one compact metric helps the user judge readiness, scarcity, progress, or quality.
- Use accent for one lead metric only; companion stats should usually be primary or muted.

## Composition

- Pair with Progress when the number describes completion or capacity.
- Group two to four Stats inside Card or hero support lanes, then explain the metric with helper text.

## Anti-patterns

- Do not use Stat as a number poster without a label and interpretation.
- Do not replace tables or charts when the user needs comparison across many rows.

## States

| State | Description |
| --- | --- |
| Primary | Default summary treatment suits most public cards, galleries, and compact overview strips. |
| Accent and muted | accent lifts one lead metric while muted supports quieter companion summaries in the same row. |
| Trend | up, down, and flat add lightweight directional emphasis without turning the block into a chart widget. |
| Alignment | start and center support dense card rows as well as more ceremonial hero summaries. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `string` | - | Yes | Headline metric, percentage, or short summary phrase. |
| `eyebrow` | `string` | - | No | Optional compact label shown above the headline value. |
| `helper` | `string` | - | No | Supporting context shown below the main label slot. |
| `tone` | `'accent' \| 'muted' \| 'primary'` | 'primary' | No | Visual emphasis within a group of summary blocks. |
| `trend` | `'down' \| 'flat' \| 'up'` | 'flat' | No | Lightweight directional cue paired with the headline value. |
| `align` | `'center' \| 'start'` | 'start' | No | Layout alignment for compact grids or centered feature rows. |

## Accessibility

- Uses plain text content so screen readers announce value, label, and helper in reading order without extra widget semantics.
- Trend markers are visual cues only; the label and helper should still explain whether the change is good, bad, or neutral.
- Avoid using Stat as the only representation of complex data distributions that would require a table or chart.

## Storybook Contract

- Must consume `publicComponentDocs.Stat` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
