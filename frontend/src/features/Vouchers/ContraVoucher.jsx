import { useState, useEffect } from 'react';

import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';

export default function ContraVoucher() {
  const { setPageTitle } = useStore();
  
  const [ledgers, setLedgers] = useState([]);
  
  const [formData, setFormData] = useState({
    voucherTypeId: '',
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    accountId: '', // Debit
    partyId: '',   // Credit
    amount: '',
    narration: '',
  });

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
        
        const type = vTypesRes.data.find(v => v.name === 'Contra');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId || !formData.partyId) {
      return Swal.fire('Error', 'Please select Account and Particulars', 'error');
    }

    if (formData.accountId === formData.partyId) {
      return Swal.fire('Error', 'Account and Particulars cannot be the same ledger', 'error');
    }

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      return Swal.fire('Error', 'Please enter a valid amount', 'error');
    }

    const entries = [
      { ledgerId: formData.accountId, debitAmount: amt, creditAmount: 0 }, 
      { ledgerId: formData.partyId, debitAmount: 0, creditAmount: amt }    
    ];

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber,
      narration: formData.narration,
      totalAmount: amt,
      entries
    };

    try {
      const res = await voucherAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Saved', text: `Contra Voucher ${res.data.voucherNumber} created!`, timer: 1500, showConfirmButton: false });
      
      setFormData(prev => ({ ...prev, accountId: '', partyId: '', amount: '', narration: '' }));
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save voucher', 'error');
    }
  };

  const cashBankLedgers = ledgers; 

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2">
      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border p-2 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="font-bold text-lg text-white bg-gray-500 px-2 rounded">Contra</div>
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

        <div className="p-4 space-y-4 flex-1">
          <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-tally-blue">Account (Dr)</label>
            <span className="mx-2">:</span>
            <select name="accountId" value={formData.accountId} onChange={handleFormChange} className="w-64 border border-tally-border px-1 py-0.5 focus:bg-tally-yellow font-bold focus:outline-none" required>
              <option value="">Select Cash/Bank...</option>
              {cashBankLedgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-tally-blue">Particulars (Cr)</label>
            <span className="mx-2">:</span>
            <select name="partyId" value={formData.partyId} onChange={handleFormChange} className="w-64 border border-tally-border px-1 py-0.5 focus:bg-tally-yellow focus:outline-none" required>
              <option value="">Select Cash/Bank...</option>
              {cashBankLedgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          
          <div className="flex items-center mt-4">
            <label className="w-32 text-sm font-bold text-tally-blue">Amount</label>
            <span className="mx-2">:</span>
            <input 
              name="amount" type="number" step="0.01" value={formData.amount} onChange={handleFormChange}
              className="border border-tally-border px-1 py-0.5 focus:bg-tally-yellow focus:outline-none font-bold text-right" 
              placeholder="0.00" required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-tally-border bg-[#f0f6fa] p-2 flex justify-between items-end">
          <div className="w-1/2">
            <label className="text-xs text-tally-blue font-bold">Narration:</label>
            <textarea 
              name="narration" value={formData.narration} onChange={handleFormChange} rows="2"
              className="w-full border border-tally-border focus:bg-tally-yellow focus:outline-none px-1 text-sm resize-none"
            />
          </div>
          <div className="text-right flex items-center pr-12">
            <span className="text-sm font-bold mr-4">Total :</span>
            <span className="text-xl font-bold border-t-2 border-double border-gray-800 pt-1 min-w-[120px] inline-block">
              ₹ {parseFloat(formData.amount || 0).toFixed(2)}
            </span>
          </div>
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
