import { X, Check, Search } from 'lucide-react';
import { formatDateStr } from '../../../utils/dateUtils';

export default function MatchingDetailsDrawer({ 
  isOpen, 
  onClose, 
  selectedItem, 
  type 
}) {
  if (!isOpen || !selectedItem) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Matching Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
          
          {/* Selected Item Summary */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Selected {type === 'book' ? 'Book Voucher' : 'Bank Statement Entry'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-medium text-gray-900">{formatDateStr(selectedItem.date)}</span>
              </div>
              
              {type === 'book' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Particulars</span>
                    <span className="text-sm font-medium text-gray-900 text-right w-48 truncate">{selectedItem.particulars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-bold text-blue-600">
                      ₹ {Number(selectedItem.debit || selectedItem.credit).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Cheque/UTR</span>
                    <span className="text-sm font-medium text-gray-900">{selectedItem.chequeNumber || '-'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Description</span>
                    <span className="text-sm font-medium text-gray-900 text-right w-48 truncate">{selectedItem.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className={`text-sm font-bold ${selectedItem.withdrawal ? 'text-red-600' : 'text-green-600'}`}>
                      ₹ {Number(selectedItem.withdrawal || selectedItem.deposit).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ref No.</span>
                    <span className="text-sm font-medium text-gray-900">{selectedItem.refNumber || '-'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Suggested Matches (Mock) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Matches</h3>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">AI Powered</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              <input type="text" placeholder="Search for match..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-3">
              {/* Mock Match 1 */}
              <div className="border border-green-200 bg-green-50/30 rounded-lg p-3 hover:bg-green-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-gray-800">₹ {Number(selectedItem.debit || selectedItem.credit || selectedItem.withdrawal || selectedItem.deposit).toFixed(2)}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded font-bold">98% Match</span>
                </div>
                <div className="text-xs text-gray-600 flex justify-between">
                  <span>{formatDateStr(selectedItem.date)}</span>
                  <span>Ref: {selectedItem.chequeNumber || selectedItem.refNumber || '102938'}</span>
                </div>
                <button className="mt-2 w-full flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded transition-colors">
                  <Check size={14} /> Accept Match
                </button>
              </div>

              {/* Mock Match 2 */}
              <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors opacity-70">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-gray-800">₹ {Number(selectedItem.debit || selectedItem.credit || selectedItem.withdrawal || selectedItem.deposit).toFixed(2)}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 rounded font-bold">45% Match</span>
                </div>
                <div className="text-xs text-gray-600 flex justify-between">
                  <span>{formatDateStr(new Date(new Date(selectedItem.date).getTime() - 86400000).toISOString())}</span>
                  <span>Ref: Unknown</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
