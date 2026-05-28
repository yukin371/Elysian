# Image

Governed media surface for public cards, gallery previews, and editorial highlights with aspect presets, loading skeleton, and resilient fallback behavior.

## Category

`content`

## Usage

- Use Image when the layout depends on a stable preview frame rather than a raw img tag with uncontrolled ratios.
- Choose the aspect preset based on the surrounding composition so card rhythm stays consistent across theme families.
- Always provide alt text when the image carries meaning; decorative media should remain visually supportive rather than becoming the only source of context.

## Decision Guidance

- Use when a stable media frame is part of the layout contract, not just decoration.
- Choose aspect by composition role: landscape for cards, portrait for profiles, square for compact identity or gallery items.

## Composition

- Pair with Card, Text, and Badge when imagery introduces an editorial or event surface.
- Use fallback behavior intentionally so failed media still preserves rhythm and accessible context.

## Anti-patterns

- Do not use raw img tags in public-luxe patterns when aspect, fallback, or skeleton behavior matters.
- Do not let imagery carry the only meaningful information.

## States

| State | Description |
| --- | --- |
| Loading | A restrained skeleton preserves layout while the media source is resolving. |
| Loaded | The image fades into the framed surface without changing the component silhouette. |
| Fallback | Missing or failed sources switch to a controlled branded fallback instead of collapsing the card. |
| Aspect and fit | landscape, portrait, square, and wide presets combine with contain or cover to protect composition. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `src` | `string` | - | No | Optional image source for the media surface. |
| `alt` | `string` | '' | No | Accessible text for meaningful imagery and fallback labeling. |
| `aspect` | `'landscape' \| 'portrait' \| 'square' \| 'wide'` | 'landscape' | No | Preset aspect ratio used to stabilize composition. |
| `fit` | `'contain' \| 'cover'` | 'cover' | No | Media fitting strategy inside the framed surface. |
| `showSkeleton` | `boolean` | true | No | Keeps the loading placeholder visible before media resolves. |
| `shape` | `'soft' \| 'square'` | 'soft' | No | Chooses the component corner treatment within the public preset. |

## Accessibility

- Meaningful media should provide alt text; decorative imagery should be accompanied by visible nearby context.
- Fallback mode uses role=img with an accessible label so the frame does not become silent when media fails.
- The skeleton is aria-hidden because it communicates layout rhythm, not content.

## Storybook Contract

- Must consume `publicComponentDocs.Image` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
