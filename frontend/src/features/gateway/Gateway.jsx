import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';

export default function Gateway() {
  const { selectedCompany, selectedFinancialYear, selectCompany, setPageTitle } = useStore();
  
  useEffect(() => {
    setPageTitle('Gateway of SSSI');
  }, [setPageTitle]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [period, setPeriod] = useState({
    from: selectedFinancialYear?.start_date ? selectedFinancialYear.start_date.split('-').reverse().join('-') : '01-04-2026',
    to: selectedFinancialYear?.end_date ? selectedFinancialYear.end_date.split('-').reverse().join('-') : '31-03-2027'
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const handleChangePeriod = (e) => {
    e.preventDefault();
    // Validate format DD-MM-YYYY
    const fromParts = period.from.split('-');
    const toParts = period.to.split('-');
    if (fromParts.length !== 3 || toParts.length !== 3) {
      return Swal.fire('Error', 'Use DD-MM-YYYY format', 'error');
    }
    
    // Find matching FY from company if available, or just mock it for UI for now
    const newFy = {
      ...selectedFinancialYear,
      start_date: `${fromParts[2]}-${fromParts[1]}-${fromParts[0]}`,
      end_date: `${toParts[2]}-${toParts[1]}-${toParts[0]}`
    };
    
    selectCompany(selectedCompany, newFy);
    setShowPeriodModal(false);
  };

  return (
    <div className="flex h-full font-sans relative">
      {/* Left Pane - Active Company Info */}
      <div className="w-full border-r border-tally-border bg-[#fcf8e3]">
        <div className="bg-tally-blue text-white px-4 py-1 text-sm font-bold flex justify-between">
          <span className="uppercase text-[11px] tracking-wide">Current Period</span>
          <span className="uppercase text-[11px] tracking-wide">Current Date</span>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-tally-border text-sm font-bold text-tally-dark">
          <span className="text-base cursor-pointer hover:text-blue-600 hover:underline" onClick={() => setShowPeriodModal(true)}>
            {selectedFinancialYear ? `${formatDate(selectedFinancialYear.start_date)} to ${formatDate(selectedFinancialYear.end_date)}` : 'No FY Selected'}
          </span>
          <span className="text-base">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

        <div className="mt-6 flex justify-between px-4 text-xs font-bold text-tally-blue uppercase tracking-wide border-b border-tally-border pb-1">
          <span className="w-1/2">Name of Company</span>
          <span className="w-1/2 text-right">Date of Last Entry</span>
        </div>
        
        {selectedCompany && (
          <div className="mt-4 flex justify-between px-4 font-bold text-tally-dark">
            <div className="w-1/2 flex flex-col">
              <span className="text-lg">{selectedCompany.name}</span>
              {selectedCompany.gstin && (
                <span className="text-xs text-gray-600 mt-1">GSTIN: {selectedCompany.gstin}</span>
              )}
            </div>
            <span className="w-1/2 text-right text-sm pt-1">No Vouchers Entered</span>
          </div>
        )}
      </div>

      {/* Change Period Modal */}
      {showPeriodModal && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white border border-tally-border shadow-2xl p-6 w-80">
            <h2 className="text-center font-bold text-tally-blue text-lg border-b border-tally-border pb-2 mb-4">Change Period</h2>
            <form onSubmit={handleChangePeriod} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-tally-dark">From</label>
                <span className="font-bold">:</span>
                <input 
                  type="text" 
                  value={period.from}
                  onChange={(e) => setPeriod({...period, from: e.target.value})}
                  className="w-40 border border-tally-blue focus:outline-none bg-[#fcf8e3] px-2 py-1 font-bold text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-tally-dark">To</label>
                <span className="font-bold">:</span>
                <input 
                  type="text" 
                  value={period.to}
                  onChange={(e) => setPeriod({...period, to: e.target.value})}
                  className="w-40 border border-tally-blue focus:outline-none bg-white px-2 py-1 font-bold text-center"
                />
              </div>
              <div className="flex justify-end pt-2 space-x-2">
                <button type="button" onClick={() => setShowPeriodModal(false)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-tally-blue text-white hover:bg-opacity-90 text-sm font-bold">Accept</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
