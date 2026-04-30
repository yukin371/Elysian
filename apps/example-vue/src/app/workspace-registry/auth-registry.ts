import type { WorkspaceRegistration } from "./types"

export const authWorkspaceRegistrations = [
  {
    domain: "auth",
    path: "/system/sessions",
    kind: "session",
    moduleCode: "auth",
    permissionPrefix: "auth:session",
    i18nKeys: {
      sectionTitle: "app.onlineSession.sectionTitle",
      sectionCopy: "app.onlineSession.sectionCopy",
      shellTitle: "app.onlineSession.shellTitle",
      shellDescription: "app.onlineSession.shellDescription",
    },
  },
] as const satisfies WorkspaceRegistration[]
