# FileInput

Native file selection primitive for avatars, proof documents, creator attachments, and support evidence that need clear filenames without owning upload transport.

## Category

`form`

## Usage

- Use FileInput when the user must choose one or more local files and see what has been selected before submission.
- Keep accepted file types, size policy, and privacy copy visible near the field instead of hiding risk in backend validation.
- Use invalidMessage for repairable selection problems such as wrong type, too many files, or missing required evidence.

## Decision Guidance

- Use when choosing local files is part of a form and the component only needs to expose selected filenames.
- Use a page-owned uploader when the task needs drag sorting, preview editing, progress, retry, antivirus status, or cloud storage integration.

## Composition

- Pair with Alert, Text, Progress, or Empty State when the attachment affects readiness, privacy, or recovery.
- Keep file evidence in the same flat form lane as its explanation and submit action instead of nesting upload cards.

## Anti-patterns

- Do not use FileInput as an upload transport, media editor, document parser, virus scanner, or storage policy owner.
- Do not rely on accept alone for safety; visible copy and page-owned validation must still explain file limits.

## States

| State | Description |
| --- | --- |
| Empty | Empty state shows stable no-file copy while the native control remains available. |
| Selected file | Single selection exposes the filename and keeps native file picker semantics intact. |
| Multiple files | Multiple selection summarizes count and lists filenames without becoming an upload queue. |
| Invalid | Invalid state links visible repair copy through aria-describedby and sets aria-invalid. |
| Disabled | Disabled state prevents selection and clearing when attachment changes are unavailable. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `accept` | `string` | - | No | Native accept filter such as image/* or .pdf; final validation remains page-owned. |
| `multiple` | `boolean` | false | No | Allows more than one file to be selected. |
| `label` | `string` | - | No | Visible field label that names the attachment purpose. |
| `description` | `string` | - | No | Stable helper copy for file type, privacy, or size expectations. |
| `invalidMessage` | `string` | - | No | Actionable validation message linked through aria-describedby. |
| `clearLabel` | `string` | 'Clear selected files' | No | Accessible label and visible copy for clearing selection. |
| `noFileLabel` | `string` | 'No file selected' | No | Visible summary copy before any file is selected. |
| `disabled` | `boolean` | false | No | Disables file selection and clearing when attachment changes are unavailable. |

## Accessibility

- Uses a native file input so platform picker semantics and keyboard access remain intact.
- Generated ids connect helper copy, selected filenames, and invalid copy through aria-describedby.
- Selected filenames are displayed as text and invalid state does not rely on color alone.

## Storybook Contract

- Must consume `publicComponentDocs.FileInput` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
