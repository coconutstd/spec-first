'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/lib/api/comments';
import { commentQueryKeys } from '@/lib/queryKeys';
import PasswordModal from '@/components/ui/PasswordModal';
import type { Comment } from '@/types/comment';
import type { ApiError } from '@/types/post';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CommentListProps {
  postId: number;
  comments: Comment[];
}

export default function CommentList({ postId, comments }: CommentListProps) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: ({ commentId, password }: { commentId: number; password: string }) =>
      deleteComment(postId, commentId, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentQueryKeys.list(postId) });
      setDeletingId(null);
      setModalError('');
    },
    onError: (err: ApiError) => {
      setModalError(err.message ?? '비밀번호가 일치하지 않습니다');
    },
  });

  const handleDeleteConfirm = (password: string) => {
    if (deletingId === null) return;
    setModalError('');
    deleteMutation.mutate({ commentId: deletingId, password });
  };

  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        아직 댓글이 없습니다.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="bg-gray-50 rounded-md p-3 border border-gray-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">{comment.nickname}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeletingId(comment.id);
                  setModalError('');
                }}
                className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`댓글 삭제: ${comment.nickname}`}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deletingId !== null && (
        <PasswordModal
          title="댓글 삭제 비밀번호 확인"
          errorMessage={modalError}
          isLoading={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setDeletingId(null);
            setModalError('');
          }}
        />
      )}
    </>
  );
}
