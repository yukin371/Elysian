import type { ModuleSchema } from "@elysian/schema"

import {
  DEFAULT_MERGE_STRATEGY,
  type MergeStrategy,
} from "./shared-conventions"
import { isStandardCrudSchema } from "./standard-crud"
import {
  type FrontendTarget,
  type RenderModuleTemplatesOptions,
  getTemplateReason,
  renderFrontendArtifactPath,
  renderFrontendArtifactTemplate,
  renderPagePath,
  renderPageTemplate,
  renderRepositoryTemplate,
  renderRoutesTemplate,
  renderSchemaTemplate,
  renderServiceTemplate,
} from "./templates"
import {
  renderPagePanelPath,
  renderVueEnterpriseMainTemplate,
  renderVueEnterprisePanelTemplate,
  renderVueWorkspaceComposableTemplate,
  renderWorkspaceTemplatePath,
} from "./vue-enterprise-crud-templates"

export interface GeneratedFilePlan {
  path: string
  reason: string
  mergeStrategy: MergeStrategy
}

export interface RenderedModuleFile extends GeneratedFilePlan {
  contents: string
}

const getFrontendTarget = (
  options: RenderModuleTemplatesOptions = {},
): FrontendTarget => options.frontendTarget ?? "vue"

const getSchemaArtifactSource = (
  options: RenderModuleTemplatesOptions = {},
): "package" | "inline" => options.schemaArtifactSource ?? "package"

export const planModuleFiles = (
  schema: ModuleSchema,
  options: RenderModuleTemplatesOptions = {},
): GeneratedFilePlan[] => {
  const frontendTarget = getFrontendTarget(options)
  const basePath = `modules/${schema.name}`
  const pagePath = renderPagePath(schema, frontendTarget)
  const standardCrud = isStandardCrudSchema(schema) && frontendTarget === "vue"

  const baseFiles: GeneratedFilePlan[] = [
    {
      path: `${basePath}/${schema.name}.schema.ts`,
      reason: getTemplateReason(`${basePath}/${schema.name}.schema.ts`),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
    {
      path: `${basePath}/${schema.name}.repository.ts`,
      reason: getTemplateReason(`${basePath}/${schema.name}.repository.ts`),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
    {
      path: `${basePath}/${schema.name}.service.ts`,
      reason: getTemplateReason(`${basePath}/${schema.name}.service.ts`),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
    {
      path: `${basePath}/${schema.name}.routes.ts`,
      reason: getTemplateReason(`${basePath}/${schema.name}.routes.ts`),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
    {
      path: renderFrontendArtifactPath(schema),
      reason: getTemplateReason(renderFrontendArtifactPath(schema)),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
  ]

  if (standardCrud) {
    const panelPath = renderPagePanelPath(schema)
    const workspacePath = renderWorkspaceTemplatePath(schema)

    return [
      ...baseFiles,
      {
        path: pagePath,
        reason: getTemplateReason(pagePath, { enterprise: true }),
        mergeStrategy: DEFAULT_MERGE_STRATEGY,
      },
      {
        path: panelPath,
        reason: getTemplateReason(panelPath),
        mergeStrategy: DEFAULT_MERGE_STRATEGY,
      },
      {
        path: workspacePath,
        reason: getTemplateReason(workspacePath),
        mergeStrategy: DEFAULT_MERGE_STRATEGY,
      },
    ]
  }

  return [
    ...baseFiles,
    {
      path: pagePath,
      reason: getTemplateReason(pagePath),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
  ]
}

export const renderModuleFiles = (
  schema: ModuleSchema,
  options: RenderModuleTemplatesOptions = {},
): RenderedModuleFile[] => {
  const frontendTarget = getFrontendTarget(options)
  const schemaArtifactSource = getSchemaArtifactSource(options)
  const plans = planModuleFiles(schema, {
    frontendTarget,
    schemaArtifactSource,
  })

  return plans.map((plan) => ({
    ...plan,
    contents: withGeneratedHeader(
      schema,
      plan.path,
      renderTemplateForPath(
        schema,
        plan.path,
        frontendTarget,
        schemaArtifactSource,
      ),
      plan.mergeStrategy,
    ),
  }))
}

const renderTemplateForPath = (
  schema: ModuleSchema,
  path: string,
  frontendTarget: FrontendTarget,
  schemaArtifactSource: "package" | "inline",
) => {
  if (path.endsWith(".schema.ts")) {
    return renderSchemaTemplate(schema, {
      frontendTarget,
      schemaArtifactSource,
    })
  }

  if (path.endsWith(".repository.ts")) {
    return renderRepositoryTemplate(schema)
  }

  if (path.endsWith(".service.ts")) {
    return renderServiceTemplate(schema)
  }

  if (path.endsWith(".routes.ts")) {
    return renderRoutesTemplate(schema)
  }

  if (path.endsWith(".frontend.ts")) {
    return renderFrontendArtifactTemplate(schema, frontendTarget)
  }

  if (
    path.endsWith("-panel.vue") &&
    isStandardCrudSchema(schema) &&
    frontendTarget === "vue"
  ) {
    return renderVueEnterprisePanelTemplate(schema)
  }

  if (
    path.endsWith("-workspace.ts") &&
    isStandardCrudSchema(schema) &&
    frontendTarget === "vue"
  ) {
    return renderVueWorkspaceComposableTemplate(schema)
  }

  if (
    path.endsWith(".page.vue") &&
    isStandardCrudSchema(schema) &&
    frontendTarget === "vue"
  ) {
    return renderVueEnterpriseMainTemplate(schema)
  }

  return renderPageTemplate(schema, frontendTarget)
}

const withGeneratedHeader = (
  schema: ModuleSchema,
  path: string,
  contents: string,
  mergeStrategy: MergeStrategy,
) => `/**
 * @generated by elysian-generator
 * schema: ${schema.name}
 * path: ${path}
 * merge-strategy: ${mergeStrategy}
 * manual-edits: discouraged
 */

${contents}`

export type { FrontendTarget, RenderModuleTemplatesOptions }
