import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSOnlineSessionLocaleMessages: VueLocaleMessages = {
  "app.onlineSession.sectionTitle": "Online sessions workspace",
  "app.onlineSession.sectionCopy":
    "This round stays scoped to the current signed-in user's session governance instead of expanding into an admin-wide online-user console.",
  "app.onlineSession.shellTitle": "Online sessions workspace",
  "app.onlineSession.shellDescription":
    "List and detail consume the current-user session endpoints directly and keep scope on viewing plus revoking a single session.",
  "app.onlineSession.workspaceEyebrow": "Current user sessions",
  "app.onlineSession.workspaceTitle": "Online session list",
  "app.onlineSession.workspaceDescription":
    "The main area stays focused on filters and session rows while the side panel owns detail and revoke action.",
  "app.onlineSession.emptyTitle": "No sessions match the current filters",
  "app.onlineSession.emptyDescription":
    "Clear the filters and try again, or wait for the next refresh.",
  "app.onlineSession.countLabel": "Showing {visible} of {total} sessions",
  "app.onlineSession.statsHint": "Visible sessions for the current user",
  "app.onlineSession.tabsHint": "{count} sessions",
  "app.onlineSession.detailEyebrow": "Session detail",
  "app.onlineSession.detailEmptyDescription":
    "Select a session to inspect its detail, or manage the current signed-in session.",
  "app.onlineSession.panelTitle.detailFallback": "Session detail",
  "app.onlineSession.panelDesc.detail":
    "The side panel stays centered on the current session instead of growing into a batch revoke console.",
  "app.onlineSession.field.keyword": "Keyword",
  "app.onlineSession.field.state": "State",
  "app.onlineSession.field.scope": "Scope",
  "app.onlineSession.field.device": "Device",
  "app.onlineSession.field.ip": "IP",
  "app.onlineSession.field.lastUsedAt": "Last used at",
  "app.onlineSession.field.expiresAt": "Expires at",
  "app.onlineSession.field.createdAt": "Created at",
  "app.onlineSession.field.updatedAt": "Updated at",
  "app.onlineSession.field.userAgent": "User-Agent",
  "app.onlineSession.query.keywordPlaceholder": "Search by device or IP",
  "app.onlineSession.query.scopePlaceholder": "Select scope",
  "app.onlineSession.scope.all": "All sessions",
  "app.onlineSession.scope.current": "Current session",
  "app.onlineSession.scope.history": "History sessions",
  "app.onlineSession.state.current": "Current session",
  "app.onlineSession.state.active": "Active",
  "app.onlineSession.state.rotated": "Rotated",
  "app.onlineSession.state.revoked": "Revoked",
  "app.onlineSession.action.revoke": "Revoke session",
  "app.onlineSession.action.revokeCurrent": "Sign out current session",
}
