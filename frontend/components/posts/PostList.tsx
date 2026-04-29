'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/api/posts';
import { postQueryKeys } from '@/lib/queryKeys';
import Pagination from '@/components/ui/Pagination';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function PostList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const pageParam = Number(searchParams.get('page') ?? '1');
  const [searchInput, setSearchInput] = useState(q);

  const { data, isLoading, isError } = useQuery({
    queryKey: postQueryKeys.list({ q: q || undefined, page: pageParam }),
    queryFn: () => getPosts({ q: q || undefined, page: pageParam }),
    staleTime: 30_000,
  });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim() === '') {
        router.push('/');
      } else {
        router.push(`/?q=${encodeURIComponent(searchInput.trim())}`);
      }
    },
    [searchInput, router],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('page', String(page));
      router.push(`/?${params.toString()}`);
    },
    [q, router],
  );

  const isEmpty = data?.data.length === 0;
  const emptyMessage = q ? '검색 결과가 없습니다' : '아직 게시글이 없습니다';

  return (
    <div className="w-full">
      {/* 검색 + 글쓰기 버튼 */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            role="searchbox"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목 또는 본문으로 검색"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="검색어 입력"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            검색
          </button>
        </form>
        <Link
          href="/posts/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors text-center whitespace-nowrap"
        >
          글쓰기
        </Link>
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-500 text-sm">불러오는 중...</div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500 text-sm">
          게시글을 불러오지 못했습니다.
        </div>
      ) : isEmpty ? (
        <div className="py-20 text-center text-gray-500 text-sm">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border border-gray-200 px-3 py-2 text-center w-12 font-medium">
                  번호
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium">
                  제목
                </th>
                <th className="border border-gray-200 px-3 py-2 text-center hidden sm:table-cell font-medium">
                  닉네임
                </th>
                <th className="border border-gray-200 px-3 py-2 text-center hidden md:table-cell font-medium">
                  작성일
                </th>
                <th className="border border-gray-200 px-3 py-2 text-center hidden sm:table-cell font-medium">
                  조회수
                </th>
                <th className="border border-gray-200 px-3 py-2 text-center hidden sm:table-cell font-medium">
                  댓글
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((post, index) => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border border-gray-200 px-3 py-2 text-center text-gray-500">
                    {(data.meta.total ?? 0) - ((pageParam - 1) * (data.meta.limit ?? 20)) - index}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-blue-700 hover:underline font-medium"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center hidden sm:table-cell text-gray-600">
                    {post.nickname}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center hidden md:table-cell text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center hidden sm:table-cell text-gray-500">
                    {post.viewCount}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center hidden sm:table-cell text-gray-500">
                    {post.commentCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {data && data.meta.totalPages > 1 && (
        <Pagination
          page={pageParam}
          totalPages={data.meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
