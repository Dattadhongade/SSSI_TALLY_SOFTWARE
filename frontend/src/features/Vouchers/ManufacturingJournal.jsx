import { getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect, useCallback } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import Swal from 'sweetalert2';

export default function ManufacturingJournal() {
  const { setPageTitle } = useStore();
  const [stockItems, setStockItems] = useState([]);
  
  const [formData, setFormData] = useState({
    date: getLocalISODate(),
    voucherNumber: 'MFG/26-27/001',
    productId: '',
    quantityProduced: 1,
    narration: ''
  });

  const [components, setComponents] = useState([
    { stockItemId: '', quantity: '', rate: '', amount: 0 }
  ]);
  const [scrap] = useState([
    { stockItemId: '', quantity: '', rate: '', amount: 0 }
  ]);
  const [additionalCosts] = useState([
    { ledgerId: '', amount: 0 }
  ]);

  const fetchMasters = useCallback(async () => {
    try {
      const res = await api.get('/stockitems');
      setStockItems(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setPageTitle('Manufacturing Journal');
    const t = setTimeout(() => fetchMasters(), 0);
    return () => clearTimeout(t);
  }, [setPageTitle, fetchMasters]);

  const handleProductChange = (e) => {
    const pId = e.target.value;
    setFormData({ ...formData, productId: pId });
    // If product has BOM, we would auto-populate components here.
    // For now, we leave it manual or pseudo-auto.
    const product = stockItems.find(i => String(i.id) === String(pId));
    if (product && product.bomDetails) {
      try {
        const bom = JSON.parse(product.bomDetails);
        setComponents(bom.components || [{ stockItemId: '', quantity: '', rate: '', amount: 0 }]);
      } catch {
        console.error('Failed to parse BOM');
      }
    }
  };

  const handleComponentChange = (index, field, value) => {
    const newComps = [...components];
    newComps[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const q = parseFloat(newComps[index].quantity) || 0;
      const r = parseFloat(newComps[index].rate) || 0;
      newComps[index].amount = q * r;
    }
    if (index === newComps.length - 1 && field === 'stockItemId' && value) {
      newComps.push({ stockItemId: '', quantity: '', rate: '', amount: 0 });
    }
    setComponents(newComps);
  };

  const totalComponentCost = components.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalScrapValue = scrap.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalAdditionalCost = additionalCosts.reduce((sum, a) => sum + Number(a.amount), 0);
  const effectiveCost = totalComponentCost + totalAdditionalCost - totalScrapValue;
  const effectiveRate = formData.quantityProduced > 0 ? effectiveCost / formData.quantityProduced : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ icon: 'success', title: 'Saved', text: 'Manufacturing Journal saved successfully!', timer: 1500, showConfirmButton: false });
    // Reset
    setFormData({...formData, productId: '', quantityProduced: 1});
    setComponents([{ stockItemId: '', quantity: '', rate: '', amount: 0 }]);
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2">
      <form onSubmit={handleSubmit} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-bold text-xl text-tally-blue">Manufacturing Journal</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-tally-blue">No.</span>
              <input value={formData.voucherNumber} readOnly className="bg-transparent border border-transparent w-48 px-1 font-bold outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none text-sm" />
          </div>
        </div>

        {/* Product Being Manufactured */}
        <div className="bg-[#eaf4e8] border-b border-tally-border p-4">
           <div className="font-bold text-tally-blue mb-2 underline">Name of Product</div>
           <div className="flex gap-8 items-end">
             <div>
               <label className="text-xs font-bold mr-2">Item:</label>
               <select value={formData.productId} onChange={handleProductChange} className="border border-tally-border px-2 py-1 focus:bg-tally-yellow w-64">
                 <option value="">-- Select Product --</option>
                 {stockItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
               </select>
             </div>
             <div>
               <label className="text-xs font-bold mr-2">Qty Produced:</label>
               <input type="number" value={formData.quantityProduced} onChange={e => setFormData({...formData, quantityProduced: e.target.value})} className="border border-tally-border px-2 py-1 focus:bg-tally-yellow w-32 text-right" />
             </div>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Components (Raw Materials) */}
          <div className="w-1/2 border-r border-tally-border flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-1 font-bold text-sm text-center">Components (Consumption)</div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-left bg-gray-50">
                    <th className="p-1 pl-4">Item Name</th>
                    <th className="p-1 w-20 text-right">Qty</th>
                    <th className="p-1 w-20 text-right">Rate</th>
                    <th className="p-1 w-24 text-right pr-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-yellow-50">
                      <td className="p-1 pl-4">
                        <select value={c.stockItemId} onChange={e => handleComponentChange(idx, 'stockItemId', e.target.value)} className="w-full border-none bg-transparent focus:bg-white outline-none">
                           <option value=""></option>
                           {stockItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </td>
                      <td className="p-1"><input value={c.quantity} onChange={e => handleComponentChange(idx, 'quantity', e.target.value)} className="w-full text-right bg-transparent outline-none focus:bg-white" /></td>
                      <td className="p-1"><input value={c.rate} onChange={e => handleComponentChange(idx, 'rate', e.target.value)} className="w-full text-right bg-transparent outline-none focus:bg-white" /></td>
                      <td className="p-1 pr-4 text-right">{Number(c.amount) > 0 ? Number(c.amount).toFixed(2) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-300 p-2 text-right font-bold bg-gray-50 pr-4">
              Total: ₹ {totalComponentCost.toFixed(2)}
            </div>
          </div>

          {/* Right Side: Co-Products / Scrap */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-1 font-bold text-sm text-center">Co-Products / By-Products / Scrap</div>
            <div className="h-1/2 border-b border-tally-border overflow-auto">
                <div className="p-4 text-center text-gray-400 italic text-xs mt-8">No scrap entries</div>
            </div>
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-1 font-bold text-sm text-center">Cost of Components</div>
            <div className="h-1/2 bg-white flex flex-col justify-end p-4 text-sm gap-2">
               <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                 <span>Cost of Components</span>
                 <span>₹ {totalComponentCost.toFixed(2)}</span>
               </div>
               <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                 <span>Total Additional Cost</span>
                 <span>₹ {totalAdditionalCost.toFixed(2)}</span>
               </div>
               <div className="flex justify-between font-bold text-tally-blue text-base pt-2">
                 <span>Effective Cost</span>
                 <span>₹ {effectiveCost.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-xs text-gray-600">
                 <span>Effective Rate of Primary Item</span>
                 <span>₹ {effectiveRate.toFixed(2)} / unit</span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-tally-border p-2 flex justify-between items-end bg-[#f0f6fa]">
          <div className="w-1/2 pr-4">
            <label className="text-xs font-bold">Narration:</label>
            <textarea value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})} className="w-full border border-tally-border focus:bg-tally-yellow px-1 outline-none text-sm" rows="1" />
          </div>
          <button type="submit" className="bg-tally-blue text-white px-6 py-1 font-bold text-sm shadow hover:bg-opacity-90">
             Accept
          </button>
        </div>
      </form>
    </div>
  );
}
