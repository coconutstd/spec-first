import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/ui/QueryProvider';
import Link from 'next/link';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: '게시판',
  description: '단순 게시판 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans antialiased">
        <QueryProvider>
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <Link
                href="/"
                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                게시판
              </Link>
            </div>
          </header>
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-4xl mx-auto px-4 py-3 text-center text-xs text-gray-400">
              단순 게시판 서비스
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
