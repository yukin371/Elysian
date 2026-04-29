import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSWorkflowLocaleMessages: VueLocaleMessages = {
  "app.workflow.sectionTitle": "Workflow definitions workspace",
  "app.workflow.sectionCopy":
    "This is the first real workflow surface instead of another placeholder. Scope stays tight: definitions list plus detail only.",
  "app.workflow.shellDescription":
    "The workspace reads real workflow definition APIs to prove a minimum multi-module page loop.",
  "app.message.customerModuleOffline":
    "`customer` module is not registered yet. Add `DATABASE_URL`, run migrations and seed, then restart the server.",
  "app.message.signInToLoad":
    "Sign in from the side panel to load protected customer data.",
  "app.message.workspaceNoListPermission":
    "This identity can enter the workspace but does not have `customer:customer:list`.",
  "app.message.departmentModuleOffline":
    "`department` is not registered on this server yet. Enable the system-department module and try again.",
  "app.message.departmentSignInToLoad":
    "Sign in first to load protected department data.",
  "app.message.departmentNoListPermission":
    "This identity can enter the workspace but does not have `system:department:list`.",
  "app.message.postModuleOffline":
    "`post` is not registered on this server yet. Enable the system-post module and try again.",
  "app.message.postSignInToLoad": "Sign in first to load protected post data.",
  "app.message.postNoListPermission":
    "This identity can enter the workspace but does not have `system:post:list`.",
  "app.message.onlineSessionModuleOffline":
    "`auth` is not registered on this server yet. Enable the auth module and try again.",
  "app.message.onlineSessionSignInToLoad":
    "Sign in first to load the current user's online sessions.",
  "app.message.onlineSessionNoAccess":
    "The online-sessions workspace needs a live signed-in session.",
  "app.message.menuModuleOffline":
    "`menu` is not registered on this server yet. Enable the system-menu module and try again.",
  "app.message.menuSignInToLoad": "Sign in first to load protected menu data.",
  "app.message.menuNoListPermission":
    "This identity can enter the workspace but does not have `system:menu:list`.",
  "app.message.roleModuleOffline":
    "`role` is not registered on this server yet. Enable the system-role module and try again.",
  "app.message.roleSignInToLoad": "Sign in first to load protected role data.",
  "app.message.roleNoListPermission":
    "This identity can enter the workspace but does not have `system:role:list`.",
  "app.message.settingModuleOffline":
    "`setting` is not registered on this server yet. Enable the system-setting module and try again.",
  "app.message.settingSignInToLoad":
    "Sign in first to load protected setting data.",
  "app.message.settingNoListPermission":
    "This identity can enter the workspace but does not have `system:setting:list`.",
  "app.message.tenantModuleOffline":
    "`tenant` is not registered on this server yet. Enable the system-tenant module and try again.",
  "app.message.tenantSignInToLoad":
    "Sign in first to load protected tenant data.",
  "app.message.tenantNoListPermission":
    "This identity can enter the workspace but does not have `system:tenant:list`.",
  "app.message.tenantSuperAdminRequired":
    "Tenant management stays restricted to super-admin users. The example app does not fake an interactive state for regular admins.",
  "app.message.dictionaryModuleOffline":
    "`dictionary` is not registered on this server yet. Enable the system-dictionary module and try again.",
  "app.message.dictionarySignInToLoad":
    "Sign in first to load protected dictionary data.",
  "app.message.dictionaryNoListPermission":
    "This identity can enter the workspace but does not have `system:dictionary:list`.",
  "app.message.operationLogModuleOffline":
    "`operation-log` is not registered on this server yet. Enable the system-operation-log module and try again.",
  "app.message.operationLogSignInToLoad":
    "Sign in first to load protected operation log data.",
  "app.message.operationLogNoListPermission":
    "This identity can enter the workspace but does not have `system:operation-log:list`.",
  "app.message.userModuleOffline":
    "`user` is not registered on this server yet. Enable the system-user module and try again.",
  "app.message.userSignInToLoad": "Sign in first to load protected user data.",
  "app.message.userNoListPermission":
    "This identity can enter the workspace but does not have `system:user:list`.",
  "app.message.workflowModuleOffline":
    "`workflow` is not registered on this server yet, so the definitions workspace stays unavailable.",
  "app.message.workflowSignInToLoad":
    "Sign in first to load protected workflow definition data.",
  "app.message.workflowNoListPermission":
    "This identity can enter the workspace but does not have `workflow:definition:list`.",
  "app.workflow.loading": "Loading workflow definitions...",
  "app.workflow.empty": "No workflow definitions exist for the current tenant.",
  "app.workflow.listEyebrow": "Real module workspace",
  "app.workflow.listTitle": "Workflow definitions",
  "app.workflow.listDescription":
    "The main area owns the definitions list only. Clicking a row refreshes the detail panel instead of duplicating the same content.",
  "app.workflow.filter.searchLabel": "Search definitions",
  "app.workflow.filter.searchPlaceholder": "Search by name, key, or id",
  "app.workflow.filter.statusTitle": "Status filter",
  "app.workflow.filter.all": "All",
  "app.workflow.filter.active": "Active",
  "app.workflow.filter.disabled": "Disabled",
  "app.workflow.filter.reset": "Clear filters",
  "app.workflow.filter.none": "No active filters",
  "app.workflow.filter.querySummary": "Query: {value}",
  "app.workflow.filter.statusSummary": "Status: {value}",
  "app.workflow.detailEyebrow": "Definition detail",
  "app.workflow.detailDescription":
    "The side panel stays focused on structure, status, and version metadata for the selected definition.",
  "app.workflow.detailEmpty":
    "Select a workflow definition to inspect its structure.",
  "app.workflow.detailEmptyTitle": "No definition selected",
  "app.workflow.detailLoading": "Refreshing workflow definition detail...",
  "app.workflow.emptyFiltered":
    "No workflow definitions match the current filters.",
  "app.workflow.meta.status": "Status",
  "app.workflow.meta.key": "Key",
  "app.workflow.meta.version": "Version",
  "app.workflow.meta.structure": "Structure",
  "app.workflow.meta.updatedAt": "Updated at",
  "app.workflow.meta.nodes": "nodes",
  "app.workflow.meta.edges": "edges",
  "app.workflow.versionHistoryTitle": "Version history",
  "app.workflow.nodeFlowTitle": "Node flow",
  "app.workflow.status.active": "Active",
  "app.workflow.status.disabled": "Disabled",
  "app.workflow.nodeType.start": "Start",
  "app.workflow.nodeType.approval": "Approval",
  "app.workflow.nodeType.condition": "Condition",
  "app.workflow.nodeType.end": "End",
  "app.workflow.node.assignee": "Assignee",
  "app.workflow.node.conditions": "{count} condition branches",
  "app.workflow.statsHint": "Current workflow definition rows",
  "app.workflow.tabsHint": "{count} workflow definitions",
  "app.generatorPreview.sectionTitle": "Generator preview workspace",
  "app.generatorPreview.sectionCopy":
    "This surface consumes the pure generator renderer to preview file artifacts, source output, and a SQL draft without writing into the target directory.",
  "app.generatorPreview.shellTitle": "Generator preview workspace",
  "app.generatorPreview.shellDescription":
    "The example app now assembles server-backed preview sessions, diff summaries, and staging apply evidence without owning generator runtime behavior.",
  "app.generatorPreview.workspaceEyebrow": "Preview session",
  "app.generatorPreview.workspaceTitle": "Generator artifact list",
  "app.generatorPreview.workspaceDescription":
    "Pick a schema and frontend target on the left, review the preview session plan and diff summary in the main area, and inspect file/session details plus SQL preview on the right.",
  "app.generatorPreview.message.localOnly":
    "This workspace is preview-only. It does not write to the generation directory and does not replace the CLI apply or preview reports.",
  "app.generatorPreview.message.runtimeBacked":
    "This workspace is driven by server preview sessions, so the file plan, conflict status, and apply evidence all come from backend preview reports.",
  "app.generatorPreview.message.blockingConflicts":
    "This preview contains blocking conflicts. Resolve them before running a staging apply.",
  "app.generatorPreview.message.applied":
    "This preview has already been applied to staging at {value}.",
  "app.generatorPreview.filter.schemaLabel": "Module schema",
  "app.generatorPreview.filter.frontendLabel": "Frontend target",
  "app.generatorPreview.filter.searchLabel": "Search artifacts",
  "app.generatorPreview.filter.searchPlaceholder":
    "Search by file path, reason, or contents",
  "app.generatorPreview.filter.reset": "Clear filters",
  "app.generatorPreview.filter.schemaSummary": "Schema: {value}",
  "app.generatorPreview.filter.frontendSummary": "Frontend: {value}",
  "app.generatorPreview.filter.querySummary": "Query: {value}",
  "app.generatorPreview.detailEyebrow": "Preview detail",
  "app.generatorPreview.detailDescription":
    "The side panel stays focused on the selected file, preview session metadata, and SQL preview instead of duplicating the file list.",
  "app.generatorPreview.detailEmptyTitle": "No generated file selected",
  "app.generatorPreview.detailEmptyDescription":
    "Pick an artifact from the list to inspect source, session details, and SQL preview.",
  "app.generatorPreview.emptyFiltered":
    "No generated files match the current filter.",
  "app.generatorPreview.loading": "Generating the latest preview session.",
  "app.generatorPreview.action.refresh": "Refresh preview",
  "app.generatorPreview.action.refreshing": "Refreshing",
  "app.generatorPreview.action.apply": "Apply to staging",
  "app.generatorPreview.action.applying": "Applying",
  "app.generatorPreview.status.ready": "Ready",
  "app.generatorPreview.status.applied": "Applied",
  "app.generatorPreview.summary.changed": "Changed files",
  "app.generatorPreview.summary.create": "Create",
  "app.generatorPreview.summary.overwrite": "Overwrite",
  "app.generatorPreview.summary.skip": "Skip",
  "app.generatorPreview.summary.block": "Block",
  "app.generatorPreview.actionLabel.create": "Create",
  "app.generatorPreview.actionLabel.overwrite": "Overwrite",
  "app.generatorPreview.actionLabel.skip": "Skip",
  "app.generatorPreview.actionLabel.block": "Block",
  "app.generatorPreview.sessionTitle": "Preview session",
  "app.generatorPreview.diffTitle": "Diff summary",
  "app.generatorPreview.applyTitle": "Apply evidence",
  "app.generatorPreview.sourceTitle": "Generated source",
  "app.generatorPreview.currentSourceTitle": "Current target contents",
  "app.generatorPreview.sqlTitle": "SQL preview",
  "app.generatorPreview.meta.schemaName": "Schema",
  "app.generatorPreview.meta.frontendTarget": "Frontend target",
  "app.generatorPreview.meta.status": "Session status",
  "app.generatorPreview.meta.mergeStrategy": "Merge strategy",
  "app.generatorPreview.meta.fileAction": "Planned action",
  "app.generatorPreview.meta.changed": "Has changes",
  "app.generatorPreview.meta.changedYes": "Yes",
  "app.generatorPreview.meta.changedNo": "No",
  "app.generatorPreview.meta.lines": "lines",
  "app.generatorPreview.meta.sessionId": "Session ID",
  "app.generatorPreview.meta.reportPath": "Preview report path",
  "app.generatorPreview.meta.outputDir": "Output directory",
  "app.generatorPreview.meta.appliedAt": "Applied at",
  "app.generatorPreview.meta.manifestPath": "Manifest path",
  "app.generatorPreview.meta.requestId": "Request ID",
  "app.generatorPreview.statsHint": "Preview files currently in scope",
  "app.generatorPreview.tabsHint": "{count} preview artifacts",
  "app.error.restoreSession": "Failed to restore session",
  "app.error.loadCustomers": "Failed to load customers",
  "app.error.loadDepartments": "Failed to load departments",
  "app.error.loadDepartmentDetail": "Failed to load department detail",
  "app.error.loadMenus": "Failed to load menus",
  "app.error.loadMenuDetail": "Failed to load menu detail",
  "app.error.loadRoles": "Failed to load roles",
  "app.error.loadRoleDetail": "Failed to load role detail",
  "app.error.loadSettings": "Failed to load settings",
  "app.error.loadSettingDetail": "Failed to load setting detail",
  "app.error.loadTenants": "Failed to load tenants",
  "app.error.loadTenantDetail": "Failed to load tenant detail",
  "app.error.loadDictionaries": "Failed to load dictionary types",
  "app.error.loadDictionaryDetail": "Failed to load dictionary detail",
  "app.error.loadOperationLogs": "Failed to load operation logs",
  "app.error.loadOperationLogDetail": "Failed to load operation log detail",
  "app.error.loadUsers": "Failed to load users",
  "app.error.signIn": "Failed to sign in",
  "app.error.signOut": "Failed to sign out",
  "app.error.createCustomer": "Failed to create customer",
  "app.error.createDepartment": "Failed to create department",
  "app.error.createMenu": "Failed to create menu",
  "app.error.createRole": "Failed to create role",
  "app.error.createSetting": "Failed to create setting",
  "app.error.createTenant": "Failed to create tenant",
  "app.error.createDictionary": "Failed to create dictionary type",
  "app.error.createUser": "Failed to create user",
  "app.error.updateCustomer": "Failed to update customer",
  "app.error.updateDepartment": "Failed to update department",
  "app.error.updateMenu": "Failed to update menu",
  "app.error.updateRole": "Failed to update role",
  "app.error.updateSetting": "Failed to update setting",
  "app.error.updateTenant": "Failed to update tenant",
  "app.error.updateTenantStatus": "Failed to update tenant status",
  "app.error.updateDictionary": "Failed to update dictionary type",
  "app.error.updateUser": "Failed to update user",
  "app.error.deleteCustomer": "Failed to delete customer",
  "app.error.resetUserPassword": "Failed to reset user password",
  "app.error.loadWorkflowDefinitions": "Failed to load workflow definitions",
  "app.error.loadPlatform": "Failed to load platform view",
  "app.error.customerNameRequired": "Customer name is required",
  "app.error.departmentCodeRequired": "Department code is required",
  "app.error.departmentNameRequired": "Department name is required",
  "app.error.menuCodeRequired": "Menu code is required",
  "app.error.menuNameRequired": "Menu name is required",
  "app.error.roleCodeRequired": "Role code is required",
  "app.error.roleNameRequired": "Role name is required",
  "app.error.settingKeyRequired": "Setting key is required",
  "app.error.settingValueRequired": "Setting value is required",
  "app.error.tenantCodeRequired": "Tenant code is required",
  "app.error.tenantNameRequired": "Tenant name is required",
  "app.error.dictionaryCodeRequired": "Dictionary code is required",
  "app.error.dictionaryNameRequired": "Dictionary name is required",
  "app.error.userUsernameRequired": "Username is required",
  "app.error.userDisplayNameRequired": "Display name is required",
  "app.error.userPasswordRequired": "Password is required",
  "app.message.notificationModuleOffline":
    "`notification` is not registered on this server yet. Enable the system-notification module and try again.",
  "app.message.notificationSignInToLoad":
    "Sign in first to load protected notification data.",
  "app.message.notificationNoListPermission":
    "This identity can enter the workspace but does not have `system:notification:list`.",
  "app.error.loadNotifications": "Failed to load notifications",
  "app.error.loadNotificationDetail": "Failed to load notification detail",
  "app.error.createNotification": "Failed to create notification",
  "app.error.markNotificationRead": "Failed to mark notification as read",
  "app.error.notificationRecipientRequired": "Recipient user is required",
  "app.error.notificationTitleRequired": "Notification title is required",
  "app.error.notificationContentRequired": "Notification content is required",
  "app.message.fileModuleOffline":
    "`file` is not registered on this server yet. Enable the system-file module and try again.",
  "app.message.fileSignInToLoad": "Sign in first to load protected file data.",
  "app.message.fileNoListPermission":
    "This identity does not have `system:file:list`; if upload permission is still available, use the side-panel upload flow.",
  "app.error.loadFiles": "Failed to load files",
  "app.error.loadFileDetail": "Failed to load file detail",
  "app.error.uploadFile": "Failed to upload file",
  "app.error.downloadFile": "Failed to download file",
  "app.error.deleteFile": "Failed to delete file",
  "app.error.fileRequired": "Choose a file before uploading",
  "app.error.loadPosts": "Failed to load posts",
  "app.error.loadPostDetail": "Failed to load post detail",
  "app.error.createPost": "Failed to create post",
  "app.error.updatePost": "Failed to update post",
  "app.error.loadOnlineSessions": "Failed to load online sessions",
  "app.error.revokeOnlineSession": "Failed to revoke the selected session",
  "app.error.postCodeRequired": "Post code is required",
  "app.error.postNameRequired": "Post name is required",
}
