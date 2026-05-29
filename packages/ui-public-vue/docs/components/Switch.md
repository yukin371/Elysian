# Switch

Binary runtime toggle for public settings where the state changes immediately and must be visually obvious.

## Category

`form`

## Usage

- Use switch for on/off settings, not for selecting one item from many choices.
- Pair every switch with a label; add description when the consequence is not obvious.
- Use disabled for unavailable runtime paths, not for completed choices.

## Decision Guidance

- Use for binary runtime settings that apply immediately.
- Use only when on and off are both understandable from the label and description.

## Composition

- Pair with Text descriptions in settings or preference panels.
- Use alongside Radio Group only when runtime toggles and single-choice preferences are clearly separate.

## Anti-patterns

- Do not use Switch for consent, inclusion, or delayed submission decisions; use Checkbox instead.
- Do not hide consequences behind a bare on/off label.

## States

| State | Description |
| --- | --- |
| Checked | Enabled state with luminous emphasis and aria-checked=true. |
| Unchecked | Off state with subdued control treatment. |
| Disabled | Preserves state visibility while blocking interaction. |
| With description | Supports explanatory copy beside the control. |
| Invalid | Repair copy is linked through aria-describedby when a preference cannot be accepted. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `boolean` | false | No | Controlled checked state. |
| `label` | `string` | - | No | Visible switch label. |
| `description` | `string` | - | No | Supporting copy under the label linked through aria-describedby. |
| `invalidMessage` | `string` | - | No | Actionable preference repair message linked through aria-describedby. |
| `id` | `string` | - | No | Optional id for the switch button and generated helper ids. |
| `disabled` | `boolean` | false | No | Disables state changes. |

## Accessibility

- Uses role=switch and aria-checked.
- Keyboard activation is inherited from the native button.
- Description and invalid copy are connected through aria-describedby when present.
- Visible labels should explain the setting without relying on color.

## Storybook Contract

- Must consume `publicComponentDocs.Switch` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
