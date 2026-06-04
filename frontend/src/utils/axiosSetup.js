import axios from 'axios';

// This interceptor runs BEFORE any React component renders.
// It reads the token directly from Zustand's persisted localStorage key ('erp-store')
// so ALL axios requests always have the correct auth header — no race conditions.
axios.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('erp-store') || '{}');
    const token = stored?.state?.token;
    const selectedCompany = stored?.state?.selectedCompany;
    const selectedFinancialYear = stored?.state?.selectedFinancialYear;

    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (selectedCompany) config.headers['x-company-id'] = selectedCompany.id;
    if (selectedFinancialYear) config.headers['x-financial-year-id'] = selectedFinancialYear.id;
  } catch {
    // Silently ignore parsing errors
  }
  return config;
});
