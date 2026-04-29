'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '@/lib/api/comments';
import { commentQueryKeys } from '@/lib/queryKeys';
import type { ApiError } from '@/types/post';

interface FormValues {
  nickname: string;
  password: string;
  body: string;
}

interface FormErrors {
  nickname?: string;
  password?: string;
  body?: string;
}

function validateComment(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.nickname.length < 2) {
    errors.nickname = '닉네임은 2자 이상이어야 합니다';
  } else if (values.nickname.length > 20) {
    errors.nickname = '닉네임은 20자 이하여야 합니다';
  }
  if (values.password.length < 4) {
    errors.password = '비밀번호는 4자 이상이어야 합니다';
  }
  if (values.body.trim().length === 0) {
    errors.body = '댓글 내용을 입력해 주세요';
  } else if (values.body.length > 500) {
    errors.body = '댓글은 500자 이하여야 합니다';
  }
  return errors;
}

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<FormValues>({ nickname: '', password: '', body: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');

  const mutation = useMutation({
    mutationFn: () => createComment(postId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentQueryKeys.list(postId) });
      setValues({ nickname: '', password: '', body: '' });
      setServerError('');
    },
    onError: (err: ApiError) => {
      setServerError(err.message ?? '댓글 등록에 실패했습니다.');
    },
  });

  const handleChange = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const newErrors = validateComment(values);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="comment-nickname" className="block text-sm font-medium text-gray-700 mb-1">
            닉네임
          </label>
          <input
            id="comment-nickname"
            type="text"
            value={values.nickname}
            onChange={handleChange('nickname')}
            placeholder="2~20자"
            maxLength={20}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nickname && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.nickname}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="comment-password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            id="comment-password"
            type="password"
            value={values.password}
            onChange={handleChange('password')}
            placeholder="4자 이상"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.password}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment-body" className="block text-sm font-medium text-gray-700 mb-1">
          내용
        </label>
        <textarea
          id="comment-body"
          value={values.body}
          onChange={handleChange('body')}
          placeholder="댓글을 입력해 주세요 (1~500자)"
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        {errors.body && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.body}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  );
}
