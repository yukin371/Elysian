import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateMenuInput,
  OpenApiMenuDetailRecord,
  OpenApiMenuRecord,
  OpenApiMenusResponse,
  OpenApiUpdateMenuInput,
} from "./generated-types"

export type MenuRecord = OpenApiMenuRecord
export type MenuDetailRecord = OpenApiMenuDetailRecord
export type MenusResponse = OpenApiMenusResponse
export type CreateMenuRequest = OpenApiCreateMenuInput
export type UpdateMenuRequest = OpenApiUpdateMenuInput

export const fetchMenus = async (): Promise<MenusResponse> =>
  requestJson<MenusResponse>("/system/menus", {
    auth: true,
  })

export const exportMenusCsv = async (): Promise<Blob> =>
  requestBlob("/system/menus/export", {
    auth: true,
  })

export const fetchMenuById = async (id: string): Promise<MenuDetailRecord> =>
  requestJson<MenuDetailRecord>(`/system/menus/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createMenu = async (
  input: CreateMenuRequest,
): Promise<MenuDetailRecord> =>
  requestJson<MenuDetailRecord>("/system/menus", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateMenu = async (
  id: string,
  input: UpdateMenuRequest,
): Promise<MenuDetailRecord> =>
  requestJson<MenuDetailRecord>(`/system/menus/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })
