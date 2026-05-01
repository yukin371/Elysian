import { requestBlob, requestJson } from "./core"
import type { FileRecord } from "./types"
export type { FileRecord } from "./types"

export interface FileListResponse {
  items: FileRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FilesResponse {
  items: FileRecord[]
}

export interface FileListQuery {
  originalName?: string
  mimeType?: string
  uploaderUserId?: string
  page?: number
  pageSize?: number
}

const buildFileSearch = (query: FileListQuery = {}) => {
  const search = new URLSearchParams()

  if (query.originalName?.trim()) {
    search.set("originalName", query.originalName.trim())
  }

  if (query.mimeType?.trim()) {
    search.set("mimeType", query.mimeType.trim())
  }

  if (query.uploaderUserId?.trim()) {
    search.set("uploaderUserId", query.uploaderUserId.trim())
  }

  if (typeof query.page === "number" && Number.isFinite(query.page)) {
    search.set("page", String(Math.trunc(query.page)))
  }

  if (typeof query.pageSize === "number" && Number.isFinite(query.pageSize)) {
    search.set("pageSize", String(Math.trunc(query.pageSize)))
  }

  return search
}

export const fetchFiles = async (
  query: FileListQuery = {},
): Promise<FileListResponse> => {
  const search = buildFileSearch(query)

  return requestJson<FileListResponse>(
    `/system/files${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const exportFilesCsv = async (
  query: FileListQuery = {},
): Promise<Blob> => {
  const search = buildFileSearch(query)

  return requestBlob(
    `/system/files/export${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const fetchFileById = async (id: string): Promise<FileRecord> =>
  requestJson<FileRecord>(`/system/files/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const uploadFile = async (file: File): Promise<FileRecord> => {
  const formData = new FormData()
  formData.set("file", file, file.name)

  return requestJson<FileRecord>("/system/files", {
    method: "POST",
    body: formData,
    bodyType: "form-data",
    auth: true,
  })
}

export const downloadFileBlob = async (id: string): Promise<Blob> =>
  requestBlob(`/system/files/${encodeURIComponent(id)}/download`, {
    auth: true,
  })

export const deleteFile = async (id: string): Promise<void> =>
  requestJson<void>(`/system/files/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  })

export const deleteFiles = async (ids: string[]): Promise<FilesResponse> =>
  requestJson<FilesResponse>("/system/files/delete", {
    method: "POST",
    body: { ids },
    auth: true,
  })
