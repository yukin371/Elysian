# DateInput

Native date entry primitive for event dates, validity windows, publishing schedules, and recovery deadlines that need one exact calendar day without a heavy picker.

## Category

`form`

## Usage

- Use DateInput when the user must choose or review a single exact date with visible label, helper copy, and validation feedback.
- Keep min and max tied to surrounding policy copy so date limits are understandable before submission.
- Use invalidMessage for actionable recovery when a date is outside a booking, membership, or publishing window.

## Decision Guidance

- Use when the user needs one exact calendar day and native platform date entry is enough.
- Use a page-owned calendar, scheduler, range picker, or timezone flow when the task depends on availability, recurrence, or multiple dates.

## Composition

- Pair with Alert, Text, Progress, Timeline, or Stepper when a date unlocks readiness, a deadline, or a visible recovery path.
- Place related dates in one flat form lane with compact copy and dividers instead of giving every date its own card.

## Anti-patterns

- Do not use DateInput as a booking engine, timezone converter, recurrence editor, or availability picker.
- Do not hide legal, membership, or publishing limits inside min and max without visible explanation.

## States

| State | Description |
| --- | --- |
| Empty | Empty entry keeps the controlled value as an empty string so optional date fields can remain unset. |
| Selected date | Native date input stores the value as YYYY-MM-DD and preserves browser calendar, keyboard, and mobile behavior. |
| Bounded date | Min and max expose simple inclusive boundaries without becoming a scheduler or policy engine. |
| Invalid | Invalid state links visible recovery copy through aria-describedby and sets aria-invalid. |
| Read-only and disabled | Read-only preserves a submitted date for review, while disabled explains unavailable date changes. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `string` | '' | No | Controlled native date value in YYYY-MM-DD format; empty string represents no date. |
| `label` | `string` | - | No | Visible field label that names the date decision. |
| `description` | `string` | - | No | Stable helper copy for date meaning, deadline, or allowed window. |
| `invalidMessage` | `string` | - | No | Actionable validation message linked through aria-describedby. |
| `min` | `string` | - | No | Optional inclusive lower bound in native YYYY-MM-DD format. |
| `max` | `string` | - | No | Optional inclusive upper bound in native YYYY-MM-DD format. |
| `readOnly` | `boolean` | false | No | Prevents editing while keeping the selected date visible for review. |
| `disabled` | `boolean` | false | No | Disables the native date control when date editing is unavailable. |

## Accessibility

- Uses a native date input so browser keyboard, mobile date entry, and platform semantics remain available.
- Generated ids connect helper and invalid copy through aria-describedby.
- Invalid state exposes visible correction text and sets aria-invalid without relying on color alone.

## Storybook Contract

- Must consume `publicComponentDocs.DateInput` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
