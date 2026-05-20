"use client";

import { useState } from 'react';
import type { CompanyProfile } from '@/types/company';

interface Props {
  initialProfile: CompanyProfile;
  onSave: (profile: CompanyProfile) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
}

export default function CompanyProfileModal({ initialProfile, onSave, onClose, isFirstTime }: Props) {
  const [form, setForm] = useState<CompanyProfile>(initialProfile);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) {
      setError('Vui lòng nhập tên công ty');
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-xl bg-blue-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {isFirstTime ? '👋 Chào mừng! Thiết lập công ty của bạn' : '⚙️ Cài đặt công ty'}
          </h2>
          {isFirstTime && (
            <p className="mt-1 text-sm text-blue-200">
              Tên công ty sẽ hiển thị trên PDF và email báo giá
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tên công ty <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
              placeholder="VD: Happy Viet Ltd."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>
            <input
              type="email"
              value={form.company_email}
              onChange={e => setForm(p => ({ ...p, company_email: e.target.value }))}
              placeholder="VD: sales@company.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={form.company_phone}
              onChange={e => setForm(p => ({ ...p, company_phone: e.target.value }))}
              placeholder="VD: +84 90 123 4567"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Lưu & bắt đầu
            </button>
            {!isFirstTime && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Huỷ
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
