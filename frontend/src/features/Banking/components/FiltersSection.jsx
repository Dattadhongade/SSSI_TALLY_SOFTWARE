import { Search, Filter } from 'lucide-react';

export default function FiltersSection({
  ledgers,
  selectedBank,
  setSelectedBank,
  dateRange,
  setDateRange,
  filters,
  setFilters,
  onLoad
}) {
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        
        {/* Top Row: Essential Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Bank A/c:</span>
            <select 
              value={selectedBank} 
              onChange={e => setSelectedBank(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
            >
              <option value="">-- Select Bank Account --</option>
              {ledgers.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Period:</span>
            <input 
              type="date" 
              value={dateRange.startDate} 
              onChange={e => setDateRange({...dateRange, startDate: e.target.value})} 
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <span className="text-gray-500">to</span>
            <input 
              type="date" 
              value={dateRange.endDate} 
              onChange={e => setDateRange({...dateRange, endDate: e.target.value})} 
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <button 
            onClick={onLoad} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            Load Data
          </button>
        </div>

        {/* Right side: Search */}
        <div className="relative w-full lg:w-64">
          <input 
            type="text" 
            placeholder="Search by Cheque, UTR, Amount..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span className="font-medium">Advanced:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Type:</span>
          <select 
            value={filters.type} 
            onChange={e => handleFilterChange('type', e.target.value)}
            className="border border-gray-200 rounded text-sm px-2 py-1 outline-none"
          >
            <option value="All">All</option>
            <option value="Receipt">Receipt</option>
            <option value="Payment">Payment</option>
            <option value="Contra">Contra</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <select 
            value={filters.status} 
            onChange={e => handleFilterChange('status', e.target.value)}
            className="border border-gray-200 rounded text-sm px-2 py-1 outline-none"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Matched">Matched</option>
            <option value="Unmatched">Unmatched</option>
          </select>
        </div>
      </div>
    </div>
  );
}
