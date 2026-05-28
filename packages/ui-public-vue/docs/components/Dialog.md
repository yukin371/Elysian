# Dialog

Focused overlay for confirmation and short public workflows with escape handling, initial focus, and focus restoration.

## Category

`feedback`

## Usage

- Use dialogs for interruptive confirmation or compact editing, not for long multi-page workspaces.
- Always provide a clear title and a footer action pair.
- Disable backdrop or escape close only when losing state would be harmful.

## Decision Guidance

- Use when the current flow needs focused confirmation, review, or interruption without route navigation.
- Use danger copy and actions only when the user is confirming destructive or blocked behavior.

## Composition

- Pair with Button trigger, Alert for risk, and Text for concise consequences.
- Keep footer actions ordered by safe primary path and visible cancellation.

## Anti-patterns

- Do not use Dialog as a general page layout container.
- Do not hide long forms or complex multi-step workflows inside a modal.

## States

| State | Description |
| --- | --- |
| Closed | No DOM overlay when open is false. |
| Open | Panel is labelled, modal, and focused on the close control. |
| Size | sm, md, and lg support confirmations through richer previews. |
| Dismissal | Escape and backdrop close are configurable. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | false | No | Controls dialog visibility. |
| `title` | `string` | - | No | Dialog heading linked through aria-labelledby. |
| `description` | `string` | - | No | Supporting copy linked through aria-describedby. |
| `size` | `'sm' \| 'md' \| 'lg'` | 'md' | No | Panel width preset. |
| `closeOnBackdrop` | `boolean` | true | No | Allows backdrop click dismissal. |
| `closeOnEscape` | `boolean` | true | No | Allows Escape key dismissal. |

## Accessibility

- Uses role=dialog and aria-modal=true.
- Title and description ids are wired when provided.
- Focus moves into the panel on open and returns to the trigger on close.

## Storybook Contract

- Must consume `publicComponentDocs.Dialog` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
