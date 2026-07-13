import { formatDateStr , getLocalISODate } from '../../utils/dateUtils';
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

export default function DebitNoteVoucher() {
  const navigate = useNavigate();
  const location = useLocation();
  const editVoucherId = location.state?.editVoucherId;
  const viewVoucherId = location.state?.viewVoucherId;
  
  const activeVoucherId = editVoucherId || viewVoucherId;
  const isEditMode = !!editVoucherId;
  const isViewMode = !!viewVoucherId;

  const { setPageTitle, selectedCompany } = useStore();
  const activeCompany = selectedCompany;
  
  const restoredState = location.state?.voucherState;

  const [ledgers, setLedgers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  
  const [formData, setFormData] = useState(restoredState?.formData || {
    voucherTypeId: '',
    date: getLocalISODate(),
    voucherNumber: '',
    supplierInvoiceNo: '',
    supplierDate: getLocalISODate(),
    partyId: '',
    purchaseLedgerId: '',
    narration: '',
  });

  const [items, setItems] = useState(restoredState?.items || [
    { stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, gstRate: 0, unitSymbol: '' }
  ]);

  const [taxItems, setTaxItems] = useState(restoredState?.taxItems || [
    { ledgerId: '', ledgerName: '', amount: 0 }
  ]);
  const [units, setUnits] = useState([]);

  const [taxTotals, setTaxTotals] = useState({ cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
  const [grandTotal, setGrandTotal] = useState(0);

  const [receiptDetails, setReceiptDetails] = useState(restoredState?.receiptDetails || {
    receiptNote: '', receiptDocNo: '', dispatchedThrough: '', destination: '',
    carrierName: '', billOfLading: '', date: getLocalISODate(),
    motorVehicleNo: ''
  });

  const [partyDetails, setPartyDetails] = useState(restoredState?.partyDetails || {
    supplierName: '', mailingName: '', address: '', state: '', country: 'India', gstType: '', gstin: '', placeOfSupply: ''
  });

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setPageTitle('Accounting Voucher Creation');
    
    async function fetchData() {
      try {
        const [ledgersRes, itemsRes, unitsRes, vTypesRes, vouchersRes] = await Promise.all([
          api.get('/ledgers'),
          api.get('/stockitems'),
          api.get('/units'),
          voucherAPI.getTypes(),
          api.get('/vouchers')
        ]);
        
        setLedgers(ledgersRes.data);
        setStockItems(itemsRes.data);
        setUnits(unitsRes.data);
        
        const type = vTypesRes.data.find(v => v.name === 'Debit Note');
        if (type) {
          if (restoredState) {
            // State is already restored from navigation, no need to overwrite
          } else if (activeVoucherId) {
            const v = vouchersRes.data.find(vo => String(vo.id) === String(activeVoucherId));
            if (v) {
              setFormData({
                voucherTypeId: v.voucherTypeId,
                date: v.date.split('T')[0],
                voucherNumber: v.voucherNumber,
                supplierInvoiceNo: v.referenceNumber || '',
                supplierDate: v.referenceDate ? v.referenceDate.split('T')[0] : getLocalISODate(),
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
  }, [setPageTitle, activeVoucherId, isViewMode, restoredState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.querySelector('.modal-open')) return;

      if (e.key === 'Escape') {
        const activeDropdown = document.querySelector('ul.absolute.z-100');
        if (activeDropdown) return;

        e.preventDefault();
        if (isViewMode || location.state?.editVoucherId) {
          navigate('/reports/account-book/debit-note');
        } else if (location.state?.returnTo) {
          navigate(location.state.returnTo);
        } else {
          navigate(-1);
        }
        return;
      }

      // Ctrl+A to save the main form (only if modals are closed)
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
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
  }, [isViewMode, showPreview, navigate, location.state]);

  const creditors = ledgers; 
  const purchaseAccounts = ledgers; 

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (value === 'CREATE') {
      navigate('/masters/ledger/create', { 
        state: { 
          returnTo: location.pathname, 
          voucherState: { formData, items, receiptDetails, partyDetails } 
        } 
      });
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
        navigate('/inventory/item/create', { 
          state: { 
            returnTo: location.pathname, 
            voucherState: { formData, items, receiptDetails, partyDetails } 
          } 
        });
        return;
      }
      const item = stockItems.find(i => i.id == value);
      if (item) {
        newItems[index].gstRate = item.gstRate || 0;
        newItems[index].itemName = item.name || '';
        newItems[index].description = item.description || '';
        newItems[index].hsnSac = item.hsnSac || '';
        const unit = units.find(u => u.id == item.unitId);
        newItems[index].unitSymbol = unit ? unit.symbol : '';
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

    // Auto-add new row if the last row's item is selected
    if (index === newItems.length - 1 && field === 'stockItemId' && value) {
      newItems.push({ stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, gstRate: 0, unitSymbol: '' });
    }

    setItems(newItems);
  };

  const handleTaxItemChange = (index, field, value) => {
    const newTaxes = [...taxItems];

    if (field === 'ledgerId') {
      if (value === 'END') {
        setTimeout(() => document.getElementById('narration')?.focus(), 10);
        return;
      }
      if (value === 'CREATE') {
        navigate('/masters/ledger/create', {
          state: {
            returnTo: location.pathname,
            voucherState: { formData, items, taxItems, receiptDetails, partyDetails },
            focusField: `tax-ledger-${index}`
          }
        });
        return;
      }
      newTaxes[index][field] = value;
      const ledger = ledgers.find(l => l.id == value);
      if (ledger) {
        newTaxes[index].ledgerName = ledger.name;
        const name = ledger.name.toLowerCase();
        if (name.includes('cgst') && taxTotals.cgst > 0) newTaxes[index].amount = taxTotals.cgst;
        if (name.includes('sgst') && taxTotals.sgst > 0) newTaxes[index].amount = taxTotals.sgst;
        if (name.includes('igst') && taxTotals.igst > 0) newTaxes[index].amount = taxTotals.igst;
      }
    } else {
      newTaxes[index][field] = value;
    }

    if (index === newTaxes.length - 1 && field === 'ledgerId' && value) {
      newTaxes.push({ ledgerId: '', ledgerName: '', amount: 0 });
    }

    setTaxItems(newTaxes);
  };

  useEffect(() => {
    const taxByRate = {};
    let totalTax = 0;
    let totalTaxable = 0;

    const companyState = activeCompany ? activeCompany.state : '';
    const partyState = partyDetails.placeOfSupply || partyDetails.state || '';
    const intra = isIntraState(companyState, partyState);

    const purchaseLedger = ledgers.find(l => l.id == formData.purchaseLedgerId);
    let ledgerGstRate = null;
    if (purchaseLedger) {
      const match = purchaseLedger.name.match(/(\d+)%/);
      if (match) ledgerGstRate = parseInt(match[1], 10);
    }

    items.forEach(item => {
      if (item.stockItemId && item.stockItemId !== 'END') {
        const itemAmount = Number(item.amount) || 0;
        totalTaxable += itemAmount;
        const effectiveGstRate = ledgerGstRate !== null ? ledgerGstRate : item.gstRate;
        const rate = Number(effectiveGstRate) || 18;
        
        if (itemAmount > 0) {
           const tax = calculateGST(itemAmount, rate, intra);
           if (!taxByRate[rate]) {
             taxByRate[rate] = { cgst: 0, sgst: 0, igst: 0 };
           }
           taxByRate[rate].cgst += tax.cgstAmount;
           taxByRate[rate].sgst += tax.sgstAmount;
           taxByRate[rate].igst += tax.igstAmount;
           totalTax += tax.cgstAmount + tax.sgstAmount + tax.igstAmount;
        }
      }
    });

    setTimeout(() => {
      setGrandTotal(totalTaxable + totalTax);
      setTaxTotals({ totalTax });

      setTaxItems(prev => {
        let changed = false;
        let newTaxes = [...prev];

        const getLedger = (keyword, targetRate) => {
          const matches = ledgers.filter(l => l.name.toLowerCase().includes(keyword));
          const inputMatches = matches.filter(l => l.name.toLowerCase().includes('input'));
          const genericMatches = matches.filter(l => !l.name.toLowerCase().includes('input') && !l.name.toLowerCase().includes('output'));
          const preferredPool = inputMatches.length > 0 ? inputMatches : (genericMatches.length > 0 ? genericMatches : matches);

          if (targetRate) {
             const rateStr = String(targetRate);
             const rateMatch = preferredPool.find(l => l.name.includes(`${rateStr}%`) || l.name.includes(`@${rateStr}`) || l.name.includes(` ${rateStr} `));
             if (rateMatch) return rateMatch;
          }
          return preferredPool[0] || matches[0];
        };

        const upsertTax = (ledger, amount, rate) => {
          if (!ledger) return;
          const existingIdx = newTaxes.findIndex(t => String(t.ledgerId) === String(ledger.id));
          if (existingIdx >= 0) {
            if (Number(newTaxes[existingIdx].amount) !== Number(amount) || newTaxes[existingIdx].rate !== rate) {
              newTaxes[existingIdx] = { ...newTaxes[existingIdx], amount, rate };
              changed = true;
            }
          } else {
            const newRow = { ledgerId: ledger.id, ledgerName: ledger.name, amount, rate };
            const endIdx = newTaxes.findIndex(t => !t.ledgerId || t.ledgerId === 'END');
            if (endIdx >= 0) {
              newTaxes.splice(endIdx, 0, newRow);
            } else {
              newTaxes.push(newRow);
            }
            changed = true;
          }
        };

        const upsertedLedgerIds = new Set();
        
        Object.keys(taxByRate).forEach(rateStr => {
           const rate = Number(rateStr);
           const taxes = taxByRate[rate];
           
           if (taxes.cgst > 0) {
              const l = getLedger('cgst', rate / 2);
              if (l) { upsertTax(l, taxes.cgst.toFixed(2), String(rate / 2)); upsertedLedgerIds.add(String(l.id)); }
           }
           if (taxes.sgst > 0) {
              const l = getLedger('sgst', rate / 2);
              if (l) { upsertTax(l, taxes.sgst.toFixed(2), String(rate / 2)); upsertedLedgerIds.add(String(l.id)); }
           }
           if (taxes.igst > 0) {
              const l = getLedger('igst', rate);
              if (l) { upsertTax(l, taxes.igst.toFixed(2), String(rate)); upsertedLedgerIds.add(String(l.id)); }
           }
        });

        for (let i = newTaxes.length - 1; i >= 0; i--) {
           const t = newTaxes[i];
           if (t.ledgerId && t.ledgerId !== 'END' && !upsertedLedgerIds.has(String(t.ledgerId))) {
              const nameLower = (t.ledgerName || '').toLowerCase();
              if (nameLower.includes('cgst') || nameLower.includes('sgst') || nameLower.includes('igst')) {
                 newTaxes.splice(i, 1);
                 changed = true;
              }
           }
        }

        if (newTaxes.length === 0 || (newTaxes[newTaxes.length - 1].ledgerId && newTaxes[newTaxes.length - 1].ledgerId !== 'END')) {
          newTaxes.push({ ledgerId: '', ledgerName: '', rate: '', amount: '' });
          changed = true;
        }

        return changed ? newTaxes : prev;
      });
    }, 0);

  }, [formData.purchaseLedgerId, items, ledgers, activeCompany, partyDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierInvoiceNo) {
      return Swal.fire('Error', 'Please enter Supplier Invoice No.', 'error');
    }
    if (!formData.partyId) {
      return Swal.fire('Error', 'Please select Party A/c name', 'error');
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
      entries: entries.map(e => ({ ...e, ledgerId: e.ledgerId || null })),
      inventoryEntries: validItems
    };

    try {
      if (isEditMode) {
        await voucherAPI.update(editVoucherId, payload);
      } else {
        await voucherAPI.create(payload);
      }
      
      Swal.fire({ icon: 'success', title: 'Saved', text: `Debit Note ${formData.voucherNumber} ${isEditMode ? 'updated' : 'created'}!`, timer: 1500, showConfirmButton: false });
      
      if (isEditMode) {
        navigate('/reports/account-book/debit-note');
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
             navigate('/reports/account-book/debit-note');
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
                setTimeout(() => document.getElementById('purchaseLedgerId')?.focus(), 100);
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
                setTimeout(() => document.getElementById('purchaseLedgerId')?.focus(), 100);
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
                setTimeout(() => document.getElementById('purchaseLedgerId')?.focus(), 100);
              }} className="bg-tally-blue text-white px-4 py-1 text-sm font-bold">Accept</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-bold text-xl text-tally-blue">Debit Note</div>
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
            <div className="font-bold text-tally-blue">{formatDateStr(formData.date)}</div>
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
                <th className="py-1 px-2 text-left w-16">Unit</th>
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
                    {item.stockItemId && item.stockItemId !== 'END' ? (
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0" />
                    ) : null}
                  </td>
                  <td className="py-1 px-2">
                    {item.stockItemId && item.stockItemId !== 'END' ? (
                      <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0.00" />
                    ) : null}
                  </td>
                  <td className="py-1 px-2 text-left text-gray-600 text-xs">
                    {item.stockItemId && item.stockItemId !== 'END' ? item.unitSymbol : ''}
                  </td>
                  <td className="py-1 px-2 text-right font-bold">
                    {Number(item.amount) > 0 ? Number(item.amount).toFixed(2) : ''}
                  </td>
                </tr>
              ))}
              
              {/* ITEM SUBTOTAL */}
              {items.some(i => i.stockItemId && i.stockItemId !== 'END' && Number(i.amount) > 0) && (
                <tr className="border-t border-gray-200 bg-gray-50/50">
                  <td colSpan={5} className="py-1 px-2 text-right text-sm font-bold text-gray-600">Sub Total:</td>
                  <td className="py-1 px-2 text-right font-bold text-tally-blue">
                    {items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              
              <tr className="h-4"></tr>

              {/* TAX ITEMS GRID */}
              {taxItems.map((tax, idx) => (
                <tr key={`tax-${idx}`} className="hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2 text-center text-gray-500"></td>
                  <td className="py-1 px-2 italic font-bold pr-16" colSpan={4}>
                    <TallySelect 
                      name={`taxLedgerId-${idx}`}
                      id={`tax-ledger-${idx}`}
                      value={tax.ledgerId} 
                      onChange={e => handleTaxItemChange(idx, 'ledgerId', e.target.value)}
                      options={[{ id: 'END', name: 'End of List' }, ...ledgers]}
                      createOption={{ label: "Create New Ledger..." }}
                      placeholder=""
                      className="w-full text-right"
                    />
                  </td>
                  <td className="py-1 px-2 text-right font-bold">
                    {tax.ledgerId && tax.ledgerId !== 'END' ? (
                      <input type="number" value={tax.amount || ''} onChange={e => handleTaxItemChange(idx, 'amount', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0.00" />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
