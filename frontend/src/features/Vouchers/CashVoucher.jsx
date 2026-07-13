import { formatDateStr, getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../services/API';
import { voucherAPI } from '../../services/voucherAPI';
import { handleEnterToNextField } from '../../utils/formNavigation';
import { generateSalesEntries } from '../../utils/accountingLogic';
import InvoicePreview from './components/InvoicePreview';
import TallySelect from '../../components/common/TallySelect';

export default function CashVoucher({ downloadVoucherId: propDownloadVoucherId, onDownloadComplete }) {
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

  const activeCompany = selectedCompany; 

  const restoredState = location.state?.voucherState;

  const [ledgers, setLedgers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState(restoredState?.formData || {
    voucherTypeId: '',
    date: getLocalISODate(),
    voucherNumber: '',
    partyId: '',
    partyName: '',
    salesLedgerId: '',
    narration: '',
    invoiceType: 'Cash'
  });

  const [items, setItems] = useState(restoredState?.items || [
    { stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, unitSymbol: '' }
  ]);

  const [dispatchDetails, setDispatchDetails] = useState(restoredState?.dispatchDetails || {
    deliveryNote: '', dispatchDocNo: '', dispatchedThrough: '', destination: '',
    carrierName: '', billOfLading: '', motorVehicleNo: '', date: getLocalISODate(),
    modeOfPayment: 'Cash', otherReferences: '', buyersOrderNo: '', buyersOrderDate: '', termsOfDelivery: ''
  });

  const [partyDetails, setPartyDetails] = useState(restoredState?.partyDetails || {
    buyerName: 'Cash', mailingName: 'Cash', address: '', state: '', country: 'India', gstType: '', gstin: '', placeOfSupply: ''
  });

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    setPageTitle('Cash Voucher Creation');

    const fetchData = async () => {
      try {
        const [ledgersRes, itemsRes, unitsRes, vouchersRes, groupsRes] = await Promise.all([
          api.get('/ledgers').catch(() => ({ data: [] })),
          api.get('/stockitems').catch(() => ({ data: [] })),
          api.get('/units').catch(() => ({ data: [] })),
          voucherAPI.getAll().catch(() => ({ data: [] })),
          api.get('/account-groups').catch(() => ({ data: [] }))
        ]);

        const groups = groupsRes.data || [];
        const enrichedLedgers = (ledgersRes.data || []).map(l => {
          const group = groups.find(g => g.id === l.groupId);
          return { ...l, parentGroup: group ? group.name : '' };
        });

        setLedgers(enrichedLedgers);
        setStockItems(itemsRes.data || []);
        setUnits(unitsRes.data || []);

        const typesRes = await voucherAPI.getTypes().catch(() => ({ data: [] }));
        const salesType = (typesRes.data || []).find(t => t.name === 'Sales') || (typesRes.data || []).find(t => t.name === 'Receipt');

        if (salesType) {
          if (restoredState) {
            // State is already restored
          } else if (activeVoucherId) {
            const v = vouchersRes.data.find(v => String(v.id) === String(activeVoucherId));
            if (v) {
              setFormData({
                voucherTypeId: v.voucherTypeId,
                date: v.date.split('T')[0],
                voucherNumber: v.voucherNumber,
                narration: v.narration || '',
                partyId: v.entries?.[0]?.ledgerId || '',
                partyName: '',
                salesLedgerId: v.entries?.[1]?.ledgerId || '',
                invoiceType: v.invoiceType || 'Cash'
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
                    } catch (e) {
                      console.error('Failed to parse party details', e);
                    }
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
                  unitSymbol: '' 
                })));
              }

              if (isViewMode || isDownloadMode) {
                setShowPreview(true);
              }
            }
          } else {
            const allVouchers = vouchersRes.data || [];
            // Assuming Cash vouchers might be identified by having invoiceType === 'Cash' 
            // or just by finding numbers that are purely digits. 
            // We can just count how many vouchers have this voucherTypeId and invoiceType === 'Cash'
            const cashCount = allVouchers.filter(v => v.voucherTypeId === salesType.id && v.invoiceType === 'Cash').length;
            const nextNum = String(cashCount + 1).padStart(4, '0');
            const generatedVoucherNumber = nextNum;

            setFormData(prev => ({ ...prev, voucherTypeId: salesType.id, voucherNumber: generatedVoucherNumber }));
          }
        } else {
          const allVouchers = vouchersRes.data || [];
          const cashCount = allVouchers.filter(v => v.invoiceType === 'Cash').length;
          const nextNum = String(cashCount + 1).padStart(4, '0');
          setFormData(prev => ({ ...prev, voucherTypeId: 1, voucherNumber: nextNum }));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        setFormData(prev => ({ ...prev, voucherNumber: '0001' }));
      }
    };

    fetchData();
  }, [setPageTitle, activeVoucherId, isViewMode, isDownloadMode, restoredState]);

  useEffect(() => {
    if (location.state?.focusField) {
      setTimeout(() => {
        const fieldName = location.state.focusField;
        const el = document.getElementById(fieldName) || document.getElementsByName(fieldName)[0];
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      }, 100);
    }
  }, [location.state?.focusField]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDispatchModal || showPartyModal) return;

      if (e.key === 'Escape') {
        const activeDropdown = document.querySelector('ul.absolute.z-100');
        if (activeDropdown) return;

        e.preventDefault();
        navigate(-1);
        return;
      }

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
  }, [showDispatchModal, showPartyModal, navigate]);

  const debtors = ledgers.filter(l => {
    const p = l.parentGroup?.toLowerCase() || '';
    return p.includes('cash') || p.includes('bank');
  });
  const salesAccounts = ledgers.filter(l => {
    const p = l.parentGroup?.toLowerCase() || '';
    return p.includes('sales');
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (value === 'CREATE') {
      navigate('/masters/ledger/create', {
        state: {
          returnTo: location.pathname,
          voucherState: { formData, items, dispatchDetails, partyDetails },
          focusField: name
        }
      });
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
        document.getElementById('narration')?.focus();
        return;
      }
      if (value === 'CREATE') {
        navigate('/inventory/item/create', {
          state: {
            returnTo: location.pathname,
            voucherState: { formData, items, dispatchDetails, partyDetails },
            focusField: `stockItemId-${index}`
          }
        });
        return;
      }
      const item = stockItems.find(i => i.id == value);
      if (item) {
        newItems[index].itemName = item.name;
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

    if (index === newItems.length - 1 && field === 'stockItemId' && value) {
      newItems.push({ stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, unitSymbol: '' });
    }

    setItems(newItems);
  };

  useEffect(() => {
    let totalTaxable = 0;
    items.forEach(item => {
      if (item.stockItemId && item.stockItemId !== 'END') {
        totalTaxable += Number(item.amount) || 0;
      }
    });
    setTimeout(() => {
      setGrandTotal(totalTaxable);
    }, 0);
  }, [items]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.partyId || !formData.salesLedgerId) {
      return Swal.fire('Error', 'Please select Party and Account Ledger', 'error');
    }
    const validItems = items.filter(i => i.stockItemId && i.amount > 0);
    if (validItems.length === 0) {
      return Swal.fire('Error', 'Please add at least one item', 'error');
    }
    setShowPreview(true);
  };

  const handleConfirmSave = async () => {
    const result = await Swal.fire({
      title: 'Confirm Create Cash Voucher?',
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
    const totalTaxable = validItems.reduce((sum, item) => sum + Number(item.amount), 0);

    const entries = generateSalesEntries(
      formData.partyId,
      formData.salesLedgerId,
      totalTaxable,
      { totalTax: 0 }
    );

    const totalAmount = totalTaxable;
    entries[0].debitAmount = totalAmount;

    const payload = {
      voucherTypeId: formData.voucherTypeId,
      date: formData.date,
      voucherNumber: formData.voucherNumber,
      narration: formData.narration,
      totalAmount: totalAmount,
      invoiceType: formData.invoiceType,
      placeOfSupply: partyDetails.placeOfSupply,
      eWayBillNo: dispatchDetails.deliveryNote || '',
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
      }

      setTimeout(() => {
        window.print();
        setTimeout(() => {
          Swal.fire({ icon: 'success', title: 'Saved & Printed', text: `Cash Voucher ${isEditMode ? 'updated' : 'created'}!`, timer: 1500, showConfirmButton: false });
        }, 500);

        if (isEditMode) {
          navigate(-1);
          return;
        }

        setShowPreview(false);
        setFormData(prev => {
          const currentNum = parseInt(prev.voucherNumber, 10) || 0;
          const nextNumStr = String(currentNum + 1).padStart(4, '0');
          return {
            ...prev,
            partyId: '', partyName: '', salesLedgerId: '', narration: '',
            voucherNumber: nextNumStr,
            invoiceType: 'Cash'
          };
        });
        setItems([{ stockItemId: '', itemName: '', description: '', hsnSac: '', quantity: '', rate: '', amount: 0, unitSymbol: '' }]);
        setGrandTotal(0);
      }, 100);

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save voucher', 'error');
    }
  };

  if (showPreview) {
    return (
      <InvoicePreview
        formData={formData}
        dispatchDetails={dispatchDetails}
        partyDetails={partyDetails}
        items={items}
        taxTotals={{ cgst: 0, sgst: 0, igst: 0, totalTax: 0 }}
        grandTotal={grandTotal}
        activeCompany={activeCompany}
        isViewMode={isViewMode}
        isDownloadMode={isDownloadMode}
        onConfirm={isViewMode ? () => window.print() : handleConfirmSave}
        onCancel={() => {
          setShowPreview(false);
          if (isDownloadMode && onDownloadComplete) onDownloadComplete();
          else if (isViewMode) navigate(-1);
        }}
      />
    );
  }

  if (isDownloadMode) {
    return <div className="hidden">Loading download...</div>;
  }

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2 relative navigable-container">

      {/* Dispatch Details Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/20 flex items-center justify-center z-50 modal-open">
          <div
            className="bg-white border border-tally-border p-4 shadow-xl w-[600px] navigable-container"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setShowDispatchModal(false);
                setTimeout(() => document.getElementById('salesLedgerId')?.focus(), 100);
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
                setTimeout(() => document.getElementById('salesLedgerId')?.focus(), 100);
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
            </div>
            <div className="text-right mt-4">
              <button type="button" onClick={() => {
                setShowPartyModal(false);
                setTimeout(() => document.getElementById('salesLedgerId')?.focus(), 100);
              }} className="bg-tally-blue text-white px-4 py-1 text-sm font-bold">Accept</button>
            </div>
          </div>
        </div>
      )}

      <form id="voucherForm" onSubmit={handleFormSubmit} onKeyDown={handleEnterToNextField} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-bold text-xl text-tally-blue">Cash Voucher</div>
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
            <label className="w-32 text-sm font-bold text-tally-blue">Account</label>
            <span className="mx-2">:</span>
            <TallySelect
              name="partyId"
              value={formData.partyId}
              onChange={handleFormChange}
              options={debtors}
              createOption={{ label: "Create New Account..." }}
              placeholder="Select Account..."
              className="w-64 border border-tally-border px-1 py-0.5 font-bold"
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-tally-blue">Particulars</label>
            <span className="mx-2">:</span>
            <TallySelect
              id="salesLedgerId"
              name="salesLedgerId"
              value={formData.salesLedgerId}
              onChange={handleFormChange}
              options={salesAccounts}
              createOption={{ label: "Create New Ledger..." }}
              placeholder="Select Ledger..."
              className="w-64 border border-tally-border px-1 py-0.5"
            />
          </div>
        </div>

        {/* Inventory Grid */}
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
                <th className="py-1 px-2 text-center w-16">Unit</th>
                <th className="py-1 px-2 text-right w-24">Rate</th>
                <th className="py-1 px-2 text-center w-16">per</th>
                <th className="py-1 px-2 text-right w-48">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-[#fcf8e3]">
                  <td className="py-1 px-2 text-center text-gray-500 align-top">{item.stockItemId && item.stockItemId !== 'END' ? idx + 1 : ''}</td>
                  <td className="py-1 px-2 flex flex-col">
                    <TallySelect
                      id={`stockItemId-${idx}`}
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
                  <td className="py-1 px-2 text-center align-top text-gray-600 font-medium">{item.stockItemId && item.stockItemId !== 'END' ? item.unitSymbol : ''}</td>
                  <td className="py-1 px-2 align-top">
                    {item.stockItemId && item.stockItemId !== 'END' && <input type="number" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none" placeholder="0.00" />}
                  </td>
                  <td className="py-1 px-2 text-center align-top text-gray-600">{item.stockItemId && item.stockItemId !== 'END' ? item.unitSymbol : ''}</td>
                  <td className="py-1 px-2 text-right font-bold align-top">
                    {item.stockItemId && item.stockItemId !== 'END' && <input type="number" value={item.amount || ''} onChange={e => handleItemChange(idx, 'amount', e.target.value)} className="w-full text-right bg-transparent focus:bg-white focus:outline-none font-bold" placeholder="0.00" />}
                  </td>
                </tr>
              ))}

              {items.some(i => i.stockItemId && i.stockItemId !== 'END' && Number(i.amount) > 0) && (
                <tr className="border-t border-gray-200 bg-gray-50/50">
                  <td colSpan={7} className="py-1 px-2 text-right text-sm font-bold text-gray-600">Total:</td>
                  <td className="py-1 px-2 text-right font-bold text-tally-blue">
                    {items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
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
