# Public Luxe Components

This index is generated from `publicComponentDocs`. Update component metadata first, then run:

```bash
bun run ui-public:docs:generate
```

## Actions

| Component | Purpose | Props | States | Decisions | Anti-patterns |
| --- | --- | --- | --- | --- | --- |
| [Button](./Button.md) | Primary public-facing action surface with restrained radii, luminous tone, loading feedback, and clear disabled semantics. | 6 | 4 | 2 | 2 |
| [Icon Button](./IconButton.md) | Compact icon-only action control for local toolbars, media controls, quick recovery, and small support exits with a required accessible label. | 7 | 5 | 2 | 3 |
| [Menu](./Menu.md) | Lightweight action-menu primitive for secondary actions, local item operations, support exits, and compact overflow choices that should not become another row of primary buttons. | 7 | 4 | 2 | 2 |
| [Toolbar](./Toolbar.md) | Flat local action lane for grouping primary actions, secondary actions, compact view controls, and support exits without adding another card layer. | 3 | 4 | 2 | 2 |

## Form

| Component | Purpose | Props | States | Decisions | Anti-patterns |
| --- | --- | --- | --- | --- | --- |
| [Input](./Input.md) | Governed single-line text field for search, editing, and settings flows with label, help text, and invalid state. | 6 | 4 | 2 | 2 |
| [Search Input](./SearchInput.md) | Single-line search entry for public content discovery, local list filtering, and support lookup with visible submit and clear actions. | 7 | 4 | 2 | 2 |
| [Fieldset](./Fieldset.md) | Semantic field grouping primitive for public forms, consent clusters, preference sections, and repair lanes that need structure without another card layer. | 7 | 5 | 2 | 2 |
| [Textarea](./Textarea.md) | Long-text entry primitive for comments, profile descriptions, support notes, and creator submission copy that need visible guidance and optional character count. | 9 | 5 | 2 | 2 |
| [NumberInput](./NumberInput.md) | Exact numeric entry primitive for quantities, seats, limits, budgets, and threshold fields that need typed precision rather than approximate slider tuning. | 9 | 5 | 2 | 2 |
| [DateInput](./DateInput.md) | Native date entry primitive for event dates, validity windows, publishing schedules, and recovery deadlines that need one exact calendar day without a heavy picker. | 8 | 5 | 2 | 2 |
| [FileInput](./FileInput.md) | Native file selection primitive for avatars, proof documents, creator attachments, and support evidence that need clear filenames without owning upload transport. | 8 | 5 | 2 | 2 |
| [Select](./Select.md) | Native select wrapped in the public field language for governed theme, density, and preference choices. | 6 | 4 | 2 | 2 |
| [Slider](./Slider.md) | Single-value range control for theme intensity, ornament budget, volume, and other bounded public preferences that benefit from continuous adjustment. | 9 | 4 | 2 | 2 |
| [Rating](./Rating.md) | Discrete single-value feedback control for public preference, content quality, satisfaction, and lightweight evaluation moments. | 7 | 4 | 2 | 2 |
| [Switch](./Switch.md) | Binary runtime toggle for public settings where the state changes immediately and must be visually obvious. | 4 | 4 | 2 | 2 |
| [Checkbox](./Checkbox.md) | Explicit inclusion control for independent yes/no choices that should not feel like a runtime switch. | 4 | 4 | 2 | 2 |
| [Radio Group](./RadioGroup.md) | Single-choice decision group for density, style, or preference options with roving keyboard selection. | 3 | 4 | 2 | 2 |
| [Segmented Control](./SegmentedControl.md) | Compact single-choice control for nearby view, density, tone, or mode preferences without opening a menu or switching panels. | 3 | 4 | 2 | 2 |

## Navigation

| Component | Purpose | Props | States | Decisions | Anti-patterns |
| --- | --- | --- | --- | --- | --- |
| [Link](./Link.md) | Inline navigation surface for public copy, support actions, and lightweight escapes with governed tone, underline behavior, and external-link handling. | 4 | 4 | 2 | 2 |
| [Breadcrumb](./Breadcrumb.md) | Compact route hierarchy primitive for public pages that need orientation, quiet backtracking, and a visible current location without turning local sections into tabs. | 5 | 5 | 3 | 2 |
| [Pagination](./Pagination.md) | Paged collection navigation primitive for public lists, archives, reviews, and search results where users need bounded movement without confusing pagination with progress. | 8 | 4 | 3 | 2 |
| [Stepper](./Stepper.md) | Sequential journey primitive for onboarding, checkout, publishing, and review flows where users need to understand current step, completed work, and blocked repair without mistaking the flow for tabs or pagination. | 5 | 4 | 2 | 2 |
| [Tabs](./Tabs.md) | Section switcher for compact public surfaces with roving focus, active panel linkage, and item descriptions. | 4 | 4 | 2 | 2 |

## Feedback

