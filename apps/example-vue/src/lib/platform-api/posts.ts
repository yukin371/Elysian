import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreatePostInput,
  OpenApiPostRecord,
  OpenApiPostsResponse,
  OpenApiUpdatePostInput,
} from "./generated-types"

export type PostRecord = OpenApiPostRecord
export type PostsResponse = OpenApiPostsResponse
export type CreatePostRequest = OpenApiCreatePostInput
export type UpdatePostRequest = OpenApiUpdatePostInput

export const fetchPosts = async (): Promise<PostsResponse> =>
  requestJson<PostsResponse>("/system/posts", {
    auth: true,
  })

export const exportPostsCsv = async (): Promise<Blob> =>
  requestBlob("/system/posts/export", {
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
