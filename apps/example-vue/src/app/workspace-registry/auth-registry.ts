import type { WorkspaceRegistration } from "./types"

export const authWorkspaceRegistrations = [
  {
    domain: "auth",
    path: "/system/sessions",
    kind: "session",
    moduleCode: "auth",
    permissionPrefix: "auth:session",
    navigation: {
      id: "enterprise-sessions",
      parentId: "enterprise-system",
      parentCode: "system-root",
      code: "system-sessions",
      nameKey: "app.fallback.onlineSessions",
      component: "system/sessions/index",
      icon: "time",
      sort: 47,
      permissionCode: null,
    },
    i18nKeys: {
      sectionTitle: "app.onlineSession.sectionTitle",
      sectionCopy: "app.onlineSession.sectionCopy",
      shellTitle: "app.onlineSession.shellTitle",
      shellDescription: "app.onlineSession.shellDescription",
    },
  },
] as const satisfies WorkspaceRegistration[]
