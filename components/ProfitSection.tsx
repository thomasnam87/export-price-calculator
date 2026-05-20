"use client";

import type { FormState } from '@/types/schema';

const inputCls =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide';

interface Props {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function ProfitSection({ form, setField }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        5. Profit Markup
      </h2>
      <div className="max-w-xs">
        <label className={labelCls}>Profit Markup (%)</label>
        <input
          type="number"
          min="0"
          max="1000"
          step="0.1"
          className={inputCls}
          placeholder="e.g. 15"
          value={form.profit_markup}
          onChange={(e) => setField('profit_markup', e.target.value)}
        />
        <p className="mt-2 text-xs text-gray-400">
          Applied equally to FOB, CFR, and CIF quote prices.
        </p>
      </div>
    </div>
  );
}
