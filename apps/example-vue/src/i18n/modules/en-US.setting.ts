import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSSettingLocaleMessages: VueLocaleMessages = {
  "app.setting.sectionTitle": "Settings workspace",
  "app.setting.sectionCopy":
    "The system-settings page stays focused on a real list, detail, and basic edit loop instead of expanding into environment diffing or version management.",
  "app.setting.shellTitle": "Settings workspace",
  "app.setting.shellDescription":
    "The workspace consumes the real system-setting API and stays scoped to the minimum loop instead of expanding into environment overrides or versioning.",
  "app.setting.workspaceEyebrow": "Real module workspace",
  "app.setting.workspaceTitle": "System settings",
  "app.setting.workspaceDescription":
    "Query, settings list, detail, and basic edit stay in one operation loop.",
  "app.setting.emptyTitle": "No settings match the current filters",
  "app.setting.emptyDescription":
    "Clear the filters or adjust the search terms.",
  "app.setting.detailEyebrow": "Setting detail",
  "app.setting.detailEmptyTitle": "No setting selected",
  "app.setting.detailEmptyDescription":
    "Select a setting row to inspect the detail panel.",
  "app.setting.detailLoading": "Refreshing setting detail...",
  "app.setting.field.id": "ID",
  "app.setting.field.key": "Key",
  "app.setting.field.value": "Value",
  "app.setting.field.description": "Description",
  "app.setting.field.status": "Status",
  "app.setting.field.createdAt": "Created At",
  "app.setting.field.updatedAt": "Updated At",
  "app.setting.status.active": "Active",
  "app.setting.status.disabled": "Disabled",
  "app.setting.query.keyPlaceholder": "Search by key",
  "app.setting.query.valuePlaceholder": "Search by value",
  "app.setting.query.descriptionPlaceholder": "Search by description",
  "app.setting.action.create": "New setting",
  "app.setting.action.edit": "Edit setting",
  "app.setting.countLabel": "Showing {visible} of {total} settings",
  "app.setting.statsHint": "Current visible setting rows",
  "app.setting.tabsHint": "{count} settings",
  "app.setting.panelTitle.create": "Create setting",
  "app.setting.panelTitle.edit": "Edit setting",
  "app.setting.panelTitle.detailFallback": "Setting detail",
  "app.setting.panelDesc.create":
    "Create mode calls the canonical system-setting API directly while the example app only owns view state.",
  "app.setting.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields instead of adding a second form owner.",
  "app.setting.panelDesc.detail":
    "Detail and actions stay focused on the current setting.",
}
