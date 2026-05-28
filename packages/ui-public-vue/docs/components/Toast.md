# Toast

Compact transient feedback surface for saved, synced, blocked, or failed moments that need confirmation without becoming a full Alert block.

## Category

`feedback`

## Usage

- Use Toast for short-lived feedback after local actions such as save, sync, copy, or dismiss.
- Keep copy brief and action-adjacent; persistent recovery instructions should use Alert instead.
- Use dismissible only when the message can be safely closed without losing required context.

## Decision Guidance

- Use when feedback is transient and confirms the result of a nearby user action.
- Use Alert instead when the message must remain visible, contains repair steps, or blocks progress.

## Composition

- Pair with Button or form flows after save/sync/copy actions to confirm what changed.
- Use one optional toast action for undo, view, or retry; move multi-step repair into Alert or Dialog.
- Stack at most a small number of toasts; if the list grows, move the history into a page-owned notification pattern.

## Anti-patterns

- Do not hide validation errors, legal instructions, or required recovery paths inside Toast.
- Do not put multiple competing actions inside Toast; it should stay transient and local.
- Do not use Toast as a persistent notification center, modal replacement, or decorative status badge.

## States

| State | Description |
| --- | --- |
| Info | Neutral contextual notification for changed scope, background sync, or lightweight system updates. |
| Success | Confirmation that a local action completed and the user can keep moving. |
| Warning | Recoverable issue that should be noticed quickly but does not require a full inline repair block. |
| Danger | Short failure notification for immediate attention; longer blockers should become Alert. |
| Dismissible | Optional close button for transient messages that do not contain required instructions. |
| Action | Optional single text action for safe transient follow-up such as undo, view, or retry. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tone` | `'danger' \| 'info' \| 'success' \| 'warning'` | 'info' | No | Semantic notification tone. |
| `title` | `string` | 'Notification' | No | Short notification headline. |
| `description` | `string` | - | No | Optional concise supporting copy. |
| `actionLabel` | `string` | - | No | Optional single action label for safe transient follow-up. |
| `actionAriaLabel` | `string` | - | No | Optional accessible label when the visible action label needs extra context. |
| `dismissible` | `boolean` | false | No | Shows a dismiss button and emits dismiss when clicked. |
| `dismissLabel` | `string` | 'Dismiss notification' | No | Accessible label for the dismiss button. |

## Accessibility

- Uses role=status for info and success so polite updates are announced.
- Uses role=alert for warning and danger because those tones need quicker attention.
- Use only one toast action and keep it safe, reversible, or clearly scoped to the local feedback.
- Dismissible toasts expose a native button with an accessible dismiss label.

## Storybook Contract

- Must consume `publicComponentDocs.Toast` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
