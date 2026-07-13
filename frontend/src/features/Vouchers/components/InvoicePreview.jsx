import React from 'react';
import { createPortal } from 'react-dom';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function InvoicePreview({ 
  formData, 
  dispatchDetails, 
  partyDetails, 
  items, 
  taxItems,
  taxTotals, 
  grandTotal, 
  activeCompany,
  isViewMode,
  isDownloadMode,
  onConfirm, 
  onCancel 
}) {
  const [numCopies, setNumCopies] = React.useState(2);

  React.useEffect(() => {
    if (isDownloadMode) {
      setTimeout(async () => {
        try {
          const pages = document.getElementsByClassName('page-break');
          if (!pages || pages.length === 0) {
            if (onCancel) onCancel();
            return;
          }

          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          
          for (let i = 0; i < pages.length; i++) {
            const pageEl = pages[i];
            const dataUrl = await toJpeg(pageEl, { quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2 });
            
            if (i > 0) pdf.addPage();
            
            const imgProps = pdf.getImageProperties(dataUrl);
            const height = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, height);
          }

          pdf.save(`Invoice_${formData?.voucherNumber ? formData.voucherNumber.replace(/[^a-zA-Z0-9]/g, '_') : 'Download'}.pdf`);
          if (onCancel) onCancel();
        } catch (err) {
          console.error("PDF Generation Error:", err);
          if (onCancel) onCancel();
        }
      }, 500);
    }
  }, [isDownloadMode, formData, onCancel]);
  const copiesTitles = [
    'ORIGINAL FOR RECIPIENT',
    'DUPLICATE FOR TRANSPORTER',
    'TRIPLICATE FOR SUPPLIER',
    'EXTRA COPY'
  ];

  // Helper to convert number to words (basic implementation for Indian Rupees)
  const numberToWords = (num) => {
    if (!num) return '';
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
    return str;
  };
  const content = (
    <div className={`fixed inset-0 print-modal-wrapper overflow-y-auto font-sans flex flex-col h-screen ${isDownloadMode ? 'opacity-0 pointer-events-none z-[-9999]' : 'z-100 bg-gray-500'}`}>
      <style>
        {`
          @media print {
            @page { size: A4; margin: 0 !important; }
            
            body, html {
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important;
              width: 100% !important;
              height: auto !important;
            }

            /* Hide the main app root completely */
            body > #root { display: none !important; }

            /* Restore Modal */
            .print-modal-wrapper {
              position: static !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              background-color: white !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }
            
            #print-area { 
              display: block !important;
              position: static !important; 
              width: 100% !important; 
              margin: 0 !important; 
              padding: 0 !important; 
              overflow: visible !important;
            }
            
            .no-print, .no-print * { display: none !important; }
            
            .page-break { 
              page-break-after: always !important; 
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin: 0 !important; 
              padding: 5mm !important; 
              box-shadow: none !important; 
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              min-height: 297mm !important;
              display: flex !important;
              flex-direction: column !important;
              box-sizing: border-box !important;
            }
            
            .page-break:last-child { 
               page-break-after: auto !important; 
               break-after: auto !important; 
            }
          }
        `}
      </style>

      {/* Action Buttons (Non-printable) Fixed Header */}
      <div className="no-print sticky top-0 bg-white border-b shadow-md p-3 flex justify-center items-center gap-6 z-50">
        <div className="flex items-center gap-2">
          <label className="text-[15px] font-bold text-gray-700">Number of Copies:</label>
          <input 
            type="number" min="1" max="4" value={numCopies} 
            onChange={e => setNumCopies(Math.min(4, Math.max(1, Number(e.target.value))))} 
            className="border border-gray-300 p-1 w-16 text-center font-bold focus:outline-none focus:border-tally-blue"
          />
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        <button onClick={onConfirm} className="bg-green-600 text-white px-6 py-2 text-[15px] font-bold hover:bg-green-700 transition-colors shadow">
          {isViewMode ? 'Print' : 'Confirm & Print'}
        </button>
        <button onClick={onCancel} className="bg-red-600 text-white px-6 py-2 text-[15px] font-bold hover:bg-red-700 transition-colors shadow">Cancel</button>
      </div>

      <div id="print-area" className="flex-1 flex flex-col items-center py-8 gap-8">
        
        {Array.from({ length: numCopies }).map((_, copyIndex) => (
          <div key={copyIndex} className="page-break bg-white w-[210mm] min-h-[297mm] shadow-2xl relative font-sans text-[13px] leading-tight flex flex-col p-4">
            
            <div className="flex-1 border border-black flex flex-col relative">
              
              {/* Top Title & Copy Type */}
              <div className="text-center font-bold text-[15px] border-b border-black p-1 uppercase relative">
                {formData.invoiceType === 'Cash' ? 'Cash Invoice' : 'Tax Invoice'}
                <span className="absolute right-2 top-1 text-xs italic font-bold text-gray-600">{copiesTitles[copyIndex] || 'EXTRA COPY'}</span>
              </div>
              
              <div className="flex border-b border-black">
                {/* Left side: Company Details & Consignee */}
                <div className="w-1/2 border-r border-black flex flex-col">
              
              <div className="p-2 border-b border-black flex-1">
                <div className="font-bold text-[15px]">{activeCompany?.name || 'COMPANY NAME'}</div>
                <div>{activeCompany?.address || 'Company Address'}</div>
                <div>GSTIN/UIN: {activeCompany?.gstin}</div>
                <div>State Name: {activeCompany?.state}, Code: {activeCompany?.stateCode || '27'}</div>
                <div>E-Mail: {activeCompany?.email}</div>
              </div>

              <div className="p-2 border-b border-black flex-1">
                <div className="text-xs text-gray-600">Consignee (Ship to)</div>
                <div className="font-bold">{partyDetails?.buyerName || formData.partyName || 'CASH'}</div>
                <div>{partyDetails?.address}</div>
                {partyDetails?.gstin && <div>GSTIN/UIN: {partyDetails.gstin}</div>}
                {partyDetails?.state && <div>State Name: {partyDetails.state}</div>}
              </div>

              <div className="p-2 flex-1">
                <div className="text-xs text-gray-600">Buyer (Bill to)</div>
                <div className="font-bold">{partyDetails?.buyerName || formData.partyName || 'CASH'}</div>
                <div>{partyDetails?.address}</div>
                {partyDetails?.gstin && <div>GSTIN/UIN: {partyDetails.gstin}</div>}
                {partyDetails?.state && <div>State Name: {partyDetails.state}</div>}
              </div>

            </div>

            {/* Right side: Invoice Info & Dispatch Details */}
            <div className="w-1/2 flex flex-col">
              
              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black">
                  <div className="text-xs text-gray-600">Invoice No.</div>
                  <div className="font-bold uppercase">{formData.voucherNumber}</div>
                </div>
                <div className="w-1/2 p-1">
                  <div className="text-xs text-gray-600">Dated</div>
                  <div className="font-bold">{formData.date ? formData.date.split('-').reverse().join('-') : ''}</div>
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black flex-1">
                  <div className="text-xs text-gray-600">Delivery Note</div>
                  <div className="font-bold">{dispatchDetails?.deliveryNote}</div>
                </div>
                <div className="w-1/2 p-1 flex-1">
                  <div className="text-xs text-gray-600">Mode/Terms of Payment</div>
                  <div className="font-bold">{dispatchDetails?.modeOfPayment || '30 DAYS'}</div>
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black">
                  <div className="text-xs text-gray-600">Reference No. & Date.</div>
                  <div className="font-bold">{dispatchDetails?.referenceNo}</div>
                </div>
                <div className="w-1/2 p-1">
                  <div className="text-xs text-gray-600">Other References</div>
                  <div className="font-bold">{dispatchDetails?.otherReferences}</div>
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black">
                  <div className="text-xs text-gray-600">Buyer's Order No.</div>
                  <div className="font-bold">{dispatchDetails?.buyersOrderNo}</div>
                </div>
                <div className="w-1/2 p-1">
                  <div className="text-xs text-gray-600">Dated</div>
                  <div className="font-bold">{dispatchDetails?.orderDate ? dispatchDetails.orderDate.split('-').reverse().join('-') : ''}</div>
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black">
                  <div className="text-xs text-gray-600">Dispatch Doc No.</div>
                  <div className="font-bold">{dispatchDetails?.dispatchDocNo}</div>
                </div>
                <div className="w-1/2 p-1">
                  <div className="text-xs text-gray-600">Delivery Note Date</div>
                  <div className="font-bold">{formData.date ? formData.date.split('-').reverse().join('-') : ''}</div>
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black">
                  <div className="text-xs text-gray-600">Dispatched through</div>
                  <div className="font-bold uppercase">{dispatchDetails?.dispatchedThrough}</div>
                </div>
                <div className="w-1/2 p-1">
                  <div className="text-xs text-gray-600">Destination</div>
                  <div className="font-bold uppercase">{dispatchDetails?.destination}</div>
                </div>
              </div>

              <div className="flex border-b border-black">
                <div className="w-1/2 p-1 border-r border-black">
                  <div className="text-xs text-gray-600">Bill of Lading/LR-RR No.</div>
                  <div className="font-bold">{dispatchDetails?.billOfLading}</div>
                </div>
                <div className="w-1/2 p-1">
                  <div className="text-xs text-gray-600">Motor Vehicle No.</div>
                  <div className="font-bold uppercase">{dispatchDetails?.motorVehicleNo}</div>
                </div>
              </div>
              
              <div className="p-1 flex-1">
                 <div className="text-xs text-gray-600">Terms of Delivery</div>
                 <div className="font-bold whitespace-pre-wrap">{dispatchDetails?.termsOfDelivery}</div>
              </div>

            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 flex flex-col border-b border-black">
            <table className="w-full h-full text-left border-collapse flex flex-col">
              <thead className="border-b border-black">
                <tr className="flex w-full">
                  <th className="p-1 border-r border-black w-10 text-center">SI No.</th>
                  <th className="p-1 border-r border-black flex-1 text-center">Description of Goods</th>
                  <th className="p-1 border-r border-black w-24 text-center">HSN/SAC</th>
                  <th className="p-1 border-r border-black w-20 text-center">Quantity</th>
                  <th className="p-1 border-r border-black w-20 text-center">Rate</th>
                  <th className="p-1 border-r border-black w-12 text-center">per</th>
                  <th className="p-1 w-28 text-center">Amount</th>
                </tr>
              </thead>
              <tbody className="flex-1 flex flex-col relative">
                {/* Absolute vertical lines to fill empty space to the bottom */}
                <tr className="absolute inset-0 flex pointer-events-none z-0">
                  <td className="w-10 border-r border-black h-full"></td>
                  <td className="flex-1 border-r border-black h-full"></td>
                  <td className="w-24 border-r border-black h-full"></td>
                  <td className="w-20 border-r border-black h-full"></td>
                  <td className="w-20 border-r border-black h-full"></td>
                  <td className="w-12 border-r border-black h-full"></td>
                  <td className="w-28 h-full"></td>
                </tr>

                {items.filter(i => i.stockItemId && i.stockItemId !== 'END').map((item, idx) => (
                  <tr key={idx} className="flex w-full z-10">
                    <td className="p-1 border-r border-transparent w-10 text-center align-top">{idx + 1}</td>
                    <td className="p-1 border-r border-transparent flex-1 font-bold align-top">
                      {item.itemName}
                      {item.description && <div className="font-normal text-[13px] italic">{item.description}</div>}
                    </td>
                    <td className="p-1 border-r border-transparent w-24 text-center align-top">{item.hsnSac || ''}</td>
                    <td className="p-1 border-r border-transparent w-20 text-right align-top font-bold">{item.quantity ? `${item.quantity} ${item.unitSymbol || ''}` : ''}</td>
                    <td className="p-1 border-r border-transparent w-20 text-right align-top font-bold">{item.rate ? Number(item.rate).toFixed(2) : ''}</td>
                    <td className="p-1 border-r border-transparent w-12 text-center align-top">{item.unitSymbol}</td>
                    <td className="p-1 w-28 text-right align-top font-bold">{item.amount > 0 ? Number(item.amount).toFixed(2) : ''}</td>
                  </tr>
                ))}
                
                {/* Spacer to push taxes down slightly */}
                <tr className="h-16 w-full z-10"></tr>

                {/* Tax Ledgers in Grid */}
                {(taxItems && taxItems.length > 0) ? (
                  taxItems.filter(t => t.ledgerId && t.ledgerId !== 'END' && Number(t.amount) > 0).map((tax, idx) => (
                    <tr key={`tax-${idx}`} className="flex w-full z-10">
                      <td className="p-1 border-r border-transparent w-10"></td>
                      <td className="p-1 border-r border-transparent flex-1 italic text-center font-bold">{tax.ledgerName}</td>
                      <td className="p-1 border-r border-transparent w-24"></td>
                      <td className="p-1 border-r border-transparent w-20"></td>
                      <td className="p-1 border-r border-transparent w-20"></td>
                      <td className="p-1 border-r border-transparent w-12"></td>
                      <td className="p-1 w-28 text-right font-bold">{Number(tax.amount).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    {taxTotals.cgst > 0 && (
                      <tr className="flex w-full z-10">
                        <td className="p-1 border-r border-transparent w-10"></td>
                        <td className="p-1 border-r border-transparent flex-1 italic text-center font-bold">CGST</td>
                        <td className="p-1 border-r border-transparent w-24"></td>
                        <td className="p-1 border-r border-transparent w-20"></td>
                        <td className="p-1 border-r border-transparent w-20"></td>
                        <td className="p-1 border-r border-transparent w-12"></td>
                        <td className="p-1 w-28 text-right font-bold">{taxTotals.cgst.toFixed(2)}</td>
                      </tr>
                    )}
                    {taxTotals.sgst > 0 && (
                      <tr className="flex w-full z-10">
                        <td className="p-1 border-r border-transparent w-10"></td>
                        <td className="p-1 border-r border-transparent flex-1 italic text-center font-bold">SGST</td>
                        <td className="p-1 border-r border-transparent w-24"></td>
                        <td className="p-1 border-r border-transparent w-20"></td>
                        <td className="p-1 border-r border-transparent w-20"></td>
                        <td className="p-1 border-r border-transparent w-12"></td>
                        <td className="p-1 w-28 text-right font-bold">{taxTotals.sgst.toFixed(2)}</td>
                      </tr>
                    )}
                    {taxTotals.igst > 0 && (
                      <tr className="flex w-full z-10">
                        <td className="p-1 border-r border-transparent w-10"></td>
                        <td className="p-1 border-r border-transparent flex-1 italic text-center font-bold">IGST</td>
                        <td className="p-1 border-r border-transparent w-24"></td>
                        <td className="p-1 border-r border-transparent w-20"></td>
                        <td className="p-1 border-r border-transparent w-20"></td>
                        <td className="p-1 border-r border-transparent w-12"></td>
                        <td className="p-1 w-28 text-right font-bold">{taxTotals.igst.toFixed(2)}</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
              <tfoot className="border-t border-black font-bold">
                <tr className="flex w-full">
                  <td className="p-1 border-r border-black w-10"></td>
                  <td className="p-1 border-r border-black flex-1 text-right">Total</td>
                  <td className="p-1 border-r border-black w-24"></td>
                  <td className="p-1 border-r border-black w-20"></td>
                  <td className="p-1 border-r border-black w-20"></td>
                  <td className="p-1 border-r border-black w-12"></td>
                  <td className="p-1 w-28 text-right">Rs {grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col border-b border-black">
            <div className="p-1 border-b border-black">
              <div className="text-xs text-gray-600">Amount Chargeable (in words)</div>
              <div className="font-bold italic">Indian Rupees {numberToWords(Math.floor(grandTotal))}</div>
              <div className="text-[10px] text-right italic text-[#6b7280]">E. & O.E</div>
            </div>

            {/* Tax / HSN Summary Table */}
            <div className="flex-1">
              <table className="w-full text-center border-collapse">
                <thead className="border-b border-black text-[11px] font-bold">
                  <tr>
                    <th className="p-1 border-r border-black w-48 text-right" rowSpan="2">HSN/SAC</th>
                    <th className={`p-1 ${formData.invoiceType === 'Cash' ? '' : 'border-r border-black'}`} rowSpan="2">
                      {formData.invoiceType === 'Cash' ? 'Total Value' : 'Taxable Value'}
                    </th>
                    {taxTotals.cgst > 0 && <th className="p-1 border-r border-black" colSpan="2">CGST</th>}
                    {taxTotals.sgst > 0 && <th className="p-1 border-r border-black" colSpan="2">SGST/UTGST</th>}
                    {taxTotals.igst > 0 && <th className="p-1 border-r border-black" colSpan="2">IGST</th>}
                    {formData.invoiceType !== 'Cash' && <th className="p-1 w-28" rowSpan="2">Total<br/>Tax Amount</th>}
                  </tr>
                  {formData.invoiceType !== 'Cash' && (taxTotals.cgst > 0 || taxTotals.sgst > 0 || taxTotals.igst > 0) && (
                    <tr className="border-t border-black">
                      {taxTotals.cgst > 0 && <><th className="p-1 border-r border-black">Rate</th><th className="p-1 border-r border-black">Amount</th></>}
                      {taxTotals.sgst > 0 && <><th className="p-1 border-r border-black">Rate</th><th className="p-1 border-r border-black">Amount</th></>}
                      {taxTotals.igst > 0 && <><th className="p-1 border-r border-black">Rate</th><th className="p-1 border-r border-black">Amount</th></>}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {items.filter(i => i.stockItemId && i.stockItemId !== 'END').map((item, idx) => {
                     let itemGst = item.gstRate || 0;
                     if (itemGst === 0 && taxTotals.totalTax > 0) itemGst = 18; // Fallback for legacy items missing gstRate
                     const itemTax = (Number(item.amount) * itemGst) / 100;
                     const cgst = taxTotals.cgst > 0 ? itemTax / 2 : 0;
                     const sgst = taxTotals.sgst > 0 ? itemTax / 2 : 0;
                     const igst = taxTotals.igst > 0 ? itemTax : 0;
                     return (
                      <tr key={idx} className="border-b border-black">
                        <td className="p-1 border-r border-black text-right">{item.hsnSac || ''}</td>
                        <td className={`p-1 text-right ${formData.invoiceType === 'Cash' ? '' : 'border-r border-black'}`}>{Number(item.amount).toFixed(2)}</td>
                        
                        {taxTotals.cgst > 0 && (
                          <>
                            <td className="p-1 border-r border-black">{itemGst / 2}%</td>
                            <td className="p-1 border-r border-black text-right">{cgst.toFixed(2)}</td>
                          </>
                        )}
                        {taxTotals.sgst > 0 && (
                          <>
                            <td className="p-1 border-r border-black">{itemGst / 2}%</td>
                            <td className="p-1 border-r border-black text-right">{sgst.toFixed(2)}</td>
                          </>
                        )}
                        {taxTotals.igst > 0 && (
                          <>
                            <td className="p-1 border-r border-black">{itemGst}%</td>
                            <td className="p-1 border-r border-black text-right">{igst.toFixed(2)}</td>
                          </>
                        )}
                        
                        {formData.invoiceType !== 'Cash' && <td className="p-1 text-right">{itemTax.toFixed(2)}</td>}
                      </tr>
                     )
                  })}
                  
                  <tr className="font-bold border-b border-black">
                    <td className="p-1 border-r border-black text-right">Total</td>
                    <td className={`p-1 text-right ${formData.invoiceType === 'Cash' ? '' : 'border-r border-black'}`}>{(grandTotal - taxTotals.totalTax).toFixed(2)}</td>
                    
                    {taxTotals.cgst > 0 && (
                      <>
                        <td className="p-1 border-r border-black"></td>
                        <td className="p-1 border-r border-black text-right">{taxTotals.cgst.toFixed(2)}</td>
                      </>
                    )}
                    {taxTotals.sgst > 0 && (
                      <>
                        <td className="p-1 border-r border-black"></td>
                        <td className="p-1 border-r border-black text-right">{taxTotals.sgst.toFixed(2)}</td>
                      </>
                    )}
                    {taxTotals.igst > 0 && (
                      <>
                        <td className="p-1 border-r border-black"></td>
                        <td className="p-1 border-r border-black text-right">{taxTotals.igst.toFixed(2)}</td>
                      </>
                    )}
                    
                    {formData.invoiceType !== 'Cash' && <td className="p-1 text-right">{taxTotals.totalTax.toFixed(2)}</td>}
                  </tr>
                </tbody>
              </table>
            </div>

            {formData.invoiceType !== 'Cash' && (
              <div className="p-1 border-y border-black">
                <div className="text-xs text-gray-600">Tax Amount (in words) : <span className="font-bold text-black italic">Indian Rupees {numberToWords(Math.floor(taxTotals.totalTax))}</span></div>
              </div>
            )}

            <div className="flex border-b border-black">
              <div className="w-1/2 border-r border-black p-1"></div>
              <div className="w-1/2 p-1 text-xs">
                <div className="underline italic mb-1 text-blue-600 font-bold">Company's Bank Details</div>
                <div className="flex"><span className="w-28">A/c Holder's Name</span> <span className="font-bold">: {activeCompany?.name || ''}</span></div>
                <div className="flex"><span className="w-28">Bank Name</span> <span className="font-bold">: {activeCompany?.bankName || ''}</span></div>
                <div className="flex"><span className="w-28">A/c No.</span> <span className="font-bold">: {activeCompany?.accountNumber || ''}</span></div>
                <div className="flex"><span className="w-28">Branch & IFS Code</span> <span className="font-bold">: {activeCompany?.branchName || ''} & {activeCompany?.ifscCode || ''}</span></div>
                <div className="flex"><span className="w-28">SWIFT Code</span> <span className="font-bold">: {activeCompany?.swiftCode || ''}</span></div>
              </div>
            </div>

            <div className="flex min-h-[100px]">
              <div className="w-1/2 border-r border-black flex flex-col p-1 justify-between">
                <div>
                  <div className="text-xs text-gray-600 underline mb-1">Declaration</div>
                  <div className="pr-4">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
                </div>
              </div>
              
              <div className="w-1/2 flex flex-col p-1 relative justify-between">
                <div className="font-bold text-right pr-2 pt-1">for {activeCompany?.name || 'COMPANY NAME'}</div>
                <div className="text-[13px] font-bold text-[#4b5563] text-right pr-2 pb-1">Authorised Signatory</div>
              </div>
            </div>
              </div>

            </div>
            <div className="text-center py-1 font-bold italic text-xs">This is a Computer Generated Invoice</div>
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