| Component | Purpose | Props | States | Decisions | Anti-patterns |
| --- | --- | --- | --- | --- | --- |
| [Tooltip](./Tooltip.md) | Short contextual help primitive for terms, labels, and compact decisions that need one calm explanation without adding another card or long paragraph. | 6 | 4 | 2 | 2 |
| [Popover](./Popover.md) | Lightweight non-modal context panel for richer local guidance, previews, and decision support that should stay attached to a trigger without becoming a menu or dialog. | 8 | 4 | 2 | 2 |
| [Badge](./Badge.md) | Compact semantic marker for statuses, categories, and lightweight emphasis in public luxe surfaces. | 1 | 4 | 2 | 2 |
| [Chip](./Chip.md) | Compact selected-item token for filters, preferences, and removable context where Badge would be too passive and Button would be too loud. | 5 | 5 | 2 | 2 |
| [Toast](./Toast.md) | Compact transient feedback surface for saved, synced, blocked, or failed moments that need confirmation without becoming a full Alert block. | 7 | 6 | 2 | 3 |
| [Dialog](./Dialog.md) | Focused overlay for confirmation and short public workflows with escape handling, initial focus, and focus restoration. | 6 | 4 | 2 | 2 |
| [Progress](./Progress.md) | Linear completion indicator for uploads, setup milestones, and staged progress where the user needs a clear sense of completion without a chart-heavy surface. | 5 | 4 | 2 | 2 |
| [Spinner](./Spinner.md) | Indeterminate local waiting indicator for short async moments, inline pending states, and compact loading feedback that should not become a full-page overlay. | 4 | 4 | 2 | 2 |
| [Empty State](./EmptyState.md) | Guided empty surface that explains absence, preserves the public theme mood, and offers a next step when available. | 3 | 4 | 2 | 2 |
| [Skeleton](./Skeleton.md) | Loading placeholder that preserves layout rhythm without turning loading into decorative spectacle. | 2 | 4 | 2 | 2 |
| [Alert](./Alert.md) | Semantic feedback surface for explaining status, risk, success, and next action inside the public preset. | 5 | 5 | 2 | 2 |

## Content

| Component | Purpose | Props | States | Decisions | Anti-patterns |
| --- | --- | --- | --- | --- | --- |
| [Accordion](./Accordion.md) | Progressive disclosure primitive for FAQ, policy notes, settings explanations, and compact editorial details that should stay readable without adding nested cards. | 5 | 4 | 2 | 2 |
| [List](./List.md) | Flat structured list primitive for settings rows, content indexes, activity summaries, and lightweight navigation where repeated information should stay readable without becoming a stack of cards. | 4 | 4 | 2 | 2 |
| [DescriptionList](./DescriptionList.md) | Semantic description-list primitive for profile facts, order summaries, event rules, and compact specification blocks where label-value pairs should read as one information surface instead of many tiny cards. | 4 | 4 | 2 | 2 |
| [Table](./Table.md) | Read-only structured table primitive for public comparisons, specifications, reward matrices, and compact audit snapshots that need rows and columns without becoming an enterprise data grid. | 5 | 4 | 2 | 2 |
| [Timeline](./Timeline.md) | Chronological content primitive for release notes, member history, event agendas, and editorial sequences where order matters but the user is not moving through a live stepper. | 3 | 4 | 2 | 2 |
| [Stat](./Stat.md) | Compact summary block for public dashboards, hero strips, and content cards where one headline metric needs supporting context without reverting to ad hoc markup. | 6 | 4 | 2 | 2 |
| [Text](./Text.md) | Governed body-copy primitive for paragraphs, compact notes, and inline emphasis so public pages can reuse the same reading rhythm instead of scattering one-off text styles. | 4 | 4 | 2 | 2 |
| [Kbd](./Kbd.md) | Inline keyboard-hint primitive for shortcuts, command hints, review steps, and keyboard affordances where key labels should stay consistent without becoming decorative badges. | 4 | 4 | 2 | 2 |
| [Avatar](./Avatar.md) | Identity surface for public profiles, creator previews, and participant rows with image, initials fallback, governed shape, and status indicator. | 6 | 4 | 2 | 2 |
| [Image](./Image.md) | Governed media surface for public cards, gallery previews, and editorial highlights with aspect presets, loading skeleton, and resilient fallback behavior. | 6 | 4 | 2 | 2 |
| [Card](./Card.md) | Public luxe content surface for previews, feature summaries, and action groups without falling back to enterprise panels. | 4 | 4 | 2 | 2 |
| [Meter](./Meter.md) | Bounded scalar indicator for capacity, fit, quality, health, and quota signals where the value describes a condition rather than task completion. | 7 | 4 | 2 | 2 |
| [Divider](./Divider.md) | Section rhythm primitive for separating content lanes without adding another card or heading layer. | 3 | 4 | 2 | 2 |
