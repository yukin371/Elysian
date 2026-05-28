# Alert

Semantic feedback surface for explaining status, risk, success, and next action inside the public preset.

## Category

`feedback`

## Usage

- Use alerts for state explanation plus a possible next step.
- Use warning and danger only when user attention or correction is required.
- Keep alert copy concise; move long remediation into linked details.

## Decision Guidance

- Use when status, risk, success, or correction needs a visible explanation.
- Use warning and danger only when user attention or recovery is required.

## Composition

- Pair with Button or Link only when there is a clear remediation path.
- Use dismissible only for advisory or already-resolved feedback; required repair alerts should remain visible until the surrounding state changes.
- Use near the affected surface so feedback does not feel detached from the action.

## Anti-patterns

- Do not use Alert as a decorative color band.
- Do not hide the actual recovery step in long alert copy.

## States

| State | Description |
| --- | --- |
| Info | Neutral operational update. |
| Success | Confirmed positive outcome. |
| Warning | Recoverable issue or guardrail requiring attention. |
| Danger | Error, destructive risk, or blocked state. |
| Dismissible | Optional close affordance for advisory alerts that can be safely removed without hiding required recovery instructions. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tone` | `'danger' \| 'info' \| 'success' \| 'warning'` | 'info' | No | Semantic alert tone. |
| `title` | `string` | 'System notice' | No | Visible heading that summarizes the alert state. |
| `eyebrow` | `string` | - | No | Optional compact label rendered above the alert title. |
| `dismissible` | `boolean` | false | No | Shows a close control and emits dismiss when the alert can be safely removed. |
| `dismissLabel` | `string` | 'Dismiss alert' | No | Accessible label for the dismiss control. |

## Accessibility

- Danger and warning use role=alert.
- Info and success use role=status.
- Action slot should not be the only way to understand the alert.
- Dismissible alerts need a clear accessible dismiss label and should not hide required recovery steps.

## Storybook Contract

- Must consume `publicComponentDocs.Alert` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
