export default function InvoicePrintTemplate({ invoiceData }) {
  // A clean, print-friendly invoice layout template
  return (
    <div className="hidden print:block font-sans text-black p-8 max-w-4xl mx-auto bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">{invoiceData?.companyName || 'COMPANY NAME'}</h1>
        <p className="text-sm">{invoiceData?.address || 'Address Line 1, City, State - PIN'}</p>
        <p className="text-sm">GSTIN: {invoiceData?.gstin || '27AAAAA0000A1Z5'}</p>
      </div>
      
      <div className="border-t border-b border-black py-2 mb-4 flex justify-between">
        <h2 className="text-xl font-bold uppercase">Tax Invoice</h2>
        <p className="font-bold">Original for Recipient</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 border border-black p-2">
        <div>
          <p className="text-sm font-bold">Billed To:</p>
          <p className="text-sm">{invoiceData?.customerName || 'Customer Name'}</p>
          <p className="text-sm">GSTIN: {invoiceData?.customerGstin || 'URP'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">Invoice No: {invoiceData?.invoiceNo || 'INV-001'}</p>
          <p className="text-sm">Date: {invoiceData?.date || '01-Apr-2026'}</p>
        </div>
      </div>
      
      {/* Items Table */}
      <table className="w-full border-collapse border border-black text-sm mb-6">
        <thead>
          <tr className="border-b border-black">
            <th className="border-r border-black p-1">S.No.</th>
            <th className="border-r border-black p-1 text-left">Description of Goods</th>
            <th className="border-r border-black p-1">HSN/SAC</th>
            <th className="border-r border-black p-1">Qty</th>
            <th className="border-r border-black p-1">Rate</th>
            <th className="p-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(invoiceData?.items || [{ desc: 'Item 1', qty: 10, rate: 100, amount: 1000 }]).map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="border-r border-black p-1 text-center">{idx + 1}</td>
              <td className="border-r border-black p-1">{item.desc}</td>
              <td className="border-r border-black p-1 text-center">{item.hsn || '-'}</td>
              <td className="border-r border-black p-1 text-center">{item.qty}</td>
              <td className="border-r border-black p-1 text-right">{item.rate}</td>
              <td className="p-1 text-right font-bold">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex justify-between items-end border-t border-black pt-16">
        <div>
          <p className="text-xs">Amount Chargeable (in words)</p>
          <p className="text-sm font-bold capitalize">INR One Thousand Only</p>
        </div>
        <div className="text-center">
          <p className="text-xs">For {invoiceData?.companyName || 'COMPANY NAME'}</p>
          <div className="h-12"></div>
          <p className="text-xs">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
