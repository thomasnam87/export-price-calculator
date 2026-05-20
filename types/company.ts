export interface CompanyProfile {
  company_name: string;
  company_email: string;
  company_phone: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  company_name: '',
  company_email: '',
  company_phone: '',
};

const STORAGE_KEY = 'epc_company_profile';

export function loadCompanyProfile(): CompanyProfile {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COMPANY_PROFILE;
    return { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_COMPANY_PROFILE;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('epc_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('epc_session_id', id);
  }
  return id;
}
