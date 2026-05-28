# Card

Public luxe content surface for previews, feature summaries, and action groups without falling back to enterprise panels.

## Category

`content`

## Usage

- Use cards for stable content grouping, not for every small visual block.
- Choose feature emphasis for one hero-level card per section.
- Keep footer actions secondary to the card's content hierarchy.

## Decision Guidance

- Use when a surface needs one coherent content, action, or summary group.
- Use featured tone sparingly for the local focus surface; surrounding cards should stay quieter.

## Composition

- Compose Card with Stat, Image, Text, Badge, Divider, and footer actions instead of nesting more cards.
- Keep one primary action in the footer and move secondary paths to ghost Button or Link.

## Anti-patterns

- Do not solve hierarchy by stacking cards inside cards.
- Do not give every sibling card featured treatment.

## States

| State | Description |
| --- | --- |
| Default | Balanced surface for everyday public content blocks. |
| Feature | Adds more atmosphere for lead cards and promotional moments. |
| Muted | Reduces chrome for dense support content. |
| Slots | Header and footer slots allow custom composition without a second card owner. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `eyebrow` | `string` | - | No | Small category label above the title. |
| `title` | `string` | - | No | Card title rendered as h3 by default. |
| `subtitle` | `string` | - | No | Supporting copy below the title. |
| `emphasis` | `'default' \| 'feature' \| 'muted'` | 'default' | No | Surface intensity within the same theme language. |

## Accessibility

- Uses article semantics for self-contained content.
- Default title renders as a heading for page structure.
- Slots keep custom markup under caller control when stronger semantics are needed.

## Storybook Contract

- Must consume `publicComponentDocs.Card` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
