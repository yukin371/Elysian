# Menu

Lightweight action-menu primitive for secondary actions, local item operations, support exits, and compact overflow choices that should not become another row of primary buttons.

## Category

`actions`

## Usage

- Use Menu when a surface has several low-frequency actions and one visible trigger keeps the main decision path clear.
- Keep menu items short, specific, and local to the surface that owns the action.
- Use disabled, current, danger, and href items only when those states reflect real interaction or navigation semantics.

## Decision Guidance

- Use when a local surface has several secondary actions and a single trigger keeps the main path calm.
- Use Button for the primary commitment, Link for visible navigation, and Tabs or Breadcrumb when the user needs orientation rather than overflow actions.

## Composition

- Pair with Button, List, Alert, or DescriptionList when overflow actions need to stay attached to one current item or panel.
- Keep items single-level, short, and action-specific; separate meaning with descriptions and meta text rather than nested submenus.

## Anti-patterns

- Do not use Menu as global navigation, route hierarchy, command palette, or a hidden replacement for the page primary action.
- Do not hide destructive, legal, pricing, or irreversible consequences behind vague labels without visible surrounding explanation.

## States

| State | Description |
| --- | --- |
| Closed and open | The trigger owns aria-expanded and controls a single menu panel that appears only while open. |
| Action and link items | Items can render as buttons for local actions or anchors for lightweight exits without becoming global navigation. |
| Disabled and current | Disabled items remain visible but cannot be focused or selected; current links expose aria-current. |
| Keyboard review | Arrow keys, Home, End, Escape, Enter, and Space support basic menu operation without a command-palette abstraction. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicMenuItem[]` | - | Yes | Ordered menu items with key, label, optional description, optional meta, href, disabled/current flags, and optional tone. |
| `open` | `boolean` | - | No | Optional controlled open state; omit it to let the component manage local disclosure. |
| `triggerLabel` | `string` | 'More actions' | No | Visible fallback label for the menu trigger slot. |
| `ariaLabel` | `string` | 'Action menu' | No | Accessible label for the menu panel. |
| `align` | `'end' \| 'start'` | 'start' | No | Horizontal alignment of the floating menu panel. |
| `placement` | `'bottom' \| 'top'` | 'bottom' | No | Vertical placement of the floating menu panel. |
| `disabled` | `boolean` | false | No | Disables the trigger and prevents opening the menu. |

## Accessibility

- The trigger is a native button with aria-haspopup=menu, aria-expanded, and aria-controls.
- The panel uses role=menu and items use role=menuitem while preserving native button or anchor behavior.
- Keyboard support includes open from Enter/Space/Arrow keys, item movement with arrows, Home/End, Escape close, and outside-click dismissal.

## Storybook Contract

- Must consume `publicComponentDocs.Menu` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
