import { formatDateStr } from '../../../utils/dateUtils';

export default function SplitViewPanel({
  bookEntries,
  bankEntries,
  selectedBookIds,
  setSelectedBookIds,
  selectedBankIds,
  setSelectedBankIds,
  onRowClick
}) {
  const toggleBookSelection = (id) => {
    setSelectedBookIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleBankSelection = (id) => {
    setSelectedBankIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Reconciled': return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-medium">Reconciled</span>;
      case 'Matched': return <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">Matched</span>;
      default: return <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700 font-medium">Pending</span>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row border-x border-b border-gray-200 bg-white rounded-b-xl overflow-hidden h-[600px]">
      
      {/* Left Panel: Book Transactions */}
      <div className="w-full lg:w-1/2 border-r border-gray-200 flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 font-semibold text-gray-700 sticky top-0">
          Book Transactions (Company)
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-white sticky top-0 shadow-sm z-10">
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="p-2 w-10 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2">Particulars</th>
                <th className="p-2">Vch Type</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookEntries.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No book transactions found.</td></tr>
              ) : (
                bookEntries.map((entry) => (
                  <tr 
                    key={entry.entryId} 
                    onClick={() => onRowClick(entry, 'book')}
                    className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${selectedBookIds.includes(entry.entryId) ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedBookIds.includes(entry.entryId)}
                        onChange={() => toggleBookSelection(entry.entryId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </td>
                    <td className="p-2 text-gray-600 whitespace-nowrap">{formatDateStr(entry.date)}</td>
                    <td className="p-2 font-medium text-gray-800">{entry.particulars}</td>
                    <td className="p-2 text-gray-500 text-xs">{entry.voucherType || 'Payment'}</td>
                    <td className="p-2 text-right font-medium">
                      {Number(entry.debit) > 0 ? (
                        <span className="text-gray-900">{Number(entry.debit).toFixed(2)} Dr</span>
                      ) : (
                        <span className="text-gray-900">{Number(entry.credit).toFixed(2)} Cr</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {getStatusBadge(entry.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel: Bank Statement */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50/30">
        <div className="bg-[#f0f6fa] border-b border-gray-200 px-4 py-2 font-semibold text-blue-800 sticky top-0 flex justify-between items-center">
          <span>Imported Bank Statement</span>
          <span className="text-xs font-normal text-blue-600">Last updated: Today, 10:30 AM</span>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-white sticky top-0 shadow-sm z-10">
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="p-2 w-10 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="p-2 whitespace-nowrap">Bank Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Ref No.</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-center">Match</th>
              </tr>
            </thead>
            <tbody>
              {bankEntries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <p className="mb-2">No bank statement imported.</p>
                      <button className="text-blue-600 hover:underline text-sm font-medium">Import Statement</button>
                    </div>
                  </td>
                </tr>
              ) : (
                bankEntries.map((entry) => (
                  <tr 
                    key={entry.id}
                    onClick={() => onRowClick(entry, 'bank')} 
                    className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${selectedBankIds.includes(entry.id) ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedBankIds.includes(entry.id)}
                        onChange={() => toggleBankSelection(entry.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </td>
                    <td className="p-2 text-gray-600 whitespace-nowrap">{formatDateStr(entry.date)}</td>
                    <td className="p-2 font-medium text-gray-800">{entry.description}</td>
                    <td className="p-2 text-gray-500 text-xs">{entry.refNumber}</td>
                    <td className="p-2 text-right font-medium">
                       {Number(entry.withdrawal) > 0 ? (
                        <span className="text-red-600">{Number(entry.withdrawal).toFixed(2)} W</span>
                      ) : (
                        <span className="text-green-600">{Number(entry.deposit).toFixed(2)} D</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {entry.matchScore && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${entry.matchScore > 90 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {entry.matchScore}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
