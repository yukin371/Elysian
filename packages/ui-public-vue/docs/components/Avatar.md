# Avatar

Identity surface for public profiles, creator previews, and participant rows with image, initials fallback, governed shape, and status indicator.

## Category

`content`

## Usage

- Use Avatar for people, creators, teams, or identity anchors; do not use it as a decorative icon container.
- Provide name or alt text so fallback initials and accessible labels remain meaningful.
- Use status only when presence changes user decisions, such as chat availability or live collaboration.

## Decision Guidance

- Use when identity, authorship, or presence affects trust, collaboration, or selection.
- Use status only when availability changes what the user can do next.

## Composition

- Pair with Text for creator names and helper copy, or Card for identity previews.
- Use Avatar in rows and profile headers; keep decorative icons separate from identity surfaces.

## Anti-patterns

- Do not use Avatar as a generic icon container.
- Do not rely on presence color without a visible status or surrounding explanation.

## States

| State | Description |
| --- | --- |
| Image | Renders a supplied image with the same radius, border, and surface treatment. |
| Initials | Falls back to derived initials when no image is provided or image loading fails. |
| Size | sm, md, and lg cover dense lists, default identity rows, and creator profile headers. |
| Presence | online, away, busy, and offline status dots are available when presence is meaningful. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `src` | `string` | - | No | Optional image source used before fallback initials. |
| `name` | `string` | - | No | Display name used to derive fallback initials. |
| `alt` | `string` | - | No | Accessible label for the image or fallback identity surface. |
| `size` | `'sm' \| 'md' \| 'lg'` | 'md' | No | Avatar scale for list, default, and profile contexts. |
| `shape` | `'circle' \| 'soft' \| 'square'` | 'soft' | No | Avatar silhouette; circle is reserved for identity imagery only. |
| `status` | `'away' \| 'busy' \| 'offline' \| 'online'` | - | No | Optional presence indicator shown at the lower edge. |

## Accessibility

- Image avatars receive alt text from alt, name, or a safe Avatar fallback.
- Initial fallback renders with role=img and an accessible label.
- Presence dots include a status label and should not be the only visible availability cue in complex flows.

## Storybook Contract

- Must consume `publicComponentDocs.Avatar` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
