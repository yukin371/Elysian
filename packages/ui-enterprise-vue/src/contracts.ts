import type { UiNavigationNode } from "@elysian/ui-core"

export interface ElyShellCopy {
  navigationLabel?: string
  environmentLabel?: string
  presetEyebrow?: string
  fallbackWorkspace?: string
}

export interface ElyShellStat {
  key: string
  label: string
  value: string
  hint?: string
  tone?: "neutral" | "info" | "success" | "warning"
}

export interface ElyShellUserSummary {
  displayName: string
  username: string
  roles: string[]
}

export interface ElyShellTab {
  key: string
  label: string
  hint?: string
}

export interface ElyShellProps {
  title: string
  subtitle: string
  workspaceTitle: string
  workspaceDescription: string
  presetLabel: string
  environment: string
  status: string
  navigation: UiNavigationNode[]
  stats: ElyShellStat[]
  navigationLabel?: string
  environmentLabel?: string
  presetEyebrow?: string
  fallbackWorkspace?: string
  selectedMenuKey?: string | null
  tabs?: ElyShellTab[]
  selectedTabKey?: string | null
  user?: ElyShellUserSummary | null
  copy?: ElyShellCopy
}

export interface ElyShellEmits {
  (e: "menu-select", key: string): void
  (e: "tab-select", key: string): void
}

export interface ResolvedElyShellCopy {
  navigationLabel: string
  environmentLabel: string
  presetEyebrow: string
  fallbackWorkspace: string
}

export const resolveElyShellCopy = (options: {
  navigationLabel?: string
  environmentLabel?: string
  presetEyebrow?: string
  fallbackWorkspace?: string
  copy?: ElyShellCopy
}): ResolvedElyShellCopy => ({
  navigationLabel:
    options.navigationLabel ?? options.copy?.navigationLabel ?? "导航",
  environmentLabel:
    options.environmentLabel ?? options.copy?.environmentLabel ?? "环境",
  presetEyebrow:
    options.presetEyebrow ?? options.copy?.presetEyebrow ?? "企业预设",
  fallbackWorkspace:
    options.fallbackWorkspace ??
    options.copy?.fallbackWorkspace ??
    "工作区内容待接入。",
})

export interface ElyPreviewSkeletonProps {
  environment: string
  status: string
  navigation: UiNavigationNode[]
  selectedMenuKey?: string | null
  stats: ElyShellStat[]
  user?: ElyShellUserSummary | null
  canViewCustomers: boolean
  canCreateCustomers: boolean
  canUpdateCustomers: boolean
  canDeleteCustomers: boolean
}

// ─── Ely table ─────────────────────────────────────────────────────────────────

export interface ElyTableColumn {
  key: string
  label: string
  /** Rendered column width (CSS value). Defaults to auto. */
  width?: string
}

export interface ElyTableAction {
  key: string
  label: string
  tone?: "primary" | "secondary" | "danger"
  /** Defaults to true. */
  enabled?: boolean
}

export interface ElyTableCopy {
  actionsTitle?: string
  statusActive?: string
  statusInactive?: string
  statusUnknown?: string
}

export interface ElyTableProps {
  columns: ElyTableColumn[]
  items: Record<string, unknown>[]
  rowKey?: string
  loading?: boolean
  actions?: ElyTableAction[]
  copy?: ElyTableCopy
}

export interface ElyTableEmits {
  (e: "action", key: string, row: Record<string, unknown>): void
  (e: "row-click", row: Record<string, unknown>): void
}

// ─── Ely query bar ─────────────────────────────────────────────────────────────

export type ElyQueryFieldKind = "text" | "select" | "date-range" | "status"

export interface ElyQueryField {
  key: string
  label: string
  kind: ElyQueryFieldKind
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  dictionaryTypeCode?: string
}

export interface ElyQueryBarCopy {
  searchPlaceholderPrefix?: string
  statusPlaceholder?: string
  statusActive?: string
  statusInactive?: string
  searchButton?: string
  resetButton?: string
}

export interface ElyQueryBarProps {
  fields: ElyQueryField[]
  loading?: boolean
  copy?: ElyQueryBarCopy
}

export interface ElyQueryValues {
  [key: string]: string | string[] | undefined
}

export interface ElyQueryBarEmits {
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
}

// ─── Ely form ─────────────────────────────────────────────────────────────────

export type ElyFormFieldInput =
  | "text"
  | "textarea"
  | "number"
  | "switch"
  | "select"
  | "date"
  | "datetime"

export interface ElyFormField {
  key: string
  label: string
  input: ElyFormFieldInput
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  dictionaryTypeCode?: string
  /** Disabled state. */
  disabled?: boolean
}

export interface ElyFormCopy {
  submitButton?: string
  cancelButton?: string
  switchEnabled?: string
  switchDisabled?: string
}

export interface ElyFormProps {
  fields: ElyFormField[]
  values?: ElyFormValues
  loading?: boolean
  /** Set to show a read-only detail view instead of editable inputs. */
  readonly?: boolean
  copy?: ElyFormCopy
}

export interface ElyFormValues {
  [key: string]: unknown
}

export interface ElyFormEmits {
  (e: "submit", values: ElyFormValues): void
  (e: "cancel"): void
}

// ─── Ely CRUD workspace ───────────────────────────────────────────────────────

export interface ElyCrudWorkspaceProps {
  eyebrow: string
  title: string
  description: string
  queryFields: ElyQueryField[]
  queryLoading?: boolean
  tableColumns: ElyTableColumn[]
  items: Record<string, unknown>[]
  tableLoading?: boolean
  tableActions?: ElyTableAction[]
  rowKey?: string
  itemCountLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  copy?: {
    gridTitle?: string
    liveContractLabel?: string
    rowsInScopeSuffix?: string
    emptyTitle?: string
    emptyDescription?: string
    queryBarCopy?: ElyQueryBarCopy
    tableCopy?: ElyTableCopy
  }
}

export interface ElyCrudWorkspaceEmits {
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "action", key: string, row: Record<string, unknown>): void
  (e: "row-click", row: Record<string, unknown>): void
}
