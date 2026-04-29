export interface PostListItem {
  id: number;
  title: string;
  nickname: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
}

export interface PostDetail {
  id: number;
  title: string;
  body: string;
  nickname: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListMeta {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface PostListResponse {
  data: PostListItem[];
  meta: PostListMeta;
}

export interface CreatePostRequest {
  nickname: string;
  password: string;
  title: string;
  body: string;
}

export interface CreatePostResponse {
  id: number;
  title: string;
  nickname: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePostRequest {
  password: string;
  title?: string;
  body?: string;
}

export interface DeletePostRequest {
  password: string;
}

export interface DeletePostResponse {
  id: number;
  deletedAt: string;
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
