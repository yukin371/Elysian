# NumberInput

Exact numeric entry primitive for quantities, seats, limits, budgets, and threshold fields that need typed precision rather than approximate slider tuning.

## Category

`form`

## Usage

- Use NumberInput when the user must type or step an exact bounded value with visible label, unit, and correction path.
- Keep min, max, step, and unit tied to the surrounding copy so the number has a clear product meaning.
- Use invalidMessage for actionable correction instead of silently changing typed values while the user is editing.

## Decision Guidance

- Use when the value must be exact enough to type, audit, submit, or repeat later.
- Use Slider for approximate preference tuning and Select or Radio Group when the numeric choices are really named options.

## Composition

- Pair with Text, Alert, Progress, or Stat when the number changes readiness, capacity, or a visible preview.
- Place related numeric fields in one flat form lane with dividers or compact rows instead of wrapping each field in a separate card.

## Anti-patterns

- Do not use NumberInput as a currency formatter, tax calculator, pricing engine, range picker, or color control.
- Do not silently clamp typed values without visible copy when the field affects legal, financial, or destructive commitments.

## States

| State | Description |
| --- | --- |
| Empty | Empty entry emits null so forms can distinguish no answer from zero. |
| Typed value | Native number input accepts precise values and keeps browser keyboard behavior available. |
| Stepped | Optional local steppers move by step and clamp to min or max without becoming a calculator. |
| Invalid | Invalid state links visible recovery copy through aria-describedby and sets aria-invalid. |
| Read-only and disabled | Read-only preserves submitted value for review, while disabled removes interaction from unavailable fields. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `number \| null` | null | No | Controlled numeric value; empty input emits null rather than an empty string. |
| `label` | `string` | - | No | Visible field label that names what the number controls. |
| `description` | `string` | - | No | Stable helper copy linked through aria-describedby. |
| `invalidMessage` | `string` | - | No | Actionable validation message linked through aria-describedby. |
| `min` | `number` | - | No | Optional lower bound used by the native input and stepper clamp. |
| `max` | `number` | - | No | Optional upper bound used by the native input and stepper clamp. |
| `step` | `number` | 1 | No | Native number increment and local stepper amount. |
| `rangeText` | `string` | - | No | Optional visible range copy; when omitted, min and max generate a compact readable hint. |
| `unit` | `string` | - | No | Visible suffix for units such as seats, minutes, days, or credits. |
| `readOnly` | `boolean` | false | No | Prevents editing while preserving the value for review surfaces. |

## Accessibility

- Uses a native number input so keyboard, mobile numeric entry, and browser value semantics remain intact.
- Description, generated range hint, and invalid message ids are joined in aria-describedby when present.
- Stepper buttons have explicit increase and decrease labels, while invalid state exposes a visible correction message.

## Storybook Contract

- Must consume `publicComponentDocs.NumberInput` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
