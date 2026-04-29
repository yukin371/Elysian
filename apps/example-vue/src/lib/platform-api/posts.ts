import { requestJson } from "./core"

export interface PostRecord {
  id: string
  code: string
  name: string
  sort: number
  status: "active" | "disabled"
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface PostsResponse {
  items: PostRecord[]
}

export interface CreatePostRequest {
  code: string
  name: string
  sort?: number
  status?: PostRecord["status"]
  remark?: string
}

export interface UpdatePostRequest {
  code?: string
  name?: string
  sort?: number
  status?: PostRecord["status"]
  remark?: string
}

export const fetchPosts = async (): Promise<PostsResponse> =>
  requestJson<PostsResponse>("/system/posts", {
    auth: true,
  })

export const fetchPostById = async (id: string): Promise<PostRecord> =>
  requestJson<PostRecord>(`/system/posts/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createPost = async (
  input: CreatePostRequest,
): Promise<PostRecord> =>
  requestJson<PostRecord>("/system/posts", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updatePost = async (
  id: string,
  input: UpdatePostRequest,
): Promise<PostRecord> =>
  requestJson<PostRecord>(`/system/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })
