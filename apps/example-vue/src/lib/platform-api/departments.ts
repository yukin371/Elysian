import { requestJson } from "./core"
import type {
  CreateDepartmentRequest,
  DepartmentDetailRecord,
  DepartmentsResponse,
  UpdateDepartmentRequest,
} from "../platform-api"

export const fetchDepartments = async (): Promise<DepartmentsResponse> =>
  requestJson<DepartmentsResponse>("/system/departments", {
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
