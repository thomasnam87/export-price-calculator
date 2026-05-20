import type { FormState, CalculationResult } from '@/types/schema';

export async function downloadPdf(
  inputs: FormState,
  results: CalculationResult
): Promise<void> {
  // Dynamically import to avoid SSR issues
  const { pdf } = await import('@react-pdf/renderer');
  const { default: PdfDocument } = await import('@/components/PdfDocument');
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(PdfDocument, { inputs, results }) as any;
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const productSlug = (inputs.product_name || 'quote')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 30);
  a.download = `export-quote-${productSlug}-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
