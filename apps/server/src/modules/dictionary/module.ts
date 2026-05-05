import {
  deriveBodySchema,
  dictionaryItemModuleSchema,
  dictionaryModuleSchema,
  dictionaryTypeModuleSchema,
} from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  dictionaryItemListResponseSchema,
  dictionaryItemRecordResponseSchema,
  dictionaryTypeDetailResponseSchema,
  dictionaryTypeListResponseSchema,
} from "./openapi"
import type { DictionaryRepository } from "./repository"
import {
  type CreateDictionaryItemPayload,
  type CreateDictionaryTypePayload,
  type UpdateDictionaryItemPayload,
  type UpdateDictionaryTypePayload,
  createDictionaryService,
} from "./service"

export interface DictionaryModuleOptions {
  authGuard?: AuthGuard
}

interface DictionaryRouteRegistrar {
  get: (...args: readonly unknown[]) => DictionaryRouteRegistrar
  post: (...args: readonly unknown[]) => DictionaryRouteRegistrar
  put: (...args: readonly unknown[]) => DictionaryRouteRegistrar
}

interface DictionaryRouteParams {
  id: string
}

interface DictionaryRouteQuery {
  typeId?: string
}

interface DictionaryRouteSet {
  headers: Record<string, string>
  status: number
}

const dictionaryPermissions = {
  list: "system:dictionary:list",
  get: "system:dictionary:list",
  create: "system:dictionary:create",
  update: "system:dictionary:update",
} as const

const dictionaryItemFilterSchema = t.Object({
  typeId: t.Optional(t.String()),
})

const dictionaryTypeCreateBodySchema = deriveBodySchema(
  dictionaryTypeModuleSchema,
  {
    mode: "create",
    overrides: {
      status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
    },
  },
)

const dictionaryTypeUpdateBodySchema = deriveBodySchema(
  dictionaryTypeModuleSchema,
  {
    mode: "update",
  },
)

const dictionaryItemCreateBodySchema = deriveBodySchema(
  dictionaryItemModuleSchema,
  {
    mode: "create",
    overrides: {
      isDefault: t.Optional(t.Boolean()),
      sort: t.Optional(t.Number()),
      status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
    },
  },
)

const dictionaryItemUpdateBodySchema = deriveBodySchema(
  dictionaryItemModuleSchema,
  {
    mode: "update",
  },
)

export const createDictionaryModule = (
  repository: DictionaryRepository,
  options: DictionaryModuleOptions = {},
): ServerModule => ({
  name: dictionaryModuleSchema.name,
  register: (app, context) => {
    const service = createDictionaryService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering dictionary module", {
      fields: dictionaryModuleSchema.fields.map((field) => field.key),
    })

    let dictionaryApp = app as unknown as DictionaryRouteRegistrar

    dictionaryApp = dictionaryApp.get(
      "/system/dictionaries/types",
      async ({ request }: { request: Request }) => {
        await authorize(request.headers, dictionaryPermissions.list)

        return {
          items: await service.listTypes(),
        }
      },
      {
        response: {
          200: dictionaryTypeListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["dictionary"],
          summary: "List dictionary types",
        },
      },
    )

    dictionaryApp = dictionaryApp.get(
      "/system/dictionaries/types/export",
      async ({
        request,
        set,
      }: { request: Request; set: DictionaryRouteSet }) => {
        await authorize(request.headers, dictionaryPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportTypesCsv()
      },
      {
        detail: {
          tags: ["dictionary"],
          summary: "Export dictionary types as CSV",
        },
        response: {
          ...createErrorResponses(401, 403),
        },
      },
    )

    dictionaryApp = dictionaryApp.get(
      "/system/dictionaries/types/:id",
      async ({
        params,
        request,
      }: {
        params: DictionaryRouteParams
        request: Request
      }) => {
        await authorize(request.headers, dictionaryPermissions.get)

        return service.getTypeById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: dictionaryTypeDetailResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Get dictionary type by id",
        },
      },
    )

    dictionaryApp = dictionaryApp.post(
      "/system/dictionaries/types",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateDictionaryTypePayload
        request: Request
        set: DictionaryRouteSet
      }) => {
        await authorize(request.headers, dictionaryPermissions.create)
        set.status = 201

        return service.createType(body)
      },
      {
        body: dictionaryTypeCreateBodySchema,
        response: {
          201: dictionaryTypeDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Create dictionary type",
        },
      },
    )

    dictionaryApp = dictionaryApp.put(
      "/system/dictionaries/types/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: DictionaryRouteParams
        body: UpdateDictionaryTypePayload
        request: Request
      }) => {
        await authorize(request.headers, dictionaryPermissions.update)

        return service.updateType(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: dictionaryTypeUpdateBodySchema,
        response: {
          200: dictionaryTypeDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Update dictionary type",
        },
      },
    )

    dictionaryApp = dictionaryApp.get(
      "/system/dictionaries/items",
      async ({
        query,
        request,
      }: {
        query: DictionaryRouteQuery
        request: Request
      }) => {
        await authorize(request.headers, dictionaryPermissions.list)

        return {
          items: await service.listItems(query.typeId),
        }
      },
      {
        query: dictionaryItemFilterSchema,
        response: {
          200: dictionaryItemListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["dictionary"],
          summary: "List dictionary items",
        },
      },
    )

    dictionaryApp = dictionaryApp.get(
      "/system/dictionaries/items/export",
      async ({
        query,
        request,
        set,
      }: {
        query: DictionaryRouteQuery
        request: Request
        set: DictionaryRouteSet
      }) => {
        await authorize(request.headers, dictionaryPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportItemsCsv(query.typeId)
      },
      {
        query: dictionaryItemFilterSchema,
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Export dictionary items as CSV",
        },
      },
    )

    dictionaryApp = dictionaryApp.get(
      "/system/dictionaries/items/:id",
      async ({
        params,
        request,
      }: {
        params: DictionaryRouteParams
        request: Request
      }) => {
        await authorize(request.headers, dictionaryPermissions.get)

        return service.getItemById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: dictionaryItemRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Get dictionary item by id",
        },
      },
    )

    dictionaryApp = dictionaryApp.post(
      "/system/dictionaries/items",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateDictionaryItemPayload
        request: Request
        set: DictionaryRouteSet
      }) => {
        await authorize(request.headers, dictionaryPermissions.create)
        set.status = 201

        return service.createItem(body)
      },
      {
        body: dictionaryItemCreateBodySchema,
        response: {
          201: dictionaryItemRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Create dictionary item",
        },
      },
    )

    dictionaryApp = dictionaryApp.put(
      "/system/dictionaries/items/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: DictionaryRouteParams
        body: UpdateDictionaryItemPayload
        request: Request
      }) => {
        await authorize(request.headers, dictionaryPermissions.update)

        return service.updateItem(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: dictionaryItemUpdateBodySchema,
        response: {
          200: dictionaryItemRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["dictionary"],
          summary: "Update dictionary item",
        },
      },
    )

    return dictionaryApp as unknown as AnyServerApp
  },
})
