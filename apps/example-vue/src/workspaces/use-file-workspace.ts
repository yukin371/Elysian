import { type ComputedRef, type Ref, computed, ref, watch } from "vue"

import {
  type FileWorkspaceQuery,
  createFileTableItems,
  filterFiles,
  formatFileSize,
  resolveFileSelection,
} from "../lib/file-workspace"
import {
  type FileRecord,
  deleteFile,
  downloadFileBlob,
  fetchFileById,
  fetchFiles,
  uploadFile,
} from "../lib/platform-api"

export type FilePanelMode = "detail" | "upload" | "delete"

interface DownloadAnchorLike {
  href: string
  download: string
  style: {
    display: string
  }
  click: () => void
  remove: () => void
}

interface DownloadDocumentLike {
  createElement: (tagName: "a") => DownloadAnchorLike
  body: {
    append: (node: DownloadAnchorLike) => void
  }
}

interface UseFileWorkspaceOptions {
  currentShellTabKey: Ref<string>
  isWorkspaceActive: ComputedRef<boolean>
  locale: Ref<string>
  t: (key: string, params?: Record<string, unknown>) => string
  canView: ComputedRef<boolean>
  canUpload: ComputedRef<boolean>
  canDownload: ComputedRef<boolean>
  canDelete: ComputedRef<boolean>
  onRecoverableAuthError: (error: unknown) => void
}

const resolveDownloadDocument = (): DownloadDocumentLike | null => {
  const runtimeDocument = (
    globalThis as typeof globalThis & {
      document?: DownloadDocumentLike
    }
  ).document

  return runtimeDocument ?? null
}

