import type { WorkflowDefinitionRecord } from "@elysian/schema"

import { requestJson } from "./core"
import type {
  ApplyGeneratorPreviewSessionResponse,
  CreateGeneratorPreviewSessionRequest,
  CreateGeneratorPreviewSessionResponse,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionsResponse,
  WorkflowDefinitionsResponse,
} from "../platform-api"

interface ExampleApiOverrides {
  workflowDefinitions?: WorkflowDefinitionRecord[]
}

declare global {
  var __ELYSIAN_EXAMPLE_API_OVERRIDES__: ExampleApiOverrides | undefined
}

export const listGeneratorPreviewSessions =
  async (): Promise<GeneratorPreviewSessionsResponse> =>
    requestJson<GeneratorPreviewSessionsResponse>("/studio/generator/sessions", {
      auth: true,
    })

export const fetchGeneratorPreviewSession = async (
  id: string,
): Promise<GeneratorPreviewSessionDetail> =>
  requestJson<GeneratorPreviewSessionDetail>(
    `/studio/generator/sessions/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createGeneratorPreviewSession = async (
  input: CreateGeneratorPreviewSessionRequest,
): Promise<CreateGeneratorPreviewSessionResponse> =>
  requestJson<CreateGeneratorPreviewSessionResponse>(
    "/studio/generator/sessions/preview",
    {
      method: "POST",
      body: input,
      auth: true,
    },
  )

export const applyGeneratorPreviewSession = async (
  id: string,
): Promise<ApplyGeneratorPreviewSessionResponse> =>
  requestJson<ApplyGeneratorPreviewSessionResponse>(
    `/studio/generator/sessions/${encodeURIComponent(id)}/apply`,
    {
      method: "POST",
      auth: true,
    },
  )

const readWorkflowDefinitionOverrides = () => {
  return (
    globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__?.workflowDefinitions ?? null
  )
}

export const fetchWorkflowDefinitions =
  async (): Promise<WorkflowDefinitionsResponse> => {
    const overrides = readWorkflowDefinitionOverrides()

    if (overrides) {
      return {
        items: overrides,
      }
    }

    return requestJson<WorkflowDefinitionsResponse>("/workflow/definitions", {
      auth: true,
    })
  }

export const fetchWorkflowDefinitionById = async (id: string) => {
  const overrides = readWorkflowDefinitionOverrides()

  if (overrides) {
    const definition = overrides.find(
      (item: WorkflowDefinitionRecord) => item.id === id,
    )

    if (definition) {
      return definition
    }
  }

  return requestJson<WorkflowDefinitionRecord>(`/workflow/definitions/${id}`, {
    auth: true,
  })
}
