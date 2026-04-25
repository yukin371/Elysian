import type { UiCrudPageDefinition, UiPresetManifest } from "@elysian/ui-core"
import { computed } from "vue"
import type {
  ElyCrudWorkspaceEmits,
  ElyCrudWorkspaceProps,
  ElyFormEmits,
  ElyFormField,
  ElyFormProps,
  ElyPreviewSkeletonProps,
  ElyQueryBarEmits,
  ElyQueryBarProps,
  ElyQueryField,
  ElyQueryFieldKind,
  ElyQueryValues,
  ElyShellProps,
  ElyShellStat,
  ElyShellTab,
  ElyShellUserSummary,
  ElyTableAction,
  ElyTableColumn,
  ElyTableEmits,
  ElyTableProps,
  ResolvedElyShellCopy,
} from "./contracts"
import { resolveElyShellCopy } from "./contracts"

export { default as ElyForm } from "./components/ElyForm.vue"
export { default as ElyCrudWorkspace } from "./components/ElyCrudWorkspace.vue"
export { default as ElyNavNodes } from "./components/ElyNavNodes.vue"
export { default as ElyPreviewSkeleton } from "./components/ElyPreviewSkeleton.vue"
export { default as ElyQueryBar } from "./components/ElyQueryBar.vue"
export { default as ElyShell } from "./components/ElyShell.vue"
export { default as ElyTable } from "./components/ElyTable.vue"
export type {
  ElyCrudWorkspaceEmits,
  ElyCrudWorkspaceProps,
  ElyFormEmits,
  ElyFormField,
  ElyFormProps,
  ElyPreviewSkeletonProps,
  ElyQueryBarEmits,
  ElyQueryBarProps,
  ElyQueryField,
  ElyQueryFieldKind,
  ElyQueryValues,
  ElyShellProps,
  ElyShellStat,
  ElyShellTab,
  ElyShellUserSummary,
  ElyTableAction,
  ElyTableColumn,
  ElyTableEmits,
  ElyTableProps,
  ResolvedElyShellCopy,
}

export { resolveElyShellCopy }

export const vueEnterprisePresetManifest: UiPresetManifest = {
  key: "vue-enterprise",
  framework: "vue",
  kind: "enterprise",
  status: "prototype",
  displayName: "Vue Enterprise",
  description:
    "Official enterprise preset for Vue, with a TDesign-based admin shell and reusable CRUD workspace templates.",
}

export const vueEnterprisePresetFoundation = {
  designSystem: "tdesign-vue-next",
  selectionDate: "2026-04-25",
  status: "prototype",
} as const

/**
 * Adapts a canonical `UiCrudPageDefinition` from `ui-core` into the
 * enterprise contracts consumed by `ElyTable`,
 * `ElyQueryBar`, and `ElyForm`.
 *
 * Callers pass a `ComputedRef<string[]>` of granted permission codes so that
 * action availability stays reactive to identity changes.
 *
 * Usage:
 * ```ts
 * const page = useElyCrudPage(customerPageDefinition, permissionCodes)
 * // page.tableColumns.value, page.queryFields.value, page.formFields.value, page.tableActions.value
 * ```
 */
export const useElyCrudPage = (
  definition:
    | UiCrudPageDefinition
    | {
        value: UiCrudPageDefinition
      },
  permissionCodes: { value: readonly string[] },
) => {
  const resolveDefinition = () =>
    "value" in definition ? definition.value : definition

  const can = (permissionCode?: string) =>
    !permissionCode || permissionCodes.value.includes(permissionCode)

  const tableColumns = computed<ElyTableColumn[]>(() =>
    resolveDefinition().columns.map((col) => ({
      key: col.key,
      label: col.label,
    })),
  )

  const queryFields = computed<ElyQueryField[]>(() =>
    resolveDefinition().queryFields.map((field) => ({
      key: field.key,
      label: field.label,
      kind: field.kind,
      options: field.options,
      dictionaryTypeCode: field.dictionaryTypeCode,
    })),
  )

  const formFields = computed<ElyFormField[]>(() =>
    resolveDefinition().formFields.map((f) => ({
      key: f.key,
      label: f.label,
      input: f.input,
      required: f.required,
      options: f.options,
      dictionaryTypeCode: f.dictionaryTypeCode,
    })),
  )

  const tableActions = computed<ElyTableAction[]>(() =>
    resolveDefinition().actions.map((a) => ({
      key: a.key,
      label: a.label,
      tone: a.tone,
      enabled: can(a.permissionCode),
    })),
  )

  return {
    tableColumns,
    queryFields,
    formFields,
    tableActions,
  }
}
