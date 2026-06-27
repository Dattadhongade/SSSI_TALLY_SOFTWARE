import { formatDateStr , getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import { FaDownload } from 'react-icons/fa';

export default function GSTR1Report() {
  const { setPageTitle } = useStore();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: getLocalISODate()
  });

  useEffect(() => {
    setPageTitle('GSTR-1 Report');
    const fetchReport = async () => {
      try {
        const res = await api.get('/gst/gstr1', { params: dateRange });
        setReportData(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch GSTR-1');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [dateRange, setPageTitle]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="p-4 text-tally-blue font-bold">Loading GSTR-1...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 font-bold">Error: {error}</div>;
  }

  if (!reportData) return null;

  const handleExportJson = () => {
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4">
      <div className="bg-white border border-tally-border shadow-sm p-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-tally-blue">GSTR-1 (Outward Supplies)</h2>
          <div className="text-sm text-gray-600 mt-1">Period: {dateRange.startDate} to {dateRange.endDate}</div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportJson}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 font-bold rounded shadow hover:bg-green-700 transition-colors"
          >
            <FaDownload /> Export JSON
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">From:</span>
            <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="border border-tally-border px-2 py-1 text-sm focus:bg-tally-yellow focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">To:</span>
            <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="border border-tally-border px-2 py-1 text-sm focus:bg-tally-yellow focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-tally-border p-4 shadow-sm text-center">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Vouchers</div>
          <div className="text-2xl font-bold text-tally-blue mt-1">{reportData.summary.totalVouchers}</div>
        </div>
        <div className="bg-white border border-tally-border p-4 shadow-sm text-center">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Taxable Value</div>
          <div className="text-2xl font-bold text-tally-blue mt-1">₹ {Number(reportData.summary.totalTaxable).toFixed(2)}</div>
        </div>
        <div className="bg-white border border-tally-border p-4 shadow-sm text-center">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Tax Amount</div>
          <div className="text-2xl font-bold text-tally-blue mt-1">₹ {Number(reportData.summary.totalTax).toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white border border-tally-border shadow-sm mb-4">
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 font-bold text-tally-blue">
          B2B Invoices (4A, 4B, 4C, 6B, 6C)
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-left">
                <th className="p-2 w-32">Invoice No</th>
                <th className="p-2 w-24">Date</th>
                <th className="p-2">Receiver Name</th>
                <th className="p-2 w-32">GSTIN/UIN</th>
                <th className="p-2 text-right">Taxable Value</th>
                <th className="p-2 text-right">Tax Amount</th>
                <th className="p-2 text-right">Total Invoice Value</th>
              </tr>
            </thead>
            <tbody>
              {reportData.b2b.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center text-gray-500 italic">No B2B Invoices found</td></tr>
              ) : (
                reportData.b2b.map(inv => {
                  const totalTax = Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst) + Number(inv.cess);
                  return (
                    <tr key={inv.id} className="border-b border-gray-200 hover:bg-[#fcf8e3]">
                      <td className="p-2 font-bold">{inv.voucherNumber}</td>
                      <td className="p-2">{formatDateStr(inv.date)}</td>
                      <td className="p-2">{inv.partyName}</td>
                      <td className="p-2">{inv.gstin}</td>
                      <td className="p-2 text-right">{Number(inv.taxableValue).toFixed(2)}</td>
                      <td className="p-2 text-right">{totalTax.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">{Number(inv.totalAmount).toFixed(2)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-tally-border shadow-sm">
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 font-bold text-tally-blue">
          B2C (Others) Invoices (7)
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300 text-left">
                <th className="p-2 w-32">Invoice No</th>
                <th className="p-2 w-24">Date</th>
                <th className="p-2">Receiver Name</th>
                <th className="p-2 w-32">Place of Supply</th>
                <th className="p-2 text-right">Taxable Value</th>
                <th className="p-2 text-right">Tax Amount</th>
                <th className="p-2 text-right">Total Invoice Value</th>
              </tr>
            </thead>
            <tbody>
              {reportData.b2c.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center text-gray-500 italic">No B2C Invoices found</td></tr>
              ) : (
                reportData.b2c.map(inv => {
                  const totalTax = Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst) + Number(inv.cess);
                  return (
                    <tr key={inv.id} className="border-b border-gray-200 hover:bg-[#fcf8e3]">
                      <td className="p-2 font-bold">{inv.voucherNumber}</td>
                      <td className="p-2">{formatDateStr(inv.date)}</td>
                      <td className="p-2">{inv.partyName}</td>
                      <td className="p-2">{inv.placeOfSupply}</td>
                      <td className="p-2 text-right">{Number(inv.taxableValue).toFixed(2)}</td>
                      <td className="p-2 text-right">{totalTax.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">{Number(inv.totalAmount).toFixed(2)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
