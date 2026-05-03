import { departmentModuleSchema, deriveBodySchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import {
  departmentDetailResponseSchema,
  departmentListResponseSchema,
} from "./openapi"
import type { DepartmentRepository } from "./repository"
import { createDepartmentService } from "./service"

export interface DepartmentModuleOptions {
  authGuard?: AuthGuard
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

    return app
      .get(
        "/system/departments",
        async ({ request }) => {
          await authorize(request.headers, departmentPermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          response: {
            200: departmentListResponseSchema,
          },
          detail: {
            tags: ["department"],
            summary: "List departments",
          },
        },
      )
      .get(
        "/system/departments/export",
        async ({ request, set }) => {
          await authorize(request.headers, departmentPermissions.list)

          set.headers["content-type"] = "text/csv; charset=utf-8"
          return service.exportCsv()
        },
        {
          detail: {
            tags: ["department"],
            summary: "Export departments as CSV",
          },
        },
      )
      .get(
        "/system/departments/:id",
        async ({ params, request }) => {
          await authorize(request.headers, departmentPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          response: {
            200: departmentDetailResponseSchema,
          },
          detail: {
            tags: ["department"],
            summary: "Get department by id",
          },
        },
      )
      .post(
        "/system/departments",
        async ({ body, request, set }) => {
          await authorize(request.headers, departmentPermissions.create)
          set.status = 201

          return service.create(body)
        },
        {
          body: departmentCreateBodySchema,
          response: {
            201: departmentDetailResponseSchema,
          },
          detail: {
            tags: ["department"],
            summary: "Create department",
          },
        },
      )
      .put(
        "/system/departments/:id",
        async ({ params, body, request }) => {
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
          },
          detail: {
            tags: ["department"],
            summary: "Update department",
          },
        },
      )
  },
})
