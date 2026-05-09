import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSSettingLocaleMessages: VueLocaleMessages = {
  "app.setting.sectionTitle": "Config entries workspace",
  "app.setting.sectionCopy":
    "This page stays focused on a real config-entry list, detail, and basic edit loop instead of expanding into a settings center, environment diffing, or version management.",
  "app.setting.shellTitle": "Config entries workspace",
  "app.setting.shellDescription":
    "The workspace consumes the real config-entry API and stays scoped to the minimum loop instead of expanding into environment overrides, auto-apply behavior, or versioning.",
  "app.setting.workspaceEyebrow": "Real module workspace",
  "app.setting.workspaceTitle": "Config entries",
  "app.setting.workspaceDescription":
    "Query, entry list, detail, and basic edit stay in one operation loop.",
  "app.setting.emptyTitle": "No config entries match the current filters",
  "app.setting.emptyDescription":
    "Clear the filters or adjust the search terms.",
  "app.setting.detailEyebrow": "Config entry detail",
  "app.setting.detailEmptyTitle": "No config entry selected",
  "app.setting.detailEmptyDescription":
    "Select a config entry row to inspect the detail panel.",
  "app.setting.detailLoading": "Refreshing config entry detail...",
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
  "app.setting.action.create": "New config entry",
  "app.setting.action.edit": "Edit config entry",
  "app.setting.countLabel": "Showing {visible} of {total} config entries",
  "app.setting.statsHint": "Current visible config-entry rows",
  "app.setting.tabsHint": "{count} config entries",
  "app.setting.panelTitle.create": "Create config entry",
  "app.setting.panelTitle.edit": "Edit config entry",
  "app.setting.panelTitle.detailFallback": "Config entry detail",
  "app.setting.panelDesc.create":
    "Create mode calls the canonical config-entry API directly. Whether the new entry takes effect still depends on a consumer reading that key.",
  "app.setting.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields instead of adding a second form owner.",
  "app.setting.panelDesc.detail":
    "Detail and actions stay focused on the current config entry.",
}
