import type { FileRecord } from "./platform-api"

export interface FileWorkspaceQuery {
  originalName?: string
  mimeType?: string
  uploaderUserId?: string
}

export interface FileTableItem
  extends Omit<FileRecord, "mimeType" | "uploaderUserId" | "createdAt"> {
  mimeType: string
  uploaderUserId: string
  createdAt: string
  sizeLabel: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const filterFiles = (files: FileRecord[], query: FileWorkspaceQuery) => {
  const originalName = normalizeQueryValue(query.originalName)
  const mimeType = normalizeQueryValue(query.mimeType)
  const uploaderUserId = normalizeQueryValue(query.uploaderUserId)

  return files.filter((file) => {
    if (
      originalName.length > 0 &&
      !file.originalName.toLowerCase().includes(originalName)
    ) {
      return false
    }

    if (
      mimeType.length > 0 &&
      !(file.mimeType ?? "").toLowerCase().includes(mimeType)
    ) {
      return false
    }

    if (
      uploaderUserId.length > 0 &&
      !(file.uploaderUserId ?? "").toLowerCase().includes(uploaderUserId)
    ) {
      return false
    }

    return true
  })
}

export const resolveFileSelection = (
  files: Array<Pick<FileRecord, "id">>,
  selectedFileId: string | null,
) => {
  if (files.length === 0) {
    return null
  }

  if (selectedFileId && files.some((file) => file.id === selectedFileId)) {
    return selectedFileId
  }

  return files[0]?.id ?? null
}

export const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`
}

export const createFileTableItems = (
  files: FileRecord[],
  options: {
    formatDateTime: (value: string) => string
    mimeTypeEmptyLabel: string
    uploaderEmptyLabel: string
  },
): FileTableItem[] =>
  files.map((file) => ({
    ...file,
    mimeType: file.mimeType?.trim() || options.mimeTypeEmptyLabel,
    uploaderUserId: file.uploaderUserId?.trim() || options.uploaderEmptyLabel,
    createdAt: options.formatDateTime(file.createdAt),
    sizeLabel: formatFileSize(file.size),
  }))
