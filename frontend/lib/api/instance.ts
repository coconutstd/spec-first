import axios from 'axios';
import type { ApiError } from '@/types/post';

// 서버 사이드(SSR): 백엔드 직접 호출 (서버 간 통신, CORS 없음)
// 클라이언트 사이드: /api/* 경로로 호출 → Next.js rewrites가 백엔드로 프록시
const baseURL =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')
    : '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError;
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
