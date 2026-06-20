import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function GatewayOfTally() {
  const { setPageTitle, selectedCompany, gatewayView, setGatewayView } = useStore();
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentView, setCurrentView] = useState(gatewayView); // 'gateway', 'create', 'alter'
  const [masterSelectedIdx, setMasterSelectedIdx] = useState(0);

  useEffect(() => {
    setPageTitle(currentView === 'gateway' ? 'Gateway of Tally' : currentView === 'create' ? 'Master Creation' : 'Master Alteration');
    setGatewayView(currentView);
  }, [setPageTitle, currentView, setGatewayView]);

  const menuItems = [
    { section: 'Masters', items: [
      { label: 'Create', shortcut: 'C', action: 'create' },
      { label: 'Alter', shortcut: 'A', action: 'alter' }
    ]},
    { section: 'Transactions', items: [
      { label: 'Vouchers', shortcut: 'V', path: '/vouchers/sales' },
      { label: 'Day Book', shortcut: 'K', path: '/reports/daybook' }
    ]},
    { section: 'Utilities', items: [
      { label: 'Banking', shortcut: 'N', path: '/banking/reconciliation' }
    ]},
    { section: 'Reports', items: [
      { label: 'Balance Sheet', shortcut: 'B', path: '/reports/financial/balance-sheet' },
      { label: 'Profit & Loss A/c', shortcut: 'P', path: '/reports/financial/profit-loss' },
      { label: 'Trial Balance', shortcut: 'T', path: '/reports/financial/trial-balance' },
      { label: 'GST Reports', shortcut: 'O', path: '/reports/gst/gstr1' },
      { label: 'Purchase Register', shortcut: 'R', path: '/reports/purchase-register' },
      { label: 'Display More Reports', shortcut: 'D', path: '/reports' }
    ]},
    { section: 'Payroll', items: [
      { label: 'Payroll Landing Page', shortcut: 'Y', path: '/payroll' }
    ]},
    { section: 'Quit', items: [
      { label: 'Quit', shortcut: 'Q', action: 'quit' }
    ]}
  ];

  const mastersList = [
    { section: 'Accounting Masters', items: [
      { label: 'Group', createPath: '/masters/group/create', alterPath: '/masters/group/alter' },
      { label: 'Ledger', createPath: '/masters/ledger/create', alterPath: '/masters/ledger/alter' },
      { label: 'Currency', createPath: '/masters/currency/create', alterPath: '/masters/currency/alter' },
      { label: 'Voucher Type', createPath: '', alterPath: '' }
    ]},
    { section: 'Inventory Masters', items: [
      { label: 'Stock Group', createPath: '/inventory/group/create', alterPath: '/inventory/group/alter' },
      { label: 'Stock Category', createPath: '', alterPath: '' },
      { label: 'Stock Item', createPath: '/inventory/item/create', alterPath: '/inventory/item/alter' },
      { label: 'Unit', createPath: '/inventory/unit/create', alterPath: '/inventory/unit/alter' },
      { label: 'Godown', createPath: '', alterPath: '' }
    ]},
    { section: 'Payroll Masters', items: [
      { label: 'Employee', createPath: '/payroll/employee/create', alterPath: '' }
    ]},
    { section: 'Statutory Masters', items: [
      { label: 'GST Registration', createPath: '/company/gst', alterPath: '/company/gst/alter' }
    ]}
  ];

  const flatMenu = menuItems.flatMap(m => m.items);
  const flatMasterMenu = mastersList.flatMap(m => m.items);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView === 'gateway') {
        if (e.key === 'ArrowDown') {
          setSelectedIdx(prev => (prev + 1) % flatMenu.length);
        } else if (e.key === 'ArrowUp') {
          setSelectedIdx(prev => (prev - 1 + flatMenu.length) % flatMenu.length);
        } else if (e.key === 'Enter') {
          const item = flatMenu[selectedIdx];
          if (item.action === 'create') setCurrentView('create');
          else if (item.action === 'alter') setCurrentView('alter');
          else if (item.path) navigate(item.path);
          else if (item.action === 'quit') alert('Quit is not available in web mode. Please logout.');
        } else {
          const key = e.key.toUpperCase();
          const matchedIndex = flatMenu.findIndex(i => i.shortcut === key);
          if (matchedIndex !== -1) {
            setSelectedIdx(matchedIndex);
            const item = flatMenu[matchedIndex];
            if (item.action === 'create') setCurrentView('create');
            else if (item.action === 'alter') setCurrentView('alter');
            else if (item.path) navigate(item.path);
          }
        }
      } else {
        // Master List Navigation
        if (e.key === 'ArrowDown') {
          setMasterSelectedIdx(prev => (prev + 1) % flatMasterMenu.length);
        } else if (e.key === 'ArrowUp') {
          setMasterSelectedIdx(prev => (prev - 1 + flatMasterMenu.length) % flatMasterMenu.length);
        } else if (e.key === 'Enter') {
          const item = flatMasterMenu[masterSelectedIdx];
          const path = currentView === 'create' ? item.createPath : item.alterPath;
          if (path) navigate(path);
          else alert('Not implemented yet!');
        } else if (e.key === 'Escape') {
          setCurrentView('gateway');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, selectedIdx, masterSelectedIdx, navigate, flatMenu, flatMasterMenu]);

  let globalIndex = 0;

  return (
    <div className="text-tally-dark min-h-full font-sans flex flex-col lg:flex-row p-1 lg:p-2 gap-2 lg:gap-4">
      {/* Left Pane: Company Info */}
      <div className="flex-1 bg-white border border-tally-border flex flex-col shadow-sm">
         <div className="bg-tally-blue text-white font-bold p-2 text-center text-sm border-b border-tally-border">
           Name of Company
         </div>
         <div className="p-4 flex-1">
           <div className="font-bold text-lg text-tally-blue">
             {selectedCompany ? selectedCompany.name : 'No Company Selected'}
           </div>
           {selectedCompany && (
             <div className="text-sm mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <div className="font-bold">Current Period</div>
                 <div className="text-gray-600">1-Apr-2026 to 31-Mar-2027</div>
               </div>
               <div>
                 <div className="font-bold">Current Date</div>
                 <div className="text-gray-600">Saturday, 6 Jun 2026</div>
               </div>
             </div>
           )}
         </div>
         <div className="bg-gray-100 p-2 text-center text-xs text-gray-500 font-bold border-t border-tally-border">
            Gateway of Tally
         </div>
      </div>

      {/* Right Pane: Menu */}
      <div className="w-full lg:w-[400px] shrink-0 bg-white border border-tally-border flex flex-col shadow-sm">
        <div className="bg-[#1c385c] text-white font-bold p-2 flex justify-between text-sm border-b border-tally-border">
           <span>{currentView === 'gateway' ? 'Gateway of Tally' : 'List of Masters'}</span>
           {currentView !== 'gateway' && <span className="text-gray-300 font-normal text-xs">{currentView === 'create' ? 'Master Creation' : 'Master Alteration'}</span>}
        </div>
        
        {currentView === 'gateway' ? (
          <div className="flex-1 overflow-auto">
            {menuItems.map((section, sIdx) => (
              <div key={sIdx} className="mb-2">
                 <div className="text-center font-bold text-xs text-tally-blue py-1 uppercase tracking-widest bg-gray-50 border-y border-gray-200">
                   {section.section}
                 </div>
                 <div className="flex flex-col">
                   {section.items.map((item) => {
                     const currentIndex = globalIndex++;
                     const isSelected = currentIndex === selectedIdx;
                     const labelParts = item.label.split(new RegExp(`(${item.shortcut})`, 'i'));
                     let shortcutFound = false;

                     return (
                       <div 
                         key={item.label}
                         onClick={() => { 
                           setSelectedIdx(currentIndex); 
                           if (item.action === 'create') setCurrentView('create');
                           else if (item.action === 'alter') setCurrentView('alter');
                           else if (item.path) navigate(item.path); 
                         }}
                         className={`px-8 py-1 cursor-pointer font-bold text-sm flex items-center justify-between transition-colors ${isSelected ? 'bg-tally-yellow text-tally-dark' : 'hover:bg-tally-yellow text-tally-dark'}`}
                       >
                         <span>
                           {labelParts.map((part, i) => {
                             if (!shortcutFound && part.toUpperCase() === item.shortcut) {
                               shortcutFound = true;
                               return <span key={i} className="text-tally-red text-lg underline">{part}</span>;
                             }
                             return part;
                           })}
                         </span>
                       </div>
                     );
                   })}
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-tally-light-blue pb-4">
            {mastersList.map((section, sIdx) => (
              <div key={sIdx} className="mb-1">
                 <div className="px-4 font-bold text-xs text-tally-dark py-1">
                   {section.section}
                 </div>
                 <div className="flex flex-col">
                   {section.items.map((item) => {
                     const currentIndex = globalIndex++;
                     const isSelected = currentIndex === masterSelectedIdx;

                     return (
                       <div 
                         key={item.label}
                         onClick={() => { 
                           setMasterSelectedIdx(currentIndex); 
                           const path = currentView === 'create' ? item.createPath : item.alterPath;
                           if (path) navigate(path);
                         }}
                         className={`px-8 py-1 cursor-pointer text-sm transition-colors ${isSelected ? 'bg-tally-yellow font-bold text-tally-dark' : 'text-tally-dark hover:bg-tally-yellow hover:font-bold'}`}
                       >
                         {item.label}
                       </div>
                     );
                   })}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
