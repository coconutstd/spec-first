'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, updatePost } from '@/lib/api/posts';
import { postQueryKeys } from '@/lib/queryKeys';
import type { ApiError } from '@/types/post';

interface FormValues {
  nickname: string;
  password: string;
  title: string;
  body: string;
}

interface FormErrors {
  nickname?: string;
  password?: string;
  title?: string;
  body?: string;
}

function validatePost(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.nickname.length < 2) {
    errors.nickname = '닉네임은 2자 이상이어야 합니다';
  } else if (values.nickname.length > 20) {
    errors.nickname = '닉네임은 20자 이하여야 합니다';
  }
  if (values.password.length < 4) {
    errors.password = '비밀번호는 4자 이상이어야 합니다';
  }
  if (values.title.trim().length === 0) {
    errors.title = '제목을 입력해 주세요';
  } else if (values.title.length > 100) {
    errors.title = '제목은 100자 이하여야 합니다';
  }
  if (values.body.trim().length === 0) {
    errors.body = '본문을 입력해 주세요';
  } else if (values.body.length > 5000) {
    errors.body = '본문은 5,000자 이하여야 합니다';
  }
  return errors;
}

interface PostFormProps {
  mode: 'create';
}

interface EditPostFormProps {
  mode: 'edit';
  postId: number;
  password: string;
  initialTitle: string;
  initialBody: string;
}

type Props = PostFormProps | EditPostFormProps;

export default function PostForm(props: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<FormValues>(() => {
    if (props.mode === 'edit') {
      return {
        nickname: '',
        password: props.password,
        title: props.initialTitle,
        body: props.initialBody,
      };
    }
    return { nickname: '', password: '', title: '', body: '' };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
      router.push(`/posts/${data.id}`);
    },
    onError: (err: ApiError) => {
      if (err.code === 'RATE_LIMIT_EXCEEDED') {
        setServerError('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.');
      } else {
        setServerError(err.message ?? '게시글 등록에 실패했습니다.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ title, body }: { title: string; body: string }) => {
      if (props.mode !== 'edit') throw new Error('invalid mode');
      return updatePost(props.postId, { password: props.password, title, body });
    },
    onSuccess: () => {
      if (props.mode !== 'edit') return;
      queryClient.invalidateQueries({ queryKey: postQueryKeys.detail(props.postId) });
      router.push(`/posts/${props.postId}`);
    },
    onError: (err: ApiError) => {
      setServerError(err.message ?? '게시글 수정에 실패했습니다.');
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

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

    if (props.mode === 'edit') {
      const editErrors: FormErrors = {};
      if (values.title.trim().length === 0) {
        editErrors.title = '제목을 입력해 주세요';
      } else if (values.title.length > 100) {
        editErrors.title = '제목은 100자 이하여야 합니다';
      }
      if (values.body.trim().length === 0) {
        editErrors.body = '본문을 입력해 주세요';
      } else if (values.body.length > 5000) {
        editErrors.body = '본문은 5,000자 이하여야 합니다';
      }
      if (Object.keys(editErrors).length > 0) {
        setErrors(editErrors);
        return;
      }
      updateMutation.mutate({ title: values.title, body: values.body });
      return;
    }

    const newErrors = validatePost(values);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    createMutation.mutate({
      nickname: values.nickname,
      password: values.password,
      title: values.title,
      body: values.body,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {props.mode === 'create' && (
        <>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              id="nickname"
              type="text"
              value={values.nickname}
              onChange={handleChange('nickname')}
              placeholder="2~20자"
              maxLength={20}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby={errors.nickname ? 'nickname-error' : undefined}
            />
            {errors.nickname && (
              <p id="nickname-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.nickname}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={values.password}
              onChange={handleChange('password')}
              placeholder="4자 이상"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="new-password"
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>
        </>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={handleChange('title')}
          placeholder="1~100자"
          maxLength={100}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          본문 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          value={values.body}
          onChange={handleChange('body')}
          placeholder="1~5,000자"
          maxLength={5000}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          aria-describedby={errors.body ? 'body-error' : undefined}
        />
        {errors.body && (
          <p id="body-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.body}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {props.mode === 'edit' ? (isLoading ? '저장 중...' : '저장') : isLoading ? '등록 중...' : '등록'}
        </button>
      </div>
    </form>
  );
}
