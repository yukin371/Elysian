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
  (e: "user-click"): void
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
  readonlyTrueLabel?: string
  readonlyFalseLabel?: string
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

// ─── Ely context panel ────────────────────────────────────────────────────────

export interface ElyContextPanelCopy {
  closeLabel?: string
  editLabel?: string
  deleteLabel?: string
  saveLabel?: string
  cancelLabel?: string
  confirmDeleteLabel?: string
  cancelDeleteLabel?: string
  deleteWarning?: string
}

export interface ElyContextPanelProps {
  visible: boolean
  title: string
  mode: "detail" | "edit" | "create" | "delete-confirm"
  width?: number
  loading?: boolean
  copy?: ElyContextPanelCopy
}

export interface ElyContextPanelEmits {
  (e: "close"): void
  (e: "edit"): void
  (e: "delete"): void
  (e: "save"): void
  (e: "cancel"): void
}

// ─── Ely CRUD workspace ───────────────────────────────────────────────────────

export interface ElyCrudWorkspaceCopy {
  gridTitle?: string
  liveContractLabel?: string
  rowsInScopeSuffix?: string
  emptyTitle?: string
  emptyDescription?: string
  filteredEmptyTitle?: string
  filteredEmptyDescription?: string
  initialEmptyTitle?: string
  initialEmptyDescription?: string
  initialEmptyNoCreateDescription?: string
  queryBarCopy?: ElyQueryBarCopy
  tableCopy?: ElyTableCopy
}

export interface ResolveElyCrudWorkspaceEmptyCopyOptions {
  hasActiveQuery: boolean
  canCreate: boolean
  emptyTitle?: string
  emptyDescription?: string
  copy?: ElyCrudWorkspaceCopy
}

export const resolveElyCrudWorkspaceEmptyCopy = (
  options: ResolveElyCrudWorkspaceEmptyCopyOptions,
): { emptyTitle: string; emptyDescription: string } => {
  const { hasActiveQuery, canCreate } = options
  const copy = options.copy ?? {}

  if (options.emptyTitle !== undefined) {
    return {
      emptyTitle: options.emptyTitle,
      emptyDescription:
        options.emptyDescription ??
        copy.emptyDescription ??
        (hasActiveQuery
          ? "尝试清除筛选条件以查看更多数据。"
          : canCreate
            ? "当前工作区暂无数据，可新增记录。"
            : "当前工作区暂无数据。"),
    }
  }

  if (hasActiveQuery) {
    return {
      emptyTitle: copy.filteredEmptyTitle ?? copy.emptyTitle ?? "无匹配数据",
      emptyDescription:
        copy.filteredEmptyDescription ??
        copy.emptyDescription ??
        "尝试清除筛选条件以查看更多数据。",
    }
  }

  return {
    emptyTitle: copy.initialEmptyTitle ?? copy.emptyTitle ?? "当前工作区为空",
    emptyDescription: canCreate
      ? (copy.initialEmptyDescription ??
        copy.emptyDescription ??
        "当前工作区暂无数据，可新增记录。")
      : (copy.initialEmptyNoCreateDescription ??
        copy.emptyDescription ??
        "当前工作区暂无数据。"),
  }
}

export type ElyWorkspaceStatus =
  | "ready"
  | "module-offline"
  | "not-authenticated"
  | "no-permission"
  | "error"

export interface ElyCrudWorkspaceProps {
  eyebrow: string
  title: string
  description: string
  status?: ElyWorkspaceStatus
  statusMessage?: string
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
  hasActiveQuery?: boolean
  canCreate?: boolean
  copy?: ElyCrudWorkspaceCopy
}

export interface ElyCrudWorkspaceEmits {
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "action", key: string, row: Record<string, unknown>): void
  (e: "row-click", row: Record<string, unknown>): void
}

// ─── Ely CRUD workbench ────────────────────────────────────────────────────────

export interface ElyPaginationProps {
  summary: string
  pageSize: number
  pageSizeOptions: number[]
  currentPage: number
  totalPages: number
  previousLabel?: string
  nextLabel?: string
  pageSizeLabel?: string
}

export interface ElyPaginationEmits {
  (e: "previous"): void
  (e: "next"): void
  (e: "update-page-size", event: Event): void
}

// ─── Ely CRUD workbench ────────────────────────────────────────────────────────

export interface ElyCrudWorkbenchProps {
  title: string
  description?: string
  queryFields?: ElyQueryField[]
  queryLoading?: boolean
  tableColumns: ElyTableColumn[]
  items: Record<string, unknown>[]
  tableLoading?: boolean
  tableActions?: ElyTableAction[]
  rowKey?: string
  itemCountLabel?: string
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
  copy?: ElyCrudWorkspaceCopy
}

export interface ElyCrudWorkbenchEmits {
  (e: "search", value: string): void
  (e: "action", key: string, row: Record<string, unknown>): void
  (e: "row-click", row: Record<string, unknown>): void
}

// ─── Ely workbench toolbar ────────────────────────────────────────────────────

export interface ElyWorkbenchToolbarAction {
  key: string
  label: string
  tone?: "primary" | "secondary" | "danger"
  icon?: string
  disabled?: boolean
}

export interface ElyWorkbenchToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  actions?: ElyWorkbenchToolbarAction[]
  moreActions?: ElyWorkbenchToolbarAction[]
  loading?: boolean
}

export interface ElyWorkbenchToolbarEmits {
  (e: "search", value: string): void
  (e: "action", key: string): void
  (e: "more-action", key: string): void
}

// ─── Ely workbench shell ───────────────────────────────────────────────────────

export interface ElyWorkbenchStatusBar {
  moduleStatus?: {
    label: string
    tone: "success" | "warning" | "error" | "default"
  }
  recordCount?: number
  selectedInfo?: string
}

export interface ElyWorkbenchShellCopy {
  navigationLabel?: string
  searchPlaceholder?: string
  closePanelLabel?: string
}

export interface ElyWorkbenchShellProps {
  navigation: UiNavigationNode[]
  selectedMenuKey?: string | null
  tabs?: ElyShellTab[]
  selectedTabKey?: string | null
  user?: ElyShellUserSummary | null
  searchPlaceholder?: string
  contextPanelVisible?: boolean
  contextPanelTitle?: string
  contextPanelMode?: "detail" | "edit" | "create" | "delete-confirm"
  statusBar?: ElyWorkbenchStatusBar
  copy?: ElyWorkbenchShellCopy
}

export interface ElyWorkbenchShellEmits {
  (e: "menu-select", key: string): void
  (e: "tab-select", key: string): void
  (e: "global-search", query: string): void
  (e: "panel-close"): void
  (e: "user-click"): void
}

export interface ResolvedElyWorkbenchShellCopy {
  navigationLabel: string
  searchPlaceholder: string
  closePanelLabel: string
}

export const resolveElyWorkbenchShellCopy = (options: {
  navigationLabel?: string
  searchPlaceholder?: string
  closePanelLabel?: string
  copy?: ElyWorkbenchShellCopy
}): ResolvedElyWorkbenchShellCopy => ({
  navigationLabel:
    options.navigationLabel ?? options.copy?.navigationLabel ?? "导航",
  searchPlaceholder:
    options.searchPlaceholder ??
    options.copy?.searchPlaceholder ??
    "全局搜索...",
  closePanelLabel:
    options.closePanelLabel ?? options.copy?.closePanelLabel ?? "关闭",
})
