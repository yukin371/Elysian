import { computed, ref, watch } from "vue"

import {
  type FrontendTarget,
  getRegisteredSchema,
  listRegisteredSchemaNames,
  renderModuleFiles,
  renderModuleSqlPreview,
} from "../lib/generator-preview-browser"

import {
  filterGeneratorPreviewFiles,
  resolveGeneratorPreviewSelection,
  toGeneratorPreviewFileCard,
} from "../lib/generator-preview-workspace"

export const useGeneratorPreviewWorkspace = (
  t: (key: string, params?: Record<string, unknown>) => string,
) => {
  const availableSchemaNames = listRegisteredSchemaNames()
  const selectedSchemaName = ref(availableSchemaNames[0] ?? "")
  const selectedFrontendTarget = ref<FrontendTarget>("vue")
  const previewQuery = ref("")
  const selectedFilePath = ref<string | null>(null)

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
    selectedSchema.value
      ? renderModuleFiles(selectedSchema.value, {
          frontendTarget: selectedFrontendTarget.value,
        }).map(toGeneratorPreviewFileCard)
      : [],
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

  const sqlPreview = computed(() =>
    selectedSchema.value ? renderModuleSqlPreview(selectedSchema.value) : null,
  )

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

  const resetFilters = () => {
    previewQuery.value = ""
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

  return {
    filterSummary,
    filteredPreviewFiles,
    previewQuery,
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
