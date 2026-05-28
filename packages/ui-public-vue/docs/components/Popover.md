# Popover

Lightweight non-modal context panel for richer local guidance, previews, and decision support that should stay attached to a trigger without becoming a menu or dialog.

## Category

`feedback`

## Usage

- Use Popover when a nearby trigger needs structured context, a short preview, or one small support action.
- Keep the panel local and bounded; move long forms, destructive confirmation, or route-level review into Dialog or a page pattern.
- Use accent tone only for one branded or ceremonial help moment, not for every support panel on the page.

## Decision Guidance

- Use when contextual help needs structure, a small preview, or one local support action but should not interrupt the flow.
- Use Tooltip for one-sentence hints, Menu for action lists, and Dialog when the user must confirm or complete a focused interruption.

## Composition

- Pair with Text, Badge, Stat, Link, Button, or Alert when a local concept needs proof, preview, and a safe support path.
- Keep Popover beside the trigger it explains and use actions sparingly so it does not become a hidden mini page.

## Anti-patterns

- Do not use Popover as global navigation, a command menu, a form drawer, a modal confirmation, or a full help center.
- Do not hide required validation, pricing, legal consent, or destructive consequences inside a popover-only panel.

## States

| State | Description |
| --- | --- |
| Closed and open | The trigger owns aria-expanded and controls one non-modal panel that appears only while open. |
| Placement and alignment | Top or bottom placement plus start or end alignment keeps the panel attached to its trigger and away from global layout. |
| Neutral and accent | Neutral handles routine support context, while accent marks a rare branded preview or theme-specific explanation. |
| Dismissal | Escape, outside click, and the visible close button all close the panel without trapping the user in a modal flow. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | - | No | Optional controlled open state; omit it to let the component manage local disclosure. |
| `title` | `string` | '' | No | Optional panel title used as the dialog label when present. |
| `description` | `string` | '' | No | Optional panel helper text connected through aria-describedby. |
| `placement` | `'bottom' \| 'top'` | 'bottom' | No | Vertical placement of the context panel. |
| `align` | `'end' \| 'start'` | 'start' | No | Horizontal alignment of the panel relative to the trigger. |
| `tone` | `'accent' \| 'neutral'` | 'neutral' | No | Visual emphasis for the trigger and panel frame. |
| `triggerLabel` | `string` | 'Open context panel' | No | Fallback visible trigger label. |
| `closeLabel` | `string` | 'Close context panel' | No | Accessible label for the close button. |

## Accessibility

- The trigger is a native button with aria-haspopup=dialog, aria-expanded, and aria-controls.
- The panel uses role=dialog with aria-modal=false so it remains a local context panel rather than a modal trap.
- Escape, outside click, and the visible close button provide dismissal paths; essential instructions should still remain visible outside the popover.

## Storybook Contract

- Must consume `publicComponentDocs.Popover` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
