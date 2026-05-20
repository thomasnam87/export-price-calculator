"use client";

import { useRef, useState } from 'react';
import type { FormState, CostLine } from '@/types/schema';
import { DEFAULT_COST_LINES } from '@/lib/calculations';

interface ExtractedData {
  pol?: string;
  pod?: string;
  container_type?: string;
  ocean_freight_usd?: number;
  exchange_rate?: number;
  charges?: Array<{ label: string; amount: number; currency: 'USD' | 'VND' }>;
}

interface Props {
  onApply: (patch: Partial<FormState>) => void;
}

export default function ForwarderUpload({ onApply }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExtractedData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setError('Chỉ hỗ trợ file PDF.');
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);
    setFileName(file.name);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/parse-forwarder', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data: ExtractedData = await res.json();
      setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không đọc được file.');
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleApply() {
    if (!preview) return;

    const patch: Partial<FormState> = {};

    if (preview.pol) patch.pol = preview.pol;
    if (preview.pod) patch.pod = preview.pod;
    if (preview.ocean_freight_usd !== undefined)
      patch.ocean_freight_usd = String(preview.ocean_freight_usd);
    if (preview.exchange_rate)
      patch.exchange_rate = String(preview.exchange_rate);
    if (preview.container_type) {
      const ct = preview.container_type;
      if (ct === '40HQ') patch.container_type = '40HQ';
      else if (ct === '40ft') patch.container_type = '40ft';
      else if (ct === '20ft') patch.container_type = '20ft';
    }

    if (preview.charges && preview.charges.length > 0) {
      // Build cost lines: start from default labels, fill amounts; then append extras
      const defaultLabels = DEFAULT_COST_LINES.map((l) => l.label.toLowerCase());
      const filled: CostLine[] = DEFAULT_COST_LINES.map((def) => ({ ...def, amount: '' }));
      const extra: CostLine[] = [];

      for (const ch of preview.charges) {
        const idx = filled.findIndex(
          (l) => l.label.toLowerCase() === ch.label.toLowerCase()
        );
        if (idx >= 0) {
          filled[idx] = {
            ...filled[idx],
            amount: String(ch.amount),
            currency: ch.currency,
          };
        } else {
          extra.push({
            id: crypto.randomUUID(),
            label: ch.label,
            amount: String(ch.amount),
            currency: ch.currency,
          });
        }
      }

      patch.cost_lines = [...filled, ...extra];
    }

    onApply(patch);
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function fmt(amount: number, currency: string): string {
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    return amount.toLocaleString('vi-VN') + ' ₫';
  }

  return (
    <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📄</span>
        <div>
          <h3 className="text-sm font-semibold text-blue-800">
            Import báo giá forwarder (PDF)
          </h3>
          <p className="text-xs text-blue-600">
            AI sẽ tự động đọc và điền chi phí vào form
          </p>
        </div>
      </div>

      {/* Drop zone */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-md border-2 border-dashed border-blue-200 bg-white px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm text-blue-600">AI đang đọc báo giá…</p>
              <p className="text-xs text-gray-400">{fileName}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Nhấn để chọn</span> hoặc kéo thả file PDF vào đây
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Báo giá forwarder (APS, Safi, Việt Hà…)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-xs underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Preview extracted data */}
      {preview && (
        <div className="mt-3 rounded-md border border-blue-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">
              ✅ Đọc được từ: <span className="text-blue-600">{fileName}</span>
            </p>
            <button
              onClick={() => {
                setPreview(null);
                setFileName(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Hủy
            </button>
          </div>

          {/* Summary */}
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {preview.pol && (
              <div className="rounded bg-gray-50 p-2">
                <div className="text-gray-500">POL</div>
                <div className="font-semibold text-gray-800">{preview.pol}</div>
              </div>
            )}
            {preview.pod && (
              <div className="rounded bg-gray-50 p-2">
                <div className="text-gray-500">POD</div>
                <div className="font-semibold text-gray-800">{preview.pod}</div>
              </div>
            )}
            {preview.container_type && (
              <div className="rounded bg-gray-50 p-2">
                <div className="text-gray-500">Container</div>
                <div className="font-semibold text-gray-800">{preview.container_type}</div>
              </div>
            )}
            {preview.ocean_freight_usd !== undefined && (
              <div className="rounded bg-blue-50 p-2">
                <div className="text-blue-600">Ocean Freight</div>
                <div className="font-semibold text-blue-800">${preview.ocean_freight_usd.toLocaleString()}</div>
              </div>
            )}
            {preview.exchange_rate && (
              <div className="rounded bg-gray-50 p-2">
                <div className="text-gray-500">Tỷ giá</div>
                <div className="font-semibold text-gray-800">{preview.exchange_rate.toLocaleString()} VND/$</div>
              </div>
            )}
          </div>

          {/* Charges list */}
          {preview.charges && preview.charges.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Chi phí nội địa ({preview.charges.length} khoản)
              </p>
              <div className="max-h-48 overflow-y-auto rounded border border-gray-100">
                {preview.charges.map((ch, i) => (
                  <div
                    key={i}
                    className={`flex justify-between px-3 py-1.5 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <span className="text-gray-700">{ch.label}</span>
                    <span className={`font-medium tabular-nums ${ch.currency === 'USD' ? 'text-green-700' : 'text-gray-700'}`}>
                      {fmt(ch.amount, ch.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleApply}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Áp dụng vào form →
          </button>
        </div>
      )}
    </div>
  );
}
