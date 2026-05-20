"use client";

import type { FormState, CalculationResult, PackingType, ContainerType } from '@/types/schema';

const inputCls =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide';
const readonlyCls =
  'mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500';

interface Props {
  form: FormState;
  results: CalculationResult;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function PackingSection({ form, results, setField }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        2. Packing &amp; Container
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Packing Type</label>
          <select
            className={inputCls}
            value={form.packing_type}
            onChange={(e) => setField('packing_type', e.target.value as PackingType)}
          >
            <option value="carton">Carton</option>
            <option value="wooden_crate">Wooden Crate</option>
            <option value="bag">Bag</option>
            <option value="drum">Drum</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Container Type</label>
          <select
            className={inputCls}
            value={form.container_type}
            onChange={(e) => setField('container_type', e.target.value as ContainerType)}
          >
            <option value="20ft">20ft</option>
            <option value="40ft">40ft</option>
            <option value="40HQ">40HQ</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Gross Weight / Box (kg)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            placeholder="e.g. 22"
            value={form.gross_weight_per_box}
            onChange={(e) => setField('gross_weight_per_box', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Net Weight / Box (kg)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            placeholder="e.g. 20"
            value={form.net_weight_per_box}
            onChange={(e) => setField('net_weight_per_box', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Boxes per Container</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            placeholder="e.g. 900"
            value={form.boxes_per_container}
            onChange={(e) => setField('boxes_per_container', e.target.value)}
          />
        </div>
        <div />

        {/* Computed outputs */}
        <div>
          <label className={labelCls}>Total Net Weight (kg) — auto</label>
          <div className={readonlyCls}>
            {results.total_net_weight_kg > 0
              ? results.total_net_weight_kg.toLocaleString()
              : '—'}
          </div>
        </div>
        <div>
          <label className={labelCls}>Total Gross Weight (kg) — auto</label>
          <div className={readonlyCls}>
            {results.total_gross_weight_kg > 0
              ? results.total_gross_weight_kg.toLocaleString()
              : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
