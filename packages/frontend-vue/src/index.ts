import type {
  ModuleFrontendSchema,
  ModulePermissionActions,
  ModuleSchema,
} from "@elysian/schema"
import {
  type UiCrudPageDefinition,
  type UiFormField,
  type UiMenuItem,
  type UiPresetManifest,
  type UiQueryField,
  type UiSelectOption,
  buildNavigationTree,
  filterAccessibleMenus,
  hasPermission,
} from "@elysian/ui-core"
import {
  type ComputedRef,
  type InjectionKey,
  type Ref,
  computed,
  inject,
  provide,
  ref,
} from "vue"

const SYSTEM_FORM_FIELD_KEYS = new Set(["id", "createdAt", "updatedAt"])

const toColumnKind = (kind: ModuleSchema["fields"][number]["kind"]) => {
  switch (kind) {
    case "boolean":
      return "boolean"
    case "datetime":
      return "datetime"
    case "number":
      return "number"
    default:
      return "text"
  }
}

const toInputKind = (kind: ModuleSchema["fields"][number]["kind"]) => {
  switch (kind) {
    case "boolean":
      return "switch"
    case "datetime":
      return "datetime"
    case "enum":
      return "select"
    case "number":
      return "number"
    default:
      return "text"
  }
}

const toQueryKind = (field: ModuleSchema["fields"][number]) => {
  switch (field.kind) {
    case "enum":
      return field.options && field.options.length > 0 ? "select" : "status"
    case "datetime":
      return "date-range"
    default:
      return "text"
  }
}

export const vueCustomPresetManifest: UiPresetManifest = {
  key: "vue-custom",
  framework: "vue",
  kind: "custom",
  status: "prototype",
  displayName: "Vue Custom",
  description:
    "Hand-crafted Vue + Tailwind preset for indie products and customizable admin surfaces.",
}

export const vueEnterprisePresetTarget: UiPresetManifest = {
  key: "vue-enterprise",
  framework: "vue",
  kind: "enterprise",
  status: "planned",
  displayName: "Vue Enterprise",
  description:
    "Reserved preset slot for a third-party enterprise component library with unified Elysian wrappers.",
}

export const buildVueCustomCrudPage = (
  schema: ModuleSchema,
): UiCrudPageDefinition => ({
  key: `${schema.name}-crud`,
  title: `${schema.label} Workspace`,
  resource: schema.name,
  columns: schema.fields.map((field) => ({
    key: field.key,
    label: field.label,
    kind: toColumnKind(field.kind),
  })),
  queryFields: schema.fields
    .filter((field) => field.searchable)
    .map((field) => ({
      key: field.key,
      label: field.label,
      kind: toQueryKind(field),
      options: field.options,
      dictionaryTypeCode: field.dictionaryTypeCode,
    })),
  formFields: schema.fields
    .filter((field) => !SYSTEM_FORM_FIELD_KEYS.has(field.key))
    .map((field) => ({
      key: field.key,
      label: field.label,
      input: toInputKind(field.kind),
      required: field.required ?? false,
      options: field.options,
      dictionaryTypeCode: field.dictionaryTypeCode,
    })),
  actions: [
    {
      key: "create",
      label: "Create",
      permissionCode: `${schema.name}:${schema.name}:create`,
      tone: "primary",
    },
    {
      key: "update",
      label: "Update",
      permissionCode: `${schema.name}:${schema.name}:update`,
      tone: "secondary",
    },
    {
      key: "delete",
      label: "Delete",
      permissionCode: `${schema.name}:${schema.name}:delete`,
      tone: "danger",
    },
  ],
})

export interface WorkspaceRegistrationLike {
  domain: "business" | "system"
  i18nKeys: {
    sectionCopy: string
    sectionTitle: string
    shellDescription: string
    shellTitle: string
  }
  kind: string
  moduleCode: string
  path: string
  permissions: Record<string, string>
  permissionPrefix: string
}

export interface FrontendModuleArtifactLike {
  i18nKeys: WorkspaceRegistrationLike["i18nKeys"]
  kind: string
  moduleCode: string
  permissions: Record<string, string>
  permissionPrefix: string | null
  routePath: string | null
  workspaceDomain: WorkspaceRegistrationLike["domain"] | null
}

export interface FrontendWorkspaceState<TKind extends string = string> {
  errorMessage: Ref<string>
  kind: TKind
  loading: Ref<boolean>
}

export interface FrontendWorkspaceStateContext<
  TKind extends string = string,
  TState = unknown,
> extends FrontendWorkspaceState<TKind> {
  state: TState
}

export const WORKSPACE_STATE_KEY: InjectionKey<
  ComputedRef<FrontendWorkspaceStateContext | null>
> = Symbol("elysian-workspace-state")

