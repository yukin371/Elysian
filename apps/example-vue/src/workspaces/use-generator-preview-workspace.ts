import { computed, ref, watch, type Ref } from "vue"

import {
  getRegisteredSchema,
  listRegisteredSchemaNames,
  type FrontendTarget,
} from "../lib/generator-preview-browser"
import {
  applyGeneratorPreviewSession,
  createGeneratorPreviewSession,
  type GeneratorPreviewDiffSummary,
  type GeneratorPreviewReport,
  type GeneratorPreviewSessionRecord,
} from "../lib/platform-api"

import {
  filterGeneratorPreviewFiles,
  resolveGeneratorPreviewSelection,
  toGeneratorPreviewFileCard,
} from "../lib/generator-preview-workspace"

export const useGeneratorPreviewWorkspace = (
  t: (key: string, params?: Record<string, unknown>) => string,
  enabled: Readonly<Ref<boolean>>,
) => {
  const availableSchemaNames = listRegisteredSchemaNames()
  const selectedSchemaName = ref(availableSchemaNames[0] ?? "")
  const selectedFrontendTarget = ref<FrontendTarget>("vue")
  const previewQuery = ref("")
  const selectedFilePath = ref<string | null>(null)
  const loading = ref(false)
  const applyLoading = ref(false)
  const errorMessage = ref("")
  const currentSession = ref<GeneratorPreviewSessionRecord | null>(null)
  const currentDiffSummary = ref<GeneratorPreviewDiffSummary | null>(null)
  const currentReport = ref<GeneratorPreviewReport | null>(null)
  let latestPreviewRequestId = 0

  const schemaOptions = computed(() =>
    availableSchemaNames
      .map((name) => {
        const schema = getRegisteredSchema(name)

        if (!schema) {
          return null
        }

        return {
          label: `${schema.label} (${schema.name})`,
          value: schema.name,
        }
      })
      .filter(
        (item): item is { label: string; value: string } => item !== null,
      ),
  )

  const selectedSchema = computed(() =>
    selectedSchemaName.value
      ? getRegisteredSchema(selectedSchemaName.value)
      : null,
  )

  const previewFiles = computed(() =>
    currentReport.value?.files.map(toGeneratorPreviewFileCard) ?? [],
  )

  const filteredPreviewFiles = computed(() =>
    filterGeneratorPreviewFiles(previewFiles.value, previewQuery.value),
  )

  const selectedPreviewFile = computed(
    () =>
      filteredPreviewFiles.value.find(
        (file) => file.path === selectedFilePath.value,
      ) ?? null,
  )

  const sqlPreview = computed(() => currentReport.value?.sqlPreview ?? null)

  const filterSummary = computed(() => {
    const fragments = [
      t("app.generatorPreview.filter.schemaSummary", {
        value: selectedSchema.value?.name ?? "-",
      }),
      t("app.generatorPreview.filter.frontendSummary", {
        value: selectedFrontendTarget.value,
      }),
    ]

    if (previewQuery.value.trim().length > 0) {
      fragments.push(
        t("app.generatorPreview.filter.querySummary", {
          value: previewQuery.value.trim(),
        }),
      )
    }

    return fragments.join(" / ")
  })

  const canApplyPreview = computed(
    () =>
      currentSession.value !== null &&
      currentSession.value.status === "ready" &&
      !currentSession.value.hasBlockingConflicts &&
      !loading.value &&
      !applyLoading.value,
  )

  const resetFilters = () => {
    previewQuery.value = ""
  }

  const resetPreviewState = () => {
    currentSession.value = null
    currentDiffSummary.value = null
    currentReport.value = null
  }

  const refreshPreview = async () => {
    if (!enabled.value || !selectedSchemaName.value) {
      return
    }

    const requestId = latestPreviewRequestId + 1
    latestPreviewRequestId = requestId
    loading.value = true
    errorMessage.value = ""

    try {
      const response = await createGeneratorPreviewSession({
        schemaName: selectedSchemaName.value,
        frontendTarget: selectedFrontendTarget.value,
        targetPreset: "staging",
      })

      if (requestId !== latestPreviewRequestId) {
        return
      }

      currentSession.value = response.session
      currentDiffSummary.value = response.diff
      currentReport.value = response.report
    } catch (error) {
      if (requestId !== latestPreviewRequestId) {
        return
      }

      resetPreviewState()
      errorMessage.value =
        error instanceof Error ? error.message : "Generator preview failed"
    } finally {
      if (requestId === latestPreviewRequestId) {
        loading.value = false
      }
    }
  }

  const applyPreview = async () => {
    const sessionId = currentSession.value?.id
    if (!sessionId || !canApplyPreview.value) {
      return
    }

    applyLoading.value = true
    errorMessage.value = ""

    try {
      const response = await applyGeneratorPreviewSession(sessionId)
      currentSession.value = response.session
      currentDiffSummary.value = response.diff
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : "Generator apply failed"
    } finally {
      applyLoading.value = false
    }
  }

  watch(
    filteredPreviewFiles,
    (files) => {
      selectedFilePath.value = resolveGeneratorPreviewSelection(
        files,
        selectedFilePath.value,
      )
    },
    { immediate: true },
  )

  watch(selectedSchemaName, () => {
    resetFilters()
  })

  watch(
    [selectedSchemaName, selectedFrontendTarget, enabled],
    ([, , nextEnabled]) => {
      if (!nextEnabled) {
        return
      }

      void refreshPreview()
    },
    { immediate: true },
  )

  return {
    applyLoading,
    applyPreview,
    canApplyPreview,
    currentDiffSummary,
    currentSession,
    errorMessage,
    filterSummary,
    filteredPreviewFiles,
    loading,
    previewQuery,
    refreshPreview,
    resetFilters,
    schemaOptions,
    selectedFilePath,
    selectedFrontendTarget,
    selectedPreviewFile,
    selectedSchema,
    selectedSchemaName,
    sqlPreview,
  }
}
