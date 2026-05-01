import { buildWorkspaceRegistrationFromArtifact } from "@elysian/frontend-vue"

import {
  departmentFrontendModuleArtifact,
  dictionaryFrontendModuleArtifact,
  menuFrontendModuleArtifact,
  postFrontendModuleArtifact,
  roleFrontendModuleArtifact,
  settingFrontendModuleArtifact,
  userFrontendModuleArtifact,
} from "./generated"

import type { WorkspaceRegistration } from "./types"

export const systemWorkspaceRegistrations = [
  buildWorkspaceRegistrationFromArtifact(
    dictionaryFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    departmentFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    postFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    menuFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    roleFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    settingFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    userFrontendModuleArtifact,
  ) as WorkspaceRegistration,
] as const satisfies readonly WorkspaceRegistration[]
