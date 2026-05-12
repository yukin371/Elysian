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
    Reflect.deleteProperty(globalThis, "document")
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

  test("uploads a file and returns to detail mode", async () => {
    const created = createFileRecord({
      id: "file-created",
      originalName: "invoice.pdf",
      size: 4096,
    })
    const requests: Array<{
      method: string
      url: string
      body?: BodyInit | null
    }> = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      requests.push({ method, url, body: init?.body })

      if (url.endsWith("/system/files") && method === "POST") {
        return new Response(JSON.stringify(created), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [created] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()
    const file = new File(["invoice"], "invoice.pdf", {
      type: "application/pdf",
    })

    workspace.openUploadPanel()
    workspace.setPendingUploadFile(file)

    await workspace.submitUpload()

    const uploadRequest = requests.find(
      (request) =>
        request.method === "POST" && request.url.endsWith("/system/files"),
    )

    expect(uploadRequest).toBeDefined()
    expect(uploadRequest?.body).toBeInstanceOf(FormData)
    expect((uploadRequest?.body as FormData).get("file")).toBeInstanceOf(File)
    expect(workspace.filePanelMode.value).toBe("detail")
    expect(workspace.pendingUploadFile.value).toBeNull()
    expect(workspace.selectedFileId.value).toBe("file-created")
    expect(workspace.selectedFile.value?.originalName).toBe("invoice.pdf")
    expect(workspace.fileItems.value).toEqual([created])
    expect(workspace.fileErrorMessage.value).toBe("")
  })

  test("downloads the selected file through a hidden anchor", async () => {
    const file = createFileRecord()
    const requests: Array<{ method: string; url: string }> = []
    const clicked: string[] = []
    const appended: Array<{ href: string; download: string }> = []
    const objectUrls: string[] = []
    const revokedUrls: string[] = []
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    const originalSetTimeout = globalThis.setTimeout

    URL.createObjectURL = ((blob: Blob) => {
      objectUrls.push(blob.type)
      return "blob:download-url"
    }) as typeof URL.createObjectURL
    URL.revokeObjectURL = ((url: string) => {
      revokedUrls.push(url)
    }) as typeof URL.revokeObjectURL
    globalThis.setTimeout = ((handler: TimerHandler) => {
      if (typeof handler === "function") {
        handler()
      }

      return 0 as unknown as ReturnType<typeof setTimeout>
    }) as unknown as typeof setTimeout

    const mockDocument = {
      createElement: () => ({
        href: "",
        download: "",
        style: { display: "" },
        click: function () {
          clicked.push(this.download)
        },
        remove: () => {},
      }),
      body: {
        append: (node: Node) => {
          const candidate = node as unknown as {
            href: string
            download: string
          }
          appended.push({ href: candidate.href, download: candidate.download })
        },
      },
    } as unknown as Document
    ;(globalThis as typeof globalThis & { document?: Document }).document =
      mockDocument

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      requests.push({ method, url })

      if (url.endsWith("/system/files/file-1/download")) {
        return new Response(new Blob(["report"], { type: "application/pdf" }), {
          status: 200,
        })
      }

      if (url.endsWith("/system/files/file-1")) {
        return new Response(JSON.stringify(file), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(JSON.stringify({ items: [file] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const workspace = createWorkspace()
    await workspace.reloadFiles()
    await workspace.downloadSelectedFile()

    expect(
      requests.some(
        (request) =>
          request.method === "GET" &&
          request.url.endsWith("/system/files/file-1/download"),
      ),
    ).toBe(true)
    expect(appended).toEqual([
      { href: "blob:download-url", download: "report.pdf" },
    ])
    expect(clicked).toEqual(["report.pdf"])
    expect(objectUrls).toEqual(["application/pdf"])
    expect(revokedUrls).toEqual(["blob:download-url"])
    expect(workspace.fileErrorMessage.value).toBe("")

    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    globalThis.setTimeout = originalSetTimeout
  })

  test("deletes the selected file and falls back to upload mode", async () => {
    const file = createFileRecord()
    const requests: Array<{ method: string; url: string }> = []
    let deleted = false

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      requests.push({ method, url })

      if (url.endsWith("/system/files/file-1") && method === "DELETE") {
        deleted = true
        return new Response(null, { status: 204 })
      }

      if (url.endsWith("/system/files/file-1")) {
        return new Response(JSON.stringify(file), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      return new Response(
        JSON.stringify({
          items: deleted ? [] : [file],
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      )
    }) as typeof fetch

    const workspace = createWorkspace()
    await workspace.reloadFiles()
    workspace.openDeletePanel()

    await workspace.confirmDelete()

    expect(
      requests.some(
        (request) =>
          request.method === "DELETE" &&
          request.url.endsWith("/system/files/file-1"),
      ),
    ).toBe(true)
    expect(workspace.fileItems.value).toEqual([])
    expect(workspace.selectedFileId.value).toBeNull()
    expect(workspace.selectedFile.value).toBeNull()
    expect(workspace.filePanelMode.value).toBe("upload")
    expect(workspace.fileErrorMessage.value).toBe("")
  })
})
