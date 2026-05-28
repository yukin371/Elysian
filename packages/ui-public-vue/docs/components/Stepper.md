# Stepper

Sequential journey primitive for onboarding, checkout, publishing, and review flows where users need to understand current step, completed work, and blocked repair without mistaking the flow for tabs or pagination.

## Category

`navigation`

## Usage

- Use Stepper when the user moves through a small ordered journey and the order itself changes what they should do next.
- Keep steps few, stable, and named by outcome; long dynamic workflows should use a dedicated route or task list instead.
- Use interactive mode only when revisiting earlier safe steps is allowed by the surrounding flow.

## Decision Guidance

- Use when the user must understand where they are in a short ordered journey before choosing the next action.
- Use Pagination for bounded collection movement, Tabs for local sections, and Progress for completion amount.

## Composition

- Pair with Alert when a step needs repair, and with Button for the single next action outside the stepper itself.
- Place above the affected form or review surface so the flow explains context without becoming another card layer.

## Anti-patterns

- Do not use Stepper as global navigation, category filtering, or decorative progress ornament.
- Do not make blocked future steps clickable when the surrounding flow cannot safely restore that state.

## States

| State | Description |
| --- | --- |
| Current | The active step is marked with aria-current=step and receives the primary container treatment. |
| Complete | Completed steps use success semantics so finished work is visible without becoming another primary action. |
| Upcoming | Future steps stay quiet and readable, preserving the user's focus on the current decision. |
| Error and disabled | Error marks the step that needs repair while disabled blocks unreachable steps through native disabled behavior. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicStepItem[]` | - | Yes | Ordered step items with key, label, optional description, and optional status override. |
| `modelValue` | `string` | - | No | Controlled active step key; defaults to the first item when omitted. |
| `interactive` | `boolean` | false | No | Allows safe step selection and emits update:modelValue from step buttons. |
| `orientation` | `'horizontal' \| 'vertical'` | 'horizontal' | No | Controls compact horizontal lanes or vertical review rhythm. |
| `ariaLabel` | `string` | 'Steps' | No | Accessible label for the step navigation region. |

## Accessibility

- Uses a nav landmark with an ordered list so the flow order is available to assistive technology.
- The current step exposes aria-current=step rather than relying on color or ornament alone.
- Interactive steps use native buttons and disabled steps use native disabled behavior.

## Storybook Contract

- Must consume `publicComponentDocs.Stepper` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
