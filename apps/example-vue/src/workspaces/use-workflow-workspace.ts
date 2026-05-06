import type { WorkflowDefinitionRecord, WorkflowNode } from "@elysian/schema"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type WorkflowDefinitionListQuery,
  fetchWorkflowDefinitionById,
  fetchWorkflowDefinitions,
} from "../lib/platform-api"
import {
  type WorkflowStatusFilter,
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
  const workflowDetailDialogOpen = ref(false)
  const workflowQuery = ref("")
  const workflowStatusFilter = ref<WorkflowStatusFilter>("all")
  const workflowPage = ref(1)
  const workflowPageSize = ref(20)
  const workflowTotal = ref(0)
  const workflowTotalPages = ref(1)

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

  const filteredWorkflowDefinitions = computed(() => workflowDefinitions.value)

  const workflowVisibleDefinitionCards = computed<WorkflowDefinitionCard[]>(
    () => workflowDefinitionCards.value,
  )

  const workflowCanGoToPreviousPage = computed(() => workflowPage.value > 1)
  const workflowCanGoToNextPage = computed(
    () => workflowPage.value < workflowTotalPages.value,
  )
  const workflowPaginationSummary = computed(() => {
    if (workflowTotal.value === 0) {
      return options.t("app.workflow.pagination.empty")
    }

    const start = (workflowPage.value - 1) * workflowPageSize.value + 1
    const end = Math.min(
      workflowPage.value * workflowPageSize.value,
      workflowTotal.value,
    )

    return options.t("app.workflow.pagination.summary", {
      start,
      end,
      total: workflowTotal.value,
      page: workflowPage.value,
      totalPages: workflowTotalPages.value,
    })
  })

  const workflowDefinitionCards = computed<WorkflowDefinitionCard[]>(() =>
    workflowDefinitions.value.map(
      (definition: WorkflowDefinitionRecord): WorkflowDefinitionCard => ({
        ...definition,
        updatedAtLabel: new Date(definition.updatedAt).toLocaleString(
          options.locale.value,
        ),
        statusLabel: options.localizeStatus(definition.status),
        nodeCount: definition.definition.nodes.length,
        edgeCount: definition.definition.edges.length,
      }),
    ),
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
    workflowPage.value = 1
    workflowTotal.value = 0
    workflowTotalPages.value = 1
    selectedWorkflowDefinitionId.value = null
    workflowDefinitionDetail.value = null
    workflowDetailDialogOpen.value = false
    workflowDetailErrorMessage.value = ""
  }

  const selectWorkflowDefinition = async (
    definition: WorkflowDefinitionRecord,
    optionsOverride: { openDetail?: boolean } = {},
  ) => {
    options.currentShellTabKey.value = "workspace"
    selectedWorkflowDefinitionId.value = definition.id
    workflowDefinitionDetail.value = definition
    workflowDetailDialogOpen.value = optionsOverride.openDetail ?? false
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
      const payload = await fetchWorkflowDefinitions(
        buildWorkflowDefinitionListQuery(),
      )
      workflowDefinitions.value = payload.items
      workflowPage.value = payload.page
      workflowPageSize.value = payload.pageSize
      workflowTotal.value = payload.total
      workflowTotalPages.value = payload.totalPages

      if (payload.items.length === 0) {
        selectedWorkflowDefinitionId.value = null
        workflowDefinitionDetail.value = null
        workflowDetailDialogOpen.value = false
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

    await selectWorkflowDefinition(definition, { openDetail: true })
  }

  const closeWorkflowDefinitionDetail = () => {
    workflowDetailDialogOpen.value = false
  }

  const setWorkflowQuery = async (query: string) => {
    workflowQuery.value = query
    workflowPage.value = 1
    await reloadWorkflowDefinitions()
  }

  const setWorkflowStatusFilter = async (filter: WorkflowStatusFilter) => {
    workflowStatusFilter.value = filter
    workflowPage.value = 1
    await reloadWorkflowDefinitions()
  }

  const resetWorkflowFilters = async () => {
    workflowQuery.value = ""
    workflowStatusFilter.value = "all"
    workflowPage.value = 1
    await reloadWorkflowDefinitions()
  }

  const goToPreviousWorkflowPage = async () => {
    if (!workflowCanGoToPreviousPage.value) {
      return
    }

    workflowPage.value -= 1
    await reloadWorkflowDefinitions()
  }

  const goToNextWorkflowPage = async () => {
    if (!workflowCanGoToNextPage.value) {
      return
    }

    workflowPage.value += 1
    await reloadWorkflowDefinitions()
  }

  const buildWorkflowDefinitionListQuery = (): WorkflowDefinitionListQuery => ({
    q: workflowQuery.value,
    status:
      workflowStatusFilter.value === "all"
        ? undefined
        : workflowStatusFilter.value,
    page: workflowPage.value,
    pageSize: workflowPageSize.value,
  })

  const changeWorkflowPageSize = async (pageSize: number) => {
    workflowPageSize.value = pageSize
    workflowPage.value = 1
    await reloadWorkflowDefinitions()
  }

  return {
    changeWorkflowPageSize,
    clearWorkflowDefinitions,
    closeWorkflowDefinitionDetail,
    filteredWorkflowDefinitions,
    goToNextWorkflowPage,
    goToPreviousWorkflowPage,
    handleWorkflowDefinitionSelect,
    reloadWorkflowDefinitions,
    resetWorkflowFilters,
    selectWorkflowDefinition,
    selectedWorkflowDefinition,
    selectedWorkflowDefinitionId,
    setWorkflowQuery,
    setWorkflowStatusFilter,
    workflowCanGoToNextPage,
    workflowCanGoToPreviousPage,
    workflowDefinitionCards,
    workflowDefinitionDetail,
    workflowDefinitionDetailCards,
    workflowDefinitions,
    workflowDetailErrorMessage,
    workflowDetailDialogOpen,
    workflowDetailLoading,
    workflowErrorMessage,
    workflowFilterSummary,
    workflowLoading,
    workflowPage,
    workflowPageSize,
    workflowPaginationSummary,
    workflowQuery,
    workflowStatusFilter,
    workflowTotal,
    workflowTotalPages,
    workflowVisibleDefinitionCards,
    workflowVersionHistoryCards,
  }
}
