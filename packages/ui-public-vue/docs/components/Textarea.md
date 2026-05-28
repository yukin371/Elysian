# Textarea

Long-text entry primitive for comments, profile descriptions, support notes, and creator submission copy that need visible guidance and optional character count.

## Category

`form`

## Usage

- Use Textarea when the user writes more than a short field value and needs room to review their words.
- Use showCount or maxLength when copy length affects publishing, moderation, or review readiness.
- Keep helper and invalid copy close to the writing surface so users can repair content without scanning another card.

## Decision Guidance

- Use when the writing task needs multiple lines, optional length evidence, and a stable repair path.
- Use Input for short single-line values and a page-owned editor for rich text, markdown preview, mentions, or moderation workflows.

## Composition

- Pair with Alert, Text, FileInput, Progress, or Button when writing quality affects review readiness or submission.
- Keep Textarea in a flat form lane with guidance and submit action instead of surrounding it with nested writing cards.

## Anti-patterns

- Do not use Textarea as a rich text editor, markdown renderer, comment thread, moderation system, or AI writing assistant.
- Do not hide tone rules, privacy expectations, or content limits in placeholder text only.

## States

| State | Description |
| --- | --- |
| Empty | Empty writing surface keeps label, helper copy, and placeholder available without hiding the task. |
| Composed text | Controlled text updates as the user writes and preserves native textarea behavior. |
| Counted | Character count can expose current length alone or current length against maxLength. |
| Invalid | Invalid state links visible recovery copy through aria-describedby and sets aria-invalid. |
| Read-only and disabled | Read-only preserves submitted copy for review, while disabled removes editing from unavailable text. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `string` | '' | No | Controlled textarea content. |
| `label` | `string` | - | No | Visible field label that names the writing task. |
| `description` | `string` | - | No | Stable helper copy for tone, privacy, or publishing expectations. |
| `invalidMessage` | `string` | - | No | Actionable validation message linked through aria-describedby. |
| `maxLength` | `number` | - | No | Native maximum character length and optional count denominator. |
| `showCount` | `boolean` | false | No | Shows current character count even without maxLength. |
| `rows` | `number` | 5 | No | Native textarea row count. |
| `resize` | `'block' \| 'both' \| 'inline' \| 'none'` | 'block' | No | Controls native resize direction. |
| `readOnly` | `boolean` | false | No | Prevents editing while keeping submitted copy readable. |

## Accessibility

- Uses a native textarea so keyboard editing, selection, and assistive technology behavior remain available.
- Generated ids connect helper copy, character count, and invalid copy through aria-describedby.
- Invalid and count states are expressed with visible text, not color alone.

## Storybook Contract

- Must consume `publicComponentDocs.Textarea` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
