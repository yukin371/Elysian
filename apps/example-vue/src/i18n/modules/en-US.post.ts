import type { VueLocaleMessages } from "@elysian/frontend-vue"

export const enUSPostLocaleMessages: VueLocaleMessages = {
  "app.post.sectionTitle": "Posts workspace",
  "app.post.sectionCopy":
    "The system-posts page stays focused on a real list, detail, and basic edit loop instead of expanding into user-post assignment tooling.",
  "app.post.shellTitle": "Posts workspace",
  "app.post.shellDescription":
    "The workspace consumes the real system-post API and stays scoped to the minimum list-detail-edit loop.",
  "app.post.workspaceEyebrow": "Real module workspace",
  "app.post.workspaceTitle": "System posts",
  "app.post.workspaceDescription":
    "Query, post list, detail, and basic edit stay in one operation loop.",
  "app.post.emptyTitle": "No posts match the current filters",
  "app.post.emptyDescription": "Clear the filters or adjust the search terms.",
  "app.post.detailEyebrow": "Post detail",
  "app.post.detailEmptyDescription":
    "Select a post to inspect its detail, or open the create flow directly.",
  "app.post.detailLoading": "Refreshing the current post detail...",
  "app.post.field.id": "ID",
  "app.post.field.code": "Code",
  "app.post.field.name": "Name",
  "app.post.field.sort": "Sort",
  "app.post.field.status": "Status",
  "app.post.field.remark": "Remark",
  "app.post.field.createdAt": "Created At",
  "app.post.field.updatedAt": "Updated At",
  "app.post.status.active": "Active",
  "app.post.status.disabled": "Disabled",
  "app.post.query.codePlaceholder": "Search by code",
  "app.post.query.namePlaceholder": "Search by name",
  "app.post.query.remarkPlaceholder": "Search by remark",
  "app.post.action.create": "New post",
  "app.post.action.edit": "Edit post",
  "app.post.countLabel": "Showing {visible} of {total} posts",
  "app.post.panelTitle.create": "Create post",
  "app.post.panelTitle.edit": "Edit post",
  "app.post.panelTitle.detailFallback": "Post detail",
  "app.post.panelDesc.create":
    "Create mode calls the canonical system-post API directly while the example app only owns view state.",
  "app.post.panelDesc.edit":
    "Edit mode reuses the same schema-derived fields while status and remark stay in one form.",
  "app.post.panelDesc.detail":
    "Detail and actions stay focused on the current post.",
}
