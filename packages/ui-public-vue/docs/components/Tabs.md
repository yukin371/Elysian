# Tabs

Section switcher for compact public surfaces with roving focus, active panel linkage, and item descriptions.

## Category

`navigation`

## Usage

- Use tabs to switch sections within one context, not to replace page navigation.
- Keep the number of tabs small enough to scan on mobile.
- Descriptions should clarify the section's job rather than become marketing copy.

## Decision Guidance

- Use to switch peer sections inside one surface or workflow context.
- Use when sections are few, stable, and equal in hierarchy.

## Composition

- Pair Tabs with Card or pattern sections where the panel content remains in the same owner.
- Use descriptions when adjacent tabs have similar labels but different consequences.

## Anti-patterns

- Do not use Tabs for global route navigation.
- Do not hide critical form steps behind tabs when completion order matters.

## States

| State | Description |
| --- | --- |
| Active | Active key controls the selected tab and visible panel. |
| Keyboard | Arrow keys, Home, and End move selection and focus. |
| Descriptions | Optional descriptions help distinguish adjacent workflow stages. |
| Panel | Default slot receives activeItem and activeKey. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicTabItem[]` | - | Yes | Tab key, label, and optional description definitions. |
| `modelValue` | `string` | - | No | Controlled active tab key. |
| `ariaLabel` | `string` | 'Tabs' | No | Accessible label for the tablist. |
| `idBase` | `string` | - | No | Optional stable id prefix for tab and panel linkage. |

## Accessibility

- Uses role=tablist, role=tab, and role=tabpanel.
- Tabs and panels are connected with aria-controls and aria-labelledby.
- Roving tabindex keeps keyboard focus predictable.

## Storybook Contract

- Must consume `publicComponentDocs.Tabs` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
