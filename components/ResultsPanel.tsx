"use client";

import type { FormState, CalculationResult } from '@/types/schema';

function fmt4(val: number): string {
  return val.toFixed(4);
}

function fmtTotal(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtUSD(val: number): string {
  return `$${fmtTotal(val)}`;
}

interface CostRow {
  label: string;
  perKg: number;
  total: number;
  bold?: boolean;
  highlight?: boolean;
}

interface Props {
  form: FormState;
  results: CalculationResult;
  onSave: () => void;
  saving: boolean;
  saveError: string | null;
  copied: boolean;
  onCopy: () => void;
  onExportPdf: () => void;
}

export default function ResultsPanel({
  form,
  results,
  onSave,
  saving,
  saveError,
  copied,
  onCopy,
  onExportPdf,
}: Props) {
  const hasData = results.total_net_weight_kg > 0 && results.exw_usd_per_kg > 0;

  const costRows: CostRow[] = [
    { label: 'EXW Price', perKg: results.exw_usd_per_kg, total: results.exw_usd_per_kg * results.total_net_weight_kg },
    { label: 'Export Tax', perKg: results.export_tax_usd_per_kg, total: results.export_tax_usd_per_kg * results.total_net_weight_kg },
    { label: 'Local Charges', perKg: results.local_costs_usd_per_kg, total: results.local_costs_usd_total },
    { label: 'FOB Cost', perKg: results.fob_cost_per_kg, total: results.fob_cost_per_kg * results.total_net_weight_kg, bold: true },
    { label: 'Ocean Freight', perKg: results.ocean_freight_usd_per_kg, total: parseFloat(form.ocean_freight_usd) || 0 },
    { label: 'CFR Cost', perKg: results.cfr_cost_per_kg, total: results.cfr_cost_per_kg * results.total_net_weight_kg, bold: true },
    { label: 'Insurance', perKg: results.insurance_usd_per_kg, total: results.insurance_usd_per_kg * results.total_net_weight_kg },
    { label: 'CIF Cost', perKg: results.cif_cost_per_kg, total: results.cif_cost_per_kg * results.total_net_weight_kg, bold: true, highlight: true },
  ];

  const quoteRows = [
    { term: `FOB ${form.pol || '—'}`, perKg: results.fob_quote_per_kg, total: results.fob_quote_per_kg * results.total_net_weight_kg },
    { term: `CFR ${form.pod || '—'}`, perKg: results.cfr_quote_per_kg, total: results.cfr_quote_per_kg * results.total_net_weight_kg },
    { term: `CIF ${form.pod || '—'}`, perKg: results.cif_quote_per_kg, total: results.total_revenue_usd },
  ];

  const profitPct = results.total_cost_usd > 0
    ? ((results.profit_usd / results.total_cost_usd) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      {/* Cost Build-Up */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Cost Build-Up</h2>
        </div>
        {!hasData ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Enter product and packing details to see calculations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-semibold text-gray-600">Component</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600">USD/kg</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600">Container</th>
                </tr>
              </thead>
              <tbody>
                {costRows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={[
                      'border-t border-gray-100',
                      row.highlight ? 'bg-blue-50' : row.bold ? 'bg-gray-50' : '',
                    ].join(' ')}
                  >
                    <td className={`px-3 py-2 ${row.bold ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {row.label}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${row.bold ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      ${fmt4(row.perKg)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${row.bold ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      ${fmtTotal(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quote Prices */}
      {hasData && (
        <div className="rounded-lg border border-blue-200 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-blue-600 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">
              Quote Prices ({form.profit_markup || '0'}% profit)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-50 text-left">
                  <th className="px-3 py-2 font-semibold text-blue-700">Incoterm</th>
                  <th className="px-3 py-2 text-right font-semibold text-blue-700">USD/kg</th>
                  <th className="px-3 py-2 text-right font-semibold text-blue-700">Container</th>
                </tr>
              </thead>
              <tbody>
                {quoteRows.map((row, i) => (
                  <tr
                    key={row.term}
                    className={`border-t border-blue-100 ${i === quoteRows.length - 1 ? 'bg-blue-50' : ''}`}
                  >
                    <td className={`px-3 py-2 font-semibold ${i === quoteRows.length - 1 ? 'text-blue-800' : 'text-gray-700'}`}>
                      {row.term}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${i === quoteRows.length - 1 ? 'text-blue-800' : 'text-gray-700'}`}>
                      ${fmt4(row.perKg)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${i === quoteRows.length - 1 ? 'text-blue-800' : 'text-gray-700'}`}>
                      ${fmtTotal(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Container Summary */}
      {hasData && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">
            Container Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue (CIF)</span>
              <span className="font-semibold text-gray-800">{fmtUSD(results.total_revenue_usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-semibold text-gray-800">{fmtUSD(results.total_cost_usd)}</span>
            </div>
            <div className="border-t border-green-200 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-green-700">Estimated Profit</span>
                <span className="text-lg font-bold text-green-700">
                  {fmtUSD(results.profit_usd)}
                  <span className="ml-1 text-sm font-normal text-green-600">({profitPct}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !hasData}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Quotation'}
        </button>
        {saveError && (
          <p className="text-xs text-red-500">{saveError}</p>
        )}
        <button
          type="button"
          onClick={onExportPdf}
          disabled={!hasData}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={onCopy}
          disabled={!hasData}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? '✓ Copied!' : 'Copy Email Quotation'}
        </button>
      </div>
    </div>
  );
}
