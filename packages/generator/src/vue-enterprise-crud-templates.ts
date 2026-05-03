import type { ModuleSchema } from "@elysian/schema"
import { toCamelCase, toPascalCase } from "./naming"
import { renderVueEnterprisePanelTemplateOverride } from "./vue-enterprise-crud-panel-overrides/index.ts"
import {
  SYSTEM_FIELD_KEYS,
  getCreatePermissionPropName,
  getPanelModeType,
  getSelectedStateProperty,
  getUpdatePermissionPropName,
  getViewPermissionPropName,
  getWorkspacePanelExtraState,
  renderFieldDefaultValue,
  renderFilterBody,
} from "./vue-enterprise-crud-template-shared"
export {
  renderPagePanelPath,
  renderWorkspaceTemplatePath,
} from "./vue-enterprise-crud-template-shared"

export const renderVueEnterpriseMainTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)
  const recordTypeName = `${pascalName}Record`
  const viewPermission = getViewPermissionPropName(schema.name, pascalName)

  return `<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

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
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
  workspaceStateInjected?: boolean
}

const props = defineProps<${pascalName}WorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: ${recordTypeName}): void
}>()

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
</script>

<template>
  <section class="enterprise-card enterprise-main-card">
    <div v-if="!moduleReady" class="enterprise-message enterprise-message-warning">
      {{ t("app.message.${camelName}ModuleOffline") }}
    </div>

    <div
      v-else-if="authModuleReady && !isAuthenticated"
      class="enterprise-message enterprise-message-info"
    >
      {{ t("app.message.${camelName}SignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.${camelName}NoListPermission") }}
    </div>

    <div
      v-else-if="resolvedErrorMessage"
      class="enterprise-message enterprise-message-danger"
    >
      {{ resolvedErrorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.${camelName}.workspaceEyebrow')"
      :title="t('app.${camelName}.workspaceTitle')"
      :description="t('app.${camelName}.workspaceDescription')"
      :query-fields="queryFields"
      :query-loading="resolvedLoading"
      :table-columns="tableColumns"
      :items="resolvedItems"
      :table-loading="resolvedLoading"
      :table-actions="[]"
      :item-count-label="itemCountLabel"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :copy="copy"
      @search="emit('search', $event)"
      @reset="emit('reset')"
      @row-click="emit('row-click', $event as ${recordTypeName})"
    >
      <template #toolbar>
        <span class="enterprise-toolbar-pill">
          {{ currentQuerySummary }}
        </span>
      </template>
    </ElyCrudWorkspace>
  </section>
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
  ElyForm,
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
  workspaceStateInjected?: boolean
}

const props = defineProps<${pascalName}WorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", ${camelName}: ${recordTypeName}): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
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
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolved${pascalName}WorkspaceState.value?.panelDescription ?? null),
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
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.${camelName}.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.${camelName}ModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.${camelName}SignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.${camelName}NoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelected${pascalName}"
      class="enterprise-inline-warning"
    >
      {{ t("app.${camelName}.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="resolvedPanelMode === 'detail' && resolvedSelected${pascalName}"
    >
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelected${pascalName})"
        >
          {{ t("app.${camelName}.action.edit") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.${camelName}.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        readonly
        :loading="resolvedLoading || resolvedDetailLoading"
        :copy="formCopy"
      />
    </template>

    <template
      v-else-if="resolvedPanelMode === 'create' || resolvedPanelMode === 'edit'"
    >
      <ElyForm
        class="mt-5"
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        :loading="resolvedLoading || resolvedDetailLoading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-panel')"
      />
    </template>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.${camelName}.detailEmptyDescription") }}
    </div>
  </section>
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

  const normalizeBlock =
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
      return `    ${field.key}: values.${field.key} ?? ${renderFieldDefaultValue(field)},`
    })
    .join("\n")

  const toEditDraftFields = inputFields
    .map(
      (field) =>
        `  ${field.key}: record.${field.key} ?? ${renderFieldDefaultValue(field)}`,
    )
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
${normalizeBlock}${normalizeBlock ? "\n\n" : ""}${requiredStringFields.length > 0 ? '  return {\n    status: "valid" as const,\n    payload: {\n' : '  return { status: "valid" as const, payload: {\n'}${payloadFields}
  ${requiredStringFields.length > 0 ? "  },\n}" : "  }"}
}

export const to${pascalName}EditDraft = (
  record: ${recordTypeName},
): Record<string, unknown> => ({
${toEditDraftFields},
})
`
}
