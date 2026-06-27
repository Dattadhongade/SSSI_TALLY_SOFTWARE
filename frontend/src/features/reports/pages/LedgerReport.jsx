import { formatDateStr } from '../../../utils/dateUtils';
import { useState, useEffect } from 'react';
import useStore from '../../../store/useStore';
import api from '../../../services/API';
import { voucherAPI } from '../../../services/voucherAPI';
import TallySelect from '../../../components/common/TallySelect';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function LedgerReport() {
  const { setPageTitle, selectedCompany, selectedFinancialYear } = useStore();
  const [ledgers, setLedgers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [columnarConfig, setColumnarConfig] = useState({
    showBuyerSupplierName: false,
    showBuyerSupplierAddress: false,
    showConsigneeName: false,
    showConsigneeAddress: false,
    showVoucherType: true,
    showVoucherNumber: true,
    showVoucherRefNumber: false,
    showVoucherRefDate: false,
    showGSTIN: false,
    showPartyTaxRegNumber: false,
    showServiceTaxRegNumber: false,
    showPAN: false,
    showCSTNumber: false,
    showExciseRegNumber: false,
    showLBTRegNumber: false,
    showNarration: false,
    showQuantityDetails: false,
    showItemValue: false,
    showLedgerAmountsWithDrCr: true
  });
  
  useEffect(() => {
    setPageTitle('Ledger Vouchers');
    async function fetchData() {
      try {
        const [lRes, vRes] = await Promise.all([
          api.get('/ledgers'),
          voucherAPI.getAll()
        ]);
        setLedgers(lRes.data);
        setAllVouchers(vRes.data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [setPageTitle]);

  const handlePeriodChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Period',
      html:
        `<div style="display:flex; flex-direction:column; gap:10px; text-align:left; color:#000;">` +
        `<label style="font-weight:bold;">From:</label>` +
        `<input id="swal-input1" type="date" class="swal2-input" style="color:#000; background:#fff; border:1px solid #ccc;" value="${fromDate}">` +
        `<label style="font-weight:bold;">To:</label>` +
        `<input id="swal-input2" type="date" class="swal2-input" style="color:#000; background:#fff; border:1px solid #ccc;" value="${toDate}">` +
        `</div>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    });

    if (formValues) {
      setFromDate(formValues[0]);
      setToDate(formValues[1]);
    }
  };

  const handleColumnarChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Columnar Register Alteration',
      width: '600px',
      html: `
        <div style="text-align:left; font-size:14px; color:#000; display:flex; flex-direction:column; gap:8px; max-height:400px; overflow-y:auto; padding:10px;">
          <label style="display:flex; justify-content:space-between;">Show buyer/supplier name: <input type="checkbox" id="col-1" ${columnarConfig.showBuyerSupplierName ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show buyer/supplier's address: <input type="checkbox" id="col-2" ${columnarConfig.showBuyerSupplierAddress ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show consignee/party name: <input type="checkbox" id="col-3" ${columnarConfig.showConsigneeName ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show consignee/party's address: <input type="checkbox" id="col-4" ${columnarConfig.showConsigneeAddress ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show voucher type: <input type="checkbox" id="col-5" ${columnarConfig.showVoucherType ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show voucher number: <input type="checkbox" id="col-6" ${columnarConfig.showVoucherNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show voucher reference number: <input type="checkbox" id="col-7" ${columnarConfig.showVoucherRefNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show voucher reference date: <input type="checkbox" id="col-8" ${columnarConfig.showVoucherRefDate ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show party's GSTIN/UIN: <input type="checkbox" id="col-9" ${columnarConfig.showGSTIN ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show party's tax registration number: <input type="checkbox" id="col-10" ${columnarConfig.showPartyTaxRegNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show service tax registration number: <input type="checkbox" id="col-11" ${columnarConfig.showServiceTaxRegNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show PAN: <input type="checkbox" id="col-12" ${columnarConfig.showPAN ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show CST number: <input type="checkbox" id="col-13" ${columnarConfig.showCSTNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show excise registration number: <input type="checkbox" id="col-14" ${columnarConfig.showExciseRegNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show LBT registration number: <input type="checkbox" id="col-15" ${columnarConfig.showLBTRegNumber ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show voucher narration: <input type="checkbox" id="col-16" ${columnarConfig.showNarration ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show quantity details: <input type="checkbox" id="col-17" ${columnarConfig.showQuantityDetails ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between; margin-top:10px; border-top:1px solid #ccc; padding-top:10px;">Show item value: <input type="checkbox" id="col-18" ${columnarConfig.showItemValue ? 'checked' : ''}></label>
          <label style="display:flex; justify-content:space-between;">Show ledger amounts with Dr/Cr: <input type="checkbox" id="col-19" ${columnarConfig.showLedgerAmountsWithDrCr ? 'checked' : ''}></label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          showBuyerSupplierName: document.getElementById('col-1').checked,
          showBuyerSupplierAddress: document.getElementById('col-2').checked,
          showConsigneeName: document.getElementById('col-3').checked,
          showConsigneeAddress: document.getElementById('col-4').checked,
          showVoucherType: document.getElementById('col-5').checked,
          showVoucherNumber: document.getElementById('col-6').checked,
          showVoucherRefNumber: document.getElementById('col-7').checked,
          showVoucherRefDate: document.getElementById('col-8').checked,
          showGSTIN: document.getElementById('col-9').checked,
          showPartyTaxRegNumber: document.getElementById('col-10').checked,
          showServiceTaxRegNumber: document.getElementById('col-11').checked,
          showPAN: document.getElementById('col-12').checked,
          showCSTNumber: document.getElementById('col-13').checked,
          showExciseRegNumber: document.getElementById('col-14').checked,
          showLBTRegNumber: document.getElementById('col-15').checked,
          showNarration: document.getElementById('col-16').checked,
          showQuantityDetails: document.getElementById('col-17').checked,
          showItemValue: document.getElementById('col-18').checked,
          showLedgerAmountsWithDrCr: document.getElementById('col-19').checked
        }
      }
    });

    if (formValues) {
      setColumnarConfig(formValues);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handlePeriodChange();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleColumnarChange();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, columnarConfig]);

  const ledgerObj = ledgers.find(l => l.id == selectedLedger);
  const selectedLedgerName = ledgerObj ? ledgerObj.name : '';
  const openingBalance = ledgerObj ? parseFloat(ledgerObj.openingBalance) : 0;
  const openingBalanceType = ledgerObj ? ledgerObj.balanceType : 'Dr';

  let runningBalance = openingBalanceType === 'Cr' ? -openingBalance : openingBalance;
  
  const transactions = [];
  
  if (openingBalance > 0) {
    transactions.push({
      id: 'open',
      date: '1-Apr-2026',
      particulars: 'Opening Balance',
      vchType: '',
      vchNo: '',
      narration: '',
      gstin: '',
      pan: '',
      qty: '',
      itemValue: '',
      debit: openingBalanceType === 'Dr' ? openingBalance : 0,
      credit: openingBalanceType === 'Cr' ? openingBalance : 0
    });
  }

  if (selectedLedger) {
    const filteredVouchers = allVouchers.filter(v => {
      if (!v.entries || !v.entries.some(e => e.ledgerId == selectedLedger)) return false;
      const vDateStr = v.date ? v.date.substring(0, 10) : '';
      return (!fromDate || vDateStr >= fromDate) && (!toDate || vDateStr <= toDate);
    }).sort((a,b) => new Date(a.date) - new Date(b.date));

    filteredVouchers.forEach(v => {
      const typeName = v.VoucherType ? v.VoucherType.name : '';
      const myEntry = v.entries.find(e => e.ledgerId == selectedLedger);
      if (!myEntry) return;

      const dr = Number(myEntry.debitAmount) || 0;
      const cr = Number(myEntry.creditAmount) || 0;
      
      const oppositeEntry = v.entries.find(e => e.ledgerId != selectedLedger && (e.debitAmount > 0 || e.creditAmount > 0));
      let particulars = v.narration || typeName;
      let gstin = '';
      let pan = '';
      if (v.partyDetails) {
        try {
           const party = JSON.parse(v.partyDetails);
           gstin = party.gstin || '';
           pan = party.pan || '';
        } catch {
           // Ignore parsing errors for empty or invalid party details
        }
      }

      if (oppositeEntry) {
         const oppLedger = ledgers.find(l => l.id == oppositeEntry.ledgerId);
         if (oppLedger) {
           particulars = oppLedger.name;
           if (!gstin) gstin = oppLedger.gstin || '';
           if (!pan) pan = oppLedger.pan || '';
         }
      }

      runningBalance += (dr - cr);

      transactions.push({
        id: v.id,
        date: formatDateStr(v.date),
        particulars,
        vchType: typeName,
        vchNo: v.voucherNumber,
        narration: v.narration || '',
        gstin,
        pan,
        qty: '', // Placeholder for future inventory
        itemValue: '', // Placeholder
        debit: dr,
        credit: cr
      });
    });
  }

  const totalDebit = transactions.reduce((sum, v) => sum + v.debit, 0);
  const totalCredit = transactions.reduce((sum, v) => sum + v.credit, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const title = `${selectedCompany?.name || 'SHREE GANESH ENTERPRISES'} - ${selectedLedgerName}`;
    doc.text(title, 14, 15);
    
    const head = [['Date', 'Particulars']];
    if (columnarConfig.showVoucherType) head[0].push('Vch Type');
    if (columnarConfig.showVoucherNumber) head[0].push('Vch No.');
    if (columnarConfig.showNarration) head[0].push('Narration');
    if (columnarConfig.showGSTIN) head[0].push('GSTIN/UIN');
    if (columnarConfig.showPAN) head[0].push('PAN');
    if (columnarConfig.showQuantityDetails) head[0].push('Qty');
    if (columnarConfig.showItemValue) head[0].push('Item Value');
    head[0].push('Debit', 'Credit');

    const body = transactions.map(tx => {
      const row = [tx.date, tx.particulars];
      if (columnarConfig.showVoucherType) row.push(tx.vchType);
      if (columnarConfig.showVoucherNumber) row.push(tx.vchNo);
      if (columnarConfig.showNarration) row.push(tx.narration);
      if (columnarConfig.showGSTIN) row.push(tx.gstin);
      if (columnarConfig.showPAN) row.push(tx.pan);
      if (columnarConfig.showQuantityDetails) row.push(tx.qty);
      if (columnarConfig.showItemValue) row.push(tx.itemValue);
      row.push(tx.debit > 0 ? tx.debit.toFixed(2) : '');
      row.push(tx.credit > 0 ? tx.credit.toFixed(2) : '');
      return row;
    });

    doc.autoTable({
      head: head,
      body: body,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    doc.save(`${selectedLedgerName.replace(/\s+/g, '_')}_Ledger.pdf`);
  };

  const handleExportExcel = () => {
    const data = transactions.map(tx => {
      const row = {
        'Date': tx.date,
        'Particulars': tx.particulars,
      };
      if (columnarConfig.showVoucherType) row['Vch Type'] = tx.vchType;
      if (columnarConfig.showVoucherNumber) row['Vch No.'] = tx.vchNo;
      if (columnarConfig.showNarration) row['Narration'] = tx.narration;
      if (columnarConfig.showGSTIN) row['GSTIN/UIN'] = tx.gstin;
      if (columnarConfig.showPAN) row['PAN'] = tx.pan;
      if (columnarConfig.showQuantityDetails) row['Qty'] = tx.qty;
      if (columnarConfig.showItemValue) row['Item Value'] = tx.itemValue;
      row['Debit'] = tx.debit > 0 ? tx.debit.toFixed(2) : '';
      row['Credit'] = tx.credit > 0 ? tx.credit.toFixed(2) : '';
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');
    XLSX.writeFile(workbook, `${selectedLedgerName.replace(/\s+/g, '_')}_Ledger.xlsx`);
  };

  const colSpanBeforeDebit = 2 + [
    columnarConfig.showVoucherType,
    columnarConfig.showVoucherNumber,
    columnarConfig.showNarration,
    columnarConfig.showGSTIN,
    columnarConfig.showPAN,
    columnarConfig.showQuantityDetails,
    columnarConfig.showItemValue
  ].filter(Boolean).length;

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 print:p-0 print:bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-bold text-tally-blue">Select Ledger:</label>
          <TallySelect 
            name="selectedLedger"
            value={selectedLedger}
            onChange={(e) => setSelectedLedger(e.target.value)}
            options={ledgers}
            placeholder="-- Select --"
            className="w-64 border border-tally-border px-1 py-0.5 text-sm font-bold focus:bg-tally-yellow"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="bg-tally-blue text-white border border-tally-border px-4 py-1 text-sm font-bold hover:bg-opacity-90"
          >
            Export PDF
          </button>
          <button 
            onClick={handleExportExcel}
            className="bg-tally-green text-white border border-tally-border px-4 py-1 text-sm font-bold hover:bg-opacity-90"
          >
            Export Excel
          </button>
          <button 
            onClick={handleColumnarChange}
            className="bg-tally-green text-white border border-tally-border px-4 py-1 text-sm font-bold hover:bg-opacity-90"
          >
            Columnar (F8)
          </button>
          <button 
            onClick={handlePeriodChange}
            className="bg-tally-yellow text-tally-dark border border-tally-border px-4 py-1 text-sm font-bold hover:bg-opacity-90"
          >
            Period (F2)
          </button>
          <button 
            onClick={handlePrint}
            className="bg-tally-blue text-white px-4 py-1 text-sm font-bold hover:bg-opacity-90"
          >
            Print (Ctrl+P)
          </button>
        </div>
      </div>

      {selectedLedger && (
        <div className="border border-tally-border bg-white overflow-x-auto print:border-none">
          {/* Header for print */}
          <div className="text-center font-bold text-tally-blue mb-4">
            <h2 className="text-xl uppercase">{selectedCompany?.name || 'SHREE GANESH ENTERPRISES'}</h2>
            <p className="text-md font-semibold mt-1">{selectedLedgerName}</p>
            <p className="text-sm">Ledger Account</p>
            <p className="text-xs">
              {fromDate ? formatDateStr(fromDate) : (selectedFinancialYear ? formatDateStr(selectedFinancialYear.startDate) : '1-Apr-2026')} 
              {' to '} 
              {toDate ? formatDateStr(toDate) : (selectedFinancialYear ? formatDateStr(selectedFinancialYear.endDate) : '31-Mar-2027')}
            </p>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-tally-light-blue border-b border-tally-border text-xs uppercase font-bold">
              <tr>
                <th className="px-3 py-2 border-r border-tally-border w-24">Date</th>
                <th className="px-3 py-2 border-r border-tally-border">Particulars</th>
                {columnarConfig.showVoucherType && <th className="px-3 py-2 border-r border-tally-border w-24">Vch Type</th>}
                {columnarConfig.showVoucherNumber && <th className="px-3 py-2 border-r border-tally-border w-24">Vch No.</th>}
                {columnarConfig.showNarration && <th className="px-3 py-2 border-r border-tally-border w-48">Narration</th>}
                {columnarConfig.showGSTIN && <th className="px-3 py-2 border-r border-tally-border w-32">GSTIN/UIN</th>}
                {columnarConfig.showPAN && <th className="px-3 py-2 border-r border-tally-border w-24">PAN</th>}
                {columnarConfig.showQuantityDetails && <th className="px-3 py-2 border-r border-tally-border w-24">Qty</th>}
                {columnarConfig.showItemValue && <th className="px-3 py-2 border-r border-tally-border w-28 text-right">Item Value</th>}
                <th className="px-3 py-2 border-r border-tally-border w-28 text-right">Debit</th>
                <th className="px-3 py-2 w-28 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-tally-border hover:bg-tally-yellow transition-colors print:border-gray-300 print:hover:bg-transparent">
                  <td className="px-3 py-2 border-r border-tally-border whitespace-nowrap">{tx.date}</td>
                  <td className="px-3 py-2 border-r border-tally-border font-semibold italic">{tx.particulars}</td>
                  {columnarConfig.showVoucherType && <td className="px-3 py-2 border-r border-tally-border">{tx.vchType}</td>}
                  {columnarConfig.showVoucherNumber && <td className="px-3 py-2 border-r border-tally-border">{tx.vchNo}</td>}
                  {columnarConfig.showNarration && <td className="px-3 py-2 border-r border-tally-border italic text-gray-600 truncate max-w-[200px]">{tx.narration}</td>}
                  {columnarConfig.showGSTIN && <td className="px-3 py-2 border-r border-tally-border text-xs">{tx.gstin}</td>}
                  {columnarConfig.showPAN && <td className="px-3 py-2 border-r border-tally-border text-xs">{tx.pan}</td>}
                  {columnarConfig.showQuantityDetails && <td className="px-3 py-2 border-r border-tally-border text-right">{tx.qty}</td>}
                  {columnarConfig.showItemValue && <td className="px-3 py-2 border-r border-tally-border text-right">{tx.itemValue}</td>}
                  <td className="px-3 py-2 border-r border-tally-border text-right">{tx.debit > 0 ? tx.debit.toFixed(2) : ''}</td>
                  <td className="px-3 py-2 text-right">{tx.credit > 0 ? tx.credit.toFixed(2) : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-tally-border print:bg-transparent">
                <td colSpan={colSpanBeforeDebit} className="px-3 py-2 border-r border-tally-border text-right font-bold">By Closing Balance</td>
                <td className="px-3 py-2 border-r border-tally-border text-right">{runningBalance < 0 ? Math.abs(runningBalance).toFixed(2) : ''}</td>
                <td className="px-3 py-2 text-right font-bold italic">
                  {runningBalance > 0 ? runningBalance.toFixed(2) : ''}
                </td>
              </tr>
              <tr className="bg-gray-50 font-bold border-t-2 border-double border-tally-border print:bg-transparent">
                <td colSpan={colSpanBeforeDebit} className="px-3 py-2 border-r border-tally-border text-right">Grand Total</td>
                <td className="px-3 py-2 border-r border-tally-border text-right">
                  {(totalDebit + (runningBalance < 0 ? Math.abs(runningBalance) : 0)).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {(totalCredit + (runningBalance > 0 ? runningBalance : 0)).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
