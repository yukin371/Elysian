import { requestBlob, requestJson } from "./core"
import type { FileRecord, FilesResponse } from "../platform-api"

export const fetchFiles = async (): Promise<FilesResponse> =>
  requestJson<FilesResponse>("/system/files", {
    auth: true,
  })

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
