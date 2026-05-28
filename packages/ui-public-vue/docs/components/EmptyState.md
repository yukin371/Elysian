# Empty State

Guided empty surface that explains absence, preserves the public theme mood, and offers a next step when available.

## Category

`feedback`

## Usage

- Use when a collection, comparison, or review lane has no content yet.
- Prefer one primary next action and one optional secondary escape.
- Keep the empty copy about the user's next move, not internal implementation status.

## Decision Guidance

- Use when absence needs explanation and a recovery path.
- Use accent only for guided journeys where the empty moment is part of the main experience.

## Composition

- Pair with Button for the single primary recovery and Link for support or archive paths.
- Use Alert nearby only when the absence is caused by an error or blocked state.

## Anti-patterns

- Do not use Empty State as decorative filler.
- Do not offer multiple equally strong recovery actions.

## States

| State | Description |
| --- | --- |
| Default | Calm empty surface for standard absence. |
| Accent | Higher-emphasis empty state for key guided journeys. |
| With actions | Action slot turns the absence into a clear recovery path. |
| Fallback copy | Default slot has safe copy when callers do not pass content. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `eyebrow` | `string` | - | No | Small category label above the title. |
| `title` | `string` | 'Nothing here yet' | No | Primary empty state heading. |
| `tone` | `'accent' \| 'default'` | 'default' | No | Surface intensity for the empty state. |

## Accessibility

- Uses section semantics with a visible h3 heading.
- Action slot should contain real buttons or links with clear labels.
- Avoid decorative-only empty states that do not explain the absence.

## Storybook Contract

- Must consume `publicComponentDocs.EmptyState` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
