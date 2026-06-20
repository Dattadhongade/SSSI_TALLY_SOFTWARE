import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';

export default function ProfitAndLoss() {
  const { setPageTitle, selectedCompany } = useStore();
  const [data, setData] = useState({ groups: [], totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/financials');
      setData(res.data.profitAndLoss);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPageTitle('Profit & Loss A/c');
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

  const expenses = data.groups.filter(g => g.balanceType === 'Dr');
  const incomes = data.groups.filter(g => g.balanceType === 'Cr');

  const leftTotal = data.netProfit > 0 ? data.totalExpense + data.netProfit : data.totalExpense;
  const rightTotal = data.netProfit < 0 ? data.totalIncome + Math.abs(data.netProfit) : data.totalIncome;

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex flex-col">
      <div className="bg-white border border-tally-border shadow-sm flex-1 flex flex-col">
        <div className="bg-[#f0f6fa] border-b border-tally-border p-4 text-center">
          <div className="font-bold text-xl text-tally-blue">{selectedCompany?.name || 'Company Name'}</div>
          <div className="font-bold text-lg">Profit & Loss A/c</div>
          <div className="text-sm text-gray-600">1-Apr-2026 to 31-Mar-2027</div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Expenses / Purchases */}
          <div className="w-1/2 border-r border-tally-border flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 p-2 font-bold flex justify-between">
              <span>Particulars</span>
              <span>Amount</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {loading ? <div className="text-center p-4">Loading...</div> : expenses.map(renderGroup)}
              {data.netProfit > 0 && (
                <div className="flex justify-between py-1 mt-4 px-2 font-bold text-tally-blue">
                  <span>Net Profit</span>
                  <span>{data.netProfit.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-double border-gray-400 p-2 font-bold flex justify-between bg-gray-50">
              <span>Total</span>
              <span>{leftTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Right Side: Incomes / Sales */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 p-2 font-bold flex justify-between">
              <span>Particulars</span>
              <span>Amount</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {loading ? <div className="text-center p-4">Loading...</div> : incomes.map(renderGroup)}
              {data.netProfit < 0 && (
                <div className="flex justify-between py-1 mt-4 px-2 font-bold text-red-600">
                  <span>Net Loss</span>
                  <span>{Math.abs(data.netProfit).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-double border-gray-400 p-2 font-bold flex justify-between bg-gray-50">
              <span>Total</span>
              <span>{rightTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
