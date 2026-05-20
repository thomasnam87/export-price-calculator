"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateAll, DEFAULT_FORM_STATE } from '@/lib/calculations';
import { saveQuotation } from '@/lib/db';
import { buildEmailText } from '@/lib/email';
import { downloadPdf } from '@/lib/pdf';
import type { FormState } from '@/types/schema';
import type { SavedQuotation } from '@/types/schema';
import {
  loadCompanyProfile,
  saveCompanyProfile,
  loadSessionId,
  DEFAULT_COMPANY_PROFILE,
} from '@/types/company';
import type { CompanyProfile } from '@/types/company';

import ProductSection from '@/components/ProductSection';
import PackingSection from '@/components/PackingSection';
import CostSection from '@/components/CostSection';
import FreightSection from '@/components/FreightSection';
import ProfitSection from '@/components/ProfitSection';
import ResultsPanel from '@/components/ResultsPanel';
import SavedQuotations from '@/components/SavedQuotations';
import ForwarderUpload from '@/components/ForwarderUpload';
import CompanyProfileModal from '@/components/CompanyProfileModal';

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Company profile + session — loaded client-side only
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [sessionId, setSessionId] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const profile = loadCompanyProfile();
    setCompany(profile);
    setSessionId(loadSessionId());
    // Show modal on first visit (no company name set)
    if (!profile.company_name) {
      setIsFirstTime(true);
      setShowProfileModal(true);
    }
  }, []);

  function handleProfileSave(profile: CompanyProfile) {
    saveCompanyProfile(profile);
    setCompany(profile);
    setShowProfileModal(false);
    setIsFirstTime(false);
  }

  const results = useMemo(() => calculateAll(form), [form]);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const name = form.quotation_name.trim() || `${form.product_name || 'Quote'} — ${new Date().toLocaleDateString()}`;
      await saveQuotation(name, form, results, sessionId);
    } catch {
      setSaveError('Save failed. Check Supabase connection.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    const text = buildEmailText(form, results, company);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleExportPdf() {
    setPdfLoading(true);
    try {
      await downloadPdf(form, results, company);
    } finally {
      setPdfLoading(false);
    }
  }

  function handleLoad(saved: SavedQuotation) {
    setForm(saved.inputs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleForwarderApply(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Profile Modal */}
      {showProfileModal && (
        <CompanyProfileModal
          initialProfile={company}
          onSave={handleProfileSave}
          onClose={() => setShowProfileModal(false)}
          isFirstTime={isFirstTime}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-blue-700">Export Price Calculator</h1>
            <p className="text-xs text-gray-500">
              EXW → FOB → CFR → CIF · {company.company_name || 'Thiết lập công ty'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              title="Cài đặt công ty"
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
            >
              ⚙️ {company.company_name || 'Cài đặt'}
            </button>
            <button
              type="button"
              onClick={() => setForm(DEFAULT_FORM_STATE)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Input sections */}
          <div className="space-y-6 lg:col-span-2">
            <ForwarderUpload onApply={handleForwarderApply} />
            <ProductSection form={form} setField={setField} />
            <PackingSection form={form} results={results} setField={setField} />
            <CostSection form={form} results={results} setField={setField} />
            <FreightSection form={form} setField={setField} />
            <ProfitSection form={form} setField={setField} />
          </div>

          {/* Right: Sticky results */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <ResultsPanel
                form={form}
                results={results}
                onSave={handleSave}
                saving={saving}
                saveError={saveError}
                copied={copied}
                onCopy={handleCopy}
                onExportPdf={handleExportPdf}
              />
            </div>
          </div>
        </div>

        {/* Saved Quotations */}
        <div className="mt-8">
          <SavedQuotations onLoad={handleLoad} sessionId={sessionId} />
        </div>
      </main>
    </div>
  );
}
