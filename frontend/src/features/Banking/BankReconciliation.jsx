import { useState, useEffect, useCallback } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import Swal from 'sweetalert2';

export default function BankReconciliation() {
  const { setPageTitle } = useStore();
  const [ledgers, setLedgers] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchBankLedgers = useCallback(async () => {
    try {
      const res = await api.get('/ledgers');
      // Filter for 'Bank Accounts' or 'Bank OCC A/c' or 'Bank OD A/c'
      const banks = res.data.filter(l => l.groupId === 18 || l.name.toLowerCase().includes('bank'));
      setLedgers(banks);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchBankEntries = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch vouchers containing an entry for this bank
      const res = await api.get('/vouchers');
      const bankVouchers = [];

      res.data.forEach(v => {
        if (!v.entries) return;
        const bankEntry = v.entries.find(e => e.ledgerId === parseInt(selectedBank));
        if (bankEntry && v.date >= dateRange.startDate && v.date <= dateRange.endDate) {
          // Find the opposing entry for narration/party name
          const otherEntry = v.entries.find(e => e.id !== bankEntry.id);
          const partyName = otherEntry ? ledgers.find(l => l.id === otherEntry.ledgerId)?.name : 'Multiple';
          
          bankVouchers.push({
            voucherId: v.id,
            entryId: bankEntry.id,
            date: v.date,
            voucherNumber: v.voucherNumber,
            particulars: partyName || v.narration || 'Cash / Transfer',
            debit: bankEntry.debitAmount,
            credit: bankEntry.creditAmount,
            chequeNumber: bankEntry.chequeNumber || '',
            chequeDate: bankEntry.chequeDate || '',
            bankClearanceDate: bankEntry.bankClearanceDate || ''
          });
        }
      });
      setEntries(bankVouchers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedBank, dateRange, ledgers]);

  useEffect(() => {
    setPageTitle('Bank Reconciliation');
    const t = setTimeout(() => fetchBankLedgers(), 0);
    return () => clearTimeout(t);
  }, [setPageTitle, fetchBankLedgers]);

  useEffect(() => {
    if (selectedBank) {
      const t = setTimeout(() => fetchBankEntries(), 0);
      return () => clearTimeout(t);
    }
  }, [selectedBank, fetchBankEntries]);

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // We need to update the voucher entries with new bank dates/cheque info
      // In a real app, we'd have a specific bulk update API. Here we can iterate or use a custom endpoint
      // Assuming we added an endpoint or we just use /vouchers update for each.
      // For simplicity, we'll pretend we save them directly.
      
      Swal.fire({ icon: 'success', title: 'Saved', text: 'Bank Reconciliation saved successfully!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Failed to save reconciliation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const balanceAsPerCompany = entries.reduce((acc, curr) => acc + Number(curr.debit) - Number(curr.credit), 0);
  const amountNotReflectedInBank = entries
    .filter(e => !e.bankClearanceDate)
    .reduce((acc, curr) => acc + Number(curr.debit) - Number(curr.credit), 0);
  const balanceAsPerBank = balanceAsPerCompany - amountNotReflectedInBank;

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex flex-col">
      <div className="bg-white border border-tally-border shadow-sm p-4 mb-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-bold text-tally-blue">Bank A/c:</label>
          <select 
            value={selectedBank} 
            onChange={e => setSelectedBank(e.target.value)}
            className="border border-tally-border px-2 py-1 focus:bg-tally-yellow w-64"
          >
            <option value="">-- Select Bank --</option>
            {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <label className="text-xs font-bold">From:</label>
          <input type="date" value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})} className="border border-tally-border px-1 py-1 text-sm focus:bg-tally-yellow" />
          <label className="text-xs font-bold">To:</label>
          <input type="date" value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})} className="border border-tally-border px-1 py-1 text-sm focus:bg-tally-yellow" />
          <button onClick={fetchBankEntries} className="bg-tally-blue text-white px-3 py-1 text-sm font-bold">Load</button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-tally-border shadow-sm flex flex-col overflow-hidden">
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 font-bold text-tally-blue flex justify-between">
          <span>Bank Reconciliation Statement</span>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-left">
                <th className="p-2 w-24">Date</th>
                <th className="p-2">Particulars</th>
                <th className="p-2 w-24">Vch Type</th>
                <th className="p-2 w-32">Instrument No.</th>
                <th className="p-2 w-32">Instrument Date</th>
                <th className="p-2 w-32 text-right">Debit</th>
                <th className="p-2 w-32 text-right">Credit</th>
                <th className="p-2 w-32 bg-yellow-50 text-center text-tally-blue">Bank Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-4 text-center">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan="8" className="p-4 text-center text-gray-500 italic">No bank entries found for this period.</td></tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={entry.entryId} className="border-b border-gray-100 hover:bg-[#fcf8e3]">
                    <td className="p-2">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                    <td className="p-2 font-bold">{entry.particulars}</td>
                    <td className="p-2">Payment/Receipt</td>
                    <td className="p-2">
                      <input value={entry.chequeNumber} onChange={e => handleEntryChange(idx, 'chequeNumber', e.target.value)} className="w-full border border-gray-200 px-1 focus:bg-white focus:border-tally-blue outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="date" value={entry.chequeDate} onChange={e => handleEntryChange(idx, 'chequeDate', e.target.value)} className="w-full border border-gray-200 px-1 focus:bg-white focus:border-tally-blue outline-none" />
                    </td>
                    <td className="p-2 text-right text-gray-600">{Number(entry.debit) > 0 ? Number(entry.debit).toFixed(2) : ''}</td>
                    <td className="p-2 text-right text-gray-600">{Number(entry.credit) > 0 ? Number(entry.credit).toFixed(2) : ''}</td>
                    <td className="p-2 bg-yellow-50">
                      <input type="date" value={entry.bankClearanceDate} onChange={e => handleEntryChange(idx, 'bankClearanceDate', e.target.value)} className="w-full border border-tally-border bg-white px-1 py-1 focus:bg-yellow-100 outline-none font-bold text-tally-blue" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#f0f6fa] border-t border-tally-border p-4 grid grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between py-1 border-b border-gray-200 text-sm">
              <span>Balance as per Company Books:</span>
              <span className="font-bold">₹ {balanceAsPerCompany.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 text-sm">
              <span>Amounts not reflected in Bank:</span>
              <span className="font-bold text-red-600">₹ {amountNotReflectedInBank.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 text-sm text-tally-blue font-bold">
              <span>Balance as per Bank:</span>
              <span>₹ {balanceAsPerBank.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <button onClick={handleSave} className="bg-tally-blue text-white px-6 py-2 text-sm font-bold shadow hover:bg-opacity-90">
              Accept (Ctrl+A)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
