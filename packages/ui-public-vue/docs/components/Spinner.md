# Spinner

Indeterminate local waiting indicator for short async moments, inline pending states, and compact loading feedback that should not become a full-page overlay.

## Category

`feedback`

## Usage

- Use Spinner when the system is waiting briefly and the exact duration or completion percentage is unknown.
- Prefer Progress when the task has a known range, and prefer Skeleton when the incoming content structure is known.
- Keep a visible or accessible label so users know what is waiting instead of watching decorative motion.

## Decision Guidance

- Use when a local action, inline region, or compact surface is waiting and no meaningful percentage exists.
- Use Skeleton for loading known content structure and Progress for bounded completion rather than stretching Spinner into every wait state.

## Composition

- Pair with Text, Button, Alert, or Empty State so short waiting, delayed waiting, and failure each have a visible next state.
- Use neutral tone inside dense forms and primary or accent tone near branded public actions.

## Anti-patterns

- Do not use Spinner as a full-page blocking overlay, upload progress bar, skeleton replacement, or decorative ornament.
- Do not leave a spinner running after success, failure, empty result, or recovery copy is available.

## States

| State | Description |
| --- | --- |
| Primary | Default spinner tone follows the active theme primary role for nearby product actions. |
| Accent and neutral | Accent supports more expressive public moments, while neutral keeps dense waiting states quiet. |
| Size | sm, md, and lg cover inline labels, normal surfaces, and stronger local loading moments. |
| Label visibility | showLabel can expose the loading copy visually, while hidden labels remain available to assistive technology. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | 'Loading' | No | Accessible loading label, and visible copy when showLabel is enabled. |
| `showLabel` | `boolean` | false | No | Shows the label beside the spinner instead of visually hiding it. |
| `size` | `'lg' \| 'md' \| 'sm'` | 'md' | No | Spinner scale for inline, default, or local feature use. |
| `tone` | `'accent' \| 'neutral' \| 'primary'` | 'primary' | No | Semantic emphasis for the spinner ring. |

## Accessibility

- Uses role=status so the loading label is exposed as non-blocking status feedback.
- When showLabel is false, the label remains available through aria-label and sr-only text.
- The spinner is supplemental; nearby copy should still explain long waits, failures, or next steps.

## Storybook Contract

- Must consume `publicComponentDocs.Spinner` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
