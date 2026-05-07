import type { WorkflowDefinitionRecord } from "@elysian/schema"

export type WorkflowTranslation = (
  key: string,
  params?: Record<string, unknown>,
) => string

export interface WorkflowDefinitionCard extends WorkflowDefinitionRecord {
  updatedAtLabel: string
  statusLabel: string
  nodeCount: number
  edgeCount: number
}
