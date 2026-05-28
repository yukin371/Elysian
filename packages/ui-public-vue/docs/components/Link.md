# Link

Inline navigation surface for public copy, support actions, and lightweight escapes with governed tone, underline behavior, and external-link handling.

## Category

`navigation`

## Usage

- Use Link for lightweight navigation or supporting actions that should not compete with primary buttons.
- Keep link labels explicit about destination or result instead of relying on surrounding decorative copy.
- Use the external variant only when the destination truly leaves the current product context.

## Decision Guidance

- Use for support routes, policy references, archive exits, and secondary reading paths that should not compete with the primary action.
- Use external only when the destination leaves the product context.

## Composition

- Pair with Alert, Empty State, or Card footer as a quiet recovery or reference path.
- In dense copy, keep underline behavior explicit so links remain discoverable across theme families.

## Anti-patterns

- Do not use Link for irreversible or high-commitment actions.
- Do not hide vague labels such as read more behind decorative surrounding copy.

## States

| State | Description |
| --- | --- |
| Primary | Default inline navigation carries the brand-aligned emphasis for content and supporting actions. |
| Accent and muted | accent raises editorial emphasis while muted supports quieter references and secondary exits. |
| Underline behavior | auto, always, and none allow the component to adapt to dense copy or editorial sections without losing consistency. |
| External | External links add a trailing mark and safe rel plus target attributes for new-tab behavior. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `href` | `string` | '#' | No | Destination URL for the anchor element. |
| `tone` | `'accent' \| 'muted' \| 'primary'` | 'primary' | No | Visual emphasis for the inline navigation surface. |
| `underline` | `'always' \| 'auto' \| 'none'` | 'auto' | No | Controls underline visibility across copy-heavy contexts. |
| `external` | `boolean` | false | No | Opens the destination in a new tab and adds external-link affordance. |

## Accessibility

- Uses a native anchor element so browser link semantics and keyboard behavior remain intact.
- External links set rel=noreferrer noopener and target=_blank for safer new-tab behavior.
- Tone and underline are visual refinements only; the slot label still needs to describe destination or outcome.

## Storybook Contract

- Must consume `publicComponentDocs.Link` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
