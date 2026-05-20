"use client";

import { useEffect, useState } from 'react';
import { listQuotations, deleteQuotation } from '@/lib/db';
import type { SavedQuotation } from '@/types/schema';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  onLoad: (saved: SavedQuotation) => void;
  sessionId: string;
}

export default function SavedQuotations({ onLoad, sessionId }: Props) {
  const [open, setOpen] = useState(false);
  const [quotations, setQuotations] = useState<SavedQuotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listQuotations(sessionId);
      setQuotations(data);
    } catch {
      setError('Failed to load saved quotations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteQuotation(id, sessionId);
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch {
      setError('Delete failed.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-base font-semibold text-gray-800">Saved Quotations</span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 pb-6 pt-4">
          {loading && <p className="text-sm text-gray-400">Loading…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && quotations.length === 0 && (
            <p className="text-sm text-gray-400">
              No saved quotations yet. Fill in the form and click &quot;Save Quotation&quot;.
            </p>
          )}
          {!loading && quotations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">CIF Quote/kg</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Revenue</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Saved</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{q.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{q.product_name || '—'}</td>
                      <td className="py-2 pr-4 tabular-nums text-gray-600">
                        ${q.results.cif_quote_per_kg.toFixed(4)}/kg
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-gray-600">
                        ${q.results.total_revenue_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 pr-4 text-xs text-gray-400">{fmtDate(q.created_at)}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onLoad(q)}
                            className="rounded-md border border-blue-200 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            disabled={deleting === q.id}
                            className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === q.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            onClick={load}
            className="mt-3 text-xs text-gray-400 underline hover:text-gray-600"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