const DEFAULT_PERMISSION_ACTIONS: ModulePermissionActions = {
  create: true,
  list: true,
  update: true,
}

const derivePermissions = (
  permissionPrefix: string,
  actions: ModulePermissionActions | undefined,
): Record<string, string> => {
  const resolved = actions ?? DEFAULT_PERMISSION_ACTIONS
  const permissions: Record<string, string> = {}

  if (resolved.list) permissions.list = `${permissionPrefix}:list`
  if (resolved.create) permissions.create = `${permissionPrefix}:create`
  if (resolved.update) permissions.update = `${permissionPrefix}:update`
  if (resolved.delete) permissions.delete = `${permissionPrefix}:delete`
  if (resolved.export) permissions.export = `${permissionPrefix}:export`

  return permissions
}

const deriveI18nKeys = (moduleName: string) => ({
  sectionTitle: `app.${moduleName}.sectionTitle`,
  sectionCopy: `app.${moduleName}.sectionCopy`,
  shellTitle: `app.${moduleName}.shellTitle`,
  shellDescription: `app.${moduleName}.shellDescription`,
})

export const buildWorkspaceRegistration = (
  schema: ModuleSchema,
): WorkspaceRegistrationLike => {
  const frontend: ModuleFrontendSchema = schema.frontend ?? {
    workspaceDomain: "system",
    routePath: `/${schema.name}s`,
  }
  const permissionPrefix = frontend.permissionPrefix ?? schema.name

  return {
    domain: frontend.workspaceDomain,
    path: frontend.routePath,
    kind: frontend.workspaceKind ?? schema.name,
    moduleCode: frontend.moduleCode ?? schema.name,
    permissionPrefix,
    permissions: derivePermissions(
      permissionPrefix,
      frontend.permissionActions,
    ),
    i18nKeys: deriveI18nKeys(schema.name),
  }
}

export const buildWorkspaceRegistrationFromArtifact = (
  artifact: FrontendModuleArtifactLike,
): WorkspaceRegistrationLike => {
  if (!artifact.workspaceDomain) {
    throw new Error("Frontend module artifact is missing workspaceDomain")
  }

  if (!artifact.routePath) {
    throw new Error("Frontend module artifact is missing routePath")
  }

  if (!artifact.permissionPrefix) {
    throw new Error("Frontend module artifact is missing permissionPrefix")
  }

  return {
    domain: artifact.workspaceDomain,
    path: artifact.routePath,
    kind: artifact.kind,
    moduleCode: artifact.moduleCode,
    permissionPrefix: artifact.permissionPrefix,
    permissions: artifact.permissions,
    i18nKeys: artifact.i18nKeys,
  }
}

export interface CrudDictionaryTypeRecord {
  id: string
  code: string
  status: "active" | "disabled"
}

export interface CrudDictionaryItemRecord {
  typeId: string
  value: string
  label: string
  sort: number
  status: "active" | "disabled"
}

export type CrudDictionaryOptionCatalog = Record<string, UiSelectOption[]>

const resolveDictionaryOptions = <TField extends UiQueryField | UiFormField>(
  field: TField,
  catalog: CrudDictionaryOptionCatalog,
): TField => {
  if (!field.dictionaryTypeCode) {
    return field
  }

  const dictionaryOptions = catalog[field.dictionaryTypeCode]

  return {
    ...field,
    options:
      dictionaryOptions && dictionaryOptions.length > 0
        ? dictionaryOptions
        : field.options,
  }
}

export const getCrudPageDictionaryTypeCodes = (
  definition: UiCrudPageDefinition,
) => [
  ...new Set(
    [...definition.queryFields, ...definition.formFields]
      .map((field) => field.dictionaryTypeCode)
      .filter((code): code is string => Boolean(code)),
  ),
]

export const buildCrudDictionaryOptionCatalog = (
  dictionaryTypes: CrudDictionaryTypeRecord[],
  dictionaryItems: CrudDictionaryItemRecord[],
): CrudDictionaryOptionCatalog => {
  const activeTypesById = new Map(
    dictionaryTypes
      .filter((type) => type.status === "active")
      .map((type) => [type.id, type.code]),
  )

  return dictionaryItems
    .filter((item) => item.status === "active")
    .sort(
      (left, right) =>
        left.sort - right.sort || left.label.localeCompare(right.label),
    )
    .reduce<CrudDictionaryOptionCatalog>((catalog, item) => {
      const typeCode = activeTypesById.get(item.typeId)

      if (!typeCode) {
        return catalog
      }

      catalog[typeCode] ??= []
      catalog[typeCode]?.push({
        label: item.label,
        value: item.value,
      })
      return catalog
    }, {})
}

