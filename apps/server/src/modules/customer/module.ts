import { customerModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { CustomerRepository, UpdateCustomerInput } from "./repository"
import { createCustomerService } from "./service"

export interface CustomerModuleOptions {
  authGuard?: AuthGuard
}

const customerPermissions = {
  list: "customer:customer:list",
  get: "customer:customer:list",
  create: "customer:customer:create",
  update: "customer:customer:update",
  delete: "customer:customer:delete",
} as const

export const createCustomerModule = (
  repository: CustomerRepository,
  options: CustomerModuleOptions = {},
): ServerModule => ({
  name: customerModuleSchema.name,
  register: (app, context) => {
    const service = createCustomerService(repository)
    const authorize = async (
      headers: Headers,
      permissionCode: string,
    ): Promise<AuthIdentity | undefined> => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering customer module", {
      fields: customerModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/customers",
        async ({ query, request }) => {
          const identity = await authorize(
            request.headers,
            customerPermissions.list,
          )

          return service.list(query, identity?.dataAccess)
        },
        {
          query: t.Object({
            q: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("inactive")]),
            ),
            page: t.Optional(t.Numeric()),
            pageSize: t.Optional(t.Numeric()),
            sortBy: t.Optional(
              t.Union([t.Literal("createdAt"), t.Literal("name")]),
            ),
            sortOrder: t.Optional(
              t.Union([t.Literal("asc"), t.Literal("desc")]),
            ),
          }),
          detail: {
            tags: ["customer"],
            summary: "List customers",
          },
        },
      )
      .get(
        "/customers/:id",
        async ({ params, request }) => {
          const identity = await authorize(
            request.headers,
            customerPermissions.get,
          )

          return service.getById(params.id, identity?.dataAccess)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["customer"],
            summary: "Get customer by id",
          },
        },
      )
      .post(
        "/customers",
        async ({ body, request, set }) => {
          const identity = await authorize(
            request.headers,
            customerPermissions.create,
          )
          set.status = 201
          return service.create({
            ...body,
            deptId: identity?.deptIds[0] ?? null,
            creatorId: identity?.user.id ?? null,
            tenantId: identity?.user.tenantId,
          })
        },
        {
          body: t.Object({
            name: t.String({ minLength: 1 }),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("inactive")]),
            ),
          }),
          detail: {
            tags: ["customer"],
            summary: "Create customer",
          },
        },
      )
      .put(
        "/customers/:id",
        async ({ params, body, request }) => {
          const identity = await authorize(
            request.headers,
            customerPermissions.update,
          )

          return service.update(params.id, body, identity?.dataAccess)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("inactive")]),
            ),
          }),
          detail: {
            tags: ["customer"],
            summary: "Update customer",
          },
        },
      )
      .delete(
        "/customers/:id",
        async ({ params, request, set }) => {
          const identity = await authorize(
            request.headers,
            customerPermissions.delete,
          )

          await service.remove(params.id, identity?.dataAccess)
          set.status = 204
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["customer"],
            summary: "Delete customer",
          },
        },
      )
  },
})
