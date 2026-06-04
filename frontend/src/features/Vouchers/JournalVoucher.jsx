import { useState, useEffect } from 'react';

import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';

export default function JournalVoucher() {
  const { setPageTitle } = useStore();
  
  const [ledgers, setLedgers] = useState([]);
  
  const [formData, setFormData] = useState({
    voucherTypeId: '',
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    narration: '',
  });

  const [entries, setEntries] = useState([
    { type: 'Dr', ledgerId: '', amount: '' },
    { type: 'Cr', ledgerId: '', amount: '' },
  ]);

  const [totals, setTotals] = useState({ dr: 0, cr: 0 });

  useEffect(() => {
    setPageTitle('Accounting Voucher Creation');
    
    async function fetchData() {
      try {
        const [ledgersRes, vTypesRes, vouchersRes] = await Promise.all([
          api.get('/ledgers'),
          voucherAPI.getTypes(),
          api.get('/vouchers')
        ]);
        
        setLedgers(ledgersRes.data);
        
        const type = vTypesRes.data.find(v => v.name === 'Journal');
        if (type) {
          const typeCount = vouchersRes.data.filter(v => v.voucherTypeId === type.id).length;
          const nextNum = String(typeCount + 1).padStart(5, '0');
          const generatedVoucherNumber = `SSSI/2026-27/${nextNum}`;
          
          setFormData(prev => ({ ...prev, voucherTypeId: type.id, voucherNumber: generatedVoucherNumber }));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }

    fetchData();
  }, [setPageTitle]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
    calculateTotals(newEntries);
  };

  const addEntryRow = () => {
    // Determine default type based on current totals
    const lastType = entries.length > 0 ? entries[entries.length - 1].type : 'Dr';
    setEntries([...entries, { type: lastType === 'Dr' ? 'Cr' : 'Dr', ledgerId: '', amount: '' }]);
  };

  const removeEntryRow = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    calculateTotals(newEntries);
  };

  const calculateTotals = (currentEntries) => {
    let dr = 0;
    let cr = 0;
    currentEntries.forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      if (e.type === 'Dr') dr += amt;
      else if (e.type === 'Cr') cr += amt;
    });
    setTotals({ dr, cr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (totals.dr !== totals.cr) {
      return Swal.fire('Error', `Debit (${totals.dr}) and Credit (${totals.cr}) totals do not match!`, 'error');
    }
    
    if (totals.dr === 0) {
      return Swal.fire('Error', 'Amount cannot be zero', 'error');
    }

    const validEntries = entries.filter(e => e.ledgerId && parseFloat(e.amount) > 0);
    if (validEntries.length < 2) {
      return Swal.fire('Error', 'Journal must have at least one Debit and one Credit entry', 'error');
    }

    const formattedEntries = validEntries.map(e => ({
      ledgerId: e.ledgerId,
      debitAmount: e.type === 'Dr' ? parseFloat(e.amount) : 0,
      creditAmount: e.type === 'Cr' ? parseFloat(e.amount) : 0,
    }));

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber,
      narration: formData.narration,
      totalAmount: totals.dr,
      entries: formattedEntries
    };

    try {
      const res = await voucherAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Saved', text: `Journal Voucher ${res.data.voucherNumber} created!`, timer: 1500, showConfirmButton: false });
      
      setFormData(prev => ({ ...prev, narration: '' }));
      setEntries([{ type: 'Dr', ledgerId: '', amount: '' }, { type: 'Cr', ledgerId: '', amount: '' }]);
      setTotals({ dr: 0, cr: 0 });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save voucher', 'error');
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2">
      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border p-2 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="font-bold text-lg text-yellow-600">Journal</div>
            <div className="flex flex-col">
              <span className="text-xs">No.</span>
              <input 
                name="voucherNumber" value={formData.voucherNumber} onChange={handleFormChange}
                className="border border-tally-border w-40 px-1 focus:bg-tally-yellow focus:outline-none text-right font-bold"
                autoFocus 
              />
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="mt-1 border border-gray-300 text-xs px-1" />
          </div>
        </div>

        {/* Entries Grid */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f0f6fa] border-y border-tally-border text-tally-blue">
                <th className="py-1 px-2 text-left w-16">Dr/Cr</th>
                <th className="py-1 px-2 text-left">Particulars</th>
                <th className="py-1 px-2 text-right w-32">Debit (₹)</th>
                <th className="py-1 px-2 text-right w-32">Credit (₹)</th>
                <th className="py-1 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2">
                    <select 
                      value={entry.type} 
                      onChange={e => handleEntryChange(idx, 'type', e.target.value)}
                      className="w-full bg-transparent focus:bg-white border-none focus:outline-none font-bold text-tally-blue"
                    >
                      <option value="Dr">By (Dr)</option>
                      <option value="Cr">To (Cr)</option>
                    </select>
                  </td>
                  <td className="py-1 px-2">
                    <select 
                      value={entry.ledgerId} 
                      onChange={e => handleEntryChange(idx, 'ledgerId', e.target.value)}
                      className="w-full bg-transparent focus:bg-white border-none focus:outline-none font-bold"
                    >
                      <option value="">Select Ledger...</option>
                      {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1 px-2">
                    {entry.type === 'Dr' ? (
                      <input type="number" step="0.01" value={entry.amount} onChange={e => handleEntryChange(idx, 'amount', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none font-bold" placeholder="0.00" />
                    ) : null}
                  </td>
                  <td className="py-1 px-2">
                    {entry.type === 'Cr' ? (
                      <input type="number" step="0.01" value={entry.amount} onChange={e => handleEntryChange(idx, 'amount', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none font-bold" placeholder="0.00" />
                    ) : null}
                  </td>
                  <td className="py-1 px-2 text-center">
                    {idx === entries.length - 1 ? (
                      <button type="button" onClick={addEntryRow} className="text-blue-500 hover:text-blue-700">+</button>
                    ) : (
                      <button type="button" onClick={() => removeEntryRow(idx)} className="text-red-500 hover:text-red-700">x</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-tally-border bg-[#f0f6fa]">
                <td colSpan="2" className="py-1 px-2 text-right font-bold text-gray-600">Total</td>
                <td className={`py-1 px-2 text-right font-bold ${totals.dr !== totals.cr ? 'text-red-500' : 'text-green-600'}`}>
                  {totals.dr.toFixed(2)}
                </td>
                <td className={`py-1 px-2 text-right font-bold ${totals.dr !== totals.cr ? 'text-red-500' : 'text-green-600'}`}>
                  {totals.cr.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-tally-border bg-[#f0f6fa] p-2">
          <label className="text-xs text-tally-blue font-bold block mb-1">Narration:</label>
          <textarea 
            name="narration" value={formData.narration} onChange={handleFormChange} rows="2"
            className="w-full border border-tally-border focus:bg-tally-yellow focus:outline-none px-1 text-sm resize-none"
          />
        </div>
        
        <div className="p-2 border-t border-tally-border flex justify-end">
           <button type="submit" className="bg-tally-blue text-white px-6 py-1 text-sm font-bold shadow hover:bg-opacity-90">
            Accept (Ctrl+A)
          </button>
        </div>

      </form>
    </div>
  );
}
