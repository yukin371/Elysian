import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSDepartmentLocaleMessages: VueLocaleMessages = {
  "app.department.sectionTitle": "Departments workspace",
  "app.department.sectionCopy":
    "The system-departments page stays focused on a real list, detail, and basic edit loop instead of expanding into an org-tree editor.",
  "app.department.shellTitle": "Departments workspace",
  "app.department.shellDescription":
    "The workspace consumes the real system-department API and keeps linked users read-only for this round.",
  "app.department.workspaceEyebrow": "Real module workspace",
  "app.department.workspaceTitle": "System departments",
  "app.department.workspaceDescription":
    "The main area owns the query bar and department list, while the side panel stays focused on detail and basic edit actions.",
  "app.department.emptyTitle": "No departments match the current filters",
  "app.department.emptyDescription":
    "Clear the filters or adjust the search terms.",
  "app.department.detailEyebrow": "Department detail",
  "app.department.detailEmptyTitle": "No department selected",
  "app.department.detailEmptyDescription":
    "Select a department row to inspect the detail panel.",
  "app.department.detailLoading": "Refreshing department detail...",
  "app.department.field.id": "ID",
  "app.department.field.parentId": "Parent Department",
  "app.department.field.code": "Code",
  "app.department.field.name": "Name",
  "app.department.field.sort": "Sort",
  "app.department.field.status": "Status",
  "app.department.field.createdAt": "Created At",
  "app.department.field.updatedAt": "Updated At",
  "app.department.status.active": "Active",
  "app.department.status.disabled": "Disabled",
  "app.department.parentRoot": "Top-level Department",
  "app.department.parentPlaceholder": "Select parent department",
  "app.department.query.codePlaceholder": "Search by code",
  "app.department.query.namePlaceholder": "Search by name",
  "app.department.action.create": "New department",
  "app.department.action.edit": "Edit department",
  "app.department.countLabel": "Showing {visible} of {total} departments",
  "app.department.statsHint": "Current visible department rows",
  "app.department.tabsHint": "{count} departments",
  "app.department.panelTitle.create": "Create department",
  "app.department.panelTitle.edit": "Edit department",
  "app.department.panelTitle.detailFallback": "Department detail",
  "app.department.panelDesc.create":
    "Create mode calls the canonical system-department API directly while the example app only owns view state.",
  "app.department.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields while linked users stay read-only in this round.",
  "app.department.panelDesc.detail":
    "The side panel stays centered on the current department and keeps edit actions out of the main list area.",
  "app.department.meta.parent": "Parent Department",
  "app.department.meta.userCount": "Linked Users",
  "app.department.meta.userIds": "User IDs",
  "app.department.meta.empty": "None",
}
