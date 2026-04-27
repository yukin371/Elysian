import { afterEach, describe, expect, test } from "bun:test"

import {
  clearAccessToken,
  downloadFileBlob,
  setAccessToken,
  uploadFile,
} from "./platform-api"

afterEach(() => {
  clearAccessToken()
})

describe("platform api file requests", () => {
  test("uploads files with multipart form data and bearer token", async () => {
    const originalFetch = globalThis.fetch
    const fetchCalls: Array<{
      url: string
      method: string
      authorization: string | null
      hasContentType: boolean
      bodyIsFormData: boolean
    }> = []

    setAccessToken("file-token")
    globalThis.fetch = (async (input, init) => {
      const headers = new Headers(init?.headers)
      fetchCalls.push({
        url: String(input),
        method: String(init?.method ?? "GET"),
        authorization: headers.get("authorization"),
        hasContentType: headers.has("content-type"),
        bodyIsFormData: init?.body instanceof FormData,
      })

      return new Response(
        JSON.stringify({
          id: "file_uploaded_1",
          originalName: "hello.txt",
          mimeType: "text/plain",
          size: 12,
          uploaderUserId: "user_admin_1",
          createdAt: "2026-04-27T08:00:00.000Z",
        }),
        {
          status: 201,
          headers: { "content-type": "application/json" },
        },
      )
    }) as typeof fetch

    try {
      await expect(
        uploadFile(
          new File(["hello world"], "hello.txt", { type: "text/plain" }),
        ),
      ).resolves.toEqual(
        expect.objectContaining({
          id: "file_uploaded_1",
          originalName: "hello.txt",
        }),
      )

      expect(fetchCalls).toEqual([
        {
          url: "http://localhost:3000/system/files",
          method: "POST",
          authorization: "Bearer file-token",
          hasContentType: false,
          bodyIsFormData: true,
        },
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test("downloads file blobs with bearer token", async () => {
    const originalFetch = globalThis.fetch
    const fetchCalls: Array<{ url: string; authorization: string | null }> = []

    setAccessToken("file-token")
    globalThis.fetch = (async (input, init) => {
      const headers = new Headers(init?.headers)
      fetchCalls.push({
        url: String(input),
        authorization: headers.get("authorization"),
      })

      return new Response(new Blob(["downloaded content"]), {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      })
    }) as typeof fetch

    try {
      const payload = await downloadFileBlob("file_download_1")

      expect(await payload.text()).toBe("downloaded content")
      expect(fetchCalls).toEqual([
        {
          url: "http://localhost:3000/system/files/file_download_1/download",
          authorization: "Bearer file-token",
        },
      ])
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
