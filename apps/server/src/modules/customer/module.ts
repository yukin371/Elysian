import { customerModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth/guard"
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
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering customer module", {
      fields: customerModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/customers",
        async ({ request }) => {
          await authorize(request.headers, customerPermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          detail: {
            tags: ["customer"],
            summary: "List customers",
          },
        },
      )
      .get(
        "/customers/:id",
        async ({ params, request }) => {
          await authorize(request.headers, customerPermissions.get)

          return service.getById(params.id)
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
          await authorize(request.headers, customerPermissions.create)
          set.status = 201
          return service.create(body)
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
          await authorize(request.headers, customerPermissions.update)

          return service.update(params.id, body)
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
          await authorize(request.headers, customerPermissions.delete)

          await service.remove(params.id)
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
