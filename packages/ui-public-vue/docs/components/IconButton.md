# Icon Button

Compact icon-only action control for local toolbars, media controls, quick recovery, and small support exits with a required accessible label.

## Category

`actions`

## Usage

- Use when the surrounding surface already explains the context and a compact icon action prevents action lanes from becoming noisy.
- Keep the icon decorative and provide ariaLabel so the action remains understandable to assistive technology.
- Use danger tone only for local reversible or clearly explained destructive actions.

## Decision Guidance

- Use when the action is local, repeated, or visually secondary enough that a text Button would overcrowd the lane.
- Use Button instead when the action is the main next step or needs visible wording to explain consequence.

## Composition

- Pair with Toolbar, Card media controls, List rows, Tooltip, or Alert recovery lanes when the icon action has clear local context.
- Use pressed only when the icon itself represents an on/off state; pair state changes with nearby content when the consequence is not obvious.
- Keep a nearby title, label, or tooltip-style explanation available for uncommon icons; ariaLabel is required but not a substitute for unclear UX.

## Anti-patterns

- Do not use Icon Button as global navigation, a command palette trigger, a hidden primary CTA, or a decorative sparkle control.
- Do not add pressed to ordinary actions such as copy, open, next, or delete; those are activations, not toggle state.
- Do not ship icon-only buttons with vague labels such as action, more, or click.

## States

| State | Description |
| --- | --- |
| Tone | ghost, primary, secondary, and danger map compact actions to the same hierarchy discipline as Button. |
| Size | sm, md, and lg cover dense toolbars, default touch targets, and media surfaces. |
| Busy | loading replaces the icon with a spinner, disables interaction, and exposes aria-busy. |
| Pressed | pressed exposes aria-pressed only for toggle-style icon actions such as favorite, mute, or pin. |
| Disabled | disabled preserves the compact footprint while clearly blocking interaction. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ariaLabel` | `string` | - | Yes | Accessible name for the icon-only action; must describe the action result. |
| `tone` | `'danger' \| 'ghost' \| 'primary' \| 'secondary'` | 'ghost' | No | Compact action hierarchy and risk emphasis. |
| `size` | `'sm' \| 'md' \| 'lg'` | 'md' | No | Square tap target scale. |
| `loading` | `boolean` | false | No | Shows a compact spinner, disables interaction, and sets aria-busy. |
| `pressed` | `boolean` | - | No | Optional pressed state for toggle-style icon actions; omitted for one-shot actions. |
| `disabled` | `boolean` | false | No | Disables the native button. |
| `type` | `'button' \| 'reset' \| 'submit'` | 'button' | No | Native button type. |

## Accessibility

- Uses a native button element with required aria-label for the icon-only affordance.
- The slotted icon is hidden from assistive technology so the label remains the single action name.
- Only toggle-style uses should pass pressed so aria-pressed does not mislabel ordinary one-shot actions.
- Loading state sets aria-busy and disables duplicate activation while preserving focus styling.

## Storybook Contract

- Must consume `publicComponentDocs.IconButton` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
