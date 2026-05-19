import type { GenerationTargetPreset } from "./conventions"
import type { FrontendTarget } from "./core"

export type ModuleHandoffManualStepId =
  | "persistence-schema-review"
  | "persistence-migration"
  | "server-repository-implementation"
  | "server-route-registration"
  | "frontend-workspace-registration"
  | "final-verification"

export type ModuleHandoffCanonicalOwner =
  | "packages/persistence"
  | "apps/server"
  | "apps/example-vue"
  | "reviewer"

export interface ModuleHandoffManualStep {
  id: ModuleHandoffManualStepId
  title: string
  canonicalOwner: ModuleHandoffCanonicalOwner
  status: "pending"
  evidenceHint: string
}

export interface ModuleHandoffManifest {
  version: 1
  generatedAt: string
  schemaName: string
  frontendTarget: FrontendTarget
  targetPreset: Extract<GenerationTargetPreset, "module">
  generationManifestPath: string
  manualSteps: ModuleHandoffManualStep[]
  suggestedCommands: string[]
  nonGoals: string[]
}

interface BuildModuleHandoffManifestOptions {
  generatedAt?: string
  generationManifestPath: string
  frontendTarget: FrontendTarget
  schemaName: string
}

export const MODULE_HANDOFF_MANIFEST_NON_GOALS = [
  "Does not generate formal migrations automatically.",
  "Does not register server compose automatically.",
  "Does not register frontend workspace automatically.",
  "Does not mark manual integration as completed.",
]

const buildManualSteps = (schemaName: string): ModuleHandoffManualStep[] => [
  {
    id: "persistence-schema-review",
    title: "Review generated persistence schema handoff template",
    canonicalOwner: "packages/persistence",
    status: "pending",
    evidenceHint: `Review ${schemaName}.persistence.ts before copying any schema into packages/persistence.`,
  },
  {
    id: "persistence-migration",
    title: "Create and review the formal database migration",
    canonicalOwner: "packages/persistence",
    status: "pending",
    evidenceHint:
      "Run db:generate/db:migrate only after the persistence owner accepts the schema change.",
  },
  {
    id: "server-repository-implementation",
    title: "Implement repository and route behavior in the server module",
    canonicalOwner: "apps/server",
    status: "pending",
    evidenceHint: `Replace TODO stubs in ${schemaName}.module.ts with reviewed repository and route logic.`,
  },
  {
    id: "server-route-registration",
    title: "Register the server module in the correct compose owner",
    canonicalOwner: "apps/server",
    status: "pending",
    evidenceHint:
      "Choose compose-business.ts or compose-system.ts by module domain; generator must not decide this automatically.",
  },
  {
    id: "frontend-workspace-registration",
    title: "Register and verify the frontend workspace surface",
    canonicalOwner: "apps/example-vue",
    status: "pending",
    evidenceHint:
      "Use existing generated surface verification before committing frontend workspace changes.",
  },
  {
    id: "final-verification",
    title: "Run boundary verification before claiming integration complete",
    canonicalOwner: "reviewer",
    status: "pending",
    evidenceHint:
      "Run targeted module tests plus generator/module smoke; do not treat this manifest as completion proof.",
  },
]

export const buildModuleHandoffManifest = (
  options: BuildModuleHandoffManifestOptions,
): ModuleHandoffManifest => ({
  version: 1,
  generatedAt: options.generatedAt ?? new Date().toISOString(),
  schemaName: options.schemaName,
  frontendTarget: options.frontendTarget,
  targetPreset: "module",
  generationManifestPath: options.generationManifestPath,
  manualSteps: buildManualSteps(options.schemaName),
  suggestedCommands: [
    "bun test packages/generator/src/",
    "bun scripts/e2e-generator-module-target-smoke.ts",
    "bun run e2e:generator:cli",
  ],
  nonGoals: MODULE_HANDOFF_MANIFEST_NON_GOALS,
})
