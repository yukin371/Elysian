import { tenantModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { AppError } from "../../errors"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { TenantRepository } from "./repository"
import { createTenantService } from "./service"

export interface TenantModuleOptions {
  authGuard?: AuthGuard
}

const tenantPermissions = {
  list: "system:tenant:list",
  get: "system:tenant:list",
  create: "system:tenant:create",
  update: "system:tenant:update",
} as const

const tenantStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("suspended"),
])

export const createTenantModule = (
  repository: TenantRepository,
  options: TenantModuleOptions = {},
): ServerModule => ({
  name: tenantModuleSchema.name,
  register: (app, context) => {
    const service = createTenantService(repository)
    const authorize = async (
      headers: Headers,
      permissionCode: string,
    ): Promise<AuthIdentity | undefined> => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering tenant module", {
      fields: tenantModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/system/tenants",
        async ({ request }) => {
          const identity = await authorize(
            request.headers,
            tenantPermissions.list,
          )
          assertSuperAdmin(identity)

          return {
            items: await service.list(),
          }
        },
        {
          detail: {
            tags: ["tenant"],
            summary: "List tenants",
          },
        },
      )
      .get(
        "/system/tenants/:id",
        async ({ params, request }) => {
          const identity = await authorize(
            request.headers,
            tenantPermissions.get,
          )
          assertSuperAdmin(identity)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["tenant"],
            summary: "Get tenant by id",
          },
        },
      )
      .post(
        "/system/tenants",
        async ({ body, request, set }) => {
          const identity = await authorize(
            request.headers,
            tenantPermissions.create,
          )
          assertSuperAdmin(identity)
          set.status = 201

          return service.create(body)
        },
        {
          body: t.Object({
            code: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            status: t.Optional(tenantStatusSchema),
          }),
          detail: {
            tags: ["tenant"],
            summary: "Create tenant",
          },
        },
      )
      .put(
        "/system/tenants/:id",
        async ({ params, body, request }) => {
          const identity = await authorize(
            request.headers,
            tenantPermissions.update,
          )
          assertSuperAdmin(identity)

          return service.update(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            code: t.Optional(t.String({ minLength: 1 })),
            name: t.Optional(t.String({ minLength: 1 })),
            status: t.Optional(tenantStatusSchema),
          }),
          detail: {
            tags: ["tenant"],
            summary: "Update tenant",
          },
        },
      )
      .put(
        "/system/tenants/:id/status",
        async ({ params, body, request }) => {
          const identity = await authorize(
            request.headers,
            tenantPermissions.update,
          )
          assertSuperAdmin(identity)

          return service.updateStatus(params.id, body.status)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            status: tenantStatusSchema,
          }),
          detail: {
            tags: ["tenant"],
            summary: "Update tenant status",
          },
        },
      )
  },
})

const assertSuperAdmin = (identity: AuthIdentity | undefined) => {
  if (!identity) {
    return
  }

  if (identity.user.isSuperAdmin) {
    return
  }

  throw new AppError({
    code: "TENANT_SUPER_ADMIN_REQUIRED",
    message: "Tenant management requires a super admin",
    status: 403,
    expose: true,
  })
}
