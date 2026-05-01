import { describe, expect, test } from "bun:test"

import {
  generatedStandardCrudFrontendModuleArtifacts,
  generatedStandardCrudWorkspaceKinds,
} from "../../../app/workspace-registry/generated"
import { shellWorkspaceMainResolverKinds } from "./shell-workspace-main-descriptor"
import { shellWorkspaceSecondaryResolverKinds } from "./shell-workspace-secondary-descriptor"

const sortValues = (values: readonly string[]) => [...values].sort()

describe("shell workspace descriptor coverage", () => {
  test("keeps generated standard CRUD artifacts aligned with shell resolvers", () => {
    expect(
      generatedStandardCrudFrontendModuleArtifacts.every(
        (artifact) => artifact.surfaceKind === "standard-crud-enterprise",
      ),
    ).toBe(true)

    expect(sortValues(shellWorkspaceMainResolverKinds)).toEqual(
      sortValues([
        ...generatedStandardCrudWorkspaceKinds,
        "file",
        "generator-preview",
        "operation-log",
        "session",
        "workflow-definitions",
      ]),
    )

    expect(sortValues(shellWorkspaceSecondaryResolverKinds)).toEqual(
      sortValues([
        ...generatedStandardCrudWorkspaceKinds,
        "file",
        "generator-preview",
        "operation-log",
        "session",
        "workflow-definitions",
      ]),
    )
  })
})
