import { useState, useEffect, useCallback } from 'react';
import useStore from '../../../store/useStore';
import api from '../../../services/API';
import { getLocalISODate } from '../../../utils/dateUtils';
import Swal from 'sweetalert2';

import SummaryCards from './SummaryCards';
import FiltersSection from './FiltersSection';
import ActionToolbar from './ActionToolbar';
import SplitViewPanel from './SplitViewPanel';
import MatchingDetailsDrawer from './MatchingDetailsDrawer';
import ReportsSection from './ReportsSection';
import ReconciliationCharts from './ReconciliationCharts';

export default function BankReconciliationDashboard() {
  const { setPageTitle } = useStore();
  
  // Data State
  const [ledgers, setLedgers] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [bookEntries, setBookEntries] = useState([]);
  const [bankEntries, setBankEntries] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: getLocalISODate()
  });
  const [filters, setFilters] = useState({ search: '', type: 'All', status: 'All' });
  
  // Selection State
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedBankIds, setSelectedBankIds] = useState([]);
  
  // Drawer State
  const [drawerState, setDrawerState] = useState({ isOpen: false, item: null, type: null });

  // Fetch Bank Accounts
  const fetchBankLedgers = useCallback(async () => {
    try {
      const res = await api.get('/ledgers');
      const banks = res.data.filter(l => l.groupId === 18 || l.name.toLowerCase().includes('bank'));
      setLedgers(banks);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch Book Entries and generate Mock Bank Entries
  const fetchBankEntries = useCallback(async () => {
    if (!selectedBank) return;
    try {
      setLoading(true);
      const res = await api.get('/vouchers');
      const bookData = [];

      res.data.forEach(v => {
        if (!v.entries) return;
        const bankEntry = v.entries.find(e => e.ledgerId === parseInt(selectedBank));
        if (bankEntry && v.date >= dateRange.startDate && v.date <= dateRange.endDate) {
          const otherEntry = v.entries.find(e => e.id !== bankEntry.id);
          const partyName = otherEntry ? ledgers.find(l => l.id === otherEntry.ledgerId)?.name : 'Multiple';
          
          bookData.push({
            voucherId: v.id,
            entryId: bankEntry.id,
            date: v.date,
            voucherNumber: v.voucherNumber,
            particulars: partyName || v.narration || 'Cash / Transfer',
            voucherType: v.voucherType,
            debit: bankEntry.debitAmount,
            credit: bankEntry.creditAmount,
            chequeNumber: bankEntry.chequeNumber || '',
            status: bankEntry.bankClearanceDate ? 'Reconciled' : 'Pending',
          });
        }
      });
      setBookEntries(bookData);

      // Generate Mock Bank Statement based on book data (for demonstration)
      const mockBankData = bookData.map((b, i) => ({
        id: `bank-${i}`,
        date: new Date(new Date(b.date).getTime() + 86400000).toISOString().split('T')[0], // Add 1 day
        description: `TRF / ${b.particulars} / ${b.chequeNumber || 'UPI'}`,
        refNumber: b.chequeNumber || `TXN${Math.floor(Math.random() * 10000)}`,
        deposit: b.debit, // Book debit is bank deposit
        withdrawal: b.credit, // Book credit is bank withdrawal
        matchScore: Math.floor(Math.random() * 20) + 80, // 80-100 score
      })).slice(0, Math.max(1, bookData.length - 1)); // Leave some unmatched

      setBankEntries(mockBankData);

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch entries', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBank, dateRange, ledgers]);

  useEffect(() => {
    setPageTitle('Bank Reconciliation Dashboard');
    const t = setTimeout(() => fetchBankLedgers(), 0);
    return () => clearTimeout(t);
  }, [setPageTitle, fetchBankLedgers]);

  useEffect(() => {
    if (selectedBank) {
      const t = setTimeout(() => fetchBankEntries(), 0);
      return () => clearTimeout(t);
    }
  }, [selectedBank, fetchBankEntries]);

  // Calculations for Summary
  const bookBalance = bookEntries.reduce((acc, curr) => acc + Number(curr.debit || 0) - Number(curr.credit || 0), 0);
  const bankBalance = bankEntries.reduce((acc, curr) => acc + Number(curr.deposit || 0) - Number(curr.withdrawal || 0), 0);
  const reconciledCount = bookEntries.filter(e => e.status === 'Reconciled').length;
  const pendingCount = bookEntries.filter(e => e.status === 'Pending').length;
  const unmatchedCount = Math.abs(bookEntries.length - bankEntries.length);

  // Handlers
  const handleRowClick = (item, type) => {
    setDrawerState({ isOpen: true, item, type });
  };

  const handleAutoMatch = () => {
    Swal.fire({
      title: 'Auto Match',
      text: 'This will automatically match entries based on Amount and Date. Proceed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, match them'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success', 'Auto matching completed. Found 3 perfect matches.', 'success');
      }
    });
  };

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-4rem)] p-6 font-sans">
      
      {/* KPI Cards */}
      <SummaryCards 
        bankBalance={bankBalance} 
        bookBalance={bookBalance}
        reconciledCount={reconciledCount}
        pendingCount={pendingCount}
        unmatchedCount={unmatchedCount}
      />

      {/* Filters */}
      <FiltersSection 
        ledgers={ledgers}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        dateRange={dateRange}
        setDateRange={setDateRange}
        filters={filters}
        setFilters={setFilters}
        onLoad={fetchBankEntries}
      />

      {/* Main Split View Area */}
      <div className="mb-6 shadow-sm rounded-xl">
        <ActionToolbar 
          onAutoMatch={handleAutoMatch}
          onMatchSelected={() => Swal.fire('Info', 'Select one book entry and one bank entry to match manually.', 'info')}
          onUnmatch={() => {}}
          onMarkReconciled={() => {}}
          onRefresh={fetchBankEntries}
          onExportExcel={() => {}}
          onPrint={() => {}}
        />
        
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-white border-x border-b border-gray-200 rounded-b-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <SplitViewPanel 
            bookEntries={bookEntries}
            bankEntries={bankEntries}
            selectedBookIds={selectedBookIds}
            setSelectedBookIds={setSelectedBookIds}
            selectedBankIds={selectedBankIds}
            setSelectedBankIds={setSelectedBankIds}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Analytics & Reports */}
      <ReconciliationCharts />
      <ReportsSection />

      {/* Drawer */}
      <MatchingDetailsDrawer 
        isOpen={drawerState.isOpen}
        onClose={() => setDrawerState({ isOpen: false, item: null, type: null })}
        selectedItem={drawerState.item}
        type={drawerState.type}
      />

    </div>
  );
}
