import apiClient from './instance';
import type {
  Comment,
  CreateCommentRequest,
  DeleteCommentRequest,
  DeleteCommentResponse,
} from '@/types/comment';

export async function getComments(postId: number): Promise<Comment[]> {
  const { data } = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
  return data;
}

export async function createComment(
  postId: number,
  body: CreateCommentRequest,
): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(`/posts/${postId}/comments`, body);
  return data;
}

export async function deleteComment(
  postId: number,
  commentId: number,
  body: DeleteCommentRequest,
): Promise<DeleteCommentResponse> {
  const { data } = await apiClient.delete<DeleteCommentResponse>(
    `/posts/${postId}/comments/${commentId}`,
    { data: body },
  );
  return data;
}
