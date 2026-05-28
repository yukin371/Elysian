# Kbd

Inline keyboard-hint primitive for shortcuts, command hints, review steps, and keyboard affordances where key labels should stay consistent without becoming decorative badges.

## Category

`content`

## Usage

- Use Kbd when a visible key or shortcut helps users operate a nearby control, review lane, or support instruction.
- Use keys for shortcut combinations and the default slot for a single inline key inside prose.
- Keep keyboard hints near the control or instruction they explain so they remain contextual rather than ornamental.

## Decision Guidance

- Use when a keyboard hint makes an existing interaction easier to discover without creating a new action surface.
- Use only for visible shortcut guidance; the actual keyboard listener belongs to the component or page that owns the behavior.

## Composition

- Pair with Text, Tooltip, Input helper copy, Tabs keyboard review, or support instructions near the affected control.
- Use muted tone for low-priority hints and primary or accent only when shortcut discovery is part of the current task.

## Anti-patterns

- Do not use Kbd as a Badge, Chip, CTA, status label, command palette, or shortcut registration system.
- Do not show shortcuts that the surrounding component does not actually support.

## States

| State | Description |
| --- | --- |
| Single key | A single kbd element keeps inline key hints compact inside Text, labels, or help copy. |
| Key sequence | The keys prop renders each key separately with an accessible separator so shortcut combinations remain scannable. |
| Tone | Neutral, primary, accent, and muted tones adjust emphasis without turning keyboard hints into badges or buttons. |
| Size | sm and md sizes support dense helper copy and normal review instructions while preserving the same radius scale. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `keys` | `string[]` | [] | No | Optional ordered key labels rendered as a shortcut sequence. |
| `tone` | `'accent' \| 'muted' \| 'neutral' \| 'primary'` | 'neutral' | No | Visual emphasis for the inline keyboard hint. |
| `size` | `'md' \| 'sm'` | 'md' | No | Keyboard hint density for inline or compact contexts. |
| `separatorLabel` | `string` | 'then' | No | Screen-reader phrase inserted between keys in a shortcut sequence. |

## Accessibility

- Uses native kbd elements so key labels keep their text semantics.
- Shortcut separators include screen-reader text instead of relying on the plus sign alone.
- Kbd is presentational guidance only; the surrounding component must own the actual keyboard behavior.

## Storybook Contract

- Must consume `publicComponentDocs.Kbd` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
