import type { PostRecord } from "./platform-api"

export interface PostWorkspaceQuery {
  code?: string
  name?: string
  remark?: string
  status?: PostRecord["status"] | ""
}

export interface PostTableItem
  extends Omit<PostRecord, "status" | "createdAt" | "updatedAt"> {
  status: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultPostDraft = () => ({
  code: "",
  name: "",
  sort: 10,
  status: "active" as PostRecord["status"],
  remark: "",
})

export const normalizePostText = (value: unknown) => String(value ?? "").trim()

export const normalizeOptionalPostText = (value: unknown) => {
  const normalized = normalizePostText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizePostSort = (value: unknown) => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(normalized) ? normalized : 10
}

export const normalizePostStatus = (value: unknown): PostRecord["status"] =>
  value === "disabled" ? "disabled" : "active"

export const filterPosts = (posts: PostRecord[], query: PostWorkspaceQuery) => {
  const code = normalizeQueryValue(query.code)
  const name = normalizeQueryValue(query.name)
  const remark = normalizeQueryValue(query.remark)
  const status = query.status ?? ""

  return posts.filter((post) => {
    if (code.length > 0 && !post.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !post.name.toLowerCase().includes(name)) {
      return false
    }

    if (
      remark.length > 0 &&
      !(post.remark ?? "").toLowerCase().includes(remark)
    ) {
      return false
    }

    if (status && post.status !== status) {
      return false
    }

    return true
  })
}

export const resolvePostSelection = (
  posts: Array<Pick<PostRecord, "id">>,
  selectedPostId: string | null,
) => {
  if (posts.length === 0) {
    return null
  }

  if (selectedPostId && posts.some((post) => post.id === selectedPostId)) {
    return selectedPostId
  }

  return posts[0]?.id ?? null
}

export const createPostTableItems = (
  posts: PostRecord[],
  options: {
    localizeStatus: (status: PostRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): PostTableItem[] =>
  posts.map((post) => ({
    ...post,
    status: options.localizeStatus(post.status),
    createdAt: options.formatDateTime(post.createdAt),
    updatedAt: options.formatDateTime(post.updatedAt),
  }))
