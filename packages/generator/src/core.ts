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
  renderModuleRegistrationPath,
  renderModuleRegistrationTemplate,
  renderPagePath,
  renderPageTemplate,
  renderPersistenceSchemaTemplate,
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
  const basePath =
    options.targetPreset === "module" ? schema.name : `modules/${schema.name}`
  const pagePath = renderPagePath(schema, frontendTarget, options.targetPreset)
  const standardCrud = isStandardCrudSchema(schema) && frontendTarget === "vue"

  const baseFiles: GeneratedFilePlan[] = [
    {
      path: `${basePath}/${schema.name}.schema.ts`,
      reason: getTemplateReason(`${basePath}/${schema.name}.schema.ts`),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
    {
      path: `${basePath}/${schema.name}.persistence.ts`,
      reason: getTemplateReason(`${basePath}/${schema.name}.persistence.ts`),
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
      path: renderFrontendArtifactPath(schema, options.targetPreset),
      reason: getTemplateReason(
        renderFrontendArtifactPath(schema, options.targetPreset),
      ),
      mergeStrategy: DEFAULT_MERGE_STRATEGY,
    },
  ]

  if (options.targetPreset === "module") {
    baseFiles.push({
      path: renderModuleRegistrationPath(schema, options.targetPreset),
      reason: getTemplateReason(
        renderModuleRegistrationPath(schema, options.targetPreset),
      ),
      mergeStrategy: "preserve-existing",
    })
  }

  if (standardCrud) {
    const panelPath = renderPagePanelPath(schema, options.targetPreset)
    const workspacePath = renderWorkspaceTemplatePath(
      schema,
      options.targetPreset,
    )

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
    targetPreset: options.targetPreset,
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
        options.targetPreset,
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
  targetPreset?: RenderModuleTemplatesOptions["targetPreset"],
) => {
  if (path.endsWith(".schema.ts")) {
    return renderSchemaTemplate(schema, {
      frontendTarget,
      schemaArtifactSource,
    })
  }

  if (path.endsWith(".persistence.ts")) {
    return renderPersistenceSchemaTemplate(schema)
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
    return renderFrontendArtifactTemplate(schema, frontendTarget, targetPreset)
  }

  if (path.endsWith(".module.ts")) {
    return renderModuleRegistrationTemplate(schema)
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
