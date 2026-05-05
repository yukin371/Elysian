import { departmentModuleSchema, deriveBodySchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  departmentDetailResponseSchema,
  departmentListResponseSchema,
} from "./openapi"
import type { DepartmentRepository } from "./repository"
import {
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
  createDepartmentService,
} from "./service"

export interface DepartmentModuleOptions {
  authGuard?: AuthGuard
}

interface DepartmentRouteRegistrar {
  get: (...args: readonly unknown[]) => DepartmentRouteRegistrar
  post: (...args: readonly unknown[]) => DepartmentRouteRegistrar
  put: (...args: readonly unknown[]) => DepartmentRouteRegistrar
}

interface DepartmentRouteParams {
  id: string
}

interface DepartmentRouteSet {
  headers: Record<string, string>
  status: number
}

const departmentPermissions = {
  list: "system:department:list",
  get: "system:department:list",
  create: "system:department:create",
  update: "system:department:update",
} as const

const departmentCreateBodySchema = deriveBodySchema(departmentModuleSchema, {
  mode: "create",
  overrides: {
    parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
    sort: t.Optional(t.Number()),
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
    userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
  },
})

const departmentUpdateBodySchema = deriveBodySchema(departmentModuleSchema, {
  mode: "update",
  overrides: {
    parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
    userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
  },
})

export const createDepartmentModule = (
  repository: DepartmentRepository,
  options: DepartmentModuleOptions = {},
): ServerModule => ({
  name: departmentModuleSchema.name,
  register: (app, context) => {
    const service = createDepartmentService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering department module", {
      fields: departmentModuleSchema.fields.map((field) => field.key),
    })

    let departmentApp = app as unknown as DepartmentRouteRegistrar

    departmentApp = departmentApp.get(
      "/system/departments",
      async ({ request }: { request: Request }) => {
        await authorize(request.headers, departmentPermissions.list)

        return {
          items: await service.list(),
        }
      },
      {
        response: {
          200: departmentListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["department"],
          summary: "List departments",
        },
      },
    )

    departmentApp = departmentApp.get(
      "/system/departments/export",
      async ({
        request,
        set,
      }: { request: Request; set: DepartmentRouteSet }) => {
        await authorize(request.headers, departmentPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["department"],
          summary: "Export departments as CSV",
        },
      },
    )

    departmentApp = departmentApp.get(
      "/system/departments/:id",
      async ({
        params,
        request,
      }: {
        params: DepartmentRouteParams
        request: Request
      }) => {
        await authorize(request.headers, departmentPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: departmentDetailResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["department"],
          summary: "Get department by id",
        },
      },
    )

    departmentApp = departmentApp.post(
      "/system/departments",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateDepartmentPayload
        request: Request
        set: DepartmentRouteSet
      }) => {
        await authorize(request.headers, departmentPermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: departmentCreateBodySchema,
        response: {
          201: departmentDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["department"],
          summary: "Create department",
        },
      },
    )

    departmentApp = departmentApp.put(
      "/system/departments/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: DepartmentRouteParams
        body: UpdateDepartmentPayload
        request: Request
      }) => {
        await authorize(request.headers, departmentPermissions.update)

        return service.update(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: departmentUpdateBodySchema,
        response: {
          200: departmentDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["department"],
          summary: "Update department",
        },
      },
    )

    return departmentApp as unknown as AnyServerApp
  },
})
