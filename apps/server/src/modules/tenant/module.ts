import { deriveBodySchema, tenantModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { AppError } from "../../errors"
import { createErrorResponses } from "../../openapi"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import { tenantListResponseSchema, tenantRecordResponseSchema } from "./openapi"
import type { TenantRepository } from "./repository"
import {
  type CreateTenantPayload,
  type UpdateTenantPayload,
  createTenantService,
} from "./service"

export interface TenantModuleOptions {
  authGuard?: AuthGuard
}

interface TenantRouteRegistrar {
  get: (...args: readonly unknown[]) => TenantRouteRegistrar
  post: (...args: readonly unknown[]) => TenantRouteRegistrar
  put: (...args: readonly unknown[]) => TenantRouteRegistrar
}

interface TenantRouteParams {
  id: string
}

interface TenantRouteSet {
  headers: Record<string, string>
  status: number
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

const tenantCreateBodySchema = deriveBodySchema(tenantModuleSchema, {
  mode: "create",
  overrides: {
    status: t.Optional(tenantStatusSchema),
  },
})

const tenantUpdateBodySchema = deriveBodySchema(tenantModuleSchema, {
  mode: "update",
  overrides: {
    status: t.Optional(tenantStatusSchema),
  },
})

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
    ): Promise<void> => {
      if (!options.authGuard) {
        return
      }

      const identity = await options.authGuard.authorize(
        headers,
        permissionCode,
      )
      assertSuperAdmin(identity)
    }

    context.logger.info("Registering tenant module", {
      fields: tenantModuleSchema.fields.map((field) => field.key),
    })

    let tenantApp = app as unknown as TenantRouteRegistrar

    tenantApp = tenantApp.get(
      "/system/tenants",
      async ({ request }: { request: Request }) => {
        await authorize(request.headers, tenantPermissions.list)

        return {
          items: await service.list(),
        }
      },
      {
        response: {
          200: tenantListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["tenant"],
          summary: "List tenants",
        },
      },
    )

    tenantApp = tenantApp.get(
      "/system/tenants/export",
      async ({ request, set }: { request: Request; set: TenantRouteSet }) => {
        await authorize(request.headers, tenantPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["tenant"],
          summary: "Export tenants as CSV",
        },
      },
    )

    tenantApp = tenantApp.get(
      "/system/tenants/:id",
      async ({
        params,
        request,
      }: {
        params: TenantRouteParams
        request: Request
      }) => {
        await authorize(request.headers, tenantPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: tenantRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["tenant"],
          summary: "Get tenant by id",
        },
      },
    )

    tenantApp = tenantApp.post(
      "/system/tenants",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateTenantPayload
        request: Request
        set: TenantRouteSet
      }) => {
        await authorize(request.headers, tenantPermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: tenantCreateBodySchema,
        response: {
          201: tenantRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["tenant"],
          summary: "Create tenant",
        },
      },
    )

    tenantApp = tenantApp.put(
      "/system/tenants/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: TenantRouteParams
        body: UpdateTenantPayload
        request: Request
      }) => {
        await authorize(request.headers, tenantPermissions.update)

        return service.update(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: tenantUpdateBodySchema,
        response: {
          200: tenantRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["tenant"],
          summary: "Update tenant",
        },
      },
    )

    tenantApp = tenantApp.put(
      "/system/tenants/:id/status",
      async ({
        params,
        body,
        request,
      }: {
        params: TenantRouteParams
        body: { status: NonNullable<CreateTenantPayload["status"]> }
        request: Request
      }) => {
        await authorize(request.headers, tenantPermissions.update)

        return service.updateStatus(params.id, body.status)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: t.Object({
          status: tenantStatusSchema,
        }),
        response: {
          200: tenantRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 404),
        },
        detail: {
          tags: ["tenant"],
          summary: "Update tenant status",
        },
      },
    )

    return tenantApp as unknown as AnyServerApp
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
