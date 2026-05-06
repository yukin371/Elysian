import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSTenantLocaleMessages: VueLocaleMessages = {
  "app.tenant.sectionTitle": "Tenants workspace",
  "app.tenant.sectionCopy":
    "The tenant page stays focused on a real list, detail, basic edit, and status toggle loop instead of expanding into tenant-bootstrap orchestration or a cross-tenant governance center.",
  "app.tenant.shellTitle": "Tenants workspace",
  "app.tenant.shellDescription":
    "The workspace consumes the real system-tenant API and keeps the super-admin gate explicit instead of faking broader access.",
  "app.tenant.workspaceEyebrow": "Real module workspace",
  "app.tenant.workspaceTitle": "System tenants",
  "app.tenant.workspaceDescription":
    "Tenant query, list, detail, basic edit, and status changes stay in one operation loop.",
  "app.tenant.emptyTitle": "No tenants match the current filters",
  "app.tenant.emptyDescription":
    "Clear the filters or adjust the search terms.",
  "app.tenant.detailEyebrow": "Tenant detail",
  "app.tenant.detailEmptyTitle": "No tenant selected",
  "app.tenant.detailEmptyDescription":
    "Select a tenant row to inspect the detail panel.",
  "app.tenant.detailLoading": "Refreshing tenant detail...",
  "app.tenant.field.id": "ID",
  "app.tenant.field.code": "Tenant Code",
  "app.tenant.field.name": "Tenant Name",
  "app.tenant.field.status": "Status",
  "app.tenant.field.createdAt": "Created At",
  "app.tenant.field.updatedAt": "Updated At",
  "app.tenant.status.active": "Active",
  "app.tenant.status.suspended": "Suspended",
  "app.tenant.query.codePlaceholder": "Search by tenant code",
  "app.tenant.query.namePlaceholder": "Search by tenant name",
  "app.tenant.action.create": "New tenant",
  "app.tenant.action.edit": "Edit tenant",
  "app.tenant.action.activate": "Activate tenant",
  "app.tenant.action.suspend": "Suspend tenant",
  "app.tenant.countLabel": "Showing {visible} of {total} tenants",
  "app.tenant.statsHint": "Current visible tenant rows",
  "app.tenant.tabsHint": "{count} tenants",
  "app.tenant.panelTitle.create": "Create tenant",
  "app.tenant.panelTitle.edit": "Edit tenant",
  "app.tenant.panelTitle.detailFallback": "Tenant detail",
  "app.tenant.panelDesc.create":
    "Create mode calls the canonical system-tenant API directly while the example app only owns view state.",
  "app.tenant.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields instead of adding another governance abstraction layer.",
  "app.tenant.panelDesc.detail":
    "Detail and actions stay focused on the current tenant with an explicit status toggle.",
}
