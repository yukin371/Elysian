# Input

Governed single-line text field for search, editing, and settings flows with label, help text, and invalid state.

## Category

`form`

## Usage

- Prefer explicit labels over placeholder-only fields.
- Use description for stable guidance and invalidMessage for actionable correction.
- Use Textarea for longer comments, profile copy, support notes, and character-counted writing.

## Decision Guidance

- Use when the user must enter or edit freeform text with a visible label and correction path.
- Use Textarea when the content is a note, comment, description, moderation reason, or other long-form copy.

## Composition

- Pair with Select, Checkbox, Alert, and Progress in form flows that need validation and completion feedback.
- Use description for stable guidance and invalidMessage for actionable recovery.

## Anti-patterns

- Do not ship placeholder-only fields.
- Do not use Input for option selection when Select, Checkbox, Radio Group, or Switch expresses the decision better.

## States

| State | Description |
| --- | --- |
| Default | Single-line text input with optional label and description. |
| Multiline | Backward-compatible textarea variant keeps the same surface, but new long-text flows should prefer Textarea. |
| Invalid | Combines aria-invalid, message linkage, and stronger border tone. |
| Disabled | Preserves layout while removing input interaction. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `string` | '' | No | Controlled field value. |
| `label` | `string` | - | No | Visible field label. |
| `description` | `string` | - | No | Helper copy linked through aria-describedby. |
| `invalidMessage` | `string` | - | No | Validation message linked through aria-describedby. |
| `multiline` | `boolean` | false | No | Switches the native control from input to textarea. |
| `type` | `'email' \| 'number' \| 'password' \| 'search' \| 'text' \| 'url'` | 'text' | No | Native input type for the single-line variant. |

## Accessibility

- Generated ids connect description and invalid message to the control.
- Invalid state sets aria-invalid.
- The label wraps the native input or textarea for predictable activation.

## Storybook Contract

- Must consume `publicComponentDocs.Input` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
