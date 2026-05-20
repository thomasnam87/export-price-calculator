import type { FormState, CalculationResult, CostLine } from '@/types/schema';

function n(val: string): number {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

export const DEFAULT_COST_LINES: CostLine[] = [
  { id: '1', label: 'Local charges', amount: '', currency: 'USD' },
  { id: '2', label: 'Inland trucking', amount: '', currency: 'USD' },
  { id: '3', label: 'THC', amount: '', currency: 'USD' },
  { id: '4', label: 'DOC fee', amount: '', currency: 'USD' },
  { id: '5', label: 'Seal fee', amount: '', currency: 'USD' },
  { id: '6', label: 'Customs clearance', amount: '', currency: 'USD' },
  { id: '7', label: 'Fumigation', amount: '', currency: 'USD' },
  { id: '8', label: 'Phytosanitary', amount: '', currency: 'USD' },
  { id: '9', label: 'C/O', amount: '', currency: 'USD' },
  { id: '10', label: 'Other charges', amount: '', currency: 'USD' },
];

export const DEFAULT_FORM_STATE: FormState = {
  quotation_name: '',
  product_name: '',
  hs_code: '',
  exw_price_vnd: '',
  export_tax_rate: '0',
  exchange_rate: '25000',
  packing_type: 'carton',
  gross_weight_per_box: '',
  net_weight_per_box: '',
  boxes_per_container: '',
  container_type: '20ft',
  cost_lines: DEFAULT_COST_LINES,
  pol: '',
  pod: '',
  ocean_freight_usd: '',
  insurance_rate: '0.5',
  profit_markup: '15',
};

export function calculateAll(form: FormState): CalculationResult {
  const exw_price_vnd = n(form.exw_price_vnd);
  const export_tax_rate = n(form.export_tax_rate);
  const exchange_rate = n(form.exchange_rate);
  const gross_weight_per_box = n(form.gross_weight_per_box);
  const net_weight_per_box = n(form.net_weight_per_box);
  const boxes_per_container = n(form.boxes_per_container);
  const ocean_freight_usd = n(form.ocean_freight_usd);
  const insurance_rate = n(form.insurance_rate);
  const profit_markup = n(form.profit_markup);

  const total_net_weight_kg = net_weight_per_box * boxes_per_container;
  const total_gross_weight_kg = gross_weight_per_box * boxes_per_container;

  const safe_net = total_net_weight_kg > 0 ? total_net_weight_kg : 1;
  const safe_fx = exchange_rate > 0 ? exchange_rate : 1;

  const exw_usd_per_kg = exw_price_vnd / safe_fx;
  const export_tax_usd_per_kg = exw_usd_per_kg * (export_tax_rate / 100);

  const cost_lines_converted = form.cost_lines.map((line) => {
    const amt = n(line.amount);
    const amount_usd = line.currency === 'USD' ? amt : amt / safe_fx;
    return { label: line.label, amount_usd };
  });

  const local_costs_usd_total = cost_lines_converted.reduce(
    (sum, l) => sum + l.amount_usd,
    0
  );
  const local_costs_usd_per_kg =
    total_net_weight_kg > 0 ? local_costs_usd_total / total_net_weight_kg : 0;

  const fob_cost_per_kg =
    exw_usd_per_kg + export_tax_usd_per_kg + local_costs_usd_per_kg;

  const ocean_freight_usd_per_kg =
    total_net_weight_kg > 0 ? ocean_freight_usd / safe_net : 0;
  const cfr_cost_per_kg = fob_cost_per_kg + ocean_freight_usd_per_kg;

  // ICC standard: CIF = CFR / (1 - r)
  const ins_rate_dec = insurance_rate / 100;
  const cif_cost_per_kg =
    ins_rate_dec < 1 ? cfr_cost_per_kg / (1 - ins_rate_dec) : cfr_cost_per_kg;
  const insurance_usd_per_kg = cif_cost_per_kg - cfr_cost_per_kg;

  const profit_multiplier = 1 + profit_markup / 100;
  const fob_quote_per_kg = fob_cost_per_kg * profit_multiplier;
  const cfr_quote_per_kg = cfr_cost_per_kg * profit_multiplier;
  const cif_quote_per_kg = cif_cost_per_kg * profit_multiplier;

  const total_revenue_usd = cif_quote_per_kg * total_net_weight_kg;
  const total_cost_usd = cif_cost_per_kg * total_net_weight_kg;
  const profit_usd = total_revenue_usd - total_cost_usd;

  return {
    total_net_weight_kg,
    total_gross_weight_kg,
    exw_usd_per_kg,
    export_tax_usd_per_kg,
    local_costs_usd_total,
    local_costs_usd_per_kg,
    ocean_freight_usd_per_kg,
    insurance_usd_per_kg,
    fob_cost_per_kg,
    cfr_cost_per_kg,
    cif_cost_per_kg,
    fob_quote_per_kg,
    cfr_quote_per_kg,
    cif_quote_per_kg,
    total_revenue_usd,
    total_cost_usd,
    profit_usd,
    cost_lines_converted,
  };
}
