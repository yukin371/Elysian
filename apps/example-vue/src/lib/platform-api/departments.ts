import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateDepartmentInput,
  OpenApiDepartmentDetailRecord,
  OpenApiDepartmentRecord,
  OpenApiDepartmentsResponse,
  OpenApiUpdateDepartmentInput,
} from "./generated-types"

export type DepartmentRecord = OpenApiDepartmentRecord
export type DepartmentDetailRecord = OpenApiDepartmentDetailRecord
export type DepartmentsResponse = OpenApiDepartmentsResponse
export type CreateDepartmentRequest = OpenApiCreateDepartmentInput
export type UpdateDepartmentRequest = OpenApiUpdateDepartmentInput

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
