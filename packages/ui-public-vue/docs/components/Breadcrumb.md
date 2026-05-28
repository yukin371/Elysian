# Breadcrumb

Compact route hierarchy primitive for public pages that need orientation, quiet backtracking, and a visible current location without turning local sections into tabs.

## Category

`navigation`

## Usage

- Use Breadcrumb when the user arrives deep in a collection, event, account, or editorial flow and needs to understand the parent path.
- Keep the trail short and stable; collapse the information architecture elsewhere instead of making the breadcrumb carry a full menu.
- Use the current item for location only, not as a clickable call to action.

## Decision Guidance

- Use when route hierarchy helps orientation more than a single back link or local tabs.
- Use maxItems when a deep but stable path would otherwise dominate the page or wrap before the user reaches the heading.
- Use only for stable ancestry; if the path is a user filter or wizard step, use Chip, Tabs, or Progress instead.

## Composition

- Place near the top of detail, editorial, event, and account pages before the local heading or hero evidence.
- Collapse only the middle of deep ancestry; keep the first parent and current page visible so users retain context.
- Pair with Link for support exits and Tabs for local sections, but keep Breadcrumb responsible for ancestry only.

## Anti-patterns

- Do not use Breadcrumb as global navigation, category filters, or a progress stepper.
- Do not make the current page clickable or style every ancestor as a primary action.

## States

| State | Description |
| --- | --- |
| Linked ancestors | Earlier items can be anchors so users can return to stable parent surfaces without competing with the main action. |
| Current page | The final or explicitly current item is rendered as the location marker with aria-current=page. |
| Wrapping | The list wraps instead of overflowing so long route names remain usable on narrow public surfaces. |
| Collapsed middle | maxItems can preserve the first and final route levels while replacing middle ancestry with an accessible overflow marker. |
| Separator | The separator is decorative while screen-reader-only copy preserves meaningful level changes. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicBreadcrumbItem[]` | - | Yes | Ordered breadcrumb items with label, optional href, and optional current flag. |
| `ariaLabel` | `string` | 'Breadcrumb' | No | Accessible label for the breadcrumb navigation region. |
| `maxItems` | `number` | - | No | Optional display cap; values below 3 are ignored so ancestry never collapses into only an ellipsis. |
| `overflowLabel` | `string` | 'Collapsed route levels' | No | Accessible label for the non-interactive overflow marker when maxItems collapses the middle of the trail. |
| `separatorLabel` | `string` | 'Next level' | No | Screen-reader-only phrase announced between visual breadcrumb levels. |

## Accessibility

- Uses a nav landmark with an ordered list so route hierarchy is available to assistive technology.
- The current location exposes aria-current=page and is not rendered as a redundant link.
- Collapsed middle levels are announced with an overflow label and hidden count instead of becoming an unlabeled punctuation mark.
- Separators are visual only; labels should still make the route understandable without relying on punctuation.

## Storybook Contract

- Must consume `publicComponentDocs.Breadcrumb` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
