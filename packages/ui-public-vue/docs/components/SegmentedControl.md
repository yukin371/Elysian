# Segmented Control

Compact single-choice control for nearby view, density, tone, or mode preferences without opening a menu or switching panels.

## Category

`form`

## Usage

- Use when two to four short options affect the current surface immediately.
- Keep labels brief because the control is optimized for compact preference switching.
- Use Radio Group instead when each option needs visible descriptions or form-level comparison.

## Decision Guidance

- Use for compact view, density, tone, or mode choices that affect the current surface.
- Use when labels are short and the user benefits from seeing every option at once.

## Composition

- Pair with preview lanes, toolbars, or settings rows where the selected value changes nearby content.
- Keep supporting explanation outside the control so the segment itself stays concise and scannable.

## Anti-patterns

- Do not use Segmented Control to switch full content panels; use Tabs for local sections.
- Do not use it for long option sets, destructive choices, route navigation, or submit confirmation.

## States

| State | Description |
| --- | --- |
| Selected | One segment owns aria-checked=true and receives the active surface treatment. |
| Unselected | Inactive segments remain visible and reachable through roving focus. |
| Keyboard | Arrow keys, Home, and End move selection without leaving the compact group. |
| Compact | Short labels keep the control readable in toolbars, preview lanes, and preference panels. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicSegmentedItem[]` | - | Yes | Segment key, value, label, and optional assistive description definitions. |
| `modelValue` | `string` | '' | No | Controlled selected segment value. |
| `ariaLabel` | `string` | 'Segmented options' | No | Accessible label for the compact radiogroup. |

## Accessibility

- Uses role=radiogroup and role=radio for single-choice semantics.
- aria-checked reflects the selected segment.
- Roving tabindex keeps focus movement predictable with Arrow, Home, and End keys.

## Storybook Contract

- Must consume `publicComponentDocs.SegmentedControl` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
