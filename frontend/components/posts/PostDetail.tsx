'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost, updatePost } from '@/lib/api/posts';
import { postQueryKeys } from '@/lib/queryKeys';
import PasswordModal from '@/components/ui/PasswordModal';
import CommentSection from '@/components/comments/CommentSection';
import type { PostDetail as PostDetailType, ApiError } from '@/types/post';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type ModalMode = 'edit' | 'delete' | null;

interface PostDetailProps {
  post: PostDetailType;
}

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalError, setModalError] = useState('');

  // 수정 비밀번호 검증: 현재 값으로 PATCH를 시도해 검증 (title/body를 현재값 그대로 전송)
  const verifyEditMutation = useMutation({
    mutationFn: (password: string) =>
      updatePost(post.id, { password, title: post.title, body: post.body }),
    onSuccess: (_, password) => {
      // 검증 성공: sessionStorage에 저장 후 edit 페이지로 이동
      sessionStorage.setItem(`post_password_${post.id}`, password);
      // query cache 업데이트 필요 없음 (내용 변경 없음)
      setModalMode(null);
      setModalError('');
      router.push(`/posts/${post.id}/edit`);
    },
    onError: (err: ApiError) => {
      setModalError(err.message ?? '비밀번호가 일치하지 않습니다');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (password: string) => deletePost(post.id, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
      router.push('/');
    },
    onError: (err: ApiError) => {
      setModalError(err.message ?? '비밀번호가 일치하지 않습니다');
    },
  });

  const handleEditConfirm = (password: string) => {
    setModalError('');
    verifyEditMutation.mutate(password);
  };

  const handleDeleteConfirm = (password: string) => {
    setModalError('');
    deleteMutation.mutate(password);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setModalError('');
  };

  return (
    <article className="space-y-6">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span>
            작성자: <span className="text-gray-700 font-medium">{post.nickname}</span>
          </span>
          <span>작성일: {formatDateTime(post.createdAt)}</span>
          <span>조회수: {post.viewCount}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="min-h-32 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
        {post.body}
      </div>

      {/* 수정/삭제 버튼 */}
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
        <button
          onClick={() => {
            setModalMode('edit');
            setModalError('');
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          수정
        </button>
        <button
          onClick={() => {
            setModalMode('delete');
            setModalError('');
          }}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          삭제
        </button>
      </div>

      {/* 댓글 섹션 */}
      <CommentSection postId={post.id} />

      {/* 비밀번호 모달 */}
      {modalMode === 'edit' && (
        <PasswordModal
          title="수정 비밀번호 확인"
          errorMessage={modalError}
          isLoading={verifyEditMutation.isPending}
          onConfirm={handleEditConfirm}
          onClose={handleCloseModal}
        />
      )}
      {modalMode === 'delete' && (
        <PasswordModal
          title="삭제 비밀번호 확인"
          errorMessage={modalError}
          isLoading={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={handleCloseModal}
        />
      )}
    </article>
  );
}
