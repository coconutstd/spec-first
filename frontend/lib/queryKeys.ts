import type { GetPostsParams } from './api/posts';

export const postQueryKeys = {
  all: ['posts'] as const,
  list: (params: GetPostsParams) => ['posts', 'list', params] as const,
  detail: (id: number) => ['posts', 'detail', id] as const,
};

export const commentQueryKeys = {
  all: ['comments'] as const,
  list: (postId: number) => ['comments', 'list', postId] as const,
};
