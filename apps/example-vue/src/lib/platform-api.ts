import type {
  NotificationRecord as SchemaNotificationRecord,
  TenantRecord as SchemaTenantRecord,
  TenantStatus,
  WorkflowDefinitionRecord,
} from "@elysian/schema"
import type { UiMenuItem } from "@elysian/ui-core"

export interface PlatformResponse {
  manifest: {
    name: string
    displayName: string
    version: string
    runtime: string
    status: string
  }
  capabilities: string[]
}

export interface SystemModulesResponse {
  env: string
  modules: string[]
}

export interface AuthIdentityResponse {
  user: {
    id: string
    username: string
    displayName: string
    isSuperAdmin: boolean
    tenantId: string
  }
  roles: string[]
  permissionCodes: string[]
  menus: UiMenuItem[]
}

export interface LoginResponse extends AuthIdentityResponse {
  accessToken: string
}

export interface AuthSessionSummary {
  id: string
  userAgent: string | null
  ip: string | null
  expiresAt: string
  lastUsedAt: string | null
  revokedAt: string | null
  replacedBySessionId: string | null
  createdAt: string
  updatedAt: string
  isCurrent: boolean
}

export interface AuthSessionsResponse {
  items: AuthSessionSummary[]
}

export interface CustomerRecord {
  id: string
  name: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface CustomersResponse {
  items: CustomerRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CustomerListQuery {
  q?: string
  status?: CustomerRecord["status"]
  page?: number
  pageSize?: number
  sortBy?: "createdAt" | "name"
  sortOrder?: "asc" | "desc"
}

export interface UserRecord {
  id: string
  username: string
  displayName: string
  email?: string
  phone?: string
  status: "active" | "disabled"
  isSuperAdmin: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UsersResponse {
  items: UserRecord[]
}

export interface CreateUserRequest {
  username: string
  displayName: string
  email?: string
  phone?: string
  password: string
  status?: UserRecord["status"]
  isSuperAdmin?: boolean
}

export interface UpdateUserRequest {
  username?: string
  displayName?: string
  email?: string
  phone?: string
  status?: UserRecord["status"]
  isSuperAdmin?: boolean
}

export interface RoleRecord {
  id: string
  code: string
  name: string
  description?: string
  status: "active" | "disabled"
  isSystem: boolean
  dataScope: 1 | 2 | 3 | 4 | 5
  createdAt: string
  updatedAt: string
}

export interface RoleDetailRecord extends RoleRecord {
  permissionCodes: string[]
  userIds: string[]
  deptIds: string[]
}

export interface RolesResponse {
  items: RoleRecord[]
}

export interface CreateRoleRequest {
  code: string
  name: string
  description?: string
  status?: RoleRecord["status"]
  isSystem?: boolean
  dataScope?: RoleRecord["dataScope"]
}

export interface UpdateRoleRequest {
  code?: string
  name?: string
  description?: string
  status?: RoleRecord["status"]
  isSystem?: boolean
  dataScope?: RoleRecord["dataScope"]
}

export interface DepartmentRecord {
  id: string
  parentId: string | null
  code: string
  name: string
  sort: number
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface DepartmentDetailRecord extends DepartmentRecord {
  userIds: string[]
}

export interface DepartmentsResponse {
  items: DepartmentRecord[]
}

export interface PostRecord {
  id: string
  code: string
  name: string
  sort: number
  status: "active" | "disabled"
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface PostsResponse {
  items: PostRecord[]
}

export interface CreatePostRequest {
  code: string
  name: string
  sort?: number
  status?: PostRecord["status"]
  remark?: string
}

export interface UpdatePostRequest {
  code?: string
  name?: string
  sort?: number
  status?: PostRecord["status"]
  remark?: string
}

export interface CreateDepartmentRequest {
  parentId?: string | null
  code: string
  name: string
  sort?: number
  status?: DepartmentRecord["status"]
}

export interface UpdateDepartmentRequest {
  parentId?: string | null
  code?: string
  name?: string
  sort?: number
  status?: DepartmentRecord["status"]
}

export interface MenuRecord {
  id: string
  parentId: string | null
  type: "directory" | "menu" | "button"
  code: string
  name: string
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  isVisible: boolean
  status: "active" | "disabled"
  permissionCode: string | null
  createdAt: string
  updatedAt: string
}

export interface MenuDetailRecord extends MenuRecord {
  roleIds: string[]
}

export interface MenusResponse {
  items: MenuRecord[]
}

export interface CreateMenuRequest {
  parentId?: string | null
  type: MenuRecord["type"]
  code: string
  name: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: MenuRecord["status"]
  permissionCode?: string | null
}

export interface UpdateMenuRequest {
  parentId?: string | null
  type?: MenuRecord["type"]
  code?: string
  name?: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: MenuRecord["status"]
  permissionCode?: string | null
}

export interface SettingRecord {
  id: string
  key: string
  value: string
  description?: string
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface SettingsResponse {
  items: SettingRecord[]
}

export interface CreateSettingRequest {
  key: string
  value: string
  description?: string
  status?: SettingRecord["status"]
}

export interface UpdateSettingRequest {
  key?: string
  value?: string
  description?: string
  status?: SettingRecord["status"]
}

export type TenantRecord = SchemaTenantRecord

export interface TenantsResponse {
  items: TenantRecord[]
}

export interface CreateTenantRequest {
  code: string
  name: string
  status?: TenantStatus
}

export interface UpdateTenantRequest {
  code?: string
  name?: string
  status?: TenantStatus
}

export interface OperationLogRecord {
  id: string
  category: string
  action: string
  actorUserId: string | null
  targetType: string | null
  targetId: string | null
  result: "success" | "failure"
  requestId: string | null
  ip: string | null
  userAgent: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

export interface OperationLogsResponse {
  items: OperationLogRecord[]
}

export interface OperationLogListQuery {
  category?: string
  action?: string
  actorUserId?: string
  result?: OperationLogRecord["result"]
}

export type NotificationRecord = SchemaNotificationRecord

export interface NotificationsResponse {
  items: NotificationRecord[]
}

export interface NotificationListQuery {
  recipientUserId?: string
  status?: NotificationRecord["status"]
}

export interface CreateNotificationRequest {
  recipientUserId: string
  title: string
  content: string
  level?: NotificationRecord["level"]
}

export interface FileRecord {
  id: string
  originalName: string
  mimeType?: string
  size: number
  uploaderUserId?: string
  createdAt: string
}

export interface FilesResponse {
  items: FileRecord[]
}

export interface DictionaryTypeRecord {
  id: string
  code: string
  name: string
  description?: string
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface DictionaryItemRecord {
  id: string
  typeId: string
  value: string
  label: string
  sort: number
  isDefault: boolean
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface DictionaryTypeDetailRecord extends DictionaryTypeRecord {
  items: DictionaryItemRecord[]
}

export interface DictionaryTypesResponse {
  items: DictionaryTypeRecord[]
}

export interface DictionaryItemsResponse {
  items: DictionaryItemRecord[]
}

export interface CreateDictionaryTypeRequest {
  code: string
  name: string
  description?: string
  status?: DictionaryTypeRecord["status"]
}

export interface UpdateDictionaryTypeRequest {
  code?: string
  name?: string
  description?: string
  status?: DictionaryTypeRecord["status"]
}

export interface WorkflowDefinitionsResponse {
  items: WorkflowDefinitionRecord[]
}

export type GeneratorPreviewConflictStrategy =
  | "skip"
  | "overwrite"
  | "overwrite-generated-only"
  | "fail"

export type GeneratorPreviewPlannedAction =
  | "create"
  | "overwrite"
  | "skip"
  | "block"

export interface GeneratorPreviewDiffSummary {
  totalFileCount: number
  changedFileCount: number
  unchangedFileCount: number
  actionCounts: {
    create: number
    overwrite: number
    skip: number
    block: number
  }
}

export interface GeneratorPreviewApplyEvidence {
  sessionId: string
  reportPath: string
  manifestPath: string | null
  appliedAt: string | null
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  requestId: string | null
}

export interface GeneratorPreviewReportFile {
  absolutePath: string
  contents: string
  currentContents: string | null
  exists: boolean
  hasChanges: boolean
  isManaged: boolean | null
  mergeStrategy: string
  path: string
  plannedAction: GeneratorPreviewPlannedAction
  plannedReason: string
  reason: string
}

export interface GeneratorPreviewSqlPreview {
  tableName: string
  contents: string
}

export interface GeneratorPreviewReport {
  conflictStrategy: GeneratorPreviewConflictStrategy
  databaseChangePlan: {
    operations: Array<Record<string, unknown>>
  }
  files: GeneratorPreviewReportFile[]
  frontendTarget: "vue" | "react"
  generatedAt: string
  outputDir: string
  schemaName: string
  sqlPreview: GeneratorPreviewSqlPreview
  targetPreset: "staging" | "custom"
}

export interface GeneratorPreviewSessionRecord {
  id: string
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  appliedAt: string | null
  appliedFileCount: number | null
  appliedByDisplayName: string | null
  appliedByUserId: string | null
  appliedByUsername: string | null
  applyManifestPath: string | null
  applyRequestId: string | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  conflictStrategy: GeneratorPreviewConflictStrategy
  createdAt: string
  frontendTarget: "vue" | "react"
  hasBlockingConflicts: boolean
  outputDir: string
  previewFileCount: number
  reportPath: string
  schemaName: string
  skippedFileCount: number | null
  sourceType: "registered-schema"
  sourceValue: string
  status: "ready" | "applied"
  targetPreset: "staging"
  tenantId: string | null
}

export interface GeneratorPreviewSessionDetail
  extends GeneratorPreviewSessionRecord {
  diffSummary: GeneratorPreviewDiffSummary
  report: GeneratorPreviewReport
}

export interface GeneratorPreviewSessionsResponse {
  items: GeneratorPreviewSessionRecord[]
}

export interface CreateGeneratorPreviewSessionRequest {
  schemaName: string
  frontendTarget?: "vue" | "react"
  conflictStrategy?: GeneratorPreviewConflictStrategy
  targetPreset?: "staging"
}

export interface CreateGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  diff: GeneratorPreviewDiffSummary
  report: GeneratorPreviewReport
}

export interface AppliedGeneratorPreviewFile {
  absolutePath: string
  mergeStrategy: string
  path: string
  reason: string
  written: boolean
}

export interface ApplyGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  diff: GeneratorPreviewDiffSummary
  apply: {
    files: AppliedGeneratorPreviewFile[]
    evidence: GeneratorPreviewApplyEvidence | null
    manifestPath: string | null
  }
}

interface ExampleApiOverrides {
  workflowDefinitions?: WorkflowDefinitionRecord[]
}

type MultipartRequestBody = FormData

interface RequestJsonOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  bodyType?: "json" | "form-data"
  auth?: boolean
  credentials?: "omit" | "same-origin" | "include"
}

declare global {
  var __ELYSIAN_EXAMPLE_API_OVERRIDES__: ExampleApiOverrides | undefined
}

const SERVER_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000"

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const clearAccessToken = () => {
  accessToken = null
}

const requestJson = async <T>(
  path: string,
  options: RequestJsonOptions = {},
  allowAuthRetry = true,
): Promise<T> => {
  const headers = new Headers()

  if (options.body !== undefined && options.bodyType !== "form-data") {
    headers.set("content-type", "application/json")
  }

  if (options.auth && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`)
  }

  const response = await fetch(`${SERVER_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body:
      options.bodyType === "form-data"
        ? (options.body as MultipartRequestBody)
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    credentials: options.credentials,
  })

  if (
    response.status === 401 &&
    options.auth &&
    allowAuthRetry &&
    !path.startsWith("/auth/")
  ) {
    const restored = await tryRefreshAccessToken()

    if (restored) {
      return requestJson<T>(path, options, false)
    }
  }

  if (!response.ok) {
    throw await toRequestError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

const requestBlob = async (
  path: string,
  options: Omit<RequestJsonOptions, "body" | "bodyType"> = {},
  allowAuthRetry = true,
): Promise<Blob> => {
  const headers = new Headers()

  if (options.auth && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`)
  }

  const response = await fetch(`${SERVER_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: options.credentials,
  })

  if (
    response.status === 401 &&
    options.auth &&
    allowAuthRetry &&
    !path.startsWith("/auth/")
  ) {
    const restored = await tryRefreshAccessToken()

    if (restored) {
      return requestBlob(path, options, false)
    }
  }

  if (!response.ok) {
    throw await toRequestError(response)
  }

  return response.blob()
}

const tryRefreshAccessToken = async () => {
  try {
    const payload = await requestJson<LoginResponse>(
      "/auth/refresh",
      {
        method: "POST",
        credentials: "include",
      },
      false,
    )
    setAccessToken(payload.accessToken)
    return true
  } catch {
    clearAccessToken()
    return false
  }
}

const toRequestError = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      error?: {
        code?: string
        message?: string
        status?: number
      }
    }
    const code = payload.error?.code
    const message =
      payload.error?.message ?? `Request failed with status ${response.status}`

    return new Error(code ? `${message} [${code}]` : message)
  } catch {
    return new Error(`Request failed with status ${response.status}`)
  }
}

export const fetchPlatform = () => requestJson<PlatformResponse>("/platform")

export const fetchSystemModules = () =>
  requestJson<SystemModulesResponse>("/system/modules")

export const login = async (input: {
  username: string
  password: string
  tenantCode?: string
}): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  // Strip the internal accessToken field to expose the canonical identity shape.
  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const refreshAuth = async (): Promise<AuthIdentityResponse> => {
  const payload = await requestJson<LoginResponse>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  })

  setAccessToken(payload.accessToken)

  const { accessToken: _ignored, ...identity } = payload
  return identity
}

export const fetchMe = () =>
  requestJson<AuthIdentityResponse>("/auth/me", {
    auth: true,
  })

export const logout = async (): Promise<void> => {
  await requestJson<void>("/auth/logout", {
    method: "POST",
    credentials: "include",
  })
  clearAccessToken()
}

export const fetchAuthSessions = () =>
  requestJson<AuthSessionsResponse>("/auth/sessions", {
    auth: true,
  })

export const revokeAuthSession = async (sessionId: string): Promise<void> => {
  await requestJson<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    auth: true,
    credentials: "include",
  })
}

export const fetchCustomers = async (
  query: CustomerListQuery = {},
): Promise<CustomersResponse> => {
  const search = new URLSearchParams()

  if (query.q?.trim()) {
    search.set("q", query.q.trim())
  }

  if (query.status) {
    search.set("status", query.status)
  }

  if (typeof query.page === "number") {
    search.set("page", String(query.page))
  }

  if (typeof query.pageSize === "number") {
    search.set("pageSize", String(query.pageSize))
  }

  if (query.sortBy) {
    search.set("sortBy", query.sortBy)
  }

  if (query.sortOrder) {
    search.set("sortOrder", query.sortOrder)
  }

  return requestJson<CustomersResponse>(
    `/customers${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchUsers = async (): Promise<UsersResponse> =>
  requestJson<UsersResponse>("/system/users", {
    auth: true,
  })

export const createUser = async (
  input: CreateUserRequest,
): Promise<UserRecord> =>
  requestJson<UserRecord>("/system/users", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateUser = async (
  id: string,
  input: UpdateUserRequest,
): Promise<UserRecord> =>
  requestJson<UserRecord>(`/system/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const resetUserPassword = async (
  id: string,
  password: string,
): Promise<void> =>
  requestJson<void>(`/system/users/${encodeURIComponent(id)}/reset-password`, {
    method: "POST",
    body: { password },
    auth: true,
  })

export const fetchRoles = async (): Promise<RolesResponse> =>
  requestJson<RolesResponse>("/system/roles", {
    auth: true,
  })

export const fetchRoleById = async (id: string): Promise<RoleDetailRecord> =>
  requestJson<RoleDetailRecord>(`/system/roles/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createRole = async (
  input: CreateRoleRequest,
): Promise<RoleDetailRecord> =>
  requestJson<RoleDetailRecord>("/system/roles", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateRole = async (
  id: string,
  input: UpdateRoleRequest,
): Promise<RoleDetailRecord> =>
  requestJson<RoleDetailRecord>(`/system/roles/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const fetchDepartments = async (): Promise<DepartmentsResponse> =>
  requestJson<DepartmentsResponse>("/system/departments", {
    auth: true,
  })

export const fetchPosts = async (): Promise<PostsResponse> =>
  requestJson<PostsResponse>("/system/posts", {
    auth: true,
  })

export const fetchPostById = async (id: string): Promise<PostRecord> =>
  requestJson<PostRecord>(`/system/posts/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createPost = async (input: CreatePostRequest): Promise<PostRecord> =>
  requestJson<PostRecord>("/system/posts", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updatePost = async (
  id: string,
  input: UpdatePostRequest,
): Promise<PostRecord> =>
  requestJson<PostRecord>(`/system/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const fetchDepartmentById = async (
  id: string,
): Promise<DepartmentDetailRecord> =>
  requestJson<DepartmentDetailRecord>(
    `/system/departments/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createDepartment = async (
  input: CreateDepartmentRequest,
): Promise<DepartmentDetailRecord> =>
  requestJson<DepartmentDetailRecord>("/system/departments", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateDepartment = async (
  id: string,
  input: UpdateDepartmentRequest,
): Promise<DepartmentDetailRecord> =>
  requestJson<DepartmentDetailRecord>(
    `/system/departments/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: input,
      auth: true,
    },
  )

export const fetchMenus = async (): Promise<MenusResponse> =>
  requestJson<MenusResponse>("/system/menus", {
    auth: true,
  })

export const fetchMenuById = async (id: string): Promise<MenuDetailRecord> =>
  requestJson<MenuDetailRecord>(`/system/menus/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createMenu = async (
  input: CreateMenuRequest,
): Promise<MenuDetailRecord> =>
  requestJson<MenuDetailRecord>("/system/menus", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateMenu = async (
  id: string,
  input: UpdateMenuRequest,
): Promise<MenuDetailRecord> =>
  requestJson<MenuDetailRecord>(`/system/menus/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const fetchSettings = async (): Promise<SettingsResponse> =>
  requestJson<SettingsResponse>("/system/settings", {
    auth: true,
  })

export const fetchSettingById = async (id: string): Promise<SettingRecord> =>
  requestJson<SettingRecord>(`/system/settings/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createSetting = async (
  input: CreateSettingRequest,
): Promise<SettingRecord> =>
  requestJson<SettingRecord>("/system/settings", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateSetting = async (
  id: string,
  input: UpdateSettingRequest,
): Promise<SettingRecord> =>
  requestJson<SettingRecord>(`/system/settings/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const fetchTenants = async (): Promise<TenantsResponse> =>
  requestJson<TenantsResponse>("/system/tenants", {
    auth: true,
  })

export const fetchTenantById = async (id: string): Promise<TenantRecord> =>
  requestJson<TenantRecord>(`/system/tenants/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createTenant = async (
  input: CreateTenantRequest,
): Promise<TenantRecord> =>
  requestJson<TenantRecord>("/system/tenants", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateTenant = async (
  id: string,
  input: UpdateTenantRequest,
): Promise<TenantRecord> =>
  requestJson<TenantRecord>(`/system/tenants/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const updateTenantStatus = async (
  id: string,
  status: TenantStatus,
): Promise<TenantRecord> =>
  requestJson<TenantRecord>(
    `/system/tenants/${encodeURIComponent(id)}/status`,
    {
      method: "PUT",
      body: { status },
      auth: true,
    },
  )

export const fetchOperationLogs = async (
  query: OperationLogListQuery = {},
): Promise<OperationLogsResponse> => {
  const search = new URLSearchParams()

  if (query.category?.trim()) {
    search.set("category", query.category.trim())
  }

  if (query.action?.trim()) {
    search.set("action", query.action.trim())
  }

  if (query.actorUserId?.trim()) {
    search.set("actorUserId", query.actorUserId.trim())
  }

  if (query.result) {
    search.set("result", query.result)
  }

  return requestJson<OperationLogsResponse>(
    `/system/operation-logs${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchOperationLogById = async (
  id: string,
): Promise<OperationLogRecord> =>
  requestJson<OperationLogRecord>(
    `/system/operation-logs/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const fetchNotifications = async (
  query: NotificationListQuery = {},
): Promise<NotificationsResponse> => {
  const search = new URLSearchParams()

  if (query.recipientUserId?.trim()) {
    search.set("recipientUserId", query.recipientUserId.trim())
  }

  if (query.status) {
    search.set("status", query.status)
  }

  return requestJson<NotificationsResponse>(
    `/system/notifications${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchNotificationById = async (
  id: string,
): Promise<NotificationRecord> =>
  requestJson<NotificationRecord>(
    `/system/notifications/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createNotification = async (
  input: CreateNotificationRequest,
): Promise<NotificationRecord> =>
  requestJson<NotificationRecord>("/system/notifications", {
    method: "POST",
    body: input,
    auth: true,
  })

export const markNotificationAsRead = async (
  id: string,
): Promise<NotificationRecord> =>
  requestJson<NotificationRecord>(
    `/system/notifications/${encodeURIComponent(id)}/read`,
    {
      method: "POST",
      auth: true,
    },
  )

export const fetchFiles = async (): Promise<FilesResponse> =>
  requestJson<FilesResponse>("/system/files", {
    auth: true,
  })

export const fetchFileById = async (id: string): Promise<FileRecord> =>
  requestJson<FileRecord>(`/system/files/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const uploadFile = async (file: File): Promise<FileRecord> => {
  const formData = new FormData()
  formData.set("file", file, file.name)

  return requestJson<FileRecord>("/system/files", {
    method: "POST",
    body: formData,
    bodyType: "form-data",
    auth: true,
  })
}

export const downloadFileBlob = async (id: string): Promise<Blob> =>
  requestBlob(`/system/files/${encodeURIComponent(id)}/download`, {
    auth: true,
  })

export const listGeneratorPreviewSessions =
  async (): Promise<GeneratorPreviewSessionsResponse> =>
    requestJson<GeneratorPreviewSessionsResponse>("/studio/generator/sessions", {
      auth: true,
    })

export const fetchGeneratorPreviewSession = async (
  id: string,
): Promise<GeneratorPreviewSessionDetail> =>
  requestJson<GeneratorPreviewSessionDetail>(
    `/studio/generator/sessions/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createGeneratorPreviewSession = async (
  input: CreateGeneratorPreviewSessionRequest,
): Promise<CreateGeneratorPreviewSessionResponse> =>
  requestJson<CreateGeneratorPreviewSessionResponse>(
    "/studio/generator/sessions/preview",
    {
      method: "POST",
      body: input,
      auth: true,
    },
  )

export const applyGeneratorPreviewSession = async (
  id: string,
): Promise<ApplyGeneratorPreviewSessionResponse> =>
  requestJson<ApplyGeneratorPreviewSessionResponse>(
    `/studio/generator/sessions/${encodeURIComponent(id)}/apply`,
    {
      method: "POST",
      auth: true,
    },
  )

export const deleteFile = async (id: string): Promise<void> =>
  requestJson<void>(`/system/files/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  })

export const fetchDictionaryTypes =
  async (): Promise<DictionaryTypesResponse> =>
    requestJson<DictionaryTypesResponse>("/system/dictionaries/types", {
      auth: true,
    })

export const fetchDictionaryTypeById = async (
  id: string,
): Promise<DictionaryTypeDetailRecord> =>
  requestJson<DictionaryTypeDetailRecord>(
    `/system/dictionaries/types/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createDictionaryType = async (
  input: CreateDictionaryTypeRequest,
): Promise<DictionaryTypeDetailRecord> =>
  requestJson<DictionaryTypeDetailRecord>("/system/dictionaries/types", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateDictionaryType = async (
  id: string,
  input: UpdateDictionaryTypeRequest,
): Promise<DictionaryTypeDetailRecord> =>
  requestJson<DictionaryTypeDetailRecord>(
    `/system/dictionaries/types/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: input,
      auth: true,
    },
  )

export const fetchDictionaryItems = async (
  typeId?: string,
): Promise<DictionaryItemsResponse> =>
  requestJson<DictionaryItemsResponse>(
    typeId
      ? `/system/dictionaries/items?typeId=${encodeURIComponent(typeId)}`
      : "/system/dictionaries/items",
    {
      auth: true,
    },
  )

const readWorkflowDefinitionOverrides = () => {
  return (
    globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__?.workflowDefinitions ?? null
  )
}

export const fetchWorkflowDefinitions =
  async (): Promise<WorkflowDefinitionsResponse> => {
    const overrides = readWorkflowDefinitionOverrides()

    if (overrides) {
      return {
        items: overrides,
      }
    }

    return requestJson<WorkflowDefinitionsResponse>("/workflow/definitions", {
      auth: true,
    })
  }

export const fetchWorkflowDefinitionById = async (id: string) => {
  const overrides = readWorkflowDefinitionOverrides()

  if (overrides) {
    const definition = overrides.find(
      (item: WorkflowDefinitionRecord) => item.id === id,
    )

    if (definition) {
      return definition
    }
  }

  return requestJson<WorkflowDefinitionRecord>(`/workflow/definitions/${id}`, {
    auth: true,
  })
}

export const createCustomer = (input: {
  name: string
  status: "active" | "inactive"
}) =>
  requestJson<CustomerRecord>("/customers", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateCustomer = (
  id: string,
  input: { name?: string; status?: "active" | "inactive" },
) =>
  requestJson<CustomerRecord>(`/customers/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  })

export const deleteCustomer = (id: string) =>
  requestJson<void>(`/customers/${id}`, {
    method: "DELETE",
    auth: true,
  })
