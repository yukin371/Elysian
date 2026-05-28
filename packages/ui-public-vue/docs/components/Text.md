# Text

Governed body-copy primitive for paragraphs, compact notes, and inline emphasis so public pages can reuse the same reading rhythm instead of scattering one-off text styles.

## Category

`content`

## Usage

- Use Text for body copy, helper notes, and small supporting statements that need stable tone and spacing across the preset.
- Choose muted or subtle for secondary explanation, but keep primary for content that carries real decision-making weight.
- Use the as prop to preserve semantic intent instead of swapping to a stronger visual tone when the meaning is still just body text.

## Decision Guidance

- Use when copy needs the public preset reading rhythm without creating a new visual class.
- Use muted or subtle only for supporting explanation; primary copy should still carry the real decision.

## Composition

- Pair with Button, Link, Alert, and Empty State to keep actions understandable without local text styles.
- Use semantic tags through the as prop before reaching for stronger visual treatment.

## Anti-patterns

- Do not use tone changes as the only way to convey risk or state.
- Do not create one-off paragraph classes in Storybook or patterns when Text already covers the role.

## States

| State | Description |
| --- | --- |
| Primary | Default reading tone supports most paragraphs, captions, and compact descriptions inside public cards. |
| Muted and subtle | Lower-emphasis tones help supporting copy recede without disappearing into low-contrast decoration. |
| Size | sm, md, and lg support dense helper text, standard copy, and slightly more present lead paragraphs. |
| Semantic tag | p, span, and strong keep content semantics explicit while sharing the same visual family. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `as` | `'p' \| 'span' \| 'strong'` | 'p' | No | HTML tag used for the rendered text node. |
| `size` | `'lg' \| 'md' \| 'sm'` | 'md' | No | Typography scale for lead, default, and compact text. |
| `tone` | `'muted' \| 'primary' \| 'subtle'` | 'primary' | No | Reading emphasis for body or supporting copy. |
| `weight` | `'medium' \| 'regular' \| 'semibold'` | 'regular' | No | Font weight variation for inline emphasis without leaving body-copy rhythm. |

## Accessibility

- Keeps native text semantics through the selected HTML tag instead of introducing custom widget roles.
- Tone changes are visual only; important distinctions should still be stated in the text itself.
- Use strong sparingly so emphasis remains meaningful in assistive reading order.

## Storybook Contract

- Must consume `publicComponentDocs.Text` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
