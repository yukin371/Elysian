# Rating

Discrete single-value feedback control for public preference, content quality, satisfaction, and lightweight evaluation moments.

## Category

`form`

## Usage

- Use rating when the user expresses a small ordered score rather than writing a review or choosing named categories.
- Keep the scale short and explain what the value means before asking for feedback.
- Use readOnly for displayed scores; use interactive rating only when the user can change the value locally.

## Decision Guidance

- Use when the user gives a compact ordered score, such as content quality, delight, satisfaction, or fit.
- Use Radio Group when each option has a distinct label, Slider when the value is continuous, and Text/Input when the user must explain why.

## Composition

- Pair with Text, Alert, or Toast when the feedback needs expectation-setting, confirmation, or a repair path.
- Use readOnly beside Stat, Card, or List rows to display existing scores without implying the user can edit them.

## Anti-patterns

- Do not use Rating as a progress meter, popularity chart, full review system, sentiment analytics, or gamified reward mechanic.
- Do not ask for a rating without naming what the scale measures or what happens after the user selects a value.

## States

| State | Description |
| --- | --- |
| Empty | No item is selected yet, while the first rating remains keyboard reachable. |
| Selected | The chosen value owns aria-checked=true and lower values render as filled evidence. |
| Read only | Displays an existing score without allowing pointer or keyboard changes. |
| Disabled | Unavailable feedback paths remain visible while blocking interaction. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `number` | 0 | No | Controlled selected rating value. |
| `max` | `number` | 5 | No | Maximum rating item count, clamped to a compact range. |
| `label` | `string` | - | No | Visible rating label. |
| `description` | `string` | - | No | Helper copy linked through aria-describedby. |
| `readOnly` | `boolean` | false | No | Shows the score without permitting changes. |
| `showValue` | `boolean` | true | No | Shows the current value as value/max beside the label. |
| `disabled` | `boolean` | false | No | Disables rating changes. |

## Accessibility

- Uses radiogroup and radio roles so the discrete scale has familiar keyboard semantics.
- Arrow keys, Home, and End move selection when the rating is interactive.
- Visible copy must explain the scale because filled marks alone do not communicate meaning.

## Storybook Contract

- Must consume `publicComponentDocs.Rating` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
