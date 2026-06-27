import { formatPeriodDate , getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect, useRef } from 'react';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';
import TallySelect from '../../components/common/TallySelect';

export default function PaymentVoucher() {
  const { setPageTitle } = useStore();
  
  const [ledgers, setLedgers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);
  
  const [formData, setFormData] = useState({
    voucherTypeId: '',
    date: getLocalISODate(),
    voucherNumber: '',
    accountId: '', // Cash or Bank (Credit)
    partyId: '', // Supplier / Expense (Debit)
    amount: '',
    narration: '',
  });

  const [bankDetails, setBankDetails] = useState({
    instrumentType: 'Cheque',
    instrumentNumber: '',
    instrumentDate: getLocalISODate(),
    bankName: ''
  });

  const dateInputRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (dateInputRef.current && dateInputRef.current.showPicker) {
          dateInputRef.current.showPicker();
        } else if (dateInputRef.current) {
          dateInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    try {
      const [ledgersRes, vTypesRes, vouchersRes] = await Promise.all([
        api.get('/ledgers'),
        voucherAPI.getTypes(),
        api.get('/vouchers')
      ]);
      
      setLedgers(ledgersRes.data);
      setAllVouchers(vouchersRes.data);
      
      const type = vTypesRes.data.find(v => v.name === 'Payment');
      if (type) {
        const typeCount = vouchersRes.data.filter(v => v.voucherTypeId === type.id).length;
        const generatedVoucherNumber = String(typeCount + 1);
        
        setFormData(prev => ({ ...prev, voucherTypeId: type.id, voucherNumber: generatedVoucherNumber }));
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPageTitle('Accounting Voucher Creation');
      fetchData();
    }, 0);
  }, [setPageTitle]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId || !formData.partyId) {
      return Swal.fire('Error', 'Please select Account and Particulars', 'error');
    }

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      return Swal.fire('Error', 'Please enter a valid amount', 'error');
    }

    const entries = [
      { ledgerId: formData.partyId, debitAmount: amt, creditAmount: 0 },    // Dr Party
      { ledgerId: formData.accountId, debitAmount: 0, creditAmount: amt },  // Cr Cash/Bank
    ];

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber,
      narration: formData.narration,
      totalAmount: amt,
      partyDetails: bankDetails,
      entries
    };

    try {
      const res = await voucherAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Saved', text: `Payment Voucher ${res.data.voucherNumber} created!`, timer: 1500, showConfirmButton: false });
      
      setFormData(prev => ({ ...prev, accountId: '', partyId: '', amount: '', narration: '' }));
      setBankDetails({ instrumentType: 'Cheque', instrumentNumber: '', instrumentDate: getLocalISODate(), bankName: '' });
      await fetchData(); // Refresh balances!
      if (firstInputRef.current) firstInputRef.current.focus();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save voucher', 'error');
    }
  };

  const cashBankLedgers = ledgers; 
  const otherLedgers = ledgers;

  const getLedgerBalance = (ledgerId) => {
    if (!ledgerId) return '';
    let balance = 0;
    const ledger = ledgers.find(l => l.id === ledgerId);
    if (ledger) {
      balance += (ledger.openingBalanceType === 'Dr' ? Number(ledger.openingBalance || 0) : -Number(ledger.openingBalance || 0));
    }
    allVouchers.forEach(v => {
      if (!v.entries) return;
      v.entries.forEach(e => {
        if (Number(e.ledgerId) === Number(ledgerId)) {
          balance += Number(e.debitAmount || 0);
          balance -= Number(e.creditAmount || 0);
        }
      });
    });
    return balance >= 0 ? `${balance.toFixed(2)} Dr` : `${Math.abs(balance).toFixed(2)} Cr`;
  };

  return (
    <div className="bg-[#e2f1f8] min-h-full font-sans text-[13px] flex justify-center p-2">
      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="bg-white border shadow-md w-full max-w-6xl flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b px-1 py-1">
          <div className="flex">
            <div className="bg-[#36659c] text-white font-bold px-8 py-0.5 mr-2">Payment</div>
            <div className="flex items-center text-tally-blue">
              <span>No.</span>
              <input 
                ref={firstInputRef}
                name="voucherNumber" value={formData.voucherNumber} onChange={handleFormChange}
                className="w-24 px-1 ml-2 font-bold focus:bg-white focus:outline-none"
                autoFocus 
              />
            </div>
          </div>
          <div className="text-right text-black font-bold flex flex-col items-end leading-tight relative group cursor-pointer w-full h-full">
            <span>{formatPeriodDate(formData.date)}</span>
            <span className="font-normal">{new Date(formData.date).toLocaleString('en-GB', {weekday: 'long'})}</span>
            <input ref={dateInputRef} type="date" name="date" value={formData.date} onChange={handleFormChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>

        {/* Account Selection */}
        <div className="px-4 py-2 border-b flex flex-col">
          <div className="flex items-center">
            <label className="w-32 text-black">Account</label>
            <span className="mr-2">:</span>
            <TallySelect
              name="accountId"
              value={formData.accountId}
              onChange={handleFormChange}
              options={cashBankLedgers}
              placeholder="Select Cash/Bank..."
              className="w-80 border-b border-transparent focus:border-gray-300 px-1 py-0.5 focus:bg-white focus:outline-none font-bold text-black"
            />
          </div>
          <div className="flex items-center mt-0.5 text-[11px] text-gray-500 italic">
            <span className="w-32">Current balance</span>
            <span className="mr-2">:</span>
            <span className="font-bold">{getLedgerBalance(formData.accountId)}</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="flex justify-between px-4 py-1 border-b bg-white text-black font-bold">
          <div className="text-center w-full">Particulars</div>
          <div className="w-48 text-right">Amount</div>
        </div>

        {/* Table Body */}
        <div className="px-4 py-2 flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1 flex flex-col">
              <TallySelect
                name="partyId"
                value={formData.partyId}
                onChange={handleFormChange}
                options={otherLedgers}
                placeholder="Select Party/Expense..."
                className="w-80 border-b border-transparent focus:border-gray-300 px-1 py-0.5 focus:bg-white focus:outline-none font-bold text-black"
              />
              <div className="mt-1 ml-4 text-[11px] text-gray-500 italic">Cur Bal: <span className="font-bold">{getLedgerBalance(formData.partyId)}</span></div>
            </div>
            
            <div className="w-48 text-right">
              <input 
                name="amount" type="number" step="0.01" value={formData.amount} onChange={handleFormChange}
                className="w-full px-1 py-0.5 focus:bg-white focus:outline-none font-bold text-right" 
                placeholder="" required
              />
            </div>
          </div>
        </div>

        {/* Bank Allocations */}
        <div className="px-4 py-2 border-b bg-[#f9fbfd]">
          <div className="font-bold text-tally-blue mb-2 text-[11px] uppercase tracking-wider">Bank Allocations</div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <label className="text-black mr-2 text-xs w-16">Inst. Type:</label>
              <TallySelect
                name="instrumentType"
                value={bankDetails.instrumentType}
                onChange={e => setBankDetails({...bankDetails, instrumentType: e.target.value})}
                options={[
                  {id: 'Cheque', name: 'Cheque'},
                  {id: 'e-Fund Transfer', name: 'e-Fund Transfer'},
                  {id: 'Others', name: 'Others'}
                ]}
                placeholder="Type"
                className="border-b px-1 py-0.5 w-28 text-xs focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex items-center">
              <label className="text-black mr-2 text-xs">Inst. No.:</label>
              <input value={bankDetails.instrumentNumber} onChange={e => setBankDetails({...bankDetails, instrumentNumber: e.target.value})} className="border px-1 py-0.5 w-24 text-xs focus:bg-white focus:outline-none" />
            </div>
            <div className="flex items-center">
              <label className="text-black mr-2 text-xs">Date:</label>
              <input type="date" value={bankDetails.instrumentDate} onChange={e => setBankDetails({...bankDetails, instrumentDate: e.target.value})} className="border px-1 py-0.5 w-28 text-xs focus:bg-white focus:outline-none" />
            </div>
            <div className="flex items-center">
              <label className="text-black mr-2 text-xs">Bank:</label>
              <input value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} className="border px-1 py-0.5 w-32 text-xs focus:bg-white focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex justify-between items-end mb-4">
          <div className="w-2/3 flex items-start">
            <label className="mr-2 text-black">Narration:</label>
            <textarea 
              name="narration" value={formData.narration} onChange={handleFormChange} rows="2"
              className="flex-1 border-b border-gray-300 focus:bg-white focus:outline-none focus:border-black px-1 resize-none"
            />
          </div>
          <div className="w-1/3 text-right">
            <button type="submit" className="bg-[#36659c] text-white px-6 py-1 text-sm font-bold shadow hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36659c]">
              Accept (Ctrl+A)
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
