# Accordion

Progressive disclosure primitive for FAQ, policy notes, settings explanations, and compact editorial details that should stay readable without adding nested cards.

## Category

`content`

## Usage

- Use Accordion when related content can be disclosed on demand while the surrounding surface keeps one main decision.
- Keep titles specific and outcome-oriented so users can decide whether to open a section before reading the body.
- Use multiple mode only when comparing several open explanations is useful and does not bury the main action.

## Decision Guidance

- Use when the page needs optional detail without changing route, step, or primary action hierarchy.
- Use Tabs for peer sections, Dialog for focused interruption, and Text when the content must always remain visible.

## Composition

- Pair with Text, Link, or Alert when a disclosed answer needs supporting copy or a recovery path.
- Place inside the current surface as a low-layer disclosure, not as a new card stack around every answer.

## Anti-patterns

- Do not hide validation errors, pricing consequences, legal consent, or irreversible warnings inside Accordion.
- Do not use Accordion as a replacement for navigation, route hierarchy, or a long document table of contents.

## States

| State | Description |
| --- | --- |
| Collapsed | Closed sections keep the title visible and preserve page rhythm without creating hidden navigation. |
| Expanded | Open sections expose a region linked to the trigger through aria-controls and aria-labelledby. |
| Single open | Default behavior keeps one section open at a time so disclosure does not become another page layout. |
| Multiple open | Multiple mode allows several sections to remain open for FAQ, policy, or comparison contexts. |
| Empty | A lightweight empty message explains that there is no optional disclosure content without creating another card. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicAccordionItem[]` | - | Yes | Ordered disclosure items with key, title, content, and optional eyebrow. |
| `modelValue` | `string[]` | [] | No | Controlled list of open item keys. |
| `multiple` | `boolean` | false | No | Allows more than one section to stay open. |
| `emptyMessage` | `string` | 'No sections to show yet.' | No | Visible copy shown when items is empty; reserve EmptyState for actionable recovery. |
| `ariaLabel` | `string` | 'Disclosure sections' | No | Accessible label for the accordion group. |
| `idBase` | `string` | - | No | Optional stable id prefix for linking triggers and panels. |

## Accessibility

- Each trigger is a native button with aria-expanded and aria-controls.
- Each expanded panel is a labelled region connected back to its trigger.
- Empty copy remains visible in the labelled group so assistive users do not encounter a silent disclosure shell.
- Disclosure state is not represented by color alone; expanded content remains structurally available.

## Storybook Contract

- Must consume `publicComponentDocs.Accordion` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
