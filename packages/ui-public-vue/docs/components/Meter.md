# Meter

Bounded scalar indicator for capacity, fit, quality, health, and quota signals where the value describes a condition rather than task completion.

## Category

`content`

## Usage

- Use Meter when users need to judge a known bounded value such as capacity, theme fit, quality, or risk level.
- Pair Meter with a label and helper copy so the scalar has a visible meaning instead of becoming a decorative bar.
- Use status tones only when the measured value has a clear semantic consequence, not just to add more color.

## Decision Guidance

- Use when the bar describes a bounded condition such as quota, fit, quality, health, or capacity.
- Use Progress when work is moving toward completion, and use Stat when one number alone carries the decision.

## Composition

- Pair with Stat, Badge, Text, Alert, or Table when the scalar needs interpretation, comparison, or repair context.
- Place Meter in the same information lane as the decision it informs instead of wrapping each measured value in another card.

## Anti-patterns

- Do not use Meter for task progress, indefinite waiting, decorative energy bars, rankings, or unbounded live metrics.
- Do not rely on color alone for warning, danger, quality, or capacity; label, helper, or valueText must name the meaning.

## States

| State | Description |
| --- | --- |
| Bounded value | value and max resolve to a clamped scalar percentage while preserving the original numeric aria value. |
| Semantic tone | primary, accent, success, warning, and danger express the meaning of the measured condition. |
| Readable value | showValue exposes a percentage or custom valueText when the scalar needs a human-readable label. |
| Helper copy | helper explains what the measured value means and how users should interpret it. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | 0 | No | Current scalar value before bounded normalization. |
| `max` | `number` | 100 | No | Upper bound used to calculate the visual fill. |
| `label` | `string` | '' | No | Visible and accessible label for the measured value. |
| `helper` | `string` | '' | No | Visible explanation of what the scalar means in the current surface. |
| `valueText` | `string` | '' | No | Optional human-readable value used visually and as aria-valuetext. |
| `showValue` | `boolean` | true | No | Shows the readable value beside the label. |
| `tone` | `'accent' \| 'danger' \| 'primary' \| 'success' \| 'warning'` | 'primary' | No | Semantic emphasis for the measured condition. |

## Accessibility

- Uses role=meter with aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext.
- The label should name the measured condition, not the visual shape of the bar.
- Tone is supplemental; helper or valueText must explain success, warning, risk, or capacity without relying on color alone.

## Storybook Contract

- Must consume `publicComponentDocs.Meter` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
