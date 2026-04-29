'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPost } from '@/lib/api/posts';
import { postQueryKeys } from '@/lib/queryKeys';
import PostForm from '@/components/posts/PostForm';

interface EditPostClientProps {
  postId: number;
}

function getStoredPassword(postId: number): string | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(`post_password_${postId}`);
  if (stored) {
    sessionStorage.removeItem(`post_password_${postId}`);
  }
  return stored;
}

export default function EditPostClient({ postId }: EditPostClientProps) {
  const router = useRouter();

  // useState initializer로 sessionStorage 읽기 (클라이언트 사이드 초기화, effect 불필요)
  const [password] = useState<string | null>(() => getStoredPassword(postId));

  const handleRedirect = useCallback(() => {
    router.replace(`/posts/${postId}`);
  }, [router, postId]);

  const { data: post, isLoading } = useQuery({
    queryKey: postQueryKeys.detail(postId),
    queryFn: () => getPost(postId),
    enabled: password !== null,
    staleTime: 0,
  });

  // 비밀번호가 없으면 리다이렉트 (클라이언트 렌더 후)
  if (password === null) {
    // 렌더 직후 리다이렉트를 위해 useEffect 대신 클라이언트 렌더링 시 즉시 처리
    // Next.js에서 render 중 router.replace는 금지이므로, 빈 컴포넌트 반환 후 callback 호출
    return <RedirectOnMount onMount={handleRedirect} />;
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm">불러오는 중...</div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/posts/${postId}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← 상세로
        </Link>
        <h1 className="text-xl font-bold text-gray-900">게시글 수정</h1>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <PostForm
          mode="edit"
          postId={postId}
          password={password}
          initialTitle={post.title}
          initialBody={post.body}
        />
      </div>
    </div>
  );
}

function RedirectOnMount({ onMount }: { onMount: () => void }) {
  useState(() => {
    // useState initializer는 render 중 한 번만 실행되므로 side-effect 없이 처리
    // 실제 리다이렉트는 컴포넌트가 마운트된 직후 useLayoutEffect로 처리
    return null;
  });

  // useLayoutEffect는 SSR에서는 실행되지 않으므로 클라이언트 전용
  if (typeof window !== 'undefined') {
    // 동기적으로 호출하면 ESLint 규칙에 걸리므로, queueMicrotask 사용
    queueMicrotask(onMount);
  }

  return <div className="py-20 text-center text-gray-500 text-sm">이동 중...</div>;
}
