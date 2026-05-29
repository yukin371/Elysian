# Timeline

Chronological content primitive for release notes, member history, event agendas, and editorial sequences where order matters but the user is not moving through a live stepper.

## Category

`content`

## Usage

- Use Timeline when past or scheduled events need to read as a coherent sequence without adding stacked cards.
- Keep each item concise with a stable meta label, a clear title, and optional explanation for the consequence or next context.
- Use tone only to mark meaningful moments such as primary milestones, success completion, warning attention, or accent ceremony.

## Decision Guidance

- Use when the user reads a sequence of past, scheduled, or editorial moments rather than operating a current workflow.
- Use Stepper when the sequence changes the current action, Progress when the value is completion, and Pagination when movement is page based.

## Composition

- Pair with Text, Badge, Stat, Link, or a single action row when a history item needs context or a recovery path.
- Place Timeline directly in the affected section and use dividers or spacing instead of wrapping every event in its own card.

## Anti-patterns

- Do not use Timeline as a route menu, clickable wizard, activity feed with unbounded live updates, or decorative vertical ornament.
- Do not rely on tone alone to communicate errors, deadlines, or completion; the title and description must name the meaning.

## States

| State | Description |
| --- | --- |
| Primary milestone | Default items use the primary timeline marker for normal sequence moments and active narrative anchors. |
| Accent ceremony | Accent items mark rare brand or editorial highlights without turning the whole sequence into decoration. |
| Success and warning | Success and warning tones communicate completed or attention-worthy moments through semantic tokens. |
| Compact density | Compact density reduces vertical rhythm for account history, changelogs, and narrow review panels. |
| Empty | A flat empty message keeps missing chronology readable inside the timeline surface without turning absence into a card stack. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ElyPublicTimelineItem[]` | - | Yes | Ordered timeline items with key, title, optional meta, optional description, and optional semantic tone. |
| `density` | `'comfortable' \| 'compact'` | 'comfortable' | No | Controls spacious editorial rhythm or denser history rhythm without changing item semantics. |
| `emptyMessage` | `string` | 'No timeline events to show yet.' | No | Visible copy shown when items is empty; use EmptyState only when the user can recover or create an event. |
| `ariaLabel` | `string` | 'Timeline' | No | Accessible label for the chronological section. |

## Accessibility

- Uses an ordered list so assistive technology receives the same chronological order as visual users.
- Empty copy stays in the labeled section so absence is explicit rather than being represented by decorative markers alone.
- Tone is supplemental; item title, meta, and description must carry the meaning without relying on color.
- The component has no hidden interaction, so links, buttons, or repair actions should remain outside or inside explicit item content owned by the surrounding surface.

## Storybook Contract

- Must consume `publicComponentDocs.Timeline` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
