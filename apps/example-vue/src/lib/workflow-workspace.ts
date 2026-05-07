import type { WorkflowDefinitionRecord } from "@elysian/schema"

const normalizeWorkflowQuery = (query: string) => query.trim().toLowerCase()

export const filterWorkflowDefinitions = (
  definitions: WorkflowDefinitionRecord[],
  query: string,
) => {
  const normalizedQuery = normalizeWorkflowQuery(query)

  return definitions.filter((definition) => {
    return (
      normalizedQuery.length === 0 ||
      definition.name.toLowerCase().includes(normalizedQuery) ||
      definition.key.toLowerCase().includes(normalizedQuery) ||
      definition.id.toLowerCase().includes(normalizedQuery)
    )
  })
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