export const useFileWorkspace = (options: UseFileWorkspaceOptions) => {
  const fileItems = ref<FileRecord[]>([])
  const fileDetail = ref<FileRecord | null>(null)
  const fileLoading = ref(false)
  const fileDetailLoading = ref(false)
  const fileActionLoading = ref(false)
  const fileErrorMessage = ref("")
  const fileDetailErrorMessage = ref("")
  const selectedFileId = ref<string | null>(null)
  const filePanelMode = ref<FilePanelMode>("detail")
  const fileQuery = ref<FileWorkspaceQuery>({})
  const pendingUploadFile = ref<File | null>(null)

  const filteredFileItems = computed(() =>
    filterFiles(fileItems.value, fileQuery.value),
  )

  const selectedFileListItem = computed(
    () =>
      fileItems.value.find((file) => file.id === selectedFileId.value) ?? null,
  )

  const selectedFile = computed(
    () =>
      (fileDetail.value && fileDetail.value.id === selectedFileId.value
        ? fileDetail.value
        : selectedFileListItem.value) ?? null,
  )

  const tableItems = computed(() =>
    createFileTableItems(filteredFileItems.value, {
      formatDateTime: (value) =>
        new Date(value).toLocaleString(options.locale.value),
      mimeTypeEmptyLabel: options.t("app.file.mimeTypeEmpty"),
      uploaderEmptyLabel: options.t("app.file.uploaderEmpty"),
    }),
  )

  const countLabel = computed(() =>
    options.t("app.file.countLabel", {
      visible: filteredFileItems.value.length,
      total: fileItems.value.length,
    }),
  )

  const filterSummary = computed(() => {
    const fragments: string[] = []

    if (fileQuery.value.originalName?.trim()) {
      fragments.push(
        `${options.t("app.file.field.originalName")}: ${fileQuery.value.originalName.trim()}`,
      )
    }

    if (fileQuery.value.mimeType?.trim()) {
      fragments.push(
        `${options.t("app.file.field.mimeType")}: ${fileQuery.value.mimeType.trim()}`,
      )
    }

    if (fileQuery.value.uploaderUserId?.trim()) {
      fragments.push(
        `${options.t("app.file.field.uploaderUserId")}: ${fileQuery.value.uploaderUserId.trim()}`,
      )
    }

    return fragments.length > 0
      ? fragments.join(" / ")
      : options.t("app.filter.none")
  })

  const panelTitle = computed(() => {
    if (filePanelMode.value === "upload") {
      return options.t("app.file.panelTitle.upload")
    }

    if (filePanelMode.value === "delete") {
      return options.t("app.file.panelTitle.delete")
    }

    return (
      selectedFile.value?.originalName ??
      options.t("app.file.panelTitle.detailFallback")
    )
  })

  const panelDescription = computed(() => {
    if (filePanelMode.value === "upload") {
      return options.t("app.file.panelDesc.upload")
    }

    if (filePanelMode.value === "delete") {
      return options.t("app.file.panelDesc.delete")
    }

    return selectedFile.value
      ? options.t("app.file.panelDesc.detail")
      : options.t("app.file.detailEmptyDescription")
  })

  const setUploadPanelWhenAvailable = () => {
    filePanelMode.value = options.canUpload.value ? "upload" : "detail"
  }

  const resetTransientState = () => {
    pendingUploadFile.value = null
    fileErrorMessage.value = ""
    fileDetailErrorMessage.value = ""
  }

  const clearWorkspace = () => {
    fileItems.value = []
    fileDetail.value = null
    selectedFileId.value = null
    fileLoading.value = false
    fileDetailLoading.value = false
    fileActionLoading.value = false
    fileQuery.value = {}
    filePanelMode.value = "detail"
    resetTransientState()
  }

  const selectFile = async (file: FileRecord) => {
    options.currentShellTabKey.value = "workspace"
    selectedFileId.value = file.id
    fileDetail.value = file
    filePanelMode.value = "detail"
    fileDetailLoading.value = true
    fileDetailErrorMessage.value = ""

    try {
      fileDetail.value = await fetchFileById(file.id)
    } catch (error) {
      options.onRecoverableAuthError(error)
      fileDetailErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadFileDetail")
    } finally {
      fileDetailLoading.value = false
    }
  }

  const reloadFiles = async () => {
    if (!options.canView.value) {
      fileItems.value = []
      fileDetail.value = null
      selectedFileId.value = null
      fileLoading.value = false
      fileDetailLoading.value = false
      fileErrorMessage.value = ""
      fileDetailErrorMessage.value = ""

      if (options.canUpload.value) {
        filePanelMode.value = "upload"
      }

      return
    }

    fileLoading.value = true
    fileErrorMessage.value = ""
    fileDetailErrorMessage.value = ""

    try {
      const payload = await fetchFiles()
      fileItems.value = payload.items

      const nextFileId = resolveFileSelection(
        payload.items,
        selectedFileId.value,
      )

      if (!nextFileId) {
        selectedFileId.value = null
        fileDetail.value = null
        setUploadPanelWhenAvailable()
        return
      }

      if (
        filePanelMode.value === "upload" ||
        filePanelMode.value === "delete"
      ) {
        if (!selectedFileId.value) {
          selectedFileId.value = nextFileId
        }

        return
      }

      const nextFile = payload.items.find((item) => item.id === nextFileId)

      if (!nextFile) {
        selectedFileId.value = null
        fileDetail.value = null
        setUploadPanelWhenAvailable()
        return
      }

      if (
        nextFileId === selectedFileId.value &&
        fileDetail.value?.id === nextFileId
      ) {
        return
      }

      await selectFile(nextFile)
    } catch (error) {
      clearWorkspace()
      options.onRecoverableAuthError(error)
      fileErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.loadFiles")
    } finally {
      fileLoading.value = false
    }
  }

  const updateQuery = (query: FileWorkspaceQuery) => {
    fileQuery.value = query
  }

  const resetQuery = () => {
    fileQuery.value = {}
  }

  const openUploadPanel = () => {
    if (!options.canUpload.value) {
      return
    }

    options.currentShellTabKey.value = "workspace"
    pendingUploadFile.value = null
    fileErrorMessage.value = ""
    fileDetailErrorMessage.value = ""
    filePanelMode.value = "upload"
  }

  const setPendingUploadFile = (file: File | null) => {
    pendingUploadFile.value = file
    fileErrorMessage.value = ""
  }

  const cancelPanel = () => {
    fileErrorMessage.value = ""

    if (selectedFile.value) {
      filePanelMode.value = "detail"
      return
    }

    setUploadPanelWhenAvailable()
  }

  const submitUpload = async () => {
    if (!options.canUpload.value || fileActionLoading.value) {
      return
    }

    if (!pendingUploadFile.value) {
      fileErrorMessage.value = options.t("app.error.fileRequired")
      return
    }

    fileActionLoading.value = true
    fileErrorMessage.value = ""

    try {
      const created = await uploadFile(pendingUploadFile.value)
      selectedFileId.value = created.id
      fileDetail.value = created
      pendingUploadFile.value = null
      filePanelMode.value = "detail"
      await reloadFiles()
    } catch (error) {
      options.onRecoverableAuthError(error)
      fileErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.uploadFile")
    } finally {
      fileActionLoading.value = false
    }
  }

  const downloadSelectedFile = async () => {
    if (
      !options.canDownload.value ||
      !selectedFile.value ||
      fileActionLoading.value
    ) {
      return
    }

    fileActionLoading.value = true
    fileErrorMessage.value = ""

    try {
      const blob = await downloadFileBlob(selectedFile.value.id)
      const objectUrl = URL.createObjectURL(blob)
      const runtimeDocument = resolveDownloadDocument()

      if (!runtimeDocument) {
        URL.revokeObjectURL(objectUrl)
        throw new Error("Browser download is unavailable in current runtime")
      }

      const anchor = runtimeDocument.createElement("a")
      anchor.href = objectUrl
      anchor.download = selectedFile.value.originalName
      anchor.style.display = "none"
      runtimeDocument.body.append(anchor)
      anchor.click()
      anchor.remove()
      globalThis.setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
      }, 1000)
    } catch (error) {
      options.onRecoverableAuthError(error)
      fileErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.downloadFile")
    } finally {
      fileActionLoading.value = false
    }
  }

  const openDeletePanel = () => {
    if (!options.canDelete.value || !selectedFile.value) {
      return
    }

    fileErrorMessage.value = ""
    filePanelMode.value = "delete"
  }

  const confirmDelete = async () => {
    if (
      !options.canDelete.value ||
      !selectedFile.value ||
      fileActionLoading.value
    ) {
      return
    }

    fileActionLoading.value = true
    fileErrorMessage.value = ""

    try {
      await deleteFile(selectedFile.value.id)
      selectedFileId.value = null
      fileDetail.value = null
      filePanelMode.value = "detail"
      await reloadFiles()
    } catch (error) {
      options.onRecoverableAuthError(error)
      fileErrorMessage.value =
        error instanceof Error
          ? error.message
          : options.t("app.error.deleteFile")
    } finally {
      fileActionLoading.value = false
    }
  }

  watch(
    filteredFileItems,
    async (items) => {
      if (
        !options.isWorkspaceActive.value ||
        fileLoading.value ||
        filePanelMode.value !== "detail"
      ) {
        return
      }

      const nextFileId = resolveFileSelection(items, selectedFileId.value)

      if (!nextFileId) {
        selectedFileId.value = null
        fileDetail.value = null
        setUploadPanelWhenAvailable()
        return
      }

      const nextFile = items.find((item) => item.id === nextFileId)

      if (!nextFile) {
        selectedFileId.value = null
        fileDetail.value = null
        return
      }

      if (nextFileId === selectedFileId.value) {
        if (!fileDetail.value || fileDetail.value.id !== nextFileId) {
          fileDetail.value = nextFile
        }
        return
      }

      await selectFile(nextFile)
    },
    { immediate: true },
  )

  return {
    cancelPanel,
    clearWorkspace,
    confirmDelete,
    countLabel,
    downloadSelectedFile,
    fileActionLoading,
    fileDetail,
    fileDetailErrorMessage,
    fileDetailLoading,
    fileErrorMessage,
    fileItems,
    fileLoading,
    filePanelMode,
    fileQuery,
    filterSummary,
    filteredFileItems,
    openDeletePanel,
    openUploadPanel,
    panelDescription,
    panelTitle,
    pendingUploadFile,
    reloadFiles,
    resetQuery,
    selectFile,
    selectedFile,
    selectedFileId,
    setPendingUploadFile,
    submitUpload,
    tableItems,
    updateQuery,
  }
}
