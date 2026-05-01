import { buildWorkspaceRegistrationFromArtifact } from "@elysian/frontend-vue"

import {
  customerFrontendModuleArtifact,
  fileFrontendModuleArtifact,
  notificationFrontendModuleArtifact,
  operationLogFrontendModuleArtifact,
  tenantFrontendModuleArtifact,
  workflowDefinitionFrontendModuleArtifact,
} from "./generated"

import type { WorkspaceRegistration } from "./types"

export const businessWorkspaceRegistrations = [
  buildWorkspaceRegistrationFromArtifact(
    customerFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    fileFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    notificationFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    operationLogFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    tenantFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact(
    workflowDefinitionFrontendModuleArtifact,
  ) as WorkspaceRegistration,
  {
    domain: "business",
    path: "/studio/generator-preview",
    kind: "generator-preview",
    moduleCode: "generator-preview",
    permissionPrefix: "studio:generator-preview",
    permissions: {},
    navigation: {
      id: "enterprise-studio-generator-preview",
      parentId: "enterprise-studio",
      parentCode: "studio-root",
      code: "studio-generator-preview",
      nameKey: "app.fallback.generatorPreview",
      component: "studio/generator-preview/index",
      icon: "terminal",
      sort: 10,
      permissionCode: null,
      group: {
        id: "enterprise-studio",
        code: "studio-root",
        nameKey: "app.fallback.studio",
        icon: "code",
        sort: 200,
      },
    },
    i18nKeys: {
      sectionTitle: "app.generatorPreview.sectionTitle",
      sectionCopy: "app.generatorPreview.sectionCopy",
      shellTitle: "app.generatorPreview.shellTitle",
      shellDescription: "app.generatorPreview.shellDescription",
    },
  },
] as const satisfies readonly WorkspaceRegistration[]
