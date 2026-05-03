import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSOperationLogLocaleMessages: VueLocaleMessages = {
  "app.operationLog.sectionTitle": "Operation logs workspace",
  "app.operationLog.sectionCopy":
    "The operation-log page stays focused on real query, list, and detail flows instead of expanding into an export center, audit analytics, or a second reporting surface.",
  "app.operationLog.shellTitle": "Operation logs workspace",
  "app.operationLog.shellDescription":
    "The workspace consumes the real system-operation-log API for query, list, and detail views, and stays read-only in this round.",
  "app.operationLog.workspaceEyebrow": "Real module workspace",
  "app.operationLog.workspaceTitle": "System operation logs",
  "app.operationLog.workspaceDescription":
    "The main area owns the real query bar and log list, while the side panel stays focused on the selected audit detail.",
  "app.operationLog.emptyTitle": "No operation logs match the current filters",
  "app.operationLog.emptyDescription":
    "Clear the filters or adjust the search terms.",
  "app.operationLog.detailEyebrow": "Log detail",
  "app.operationLog.detailEmptyTitle": "No log selected",
  "app.operationLog.detailEmptyDescription":
    "Select an operation log row to inspect the detail panel.",
  "app.operationLog.detailLoading": "Refreshing operation log detail...",
  "app.operationLog.field.id": "ID",
  "app.operationLog.field.category": "Category",
  "app.operationLog.field.action": "Action",
  "app.operationLog.field.authEventType": "Auth Event Type",
  "app.operationLog.field.authFailureReason": "Auth Failure Reason",
  "app.operationLog.field.actorUserId": "Actor User ID",
  "app.operationLog.field.targetType": "Target Type",
  "app.operationLog.field.targetId": "Target ID",
  "app.operationLog.field.result": "Result",
  "app.operationLog.field.requestId": "Request ID",
  "app.operationLog.field.ip": "IP",
  "app.operationLog.field.userAgent": "User Agent",
  "app.operationLog.field.createdAt": "Created At",
  "app.operationLog.authEventType.login": "Login",
  "app.operationLog.authEventType.logout": "Logout",
  "app.operationLog.authEventType.refresh": "Refresh Token",
  "app.operationLog.authEventType.session_revoke": "Session Revoke",
  "app.operationLog.authFailureReason.invalid_password": "Invalid Password",
  "app.operationLog.authFailureReason.account_locked": "Account Locked",
  "app.operationLog.authFailureReason.user_disabled": "User Disabled",
  "app.operationLog.result.success": "Success",
  "app.operationLog.result.failure": "Failure",
  "app.operationLog.query.categoryPlaceholder": "Search by category",
  "app.operationLog.query.actionPlaceholder": "Search by action",
  "app.operationLog.query.authEventTypePlaceholder": "Select auth event type",
  "app.operationLog.query.authFailureReasonPlaceholder":
    "Search by auth failure reason",
  "app.operationLog.query.actorUserIdPlaceholder": "Search by actor user ID",
  "app.operationLog.query.resultPlaceholder": "Select result",
  "app.operationLog.countLabel": "Showing {visible} of {total} logs",
  "app.operationLog.statsHint": "Current visible operation log rows",
  "app.operationLog.tabsHint": "{count} logs",
  "app.operationLog.panelTitle.detailFallback": "Log detail",
  "app.operationLog.panelDesc.detail":
    "The side panel stays centered on the current log and keeps audit detail out of the main list area.",
  "app.operationLog.meta.details": "Detail Payload",
  "app.operationLog.meta.empty": "None",
}
