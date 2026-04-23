import { departmentModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
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
          detail: {
            tags: ["department"],
            summary: "List departments",
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
          body: t.Object({
            parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
            code: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            sort: t.Optional(t.Number()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
          }),
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
          body: t.Object({
            parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
            code: t.Optional(t.String({ minLength: 1 })),
            name: t.Optional(t.String({ minLength: 1 })),
            sort: t.Optional(t.Number()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
          }),
          detail: {
            tags: ["department"],
            summary: "Update department",
          },
        },
      )
  },
})
