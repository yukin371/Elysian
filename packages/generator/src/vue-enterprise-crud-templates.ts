import type { ModuleField, ModuleSchema } from "@elysian/schema"

import { toCamelCase, toPascalCase } from "./naming"

export const renderPagePanelPath = (schema: ModuleSchema) =>
  `modules/${schema.name}/${schema.name}-panel.vue`

export const renderWorkspaceTemplatePath = (schema: ModuleSchema) =>
  `modules/${schema.name}/${schema.name}-workspace.ts`

const SYSTEM_FIELD_KEYS = new Set(["id", "createdAt", "updatedAt"])

const renderFieldDefaultValue = (field: ModuleField): string => {
  if (field.kind === "boolean") return "false"
  if (field.kind === "number") return "0"
  if (field.kind === "enum") {
    const firstOption = field.options?.[0]

    if (firstOption) {
      return JSON.stringify(firstOption.value)
    }
  }
  if (field.kind === "datetime") return '""'
  return '""'
}

const renderFilterBody = (schema: ModuleSchema): string => {
  const searchableFields = schema.fields.filter(
    (field) => field.searchable === true,
  )

  if (searchableFields.length === 0) {
    return "  return items"
  }

  const normalizeLines = searchableFields
    .filter((f) => f.kind === "string" || f.kind === "id")
    .map((f) => `  const ${f.key} = query.${f.key}?.trim().toLowerCase() ?? ""`)
    .join("\n")

  const filterConditions = searchableFields
    .map((f) => {
      if (f.kind === "string" || f.kind === "id") {
        return `    if (${f.key}.length > 0 && !String(item.${f.key} ?? "").toLowerCase().includes(${f.key})) return false`
      }
      if (f.kind === "enum" || f.kind === "boolean") {
        return `    if (query.${f.key} !== undefined && query.${f.key} !== null && query.${f.key} !== "" && item.${f.key} !== query.${f.key}) return false`
      }
      return `    if (query.${f.key} !== undefined && query.${f.key} !== null && query.${f.key} !== "" && item.${f.key} !== query.${f.key}) return false`
    })
    .join("\n")

  const hasTextFields = searchableFields.some(
    (f) => f.kind === "string" || f.kind === "id",
  )

  return `${hasTextFields ? `${normalizeLines}\n\n` : ""}  return items.filter((item) => {\n${filterConditions}\n\n    return true\n  })`
}

export const renderVueEnterpriseMainTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)
  const recordTypeName = `${pascalName}Record`

  return `<script setup lang="ts">
import {
  ElyCrudWorkspace,
  type ElyCrudWorkspaceProps,
  type ElyQueryField,
  type ElyQueryValues,
  type ElyTableColumn,
} from "@elysian/ui-enterprise-vue"

import type { ${recordTypeName} } from "./${schema.name}.schema"

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
  canView${pascalName}s: boolean
  loading: boolean
  errorMessage: string
  queryFields: ElyQueryField[]
  tableColumns: ElyTableColumn[]
  items: ${recordTypeName}[]
  itemCountLabel: string
  emptyTitle: string
  emptyDescription: string
  currentQuerySummary: string
  copy: ElyCrudWorkspaceProps["copy"]
}

defineProps<${pascalName}WorkspaceMainProps>()

const emit = defineEmits<{
  (e: "search", values: ElyQueryValues): void
  (e: "reset"): void
  (e: "row-click", row: ${recordTypeName}): void
}>()
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
      v-else-if="canEnterWorkspace && !canView${pascalName}s"
      class="enterprise-message enterprise-message-warning"
    >
      {{ t("app.message.${camelName}NoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-message enterprise-message-danger">
      {{ errorMessage }}
    </div>

    <ElyCrudWorkspace
      v-else
      :eyebrow="t('app.${camelName}.workspaceEyebrow')"
      :title="t('app.${camelName}.workspaceTitle')"
      :description="t('app.${camelName}.workspaceDescription')"
      :query-fields="queryFields"
      :query-loading="loading"
      :table-columns="tableColumns"
      :items="items"
      :table-loading="loading"
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

<style scoped>
.enterprise-message {
  border-radius: 12px;
  padding: 1rem 1.1rem;
  line-height: 1.75;
}

.enterprise-message-info {
  border: 1px solid rgba(14, 165, 233, 0.18);
  background: rgba(14, 165, 233, 0.08);
  color: #0c4a6e;
}

.enterprise-message-warning {
  border: 1px solid rgba(245, 158, 11, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.enterprise-message-danger {
  border: 1px solid rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
}

.enterprise-toolbar-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  color: #475569;
}
</style>
`
}

export const renderVueEnterprisePanelTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)
  const recordTypeName = `${pascalName}Record`

  return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"

import type { ${recordTypeName} } from "./${schema.name}.schema"

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
  canView${pascalName}s: boolean
  canCreate${pascalName}s: boolean
  canUpdate${pascalName}s: boolean
  loading: boolean
  detailLoading: boolean
  errorMessage: string
  detailErrorMessage: string
  panelMode: "detail" | "create" | "edit"
  panelTitle: string
  panelDescription: string
  selected${pascalName}: ${recordTypeName} | null
  formFields: ElyFormField[]
  formValues: ElyFormValues
  formCopy: ElyFormCopy
}

defineProps<${pascalName}WorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", ${camelName}: ${recordTypeName}): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.${camelName}.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ panelTitle }}</h3>
    <p class="enterprise-copy">{{ panelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.${camelName}ModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.${camelName}SignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !canView${pascalName}s"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.${camelName}NoListPermission") }}
    </div>

    <div v-else-if="errorMessage" class="enterprise-inline-warning">
      {{ errorMessage }}
    </div>

    <div v-else-if="detailLoading && selected${pascalName}" class="enterprise-inline-warning">
      {{ t("app.${camelName}.detailLoading") }}
    </div>

    <div v-else-if="detailErrorMessage" class="enterprise-inline-warning">
      {{ detailErrorMessage }}
    </div>

    <template v-else-if="panelMode === 'detail' && selected${pascalName}">
      <div class="enterprise-button-row">
        <button
          v-if="canUpdate${pascalName}s"
          type="button"
          class="enterprise-button"
          :disabled="loading || detailLoading"
          @click="emit('start-edit', selected${pascalName})"
        >
          {{ t("app.${camelName}.action.edit") }}
        </button>
        <button
          v-if="canCreate${pascalName}s"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.${camelName}.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        readonly
        :loading="loading || detailLoading"
        :copy="formCopy"
      />
    </template>

    <template v-else-if="panelMode === 'create' || panelMode === 'edit'">
      <ElyForm
        class="mt-5"
        :fields="formFields"
        :values="formValues"
        :loading="loading || detailLoading"
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

<style scoped>
.enterprise-card {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  padding: 1.2rem;
  color: #0f172a;
}

.enterprise-eyebrow,
.enterprise-heading,
.enterprise-copy,
.enterprise-inline-warning {
  margin: 0;
}

.enterprise-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.enterprise-heading {
  margin-top: 0.7rem;
  font-size: 1.35rem;
  color: #0f172a;
}

.enterprise-copy {
  margin-top: 0.75rem;
  line-height: 1.75;
  color: #475569;
}

.enterprise-inline-warning {
  margin-top: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.16);
  background: rgba(255, 251, 235, 0.96);
  padding: 0.85rem 0.95rem;
  color: #92400e;
}

.enterprise-button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.enterprise-button {
  border: 1px solid rgba(36, 87, 214, 0.18);
  border-radius: 12px;
  background: linear-gradient(135deg, #2457d6, #173ea6);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.65rem 1rem;
}

.enterprise-button-ghost {
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
}
</style>
`
}

export const renderVueWorkspaceComposableTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const recordTypeName = `${pascalName}Record`
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

  return `import type { ${recordTypeName} } from "./${schema.name}.schema"

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
