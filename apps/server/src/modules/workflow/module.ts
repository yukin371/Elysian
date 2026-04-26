import { workflowModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { AppError } from "../../errors"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { WorkflowRepository } from "./repository"
import { createWorkflowService } from "./service"

interface WorkflowAuditEvent {
  tenantId: string
  actorUserId: string
  action: string
  targetType: string
  targetId: string
  result: "success"
  requestId: string | null
  ip: string | null
  userAgent: string | null
  details: Record<string, unknown> | null
}

type WorkflowAuditLogWriter = (event: WorkflowAuditEvent) => Promise<unknown>

export interface WorkflowModuleOptions {
  authGuard?: AuthGuard
  auditLogWriter?: WorkflowAuditLogWriter
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
  claimTask: "workflow:task:claim",
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
    // Workflow runtime keeps business success independent from audit sink availability.
    const recordAuditBestEffort = async (
      headers: Headers,
      identity: AuthIdentity,
      input: {
        action: string
        targetType: string
        targetId: string
        details?: Record<string, unknown> | null
      },
    ) => {
      if (!options.auditLogWriter) {
        return
      }

      try {
        await options.auditLogWriter(
          buildWorkflowAuditEvent(headers, identity, input),
        )
      } catch (error) {
        context.logger.warn("Workflow audit log write failed", {
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId,
          actorUserId: identity.user.id,
          tenantId: identity.user.tenantId,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : { value: String(error) },
        })
      }
    }

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
          const detail = await service.start(
            identity.user.tenantId,
            identity.user.id,
            body,
          )

          await recordAuditBestEffort(request.headers, identity, {
            action: "workflow_instance_start",
            targetType: "workflow_instance",
            targetId: detail.id,
            details: {
              definitionId: detail.definitionId,
              currentNodeId: detail.currentNodeId,
              status: detail.status,
            },
          })

          return detail
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
        "/workflow/tasks/:id/claim",
        async ({ params, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.claimTask),
          )
          const detail = await service.claimTask(
            identity.user.tenantId,
            {
              userId: identity.user.id,
              roleCodes: identity.roles,
              isSuperAdmin: identity.user.isSuperAdmin,
            },
            params.id,
          )

          await recordAuditBestEffort(request.headers, identity, {
            action: "workflow_task_claim",
            targetType: "workflow_task",
            targetId: params.id,
            details: {
              instanceId: detail.id,
              ...buildWorkflowTaskAuditSummary(
                detail.tasks.find((task) => task.id === params.id),
              ),
              status: detail.status,
              currentNodeId: detail.currentNodeId,
            },
          })

          return detail
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["workflow"],
            summary: "Claim workflow task",
          },
        },
      )
      .post(
        "/workflow/tasks/:id/complete",
        async ({ params, body, request }) => {
          const identity = requireTenantScopedIdentity(
            await authorize(request.headers, workflowPermissions.completeTask),
          )
          const detail = await service.completeTask(
            identity.user.tenantId,
            identity.user.id,
            params.id,
            body,
          )

          await recordAuditBestEffort(request.headers, identity, {
            action: "workflow_task_complete",
            targetType: "workflow_task",
            targetId: params.id,
            details: {
              instanceId: detail.id,
              ...buildWorkflowTaskAuditSummary(
                detail.tasks.find((task) => task.id === params.id),
              ),
              result: body.result,
              status: detail.status,
              currentNodeId: detail.currentNodeId,
            },
          })

          return detail
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
          const detail = await service.cancelInstance(
            identity.user.tenantId,
            params.id,
          )

          await recordAuditBestEffort(request.headers, identity, {
            action: "workflow_instance_cancel",
            targetType: "workflow_instance",
            targetId: params.id,
            details: {
              cancelledTasks: detail.tasks
                .filter((task) => task.status === "cancelled")
                .map((task) => ({
                  id: task.id,
                  ...buildWorkflowTaskAuditSummary(task),
                })),
              status: detail.status,
              currentNodeId: detail.currentNodeId,
            },
          })

          return detail
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

const readOptionalHeader = (headers: Headers, key: string) => {
  const value = headers.get(key)?.trim()
  return value && value.length > 0 ? value : null
}

const buildWorkflowTaskAuditSummary = (
  task:
    | {
        assignee: string
        claimSourceAssignee?: string
        claimedByUserId?: string
        claimedAt?: string
      }
    | undefined,
) => ({
  assignee: task?.assignee ?? null,
  claimSourceAssignee: task?.claimSourceAssignee ?? null,
  claimedByUserId: task?.claimedByUserId ?? null,
  claimedAt: task?.claimedAt ?? null,
})

const buildWorkflowAuditEvent = (
  headers: Headers,
  identity: AuthIdentity,
  input: {
    action: string
    targetType: string
    targetId: string
    details?: Record<string, unknown> | null
  },
): WorkflowAuditEvent => ({
  tenantId: identity.user.tenantId,
  actorUserId: identity.user.id,
  action: input.action,
  targetType: input.targetType,
  targetId: input.targetId,
  result: "success",
  requestId: readOptionalHeader(headers, "x-request-id"),
  ip: readOptionalHeader(headers, "x-forwarded-for"),
  userAgent: readOptionalHeader(headers, "user-agent"),
  details: input.details ?? null,
})
