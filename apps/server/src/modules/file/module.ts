import { fileModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { AppError } from "../../errors"
import { createErrorResponses } from "../../openapi"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  fileBulkDeleteResponseSchema,
  fileListResponseSchema,
  fileRecordResponseSchema,
} from "./openapi"
import type { FileRepository } from "./repository"
import { createFileService } from "./service"
import type { FileStorage } from "./storage"

export interface FileModuleOptions {
  authGuard?: AuthGuard
}

interface FileRouteRegistrar {
  delete: (...args: readonly unknown[]) => FileRouteRegistrar
  get: (...args: readonly unknown[]) => FileRouteRegistrar
  post: (...args: readonly unknown[]) => FileRouteRegistrar
}

interface FileRouteParams {
  id: string
}

interface FileRouteQuery {
  originalName?: string
  mimeType?: string
  uploaderUserId?: string
  page?: number
  pageSize?: number
}

interface FileRouteSet {
  headers: Record<string, string>
  status: number
}

const filePermissions = {
  list: "system:file:list",
  get: "system:file:list",
  upload: "system:file:upload",
  download: "system:file:download",
  delete: "system:file:delete",
} as const

const fileFilterSchema = t.Object({
  originalName: t.Optional(t.String()),
  mimeType: t.Optional(t.String()),
  uploaderUserId: t.Optional(t.String()),
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
})

export const createFileModule = (
  repository: FileRepository,
  storage: FileStorage,
  options: FileModuleOptions = {},
): ServerModule => ({
  name: fileModuleSchema.name,
  register: (app, context) => {
    const service = createFileService(repository, storage)
    const authorize = async (
      headers: Headers,
      permissionCode: string,
    ): Promise<AuthIdentity | undefined> => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering file module", {
      fields: fileModuleSchema.fields.map((field) => field.key),
    })

    let fileApp = app as unknown as FileRouteRegistrar

    fileApp = fileApp.get(
      "/system/files",
      async ({
        query,
        request,
      }: {
        query: FileRouteQuery
        request: Request
      }) => {
        const identity = await authorize(request.headers, filePermissions.list)

        return service.list(query, identity?.dataAccess)
      },
      {
        query: fileFilterSchema,
        response: {
          200: fileListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["file"],
          summary: "List files",
        },
      },
    )

    fileApp = fileApp.get(
      "/system/files/export",
      async ({
        query,
        request,
        set,
      }: {
        query: FileRouteQuery
        request: Request
        set: FileRouteSet
      }) => {
        const identity = await authorize(request.headers, filePermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv(query, identity?.dataAccess)
      },
      {
        query: fileFilterSchema,
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["file"],
          summary: "Export file metadata as CSV",
        },
      },
    )

    fileApp = fileApp.get(
      "/system/files/:id",
      async ({
        params,
        request,
      }: {
        params: FileRouteParams
        request: Request
      }) => {
        const identity = await authorize(request.headers, filePermissions.get)

        return service.getById(params.id, identity?.dataAccess)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: fileRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["file"],
          summary: "Get file by id",
        },
      },
    )

    fileApp = fileApp.post(
      "/system/files",
      async ({
        request,
        set,
      }: {
        request: Request
        set: FileRouteSet
      }) => {
        const identity = await authorize(
          request.headers,
          filePermissions.upload,
        )
        const formData = await request.formData()
        const uploadedFile = formData.get("file")

        if (!(uploadedFile instanceof File)) {
          throw new AppError({
            code: "FILE_UPLOAD_REQUIRED",
            message: "File upload is required",
            status: 400,
            expose: true,
          })
        }

        set.status = 201
        return service.upload({
          file: uploadedFile,
          uploaderUserId: identity?.user.id ?? null,
          deptId: identity?.deptIds[0] ?? null,
        })
      },
      {
        response: {
          201: fileRecordResponseSchema,
          ...createErrorResponses(400, 401, 403),
        },
        detail: {
          tags: ["file"],
          summary: "Upload file",
        },
      },
    )

    fileApp = fileApp
      .post(
        "/system/files/delete",
        async ({
          body,
          request,
        }: {
          body: {
            ids: string[]
          }
          request: Request
        }) => {
          const identity = await authorize(
            request.headers,
            filePermissions.delete,
          )

          return {
            items: await service.removeMany(body.ids, identity?.dataAccess),
          }
        },
        {
          body: t.Object({
            ids: t.Array(t.String()),
          }),
          response: {
            200: fileBulkDeleteResponseSchema,
            ...createErrorResponses(401, 403, 404),
          },
          detail: {
            tags: ["file"],
            summary: "Delete files by id list",
          },
        },
      )
      .get(
        "/system/files/:id/download",
        async ({
          params,
          request,
          set,
        }: {
          params: FileRouteParams
          request: Request
          set: FileRouteSet
        }) => {
          const identity = await authorize(
            request.headers,
            filePermissions.download,
          )
          const { file, bytes } = await service.download(
            params.id,
            identity?.dataAccess,
          )

          set.headers["content-type"] =
            file.mimeType ?? "application/octet-stream"
          set.headers["content-disposition"] = buildAttachmentDisposition(
            file.originalName,
          )
          set.headers["content-length"] = String(bytes.byteLength)
          const responseBytes = new Uint8Array(bytes.byteLength)
          responseBytes.set(bytes)

          return new Response(responseBytes, {
            headers: set.headers,
          })
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          response: {
            ...createErrorResponses(401, 403, 404),
          },
          detail: {
            tags: ["file"],
            summary: "Download file",
          },
        },
      )
      .delete(
        "/system/files/:id",
        async ({
          params,
          request,
          set,
        }: {
          params: FileRouteParams
          request: Request
          set: FileRouteSet
        }) => {
          const identity = await authorize(
            request.headers,
            filePermissions.delete,
          )
          await service.remove(params.id, identity?.dataAccess)
          set.status = 204
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          response: {
            204: t.Void(),
            ...createErrorResponses(401, 403, 404),
          },
          detail: {
            tags: ["file"],
            summary: "Delete file",
          },
        },
      )

    return fileApp as unknown as AnyServerApp
  },
})

const buildAttachmentDisposition = (fileName: string) => {
  const asciiName = fileName.replaceAll('"', "")
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}
