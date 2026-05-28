# Toolbar

Flat local action lane for grouping primary actions, secondary actions, compact view controls, and support exits without adding another card layer.

## Category

`actions`

## Usage

- Use Toolbar when related controls belong to the same current surface and should scan as one action lane.
- Keep one primary action visible; move lower-frequency choices into Menu or a quiet Link.
- Use compact density for review headers, mobile preference rows, and dense creator work surfaces.

## Decision Guidance

- Use when a surface needs a visible action lane that groups a primary action, local settings, and support exits.
- Use it to reduce card nesting when controls are siblings rather than independent content sections.

## Composition

- Pair with Button, Segmented Control, Menu, Badge, and Link to express action hierarchy in one flat row.
- Use leading slot for current context and trailing slot for quiet exits or secondary support.

## Anti-patterns

- Do not use Toolbar as global navigation, application shell, table command bar, or full form layout.
- Do not place multiple equally strong primary actions in one toolbar; split the workflow or demote secondary actions.

## States

| State | Description |
| --- | --- |
| Grouped | The root exposes role=group and an accessible label while child controls keep their native semantics. |
| Leading and trailing | Optional slots can pin context or support exits without creating nested layout containers. |
| Density | comfortable and compact adjust spacing only; they do not change action hierarchy or theme roles. |
| Responsive | The action lane stacks on narrow screens so controls remain reachable without horizontal overflow. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ariaLabel` | `string` | 'Toolbar' | No | Accessible label for the grouped local action lane. |
| `density` | `'comfortable' \| 'compact'` | 'comfortable' | No | Controls toolbar spacing without changing semantics. |
| `justify` | `'between' \| 'end' \| 'start'` | 'between' | No | Controls horizontal distribution of the toolbar groups. |

## Accessibility

- Uses role=group instead of claiming a custom roving ARIA toolbar model.
- The toolbar label names the local action set; child controls keep Button, Link, Menu, or radiogroup semantics.
- Responsive stacking preserves DOM order so keyboard and reading order remain predictable.

## Storybook Contract

- Must consume `publicComponentDocs.Toolbar` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
