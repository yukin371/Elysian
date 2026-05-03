import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSDictionaryLocaleMessages: VueLocaleMessages = {
  "app.dictionary.sectionTitle": "Dictionaries workspace",
  "app.dictionary.sectionCopy":
    "The dictionary page stays focused on real type list, detail, and basic edit flows, while items remain attached to the selected type instead of becoming a second primary workspace.",
  "app.dictionary.shellTitle": "Dictionaries workspace",
  "app.dictionary.shellDescription":
    "The workspace consumes the real system-dictionary API, keeps the main area focused on dictionary types, and shows items alongside the selected type.",
  "app.dictionary.workspaceEyebrow": "Real module workspace",
  "app.dictionary.workspaceTitle": "System dictionary types",
  "app.dictionary.workspaceDescription":
    "The main area owns dictionary-type query and list views, while the side panel stays centered on the selected type and its items.",
  "app.dictionary.emptyTitle": "No dictionary types match the current filters",
  "app.dictionary.emptyDescription":
    "Clear the filters or adjust the search terms.",
  "app.dictionary.detailEyebrow": "Dictionary detail",
  "app.dictionary.detailEmptyTitle": "No dictionary type selected",
  "app.dictionary.detailEmptyDescription":
    "Select a dictionary type row to inspect the detail panel.",
  "app.dictionary.detailLoading": "Refreshing dictionary detail...",
  "app.dictionary.field.id": "ID",
  "app.dictionary.field.code": "Code",
  "app.dictionary.field.name": "Name",
  "app.dictionary.field.description": "Description",
  "app.dictionary.field.status": "Status",
  "app.dictionary.field.createdAt": "Created At",
  "app.dictionary.field.updatedAt": "Updated At",
  "app.dictionary.status.active": "Active",
  "app.dictionary.status.disabled": "Disabled",
  "app.dictionary.boolean.true": "Yes",
  "app.dictionary.boolean.false": "No",
  "app.dictionary.query.codePlaceholder": "Search by code",
  "app.dictionary.query.namePlaceholder": "Search by name",
  "app.dictionary.query.descriptionPlaceholder": "Search by description",
  "app.dictionary.action.create": "New dictionary type",
  "app.dictionary.action.edit": "Edit dictionary type",
  "app.dictionary.countLabel": "Showing {visible} of {total} dictionary types",
  "app.dictionary.statsHint": "Current visible dictionary type rows",
  "app.dictionary.tabsHint": "{count} dictionary types",
  "app.dictionary.panelTitle.create": "Create dictionary type",
  "app.dictionary.panelTitle.edit": "Edit dictionary type",
  "app.dictionary.panelTitle.detailFallback": "Dictionary detail",
  "app.dictionary.panelDesc.create":
    "Create mode calls the canonical system-dictionary API directly while the example app only owns type-level view state.",
  "app.dictionary.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields instead of introducing a second shared owner.",
  "app.dictionary.panelDesc.detail":
    "The side panel stays centered on the current dictionary type and carries a snapshot of its items.",
  "app.dictionary.meta.itemCount": "Item Count",
  "app.dictionary.meta.defaultCount": "Default Count",
  "app.dictionary.meta.items": "Dictionary Items",
  "app.dictionary.meta.itemStatus": "Status",
  "app.dictionary.meta.itemSort": "Sort",
  "app.dictionary.meta.itemDefault": "Default",
  "app.dictionary.meta.empty": "None",
}
