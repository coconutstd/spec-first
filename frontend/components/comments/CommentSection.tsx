'use client';

import { useQuery } from '@tanstack/react-query';
import { getComments } from '@/lib/api/comments';
import { commentQueryKeys } from '@/lib/queryKeys';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments = [], isLoading } = useQuery({
    queryKey: commentQueryKeys.list(postId),
    queryFn: () => getComments(postId).catch(() => [] as import('@/types/comment').Comment[]),
    staleTime: 30_000,
  });

  return (
    <section className="mt-8 border-t border-gray-200 pt-6" aria-label="댓글">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        댓글 {comments.length > 0 ? `(${comments.length})` : ''}
      </h2>

      {isLoading ? (
        <div className="text-sm text-gray-400 py-4 text-center">댓글을 불러오는 중...</div>
      ) : (
        <CommentList postId={postId} comments={comments} />
      )}

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">댓글 작성</h3>
        <CommentForm postId={postId} />
      </div>
    </section>
  );
}
