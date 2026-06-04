import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedCompany: null,
      selectedFinancialYear: null,
      pageTitle: 'Gateway of SSSI',
      
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, selectedCompany: null, selectedFinancialYear: null, pageTitle: 'Gateway of SSSI' });
      },
      selectCompany: (company, financialYear) => set({ selectedCompany: company, selectedFinancialYear: financialYear }),
      setPageTitle: (title) => set({ pageTitle: title }),
    }),
    {
      name: 'erp-store',
    }
  )
);

export default useStore;
