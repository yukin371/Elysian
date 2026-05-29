# Radio Group

Single-choice decision group for density, style, or preference options with roving keyboard selection.

## Category

`form`

## Usage

- Use when exactly one option in a small set can be selected.
- Do not use radio group as navigation; use tabs when switching content sections.
- Descriptions should distinguish consequences, not repeat labels.

## Decision Guidance

- Use when exactly one option in a small set must be selected.
- Use for density, style, or preference choices where consequences can be compared side by side.

## Composition

- Pair with Card or Theme Atelier settings where a small choice set shapes the following preview.
- Use item descriptions to explain consequences, not repeat labels.

## Anti-patterns

- Do not use Radio Group as tabs or navigation.
- Do not use it for long or dynamic option lists; use Select or a future dedicated picker.

## States

| State | Description |
| --- | --- |
| Selected | One radio owns aria-checked=true. |
| Unselected | Available but inactive options remain focusable by roving logic. |
| Keyboard | Arrow keys, Home, and End move selection and focus. |
| Descriptions | Optional item descriptions support decision clarity. |
| Invalid | Group-level repair copy is linked through aria-describedby without turning options into separate cards. |
| Disabled | All radio options stop accepting selection while preserving the visible decision context. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicRadioItem[]` | - | Yes | Radio item key, value, label, and optional description definitions. |
| `modelValue` | `string` | '' | No | Controlled selected value. |
| `label` | `string` | - | No | Visible group label; when present it becomes the radiogroup accessible name. |
| `description` | `string` | - | No | Visible helper copy linked to the radiogroup through aria-describedby. |
| `invalidMessage` | `string` | - | No | Actionable group-level repair message linked through aria-describedby. |
| `disabled` | `boolean` | false | No | Disables every radio option in the group. |
| `ariaLabel` | `string` | 'Options' | No | Accessible fallback label for the radiogroup when no visible label is provided. |

## Accessibility

- Uses role=radiogroup and role=radio.
- aria-checked reflects the selected item.
- Visible label, helper copy, and invalid copy are connected with aria-labelledby and aria-describedby.
- Roving tabindex keeps keyboard focus within the group when enabled.

## Storybook Contract

- Must consume `publicComponentDocs.RadioGroup` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
