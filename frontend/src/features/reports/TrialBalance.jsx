import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';

export default function TrialBalance() {
  const { setPageTitle, selectedCompany } = useStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/financials');
      setData(res.data.trialBalance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPageTitle('Trial Balance');
      fetchData();
    }, 0);
  }, [setPageTitle]);



  const renderGroup = (group, depth = 0) => {
    const paddingLeft = `${depth * 20 + 10}px`;
    return (
      <React.Fragment key={group.id}>
        <tr className="border-b border-gray-100 hover:bg-yellow-50">
          <td className="p-2" style={{ paddingLeft }}>
             <span className="font-bold text-tally-blue">{group.name}</span>
          </td>
          <td className="p-2 text-right text-gray-700 font-bold">
            {group.balanceType === 'Dr' && group.closingBalance > 0 ? group.closingBalance.toFixed(2) : ''}
          </td>
          <td className="p-2 text-right text-gray-700 font-bold">
            {group.balanceType === 'Cr' && group.closingBalance > 0 ? group.closingBalance.toFixed(2) : ''}
          </td>
        </tr>
        {group.children && group.children.map(child => renderGroup(child, depth + 1))}
        {group.ledgers && group.ledgers.map(ledger => (
          <tr key={`l-${ledger.id}`} className="border-b border-gray-50 hover:bg-yellow-50 italic text-sm">
            <td className="p-1" style={{ paddingLeft: `${(depth + 1) * 20 + 10}px` }}>
               {ledger.name}
            </td>
            <td className="p-1 text-right text-gray-500">
              {ledger.balanceType === 'Dr' && ledger.closingBalance > 0 ? ledger.closingBalance.toFixed(2) : ''}
            </td>
            <td className="p-1 text-right text-gray-500">
              {ledger.balanceType === 'Cr' && ledger.closingBalance > 0 ? ledger.closingBalance.toFixed(2) : ''}
            </td>
          </tr>
        ))}
      </React.Fragment>
    );
  };

  // Grand totals
  const totalDr = data.filter(g => g.balanceType === 'Dr').reduce((s, g) => s + g.closingBalance, 0);
  const totalCr = data.filter(g => g.balanceType === 'Cr').reduce((s, g) => s + g.closingBalance, 0);

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex flex-col">
      <div className="bg-white border border-tally-border shadow-sm flex-1 flex flex-col">
        <div className="bg-[#f0f6fa] border-b border-tally-border p-4 text-center">
          <div className="font-bold text-xl text-tally-blue">{selectedCompany?.name || 'Company Name'}</div>
          <div className="font-bold text-lg">Trial Balance</div>
          <div className="text-sm text-gray-600">1-Apr-2026 to 31-Mar-2027</div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2 text-left w-1/2">Particulars</th>
                <th className="p-2 text-right w-1/4">Debit Balance</th>
                <th className="p-2 text-right w-1/4">Credit Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr>
              ) : (
                data.map(group => renderGroup(group))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#f0f6fa] border-t border-tally-border p-4">
          <div className="flex justify-between font-bold text-lg text-tally-blue">
            <div className="w-1/2">Grand Total</div>
            <div className="w-1/4 text-right pr-4">₹ {totalDr.toFixed(2)}</div>
            <div className="w-1/4 text-right">₹ {totalCr.toFixed(2)}</div>
          </div>
          {totalDr.toFixed(2) === totalCr.toFixed(2) ? (
            <div className="text-center text-green-600 text-xs font-bold mt-2">Books are matching.</div>
          ) : (
            <div className="text-center text-red-600 text-xs font-bold mt-2">Difference in Trial Balance: ₹ {Math.abs(totalDr - totalCr).toFixed(2)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
