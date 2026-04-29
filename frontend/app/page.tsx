import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import PostList from '@/components/posts/PostList';

interface HomePageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // 빈 검색어인 경우 "/" 로 리다이렉트
  if ('q' in params && (params.q === '' || params.q === undefined)) {
    redirect('/');
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">게시글 목록</h1>
      <Suspense fallback={<div className="py-20 text-center text-gray-500 text-sm">불러오는 중...</div>}>
        <PostList />
      </Suspense>
    </div>
  );
}
