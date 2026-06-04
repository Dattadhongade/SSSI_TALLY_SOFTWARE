import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';
import { calculateGST, generatePurchaseEntries, isIntraState } from '../../utils/accountingLogic';

export default function PurchaseVoucher() {
  const { setPageTitle, selectedCompany } = useStore();
  const activeCompany = selectedCompany;
  
  const [ledgers, setLedgers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  
  const [formData, setFormData] = useState({
    voucherTypeId: '',
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    supplierInvoiceNo: '',
    supplierDate: new Date().toISOString().split('T')[0],
    partyId: '',
    purchaseLedgerId: '',
    narration: '',
  });

  const [items, setItems] = useState([
    { stockItemId: '', quantity: '', rate: '', amount: 0, gstRate: 0 }
  ]);

  const [taxTotals, setTaxTotals] = useState({ cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    setPageTitle('Accounting Voucher Creation');
    
    async function fetchData() {
      try {
        const [ledgersRes, itemsRes, vTypesRes, vouchersRes] = await Promise.all([
          api.get('/ledgers'),
          api.get('/stockitems'),
          voucherAPI.getTypes(),
          api.get('/vouchers')
        ]);
        
        setLedgers(ledgersRes.data);
        setStockItems(itemsRes.data);
        
        const type = vTypesRes.data.find(v => v.name === 'Purchase');
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

  const creditors = ledgers; 
  const purchaseAccounts = ledgers; 

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'stockItemId') {
      const item = stockItems.find(i => i.id == value);
      if (item) {
        newItems[index].gstRate = item.gstRate || 0;
      }
    }

    if (field === 'quantity' || field === 'rate') {
      const q = parseFloat(newItems[index].quantity) || 0;
      const r = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = q * r;
    }

    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { stockItemId: '', quantity: '', rate: '', amount: 0, gstRate: 0 }]);
  };

  const removeItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  useEffect(() => {
    const calculateTotals = () => {
      let totalTaxable = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      const party = ledgers.find(l => l.id == formData.partyId);
      const partyState = party ? party.state : '';
      const companyState = activeCompany ? activeCompany.state : '';
      const intra = isIntraState(companyState, partyState);

      items.forEach(item => {
        totalTaxable += item.amount;
        const tax = calculateGST(item.amount, item.gstRate, intra);
        totalCGST += tax.cgstAmount;
        totalSGST += tax.sgstAmount;
        totalIGST += tax.igstAmount;
      });

      const taxSum = totalCGST + totalSGST + totalIGST;
      setTaxTotals({ cgst: totalCGST, sgst: totalSGST, igst: totalIGST, totalTax: taxSum });
      setGrandTotal(totalTaxable + taxSum);
    };

    calculateTotals();
  }, [formData.partyId, items, ledgers, activeCompany]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partyId || !formData.purchaseLedgerId) {
      return Swal.fire('Error', 'Please select Supplier and Purchase Ledger', 'error');
    }

    const validItems = items.filter(i => i.stockItemId && i.amount > 0);
    if (validItems.length === 0) {
      return Swal.fire('Error', 'Please add at least one item', 'error');
    }

    const totalTaxable = validItems.reduce((sum, item) => sum + item.amount, 0);
    const taxDetails = { ...taxTotals };

    const entries = generatePurchaseEntries(
      formData.partyId, 
      formData.purchaseLedgerId, 
      totalTaxable, 
      taxDetails
    );

    // Add Input Taxes
    if (taxDetails.cgst > 0) {
      const cgstLedger = ledgers.find(l => l.name.toLowerCase().includes('input cgst'));
      if (cgstLedger) entries.push({ ledgerId: cgstLedger.id, debitAmount: taxDetails.cgst, creditAmount: 0 });
    }
    if (taxDetails.sgst > 0) {
      const sgstLedger = ledgers.find(l => l.name.toLowerCase().includes('input sgst'));
      if (sgstLedger) entries.push({ ledgerId: sgstLedger.id, debitAmount: taxDetails.sgst, creditAmount: 0 });
    }
    if (taxDetails.igst > 0) {
      const igstLedger = ledgers.find(l => l.name.toLowerCase().includes('input igst'));
      if (igstLedger) entries.push({ ledgerId: igstLedger.id, debitAmount: taxDetails.igst, creditAmount: 0 });
    }

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber, 
      referenceNumber: formData.supplierInvoiceNo,
      referenceDate: formData.supplierDate,
      narration: formData.narration,
      totalAmount: grandTotal,
      entries,
      inventoryEntries: validItems
    };

    try {
      const res = await voucherAPI.create(payload);
      Swal.fire({ icon: 'success', title: 'Saved', text: `Purchase Voucher ${res.data.voucherNumber} created!`, timer: 1500, showConfirmButton: false });
      
      // Reset
      setFormData(prev => ({ ...prev, partyId: '', purchaseLedgerId: '', narration: '', supplierInvoiceNo: '' }));
      setItems([{ stockItemId: '', quantity: '', rate: '', amount: 0, gstRate: 0 }]);
      setTaxTotals({ cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
      setGrandTotal(0);
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
            <div className="font-bold text-lg text-tally-red">Purchase</div>
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

        {/* Supplier Reference */}
        <div className="bg-white border-b border-tally-border p-2 flex gap-4">
           <div className="flex items-center">
             <label className="text-xs mr-2">Supplier Invoice No.:</label>
             <input name="supplierInvoiceNo" value={formData.supplierInvoiceNo} onChange={handleFormChange} className="border border-tally-border w-32 px-1 focus:bg-tally-yellow focus:outline-none text-sm" />
           </div>
           <div className="flex items-center">
             <label className="text-xs mr-2">Date:</label>
             <input type="date" name="supplierDate" value={formData.supplierDate} onChange={handleFormChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none text-sm" />
           </div>
        </div>

        {/* Party Details */}
        <div className="p-4 space-y-2 border-b border-gray-200">
          <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-tally-blue">Party A/c name</label>
            <span className="mx-2">:</span>
            <select name="partyId" value={formData.partyId} onChange={handleFormChange} className="w-64 border border-tally-border px-1 py-0.5 focus:bg-tally-yellow font-bold focus:outline-none" required>
              <option value="">Select Supplier...</option>
              {creditors.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-tally-blue">Purchase Ledger</label>
            <span className="mx-2">:</span>
            <select name="purchaseLedgerId" value={formData.purchaseLedgerId} onChange={handleFormChange} className="w-64 border border-tally-border px-1 py-0.5 focus:bg-tally-yellow focus:outline-none" required>
              <option value="">Select Purchase Ledger...</option>
              {purchaseAccounts.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f0f6fa] border-y border-tally-border text-tally-blue">
                <th className="py-1 px-2 text-left w-10">Sl</th>
                <th className="py-1 px-2 text-left">Name of Item</th>
                <th className="py-1 px-2 text-right w-24">Quantity</th>
                <th className="py-1 px-2 text-right w-24">Rate</th>
                <th className="py-1 px-2 text-right w-32">Amount</th>
                <th className="py-1 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2 text-center text-gray-500">{idx + 1}</td>
                  <td className="py-1 px-2">
                    <select 
                      value={item.stockItemId} 
                      onChange={e => handleItemChange(idx, 'stockItemId', e.target.value)}
                      className="w-full bg-transparent focus:bg-white border-none focus:outline-none font-bold"
                    >
                      <option value="">Select Item...</option>
                      {stockItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1 px-2">
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0" />
                  </td>
                  <td className="py-1 px-2">
                    <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0.00" />
                  </td>
                  <td className="py-1 px-2 text-right font-bold">
                    {item.amount > 0 ? item.amount.toFixed(2) : ''}
                  </td>
                  <td className="py-1 px-2 text-center">
                    {idx === items.length - 1 ? (
                      <button type="button" onClick={addItemRow} className="text-blue-500 hover:text-blue-700">+</button>
                    ) : (
                      <button type="button" onClick={() => removeItemRow(idx)} className="text-red-500 hover:text-red-700">x</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Tax summary in grid */}
          {(taxTotals.cgst > 0 || taxTotals.sgst > 0 || taxTotals.igst > 0) && (
            <div className="border-t border-tally-border mt-4">
              <table className="w-full text-sm">
                <tbody>
                  {taxTotals.cgst > 0 && (
                    <tr>
                      <td className="py-1 px-8 text-right font-bold text-gray-600">Input CGST</td>
                      <td className="py-1 px-12 text-right w-32">{taxTotals.cgst.toFixed(2)}</td>
                    </tr>
                  )}
                  {taxTotals.sgst > 0 && (
                    <tr>
                      <td className="py-1 px-8 text-right font-bold text-gray-600">Input SGST</td>
                      <td className="py-1 px-12 text-right w-32">{taxTotals.sgst.toFixed(2)}</td>
                    </tr>
                  )}
                  {taxTotals.igst > 0 && (
                    <tr>
                      <td className="py-1 px-8 text-right font-bold text-gray-600">Input IGST</td>
                      <td className="py-1 px-12 text-right w-32">{taxTotals.igst.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
              ₹ {grandTotal.toFixed(2)}
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
