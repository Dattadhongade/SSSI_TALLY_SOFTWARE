import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';
import { calculateGST, generatePurchaseEntries, isIntraState } from '../../utils/accountingLogic';
import TallySelect from '../../components/common/TallySelect';
import InvoicePreview from './components/InvoicePreview';

export default function PurchaseVoucher() {
  const navigate = useNavigate();
  const location = useLocation();
  const editVoucherId = location.state?.editVoucherId;
  const viewVoucherId = location.state?.viewVoucherId;
  
  const activeVoucherId = editVoucherId || viewVoucherId;
  const isEditMode = !!editVoucherId;
  const isViewMode = !!viewVoucherId;

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

  const [receiptDetails, setReceiptDetails] = useState({
    receiptNote: '', receiptDocNo: '', dispatchedThrough: '', destination: '',
    carrierName: '', billOfLading: '', date: new Date().toISOString().split('T')[0],
    motorVehicleNo: ''
  });

  const [partyDetails, setPartyDetails] = useState({
    supplierName: '', mailingName: '', address: '', state: '', country: 'India', gstType: '', gstin: '', placeOfSupply: ''
  });

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
          if (activeVoucherId) {
            const v = vouchersRes.data.find(vo => String(vo.id) === String(activeVoucherId));
            if (v) {
              setFormData({
                voucherTypeId: v.voucherTypeId,
                date: v.date.split('T')[0],
                voucherNumber: v.voucherNumber,
                supplierInvoiceNo: v.referenceNumber || '',
                supplierDate: v.referenceDate ? v.referenceDate.split('T')[0] : new Date().toISOString().split('T')[0],
                partyId: v.entries?.[1]?.ledgerId || '',
                purchaseLedgerId: v.entries?.[0]?.ledgerId || '',
                narration: v.narration || '',
              });

              if (v.entries?.[1]?.ledgerId) {
                const party = ledgersRes.data.find(l => l.id === v.entries[1].ledgerId);
                if (party) {
                  setPartyDetails({
                    supplierName: party.name,
                    mailingName: party.alias || party.name,
                    address: party.address || '',
                    state: party.state || '',
                    country: party.country || 'India',
                    gstType: party.registrationType || '',
                    gstin: party.gstin || '',
                    placeOfSupply: party.state || ''
                  });
                }
              }

              if (v.inventoryEntries && v.inventoryEntries.length > 0) {
                setItems(v.inventoryEntries.map(i => ({
                  stockItemId: i.stockItemId,
                  quantity: i.quantity,
                  rate: i.rate,
                  amount: Number(i.amount),
                  gstRate: itemsRes.data.find(it => it.id === i.stockItemId)?.gstRate || 0
                })));
              }

              if (isViewMode) {
                setShowPreview(true);
              }
            }
          } else {
            const typeCount = vouchersRes.data.filter(v => v.voucherTypeId === type.id).length;
            const nextNum = String(typeCount + 1).padStart(5, '0');
            const generatedVoucherNumber = `SSSI/2026-27/${nextNum}`;
            
            setFormData(prev => ({ ...prev, voucherTypeId: type.id, voucherNumber: generatedVoucherNumber }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }

    fetchData();
  }, [setPageTitle, activeVoucherId, isViewMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+A to save the main form (only if modals are closed)
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        if (document.querySelector('.modal-open')) return;
        e.preventDefault();
        if (isViewMode || showPreview) {
          setShowPreview(true);
        } else {
          document.getElementById('purchase-submit-btn')?.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewMode, showPreview]);

  const creditors = ledgers; 
  const purchaseAccounts = ledgers; 

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (value === 'CREATE') {
      navigate('/masters/ledger/create');
      return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'partyId' && value) {
      const party = creditors.find(l => l.id == value);
      if (party) {
        setPartyDetails({
          supplierName: party.name,
          mailingName: party.alias || party.name,
          address: party.address || '',
          state: party.state || '',
          country: party.country || 'India',
          gstType: party.registrationType || '',
          gstin: party.gstin || '',
          placeOfSupply: party.state || ''
        });
        setShowReceiptModal(true);
      }
    }
  };

  const handleReceiptChange = (e) => {
    setReceiptDetails({ ...receiptDetails, [e.target.name]: e.target.value });
  };

  const handlePartyDetailsChange = (e) => {
    setPartyDetails({ ...partyDetails, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'stockItemId') {
      if (value === 'END') {
        document.getElementById('narration')?.focus();
        return;
      }
      if (value === 'CREATE') {
        navigate('/inventory/item/create');
        return;
      }
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

    if (field === 'amount') {
      newItems[index].amount = parseFloat(value) || 0;
    }

    if (index === newItems.length - 1 && field === 'stockItemId' && value) {
      newItems.push({ stockItemId: '', quantity: '', rate: '', amount: 0, gstRate: 0 });
    }

    setItems(newItems);
  };


  useEffect(() => {
    const calculateTotals = () => {
      let totalTaxable = 0;
      let groupedTaxes = {};
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      const party = ledgers.find(l => l.id == formData.partyId);
      const partyState = party ? party.state : '';
      const companyState = activeCompany ? activeCompany.state : '';
      const intra = isIntraState(companyState, partyState);

      const purchaseLedger = ledgers.find(l => l.id == formData.purchaseLedgerId);
      let ledgerGstRate = null;
      if (purchaseLedger) {
        const match = purchaseLedger.name.match(/(\d+)%/);
        if (match) {
          ledgerGstRate = parseInt(match[1], 10);
        }
      }

      items.forEach(item => {
        const itemAmount = Number(item.amount) || 0;
        totalTaxable += itemAmount;
        const effectiveGstRate = ledgerGstRate !== null ? ledgerGstRate : item.gstRate;
        
        if (itemAmount > 0 && effectiveGstRate) {
          const tax = calculateGST(itemAmount, effectiveGstRate, intra);
          if (!groupedTaxes[effectiveGstRate]) {
            groupedTaxes[effectiveGstRate] = { cgst: 0, sgst: 0, igst: 0 };
          }
          groupedTaxes[effectiveGstRate].cgst += tax.cgstAmount;
          groupedTaxes[effectiveGstRate].sgst += tax.sgstAmount;
          groupedTaxes[effectiveGstRate].igst += tax.igstAmount;

          totalCGST += tax.cgstAmount;
          totalSGST += tax.sgstAmount;
          totalIGST += tax.igstAmount;
        }
      });

      const taxSum = totalCGST + totalSGST + totalIGST;
      setTaxTotals({ cgst: totalCGST, sgst: totalSGST, igst: totalIGST, totalTax: taxSum, grouped: groupedTaxes });
      setGrandTotal(totalTaxable + taxSum);
    };

    calculateTotals();
  }, [formData.partyId, formData.purchaseLedgerId, items, ledgers, activeCompany]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.partyId || !formData.purchaseLedgerId) {
      return Swal.fire('Error', 'Please select Supplier and Purchase Ledger', 'error');
    }

    const purchaseLedger = ledgers.find(l => l.id == formData.purchaseLedgerId);
    let ledgerGstRate = null;
    if (purchaseLedger) {
      const match = purchaseLedger.name.match(/(\d+)%/);
      if (match) {
        ledgerGstRate = parseInt(match[1], 10);
      }
    }

    const validItems = items.filter(i => i.stockItemId && i.amount > 0).map(i => ({
      ...i,
      gstRate: ledgerGstRate !== null ? ledgerGstRate : i.gstRate
    }));

    if (validItems.length === 0) {
      return Swal.fire('Error', 'Please add at least one item', 'error');
    }

    const totalTaxable = validItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const taxDetails = { ...taxTotals };

    const entries = generatePurchaseEntries(
      formData.partyId, 
      formData.purchaseLedgerId, 
      totalTaxable, 
      taxDetails
    );

    // Add Input Taxes grouped by percentage
    Object.entries(taxDetails.grouped || {}).forEach(([rate, taxes]) => {
      const halfRate = rate / 2;
      if (taxes.cgst > 0) {
        let lName = `input cgst ${halfRate}%`;
        let cgstLedger = ledgers.find(l => l.name.toLowerCase() === lName) || ledgers.find(l => l.name.toLowerCase().includes('input cgst'));
        if (cgstLedger) entries.push({ ledgerId: cgstLedger.id, debitAmount: taxes.cgst, creditAmount: 0 });
      }
      if (taxes.sgst > 0) {
        let lName = `input sgst ${halfRate}%`;
        let sgstLedger = ledgers.find(l => l.name.toLowerCase() === lName) || ledgers.find(l => l.name.toLowerCase().includes('input sgst'));
        if (sgstLedger) entries.push({ ledgerId: sgstLedger.id, debitAmount: taxes.sgst, creditAmount: 0 });
      }
      if (taxes.igst > 0) {
        let lName = `input igst ${rate}%`;
        let igstLedger = ledgers.find(l => l.name.toLowerCase() === lName) || ledgers.find(l => l.name.toLowerCase().includes('input igst'));
        if (igstLedger) entries.push({ ledgerId: igstLedger.id, debitAmount: taxes.igst, creditAmount: 0 });
      }
    });

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber, 
      referenceNumber: formData.supplierInvoiceNo,
      referenceDate: formData.supplierDate,
      narration: formData.narration,
      totalAmount: grandTotal,
      placeOfSupply: partyDetails.placeOfSupply,
      eWayBillNo: receiptDetails.receiptNote || '',
      eWayBillDate: receiptDetails.date || '',
      transporterName: receiptDetails.carrierName || '',
      transporterGstin: '',
      vehicleNumber: receiptDetails.motorVehicleNo || '',
      transportMode: 'Road',
      dispatchDetails: receiptDetails,
      partyDetails: partyDetails,
      entries,
      inventoryEntries: validItems
    };

    try {
      if (isEditMode) {
        await voucherAPI.update(editVoucherId, payload);
      } else {
        await voucherAPI.create(payload);
      }
      
      Swal.fire({ icon: 'success', title: 'Saved', text: `Purchase Voucher ${formData.voucherNumber} ${isEditMode ? 'updated' : 'created'}!`, timer: 1500, showConfirmButton: false });
      
      if (isEditMode) {
        navigate('/reports/account-book/purchase-module');
        return;
      }
      
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

  if (showPreview) {
    return (
      <InvoicePreview 
        formData={{ ...formData, partyName: partyDetails.supplierName }}
        dispatchDetails={receiptDetails}
        partyDetails={partyDetails}
        items={items}
        taxTotals={taxTotals}
        grandTotal={grandTotal}
        activeCompany={activeCompany}
        isViewMode={isViewMode}
        isDownloadMode={false}
        onConfirm={isViewMode ? () => window.print() : null}
        onCancel={() => {
          setShowPreview(false);
          if (isViewMode) {
             navigate('/reports/account-book/purchase-module');
          }
        }}
      />
    );
  }

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2">

      {/* Receipt Details Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center z-50 modal-open">
          <div 
            className="bg-white border border-tally-border p-4 shadow-xl w-[600px] navigable-container" 
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowReceiptModal(false);
                setTimeout(() => document.getElementById('purchaseLedgerId')?.focus(), 10);
              } else if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                setShowReceiptModal(false);
                setShowPartyModal(true);
              } else {
                handleEnterToNextField(e);
              }
            }}
          >
            <div className="font-bold text-center text-tally-blue mb-4 underline">Receipt Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between"><span>Receipt Note No(s):</span> <input autoFocus name="receiptNote" value={receiptDetails.receiptNote} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Receipt Doc No.:</span> <input name="receiptDocNo" value={receiptDetails.receiptDocNo} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Dispatched through:</span> <input name="dispatchedThrough" value={receiptDetails.dispatchedThrough} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Destination:</span> <input name="destination" value={receiptDetails.destination} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Carrier Name/Agent:</span> <input name="carrierName" value={receiptDetails.carrierName} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Bill of Lading/LR-RR No.:</span> <input name="billOfLading" value={receiptDetails.billOfLading} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Motor Vehicle No.:</span> <input name="motorVehicleNo" value={receiptDetails.motorVehicleNo} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Date:</span> <input type="date" name="date" value={receiptDetails.date} onChange={handleReceiptChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
            </div>
            <div className="text-right mt-4">
              <button onClick={() => { setShowReceiptModal(false); setShowPartyModal(true); }} className="bg-tally-blue text-white px-4 py-1 text-sm font-bold">Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Party Details Modal */}
      {showPartyModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center z-50 modal-open">
          <div 
            className="bg-white border border-tally-border p-4 shadow-xl w-[500px] navigable-container" 
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowPartyModal(false);
                setShowReceiptModal(true);
              } else if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                setShowPartyModal(false);
                setTimeout(() => document.getElementById('purchaseLedgerId')?.focus(), 10);
              } else {
                handleEnterToNextField(e);
              }
            }}
          >
            <div className="font-bold text-center text-tally-blue mb-4 underline">Party Details</div>
            <div className="grid grid-cols-1 gap-y-2 text-sm">
              <div className="flex items-center"><span className="w-40">Supplier (Bill from):</span> <input autoFocus name="supplierName" value={partyDetails.supplierName} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1 font-bold" /></div>
              <div className="flex items-center"><span className="w-40">Mailing Name:</span> <input name="mailingName" value={partyDetails.mailingName} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1" /></div>
              <div className="flex items-center"><span className="w-40">Address:</span> <textarea name="address" value={partyDetails.address} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1 resize-none" rows="2" /></div>
              <div className="flex items-center"><span className="w-40">State:</span> <input name="state" value={partyDetails.state} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1" /></div>
              <div className="flex items-center"><span className="w-40">Country:</span> <input name="country" value={partyDetails.country} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1" /></div>
              <div className="flex items-center"><span className="w-40">GST Registration type:</span> <input name="gstType" value={partyDetails.gstType} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1" /></div>
              <div className="flex items-center"><span className="w-40">GSTIN/UIN:</span> <input name="gstin" value={partyDetails.gstin} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1" /></div>
              <div className="flex items-center"><span className="w-40">Place of Supply:</span> <input name="placeOfSupply" value={partyDetails.placeOfSupply} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1" /></div>
            </div>
            <div className="text-right mt-4">
              <button type="button" onClick={() => {
                setShowPartyModal(false);
                setTimeout(() => document.getElementById('purchaseLedgerId')?.focus(), 10);
              }} className="bg-tally-blue text-white px-4 py-1 text-sm font-bold">Accept</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-bold text-xl text-tally-blue">Purchase</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-tally-blue">No.</span>
              <input 
                name="voucherNumber" value={formData.voucherNumber} onChange={handleFormChange}
                className="bg-transparent border border-transparent w-48 px-1 focus:bg-tally-yellow focus:outline-none text-left font-bold"
                autoFocus
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-bold text-tally-blue">{new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="text-sm text-gray-600 italic">{new Date(formData.date).toLocaleDateString('en-GB', { weekday: 'long' })}</div>
            <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="bg-transparent border border-transparent focus:bg-tally-yellow focus:outline-none text-sm px-1 cursor-pointer" />
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
            <TallySelect 
              name="partyId" 
              value={formData.partyId} 
              onChange={handleFormChange} 
              options={creditors}
              createOption={{ label: "Create New Party..." }}
              placeholder="Select Supplier..."
              className="w-64 border border-tally-border px-1 py-0.5 font-bold"
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-tally-blue">Purchase Ledger</label>
            <span className="mx-2">:</span>
            <TallySelect 
              name="purchaseLedgerId" 
              id="purchaseLedgerId"
              value={formData.purchaseLedgerId} 
              onChange={handleFormChange} 
              options={purchaseAccounts}
              createOption={{ label: "Create New Ledger..." }}
              placeholder="Select Purchase Ledger..."
              className="w-64 border border-tally-border px-1 py-0.5"
            />
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
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2 text-center text-gray-500">{idx + 1}</td>
                  <td className="py-1 px-2">
                    <TallySelect 
                      name="stockItemId"
                      value={item.stockItemId} 
                      onChange={e => handleItemChange(idx, 'stockItemId', e.target.value)}
                      options={[{ id: 'END', name: 'End of List' }, ...stockItems]}
                      createOption={{ label: "Create New Item..." }}
                      placeholder="Select Item..."
                      className="w-full font-bold"
                    />
                  </td>
                  <td className="py-1 px-2">
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0" />
                  </td>
                  <td className="py-1 px-2">
                    <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0.00" />
                  </td>
                  <td className="py-1 px-2 text-right font-bold">
                    {Number(item.amount) > 0 ? Number(item.amount).toFixed(2) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Tax summary in grid */}
          {taxTotals.grouped && Object.keys(taxTotals.grouped).length > 0 && (
            <div className="border-t border-tally-border mt-4">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(taxTotals.grouped).flatMap(([rate, taxes]) => {
                    const rows = [];
                    if (taxes.cgst > 0) rows.push(
                        <tr key={`cgst-${rate}`}>
                          <td className="py-1 px-8 text-right font-bold text-gray-600">Input CGST @ {rate / 2}%</td>
                          <td className="py-1 px-12 text-right w-32">{taxes.cgst.toFixed(2)}</td>
                        </tr>
                    );
                    if (taxes.sgst > 0) rows.push(
                        <tr key={`sgst-${rate}`}>
                          <td className="py-1 px-8 text-right font-bold text-gray-600">Input SGST @ {rate / 2}%</td>
                          <td className="py-1 px-12 text-right w-32">{taxes.sgst.toFixed(2)}</td>
                        </tr>
                    );
                    if (taxes.igst > 0) rows.push(
                        <tr key={`igst-${rate}`}>
                          <td className="py-1 px-8 text-right font-bold text-gray-600">Input IGST @ {rate}%</td>
                          <td className="py-1 px-12 text-right w-32">{taxes.igst.toFixed(2)}</td>
                        </tr>
                    );
                    return rows;
                  })}
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
              name="narration" id="narration" value={formData.narration} onChange={handleFormChange} rows="2"
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
           <button id="purchase-submit-btn" type="submit" className="bg-tally-blue text-white px-6 py-1 text-sm font-bold shadow hover:bg-opacity-90">
            Accept (Ctrl+A)
          </button>
        </div>

      </form>
    </div>
  );
}
