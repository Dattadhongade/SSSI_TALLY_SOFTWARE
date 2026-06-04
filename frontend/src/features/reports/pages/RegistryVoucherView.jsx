import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../../../store/useStore';
import { Eye, Edit, Trash2, Download } from 'lucide-react';

export default function RegistryVoucherView() {
  const location = useLocation();
  const { setPageTitle } = useStore();
  const searchParams = new URLSearchParams(location.search);
  const month = searchParams.get('month');
  
  const isSales = location.pathname.includes('sales');
  const registryType = isSales ? 'Sales Register' : 'Purchase Register';
  
  useEffect(() => {
    setPageTitle(`${registryType} - ${month || ''}`);
  }, [setPageTitle, registryType, month]);

  // Mock data for vouchers
  const vouchers = [
    { id: 1, date: '1-Apr-2026', particulars: 'Shree Ganesh Enterprises', vchType: 'Sales', vchNo: 'INV-001', debit: 25000, credit: 0 },
    { id: 2, date: '15-Apr-2026', particulars: 'Omkar Traders', vchType: 'Sales', vchNo: 'INV-002', debit: 25000, credit: 0 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 print:p-0 print:bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-lg font-bold text-tally-blue underline">Vouchers for {month}</h2>
        <button 
          onClick={handlePrint}
          className="bg-tally-blue text-white px-4 py-1 text-sm font-bold hover:bg-opacity-90"
        >
          Print (Ctrl+P)
        </button>
      </div>

      <div className="border border-tally-border bg-white overflow-x-auto print:border-none">
        <table className="w-full text-sm text-left">
          <thead className="bg-tally-light-blue border-b border-tally-border text-xs uppercase font-bold">
            <tr>
              <th className="px-3 py-2 border-r border-tally-border w-24">Date</th>
              <th className="px-3 py-2 border-r border-tally-border">Particulars</th>
              <th className="px-3 py-2 border-r border-tally-border w-24">Vch Type</th>
              <th className="px-3 py-2 border-r border-tally-border w-24">Vch No.</th>
              <th className="px-3 py-2 border-r border-tally-border w-28 text-right">Debit Amount</th>
              <th className="px-3 py-2 border-r border-tally-border w-28 text-right">Credit Amount</th>
              <th className="px-3 py-2 text-center w-32 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((vch) => (
              <tr key={vch.id} className="border-b border-tally-border hover:bg-tally-yellow transition-colors print:border-gray-300 print:hover:bg-transparent">
                <td className="px-3 py-2 border-r border-tally-border whitespace-nowrap">{vch.date}</td>
                <td className="px-3 py-2 border-r border-tally-border font-semibold italic">{vch.particulars}</td>
                <td className="px-3 py-2 border-r border-tally-border">{vch.vchType}</td>
                <td className="px-3 py-2 border-r border-tally-border">{vch.vchNo}</td>
                <td className="px-3 py-2 border-r border-tally-border text-right">{vch.debit > 0 ? vch.debit.toFixed(2) : ''}</td>
                <td className="px-3 py-2 border-r border-tally-border text-right">{vch.credit > 0 ? vch.credit.toFixed(2) : ''}</td>
                <td className="px-3 py-2 text-center flex justify-center space-x-2 print:hidden">
                  <button className="text-tally-blue hover:text-blue-700" title="View"><Eye size={16} /></button>
                  <button className="text-tally-blue hover:text-blue-700" title="Download Invoice"><Download size={16} /></button>
                  <button className="text-tally-dark hover:text-gray-700" title="Edit"><Edit size={16} /></button>
                  <button className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold border-t-2 border-double border-tally-border print:bg-transparent">
              <td colSpan="4" className="px-3 py-2 border-r border-tally-border text-right">Grand Total</td>
              <td className="px-3 py-2 border-r border-tally-border text-right">
                {vouchers.reduce((sum, v) => sum + v.debit, 0).toFixed(2)}
              </td>
              <td className="px-3 py-2 border-r border-tally-border text-right">
                {vouchers.reduce((sum, v) => sum + v.credit, 0).toFixed(2)}
              </td>
              <td className="print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
