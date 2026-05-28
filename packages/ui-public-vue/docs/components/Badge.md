# Badge

Compact semantic marker for statuses, categories, and lightweight emphasis in public luxe surfaces.

## Category

`feedback`

## Usage

- Use badges to label state or category, not as a replacement for buttons.
- Keep copy short enough to scan in dense component groups.
- Use danger only for risk or destructive meaning, not for decorative contrast.

## Decision Guidance

- Use when a compact state, category, or eligibility marker helps scanning.
- Use danger only for real risk, invalidity, or destructive meaning.

## Composition

- Pair with headings, Stats, Alerts, or Cards as supporting evidence.
- Keep badge copy short enough to survive mobile and dense summary rows.

## Anti-patterns

- Do not use Badge as a button or navigation control.
- Do not rely on badge tone without explicit label text.

## States

| State | Description |
| --- | --- |
| Neutral | Low-emphasis metadata and calm labels. |
| Primary | Brand-aligned emphasis for active or selected context. |
| Accent | Editorial highlight without becoming the primary action. |
| Danger | Risk, invalid, or destructive markers. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tone` | `'accent' \| 'danger' \| 'neutral' \| 'primary'` | 'neutral' | No | Semantic color treatment for the marker. |

## Accessibility

- Renders as inline text and inherits surrounding reading order.
- Tone should not be the only meaning; keep label text explicit.
- Avoid placing interactive behavior on Badge.

## Storybook Contract

- Must consume `publicComponentDocs.Badge` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
