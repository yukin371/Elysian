# Button

Primary public-facing action surface with restrained radii, luminous tone, loading feedback, and clear disabled semantics.

## Category

`actions`

## Usage

- Use primary for the page's main next step, secondary for peer actions, and ghost for low-emphasis exits.
- Keep labels action-oriented and short; avoid decorative buttons that do not trigger a user-visible change.
- Use block layout only in narrow forms or mobile stacked action lanes.

## Decision Guidance

- Use when the user can commit, save, claim, publish, reserve, or continue from the current surface.
- Prefer one primary Button per local decision area; use secondary or ghost only when the alternate path is genuinely lower priority.

## Composition

- Pair with Text or Alert when the consequence needs explanation before activation.
- In forms and event landings, place Button after evidence such as Progress, Stat, or validation copy.

## Anti-patterns

- Do not use Button as a decorative badge, category label, or inline navigation link.
- Do not place several primary buttons in one card to create visual excitement.

## States

| State | Description |
| --- | --- |
| Tone | primary, secondary, and ghost cover the public preset hierarchy. |
| Size | sm, md, and lg map to compact controls, default flows, and hero actions. |
| Busy | loading disables the control and exposes aria-busy. |
| Disabled | disabled removes the action from interaction without changing copy. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tone` | `'primary' \| 'secondary' \| 'ghost'` | 'primary' | No | Visual hierarchy of the action. |
| `size` | `'sm' \| 'md' \| 'lg'` | 'md' | No | Button density and tap target scale. |
| `loading` | `boolean` | false | No | Shows spinner, disables interaction, and sets aria-busy. |
| `block` | `boolean` | false | No | Expands the button to the width of its container. |
| `disabled` | `boolean` | false | No | Disables the native button. |
| `type` | `'button' \| 'submit' \| 'reset'` | 'button' | No | Native button type. |

## Accessibility

- Uses a native button element.
- Loading state sets aria-busy and disables accidental duplicate submission.
- Visible focus treatment is provided by the public preset CSS.

## Storybook Contract

- Must consume `publicComponentDocs.Button` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
