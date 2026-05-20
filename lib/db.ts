import { getSupabase } from '@/lib/supabase';
import type { FormState, CalculationResult, SavedQuotation } from '@/types/schema';

export async function saveQuotation(
  name: string,
  inputs: FormState,
  results: CalculationResult,
  sessionId: string
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
      session_id: sessionId,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function listQuotations(sessionId: string): Promise<SavedQuotation[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('quotations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SavedQuotation[];
}

export async function deleteQuotation(id: string, sessionId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('quotations')
    .delete()
    .eq('id', id)
    .eq('session_id', sessionId);
  if (error) throw new Error(error.message);
}
