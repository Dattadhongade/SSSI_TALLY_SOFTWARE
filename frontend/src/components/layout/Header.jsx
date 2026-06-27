import { formatDateStr } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import { Menu, Search, Home, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function Header({ toggleSidebar }) {
  const { pageTitle } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mock search results for now
  const searchResults = [
    { type: 'Customer', name: 'Shree Ganesh Enterprises' },
    { type: 'Invoice', name: 'INV-2026-001' },
    { type: 'Product', name: 'LPG 5 KG' },
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
          document.activeElement.blur();
          return;
        }
        if (location.pathname !== '/') {
           navigate('/');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);

  return (
    <header className="bg-[#1c385c] border-b border-tally-border h-14 flex items-center justify-between px-4 sm:px-6 relative">
      <div className="flex items-center flex-1">
        <button
          onClick={toggleSidebar}
          className="text-tally-blue hover:text-tally-dark focus:outline-none lg:hidden mr-4"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Back and Home Buttons */}
        <div className="flex items-center space-x-2 mr-4">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 rounded-full bg-white text-tally-blue hover:bg-tally-yellow hover:text-tally-dark transition-colors"
            title="Gateway of Tally"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 rounded-full bg-tally-blue text-white hover:bg-tally-dark transition-colors flex items-center space-x-1"
            title="Gateway of Tally (Esc)"
          >
            <Home className="h-4 w-4" />
            <span className="text-xs font-bold hidden sm:inline">HOME</span>
          </button>
        </div>
        
        {/* Global Search Bar */}
        <div className="relative w-full max-w-[150px] sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ERP..."
            className="block w-full pl-9 pr-3 py-1.5 border border-tally-border rounded text-sm focus:outline-none focus:border-tally-blue focus:ring-1 focus:ring-tally-blue bg-white"
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
        <h1 className="text-lg font-bold text-tally-white uppercase tracking-wider">{pageTitle}</h1>
      </div>

      <div className="hidden lg:flex items-center space-x-6 text-xs text-tally-white flex-1 justify-end">
        <div>
          <span className="font-semibold block text-right text-tally-white text-[10px] uppercase">Current Period</span>
          <span className="font-bold">1-Apr-26 to 31-Mar-27</span>
        </div>
        <div>
          <span className="font-semibold block text-right text-tally-white text-[10px] uppercase">Current Date</span>
          <span className="font-bold">{formatDateStr(new Date())}</span>
        </div>
      </div>
    </header>
  );
}
