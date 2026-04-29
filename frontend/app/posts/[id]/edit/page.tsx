import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import EditPostClient from './EditPostClient';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: '게시글 수정 | 게시판' };

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  // Server Component에서 직접 접근 감지:
  // referer가 없거나 상세 페이지(/posts/:id)가 아닌 경로에서 온 경우 리다이렉트
  const headersList = await headers();
  const referer = headersList.get('referer') ?? '';

  // referer가 없으면 직접 URL 접근으로 간주 → 상세 페이지로 리다이렉트
  if (!referer) {
    redirect(`/posts/${postId}`);
  }

  // referer가 있어도 /posts/:id/edit 이외 경로(즉, 상세 페이지의 수정 버튼이 아닌 곳)에서 온 경우 처리
  // 상세 페이지 (/posts/:id) 또는 동일 edit 페이지 내 폼 제출에서만 허용
  const allowedPattern = new RegExp(`/posts/${postId}($|/edit)`);
  if (!allowedPattern.test(referer)) {
    redirect(`/posts/${postId}`);
  }

  return <EditPostClient postId={postId} />;
}
