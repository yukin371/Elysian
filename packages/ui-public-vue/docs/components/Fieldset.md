# Fieldset

Semantic field grouping primitive for public forms, consent clusters, preference sections, and repair lanes that need structure without another card layer.

## Category

`form`

## Usage

- Use Fieldset when related controls share one question, instruction, or validation message.
- Prefer it over nested cards for Checkbox, Radio Group, Input, Textarea, Select, and FileInput clusters inside a form.
- Keep the legend visible and specific so the group reads as one decision rather than scattered controls.

## Decision Guidance

- Use when several controls answer one visible question or share one repair message.
- Use Card only when the group is a standalone content surface; use Fieldset when the group is part of one form lane.

## Composition

- Pair with Checkbox, Radio Group, Input, Textarea, Select, FileInput, Alert, and Button to keep forms flat and reviewable.
- Use compact density for checklist-like consent groups and comfortable density for writing or preference sections.

## Anti-patterns

- Do not use Fieldset as a generic layout card, dashboard panel, tab container, or nested surface decoration.
- Do not hide the group question in placeholder text or rely on tone alone to explain validation.

## States

| State | Description |
| --- | --- |
| Neutral | Default field group keeps related controls together with a subtle surface and native fieldset semantics. |
| Primary and accent | Tone raises local emphasis for the active form lane without turning every nested control into a feature card. |
| Invalid | Invalid message links through aria-describedby and keeps repair copy attached to the whole group. |
| Disabled | Native disabled fieldset blocks contained controls while preserving visible review context. |
| Comfortable and compact | Density changes spacing only, supporting normal writing lanes and tighter checklist surfaces. |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `legend` | `string` | - | No | Visible group label rendered as the native fieldset legend. |
| `description` | `string` | - | No | Helper copy linked to the fieldset through aria-describedby. |
| `invalidMessage` | `string` | - | No | Group-level validation or repair message linked through aria-describedby. |
| `tone` | `'accent' \| 'danger' \| 'neutral' \| 'primary'` | 'neutral' | No | Semantic emphasis for the grouped control lane. |
| `density` | `'comfortable' \| 'compact'` | 'comfortable' | No | Spacing rhythm for normal forms or denser review lists. |
| `disabled` | `boolean` | false | No | Disables the native fieldset and the supported form controls inside it. |
| `ariaLabel` | `string` | 'Field group' | No | Accessible fallback label used only when no visible legend is provided. |

## Accessibility

- Uses native fieldset and legend semantics so grouped controls announce their shared context.
- Description and invalid message are linked through aria-describedby on the fieldset.
- Group tone is supplemental; the legend, helper, and invalid copy must carry the actual meaning.

## Storybook Contract

- Must consume `publicComponentDocs.Fieldset` or the canonical documented component key.
- Must expose `Playground`, `Anatomy`, and `States` stories.
- Must show a state matrix, props table, and accessibility notes.
