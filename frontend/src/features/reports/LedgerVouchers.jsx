import { formatDateStr , getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useStore from '../../store/useStore';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';

export default function LedgerVouchers() {
  const { id } = useParams(); // Ledger ID
  const { setPageTitle } = useStore();
  
  const [ledger, setLedger] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range filter
  const [fromDate, setFromDate] = useState(getLocalISODate());
  const [toDate, setToDate] = useState(getLocalISODate());

  useEffect(() => {
    setPageTitle('Ledger Vouchers');
    
    async function fetchData() {
      setLoading(true);
      try {
        const [ledgerRes, vouchersRes] = await Promise.all([
          api.get(`/ledgers/${id}`),
          voucherAPI.getAll()
        ]);
        
        setLedger(ledgerRes.data);
        
        const ledgerVouchers = vouchersRes.data.filter(v => 
          v.entries && v.entries.some(e => e.ledgerId == id)
        );
        
        setVouchers(ledgerVouchers);
      } catch (err) {
        console.error('Failed to fetch ledger details', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id, setPageTitle]);

  // Compute opening balance based on ledger model
  const openingBalance = ledger ? parseFloat(ledger.openingBalance) : 0;
  const openingBalanceType = ledger ? ledger.balanceType : 'Dr';

  const filteredVouchers = vouchers.filter(v => v.date >= fromDate && v.date <= toDate);

  const { mappedVouchers, totalDebit, totalCredit, finalRunningBalance } = filteredVouchers.reduce((acc, v) => {
    const typeName = v.VoucherType ? v.VoucherType.name : '';
    const myEntry = v.entries.find(e => e.ledgerId == id);
    if (!myEntry) return acc;

    const dr = Number(myEntry.debitAmount) || 0;
    const cr = Number(myEntry.creditAmount) || 0;

    const oppositeEntry = v.entries.find(e => e.ledgerId != id && (e.debitAmount > 0 || e.creditAmount > 0));
    const particulars = oppositeEntry ? `Ledger ID: ${oppositeEntry.ledgerId}` : v.narration || typeName;

    acc.mappedVouchers.push({ ...v, typeName, dr, cr, particulars });
    acc.totalDebit += dr;
    acc.totalCredit += cr;
    acc.finalRunningBalance += (dr - cr);

    return acc;
  }, {
    mappedVouchers: [],
    totalDebit: 0,
    totalCredit: 0,
    finalRunningBalance: openingBalanceType === 'Cr' ? -openingBalance : openingBalance
  });

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex justify-center">
      <div className="w-full max-w-5xl bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border p-2 flex justify-between items-center">
          <div className="font-bold text-lg text-tally-blue">
            Ledger: <span className="text-tally-red">{ledger ? ledger.name : 'Loading...'}</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-xs text-tally-blue font-bold">From</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border px-1 py-0.5 text-xs focus:outline-none" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-tally-blue font-bold">To</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border px-1 py-0.5 text-xs focus:outline-none" />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto p-2">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#fcf8e3] border-b border-tally-border">
                  <th className="py-2 px-2 text-left w-24">Date</th>
                  <th className="py-2 px-2 text-left">Particulars</th>
                  <th className="py-2 px-2 text-left w-32">Vch Type</th>
                  <th className="py-2 px-2 text-left w-24">Vch No.</th>
                  <th className="py-2 px-2 text-right w-32">Debit (₹)</th>
                  <th className="py-2 px-2 text-right w-32">Credit (₹)</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr className="border-b border-gray-100 font-bold italic text-gray-600">
                  <td className="py-1 px-2 text-right" colSpan="4">Opening Balance</td>
                  <td className="py-1 px-2 text-right">{openingBalanceType === 'Dr' && openingBalance > 0 ? openingBalance.toFixed(2) : ''}</td>
                  <td className="py-1 px-2 text-right">{openingBalanceType === 'Cr' && openingBalance > 0 ? openingBalance.toFixed(2) : ''}</td>
                </tr>

                {mappedVouchers.map(v => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-[#fcf8e3]">
                      <td className="py-1 px-2">{formatDateStr(v.date)}</td>
                      <td className="py-1 px-2 truncate max-w-xs">{v.particulars}</td>
                      <td className="py-1 px-2 text-gray-600">{v.typeName}</td>
                      <td className="py-1 px-2 text-gray-600">{v.voucherNumber}</td>
                      <td className="py-1 px-2 text-right font-bold">{v.dr > 0 ? v.dr.toFixed(2) : ''}</td>
                      <td className="py-1 px-2 text-right font-bold">{v.cr > 0 ? v.cr.toFixed(2) : ''}</td>
                    </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-b border-tally-border bg-[#f0f6fa] font-bold">
                  <td colSpan="4" className="py-2 px-2 text-right">Current Total</td>
                  <td className="py-2 px-2 text-right">{totalDebit.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right">{totalCredit.toFixed(2)}</td>
                </tr>
                <tr className="bg-[#f0f6fa] font-bold text-tally-blue">
                  <td colSpan="4" className="py-2 px-2 text-right border-t border-tally-border">Closing Balance</td>
                  {finalRunningBalance > 0 ? (
                    <>
                      <td className="py-2 px-2 text-right border-t border-tally-border border-b-2 border-double">{Math.abs(finalRunningBalance).toFixed(2)} Dr</td>
                      <td className="py-2 px-2 text-right border-t border-tally-border border-b-2 border-double"></td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-2 text-right border-t border-tally-border border-b-2 border-double"></td>
                      <td className="py-2 px-2 text-right border-t border-tally-border border-b-2 border-double">{Math.abs(finalRunningBalance).toFixed(2)} Cr</td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>
          )}
        </div>
        
      </div>
    </div>
  );
}
