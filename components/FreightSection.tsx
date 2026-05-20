"use client";

import type { FormState } from '@/types/schema';

const inputCls =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide';

interface Props {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function FreightSection({ form, setField }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        4. Freight &amp; Insurance
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Port of Loading (POL)</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Hai Phong"
            value={form.pol}
            onChange={(e) => setField('pol', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Port of Discharge (POD)</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Osaka"
            value={form.pod}
            onChange={(e) => setField('pod', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Ocean Freight / Container (USD)</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            placeholder="e.g. 1800"
            value={form.ocean_freight_usd}
            onChange={(e) => setField('ocean_freight_usd', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Insurance Rate (%)</label>
          <input
            type="number"
            min="0"
            max="99.9"
            step="0.01"
            className={inputCls}
            placeholder="e.g. 0.5"
            value={form.insurance_rate}
            onChange={(e) => setField('insurance_rate', e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">
            Applied on CIF value (ICC standard)
          </p>
        </div>
      </div>
    </div>
  );
}
