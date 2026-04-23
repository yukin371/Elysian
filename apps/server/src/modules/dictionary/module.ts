import { dictionaryModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { DictionaryRepository } from "./repository"
import { createDictionaryService } from "./service"

export interface DictionaryModuleOptions {
  authGuard?: AuthGuard
}

const dictionaryPermissions = {
  list: "system:dictionary:list",
  get: "system:dictionary:list",
  create: "system:dictionary:create",
  update: "system:dictionary:update",
} as const

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

    return app
      .get(
        "/system/dictionaries/types",
        async ({ request }) => {
          await authorize(request.headers, dictionaryPermissions.list)

          return {
            items: await service.listTypes(),
          }
        },
        {
          detail: {
            tags: ["dictionary"],
            summary: "List dictionary types",
          },
        },
      )
      .get(
        "/system/dictionaries/types/:id",
        async ({ params, request }) => {
          await authorize(request.headers, dictionaryPermissions.get)

          return service.getTypeById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "Get dictionary type by id",
          },
        },
      )
      .post(
        "/system/dictionaries/types",
        async ({ body, request, set }) => {
          await authorize(request.headers, dictionaryPermissions.create)
          set.status = 201

          return service.createType(body)
        },
        {
          body: t.Object({
            code: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            description: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "Create dictionary type",
          },
        },
      )
      .put(
        "/system/dictionaries/types/:id",
        async ({ params, body, request }) => {
          await authorize(request.headers, dictionaryPermissions.update)

          return service.updateType(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            code: t.Optional(t.String({ minLength: 1 })),
            name: t.Optional(t.String({ minLength: 1 })),
            description: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "Update dictionary type",
          },
        },
      )
      .get(
        "/system/dictionaries/items",
        async ({ query, request }) => {
          await authorize(request.headers, dictionaryPermissions.list)

          return {
            items: await service.listItems(query.typeId),
          }
        },
        {
          query: t.Object({
            typeId: t.Optional(t.String()),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "List dictionary items",
          },
        },
      )
      .get(
        "/system/dictionaries/items/:id",
        async ({ params, request }) => {
          await authorize(request.headers, dictionaryPermissions.get)

          return service.getItemById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "Get dictionary item by id",
          },
        },
      )
      .post(
        "/system/dictionaries/items",
        async ({ body, request, set }) => {
          await authorize(request.headers, dictionaryPermissions.create)
          set.status = 201

          return service.createItem(body)
        },
        {
          body: t.Object({
            typeId: t.String({ minLength: 1 }),
            value: t.String({ minLength: 1 }),
            label: t.String({ minLength: 1 }),
            sort: t.Optional(t.Number()),
            isDefault: t.Optional(t.Boolean()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "Create dictionary item",
          },
        },
      )
      .put(
        "/system/dictionaries/items/:id",
        async ({ params, body, request }) => {
          await authorize(request.headers, dictionaryPermissions.update)

          return service.updateItem(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            typeId: t.Optional(t.String({ minLength: 1 })),
            value: t.Optional(t.String({ minLength: 1 })),
            label: t.Optional(t.String({ minLength: 1 })),
            sort: t.Optional(t.Number()),
            isDefault: t.Optional(t.Boolean()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
          }),
          detail: {
            tags: ["dictionary"],
            summary: "Update dictionary item",
          },
        },
      )
  },
})
