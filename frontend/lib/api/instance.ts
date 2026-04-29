import axios from 'axios';
import type { ApiError } from '@/types/post';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
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
