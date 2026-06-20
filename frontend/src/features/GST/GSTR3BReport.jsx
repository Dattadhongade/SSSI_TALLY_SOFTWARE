import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import { FaDownload } from 'react-icons/fa';

export default function GSTR3BReport() {
  const { setPageTitle } = useStore();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setPageTitle('GSTR-3B Report');
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get('/gst/gstr3b', { params: dateRange });
        setReportData(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch GSTR-3B');
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
    return <div className="p-4 text-tally-blue font-bold">Loading GSTR-3B...</div>;
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
    a.download = `GSTR3B_${dateRange.startDate}_to_${dateRange.endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { outwardSupplies, eligibleITC } = reportData;
  const netCgst = (outwardSupplies.cgst || 0) - (eligibleITC.cgst || 0);
  const netSgst = (outwardSupplies.sgst || 0) - (eligibleITC.sgst || 0);
  const netIgst = (outwardSupplies.igst || 0) - (eligibleITC.igst || 0);

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4">
      <div className="bg-white border border-tally-border shadow-sm p-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-tally-blue">GSTR-3B Summary</h2>
          <p className="text-sm text-gray-600">Monthly Return of Tax Liability and ITC</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleExportJson}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 font-bold rounded shadow hover:bg-green-700 transition-colors"
          >
            <FaDownload /> Export JSON
          </button>
          <div>
            <label className="text-xs font-bold mr-2">From:</label>
            <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="border border-tally-border px-2 py-1 text-sm focus:bg-tally-yellow focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold mr-2">To:</label>
            <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="border border-tally-border px-2 py-1 text-sm focus:bg-tally-yellow focus:outline-none" />
          </div>
          <button className="bg-tally-blue text-white px-4 py-1 text-sm font-bold shadow hover:bg-opacity-90">Print Return</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Outward Supplies */}
        <div className="bg-white border border-tally-border shadow-sm">
          <div className="bg-[#fcf8e3] border-b border-tally-border px-4 py-2 font-bold text-tally-dark">
            3.1 Details of Outward Supplies (Tax Liability)
          </div>
          <div className="p-4">
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>Total Taxable Value</span>
               <span className="font-bold">₹ {Number(outwardSupplies.taxableValue).toFixed(2)}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>Central Tax (CGST)</span>
               <span className="font-bold text-red-600">₹ {Number(outwardSupplies.cgst).toFixed(2)}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>State Tax (SGST)</span>
               <span className="font-bold text-red-600">₹ {Number(outwardSupplies.sgst).toFixed(2)}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>Integrated Tax (IGST)</span>
               <span className="font-bold text-red-600">₹ {Number(outwardSupplies.igst).toFixed(2)}</span>
             </div>
          </div>
        </div>

        {/* ITC */}
        <div className="bg-white border border-tally-border shadow-sm">
          <div className="bg-[#eaf4e8] border-b border-tally-border px-4 py-2 font-bold text-tally-dark">
            4. Eligible ITC
          </div>
          <div className="p-4">
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>Central Tax (CGST)</span>
               <span className="font-bold text-green-600">₹ {Number(eligibleITC.cgst).toFixed(2)}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>State Tax (SGST)</span>
               <span className="font-bold text-green-600">₹ {Number(eligibleITC.sgst).toFixed(2)}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span>Integrated Tax (IGST)</span>
               <span className="font-bold text-green-600">₹ {Number(eligibleITC.igst).toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-tally-border shadow-sm mt-4">
          <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-3 font-bold text-tally-blue flex justify-between">
            <span>Net Tax Payable / (Refundable)</span>
            <span>Total: ₹ {(netCgst + netSgst + netIgst).toFixed(2)}</span>
          </div>
          <div className="p-4 flex gap-8 justify-end">
             <div className="text-right">
               <div className="text-xs text-gray-500 uppercase font-bold">CGST Payable</div>
               <div className={`text-xl font-bold ${netCgst > 0 ? 'text-red-600' : 'text-green-600'}`}>₹ {netCgst.toFixed(2)}</div>
             </div>
             <div className="text-right">
               <div className="text-xs text-gray-500 uppercase font-bold">SGST Payable</div>
               <div className={`text-xl font-bold ${netSgst > 0 ? 'text-red-600' : 'text-green-600'}`}>₹ {netSgst.toFixed(2)}</div>
             </div>
             <div className="text-right">
               <div className="text-xs text-gray-500 uppercase font-bold">IGST Payable</div>
               <div className={`text-xl font-bold ${netIgst > 0 ? 'text-red-600' : 'text-green-600'}`}>₹ {netIgst.toFixed(2)}</div>
             </div>
          </div>
      </div>
    </div>
  );
}
