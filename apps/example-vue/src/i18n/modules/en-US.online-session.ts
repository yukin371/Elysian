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
    "Filters, session rows, detail, and revoke action stay in one operation loop.",
  "app.onlineSession.emptyTitle": "No sessions match the current filters",
  "app.onlineSession.emptyDescription":
    "This account has no other visible sessions yet. Keep this page open and return after the next sign-in or refresh cycle.",
  "app.onlineSession.filteredEmptyTitle": "No sessions match the current filters",
  "app.onlineSession.filteredEmptyDescription":
    "The current filter set hides every visible session.",
  "app.onlineSession.filteredRecoveryHint":
    "Clear the filters first, then review the current session or pick another device from the full list.",
  "app.onlineSession.searchPlaceholder": "Search sessions",
  "app.onlineSession.countLabel": "Showing {visible} of {total} sessions",
  "app.onlineSession.statsHint": "Visible sessions for the current user",
  "app.onlineSession.tabsHint": "{count} sessions",
  "app.onlineSession.detailEyebrow": "Session detail",
  "app.onlineSession.detailEmptyTitle": "No session selected",
  "app.onlineSession.detailEmptyDescription":
    "Select a session row to inspect device, IP, and expiry details.",
  "app.onlineSession.detailEmptyNextStep":
    "Next: use the scope filter to narrow to the current session or select another device from the list.",
  "app.onlineSession.panelTitle.detailFallback": "Session detail",
  "app.onlineSession.panelDesc.detail":
    "Detail and actions stay focused on the current session.",
  "app.onlineSession.currentBadge": "Current session",
  "app.onlineSession.currentSessionTitle": "You are reviewing the session you are using right now",
  "app.onlineSession.currentSessionDescription":
    "Signing out here ends the current browser session immediately and sends you back through sign-in recovery.",
  "app.onlineSession.otherSessionTitle": "This is another device or an older session",
  "app.onlineSession.otherSessionDescription":
    "Revoking it keeps the current browser session active and only removes access for the selected device.",
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
  "app.onlineSession.action.revokeCurrentDisabled":
    "Current session cannot be revoked here",
  "app.onlineSession.action.confirmRevoke": "Confirm revoke session",
  "app.onlineSession.action.cancelRevoke": "Keep session active",
  "app.onlineSession.action.clearFilters": "Clear filters",
  "app.onlineSession.confirmationTitle": "Confirm session revoke",
  "app.onlineSession.confirmationDescription":
    "This will remove access for {device} ({ip}). The current browser session will stay signed in.",
  "app.onlineSession.revokeCurrentHint":
    "This workspace keeps the current browser session protected. Use the global sign-out path if you need to end it.",
  "app.onlineSession.revokeOtherHint":
    "Use this to remove access from the selected device without signing out here.",
  "app.onlineSession.revokeOtherConfirmHint":
    "Confirm only after checking the device and IP. This action signs out the selected session immediately.",
}
