import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatPeriodDate, formatCurrentDate } from '../../utils/dateUtils';

export default function GatewayOfTally() {
  const { setPageTitle, selectedCompany, selectedFinancialYear, gatewayView, setGatewayView } = useStore();
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentView, setCurrentView] = useState(gatewayView || 'gateway');

  useEffect(() => {
    let title = 'Gateway of Tally';
    if (currentView === 'create') title = 'Master Creation';
    else if (currentView === 'alter') title = 'Master Alteration';
    else if (currentView === 'displayMore') title = 'Display More Reports';
    else if (currentView === 'accountBooks') title = 'Account Books';
    
    setPageTitle(title);
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
      { label: 'Display More Reports', shortcut: 'D', action: 'displayMore' }
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

  const displayMoreItems = [
    { section: 'ACCOUNTING', items: [
      { label: 'Trial Balance', shortcut: 'T', path: '/reports/financial/trial-balance' },
      { label: 'Day Book', shortcut: 'D', path: '/reports/daybook' },
      { label: 'Cash Flow', shortcut: 'C', path: '' },
      { label: 'Funds Flow', shortcut: 'F', path: '' },
      { label: 'Account Books', shortcut: 'A', action: 'accountBooks' },
      { label: 'Statements of Accounts', shortcut: 'S', path: '' }
    ]},
    { section: 'INVENTORY', items: [
      { label: 'Inventory Books', shortcut: 'I', path: '' },
      { label: 'Statements of Inventory', shortcut: 'E', path: '' }
    ]},
    { section: 'STATUTORY', items: [
      { label: 'Statutory Reports', shortcut: 'O', path: '' }
    ]},
    { section: 'EXCEPTION', items: [
      { label: 'Exception Reports', shortcut: 'X', path: '' },
      { label: 'Analysis & Verification', shortcut: 'V', path: '' },
      { label: 'Edit Log Summary', shortcut: 'L', path: '' }
    ]},
    { section: '', items: [
      { label: 'Quit', shortcut: 'Q', action: 'quit' }
    ]}
  ];

  const accountBooksItems = [
    { section: 'SUMMARY', items: [
      { label: 'Cash/Bank Book(s)', shortcut: 'C', path: '' },
      { label: 'Ledger', shortcut: 'L', path: '/reports/account-book/ledger' },
      { label: 'Group Summary', shortcut: 'G', path: '' },
      { label: 'Group Vouchers', shortcut: 'V', path: '' }
    ]},
    { section: 'REGISTERS', items: [
      { label: 'Contra Register', shortcut: 'T', path: '' },
      { label: 'Payment Register', shortcut: 'Y', path: '' },
      { label: 'Receipt Register', shortcut: 'R', path: '' },
      { label: 'Sales Register', shortcut: 'S', path: '/reports/account-book/sales-module' },
      { label: 'Purchase Register', shortcut: 'P', path: '/reports/account-book/purchase-module' },
      { label: 'Journal Register', shortcut: 'J', path: '' },
      { label: 'Debit Note Register', shortcut: 'D', path: '/reports/account-book/debit-note' },
      { label: 'Credit Note Register', shortcut: 'E', path: '/reports/account-book/credit-note' },
      { label: 'Voucher Clarification', shortcut: 'U', path: '' }
    ]},
    { section: '', items: [
      { label: 'Quit', shortcut: 'Q', action: 'quit' }
    ]}
  ];

  const getCurrentMenu = () => {
    if (currentView === 'gateway') return menuItems;
    if (currentView === 'displayMore') return displayMoreItems;
    if (currentView === 'accountBooks') return accountBooksItems;
    return mastersList;
  };

  const currentMenu = getCurrentMenu();
  const flatMenu = currentMenu.flatMap(m => m.items);

  const handleItemClick = useCallback((item) => {
    if (currentView === 'create' || currentView === 'alter') {
      const path = currentView === 'create' ? item.createPath : item.alterPath;
      if (path) navigate(path);
      else alert('Not implemented yet!');
      return;
    }

    if (item.action === 'create') { setCurrentView('create'); setSelectedIdx(0); }
    else if (item.action === 'alter') { setCurrentView('alter'); setSelectedIdx(0); }
    else if (item.action === 'displayMore') { setCurrentView('displayMore'); setSelectedIdx(0); }
    else if (item.action === 'accountBooks') { setCurrentView('accountBooks'); setSelectedIdx(0); }
    else if (item.action === 'quit') {
      if (currentView === 'accountBooks') { setCurrentView('displayMore'); setSelectedIdx(0); }
      else if (currentView === 'displayMore') { setCurrentView('gateway'); setSelectedIdx(0); }
      else alert('Quit is not available in web mode. Please logout.');
    }
    else if (item.path) { navigate(item.path); }
  }, [currentView, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      if (e.key === 'ArrowDown') {
        setSelectedIdx(prev => (prev + 1) % flatMenu.length);
      } else if (e.key === 'ArrowUp') {
        setSelectedIdx(prev => (prev - 1 + flatMenu.length) % flatMenu.length);
      } else if (e.key === 'Enter') {
        const item = flatMenu[selectedIdx];
        handleItemClick(item);
      } else if (e.key === 'Escape') {
        if (currentView === 'accountBooks') {
          setCurrentView('displayMore');
          setSelectedIdx(0);
        } else if (currentView !== 'gateway') {
          setCurrentView('gateway');
          setSelectedIdx(0);
        }
      } else {
        const key = e.key.toUpperCase();
        if (currentView === 'create' || currentView === 'alter') return; // no letter shortcuts for masters list yet
        const matchedIndex = flatMenu.findIndex(i => i.shortcut && i.shortcut.toUpperCase() === key);
        if (matchedIndex !== -1) {
          setSelectedIdx(matchedIndex);
          handleItemClick(flatMenu[matchedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, selectedIdx, flatMenu, handleItemClick]);

  let globalIndex = 0;

  return (
    <div className="text-tally-dark h-[80vh] font-sans flex flex-col lg:flex-row p-1 lg:p-2 gap-2 lg:gap-4 overflow-hidden">
      {/* Left Pane: Company Info */}
      <div className="flex-1 bg-white border border-tally-border flex flex-col shadow-sm">
         <div className="bg-tally-blue text-white font-bold p-2 text-center text-sm border-b border-tally-border">
           Name of Company
         </div>
         <div className="p-4 flex-1">
           <div className="font-bold text-lg text-tally-blue">
             {selectedCompany ? selectedCompany.name : 'No Company Selected'}
           </div>
           {selectedCompany && selectedFinancialYear && (
             <div className="text-sm mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <div className="font-bold text-[#1c385c] text-[10px] uppercase tracking-wider mb-1">Current Period</div>
                 <div className="text-black font-bold text-[13px]">
                   {formatPeriodDate(selectedFinancialYear.startDate || selectedFinancialYear.start_date)} to {formatPeriodDate(selectedFinancialYear.endDate || selectedFinancialYear.end_date)}
                 </div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-[#1c385c] text-[10px] uppercase tracking-wider mb-1">Current Date</div>
                 <div className="text-black font-bold text-[13px]">{formatCurrentDate(new Date())}</div>
               </div>
             </div>
           )}
         </div>
         <div className="bg-gray-100 p-2 text-center text-xs text-gray-500 font-bold border-t border-tally-border">
            Gateway of Tally
         </div>
      </div>

      {/* Right Pane: Menu */}
      <div className="w-full lg:w-[350px] shrink-0 bg-white border border-tally-border flex flex-col shadow-sm">
        <div className="bg-[#1c385c] text-white font-bold p-1 text-center text-[11px] border-b border-tally-border flex flex-col uppercase tracking-wide">
           {currentView === 'accountBooks' && <span className="text-tally-yellow italic capitalize">Gateway of Tally</span>}
           {(currentView === 'displayMore' || currentView === 'accountBooks') && <span className="text-tally-yellow italic capitalize">{currentView === 'accountBooks' ? 'Display More Reports' : 'Gateway of Tally'}</span>}
           <span>
             {currentView === 'gateway' ? 'Gateway of Tally' : 
              currentView === 'displayMore' ? 'Display More Reports' : 
              currentView === 'accountBooks' ? 'Account Books' : 'List of Masters'}
           </span>
        </div>
        
        <div className="flex-1 overflow-y-hidden bg-[#eef5f9]">
          {currentMenu.map((section, sIdx) => (
            <div key={sIdx} className="mb-0">
               {section.section && (
                 <div className={`${currentView === 'gateway' ? 'text-center font-bold text-[10px] text-tally-blue py-0.5 uppercase tracking-widest my-0' : 'text-[9px] text-tally-blue uppercase font-bold px-4 pt-1 pb-0 opacity-80'}`}>
                   {section.section}
                 </div>
               )}
               <div className="flex flex-col">
                 {section.items.map((item) => {
                   const currentIndex = globalIndex++;
                   const isSelected = currentIndex === selectedIdx;
                   
                   if (currentView === 'create' || currentView === 'alter') {
                     return (
                       <div 
                         key={item.label}
                         onClick={() => { setSelectedIdx(currentIndex); handleItemClick(item); }}
                         className={`px-6 py-0.5 cursor-pointer text-[12px] transition-colors ${isSelected ? 'bg-tally-yellow font-bold text-black' : 'text-tally-dark hover:bg-tally-yellow hover:font-bold'}`}
                       >
                         {item.label}
                       </div>
                     );
                   }

                   const labelParts = item.label.split(new RegExp(`(${item.shortcut})`, 'i'));
                   let shortcutFound = false;

                   return (
                     <div 
                       key={item.label}
                       onClick={() => { setSelectedIdx(currentIndex); handleItemClick(item); }}
                       className={`px-6 py-0.5 cursor-pointer font-bold text-[12px] flex items-center justify-between transition-colors ${isSelected ? 'bg-tally-yellow text-black' : 'hover:bg-[#e0eaf1] text-tally-dark'}`}
                     >
                       <span>
                         {labelParts.map((part, i) => {
                           if (!shortcutFound && part.toUpperCase() === item.shortcut) {
                             shortcutFound = true;
                             return <span key={i} className="text-tally-blue font-bold text-[13px] underline">{part}</span>;
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
      </div>
    </div>
  );
}
