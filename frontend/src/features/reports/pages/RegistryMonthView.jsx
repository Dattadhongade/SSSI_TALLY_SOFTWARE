import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../../store/useStore';

export default function RegistryMonthView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPageTitle } = useStore();
  
  // Determine registry type from URL (e.g. /reports/account-book/sales-registry)
  const isSales = location.pathname.includes('sales');
  const registryType = isSales ? 'Sales Register' : 'Purchase Register';
  
  useEffect(() => {
    setPageTitle(registryType);
  }, [setPageTitle, registryType]);

  // Mock data for months
  const monthsData = [
    { month: 'April', debit: 0, credit: 50000 },
    { month: 'May', debit: 0, credit: 75000 },
    { month: 'June', debit: 0, credit: 62000 },
    { month: 'July', debit: 0, credit: 0 },
    { month: 'August', debit: 0, credit: 89000 },
    { month: 'September', debit: 0, credit: 0 },
    { month: 'October', debit: 0, credit: 0 },
    { month: 'November', debit: 0, credit: 0 },
    { month: 'December', debit: 0, credit: 0 },
    { month: 'January', debit: 0, credit: 0 },
    { month: 'February', debit: 0, credit: 0 },
    { month: 'March', debit: 0, credit: 0 },
  ];

  const handleMonthClick = (month) => {
    // Navigate to voucher view for that month
    navigate(`${location.pathname}/vouchers?month=${month}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 print:p-0 print:bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-lg font-bold text-tally-blue underline">{registryType}</h2>
        <button 
          onClick={handlePrint}
          className="bg-tally-blue text-white px-4 py-1 text-sm font-bold hover:bg-opacity-90"
        >
          Print (Ctrl+P)
        </button>
      </div>

      <div className="border border-tally-border bg-white print:border-none">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-tally-light-blue border-b border-tally-border font-bold text-sm">
          <div className="col-span-6 p-2 border-r border-tally-border text-center">Particulars</div>
          <div className="col-span-6 flex flex-col text-center">
            <div className="border-b border-tally-border p-1">Transactions</div>
            <div className="grid grid-cols-2">
              <div className="p-1 border-r border-tally-border">Debit</div>
              <div className="p-1">Credit</div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        {monthsData.map((row, index) => (
          <div 
            key={index} 
            className="grid grid-cols-12 border-b border-tally-border hover:bg-tally-yellow cursor-pointer text-sm transition-colors print:border-b print:border-gray-300 print:hover:bg-transparent"
            onClick={() => handleMonthClick(row.month)}
          >
            <div className="col-span-6 p-2 border-r border-tally-border font-semibold italic">{row.month}</div>
            <div className="col-span-6 grid grid-cols-2 text-right">
              <div className="p-2 border-r border-tally-border">{row.debit > 0 ? row.debit.toFixed(2) : ''}</div>
              <div className="p-2">{row.credit > 0 ? row.credit.toFixed(2) : ''}</div>
            </div>
          </div>
        ))}

        {/* Grand Total */}
        <div className="grid grid-cols-12 border-t-2 border-double border-tally-border font-bold text-sm bg-gray-50 print:bg-transparent">
          <div className="col-span-6 p-2 border-r border-tally-border text-right">Grand Total</div>
          <div className="col-span-6 grid grid-cols-2 text-right">
            <div className="p-2 border-r border-tally-border">
              {monthsData.reduce((sum, row) => sum + row.debit, 0).toFixed(2)}
            </div>
            <div className="p-2">
              {monthsData.reduce((sum, row) => sum + row.credit, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
