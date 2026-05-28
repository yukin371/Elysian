# Chip

Compact selected-item token for filters, preferences, and removable context where Badge would be too passive and Button would be too loud.

## Category

`feedback`

## Usage

- Use Chip to show selected filters, selected traits, or lightweight preference tokens.
- Use removable only when the token can be safely dismissed from the current local context.
- Keep labels short and pair selected state with visible copy rather than relying on color.

## Decision Guidance

- Use when the user needs to see selected local context, filters, or traits as compact tokens.
- Use Chip instead of Badge when a token can be removed or represents active selection.

## Composition

- Pair with Input, Select, or Radio Group to summarize active choices without adding another nested card.
- Use near the surface it filters or configures so removal feels local and reversible.

## Anti-patterns

- Do not use Chip for status-only labels; use Badge when nothing can be selected or removed.
- Do not use Chip as a primary action, navigation tab, or replacement for Checkbox/Radio Group decisions.

## States

| State | Description |
| --- | --- |
| Neutral | Default chip for calm filters, traits, and local metadata that can sit beside content. |
| Primary | Selected or brand-aligned chip when the token participates in the active local filter set. |
| Accent | Editorial or ceremonial chip used sparingly for expressive public themes. |
| Removable | Optional close button exposes a focused removal action without turning the whole chip into a button. |
| Disabled | Preserves inherited or unavailable tokens while disabling removal. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tone` | `'accent' \| 'neutral' \| 'primary'` | 'neutral' | No | Visual emphasis for the selected item token. |
| `selected` | `boolean` | false | No | Marks the token as part of the active local selection. |
| `removable` | `boolean` | false | No | Shows a dedicated remove button inside the chip. |
| `removeLabel` | `string` | 'Remove chip' | No | Accessible label for the remove button. |
| `disabled` | `boolean` | false | No | Disables chip removal and lowers emphasis. |

## Accessibility

- The chip label remains plain readable text in surrounding order.
- Removable chips expose a native button with an accessible remove label.
- Do not use the chip container itself as an unlabeled custom interactive control.

## Storybook Contract

- Must consume `publicComponentDocs.Chip` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