export const applyCrudDictionaryOptions = (
  definition: UiCrudPageDefinition,
  catalog: CrudDictionaryOptionCatalog,
): UiCrudPageDefinition => ({
  ...definition,
  queryFields: definition.queryFields.map((field) =>
    resolveDictionaryOptions(field, catalog),
  ),
  formFields: definition.formFields.map((field) =>
    resolveDictionaryOptions(field, catalog),
  ),
})

export const buildVueNavigation = (
  menus: UiMenuItem[],
  permissionCodes: string[],
) => buildNavigationTree(filterAccessibleMenus(menus, permissionCodes))

/**
 * Pure TypeScript permission gate builder.
 *
 * Takes a flat permission code list and a map of action → permissionCode,
 * returns an object of booleans keyed by action name.
 *
 * Vue callers wrap the result in `computed()` to stay reactive to identity changes.
 * Non-Vue callers can use the result directly as a static snapshot.
 * When `moduleReady` is false, all gates default to `true` (no guard active yet).
 */
export const buildPermissionGates = (
  permissionCodes: readonly string[],
  actionCodes: Record<string, string>,
  moduleReady: boolean,
) => ({
  list: !moduleReady || permissionCodes.includes(actionCodes.list ?? ""),
  create: !moduleReady || permissionCodes.includes(actionCodes.create ?? ""),
  update: !moduleReady || permissionCodes.includes(actionCodes.update ?? ""),
  delete: !moduleReady || permissionCodes.includes(actionCodes.delete ?? ""),
})

/** Vue-composable wrapper around buildPermissionGates. */
export const usePermissions = (
  permissionCodes: { value: readonly string[] },
  actionCodes: Record<string, string>,
  moduleReady: boolean | { value: boolean },
) => ({
  list: computed<boolean>(
    () =>
      buildPermissionGates(
        permissionCodes.value,
        actionCodes,
        typeof moduleReady === "boolean" ? moduleReady : moduleReady.value,
      ).list,
  ),
  create: computed<boolean>(
    () =>
      buildPermissionGates(
        permissionCodes.value,
        actionCodes,
        typeof moduleReady === "boolean" ? moduleReady : moduleReady.value,
      ).create,
  ),
  update: computed<boolean>(
    () =>
      buildPermissionGates(
        permissionCodes.value,
        actionCodes,
        typeof moduleReady === "boolean" ? moduleReady : moduleReady.value,
      ).update,
  ),
  delete: computed<boolean>(
    () =>
      buildPermissionGates(
        permissionCodes.value,
        actionCodes,
        typeof moduleReady === "boolean" ? moduleReady : moduleReady.value,
      ).delete,
  ),
})

export type SupportedLocale = "zh-CN" | "en-US"

export type VueLocaleMessages = Record<string, string>

export interface VueLocaleRuntime {
  locale: Ref<SupportedLocale>
  fallbackLocale: SupportedLocale
  messages: Record<SupportedLocale, VueLocaleMessages>
  setLocale: (nextLocale: SupportedLocale) => void
  t: (key: string, params?: Record<string, string | number | boolean>) => string
}

const VUE_LOCALE_RUNTIME_KEY: InjectionKey<VueLocaleRuntime> = Symbol(
  "elysian-vue-locale-runtime",
)

const interpolateMessage = (
  template: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (!params) {
    return template
  }

  return Object.entries(params).reduce(
    (message, [paramKey, value]) =>
      message.replaceAll(`{${paramKey}}`, String(value)),
    template,
  )
}

export const createVueLocaleRuntime = (options: {
  defaultLocale: SupportedLocale
  fallbackLocale?: SupportedLocale
  messages: Record<SupportedLocale, VueLocaleMessages>
}): VueLocaleRuntime => {
  const locale = ref<SupportedLocale>(options.defaultLocale)
  const fallbackLocale: SupportedLocale = options.fallbackLocale ?? "en-US"

  return {
    locale,
    fallbackLocale,
    messages: options.messages,
    setLocale: (nextLocale: SupportedLocale) => {
      locale.value = nextLocale
    },
    t: (key: string, params?: Record<string, string | number | boolean>) => {
      const currentLocale = locale.value as SupportedLocale
      const localized =
        options.messages[currentLocale]?.[key] ??
        options.messages[fallbackLocale]?.[key] ??
        key

      return interpolateMessage(localized, params)
    },
  }
}

export const provideVueLocaleRuntime = (runtime: VueLocaleRuntime) => {
  provide(VUE_LOCALE_RUNTIME_KEY, runtime)
  return runtime
}

export const useVueLocaleRuntime = () => {
  const runtime = inject(VUE_LOCALE_RUNTIME_KEY, null)

  if (!runtime) {
    throw new Error("Vue locale runtime is not provided")
  }

  return runtime
}
