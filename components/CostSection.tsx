"use client";

import type { FormState, CalculationResult, CostLine, CostCurrency } from '@/types/schema';

const labelCls = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide';

function usd(val: number): string {
  return `$${val.toFixed(4)}`;
}

function usdTotal(val: number): string {
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  form: FormState;
  results: CalculationResult;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

export default function CostSection({ form, results, setField }: Props) {
  function updateLine(id: string, patch: Partial<CostLine>) {
    setField(
      'cost_lines',
      form.cost_lines.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  }

  function addLine() {
    const newLine: CostLine = {
      id: crypto.randomUUID(),
      label: '',
      amount: '',
      currency: 'USD',
    };
    setField('cost_lines', [...form.cost_lines, newLine]);
  }

  function removeLine(id: string) {
    setField('cost_lines', form.cost_lines.filter((l) => l.id !== id));
  }

  const exchangeRate = parseFloat(form.exchange_rate) || 25000;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">
        3. Local Charges &amp; Costs
      </h2>

      {/* Column headers */}
      <div className="mb-2 hidden grid-cols-[1fr_140px_80px_32px] gap-2 sm:grid">
        <span className={labelCls}>Description</span>
        <span className={labelCls}>Amount</span>
        <span className={labelCls}>Currency</span>
        <span />
      </div>

      <div className="space-y-2">
        {form.cost_lines.map((line, idx) => {
          const converted = results.cost_lines_converted[idx];
          return (
            <div key={line.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_80px_32px] sm:items-center">
              <input
                type="text"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Charge description"
                value={line.label}
                onChange={(e) => updateLine(line.id, { label: e.target.value })}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
                value={line.amount}
                onChange={(e) => updateLine(line.id, { amount: e.target.value })}
              />
              <select
                className="rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={line.currency}
                onChange={(e) => updateLine(line.id, { currency: e.target.value as CostCurrency })}
              >
                <option value="USD">USD</option>
                <option value="VND">VND</option>
              </select>
              <button
                type="button"
                onClick={() => removeLine(line.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addLine}
        className="mt-3 rounded-md border border-dashed border-blue-300 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
      >
        + Add charge
      </button>

      {/* Totals */}
      <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total local costs (USD)</span>
          <span className="font-semibold text-gray-800">
            {usdTotal(results.local_costs_usd_total)}
          </span>
        </div>
        {results.total_net_weight_kg > 0 && (
          <div className="mt-1 flex justify-between">
            <span className="text-gray-600">Cost per kg</span>
            <span className="font-semibold text-gray-800">
              {usd(results.local_costs_usd_per_kg)}/kg
            </span>
          </div>
        )}
      </div>

      {/* Per-line breakdown (only when amounts entered) */}
      {results.cost_lines_converted.some((l) => l.amount_usd > 0) && (
        <div className="mt-3">
          <p className={`${labelCls} mb-2`}>Line breakdown (USD)</p>
          <div className="space-y-1">
            {results.cost_lines_converted.map((l) =>
              l.amount_usd > 0 ? (
                <div key={l.label} className="flex justify-between text-xs text-gray-500">
                  <span>{l.label || '(unnamed)'}</span>
                  <span>{usdTotal(l.amount_usd)}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
