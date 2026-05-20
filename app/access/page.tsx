"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Mã truy cập không đúng. Vui lòng kiểm tra lại.');
      }
    } catch {
      setError('Lỗi kết nối. Thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-blue-700 px-8 py-6 text-center">
          <h1 className="text-xl font-bold text-white">Export Price Calculator</h1>
          <p className="mt-1 text-sm text-blue-200">EXW → FOB → CFR → CIF</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <p className="mb-4 text-sm text-gray-600">
            Nhập mã truy cập để sử dụng công cụ tính giá xuất khẩu.
          </p>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Mã truy cập
          </label>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Nhập mã..."
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Đang kiểm tra…' : 'Truy cập →'}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Chưa có mã?{' '}
            <a
              href="https://whop.com/export-toolkit-pro/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Mua access tại đây →
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
