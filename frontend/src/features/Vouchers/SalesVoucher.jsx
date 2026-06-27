import { formatDateStr , getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';
import { calculateGST, generateSalesEntries, isIntraState } from '../../utils/accountingLogic';
import InvoicePreview from './components/InvoicePreview';
import TallySelect from '../../components/common/TallySelect';

export default function SalesVoucher({ downloadVoucherId: propDownloadVoucherId, onDownloadComplete }) {
  const { setPageTitle, selectedCompany } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const editVoucherId = location.state?.editVoucherId;
  const viewVoucherId = location.state?.viewVoucherId;
  const downloadVoucherId = propDownloadVoucherId || location.state?.downloadVoucherId;
  
  const activeVoucherId = editVoucherId || viewVoucherId || downloadVoucherId;
  const isEditMode = !!editVoucherId;
  const isViewMode = !!viewVoucherId || !!downloadVoucherId;
  const isDownloadMode = !!downloadVoucherId;

  const activeCompany = selectedCompany; // Alias for InvoicePreview
  
  const [ledgers, setLedgers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [units, setUnits] = useState([]);
  
  const [formData, setFormData] = useState({
    voucherTypeId: '',
    date: getLocalISODate(),
    voucherNumber: '',
    partyId: '',
    partyName: '',
    salesLedgerId: '',
    narration: '',
  });

  const [items, setItems] = useState([
    { stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, gstRate: 0, unitSymbol: '' }
  ]);

  const [taxItems, setTaxItems] = useState([
    { ledgerId: '', ledgerName: '', amount: 0 }
  ]);

  const [dispatchDetails, setDispatchDetails] = useState({
    deliveryNote: '', dispatchDocNo: '', dispatchedThrough: '', destination: '',
    carrierName: '', billOfLading: '', motorVehicleNo: '', date: getLocalISODate(),
    modeOfPayment: '30 DAYS', otherReferences: '', buyersOrderNo: '', buyersOrderDate: '', termsOfDelivery: ''
  });

  const [partyDetails, setPartyDetails] = useState({
    buyerName: '', mailingName: '', address: '', state: '', country: 'India', gstType: '', gstin: '', placeOfSupply: ''
  });

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [taxTotals, setTaxTotals] = useState({ cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    setPageTitle('Accounting Voucher Creation');
    
    const fetchData = async () => {
      try {
        const [ledgersRes, itemsRes, unitsRes, vouchersRes, groupsRes] = await Promise.all([
          api.get('/ledgers'),
          api.get('/stockitems'),
          api.get('/units'),
          voucherAPI.getAll(),
          api.get('/account-groups').catch(() => ({ data: [] }))
        ]);
        
        const groups = groupsRes.data || [];
        const enrichedLedgers = ledgersRes.data.map(l => {
          const group = groups.find(g => g.id === l.groupId);
          return { ...l, parentGroup: group ? group.name : '' };
        });

        setLedgers(enrichedLedgers);
        setStockItems(itemsRes.data);
        setUnits(unitsRes.data);

        // Fetch voucher types to find Sales
        const typesRes = await voucherAPI.getTypes();
        const salesType = typesRes.data.find(t => t.name === 'Sales');

        if (salesType) {
          if (activeVoucherId) {
            const v = vouchersRes.data.find(v => String(v.id) === String(activeVoucherId));
            if (v) {
              setFormData({
                voucherTypeId: v.voucherTypeId,
                date: v.date.split('T')[0],
                voucherNumber: v.voucherNumber,
                narration: v.narration || '',
                partyId: v.entries?.[0]?.ledgerId || '',
                partyName: '', // Will be set from ledger
                salesLedgerId: v.entries?.[1]?.ledgerId || ''
              });

              if (v.entries?.[0]?.ledgerId) {
                const party = ledgersRes.data.find(l => l.id === v.entries[0].ledgerId);
                if (party) {
                  setFormData(prev => ({ ...prev, partyName: party.name }));
                  const defaultParty = {
                    buyerName: party.name,
                    mailingName: party.alias || party.name,
                    address: party.address || '',
                    state: party.state || '',
                    country: party.country || 'India',
                    gstType: party.registrationType || '',
                    gstin: party.gstin || '',
                    placeOfSupply: party.state || ''
                  };
                  let savedPartyDetails = {};
                  if (v.partyDetails) {
                    try {
                      savedPartyDetails = typeof v.partyDetails === 'string' ? JSON.parse(v.partyDetails) : v.partyDetails;
                    } catch(e) {}
                  }
                  setPartyDetails({ ...defaultParty, ...savedPartyDetails });
                }
              }

              if (v.dispatchDetails) {
                try {
                  const parsedDispatch = typeof v.dispatchDetails === 'string' ? JSON.parse(v.dispatchDetails) : v.dispatchDetails;
                  setDispatchDetails(prev => ({ ...prev, ...parsedDispatch }));
                } catch (e) {
                  console.error('Failed to parse dispatch details', e);
                }
              }

              if (v.inventoryEntries && v.inventoryEntries.length > 0) {
                setItems(v.inventoryEntries.map(i => ({
                  stockItemId: i.stockItemId,
                  itemName: itemsRes.data.find(it => it.id === i.stockItemId)?.name || '',
                  quantity: i.quantity,
                  rate: i.rate,
                  amount: i.amount,
                  gstRate: itemsRes.data.find(it => it.id === i.stockItemId)?.gstRate || 0,
                  unitSymbol: '' // simplified
                })));
              }

              const taxes = v.entries?.slice(2) || [];
              if (taxes.length > 0) {
                setTaxItems(taxes.map(t => ({
                  ledgerId: t.ledgerId,
                  ledgerName: ledgersRes.data.find(l => l.id === t.ledgerId)?.name || '',
                  amount: t.creditAmount
                })));
              }
              if (isViewMode || isDownloadMode) {
                 setShowPreview(true);
              }
            }
          } else {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
            const endYear = String(startYear + 1).slice(-2);
            const financialYear = `${startYear}-${endYear}`;

            const salesCount = vouchersRes.data.filter(v => v.voucherTypeId === salesType.id).length;
            const nextNum = String(salesCount + 1).padStart(5, '0');
            const generatedVoucherNumber = `SSSI/${financialYear}/${nextNum}`;
            
            setFormData(prev => ({ ...prev, voucherTypeId: salesType.id, voucherNumber: generatedVoucherNumber }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }

    fetchData();
  }, [setPageTitle, activeVoucherId, isViewMode, isDownloadMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDispatchModal || showPartyModal) return;

      // Ctrl+A to save/preview
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setShowPreview(true);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        const dateInput = document.querySelector('input[name="date"]');
        if (dateInput) {
          dateInput.focus();
          try { dateInput.showPicker(); } catch { /* ignore */ }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDispatchModal, showPartyModal]);

  const debtors = ledgers.filter(l => {
    const p = l.parentGroup?.toLowerCase() || '';
    return p.includes('debtor') || p.includes('cash') || p.includes('bank');
  });

  const salesAccounts = ledgers.filter(l => {
    const p = l.parentGroup?.toLowerCase() || '';
    return p.includes('sales');
  });

  const taxAccounts = ledgers.filter(l => {
    const p = l.parentGroup?.toLowerCase() || '';
    const exclude = ['bank', 'cash', 'debtor', 'creditor', 'sales', 'purchase', 'stock'];
    return !exclude.some(ex => p.includes(ex));
  });

  // ----- HANDLERS -----

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (value === 'CREATE') {
      window.open('/masters/ledger/create', '_blank');
      return;
    }
    
    setFormData({ ...formData, [name]: value });

    if (name === 'partyId' && value) {
      const party = ledgers.find(l => l.id == value);
      if (party) {
        setFormData(prev => ({ ...prev, partyName: party.name }));
        setPartyDetails({
          buyerName: party.name,
          mailingName: party.alias || party.name,
          address: party.address || '',
          state: party.state || '',
          country: party.country || 'India',
          gstType: party.registrationType || '',
          gstin: party.gstin || '',
          placeOfSupply: party.state || ''
        });
        setShowDispatchModal(true);
      }
    }
  };

  const handleDispatchChange = (e) => {
    setDispatchDetails({ ...dispatchDetails, [e.target.name]: e.target.value });
  };

  const handlePartyDetailsChange = (e) => {
    setPartyDetails({ ...partyDetails, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'stockItemId') {
      if (value === 'END') {
        // Focus the first tax ledger, or narration if no tax ledgers
        const firstTax = document.getElementById('tax-ledger-0');
        if (firstTax) {
          firstTax.focus();
        } else {
          document.getElementById('narration')?.focus();
        }
        return;
      }
      if (value === 'CREATE') {
        window.open('/inventory/item/create', '_blank');
        return;
      }
      const item = stockItems.find(i => i.id == value);
      if (item) {
        newItems[index].itemName = item.name;
        newItems[index].hsnSac = item.hsnSac || '';
        newItems[index].gstRate = item.gstRate || 0;
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
        window.open('/masters/ledger/create', '_blank');
        return;
      }
      newTaxes[index][field] = value;
      const ledger = ledgers.find(l => l.id == value);
      if (ledger) {
        newTaxes[index].ledgerName = ledger.name;
        // Auto-calculate tax based on ledger name heuristics (like Tally)
        const name = ledger.name.toLowerCase();
        if (name.includes('cgst') && taxTotals.cgst > 0) newTaxes[index].amount = taxTotals.cgst;
        if (name.includes('sgst') && taxTotals.sgst > 0) newTaxes[index].amount = taxTotals.sgst;
        if (name.includes('igst') && taxTotals.igst > 0) newTaxes[index].amount = taxTotals.igst;
      }
    } else {
      newTaxes[index][field] = value;
    }

    // Auto-add new row if the last row's ledger is selected
    if (index === newTaxes.length - 1 && field === 'ledgerId' && value) {
      newTaxes.push({ ledgerId: '', ledgerName: '', amount: 0 });
    }

    setTaxItems(newTaxes);
  };

  // Auto-calculate Tax Totals (Theoretical)
  useEffect(() => {
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const companyState = activeCompany ? activeCompany.state : '';
    const partyState = partyDetails.placeOfSupply || partyDetails.state || '';
    const intra = isIntraState(companyState, partyState);

    items.forEach(item => {
      if (item.stockItemId && item.stockItemId !== 'END') {
        const rate = Number(item.gstRate) || 18; // Default to 18% if missing
        const tax = calculateGST(item.amount, rate, intra);
        totalCGST += tax.cgstAmount;
        totalSGST += tax.sgstAmount;
        totalIGST += tax.igstAmount;
      }
    });

    const taxSum = totalCGST + totalSGST + totalIGST;
    
    setTimeout(() => {
      setTaxTotals({ cgst: totalCGST, sgst: totalSGST, igst: totalIGST, totalTax: taxSum });

      // Auto-update or add tax items for CGST/SGST/IGST
      setTaxItems(prev => {
        let changed = false;
        let newTaxes = [...prev];

        // Find appropriate ledgers for taxes, preferring "Output" for sales
        const getLedger = (keyword) => {
          const matches = ledgers.filter(l => l.name.toLowerCase().includes(keyword));
          const outputMatch = matches.find(l => l.name.toLowerCase().includes('output'));
          return outputMatch || matches.find(l => !l.name.toLowerCase().includes('input')) || matches[0];
        };

        const cgstLedger = getLedger('cgst');
        const sgstLedger = getLedger('sgst');
        const igstLedger = getLedger('igst');

        const upsertTax = (ledger, amount) => {
          if (!ledger) return;
          const existingIdx = newTaxes.findIndex(t => String(t.ledgerId) === String(ledger.id));
          if (existingIdx >= 0) {
            if (Number(newTaxes[existingIdx].amount) !== Number(amount)) {
              newTaxes[existingIdx] = { ...newTaxes[existingIdx], amount };
              changed = true;
            }
          } else {
            const newRow = { ledgerId: ledger.id, ledgerName: ledger.name, amount };
            const endIdx = newTaxes.findIndex(t => !t.ledgerId || t.ledgerId === 'END');
            if (endIdx >= 0) {
              newTaxes.splice(endIdx, 0, newRow);
            } else {
              newTaxes.push(newRow);
            }
            changed = true;
          }
        };

        const removeTax = (ledger) => {
          if (!ledger) return;
          const existingIdx = newTaxes.findIndex(t => String(t.ledgerId) === String(ledger.id));
          if (existingIdx >= 0) {
            newTaxes.splice(existingIdx, 1);
            changed = true;
          }
        };

        if (totalCGST > 0) upsertTax(cgstLedger, totalCGST.toFixed(2)); else removeTax(cgstLedger);
        if (totalSGST > 0) upsertTax(sgstLedger, totalSGST.toFixed(2)); else removeTax(sgstLedger);
        if (totalIGST > 0) upsertTax(igstLedger, totalIGST.toFixed(2)); else removeTax(igstLedger);

        if (newTaxes.length === 0 || (newTaxes[newTaxes.length - 1].ledgerId && newTaxes[newTaxes.length - 1].ledgerId !== 'END')) {
          newTaxes.push({ ledgerId: '', ledgerName: '', amount: '' });
          changed = true;
        }

        return changed ? newTaxes : prev;
      });
    }, 0);

  }, [items, partyDetails, activeCompany, ledgers]);

  useEffect(() => {
    let totalTaxable = 0;
    items.forEach(item => {
      if (item.stockItemId && item.stockItemId !== 'END') {
        totalTaxable += Number(item.amount) || 0;
      }
    });
    let userTaxSum = 0;
    taxItems.forEach(t => {
      if (t.ledgerId && t.ledgerId !== 'END') {
         userTaxSum += Number(t.amount) || 0;
      }
    });
    setTimeout(() => {
      setGrandTotal(totalTaxable + userTaxSum);
    }, 0);
  }, [items, taxItems]);

  // ----- SUBMIT -----

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.partyId || !formData.salesLedgerId) {
      return Swal.fire('Error', 'Please select Party and Sales Ledger', 'error');
    }
    const validItems = items.filter(i => i.stockItemId && i.amount > 0);
    if (validItems.length === 0) {
      return Swal.fire('Error', 'Please add at least one item', 'error');
    }
    // Open preview
    setShowPreview(true);
  };

  const handleConfirmSave = async () => {
    // Show SweetAlert confirmation
    const result = await Swal.fire({
      title: 'Confirm Create Sales Voucher?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, create it!'
    });

    if (result.isConfirmed) {
      saveAndPrintVoucher();
    }
  };

  const saveAndPrintVoucher = async () => {
    const validItems = items.filter(i => i.stockItemId && i.amount > 0);
    const validTaxes = taxItems.filter(t => t.ledgerId && t.amount > 0);
    const totalTaxable = validItems.reduce((sum, item) => sum + Number(item.amount), 0);
    
    // Generate base accounting entries
    const entries = generateSalesEntries(
      formData.partyId, 
      formData.salesLedgerId, 
      totalTaxable, 
      { totalTax: 0 } // We will manually add tax entries from taxItems
    );

    // Add tax ledgers to entries
    validTaxes.forEach(t => {
      entries.push({ ledgerId: t.ledgerId, debitAmount: 0, creditAmount: Number(t.amount) });
    });

    // Update grand total in the first entry (Party Debit) to reflect added taxes
    const totalAmount = totalTaxable + validTaxes.reduce((sum, t) => sum + Number(t.amount), 0);
    entries[0].debitAmount = totalAmount;

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber,
      narration: formData.narration,
      totalAmount: totalAmount,
      placeOfSupply: partyDetails.placeOfSupply,
      eWayBillNo: dispatchDetails.deliveryNote || '', // Or specific eWayBill input
      eWayBillDate: dispatchDetails.date || '',
      transporterName: dispatchDetails.carrierName || '',
      transporterGstin: '',
      vehicleNumber: dispatchDetails.motorVehicleNo || '',
      transportMode: 'Road',
      dispatchDetails: dispatchDetails,
      partyDetails: partyDetails,
      entries,
      inventoryEntries: validItems
    };

    try {
      if (isEditMode) {
        await voucherAPI.update(editVoucherId, payload);
      } else {
        await voucherAPI.create(payload);
        // We need the ID to generate e-Way/e-Invoice. Wait, voucherAPI.create returns voucherNumber usually, 
        // but let's assume it returns ID, or we fetch it. 
        // A better approach: backend should auto-generate these, but we are simulating frontend calls.
        // Actually, we can just show a success message since backend simulation expects voucherId.
      }
      
      setTimeout(() => {
        // TRIGGER PRINT (Wait for preview to render, or print current window)
        window.print();
        
        setTimeout(() => {
          Swal.fire({ icon: 'success', title: 'Saved & Printed', text: `Sales Voucher ${isEditMode ? 'updated' : 'created'}!`, timer: 1500, showConfirmButton: false });
        }, 500);
        
        if (isEditMode) {
          navigate('/reports/account-book/sales-module');
          return;
        }

        // Reset
        setShowPreview(false);
        setFormData(prev => {
          const parts = prev.voucherNumber.split('/');
          const currentNum = parseInt(parts.pop(), 10) || 0;
          const nextNumStr = String(currentNum + 1).padStart(5, '0');
          parts.push(nextNumStr);
          return { 
            ...prev, 
            partyId: '', partyName: '', salesLedgerId: '', narration: '',
            voucherNumber: parts.join('/')
          };
        });
        setItems([{ stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, gstRate: 0, unitSymbol: '' }]);
        setTaxItems([{ ledgerId: '', ledgerName: '', amount: 0 }]);
        setTaxTotals({ cgst: 0, sgst: 0, igst: 0, totalTax: 0 });
        setGrandTotal(0);
      }, 100);

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save voucher', 'error');
    }
  };

  // ----- RENDER -----

  if (showPreview) {
    return (
      <InvoicePreview 
        formData={formData}
        dispatchDetails={dispatchDetails}
        partyDetails={partyDetails}
        items={items}
        taxTotals={taxTotals}
        grandTotal={grandTotal}
        activeCompany={activeCompany}
        isViewMode={isViewMode}
        isDownloadMode={isDownloadMode}
        onConfirm={isViewMode ? () => window.print() : handleConfirmSave}
        onCancel={() => {
          setShowPreview(false);
          if (isDownloadMode) {
             if (onDownloadComplete) onDownloadComplete();
          } else if (isViewMode) {
             navigate('/reports/account-book/sales-module');
          }
        }}
      />
    );
  }

  if (isDownloadMode) {
    return <div className="hidden">Loading download...</div>;
  }

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2 relative">
      
      {/* Dispatch Details Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center z-50 modal-open">
          <div 
            className="bg-white border border-tally-border p-4 shadow-xl w-[600px] navigable-container" 
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setShowDispatchModal(false);
                setTimeout(() => document.getElementById('salesLedgerId')?.focus(), 10);
              } else if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                e.stopPropagation();
                setShowDispatchModal(false);
                setShowPartyModal(true);
              } else {
                handleEnterToNextField(e);
              }
            }}
          >
            <div className="font-bold text-center text-tally-blue mb-4 underline">Dispatch Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between"><span>Delivery Note No(s):</span> <input autoFocus name="deliveryNote" value={dispatchDetails.deliveryNote} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Date:</span> <input type="date" name="date" value={dispatchDetails.date} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Mode/Terms of Payment:</span> <input name="modeOfPayment" value={dispatchDetails.modeOfPayment} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Other References:</span> <input name="otherReferences" value={dispatchDetails.otherReferences} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Buyer's Order No.:</span> <input name="buyersOrderNo" value={dispatchDetails.buyersOrderNo} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Dated:</span> <input type="date" name="buyersOrderDate" value={dispatchDetails.buyersOrderDate} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>

              <div className="flex justify-between"><span>Dispatch Doc No.:</span> <input name="dispatchDocNo" value={dispatchDetails.dispatchDocNo} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Dispatched through:</span> <input name="dispatchedThrough" value={dispatchDetails.dispatchedThrough} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Destination:</span> <input name="destination" value={dispatchDetails.destination} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Carrier Name/Agent:</span> <input name="carrierName" value={dispatchDetails.carrierName} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="flex justify-between"><span>Bill of Lading/LR-RR No.:</span> <input name="billOfLading" value={dispatchDetails.billOfLading} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              <div className="flex justify-between"><span>Motor Vehicle No.:</span> <input name="motorVehicleNo" value={dispatchDetails.motorVehicleNo} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none w-32" /></div>
              
              <div className="col-span-2 flex items-start mt-1">
                 <span className="w-40">Terms of Delivery:</span> 
                 <textarea name="termsOfDelivery" value={dispatchDetails.termsOfDelivery} onChange={handleDispatchChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1 resize-none h-10" />
              </div>
            </div>
            <div className="text-right mt-4">
              <button onClick={() => { setShowDispatchModal(false); setShowPartyModal(true); }} className="bg-tally-blue text-white px-4 py-1 text-sm font-bold">Accept</button>
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
                e.stopPropagation();
                setShowPartyModal(false);
                setShowDispatchModal(true);
              } else if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                e.stopPropagation();
                setShowPartyModal(false);
                setTimeout(() => document.getElementById('salesLedgerId')?.focus(), 10);
              } else {
                handleEnterToNextField(e);
              }
            }}
          >
            <div className="font-bold text-center text-tally-blue mb-4 underline">Party Details</div>
            <div className="grid grid-cols-1 gap-y-2 text-sm">
              <div className="flex items-center"><span className="w-40">Buyer (Bill to):</span> <input autoFocus name="buyerName" value={partyDetails.buyerName} onChange={handlePartyDetailsChange} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none flex-1 font-bold" /></div>
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
                setTimeout(() => document.getElementById('salesLedgerId')?.focus(), 10);
              }} className="bg-tally-blue text-white px-4 py-1 text-sm font-bold">Accept</button>
            </div>
          </div>
        </div>
      )}

      <form id="voucherForm" onSubmit={handleFormSubmit} onKeyDown={handleEnterToNextField} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-bold text-xl text-tally-blue">Sales</div>
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

        {/* Party Details */}
        <div className="p-4 space-y-2 border-b border-gray-200">
          <div className="flex items-center">
            <label className="w-32 text-sm font-bold text-tally-blue">Party A/c name</label>
            <span className="mx-2">:</span>
            <TallySelect 
              name="partyId" 
              value={formData.partyId} 
              onChange={handleFormChange} 
              options={debtors}
              createOption={{ label: "Create New Party..." }}
              placeholder="Select Party..."
              className="w-64 border border-tally-border px-1 py-0.5 font-bold"
            />
            {formData.partyId && (
              <span className="ml-4 text-xs italic text-gray-600 font-bold">
                Cur Bal: {(() => {
                  const p = debtors.find(d => d.id == formData.partyId);
                  return p ? `${Number(p.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${p.balanceType || 'Dr'}` : '';
                })()}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-tally-blue">Sales Ledger</label>
            <span className="mx-2">:</span>
            <TallySelect 
              name="salesLedgerId" 
              value={formData.salesLedgerId} 
              onChange={handleFormChange} 
              options={salesAccounts}
              createOption={{ label: "Create New Ledger..." }}
              placeholder="Select Sales Ledger..."
              className="w-64 border border-tally-border px-1 py-0.5"
            />
            {formData.salesLedgerId && (
              <span className="ml-4 text-xs italic text-gray-600 font-bold">
                Cur Bal: {(() => {
                  const s = salesAccounts.find(d => d.id == formData.salesLedgerId);
                  return s ? `${Number(s.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${s.balanceType || 'Cr'}` : '';
                })()}
              </span>
            )}
          </div>
        </div>

        {/* Inventory & Tax Grid */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f0f6fa] border-y border-tally-border text-tally-blue">
                <th className="py-1 px-2 text-left w-10">Sl</th>
                <th className="py-1 px-2 text-left">Name of Item</th>
                <th className="py-1 px-2 text-left w-24">HSN/SAC</th>
                <th className="py-1 px-2 text-right w-24">Quantity</th>
                <th className="py-1 px-2 text-right w-24">Rate</th>
                <th className="py-1 px-2 text-center w-16">per</th>
                <th className="py-1 px-2 text-right w-48">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* ITEM ROWS */}
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2 text-center text-gray-500 align-top">{item.stockItemId && item.stockItemId !== 'END' ? idx + 1 : ''}</td>
                  <td className="py-1 px-2 flex flex-col">
                    <TallySelect 
                      name="stockItemId"
                      value={item.stockItemId} 
                      onChange={e => handleItemChange(idx, 'stockItemId', e.target.value)}
                      options={[{ id: 'END', name: 'End of List' }, ...stockItems]}
                      createOption={{ label: "Create New Item..." }}
                      placeholder="Select Item..."
                      className="w-full font-bold"
                    />
                    {item.stockItemId && item.stockItemId !== 'END' && (
                      <input 
                        type="text" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description..." className="mt-1 text-xs italic bg-transparent focus:bg-white focus:outline-none border-b border-gray-300 w-[80%]"
                      />
                    )}
                  </td>
                  <td className="py-1 px-2 align-top">
                    {item.stockItemId && item.stockItemId !== 'END' && <input type="text" value={item.hsnSac || ''} onChange={e => handleItemChange(idx, 'hsnSac', e.target.value)} className="w-full bg-transparent focus:bg-white focus:outline-none" placeholder="HSN/SAC" />}
                  </td>
                  <td className="py-1 px-2 align-top">
                    {item.stockItemId && item.stockItemId !== 'END' && <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0" />}
                  </td>
                  <td className="py-1 px-2 align-top">
                    {item.stockItemId && item.stockItemId !== 'END' && <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0.00" />}
                  </td>
                  <td className="py-1 px-2 text-center align-top text-gray-600">{item.stockItemId && item.stockItemId !== 'END' ? item.unitSymbol : ''}</td>
                  <td className="py-1 px-2 text-right font-bold align-top">
                    {item.stockItemId && item.stockItemId !== 'END' && <input type="number" value={item.amount || ''} onChange={e => handleItemChange(idx, 'amount', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none font-bold" placeholder="0.00" />}
                  </td>
                </tr>
              ))}

              {/* EMPTY DIVIDER */}
              <tr className="h-4"><td colSpan={7}></td></tr>

              {/* TAX LEDGER ROWS */}
              {taxItems.map((tax, idx) => (
                <tr key={`tax-${idx}`} className="hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2"></td>
                  <td className="py-1 px-2">
                    <TallySelect 
                      name={`tax-ledger-${idx}`}
                      value={tax.ledgerId} 
                      onChange={e => handleTaxItemChange(idx, 'ledgerId', e.target.value)}
                      options={[{ id: 'END', name: 'End of List' }, ...taxAccounts]}
                      createOption={{ label: "Create New Ledger..." }}
                      placeholder="Select Tax/Ledger..."
                      className="w-[80%] font-bold italic"
                    />
                  </td>
                  <td colSpan={4}></td>
                  <td className="py-1 px-2 text-right font-bold">
                    {tax.ledgerId && tax.ledgerId !== 'END' && <input type="number" value={tax.amount || ''} onChange={e => handleTaxItemChange(idx, 'amount', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none font-bold" placeholder="0.00" />}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
          
        </div>

        {/* Footer */}
        <div className="border-t border-tally-border bg-[#f0f6fa] p-4 flex gap-6">
          <div className="flex-1">
            <label className="text-xs text-tally-blue font-bold block mb-1">Narration:</label>
            <textarea 
              id="narration"
              name="narration" value={formData.narration} onChange={handleFormChange} rows="2"
              className="w-full border border-tally-border focus:bg-tally-yellow focus:outline-none px-2 py-1 text-sm resize-none"
            />
          </div>
          <div className="w-1/3 flex flex-col items-end justify-between">
            <div className="flex items-center w-full justify-end border-b-2 border-double border-gray-400 pb-2 mb-2">
              <span className="text-sm font-bold text-gray-700 mr-4">Total :</span>
              <span className="text-2xl font-bold text-tally-blue">
                ₹ {grandTotal.toFixed(2)}
              </span>
            </div>
            <button type="submit" className="bg-tally-blue text-white px-8 py-2 text-sm font-bold shadow hover:bg-opacity-90 transition-all">
              Preview & Print (Enter)
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
