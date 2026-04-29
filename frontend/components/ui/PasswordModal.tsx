'use client';

import { useState } from 'react';
import Modal from './Modal';

interface PasswordModalProps {
  title: string;
  errorMessage?: string;
  isLoading?: boolean;
  onConfirm: (password: string) => void;
  onClose: () => void;
}

export default function PasswordModal({
  title,
  errorMessage,
  isLoading = false,
  onConfirm,
  onClose,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            id="modal-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            autoComplete="current-password"
          />
          {errorMessage && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '처리 중...' : '확인'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
