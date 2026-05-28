# Select

Native select wrapped in the public field language for governed theme, density, and preference choices.

## Category

`form`

## Usage

- Use select when the full option list is short and stable.
- Use placeholder to force an intentional choice only when no safe default exists.
- For rich search or async lists, add a dedicated component later instead of overloading this one.

## Decision Guidance

- Use when the user chooses one option from a short, stable list.
- Use placeholder only when no safe default exists.

## Composition

- Pair with Input and Checkbox in forms where structured and freeform decisions coexist.
- Use description to explain the consequence of the selected option.

## Anti-patterns

- Do not overload Select with search, async loading, or rich option cards.
- Do not use Select as navigation between pages.

## States

| State | Description |
| --- | --- |
| Selected | Controlled value maps to one of the provided options. |
| Placeholder | Empty value uses a disabled placeholder option. |
| Invalid | Validation uses the same message language as Input. |
| Disabled | Keeps field hierarchy visible while blocking changes. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `UiSelectOption[]` | - | Yes | List of selectable value/label pairs. |
| `modelValue` | `string` | '' | No | Controlled selected option value. |
| `placeholder` | `string` | 'Select an option' | No | Disabled placeholder shown for empty values. |
| `label` | `string` | - | No | Visible field label. |
| `description` | `string` | - | No | Helper copy linked through aria-describedby. |
| `invalidMessage` | `string` | - | No | Validation copy linked through aria-describedby. |

## Accessibility

- Keeps native select semantics and keyboard behavior.
- Description and validation copy are linked to the control.
- Invalid state sets aria-invalid.

## Storybook Contract

- Must consume `publicComponentDocs.Select` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
