"use client";

import type { FormState } from '@/types/schema';

const inputCls =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide';

interface Props {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function ProductSection({ form, setField }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        1. Product Information
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Quotation Name</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Binchotan Charcoal — Q2 2025"
            value={form.quotation_name}
            onChange={(e) => setField('quotation_name', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Product Name</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Binchotan Charcoal"
            value={form.product_name}
            onChange={(e) => setField('product_name', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>HS Code</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. 4402.90.10"
            value={form.hs_code}
            onChange={(e) => setField('hs_code', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Factory Price (VND/kg) — EXW</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            placeholder="e.g. 50000"
            value={form.exw_price_vnd}
            onChange={(e) => setField('exw_price_vnd', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Export Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            className={inputCls}
            placeholder="e.g. 0"
            value={form.export_tax_rate}
            onChange={(e) => setField('export_tax_rate', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Exchange Rate (VND / 1 USD)</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            placeholder="e.g. 25000"
            value={form.exchange_rate}
            onChange={(e) => setField('exchange_rate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
