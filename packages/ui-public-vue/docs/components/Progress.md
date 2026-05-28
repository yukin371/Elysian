# Progress

Linear completion indicator for uploads, setup milestones, and staged progress where the user needs a clear sense of completion without a chart-heavy surface.

## Category

`feedback`

## Usage

- Use progress when work has a bounded range and users benefit from seeing completion move forward.
- Pair progress with a short label that explains the tracked task rather than leaving the bar context-free.
- Use warning or accent sparingly for guarded milestones; default to primary or success for most completion feedback.

## Decision Guidance

- Use when progress has a bounded range and helps users understand readiness or completion.
- Use warning or accent only when the milestone needs guarded attention.

## Composition

- Pair with Stat for explicit numbers and Alert for blocked or delayed progress.
- Place near the action it explains so completion supports the next decision.

## Anti-patterns

- Do not use Progress for unbounded waiting; use Skeleton or status copy instead.
- Do not show decorative bars with no label or task context.

## States

| State | Description |
| --- | --- |
| Determinate | value and max resolve to a bounded percentage and render a proportional fill width. |
| Tone | primary, accent, success, and warning preserve the same structure while shifting semantic emphasis. |
| With value | showValue exposes the rounded percentage for users who need explicit numeric completion. |
| Clamped range | Negative or overflow values are safely clamped between zero and the resolved maximum. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | 0 | No | Current progress value before percentage normalization. |
| `max` | `number` | 100 | No | Upper bound used to calculate completion percentage. |
| `label` | `string` | - | No | Visible and accessible context label for the progress task. |
| `showValue` | `boolean` | true | No | Shows the rounded percentage beside the label. |
| `tone` | `'accent' \| 'primary' \| 'success' \| 'warning'` | 'primary' | No | Semantic emphasis for the fill treatment. |

## Accessibility

- Uses role=progressbar with aria-valuemin, aria-valuemax, and aria-valuenow.
- aria-label falls back to the visible label or a safe Progress label when none is provided.
- Numeric completion should remain supplemental; the task label still needs to explain what is progressing.

## Storybook Contract

- Must consume `publicComponentDocs.Progress` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
