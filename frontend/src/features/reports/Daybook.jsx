import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { voucherAPI } from '../../services/voucherAPI';

export default function Daybook() {
  const { setPageTitle } = useStore();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range filter
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setPageTitle('Daybook');

    async function fetchVouchers() {
      try {
        const res = await voucherAPI.getAll();
        setVouchers(res.data);
      } catch (err) {
        console.error('Failed to fetch daybook', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVouchers();
  }, [setPageTitle]);

  const filteredVouchers = vouchers.filter(v => {
    return v.date >= fromDate && v.date <= toDate;
  });

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex justify-center">
      <div className="w-full max-w-5xl bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border p-2 flex justify-between items-center">
          <div className="font-bold text-lg text-tally-blue">Daybook</div>
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
                  <th className="py-2 px-2 text-left">Date</th>
                  <th className="py-2 px-2 text-left">Particulars</th>
                  <th className="py-2 px-2 text-left">Vch Type</th>
                  <th className="py-2 px-2 text-left">Vch No.</th>
                  <th className="py-2 px-2 text-right">Debit Amount</th>
                  <th className="py-2 px-2 text-right">Credit Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length > 0 ? filteredVouchers.map(v => {
                  const typeName = v.VoucherType ? v.VoucherType.name : '';
                  // In Daybook, "Particulars" is usually the opposite ledger or first non-cash ledger.
                  // For simplicity, we just show narration or the type name here if no complex logic.
                  // We'll calculate total Dr and Cr.
                  let dr = 0;
                  let cr = 0;
                  v.entries.forEach(e => {
                    dr += Number(e.debitAmount) || 0;
                    cr += Number(e.creditAmount) || 0;
                  });

                  return (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-[#fcf8e3] cursor-pointer">
                      <td className="py-1 px-2">{new Date(v.date).toLocaleDateString('en-GB')}</td>
                      <td className="py-1 px-2 font-bold truncate max-w-xs" title={v.narration || typeName}>
                        {v.narration || `${typeName} Voucher`}
                      </td>
                      <td className="py-1 px-2">{typeName}</td>
                      <td className="py-1 px-2">{v.voucherNumber}</td>
                      <td className="py-1 px-2 text-right font-bold text-gray-700">{dr > 0 ? dr.toFixed(2) : ''}</td>
                      <td className="py-1 px-2 text-right font-bold text-gray-700">{cr > 0 ? cr.toFixed(2) : ''}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500 italic">No vouchers found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
      </div>
    </div>
  );
}
