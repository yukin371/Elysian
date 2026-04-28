import { requestJson } from "./core"
import type {
  CreateMenuRequest,
  MenuDetailRecord,
  MenusResponse,
  UpdateMenuRequest,
} from "../platform-api"

export const fetchMenus = async (): Promise<MenusResponse> =>
  requestJson<MenusResponse>("/system/menus", {
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
