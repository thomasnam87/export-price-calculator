import type { FormState, CalculationResult } from '@/types/schema';
import type { CompanyProfile } from '@/types/company';

function usd(val: number, decimals = 4): string {
  return `$${val.toFixed(decimals)}`;
}

function usdTotal(val: number): string {
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildEmailText(
  inputs: FormState,
  results: CalculationResult,
  company: CompanyProfile
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const contactLine = [company.company_email, company.company_phone].filter(Boolean).join(' · ');

  return `Dear Sir/Madam,

We are pleased to offer the following export price quotation:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product     : ${inputs.product_name || '(Not specified)'}
HS Code     : ${inputs.hs_code || '(Not specified)'}
Container   : ${inputs.container_type} — ${results.total_net_weight_kg.toLocaleString()} kg net / ${results.total_gross_weight_kg.toLocaleString()} kg gross

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRICE OFFER (USD/kg)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOB ${inputs.pol || '—'}  : ${usd(results.fob_quote_per_kg)}/kg
CFR ${inputs.pod || '—'}  : ${usd(results.cfr_quote_per_kg)}/kg
CIF ${inputs.pod || '—'}  : ${usd(results.cif_quote_per_kg)}/kg

Total container value (CIF) : ${usdTotal(results.total_revenue_usd)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Validity    : 15 days from ${today}
Payment     : TT 30% deposit, 70% before shipment

Please do not hesitate to contact us for further details or to proceed with your order.

Best regards,
${company.company_name || 'Our Company'}${contactLine ? `\n${contactLine}` : ''}`.trim();
}
