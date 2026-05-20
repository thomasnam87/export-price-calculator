import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PROMPT = `You are an expert at extracting shipping cost data from Vietnamese freight forwarder quotation documents (báo giá logistics).

Analyze this document and extract ALL cost information. Return ONLY valid JSON matching this exact schema:

{
  "pol": "string — port of loading (e.g. Hai Phong)",
  "pod": "string — port of discharge (e.g. Hamburg)",
  "container_type": "20ft | 40ft | 40HQ",
  "ocean_freight_usd": number — ocean freight only, in USD (O/F, cước biển). Convert from VND if needed using exchange rate in doc, else 0,
  "exchange_rate": number — VND per 1 USD from document (e.g. 26500), default 25800 if not found,
  "charges": [
    {
      "label": "string — charge description",
      "amount": number — numeric amount only,
      "currency": "USD | VND"
    }
  ]
}

RULES:
- ocean_freight_usd: extract ONLY the sea freight (O/F, cước biển). Do NOT include it in charges[].
- charges[]: include ALL local/domestic charges EXCEPT ocean freight:
  THC, DOCS, SEAL, TELEX, Hải quan, Phí nâng hạ, Cơ sở hạ tầng, Vận chuyển nội địa, C/O, Vanning, Bạt chống cháy, Handle, etc.
- For USD charges written in VND (e.g. "230$ → 6,095,000"), extract the USD amount (230), currency = "USD".
- For charges only in VND with no USD equivalent, extract VND amount, currency = "VND".
- Do NOT include VAT, totals, or subtotals in charges[].
- If container type is "cont 40" or "40'" → "40ft". "40HC"/"40HQ" → "40HQ". "20'" → "20ft".
- Return ONLY the JSON object, no markdown, no explanation.`;

function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  // Extract JSON object if model wrapped it in prose
  const match = t.match(/\{[\s\S]*\}/);
  if (match) t = match[0];
  return t;
}

async function extractWithGemini(base64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    PROMPT,
    { inlineData: { mimeType, data: base64 } },
  ]);

  return result.response.text().trim();
}

// OpenRouter — dùng google/gemini-2.5-flash (PDF support tốt nhất, gần Gemini direct)
async function extractWithOpenRouter(base64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  // Gemini 2.5 Flash qua OpenRouter: gửi PDF dưới dạng file URL base64
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://export-price-calculator.vercel.app',
      'X-Title': 'Export Price Calculator',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: PROMPT,
            },
            {
              type: 'file',
              file: {
                filename: 'forwarder-quote.pdf',
                file_data: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource_exhausted');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'application/pdf';

    let text: string;
    let provider = 'gemini';

    try {
      text = await extractWithGemini(base64, mimeType);
    } catch (err) {
      if (isQuotaError(err) && process.env.OPENROUTER_API_KEY) {
        // Gemini quota exhausted — fallback to OpenRouter
        text = await extractWithOpenRouter(base64, mimeType);
        provider = 'openrouter';
      } else {
        throw err;
      }
    }

    const parsed = JSON.parse(stripFences(text));
    return NextResponse.json({ ...parsed, _provider: provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
