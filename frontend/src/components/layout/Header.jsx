import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Header({ toggleSidebar }) {
  const { pageTitle } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mock search results for now
  const searchResults = [
    { type: 'Customer', name: 'Shree Ganesh Enterprises' },
    { type: 'Invoice', name: 'INV-2026-001' },
    { type: 'Product', name: 'LPG 5 KG' },
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header className="bg-tally-bg border-b border-tally-border h-14 flex items-center justify-between px-4 sm:px-6 relative">
      <div className="flex items-center flex-1">
        <button
          onClick={toggleSidebar}
          className="text-tally-blue hover:text-tally-dark focus:outline-none lg:hidden mr-4"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Global Search Bar */}
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ERP..."
            className="block w-full pl-10 pr-3 py-1.5 border border-tally-border rounded text-sm focus:outline-none focus:border-tally-blue focus:ring-1 focus:ring-tally-blue bg-white"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSearchDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
          />
          
          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-tally-border shadow-lg rounded-md overflow-hidden">
              {searchResults.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <li key={idx} className="px-4 py-2 hover:bg-tally-light-blue cursor-pointer text-sm flex justify-between border-b border-gray-100 last:border-0">
                      <span className="font-semibold text-tally-dark">{result.name}</span>
                      <span className="text-xs text-tally-blue uppercase">{result.type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Dynamic Page Title in Center */}
      <div className="flex-1 justify-center hidden md:flex">
        <h1 className="text-lg font-bold text-tally-blue uppercase tracking-wider">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-6 text-xs text-tally-dark flex-1 justify-end">
        <div>
          <span className="font-semibold block text-right text-tally-blue text-[10px] uppercase">Current Period</span>
          <span className="font-bold">1-Apr-26 to 31-Mar-27</span>
        </div>
        <div className="hidden sm:block">
          <span className="font-semibold block text-right text-tally-blue text-[10px] uppercase">Current Date</span>
          <span className="font-bold">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
}
