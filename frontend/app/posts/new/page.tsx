import Link from 'next/link';
import PostForm from '@/components/posts/PostForm';

export const metadata = { title: '게시글 작성 | 게시판' };

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900">게시글 작성</h1>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
