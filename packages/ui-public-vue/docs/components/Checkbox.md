# Checkbox

Explicit inclusion control for independent yes/no choices that should not feel like a runtime switch.

## Category

`form`

## Usage

- Use checkbox for inclusion, consent, or independent options.
- Use switch instead when the setting applies immediately as an on/off runtime toggle.
- Disabled checked state is acceptable for inherited or locked configuration.

## Decision Guidance

- Use for independent inclusion, consent, or opt-in choices.
- Use checked disabled state for inherited or locked configuration that must remain visible.

## Composition

- Pair with Input and Select in submission forms, especially where consent or optional reveal matters.
- Use description to clarify legal, notification, or personalization consequences.

## Anti-patterns

- Do not use Checkbox for immediate runtime toggles; use Switch instead.
- Do not rely on checked state alone for legally meaningful consent copy.

## States

| State | Description |
| --- | --- |
| Checked | Selected inclusion state with aria-checked=true. |
| Unchecked | Available option not currently selected. |
| Disabled | Read-only or unavailable option state. |
| With description | Clarifies why the option exists or what it affects. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `modelValue` | `boolean` | false | No | Controlled checked state. |
| `label` | `string` | - | No | Visible checkbox label. |
| `description` | `string` | - | No | Supporting copy under the label. |
| `disabled` | `boolean` | false | No | Disables selection changes. |

## Accessibility

- Uses role=checkbox and aria-checked.
- Keyboard activation is inherited from the native button.
- The check icon is hidden from assistive technology.

## Storybook Contract

- Must consume `publicComponentDocs.Checkbox` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
