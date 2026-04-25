import { workflowModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { AppError } from "../../errors"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { WorkflowRepository } from "./repository"
import { createWorkflowService } from "./service"

export interface WorkflowModuleOptions {
  authGuard?: AuthGuard
}

const workflowPermissions = {
  listDefinition: "workflow:definition:list",
  getDefinition: "workflow:definition:list",
  createDefinition: "workflow:definition:create",
  updateDefinition: "workflow:definition:update",
  listInstance: "workflow:instance:list",
  startInstance: "workflow:instance:start",
  cancelInstance: "workflow:instance:cancel",
  listTask: "workflow:task:list",
  completeTask: "workflow:task:complete",
} as const

const workflowDefinitionStatusSchema = t.Union([
  t.Literal("active"),
  t.Literal("disabled"),
])

export const createWorkflowModule = (
  repository: WorkflowRepository,
  options: WorkflowModuleOptions = {},
): ServerModule => ({
  name: workflowModuleSchema.name,
  register: (app, context) => {
    const service = createWorkflowService(repository)
    const authorize = async (
      headers: Headers,
      permissionCode: string,
    ): Promise<AuthIdentity | undefined> => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering workflow definition module", {
      fields: workflowModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/workflow/definitions",
        async ({ request }) => {
          await authorize(request.headers, workflowPermissions.listDefinition)

          return {
            items: await service.list(),
          }
        },
        {
          detail: {
            tags: ["workflow"],
            summary: "List workflow definitions",
          },
        },
      )
      .get(
        "/workflow/definitions/:id",
        async ({ params, request }) => {
          await authorize(request.headers, workflowPermissions.getDefinition)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Get workflow definition by id",
          },
        },
      )
      .post(
        "/workflow/definitions",
        async ({ body, request, set }) => {
          const identity = await authorize(
            request.headers,
            workflowPermissions.createDefinition,
          )
          set.status = 201

          return service.create(
            requireTenantScopedIdentity(identity).user.tenantId,
            body,
          )
        },
        {
          body: t.Object({
            key: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            status: t.Optional(workflowDefinitionStatusSchema),
            definition: t.Any(),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Create workflow definition",
          },
        },
      )
      .put(
        "/workflow/definitions/:id",
        async ({ params, body, request }) => {
          const identity = await authorize(
            request.headers,
            workflowPermissions.updateDefinition,
          )

          return service.update(
            params.id,
            requireTenantScopedIdentity(identity).user.tenantId,
            body,
          )
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            status: t.Optional(workflowDefinitionStatusSchema),
            definition: t.Optional(t.Any()),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Create a new workflow definition version",
          },
        },
      )
      .get(
        "/workflow/instances",
        async ({ request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.listInstance),
          )

          return {
            items: await service.listInstances(identity.user.tenantId),
          }
        },
        {
          detail: {
            tags: ["workflow"],
            summary: "List workflow instances",
          },
        },
      )
      .get(
        "/workflow/instances/:id",
        async ({ params, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.listInstance),
          )

          return service.getInstanceById(identity.user.tenantId, params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Get workflow instance by id",
          },
        },
      )
      .post(
        "/workflow/instances",
        async ({ body, request, set }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.startInstance),
          )
          set.status = 201

          return service.start(identity.user.tenantId, identity.user.id, body)
        },
        {
          body: t.Object({
            definitionId: t.String({ minLength: 1 }),
            variables: t.Optional(t.Any()),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Start workflow instance",
          },
        },
      )
      .get(
        "/workflow/tasks/todo",
        async ({ query, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.listTask),
          )

          return {
            items: await service.listTodoTasks(identity.user.tenantId, query),
          }
        },
        {
          query: t.Object({
            assignee: t.Optional(t.String()),
          }),
          detail: {
            tags: ["workflow"],
            summary: "List todo workflow tasks",
          },
        },
      )
      .get(
        "/workflow/tasks/done",
        async ({ query, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.listTask),
          )

          return {
            items: await service.listDoneTasks(identity.user.tenantId, query),
          }
        },
        {
          query: t.Object({
            assignee: t.Optional(t.String()),
          }),
          detail: {
            tags: ["workflow"],
            summary: "List completed workflow tasks",
          },
        },
      )
      .post(
        "/workflow/tasks/:id/complete",
        async ({ params, body, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.completeTask),
          )

          return service.completeTask(identity.user.tenantId, params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            result: t.Union([t.Literal("approved"), t.Literal("rejected")]),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Complete workflow task",
          },
        },
      )
      .post(
        "/workflow/instances/:id/cancel",
        async ({ params, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(
              request.headers,
              workflowPermissions.cancelInstance,
            ),
          )

          return service.cancelInstance(identity.user.tenantId, params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Cancel workflow instance",
          },
        },
      )
  },
})

const requireTenantScopedIdentity = (identity: AuthIdentity | undefined) => {
  if (identity?.user.tenantId) {
    return identity
  }

  throw new AppError({
    code: "WORKFLOW_TENANT_CONTEXT_REQUIRED",
    message: "Workflow definition write operations require tenant context",
    status: 400,
    expose: true,
  })
}
