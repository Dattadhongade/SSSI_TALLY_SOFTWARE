import { useState, useEffect } from 'react';
import useStore from '../../../store/useStore';
import api from '../../../services/API';
import { voucherAPI } from '../../../services/voucherAPI';

export default function LedgerReport() {
  const { setPageTitle } = useStore();
  const [ledgers, setLedgers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState('');
  
  useEffect(() => {
    setPageTitle('Ledger Vouchers');
    async function fetchData() {
      try {
        const [lRes, vRes] = await Promise.all([
          api.get('/ledgers'),
          voucherAPI.getAll()
        ]);
        setLedgers(lRes.data);
        setAllVouchers(vRes.data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [setPageTitle]);

  const ledgerObj = ledgers.find(l => l.id == selectedLedger);
  const openingBalance = ledgerObj ? parseFloat(ledgerObj.openingBalance) : 0;
  const openingBalanceType = ledgerObj ? ledgerObj.balanceType : 'Dr';

  let runningBalance = openingBalanceType === 'Cr' ? -openingBalance : openingBalance;
  
  const transactions = [];
  
  if (openingBalance > 0) {
    transactions.push({
      id: 'open',
      date: '1-Apr-2026',
      particulars: 'Opening Balance',
      vchType: '',
      vchNo: '',
      debit: openingBalanceType === 'Dr' ? openingBalance : 0,
      credit: openingBalanceType === 'Cr' ? openingBalance : 0
    });
  }

  if (selectedLedger) {
    const filteredVouchers = allVouchers.filter(v => 
      v.entries && v.entries.some(e => e.ledgerId == selectedLedger)
    ).sort((a,b) => new Date(a.date) - new Date(b.date));

    filteredVouchers.forEach(v => {
      const typeName = v.VoucherType ? v.VoucherType.name : '';
      const myEntry = v.entries.find(e => e.ledgerId == selectedLedger);
      if (!myEntry) return;

      const dr = Number(myEntry.debitAmount) || 0;
      const cr = Number(myEntry.creditAmount) || 0;
      
      const oppositeEntry = v.entries.find(e => e.ledgerId != selectedLedger && (e.debitAmount > 0 || e.creditAmount > 0));
      let particulars = v.narration || typeName;
      if (oppositeEntry) {
         const oppLedger = ledgers.find(l => l.id == oppositeEntry.ledgerId);
         if (oppLedger) particulars = oppLedger.name;
      }

      runningBalance += (dr - cr);

      transactions.push({
        id: v.id,
        date: new Date(v.date).toLocaleDateString('en-GB'),
        particulars,
        vchType: typeName,
        vchNo: v.voucherNumber,
        debit: dr,
        credit: cr
      });
    });
  }

  const totalDebit = transactions.reduce((sum, v) => sum + v.debit, 0);
  const totalCredit = transactions.reduce((sum, v) => sum + v.credit, 0);
  const grandTotal = Math.max(totalDebit, totalCredit + (totalDebit - totalCredit));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 print:p-0 print:bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-bold text-tally-blue">Select Ledger:</label>
          <select 
            className="border border-tally-border rounded px-2 py-1 text-sm focus:outline-none focus:border-tally-blue"
            value={selectedLedger}
            onChange={(e) => setSelectedLedger(e.target.value)}
          >
            <option value="">-- Select --</option>
            {ledgers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-tally-blue text-white px-4 py-1 text-sm font-bold hover:bg-opacity-90"
        >
          Print (Ctrl+P)
        </button>
      </div>

      {selectedLedger && (
        <div className="border border-tally-border bg-white overflow-x-auto print:border-none">
          {/* Header for print */}
          <div className="text-center py-4 border-b border-tally-border mb-2">
            <h1 className="text-xl font-bold uppercase">{ledgers.find(l => l.id == selectedLedger)?.name}</h1>
            <p className="text-sm">Ledger Account</p>
            <p className="text-xs">1-Apr-2026 to 31-Mar-2027</p>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-tally-light-blue border-b border-tally-border text-xs uppercase font-bold">
              <tr>
                <th className="px-3 py-2 border-r border-tally-border w-24">Date</th>
                <th className="px-3 py-2 border-r border-tally-border">Particulars</th>
                <th className="px-3 py-2 border-r border-tally-border w-24">Vch Type</th>
                <th className="px-3 py-2 border-r border-tally-border w-24">Vch No.</th>
                <th className="px-3 py-2 border-r border-tally-border w-28 text-right">Debit</th>
                <th className="px-3 py-2 w-28 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-tally-border hover:bg-tally-yellow transition-colors print:border-gray-300 print:hover:bg-transparent">
                  <td className="px-3 py-2 border-r border-tally-border whitespace-nowrap">{tx.date}</td>
                  <td className="px-3 py-2 border-r border-tally-border font-semibold italic">{tx.particulars}</td>
                  <td className="px-3 py-2 border-r border-tally-border">{tx.vchType}</td>
                  <td className="px-3 py-2 border-r border-tally-border">{tx.vchNo}</td>
                  <td className="px-3 py-2 border-r border-tally-border text-right">{tx.debit > 0 ? tx.debit.toFixed(2) : ''}</td>
                  <td className="px-3 py-2 text-right">{tx.credit > 0 ? tx.credit.toFixed(2) : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-tally-border print:bg-transparent">
                <td colSpan="4" className="px-3 py-2 border-r border-tally-border text-right font-bold">By Closing Balance</td>
                <td className="px-3 py-2 border-r border-tally-border text-right">{runningBalance < 0 ? Math.abs(runningBalance).toFixed(2) : ''}</td>
                <td className="px-3 py-2 text-right font-bold italic">
                  {runningBalance > 0 ? runningBalance.toFixed(2) : ''}
                </td>
              </tr>
              <tr className="bg-gray-50 font-bold border-t-2 border-double border-tally-border print:bg-transparent">
                <td colSpan="4" className="px-3 py-2 border-r border-tally-border text-right">Grand Total</td>
                <td className="px-3 py-2 border-r border-tally-border text-right">
                  {(totalDebit + (runningBalance < 0 ? Math.abs(runningBalance) : 0)).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {(totalCredit + (runningBalance > 0 ? runningBalance : 0)).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
