export interface ElyPublicTabItem {
  description?: string
  key: string
  label: string
}

export interface ElyPublicRadioItem {
  description?: string
  key: string
  label: string
  value: string
}

export interface ElyPublicSegmentedItem {
  description?: string
  key: string
  label: string
  value: string
}

export interface ElyPublicAccordionItem {
  content: string
  eyebrow?: string
  key: string
  title: string
}

export type ElyPublicStepStatus =
  | "complete"
  | "current"
  | "disabled"
  | "error"
  | "upcoming"

export interface ElyPublicStepItem {
  description?: string
  key: string
  label: string
  status?: ElyPublicStepStatus
}

export type ElyPublicTimelineTone = "accent" | "primary" | "success" | "warning"

export interface ElyPublicTimelineItem {
  description?: string
  key: string
  meta?: string
  title: string
  tone?: ElyPublicTimelineTone
}

export type ElyPublicListTone =
  | "accent"
  | "muted"
  | "primary"
  | "success"
  | "warning"

export interface ElyPublicListItem {
  current?: boolean
  description?: string
  disabled?: boolean
  href?: string
  key: string
  meta?: string
  title: string
  tone?: ElyPublicListTone
}

export type ElyPublicDescriptionTone =
  | "accent"
  | "muted"
  | "primary"
  | "success"
  | "warning"

export interface ElyPublicDescriptionItem {
  description?: string
  key: string
  label: string
  tone?: ElyPublicDescriptionTone
  value: string
}

export type ElyPublicTableCellValue = number | string

export type ElyPublicTableColumnAlign = "center" | "end" | "start"

export interface ElyPublicTableColumn {
  align?: ElyPublicTableColumnAlign
  description?: string
  key: string
  label: string
}

export type ElyPublicTableRowTone =
  | "accent"
  | "danger"
  | "muted"
  | "primary"
  | "success"
  | "warning"

export interface ElyPublicTableRow {
  cells: Record<string, ElyPublicTableCellValue>
  key: string
  tone?: ElyPublicTableRowTone
}

export type ElyPublicMenuItemTone = "danger" | "neutral" | "primary"

export interface ElyPublicMenuItem {
  current?: boolean
  description?: string
  disabled?: boolean
  href?: string
  key: string
  label: string
  meta?: string
  tone?: ElyPublicMenuItemTone
}
