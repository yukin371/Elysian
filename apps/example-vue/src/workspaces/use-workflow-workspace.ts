import type { WorkflowDefinitionRecord } from "@elysian/schema"
import { type ComputedRef, type Ref, computed, ref } from "vue"

import {
  type WorkflowDefinitionListQuery,
  fetchWorkflowDefinitionById,
  fetchWorkflowDefinitions,
} from "../lib/platform-api"

interface WorkflowDefinitionCard extends WorkflowDefinitionRecord {
  updatedAtLabel: string
  statusLabel: string
  nodeCount: number
  edgeCount: number
}

interface UseWorkflowWorkspaceOptions {
  currentShellTabKey: Ref<string>
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  localizeStatus: (status: WorkflowDefinitionRecord["status"]) => string
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

  const resetWorkflowFilters = async () => {
    workflowQuery.value = ""
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
    goToNextWorkflowPage,
    goToPreviousWorkflowPage,
    handleWorkflowDefinitionSelect,
    reloadWorkflowDefinitions,
    resetWorkflowFilters,
    selectWorkflowDefinition,
    selectedWorkflowDefinition,
    selectedWorkflowDefinitionId,
    setWorkflowQuery,
    workflowCanGoToNextPage,
    workflowCanGoToPreviousPage,
    workflowDefinitionCards,
    workflowDefinitionDetail,
    workflowDefinitions,
    workflowDetailErrorMessage,
    workflowDetailDialogOpen,
    workflowDetailLoading,
    workflowErrorMessage,
    workflowLoading,
    workflowPage,
    workflowPageSize,
    workflowPaginationSummary,
    workflowQuery,
    workflowTotal,
    workflowTotalPages,
  }
}
