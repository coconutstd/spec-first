import { getPost } from '@/lib/api/posts';
import PostDetail from '@/components/posts/PostDetail';
import Link from 'next/link';
import type { ApiError } from '@/types/post';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  try {
    const post = await getPost(Number(id));
    return { title: `${post.title} | 게시판` };
  } catch {
    return { title: '게시판' };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  let errorCode: string | null = null;
  let post = null;

  try {
    post = await getPost(postId);
  } catch (err) {
    const apiErr = err as ApiError;
    errorCode = apiErr?.code ?? 'UNKNOWN';
  }

  if (errorCode === 'POST_DELETED') {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">삭제된 게시글입니다</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (errorCode === 'POST_NOT_FOUND' || errorCode === 'UNKNOWN') {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">존재하지 않는 게시글입니다</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 mb-4">존재하지 않는 게시글입니다</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← 목록으로
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <PostDetail post={post} />
      </div>
    </div>
  );
}
