import { beforeEach, describe, expect, test } from "bun:test"
import { computed, ref } from "vue"

import type { FileRecord } from "../lib/platform-api/files"
import { useFileWorkspace } from "./use-file-workspace"

const createFileRecord = (overrides: Partial<FileRecord> = {}): FileRecord => ({
  id: overrides.id ?? "file-1",
  originalName: overrides.originalName ?? "report.pdf",
  mimeType: overrides.mimeType ?? "application/pdf",
  size: overrides.size ?? 2048,
  uploaderUserId: overrides.uploaderUserId ?? "user-1",
  createdAt: overrides.createdAt ?? "2026-05-02T08:00:00.000Z",
})

const createWorkspace = (options?: {
  canView?: boolean
  canUpload?: boolean
  canDownload?: boolean
  canDelete?: boolean
  onRecoverableAuthError?: (error: unknown) => void
}) =>
  useFileWorkspace({
    currentShellTabKey: ref("overview"),
    isWorkspaceActive: computed(() => true),
    locale: ref("zh-CN"),
    t: (key) => key,
    canView: computed(() => options?.canView ?? true),
    canUpload: computed(() => options?.canUpload ?? true),
    canDownload: computed(() => options?.canDownload ?? true),
    canDelete: computed(() => options?.canDelete ?? true),
    onRecoverableAuthError: options?.onRecoverableAuthError ?? (() => {}),
  })

describe("useFileWorkspace", () => {
  beforeEach(() => {
    Reflect.deleteProperty(globalThis, "fetch")
  })

  test("preserves active filters when reloading files fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input) => {
      const url = String(input)

      if (
        url.includes(
          "/system/files?originalName=report&mimeType=application%2Fpdf&uploaderUserId=user-9",
        )
      ) {
        return new Response(JSON.stringify({ message: "unavailable" }), {
          headers: { "content-type": "application/json" },
          status: 503,
        })
      }

      return new Response(JSON.stringify({ items: [createFileRecord()] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    workspace.updateQuery({
      originalName: "  report ",
      mimeType: " application/pdf ",
      uploaderUserId: " user-9 ",
    })

    await workspace.reloadFiles()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.fileErrorMessage.value).toContain("unavailable")
    expect(workspace.fileQuery.value).toEqual({
      originalName: "  report ",
      mimeType: " application/pdf ",
      uploaderUserId: " user-9 ",
    })
  })

  test("preserves cached file context when reloading files fails", async () => {
    const first = createFileRecord()
    const recoverableErrors: unknown[] = []
    let failReload = false

    globalThis.fetch = (async (input) => {
      const url = String(input)

      if (url.endsWith("/system/files/file-1")) {
        return new Response(JSON.stringify(first), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (url.includes("/system/files?originalName=report") && failReload) {
        return new Response(JSON.stringify({ message: "unavailable" }), {
          headers: { "content-type": "application/json" },
          status: 503,
        })
      }

      return new Response(JSON.stringify({ items: [first] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await workspace.reloadFiles()
    workspace.openDeletePanel()
    workspace.updateQuery({
      originalName: "  report ",
    })
    failReload = true

    await workspace.reloadFiles()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.fileErrorMessage.value).toContain("unavailable")
    expect(workspace.filePanelMode.value).toBe("delete")
    expect(workspace.fileItems.value).toEqual([first])
    expect(workspace.selectedFileId.value).toBe("file-1")
    expect(workspace.selectedFile.value?.id).toBe("file-1")
    expect(workspace.fileQuery.value).toEqual({
      originalName: "  report ",
    })
  })
})
