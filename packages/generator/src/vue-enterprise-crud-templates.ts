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
    .map(
      (f) =>
        `  const ${f.key} = String(query.${f.key} ?? "").trim().toLowerCase()`,
    )
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

const pluralizePascalName = (value: string) =>
  /[^aeiou]y$/i.test(value) ? `${value.slice(0, -1)}ies` : `${value}s`

const getViewPermissionPropName = (schemaName: string, pascalName: string) => {
  if (schemaName === "dictionary") {
    return "canViewDictionaries"
  }

  return `canView${pluralizePascalName(pascalName)}`
}

const getCreatePermissionPropName = (
  schemaName: string,
  pascalName: string,
) => {
  if (schemaName === "dictionary") {
    return "canCreateDictionaryTypes"
  }

  return `canCreate${pluralizePascalName(pascalName)}`
}

const getUpdatePermissionPropName = (
  schemaName: string,
  pascalName: string,
) => {
  if (schemaName === "dictionary") {
    return "canUpdateDictionaryTypes"
  }

  return `canUpdate${pluralizePascalName(pascalName)}`
}

const getPanelModeType = (schemaName: string) => {
  if (schemaName === "notification") {
    return '"detail" | "create"'
  }

  if (schemaName === "user") {
    return '"detail" | "create" | "edit" | "reset"'
  }

  return '"detail" | "create" | "edit"'
}

const getSelectedStateProperty = (schemaName: string, pascalName: string) => {
  if (schemaName === "dictionary") {
    return "selectedDictionaryType"
  }

  return `selected${pascalName}`
}

const getWorkspacePanelExtraState = (schemaName: string) => {
  switch (schemaName) {
    case "department":
      return `  parentLookup?: { value: Map<string, unknown> }
  selectedDepartmentDetail?: { value: { userIds?: string[] } | null }
`
    case "dictionary":
      return `  selectedDictionaryTypeItems?: {
    value: Array<{
      id?: string
      value?: string
      label?: string
      status?: string
      sort?: number
      isDefault?: boolean
    }>
  }
`
    case "menu":
      return `  parentLookup?: { value: Map<string, unknown> }
  selectedMenuDetail?: { value: { roleIds?: string[] } | null }
`
    case "role":
      return `  selectedRoleDetail?: {
    value: {
      permissionCodes?: string[]
      userIds?: string[]
      deptIds?: string[]
    } | null
  }
`
    default:
      return ""
  }
}

const renderVueEnterprisePanelTemplateOverride = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const viewPermission = getViewPermissionPropName(schema.name, pascalName)
  const createPermission = getCreatePermissionPropName(schema.name, pascalName)
  const updatePermission = getUpdatePermissionPropName(schema.name, pascalName)

  switch (schema.name) {
    case "department":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveDepartmentWorkspacePanelState,
} from "./department-workspace"
import type { DepartmentRecord } from "./department.schema"

type DepartmentWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DepartmentWorkspacePanelProps {
  t: DepartmentWorkspaceTranslation
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

const props = defineProps<DepartmentWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", department: DepartmentRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDepartmentWorkspaceState = computed(() =>
  resolveDepartmentWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentLoading ?? null,
  ),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentDetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.departmentDetailErrorMessage ??
      null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.departmentPanelMode ?? null,
  ),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.panelDescription ?? null,
  ),
  "",
)
const resolvedSelectedDepartment = readInjectedValue(
  computed(
    () => resolvedDepartmentWorkspaceState.value?.selectedDepartment ?? null,
  ),
  null as DepartmentRecord | null,
)
const resolvedSelectedDepartmentDetail = readInjectedValue(
  computed(
    () =>
      resolvedDepartmentWorkspaceState.value?.selectedDepartmentDetail ?? null,
  ),
  null as { userIds?: string[] } | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
const resolvedDepartmentParentLookup = readInjectedValue(
  computed(() => resolvedDepartmentWorkspaceState.value?.parentLookup ?? null),
  new Map<string, unknown>(),
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.department.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.departmentModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.departmentSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.departmentNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedDepartment"
      class="enterprise-inline-warning"
    >
      {{ t("app.department.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedDepartment"
    >
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedDepartment)"
        >
          {{ t("app.department.action.edit") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.department.action.create") }}
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

      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.department.meta.parent") }}</span>
          <strong>{{
            resolvedSelectedDepartment.parentId
              ? ((resolvedDepartmentParentLookup.get(
                  resolvedSelectedDepartment.parentId,
                ) as { name?: string } | undefined)?.name ??
                resolvedSelectedDepartment.parentId)
              : t("app.department.parentRoot")
          }}</strong>
        </div>
        <div v-if="resolvedSelectedDepartmentDetail">
          <span>{{ t("app.department.meta.userCount") }}</span>
          <strong>{{ resolvedSelectedDepartmentDetail.userIds?.length ?? 0 }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedDepartmentDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.department.meta.userIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              (resolvedSelectedDepartmentDetail.userIds?.length ?? 0) > 0
                ? resolvedSelectedDepartmentDetail.userIds?.join(", ")
                : t("app.department.meta.empty")
            }}
          </p>
        </div>
      </div>
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
      {{ t("app.department.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    case "dictionary":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveDictionaryWorkspacePanelState,
} from "./dictionary-workspace"
import type { DictionaryRecord } from "./dictionary.schema"

type DictionaryWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface DictionaryWorkspacePanelProps {
  t: DictionaryWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  localizeDictionaryStatus: (status: string) => string
  workspaceStateInjected?: boolean
}

const props = defineProps<DictionaryWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", dictionary: DictionaryRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedDictionaryWorkspaceState = computed(() =>
  resolveDictionaryWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedDictionaryWorkspaceState.value?.dictionaryLoading ?? null,
  ),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.dictionaryDetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.dictionaryErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.dictionaryDetailErrorMessage ??
      null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () => resolvedDictionaryWorkspaceState.value?.dictionaryPanelMode ?? null,
  ),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedDictionaryWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedDictionaryWorkspaceState.value?.panelDescription ?? null,
  ),
  "",
)
const resolvedSelectedDictionaryType = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.selectedDictionaryType ?? null,
  ),
  null as DictionaryRecord | null,
)
const resolvedSelectedDictionaryTypeItems = readInjectedValue(
  computed(
    () =>
      resolvedDictionaryWorkspaceState.value?.selectedDictionaryTypeItems ??
      null,
  ),
  [] as Array<{
    id?: string
    value?: string
    label?: string
    status?: string
    sort?: number
    isDefault?: boolean
  }>,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedDictionaryWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedDictionaryWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.dictionary.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.dictionaryModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.dictionarySignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.dictionaryNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedDictionaryType"
      class="enterprise-inline-warning"
    >
      {{ t("app.dictionary.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="
        resolvedPanelMode === 'detail' && resolvedSelectedDictionaryType
      "
    >
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedDictionaryType)"
        >
          {{ t("app.dictionary.action.edit") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.dictionary.action.create") }}
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

      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.dictionary.meta.itemCount") }}</span>
          <strong>{{ resolvedSelectedDictionaryTypeItems.length }}</strong>
        </div>
        <div>
          <span>{{ t("app.dictionary.meta.defaultCount") }}</span>
          <strong>{{
            resolvedSelectedDictionaryTypeItems.filter((item) => item.isDefault)
              .length
          }}</strong>
        </div>
      </div>

      <div class="mt-5">
        <p class="enterprise-subheading">
          {{ t("app.dictionary.meta.items") }}
        </p>
        <div
          v-if="resolvedSelectedDictionaryTypeItems.length === 0"
          class="enterprise-inline-warning mt-3"
        >
          {{ t("app.dictionary.meta.empty") }}
        </div>
        <div v-else class="mt-3 space-y-3">
          <div
            v-for="item in resolvedSelectedDictionaryTypeItems"
            :key="item.id"
            class="enterprise-metadata"
          >
            <div>
              <span>{{ item.value }}</span>
              <strong>{{ item.label }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemStatus") }}</span>
              <strong>{{ localizeDictionaryStatus(String(item.status ?? "")) }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemSort") }}</span>
              <strong>{{ item.sort }}</strong>
            </div>
            <div>
              <span>{{ t("app.dictionary.meta.itemDefault") }}</span>
              <strong>{{
                item.isDefault
                  ? t("app.dictionary.boolean.true")
                  : t("app.dictionary.boolean.false")
              }}</strong>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template
      v-else-if="
        resolvedPanelMode === 'create' || resolvedPanelMode === 'edit'
      "
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
      {{ t("app.dictionary.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    case "menu":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveMenuWorkspacePanelState,
} from "./menu-workspace"
import type { MenuRecord } from "./menu.schema"

type MenuWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface MenuWorkspacePanelProps {
  t: MenuWorkspaceTranslation
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

const props = defineProps<MenuWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", menu: MenuRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedMenuWorkspaceState = computed(() =>
  resolveMenuWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuDetailLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuErrorMessage ?? null),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedMenuWorkspaceState.value?.menuDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.menuPanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.panelDescription ?? null),
  "",
)
const resolvedSelectedMenu = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.selectedMenu ?? null),
  null as MenuRecord | null,
)
const resolvedSelectedMenuDetail = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.selectedMenuDetail ?? null),
  null as { roleIds?: string[] } | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
const resolvedMenuParentLookup = readInjectedValue(
  computed(() => resolvedMenuWorkspaceState.value?.parentLookup ?? null),
  new Map<string, unknown>(),
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.menu.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.menuModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.menuSignInToLoad") }}
    </div>

    <div v-else-if="canEnterWorkspace && !${viewPermission}" class="enterprise-inline-warning">
      {{ t("app.message.menuNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedMenu"
      class="enterprise-inline-warning"
    >
      {{ t("app.menu.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedMenu">
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedMenu)"
        >
          {{ t("app.menu.action.edit") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.menu.action.create") }}
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

      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.menu.meta.parent") }}</span>
          <strong>{{
            resolvedSelectedMenu.parentId
              ? ((resolvedMenuParentLookup.get(
                  resolvedSelectedMenu.parentId,
                ) as { name?: string } | undefined)?.name ??
                resolvedSelectedMenu.parentId)
              : t("app.menu.parentRoot")
          }}</strong>
        </div>
        <div v-if="resolvedSelectedMenuDetail">
          <span>{{ t("app.menu.meta.roleCount") }}</span>
          <strong>{{ resolvedSelectedMenuDetail.roleIds?.length ?? 0 }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedMenuDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.menu.meta.roleIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              (resolvedSelectedMenuDetail.roleIds?.length ?? 0) > 0
                ? resolvedSelectedMenuDetail.roleIds?.join(", ")
                : t("app.menu.meta.empty")
            }}
          </p>
        </div>
      </div>
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
      {{ t("app.menu.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    case "notification":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveNotificationWorkspacePanelState,
} from "./notification-workspace"
import type { NotificationRecord } from "./notification.schema"

type NotificationWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface NotificationWorkspacePanelProps {
  t: NotificationWorkspaceTranslation
  locale: string
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  localizeNotificationStatus: (status: string) => string
  localizeNotificationLevel: (level: string) => string
  workspaceStateInjected?: boolean
}

const props = defineProps<NotificationWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "mark-read"): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedNotificationWorkspaceState = computed(() =>
  resolveNotificationWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(
    () => resolvedNotificationWorkspaceState.value?.notificationLoading ?? null,
  ),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.notificationDetailLoading ??
      null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.notificationErrorMessage ??
      null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value
        ?.notificationDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.notificationPanelMode ?? null,
  ),
  "detail" as "detail" | "create",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(
    () => resolvedNotificationWorkspaceState.value?.panelDescription ?? null,
  ),
  "",
)
const resolvedSelectedNotification = readInjectedValue(
  computed(
    () =>
      resolvedNotificationWorkspaceState.value?.selectedNotification ?? null,
  ),
  null as NotificationRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedNotificationWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.notification.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.notificationModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.notificationSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.notificationNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedNotification"
      class="enterprise-inline-warning"
    >
      {{ t("app.notification.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template
      v-else-if="
        resolvedPanelMode === 'detail' && resolvedSelectedNotification
      "
    >
      <div class="enterprise-button-row">
        <button
          v-if="
            ${updatePermission} &&
            resolvedSelectedNotification.status === 'unread'
          "
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('mark-read')"
        >
          {{ t("app.notification.action.markRead") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.notification.action.create") }}
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

      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.notification.meta.status") }}</span>
          <strong>{{
            localizeNotificationStatus(resolvedSelectedNotification.status)
          }}</strong>
        </div>
        <div>
          <span>{{ t("app.notification.meta.level") }}</span>
          <strong>{{
            localizeNotificationLevel(resolvedSelectedNotification.level)
          }}</strong>
        </div>
        <div>
          <span>{{ t("app.notification.meta.readAt") }}</span>
          <strong>{{
            resolvedSelectedNotification.readAt
              ? new Date(resolvedSelectedNotification.readAt).toLocaleString(
                  locale,
                )
              : t("app.notification.readAtEmpty")
          }}</strong>
        </div>
      </div>
    </template>

    <template v-else-if="resolvedPanelMode === 'create'">
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
      {{ t("app.notification.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    case "role":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveRoleWorkspacePanelState,
} from "./role-workspace"
import type { RoleRecord } from "./role.schema"

type RoleWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface RoleWorkspacePanelProps {
  t: RoleWorkspaceTranslation
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

const props = defineProps<RoleWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", role: RoleRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedRoleWorkspaceState = computed(() =>
  resolveRoleWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.roleLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.roleDetailLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.roleErrorMessage ?? null),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedRoleWorkspaceState.value?.roleDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.rolePanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.panelDescription ?? null),
  "",
)
const resolvedSelectedRole = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.selectedRole ?? null),
  null as RoleRecord | null,
)
const resolvedSelectedRoleDetail = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.selectedRoleDetail ?? null),
  null as {
    permissionCodes?: string[]
    userIds?: string[]
    deptIds?: string[]
  } | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedRoleWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.role.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.roleModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.roleSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.roleNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedRole"
      class="enterprise-inline-warning"
    >
      {{ t("app.role.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedRole">
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedRole)"
        >
          {{ t("app.role.action.edit") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.role.action.create") }}
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

      <div v-if="resolvedSelectedRoleDetail" class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.role.meta.permissionCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.permissionCodes?.length ?? 0 }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.userCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.userIds?.length ?? 0 }}</strong>
        </div>
        <div>
          <span>{{ t("app.role.meta.deptCount") }}</span>
          <strong>{{ resolvedSelectedRoleDetail.deptIds?.length ?? 0 }}</strong>
        </div>
      </div>

      <div v-if="resolvedSelectedRoleDetail" class="mt-5 space-y-4">
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.permissionCodes") }}
          </p>
          <p class="enterprise-copy">
            {{
              (resolvedSelectedRoleDetail.permissionCodes?.length ?? 0) > 0
                ? resolvedSelectedRoleDetail.permissionCodes?.join(", ")
                : t("app.role.meta.empty")
            }}
          </p>
        </div>
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.userIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              (resolvedSelectedRoleDetail.userIds?.length ?? 0) > 0
                ? resolvedSelectedRoleDetail.userIds?.join(", ")
                : t("app.role.meta.empty")
            }}
          </p>
        </div>
        <div>
          <p class="enterprise-subheading">
            {{ t("app.role.meta.deptIds") }}
          </p>
          <p class="enterprise-copy">
            {{
              (resolvedSelectedRoleDetail.deptIds?.length ?? 0) > 0
                ? resolvedSelectedRoleDetail.deptIds?.join(", ")
                : t("app.role.meta.empty")
            }}
          </p>
        </div>
      </div>
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
      {{ t("app.role.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    case "tenant":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveTenantWorkspacePanelState,
} from "./tenant-workspace"
import type { TenantRecord } from "./tenant.schema"

type TenantWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface TenantWorkspacePanelProps {
  t: TenantWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  formCopy: ElyFormCopy
  workspaceStateInjected?: boolean
}

const props = defineProps<TenantWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", tenant: TenantRecord): void
  (e: "toggle-status"): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
}>()

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedTenantWorkspaceState = computed(() =>
  resolveTenantWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.tenantLoading ?? null),
  false,
)
const resolvedDetailLoading = readInjectedValue(
  computed(
    () => resolvedTenantWorkspaceState.value?.tenantDetailLoading ?? null,
  ),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(
    () => resolvedTenantWorkspaceState.value?.tenantErrorMessage ?? null,
  ),
  "",
)
const resolvedDetailErrorMessage = readInjectedValue(
  computed(
    () => resolvedTenantWorkspaceState.value?.tenantDetailErrorMessage ?? null,
  ),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.tenantPanelMode ?? null),
  "detail" as "detail" | "create" | "edit",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.panelDescription ?? null),
  "",
)
const resolvedSelectedTenant = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.selectedTenant ?? null),
  null as TenantRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedTenantWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.tenant.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.tenantModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.tenantSignInToLoad") }}
    </div>

    <div
      v-else-if="authModuleReady && isAuthenticated && !isSuperAdmin"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.tenantSuperAdminRequired") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.tenantNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <div
      v-else-if="resolvedDetailLoading && resolvedSelectedTenant"
      class="enterprise-inline-warning"
    >
      {{ t("app.tenant.detailLoading") }}
    </div>

    <div v-else-if="resolvedDetailErrorMessage" class="enterprise-inline-warning">
      {{ resolvedDetailErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedTenant">
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('start-edit', resolvedSelectedTenant)"
        >
          {{ t("app.tenant.action.edit") }}
        </button>
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          :disabled="resolvedLoading || resolvedDetailLoading"
          @click="emit('toggle-status')"
        >
          {{
            resolvedSelectedTenant.status === "active"
              ? t("app.tenant.action.suspend")
              : t("app.tenant.action.activate")
          }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.tenant.action.create") }}
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
      {{ t("app.tenant.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    case "user":
      return `<script setup lang="ts">
import {
  ElyForm,
  type ElyFormCopy,
  type ElyFormField,
  type ElyFormValues,
} from "@elysian/ui-enterprise-vue"
import { Input as TInput } from "tdesign-vue-next/es/input"
import { computed, inject } from "vue"

import { WORKSPACE_STATE_KEY } from "@elysian/frontend-vue"
import {
  readInjectedValue,
  resolveUserWorkspacePanelState,
} from "./user-workspace"
import type { UserRecord } from "./user.schema"

type UserWorkspaceTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

interface UserWorkspacePanelProps {
  t: UserWorkspaceTranslation
  moduleReady: boolean
  authModuleReady: boolean
  isAuthenticated: boolean
  canEnterWorkspace: boolean
  ${viewPermission}: boolean
  ${createPermission}: boolean
  ${updatePermission}: boolean
  canResetUserPasswords: boolean
  formCopy: ElyFormCopy
  passwordInput: string
  workspaceStateInjected?: boolean
}

const props = defineProps<UserWorkspacePanelProps>()

const emit = defineEmits<{
  (e: "start-edit", user: UserRecord): void
  (e: "start-password-reset", user: UserRecord): void
  (e: "open-create"): void
  (e: "submit-form", values: ElyFormValues): void
  (e: "cancel-panel"): void
  (e: "update:password-input", value: string): void
  (e: "submit-password-reset"): void
}>()

const handlePasswordInput = (value: string | number) => {
  emit("update:password-input", String(value))
}

const injectedWorkspaceState = inject(
  WORKSPACE_STATE_KEY,
  computed(() => null),
)

const resolvedUserWorkspaceState = computed(() =>
  resolveUserWorkspacePanelState(
    injectedWorkspaceState.value,
    Boolean(props.workspaceStateInjected),
  ),
)

const resolvedLoading = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.userLoading ?? null),
  false,
)
const resolvedErrorMessage = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.userErrorMessage ?? null),
  "",
)
const resolvedPanelMode = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.userPanelMode ?? null),
  "detail" as "detail" | "create" | "edit" | "reset",
)
const resolvedPanelTitle = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.panelTitle ?? null),
  "",
)
const resolvedPanelDescription = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.panelDescription ?? null),
  "",
)
const resolvedSelectedUser = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.selectedUser ?? null),
  null as UserRecord | null,
)
const resolvedFormFields = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.formFields ?? null),
  [] as ElyFormField[],
)
const resolvedFormValues = readInjectedValue(
  computed(() => resolvedUserWorkspaceState.value?.formValues ?? null),
  {} as ElyFormValues,
)
</script>

<template>
  <section class="enterprise-card">
    <p class="enterprise-eyebrow">{{ t("app.user.detailEyebrow") }}</p>
    <h3 class="enterprise-heading">{{ resolvedPanelTitle }}</h3>
    <p class="enterprise-copy">{{ resolvedPanelDescription }}</p>

    <div v-if="!moduleReady" class="enterprise-inline-warning">
      {{ t("app.message.userModuleOffline") }}
    </div>

    <div v-else-if="authModuleReady && !isAuthenticated" class="enterprise-inline-warning">
      {{ t("app.message.userSignInToLoad") }}
    </div>

    <div
      v-else-if="canEnterWorkspace && !${viewPermission}"
      class="enterprise-inline-warning"
    >
      {{ t("app.message.userNoListPermission") }}
    </div>

    <div v-else-if="resolvedErrorMessage" class="enterprise-inline-warning">
      {{ resolvedErrorMessage }}
    </div>

    <template v-else-if="resolvedPanelMode === 'detail' && resolvedSelectedUser">
      <div class="enterprise-button-row">
        <button
          v-if="${updatePermission}"
          type="button"
          class="enterprise-button"
          :disabled="resolvedLoading"
          @click="emit('start-edit', resolvedSelectedUser)"
        >
          {{ t("app.user.action.edit") }}
        </button>
        <button
          v-if="canResetUserPasswords"
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="resolvedLoading"
          @click="emit('start-password-reset', resolvedSelectedUser)"
        >
          {{ t("app.user.action.resetPassword") }}
        </button>
        <button
          v-if="${createPermission}"
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('open-create')"
        >
          {{ t("app.user.action.create") }}
        </button>
      </div>

      <ElyForm
        class="mt-5"
        :fields="resolvedFormFields"
        :values="resolvedFormValues"
        readonly
        :loading="resolvedLoading"
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
        :loading="resolvedLoading"
        :copy="formCopy"
        @submit="emit('submit-form', $event)"
        @cancel="emit('cancel-panel')"
      />

      <label v-if="resolvedPanelMode === 'create'" class="enterprise-field mt-2">
        <span>{{ t("app.user.field.password") }}</span>
        <TInput
          :model-value="passwordInput"
          type="password"
          :disabled="resolvedLoading"
          :placeholder="t('app.user.passwordPlaceholder')"
          @update:model-value="handlePasswordInput"
        />
      </label>
    </template>

    <template v-else-if="resolvedPanelMode === 'reset' && resolvedSelectedUser">
      <div class="enterprise-metadata mt-5">
        <div>
          <span>{{ t("app.user.field.username") }}</span>
          <strong>{{ resolvedSelectedUser.username }}</strong>
        </div>
        <div>
          <span>{{ t("app.user.field.displayName") }}</span>
          <strong>{{ resolvedSelectedUser.displayName }}</strong>
        </div>
      </div>

      <label class="enterprise-field mt-5">
        <span>{{ t("app.user.field.password") }}</span>
        <TInput
          :model-value="passwordInput"
          type="password"
          :disabled="resolvedLoading"
          :placeholder="t('app.user.passwordPlaceholder')"
          @update:model-value="handlePasswordInput"
        />
      </label>

      <div class="enterprise-button-row">
        <button
          type="button"
          class="enterprise-button enterprise-button-danger"
          :disabled="resolvedLoading"
          @click="emit('submit-password-reset')"
        >
          {{ t("app.user.action.confirmResetPassword") }}
        </button>
        <button
          type="button"
          class="enterprise-button enterprise-button-ghost"
          @click="emit('cancel-panel')"
        >
          {{ t("app.panel.cancel") }}
        </button>
      </div>
    </template>

    <div v-else class="enterprise-inline-warning mt-5">
      {{ t("app.user.detailEmptyDescription") }}
    </div>
  </section>
  </template>
`
    default:
      return null
  }
}

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
