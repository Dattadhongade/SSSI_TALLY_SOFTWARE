import { 
  FileDown, 
  RefreshCcw, 
  Link, 
  Unlink, 
  Check, 
  Printer, 
  DownloadCloud
} from 'lucide-react';

export default function ActionToolbar({
  onAutoMatch,
  onMatchSelected,
  onUnmatch,
  onMarkReconciled,
  onRefresh,
  onExportExcel,
  onPrint
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-t-xl px-4 py-3 flex flex-wrap justify-between items-center gap-4">
      <div className="flex gap-2">
        <button 
          onClick={onAutoMatch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
        >
          <RefreshCcw size={16} /> Auto Match
        </button>
        <button 
          onClick={onMatchSelected}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
        >
          <Link size={16} /> Match Selected
        </button>
        <button 
          onClick={onUnmatch}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
        >
          <Unlink size={16} /> Unmatch
        </button>
        <button 
          onClick={onMarkReconciled}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 shadow-sm ml-2"
        >
          <Check size={16} /> Mark Reconciled
        </button>
      </div>

      <div className="flex gap-2">
        <button className="text-gray-600 hover:text-blue-600 p-1.5 rounded transition-colors" title="Import Bank Statement">
          <DownloadCloud size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 my-auto mx-1"></div>
        <button onClick={onRefresh} className="text-gray-600 hover:text-blue-600 p-1.5 rounded transition-colors" title="Refresh">
          <RefreshCcw size={18} />
        </button>
        <button onClick={onExportExcel} className="text-gray-600 hover:text-green-600 p-1.5 rounded transition-colors" title="Export to Excel">
          <FileDown size={18} />
        </button>
        <button onClick={onPrint} className="text-gray-600 hover:text-gray-900 p-1.5 rounded transition-colors" title="Print BRS">
          <Printer size={18} />
        </button>
      </div>
    </div>
  );
}
