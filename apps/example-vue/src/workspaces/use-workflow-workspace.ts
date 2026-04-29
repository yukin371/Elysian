import type { WorkflowDefinitionRecord, WorkflowNode } from "@elysian/schema"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  fetchWorkflowDefinitionById,
  fetchWorkflowDefinitions,
} from "../lib/platform-api"
import {
  type WorkflowStatusFilter,
  filterWorkflowDefinitions,
  listWorkflowDefinitionVersions,
} from "../lib/workflow-workspace"

interface WorkflowDefinitionCard extends WorkflowDefinitionRecord {
  updatedAtLabel: string
  statusLabel: string
  nodeCount: number
  edgeCount: number
}

interface WorkflowDefinitionDetailCard {
  id: string
  name: string
  typeLabel: string
  description: string
}

interface UseWorkflowWorkspaceOptions {
  currentShellTabKey: Ref<string>
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeStatus: (status: WorkflowDefinitionRecord["status"]) => string
  localizeNodeType: (type: WorkflowNode["type"]) => string
  describeNode: (node: WorkflowNode) => string
  canView: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

export const useWorkflowWorkspace = (options: UseWorkflowWorkspaceOptions) => {
  const workflowDefinitions = ref<WorkflowDefinitionRecord[]>([])
  const workflowLoading = ref(false)
  const workflowDetailLoading = ref(false)
  const workflowErrorMessage = ref("")
  const workflowDetailErrorMessage = ref("")
  const selectedWorkflowDefinitionId = ref<string | null>(null)
  const workflowDefinitionDetail = ref<WorkflowDefinitionRecord | null>(null)
  const workflowQuery = ref("")
  const workflowStatusFilter = ref<WorkflowStatusFilter>("all")

  const selectedWorkflowListItem = computed(
    () =>
      workflowDefinitions.value.find(
        (definition: WorkflowDefinitionRecord) =>
          definition.id === selectedWorkflowDefinitionId.value,
      ) ?? null,
  )

  const selectedWorkflowDefinition = computed(
    () => workflowDefinitionDetail.value ?? selectedWorkflowListItem.value,
  )

  const filteredWorkflowDefinitions = computed(() =>
    filterWorkflowDefinitions(
      workflowDefinitions.value,
      workflowQuery.value,
      workflowStatusFilter.value,
    ),
  )

  const workflowDefinitionCards = computed<WorkflowDefinitionCard[]>(() =>
    filteredWorkflowDefinitions.value.map((definition) => ({
      ...definition,
      updatedAtLabel: new Date(definition.updatedAt).toLocaleString(
        options.locale.value,
      ),
      statusLabel: options.localizeStatus(definition.status),
      nodeCount: definition.definition.nodes.length,
      edgeCount: definition.definition.edges.length,
    })),
  )

  const workflowDefinitionDetailCards = computed<
    WorkflowDefinitionDetailCard[]
  >(
    () =>
      selectedWorkflowDefinition.value?.definition.nodes.map(
        (node: WorkflowNode) => ({
          id: node.id,
          name: node.name,
          typeLabel: options.localizeNodeType(node.type),
          description: options.describeNode(node),
        }),
      ) ?? [],
  )

  const workflowVersionHistoryCards = computed<WorkflowDefinitionCard[]>(() =>
    listWorkflowDefinitionVersions(
      workflowDefinitions.value,
      selectedWorkflowDefinition.value?.key,
    ).map((definition) => ({
      ...definition,
      updatedAtLabel: new Date(definition.updatedAt).toLocaleString(
        options.locale.value,
      ),
      statusLabel: options.localizeStatus(definition.status),
      nodeCount: definition.definition.nodes.length,
      edgeCount: definition.definition.edges.length,
    })),
  )

  const workflowFilterSummary = computed(() => {
    const fragments: string[] = []

    if (workflowQuery.value.trim().length > 0) {
      fragments.push(
        options.t("app.workflow.filter.querySummary", {
          value: workflowQuery.value.trim(),
        }),
      )
    }

    if (workflowStatusFilter.value !== "all") {
      fragments.push(
        options.t("app.workflow.filter.statusSummary", {
          value: options.localizeStatus(workflowStatusFilter.value),
        }),
      )
    }

    return fragments.length > 0
      ? fragments.join(" / ")
      : options.t("app.workflow.filter.none")
  })

  const clearWorkflowDefinitions = () => {
    workflowDefinitions.value = []
    selectedWorkflowDefinitionId.value = null
    workflowDefinitionDetail.value = null
    workflowDetailErrorMessage.value = ""
  }

  const selectWorkflowDefinition = async (
    definition: WorkflowDefinitionRecord,
  ) => {
    options.currentShellTabKey.value = "workspace"
    selectedWorkflowDefinitionId.value = definition.id
    workflowDefinitionDetail.value = definition
    workflowDetailLoading.value = true
    workflowDetailErrorMessage.value = ""

    try {
      workflowDefinitionDetail.value = await fetchWorkflowDefinitionById(
        definition.id,
      )
    } catch (error) {
      options.onRecoverableAuthError(error)
      workflowDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadWorkflowDefinitions")
    } finally {
      workflowDetailLoading.value = false
    }
  }

  const reloadWorkflowDefinitions = async () => {
    if (!options.canView.value) {
      clearWorkflowDefinitions()
      return
    }

    workflowLoading.value = true
    workflowErrorMessage.value = ""
    workflowDetailErrorMessage.value = ""

    try {
      const payload = await fetchWorkflowDefinitions()
      workflowDefinitions.value = payload.items

      if (payload.items.length === 0) {
        selectedWorkflowDefinitionId.value = null
        workflowDefinitionDetail.value = null
        return
      }

      const nextDefinition =
        payload.items.find(
          (definition) => definition.id === selectedWorkflowDefinitionId.value,
        ) ?? payload.items[0]

      if (nextDefinition) {
        await selectWorkflowDefinition(nextDefinition)
      }
    } catch (error) {
      options.onRecoverableAuthError(error)
      clearWorkflowDefinitions()
      workflowErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadWorkflowDefinitions")
    } finally {
      workflowLoading.value = false
    }
  }

  const handleWorkflowDefinitionSelect = async (definitionId: string) => {
    const definition = workflowDefinitions.value.find(
      (item: WorkflowDefinitionRecord) => item.id === definitionId,
    )

    if (!definition || workflowDetailLoading.value) {
      return
    }

    await selectWorkflowDefinition(definition)
  }

  const setWorkflowStatusFilter = (filter: WorkflowStatusFilter) => {
    workflowStatusFilter.value = filter
  }

  const resetWorkflowFilters = () => {
    workflowQuery.value = ""
    workflowStatusFilter.value = "all"
  }

  return {
    clearWorkflowDefinitions,
    filteredWorkflowDefinitions,
    handleWorkflowDefinitionSelect,
    reloadWorkflowDefinitions,
    resetWorkflowFilters,
    selectWorkflowDefinition,
    selectedWorkflowDefinition,
    selectedWorkflowDefinitionId,
    setWorkflowStatusFilter,
    workflowDefinitionCards,
    workflowDefinitionDetail,
    workflowDefinitionDetailCards,
    workflowDefinitions,
    workflowDetailErrorMessage,
    workflowDetailLoading,
    workflowErrorMessage,
    workflowFilterSummary,
    workflowLoading,
    workflowQuery,
    workflowStatusFilter,
    workflowVersionHistoryCards,
  }
}
