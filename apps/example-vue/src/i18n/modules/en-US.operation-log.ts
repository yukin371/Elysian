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
    "Query, log list, and audit detail stay in one operation loop.",
  "app.operationLog.emptyTitle": "No operation logs have been recorded yet",
  "app.operationLog.emptyDescription":
    "Return after a real login, update, revoke, or workflow action to inspect the next recorded event.",
  "app.operationLog.filteredEmptyTitle":
    "No operation logs match the current filters",
  "app.operationLog.filteredEmptyDescription":
    "The current query is too narrow to show a matching audit event.",
  "app.operationLog.filteredRecoveryHint":
    "Widen the time-adjacent fields first, then inspect one log row and follow its request ID through the detail panel.",
  "app.operationLog.searchPlaceholder": "Search operation logs",
  "app.operationLog.detailEyebrow": "Log detail",
  "app.operationLog.detailEmptyTitle": "No log selected",
  "app.operationLog.detailEmptyDescription":
    "Select one operation log row to inspect actor, target, request ID, and raw payload.",
  "app.operationLog.detailEmptyNextStep":
    "Next: shrink the query to one category, request ID, actor, or result, then open the closest matching log row.",
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
  "app.operationLog.query.targetTypePlaceholder": "Search by target type",
  "app.operationLog.query.targetIdPlaceholder": "Search by target ID",
  "app.operationLog.query.requestIdPlaceholder": "Search by request ID",
  "app.operationLog.query.ipPlaceholder": "Search by IP",
  "app.operationLog.query.userAgentPlaceholder": "Search by user agent",
  "app.operationLog.query.resultPlaceholder": "Select result",
  "app.operationLog.countLabel": "Showing {visible} of {total} logs",
  "app.operationLog.statsHint": "Current visible operation log rows",
  "app.operationLog.tabsHint": "{count} logs",
  "app.operationLog.panelTitle.detailFallback": "Log detail",
  "app.operationLog.panelDesc.detail":
    "Use the selected log to confirm request ownership, result, target, and the raw evidence payload before moving on.",
  "app.operationLog.meta.details": "Detail Payload",
  "app.operationLog.meta.empty": "None",
  "app.operationLog.meta.missing": "Missing",
  "app.operationLog.meta.target": "Target",
  "app.operationLog.action.clearFilters": "Clear filters",
}
