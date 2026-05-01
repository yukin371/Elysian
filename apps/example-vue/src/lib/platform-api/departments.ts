import { requestBlob, requestJson } from "./core"
import type { DepartmentDetailRecord, DepartmentRecord } from "./types"
export type { DepartmentDetailRecord, DepartmentRecord } from "./types"

export interface DepartmentsResponse {
  items: DepartmentRecord[]
}

export interface CreateDepartmentRequest {
  parentId?: string | null
  code: string
  name: string
  sort?: number
  status?: DepartmentRecord["status"]
}

export interface UpdateDepartmentRequest {
  parentId?: string | null
  code?: string
  name?: string
  sort?: number
  status?: DepartmentRecord["status"]
}

export const fetchDepartments = async (): Promise<DepartmentsResponse> =>
  requestJson<DepartmentsResponse>("/system/departments", {
    auth: true,
  })

export const exportDepartmentsCsv = async (): Promise<Blob> =>
  requestBlob("/system/departments/export", {
    auth: true,
  })

export const fetchDepartmentById = async (
  id: string,
): Promise<DepartmentDetailRecord> =>
  requestJson<DepartmentDetailRecord>(
    `/system/departments/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createDepartment = async (
  input: CreateDepartmentRequest,
): Promise<DepartmentDetailRecord> =>
  requestJson<DepartmentDetailRecord>("/system/departments", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateDepartment = async (
  id: string,
  input: UpdateDepartmentRequest,
): Promise<DepartmentDetailRecord> =>
  requestJson<DepartmentDetailRecord>(
    `/system/departments/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: input,
      auth: true,
    },
  )
