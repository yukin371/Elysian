import type { WorkflowDefinitionRecord } from "@elysian/schema"

export type WorkflowStatusFilter = "all" | WorkflowDefinitionRecord["status"]

const normalizeWorkflowQuery = (query: string) => query.trim().toLowerCase()

export const filterWorkflowDefinitions = (
  definitions: WorkflowDefinitionRecord[],
  query: string,
  statusFilter: WorkflowStatusFilter,
) => {
  const normalizedQuery = normalizeWorkflowQuery(query)

  return definitions.filter((definition) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      definition.name.toLowerCase().includes(normalizedQuery) ||
      definition.key.toLowerCase().includes(normalizedQuery) ||
      definition.id.toLowerCase().includes(normalizedQuery)

    const matchesStatus =
      statusFilter === "all" || definition.status === statusFilter

    return matchesQuery && matchesStatus
  })
}

export const listWorkflowDefinitionVersions = (
  definitions: WorkflowDefinitionRecord[],
  definitionKey: string | null | undefined,
) => {
  if (!definitionKey) {
    return []
  }

  return definitions
    .filter((definition) => definition.key === definitionKey)
    .sort((left, right) => right.version - left.version)
}

export const resolveWorkflowDefinitionSelection = (
  definitions: Array<Pick<WorkflowDefinitionRecord, "id">>,
  selectedDefinitionId: string | null,
) => {
  if (definitions.length === 0) {
    return null
  }

  if (
    selectedDefinitionId &&
    definitions.some((definition) => definition.id === selectedDefinitionId)
  ) {
    return selectedDefinitionId
  }

  return definitions[0]?.id ?? null
}
