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

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicRadioItem[]` | - | Yes | Radio item key, value, label, and optional description definitions. |
| `modelValue` | `string` | '' | No | Controlled selected value. |
| `ariaLabel` | `string` | 'Options' | No | Accessible label for the radiogroup. |

## Accessibility

- Uses role=radiogroup and role=radio.
- aria-checked reflects the selected item.
- Roving tabindex keeps keyboard focus within the group.

## Storybook Contract

- Must consume `publicComponentDocs.RadioGroup` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
