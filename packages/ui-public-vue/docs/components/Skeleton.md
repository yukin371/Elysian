# Skeleton

Loading placeholder that preserves layout rhythm without turning loading into decorative spectacle.

## Category

`feedback`

## Usage

- Use skeletons when content structure is known but data is still loading.
- Match the number of lines to expected content density.
- Use soft tone inside already decorative cards to avoid over-animation.

## Decision Guidance

- Use while known content structure is loading and layout stability matters.
- Use soft tone inside already ornate or dense surfaces.

## Composition

- Pair with a separate status message for long waits or blocked loading.
- Replace with content, Alert, or Empty State once the data outcome is known.

## Anti-patterns

- Do not use Skeleton as final empty content.
- Do not animate loading placeholders so strongly that they become the focal point.

## States

| State | Description |
| --- | --- |
| Default | Standard placeholder with avatar and line rhythm. |
| Soft | Lower-contrast placeholder for dense or nested surfaces. |
| Line count | lines controls supporting placeholder rows. |
| Decorative | Hidden from assistive technology because it does not add content. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `lines` | `number` | 3 | No | Number of supporting placeholder lines. |
| `tone` | `'default' \| 'soft'` | 'default' | No | Placeholder contrast level. |

## Accessibility

- Skeleton markup is aria-hidden.
- Pair long loading regions with a separate status message when needed.
- Do not use skeleton as final empty content.

## Storybook Contract

- Must consume `publicComponentDocs.Skeleton` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
