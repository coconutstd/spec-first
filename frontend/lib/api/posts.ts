import apiClient from './instance';
import type {
  PostListResponse,
  PostDetail,
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  DeletePostRequest,
  DeletePostResponse,
} from '@/types/post';

export interface GetPostsParams {
  q?: string;
  page?: number;
}

export async function getPosts(params: GetPostsParams = {}): Promise<PostListResponse> {
  const { data } = await apiClient.get<PostListResponse>('/posts', { params });
  return data;
}

export async function getPost(id: number): Promise<PostDetail> {
  const { data } = await apiClient.get<PostDetail>(`/posts/${id}`);
  return data;
}

export async function createPost(body: CreatePostRequest): Promise<CreatePostResponse> {
  const { data } = await apiClient.post<CreatePostResponse>('/posts', body);
  return data;
}

export async function updatePost(
  id: number,
  body: UpdatePostRequest,
): Promise<PostDetail> {
  const { data } = await apiClient.patch<PostDetail>(`/posts/${id}`, body);
  return data;
}

export async function deletePost(
  id: number,
  body: DeletePostRequest,
): Promise<DeletePostResponse> {
  const { data } = await apiClient.delete<DeletePostResponse>(`/posts/${id}`, {
    data: body,
  });
  return data;
}
