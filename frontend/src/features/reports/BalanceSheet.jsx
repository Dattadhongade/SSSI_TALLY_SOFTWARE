import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';

export default function BalanceSheet() {
  const { setPageTitle, selectedCompany } = useStore();
  const [data, setData] = useState({ groups: [], netProfit: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/financials');
      setData(res.data.balanceSheet);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPageTitle('Balance Sheet');
      fetchData();
    }, 0);
  }, [setPageTitle]);



  const renderGroup = (group) => {
    if (group.closingBalance === 0) return null;
    return (
      <div key={group.id} className="flex justify-between py-1 border-b border-gray-100 hover:bg-yellow-50 px-2">
        <span className="font-bold text-tally-blue">{group.name}</span>
        <span>{group.closingBalance.toFixed(2)}</span>
      </div>
    );
  };

  // Standard Tally convention: Liabilities are Cr balance, Assets are Dr balance
  const liabilities = data.groups.filter(g => g.balanceType === 'Cr');
  const assets = data.groups.filter(g => g.balanceType === 'Dr');

  const totalLiabilities = liabilities.reduce((s, g) => s + g.closingBalance, 0) + (data.netProfit > 0 ? data.netProfit : 0);
  const totalAssets = assets.reduce((s, g) => s + g.closingBalance, 0) + (data.netProfit < 0 ? Math.abs(data.netProfit) : 0);

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex flex-col">
      <div className="bg-white border border-tally-border shadow-sm flex-1 flex flex-col">
        <div className="bg-[#f0f6fa] border-b border-tally-border p-4 text-center">
          <div className="font-bold text-xl text-tally-blue">{selectedCompany?.name || 'Company Name'}</div>
          <div className="font-bold text-lg">Balance Sheet</div>
          <div className="text-sm text-gray-600">As on 6-Jun-2026</div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Liabilities */}
          <div className="w-1/2 border-r border-tally-border flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 p-2 font-bold flex justify-between">
              <span>Liabilities</span>
              <span>Amount</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {loading ? <div className="text-center p-4">Loading...</div> : liabilities.map(renderGroup)}
              {data.netProfit > 0 && (
                <div className="flex justify-between py-1 mt-4 px-2 font-bold text-tally-blue">
                  <span>Profit & Loss A/c (Profit)</span>
                  <span>{data.netProfit.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-double border-gray-400 p-2 font-bold flex justify-between bg-gray-50">
              <span>Total</span>
              <span>{totalLiabilities.toFixed(2)}</span>
            </div>
          </div>

          {/* Right Side: Assets */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 p-2 font-bold flex justify-between">
              <span>Assets</span>
              <span>Amount</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {loading ? <div className="text-center p-4">Loading...</div> : assets.map(renderGroup)}
              {data.netProfit < 0 && (
                <div className="flex justify-between py-1 mt-4 px-2 font-bold text-red-600">
                  <span>Profit & Loss A/c (Loss)</span>
                  <span>{Math.abs(data.netProfit).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-double border-gray-400 p-2 font-bold flex justify-between bg-gray-50">
              <span>Total</span>
              <span>{totalAssets.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
