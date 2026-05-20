export type PackingType = 'carton' | 'wooden_crate' | 'bag' | 'drum';
export type ContainerType = '20ft' | '40ft' | '40HQ';
export type CostCurrency = 'USD' | 'VND';

export interface CostLine {
  id: string;
  label: string;
  amount: string;
  currency: CostCurrency;
}

export interface FormState {
  quotation_name: string;
  // Product
  product_name: string;
  hs_code: string;
  exw_price_vnd: string;
  export_tax_rate: string;
  exchange_rate: string;
  // Packing
  packing_type: PackingType;
  gross_weight_per_box: string;
  net_weight_per_box: string;
  boxes_per_container: string;
  container_type: ContainerType;
  // Costs
  cost_lines: CostLine[];
  // Freight
  pol: string;
  pod: string;
  ocean_freight_usd: string;
  insurance_rate: string;
  // Profit
  profit_markup: string;
}

export interface CalculationResult {
  total_net_weight_kg: number;
  total_gross_weight_kg: number;
  exw_usd_per_kg: number;
  export_tax_usd_per_kg: number;
  local_costs_usd_total: number;
  local_costs_usd_per_kg: number;
  ocean_freight_usd_per_kg: number;
  insurance_usd_per_kg: number;
  fob_cost_per_kg: number;
  cfr_cost_per_kg: number;
  cif_cost_per_kg: number;
  fob_quote_per_kg: number;
  cfr_quote_per_kg: number;
  cif_quote_per_kg: number;
  total_revenue_usd: number;
  total_cost_usd: number;
  profit_usd: number;
  cost_lines_converted: Array<{ label: string; amount_usd: number }>;
}

export interface SavedQuotation {
  id: string;
  created_at: string;
  name: string;
  product_name: string;
  hs_code: string;
  inputs: FormState;
  results: CalculationResult;
}
