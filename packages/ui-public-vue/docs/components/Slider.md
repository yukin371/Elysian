# Slider

Single-value range control for theme intensity, ornament budget, volume, and other bounded public preferences that benefit from continuous adjustment.

## Category

`form`

## Usage

- Use slider when the user adjusts a known numeric range rather than choosing from discrete labels.
- Keep the label and min/max meaning visible so the control does not become decorative motion.
- Use showValue when the exact setting matters; hide it only when surrounding copy already names the result.

## Decision Guidance

- Use when a bounded numeric preference benefits from gradual tuning, such as ornament intensity, density, volume, or progress threshold.
- Use Select or Radio Group when the choices are named categories, and use Progress when the value is read-only completion rather than user input.

## Composition

- Pair with Text, Stat, or Alert when the range changes a preview, cost, or accessibility-sensitive behavior.
- Place Slider inside the current form or preference lane; avoid wrapping the scale in another card or turning every range into a themed mini dashboard.

## Anti-patterns

- Do not use Slider for prices, legal consent, destructive thresholds, color picking, or values where exact typed input is required.
- Do not hide min/max meaning or rely on the glowing track alone to explain what the selected value changes.

## States

| State | Description |
| --- | --- |
| Bounded value | modelValue is resolved between min and max and reflected by the visual track fill. |
| Step | step controls the native keyboard and pointer increment for coarse or fine tuning. |
| With value | showValue exposes the current numeric value and optional unit beside the label. |
| Disabled | Unavailable ranges remain visible while blocking pointer and keyboard updates. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `number` | 0 | No | Controlled numeric value for the range input. |
| `min` | `number` | 0 | No | Lower bound displayed in the scale and applied to input. |
| `max` | `number` | 100 | No | Upper bound displayed in the scale and applied to input. |
| `step` | `number` | 1 | No | Native increment used by pointer and keyboard changes. |
| `label` | `string` | - | No | Visible range label. |
| `description` | `string` | - | No | Helper copy linked through aria-describedby. |
| `unit` | `string` | '' | No | Optional suffix shown with the current value and scale. |
| `showValue` | `boolean` | true | No | Shows the current numeric value beside the label. |
| `disabled` | `boolean` | false | No | Disables range changes. |

## Accessibility

- Uses native input type=range so keyboard and assistive technology semantics are preserved.
- Description copy is linked to the control when provided.
- Visible labels and units must explain the scale because color alone cannot communicate intensity.

## Storybook Contract

- Must consume `publicComponentDocs.Slider` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
