export interface Comment {
  id: number;
  postId: number;
  nickname: string;
  body: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  nickname: string;
  password: string;
  body: string;
}

export interface DeleteCommentRequest {
  password: string;
}

export interface DeleteCommentResponse {
  id: number;
  deletedAt: string;
}
