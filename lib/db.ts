import { getSupabase } from '@/lib/supabase';
import type { FormState, CalculationResult, SavedQuotation } from '@/types/schema';

export async function saveQuotation(
  name: string,
  inputs: FormState,
  results: CalculationResult
): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('quotations')
    .insert({
      name,
      product_name: inputs.product_name,
      hs_code: inputs.hs_code,
      inputs,
      results,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function listQuotations(): Promise<SavedQuotation[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SavedQuotation[];
}

export async function deleteQuotation(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from('quotations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
