# Tooltip

Short contextual help primitive for terms, labels, and compact decisions that need one calm explanation without adding another card or long paragraph.

## Category

`feedback`

## Usage

- Use Tooltip for concise clarification that supports a nearby label, status, or setting.
- Keep content short enough to read on focus; move longer guidance into Text, Alert, or a dedicated help route.
- Use accent only when the hint explains a highlighted or ceremonial surface.

## Decision Guidance

- Use when the user benefits from a one-sentence explanation but the surrounding surface should stay visually light.
- Use only for supplemental context; if the information changes the decision, keep it visible with Text or Alert.

## Composition

- Pair with Input labels, Stat labels, Badge metadata, or Switch descriptions to clarify meaning without nesting a help card.
- Place next to the exact term it explains so the bubble reads as context, not another navigation path.

## Anti-patterns

- Do not hide validation errors, legal consent, pricing, or irreversible consequences inside Tooltip.
- Do not use Tooltip for rich interactive content, menus, or long onboarding copy.

## States

| State | Description |
| --- | --- |
| Neutral | Default contextual hint that stays quiet beside labels, stats, and form descriptions. |
| Accent | Higher-emphasis hint for highlighted editorial or theme-specific terminology. |
| Placement | top, bottom, and inline keep the bubble close to the explained item without creating a new surface. |
| Open preview | open keeps the bubble visible for review screenshots while hover and focus remain the runtime interaction path. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `text` | `string` | '' | No | Fallback tooltip content when the default slot is empty. |
| `tone` | `'accent' \| 'neutral'` | 'neutral' | No | Visual emphasis for the trigger and contextual bubble. |
| `placement` | `'bottom' \| 'inline' \| 'top'` | 'top' | No | Bubble position relative to the focusable trigger. |
| `open` | `boolean` | false | No | Keeps the bubble visible for examples, tests, or static review. |
| `triggerLabel` | `string` | 'Show context' | No | Accessible name for the focusable help trigger. |
| `id` | `string` | - | No | Optional stable id used to connect trigger and tooltip content. |

## Accessibility

- The trigger is keyboard focusable and references the bubble with aria-describedby.
- The bubble uses role=tooltip and appears on hover, focus-within, or explicit open preview.
- Tooltip content must be supplemental; essential instructions should remain visible in page copy.

## Storybook Contract

- Must consume `publicComponentDocs.Tooltip` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
