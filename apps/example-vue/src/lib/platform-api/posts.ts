import { requestJson } from "./core"
import type {
  CreatePostRequest,
  PostRecord,
  PostsResponse,
  UpdatePostRequest,
} from "../platform-api"

export const fetchPosts = async (): Promise<PostsResponse> =>
  requestJson<PostsResponse>("/system/posts", {
    auth: true,
  })

export const fetchPostById = async (id: string): Promise<PostRecord> =>
  requestJson<PostRecord>(`/system/posts/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createPost = async (input: CreatePostRequest): Promise<PostRecord> =>
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
