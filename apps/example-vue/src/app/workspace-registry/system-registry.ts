import { buildWorkspaceRegistration } from "@elysian/frontend-vue"
import {
  departmentModuleSchema,
  dictionaryModuleSchema,
  menuModuleSchema,
  postModuleSchema,
  roleModuleSchema,
  settingModuleSchema,
  userModuleSchema,
} from "@elysian/schema"

import type { WorkspaceRegistration } from "./types"

export const systemWorkspaceRegistrations = [
  buildWorkspaceRegistration(dictionaryModuleSchema) as WorkspaceRegistration,
  buildWorkspaceRegistration(departmentModuleSchema) as WorkspaceRegistration,
  buildWorkspaceRegistration(postModuleSchema) as WorkspaceRegistration,
  buildWorkspaceRegistration(menuModuleSchema) as WorkspaceRegistration,
  buildWorkspaceRegistration(roleModuleSchema) as WorkspaceRegistration,
  buildWorkspaceRegistration(settingModuleSchema) as WorkspaceRegistration,
  buildWorkspaceRegistration(userModuleSchema) as WorkspaceRegistration,
] as const satisfies readonly WorkspaceRegistration[]
