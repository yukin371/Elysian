import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSUserLocaleMessages: VueLocaleMessages = {
  "app.user.sectionTitle": "Users workspace",
  "app.user.sectionCopy":
    "The system-users page stays focused on a real list plus detail view instead of expanding into a second full admin surface.",
  "app.user.shellTitle": "Users workspace",
  "app.user.shellDescription":
    "The workspace consumes the real system-user API and extends the example app with the minimum additional assembly surface.",
  "app.user.workspaceEyebrow": "Real module workspace",
  "app.user.workspaceTitle": "System users",
  "app.user.workspaceDescription":
    "Query, list, and selected user detail stay in one operation loop.",
  "app.user.emptyTitle": "No users match the current filters",
  "app.user.emptyDescription": "Clear the filters or adjust the search terms.",
  "app.user.detailEyebrow": "User detail",
  "app.user.detailDescription":
    "Detail stays focused on the selected user's identity and audit metadata.",
  "app.user.detailEmptyTitle": "No user selected",
  "app.user.detailEmptyDescription":
    "Select a user row to inspect the detail panel.",
  "app.user.status.active": "Active",
  "app.user.status.disabled": "Disabled",
  "app.user.field.id": "ID",
  "app.user.field.username": "Username",
  "app.user.field.displayName": "Display Name",
  "app.user.field.email": "Email",
  "app.user.field.phone": "Phone",
  "app.user.field.status": "Status",
  "app.user.field.isSuperAdmin": "Super Admin",
  "app.user.field.lastLoginAt": "Last Login At",
  "app.user.field.createdAt": "Created At",
  "app.user.field.updatedAt": "Updated At",
  "app.user.field.password": "Password",
  "app.user.query.usernamePlaceholder": "Search by username",
  "app.user.query.displayNamePlaceholder": "Search by display name",
  "app.user.query.emailPlaceholder": "Search by email",
  "app.user.query.phonePlaceholder": "Search by phone",
  "app.user.passwordPlaceholder": "Enter password",
  "app.user.action.create": "New user",
  "app.user.action.edit": "Edit user",
  "app.user.action.resetPassword": "Reset password",
  "app.user.action.confirmResetPassword": "Confirm reset",
  "app.user.panelTitle.create": "Create user",
  "app.user.panelTitle.edit": "Edit user",
  "app.user.panelTitle.reset": "Reset password: {name}",
  "app.user.panelTitle.resetFallback": "Reset password",
  "app.user.panelTitle.detailFallback": "User detail",
  "app.user.panelDesc.create":
    "Create mode calls the canonical system-user API directly while the example app only owns view state.",
  "app.user.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields instead of adding a second form owner.",
  "app.user.panelDesc.reset":
    "Password reset stays a dedicated action so sensitive input does not leak into the regular edit flow.",
  "app.user.panelDesc.detail":
    "Detail and actions stay focused on the current user.",
  "app.user.boolean.true": "Yes",
  "app.user.boolean.false": "No",
  "app.user.lastLoginEmpty": "No record",
  "app.user.countLabel": "Showing {visible} of {total} users",
  "app.user.statsHint": "Current visible user rows",
  "app.user.tabsHint": "{count} users",
}
