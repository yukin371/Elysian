import { describe, expect, test } from "bun:test"

import type { PostRecord } from "./platform-api"
import {
  createDefaultPostDraft,
  createPostTableItems,
  filterPosts,
  normalizeOptionalPostText,
  normalizePostSort,
  normalizePostStatus,
  normalizePostText,
  resolvePostSelection,
} from "./post-workspace"

const createPost = (
  overrides: Partial<PostRecord> & Pick<PostRecord, "id">,
): PostRecord => ({
  id: overrides.id,
  code: overrides.code ?? overrides.id,
  name: overrides.name ?? `post:${overrides.id}`,
  sort: overrides.sort ?? 10,
  status: overrides.status ?? "active",
  remark: overrides.remark ?? "",
  createdAt: overrides.createdAt ?? "2026-04-28T08:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-04-28T08:00:00.000Z",
})

describe("post workspace helpers", () => {
  const posts = [
    createPost({
      id: "post_ceo",
      code: "ceo",
      name: "Chief Executive Officer",
      sort: 10,
      status: "active",
      remark: "Top management",
    }),
    createPost({
      id: "post_ops",
      code: "ops-lead",
      name: "Operations Lead",
      sort: 20,
      status: "disabled",
      remark: "Operations owner",
    }),
    createPost({
      id: "post_support",
      code: "support-manager",
      name: "Support Manager",
      sort: 30,
      status: "active",
      remark: "",
    }),
  ]

  test("builds the default draft and normalizes form input", () => {
    expect(createDefaultPostDraft()).toEqual({
      code: "",
      name: "",
      sort: 10,
      status: "active",
      remark: "",
    })

    expect(normalizePostText("  ceo  ")).toBe("ceo")
    expect(normalizeOptionalPostText("  note  ")).toBe("note")
    expect(normalizeOptionalPostText("   ")).toBeUndefined()
    expect(normalizePostSort("25")).toBe(25)
    expect(normalizePostSort("bad")).toBe(10)
    expect(normalizePostStatus("disabled")).toBe("disabled")
    expect(normalizePostStatus("unknown")).toBe("active")
  })

  test("filters posts across code, name, remark, and status", () => {
    expect(filterPosts(posts, { code: "ops" }).map((post) => post.id)).toEqual([
      "post_ops",
    ])

    expect(filterPosts(posts, { name: "support" }).map((post) => post.id)).toEqual([
      "post_support",
    ])

    expect(filterPosts(posts, { remark: "management" }).map((post) => post.id)).toEqual([
      "post_ceo",
    ])

    expect(filterPosts(posts, { status: "active" }).map((post) => post.id)).toEqual([
      "post_ceo",
      "post_support",
    ])
  })

  test("keeps the current selection when the post remains visible", () => {
    expect(resolvePostSelection(posts, "post_ops")).toBe("post_ops")
  })

  test("falls back to the first visible post when the previous selection disappears", () => {
    const activePosts = posts.filter((post) => post.status === "active")

    expect(resolvePostSelection(activePosts, "post_ops")).toBe("post_ceo")
  })

  test("maps post fields for table display", () => {
    expect(
      createPostTableItems(posts, {
        localizeStatus: (status) => `status:${status}`,
        formatDateTime: (value) => `time:${value}`,
      }),
    ).toEqual([
      expect.objectContaining({
        id: "post_ceo",
        status: "status:active",
        createdAt: "time:2026-04-28T08:00:00.000Z",
        updatedAt: "time:2026-04-28T08:00:00.000Z",
      }),
      expect.objectContaining({
        id: "post_ops",
        status: "status:disabled",
      }),
      expect.objectContaining({
        id: "post_support",
        status: "status:active",
      }),
    ])
  })
})
