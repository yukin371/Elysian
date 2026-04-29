import { requestJson } from "./core"

export interface MenuRecord {
  id: string
  parentId: string | null
  type: "directory" | "menu" | "button"
  code: string
  name: string
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  isVisible: boolean
  status: "active" | "disabled"
  permissionCode: string | null
  createdAt: string
  updatedAt: string
}

export interface MenuDetailRecord extends MenuRecord {
  roleIds: string[]
}

export interface MenusResponse {
  items: MenuRecord[]
}

export interface CreateMenuRequest {
  parentId?: string | null
  type: MenuRecord["type"]
  code: string
  name: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: MenuRecord["status"]
  permissionCode?: string | null
}

export interface UpdateMenuRequest {
  parentId?: string | null
  type?: MenuRecord["type"]
  code?: string
  name?: string
  path?: string | null
  component?: string | null
  icon?: string | null
  sort?: number
  isVisible?: boolean
  status?: MenuRecord["status"]
  permissionCode?: string | null
}

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
