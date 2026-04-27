import type { WorkflowDefinitionRecord } from "@elysian/schema"

import type { WorkflowStatusFilter } from "../../../lib/workflow-workspace"

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

export interface WorkflowDefinitionDetailCard {
  id: string
  name: string
  typeLabel: string
  description: string
}

export type { WorkflowStatusFilter }
