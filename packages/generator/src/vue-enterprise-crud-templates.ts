import type { ModuleSchema } from "@elysian/schema"
import { toCamelCase, toPascalCase } from "./naming"
import { renderVueEnterprisePanelTemplateOverride } from "./vue-enterprise-crud-panel-overrides/index.ts"
import {
  SYSTEM_FIELD_KEYS,
  getCreatePermissionPropName,
  getDeletePermissionPropName,
  getExportPermissionPropName,
  getPanelModeType,
  getSelectedStateProperty,
  getUpdatePermissionPropName,
  getViewPermissionPropName,
  getWorkspacePanelExtraState,
  renderFieldDefaultValue,
  renderFilterBody,
} from "./vue-enterprise-crud-template-shared"
export {
  renderModuleBasePath,
  renderPagePanelPath,
  renderWorkspaceTemplatePath,
} from "./vue-enterprise-crud-template-shared"

export const renderVueEnterpriseMainTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)
  const recordTypeName = `${pascalName}Record`
  const viewPermission = getViewPermissionPropName(schema.name, pascalName)
  const createPermission = getCreatePermissionPropName(schema.name, pascalName)
  const updatePermission = getUpdatePermissionPropName(schema.name, pascalName)
  const deletePermission = getDeletePermissionPropName(schema.name, pascalName)
  const exportPermission = getExportPermissionPropName(schema.name, pascalName)

  return `<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableAction,
  type ElyTableColumn,
  ElyPagination,
  useElyPagination,
} from "@elysian/ui-enterprise-vue"
import { computed, inject, ref } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import type { ${recordTypeName} } from "./${schema.name}.schema"
import {
  readInjectedValue,
  resolve${pascalName}WorkspaceMainState,
} from "./${schema.name}-workspace"

type ${pascalName}WorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface ${pascalName}WorkspaceMainProps {
  t: ${pascalName}WorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  ${deletePermission}: boolean
  ${exportPermission}: boolean
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  copy: ElyCrudWorkspaceProps["copy"]
  workspaceStateInjected?: boolean
}

const props = defineProps<${pascalName}WorkspaceMainProps>()

const emit = defineEmits<{
  (e: "action", key: string, row: ${recordTypeName}): void
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: ${recordTypeName}): void
  (e: "page-change", page: number, pageSize: number): void
  (e: "export", query: ElyQueryValues): void
}>()

const activeQuery = ref<ElyQueryValues>({})

const hasActiveQuery = computed(() => {
  const q = activeQuery.value
  return Object.keys(q).some((k) => {
    const v = q[k]
    if (v === undefined || v === "") return false
    if (Array.isArray(v)) return v.length > 0
    return true
  })
})

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolved${pascalName}WorkspaceState = computed(() =>
  resolve${pascalName}WorkspaceMainState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.${camelName}Loading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () => resolved${pascalName}WorkspaceState.value?.${camelName}ErrorMessage ?? null,
  ),
  "",
)
const resolvedItems = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.tableItems ?? null),
  [] as ${recordTypeName}[],
)

const {
  currentPage,
  pageSize,
  pageSizeOptions,
  totalPages,
  paginatedItems,
  paginationSummary,
  goPreviousPage,
  goNextPage,
  updatePageSize,
} = useElyPagination(resolvedItems, { t: props.t })

const resolvedStatus = computed(() => {
  if (!props.moduleReady) return "module-offline"
  if (props.authModuleReady && !props.isAuthenticated) return "not-authenticated"
  if (props.canEnterWorkspace && !props.${viewPermission}) return "no-permission"
  if (resolvedErrorMessage.value) return "error"
  return "ready"
})

const resolvedStatusMessage = computed(() => {
  if (resolvedStatus.value === "module-offline") {
    return props.t("app.message.${camelName}ModuleOffline")
  }
  if (resolvedStatus.value === "not-authenticated") {
    return props.t("app.message.${camelName}SignInToLoad")
  }
  if (resolvedStatus.value === "no-permission") {
    return props.t("app.message.${camelName}NoListPermission")
  }
  return resolvedErrorMessage.value
})

const resolvedTableActions = computed<ElyTableAction[]>(() => {
  const actions: ElyTableAction[] = []

  if (props.${updatePermission}) {
    actions.push({
      key: "edit",
      label: props.t("app.${camelName}.action.edit"),
    })
  }

  if (props.${deletePermission}) {
    actions.push({
      key: "delete",
      label: props.t("app.${camelName}.action.delete"),
      tone: "danger",
    })
  }

  return actions
})

const handleAction = (key: string, row: Record<string, unknown>) => {
  const rowId = String(row.id ?? "")
  const record = resolvedItems.value.find((item) => item.id === rowId)

  if (record) {
    emit("action", key, record)
  }
}

const handleCreate = () => {
  emit("action", "create", {} as ${recordTypeName})
}

const exportConfirmVisible = ref(false)

const exportScopeSummary = computed(() =>
  props.t("app.${camelName}.exportScopeSummary", {
    count: resolvedItems.value.length,
    filtered: hasActiveQuery.value ? "1" : "0",
  }),
)

const requestExport = () => {
  exportConfirmVisible.value = true
}

const confirmExport = () => {
  exportConfirmVisible.value = false
  emit("export", activeQuery.value)
}

const cancelExport = () => {
  exportConfirmVisible.value = false
}

const handleSearch = (values: ElyQueryValues) => {
  activeQuery.value = values
  emit("search", values)
}

const handleReset = () => {
  activeQuery.value = {}
  emit("reset")
}
</script>

<template>
  <ElyCrudWorkspace
    :status="resolvedStatus"
    :status-message="resolvedStatusMessage"
    :eyebrow="t('app.${camelName}.workspaceEyebrow')"
    :title="t('app.${camelName}.workspaceTitle')"
    :description="''"
    :query-fields="queryFields"
    :query-loading="resolvedLoading"
    :table-columns="tableColumns"
    :items="paginatedItems"
    :table-loading="resolvedLoading"
    :table-actions="resolvedTableActions"
    :item-count-label="itemCountLabel"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :has-active-query="hasActiveQuery"
    :can-create="${createPermission}"
    :copy="copy"
    @action="handleAction"
    @search="handleSearch"
    @reset="handleReset"
    @row-click="emit('row-click', $event as ${recordTypeName})"
  >
    <template #toolbar>
      <button
        v-if="${exportPermission}"
        type="button"
        class="enterprise-button enterprise-button-ghost"
        :disabled="resolvedLoading"
        @click="requestExport"
      >
        {{ t("app.${camelName}.action.export") }}
      </button>
      <div v-if="exportConfirmVisible" class="enterprise-export-confirm">
        <span>{{ exportScopeSummary }}</span>
        <button type="button" class="enterprise-button" @click="confirmExport">
          {{ t("app.${camelName}.confirmExport") }}
        </button>
        <button type="button" class="enterprise-button enterprise-button-ghost" @click="cancelExport">
          {{ t("app.${camelName}.cancelExport") }}
        </button>
      </div>
      <button
        v-if="${createPermission}"
        type="button"
        class="enterprise-button"
        :disabled="resolvedLoading"
        @click="handleCreate"
      >
        {{ t("app.${camelName}.action.create") }}
      </button>
    </template>
    <template #footer>
      <ElyPagination
        :summary="paginationSummary"
        :page-size="pageSize"
        :page-size-options="pageSizeOptions"
        :current-page="currentPage"
        :total-pages="totalPages"
        :previous-label="t('app.pagination.previous')"
        :next-label="t('app.pagination.next')"
        :page-size-label="t('app.pagination.pageSize')"
        @previous="goPreviousPage"
        @next="goNextPage"
        @update-page-size="updatePageSize"
      />
    </template>
  </ElyCrudWorkspace>
</template>
`
}

export const renderVueEnterprisePanelTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)
  const recordTypeName = `${pascalName}Record`
  const viewPermission = getViewPermissionPropName(schema.name, pascalName)
  const createPermission = getCreatePermissionPropName(schema.name, pascalName)
  const updatePermission = getUpdatePermissionPropName(schema.name, pascalName)
  const panelModeType = getPanelModeType(schema.name)
  const selectedStateProperty = getSelectedStateProperty(
    schema.name,
    pascalName,
  )
  const override = renderVueEnterprisePanelTemplateOverride(schema)

  if (override) {
    return override
  }

  return `<script setup lang="ts">
import {
  ElyContextPanel,
  ElyForm,
  type ElyContextPanelCopy,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import type { ${recordTypeName} } from "./${schema.name}.schema"
import {
  readInjectedValue,
  resolve${pascalName}WorkspacePanelState,
} from "./${schema.name}-workspace"

type ${pascalName}WorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface ${pascalName}WorkspacePanelProps {
  t: ${pascalName}WorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  contextPanelCopy?: ElyContextPanelCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<${pascalName}WorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", ${camelName}: ${recordTypeName}): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
  (e: "confirm-delete", ${camelName}: ${recordTypeName}): void
  (e: "cancel-delete"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolved${pascalName}WorkspaceState = computed(() =>
  resolve${pascalName}WorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.${camelName}Loading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () => resolved${pascalName}WorkspaceState.value?.${camelName}DetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () => resolved${pascalName}WorkspaceState.value?.${camelName}ErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolved${pascalName}WorkspaceState.value?.${camelName}DetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.${camelName}PanelMode ?? null),
  "detail" as ${panelModeType},
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedSelected${pascalName} = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.${selectedStateProperty} ?? null),
  null as ${recordTypeName} | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)

const resolvedPanelStatus = computed(() => {
  if (!props.moduleReady) return "module-offline"
  if (props.authModuleReady && !props.isAuthenticated) return "not-authenticated"
  if (props.canEnterWorkspace && !props.${viewPermission}) return "no-permission"
  if (resolvedErrorMessage.value) return "error"
  if (resolvedDetailLoading.value && resolvedSelected${pascalName}.value) return "loading"
  if (resolvedDetailErrorMessage.value) return "detail-error"
  return "ready"
})

const resolvedPanelStatusMessage = computed(() => {
  switch (resolvedPanelStatus.value) {
    case "module-offline":
      return t("app.message.${camelName}ModuleOffline")
    case "not-authenticated":
      return t("app.message.${camelName}SignInToLoad")
    case "no-permission":
      return t("app.message.${camelName}NoListPermission")
    case "error":
      return resolvedErrorMessage.value
    case "loading":
      return t("app.${camelName}.detailLoading")
    case "detail-error":
      return resolvedDetailErrorMessage.value
    default:
      return ""
  }
})

const panelVisible = computed(() => {
  if (resolvedPanelStatus.value !== "ready") return true
  return resolvedPanelMode.value === "detail" || resolvedPanelMode.value === "create" || resolvedPanelMode.value === "edit" || resolvedPanelMode.value === "delete-confirm"
})

const resolvedPanelModeForContext = computed<"detail" | "edit" | "create" | "delete-confirm">(() => {
  if (resolvedPanelMode.value === "delete-confirm") return "delete-confirm"
  if (resolvedPanelMode.value === "edit") return "edit"
  if (resolvedPanelMode.value === "create") return "create"
  return "detail"
})
</script>

<template>
  <ElyContextPanel
    :visible="panelVisible"
    :title="resolvedPanelTitle"
    :mode="resolvedPanelModeForContext"
    :loading="resolvedLoading || resolvedDetailLoading"
    :copy="contextPanelCopy"
    @close="emit('cancel-panel')"
    @cancel="emit('cancel-panel')"
    @save="emit('submit-form', resolvedFormValues)"
    @delete="resolvedSelected${pascalName} && emit('confirm-delete', resolvedSelected${pascalName})"
  >
    <template v-if="resolvedPanelStatus !== 'ready'">
      <div class="ely-panel-status">{{ resolvedPanelStatusMessage }}</div>
    </template>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelected${pascalName}">
      <ElyForm
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        readonly
        :loading="resolvedLoading || resolvedDetailLoading"
        :copy="formCopy"
      />
    </template>

    <template v-else-if="resolvedPanelMode === 'create' || resolvedPanelMode === 'edit'">
      <ElyForm
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        :loading="resolvedLoading || resolvedDetailLoading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-panel')"
      />
    </template>

    <template v-else-if="resolvedPanelMode === 'delete-confirm' && resolvedSelected${pascalName}">
      <p>{{ t("app.${camelName}.deleteConfirmMessage", { name: resolvedSelected${pascalName}.name ?? resolvedSelected${pascalName}.id }) }}</p>
    </template>

    <template v-else>
      <p>{{ t("app.${camelName}.detailEmptyDescription") }}</p>
    </template>
  </ElyContextPanel>
  </template>
`
}

export const renderVueWorkspaceComposableTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)
  const recordTypeName = `${pascalName}Record`
  const panelModeType = getPanelModeType(schema.name)
  const selectedStateProperty = getSelectedStateProperty(
    schema.name,
    pascalName,
  )
  const extraPanelState = getWorkspacePanelExtraState(schema.name)
  const inputFields = schema.fields.filter(
    (field) => !SYSTEM_FIELD_KEYS.has(field.key),
  )

  const defaultDraftFields = inputFields
    .map((field) => `  ${field.key}: ${renderFieldDefaultValue(field)}`)
    .join(",\n")

  const filterBody = renderFilterBody(schema)

  const requiredStringFields = inputFields.filter(
    (field) =>
      field.required && (field.kind === "string" || field.kind === "id"),
  )
  const jsonFields = inputFields.filter((field) => field.kind === "json")

  const requiredStringBlock =
    requiredStringFields.length > 0
      ? requiredStringFields
          .map((field) => {
            const valueName = `${field.key}Value`
            return `  const ${valueName} = String(values.${field.key} ?? "").trim()

  if (${valueName}.length === 0) {
    return { status: "invalid" as const, message: "${pascalName} ${field.key} is required" }
  }`
          })
          .join("\n\n")
      : ""

  const jsonNormalizationBlock =
    jsonFields.length > 0
      ? jsonFields
          .map((field) => {
            const resultName = `${field.key}ValueResult`
            const valueName = `${field.key}Value`

            return `  const ${resultName} = normalizeJsonInput(values.${field.key})

  if (${resultName}.status === "invalid") {
    return {
      status: "invalid" as const,
      message: "${pascalName} ${field.key} must be a valid JSON object",
    }
  }

  const ${valueName} = ${resultName}.value`
          })
          .join("\n\n")
      : ""

  const normalizeBlock = [requiredStringBlock, jsonNormalizationBlock]
    .filter((block) => block.length > 0)
    .join("\n\n")

  const payloadFields = inputFields
    .map((field) => {
      if (field.kind === "string" || field.kind === "id") {
        if (field.required) {
          return `    ${field.key}: ${field.key}Value,`
        }
        return `    ${field.key}: normalizeOptionalText(values.${field.key}),`
      }
      if (field.kind === "number") {
        return `    ${field.key}: normalizeNumber(values.${field.key}, ${renderFieldDefaultValue(field)}),`
      }
      if (field.kind === "datetime") {
        return `    ${field.key}: normalizeText(values.${field.key}),`
      }
      if (field.kind === "json") {
        return `    ${field.key}: ${field.key}Value,`
      }
      return `    ${field.key}: values.${field.key} ?? ${renderFieldDefaultValue(field)},`
    })
    .join("\n")

  const toEditDraftFields = inputFields
    .map((field) => {
      if (field.kind === "json") {
        return `  ${field.key}: stringifyJsonValue(record.${field.key})`
      }

      return `  ${field.key}: record.${field.key} ?? ${renderFieldDefaultValue(field)}`
    })
    .join(",\n")

  return `import type { FrontendWorkspaceStateContext } from "@elysian/frontend-vue"
import type { ComputedRef } from "vue"
import { computed } from "vue"
import type { ElyFormField, ElyFormValues } from "@elysian/ui-enterprise-vue"

import type { ${recordTypeName} } from "./${schema.name}.schema"

export interface ${pascalName}WorkspaceMainInjectedState {
  ${camelName}ErrorMessage: { value: string }
  ${camelName}Loading: { value: boolean }
  tableItems: { value: ${recordTypeName}[] }
}

export interface ${pascalName}WorkspacePanelInjectedState
  extends ${pascalName}WorkspaceMainInjectedState {
  formFields: { value: ElyFormField[] }
  formValues: { value: ElyFormValues }
  panelDescription: { value: string }
  panelTitle: { value: string }
  ${camelName}DetailErrorMessage: { value: string }
  ${camelName}DetailLoading: { value: boolean }
  ${camelName}PanelMode: { value: ${panelModeType} }
  ${selectedStateProperty}: { value: ${recordTypeName} | null }
${extraPanelState}}

const resolve${pascalName}WorkspaceState = <TState>(
  context: FrontendWorkspaceStateContext | null,
  enabled: boolean,
): TState | null => {
  if (!enabled || context?.kind !== "${schema.name}") {
    return null
  }

  return context.state as TState
}

export const resolve${pascalName}WorkspaceMainState = (
  context: FrontendWorkspaceStateContext | null,
  enabled: boolean,
) => resolve${pascalName}WorkspaceState<${pascalName}WorkspaceMainInjectedState>(context, enabled)

export const resolve${pascalName}WorkspacePanelState = (
  context: FrontendWorkspaceStateContext | null,
  enabled: boolean,
) =>
  resolve${pascalName}WorkspaceState<${pascalName}WorkspacePanelInjectedState>(context, enabled)

export const readInjectedValue = <TValue>(
  state: ComputedRef<{ value: TValue } | null>,
  fallback: TValue,
) => computed(() => state.value?.value ?? fallback)

const normalizeText = (value: unknown) => String(value ?? "").trim()

const normalizeOptionalText = (value: unknown) => {
  const normalized = normalizeText(value)

  return normalized.length > 0 ? normalized : undefined
}

const normalizeNumber = (value: unknown, fallback = 0) => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(normalized) ? normalized : fallback
}

const normalizeJsonInput = (
  value: unknown,
):
  | { status: "valid"; value: Record<string, unknown> | null }
  | { status: "invalid" } => {
  if (value === null || value === undefined) {
    return { status: "valid", value: null }
  }

  if (typeof value === "string") {
    const normalized = value.trim()

    if (normalized.length === 0) {
      return { status: "valid", value: null }
    }

    try {
      const parsed: unknown = JSON.parse(normalized)

      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return {
          status: "valid",
          value: parsed as Record<string, unknown>,
        }
      }

      return { status: "invalid" }
    } catch {
      return { status: "invalid" }
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return {
      status: "valid",
      value: value as Record<string, unknown>,
    }
  }

  return { status: "invalid" }
}

const stringifyJsonValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return ""
  }

  return JSON.stringify(value, null, 2)
}

export const createDefault${pascalName}Draft = () => ({
${defaultDraftFields},
})

export const filter${pascalName}Records = (
  items: ${recordTypeName}[],
  query: Record<string, unknown>,
): ${recordTypeName}[] => {
${filterBody}
}

export const resolve${pascalName}Selection = (
  items: Array<Pick<${recordTypeName}, "id">>,
  selectedId: string | null,
): string | null => {
  if (items.length === 0) return null

  if (selectedId && items.some((item) => item.id === selectedId)) {
    return selectedId
  }

  return items[0]?.id ?? null
}

export const normalize${pascalName}Payload = (
  values: Record<string, unknown>,
):
  | { status: "valid"; payload: Record<string, unknown> }
  | { status: "invalid"; message: string } => {
${normalizeBlock}${normalizeBlock ? "\n\n" : ""}${normalizeBlock ? '  return {\n    status: "valid" as const,\n    payload: {\n' : '  return { status: "valid" as const, payload: {\n'}${payloadFields}
  ${normalizeBlock ? "  },\n}" : "  }"}
}

export const to${pascalName}EditDraft = (
  record: ${recordTypeName},
): Record<string, unknown> => ({
${toEditDraftFields},
})
`
}
