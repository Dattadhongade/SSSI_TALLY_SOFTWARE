import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { 
  Building2, Database, FileText, FolderOpen, ShieldCheck, ChevronDown, ChevronRight, LogOut, Landmark
} from 'lucide-react';



  const modules = [
    { 
      name: 'Company Management', 
      icon: Building2,
      subItems: [
        { name: 'Create', path: '/company/create' },
        { name: 'Alter', path: '/company/alter' },
      ]
    },
    { 
      name: 'Create', 
      icon: FolderOpen,
      subItems: [
        { name: 'Account Group', path: '/masters/group/create' },
        { name: 'Ledger', path: '/masters/ledger/create' },
        { name: 'Currency', path: '/masters/currency/create' },
        { name: 'Stock Group', path: '/inventory/group/create' },
        { name: 'Stock Item', path: '/inventory/item/create' },
        { name: 'Unit', path: '/inventory/unit/create' },
        { name: 'Employee', path: '/payroll/employee' },
        { name: 'GST Registration', path: '/company/gst' },
      ]
    },
    { 
      name: 'Alter', 
      icon: ShieldCheck,
      subItems: [
        { name: 'Ledger', path: '/masters/ledger/alter' },
        { name: 'Currency', path: '/masters/currency/alter' },
        { name: 'Stock Item', path: '/inventory/item/alter' },
        { name: 'Unit', path: '/inventory/unit/alter' },
        { name: 'GST Registration', path: '/company/gst/alter' },
      ]
    },
    { 
      name: 'Vouchers', 
      icon: FileText,
      subItems: [
        { name: 'Cash', path: '/vouchers/cash' },
        { name: 'Contra', path: '/vouchers/contra', shortcut: 'F4' },
        { name: 'Payment', path: '/vouchers/payment', shortcut: 'F5' },
        { name: 'Receipt (F6)', path: '/vouchers/receipt', shortcut: 'F6' },
        { name: 'Journal (F7)', path: '/vouchers/journal', shortcut: 'F7' },
        { name: 'Manufacturing (Alt+F7)', path: '/vouchers/manufacturing', shortcut: 'Alt+F7' },
        { name: 'Payroll (Ctrl+F4)', path: '/vouchers/payroll', shortcut: 'Ctrl+F4' },
        { name: 'Sales', path: '/vouchers/sales', shortcut: 'F8' },
        { name: 'Purchase', path: '/vouchers/purchase', shortcut: 'F9' },
        { name: 'Other Vouchers', path: '/vouchers/other', shortcut: 'F10' },
        { name: 'Debit Note', path: '/vouchers/debit-note', shortcut: 'Alt+F5' },
        { name: 'Credit Note', path: '/vouchers/credit-note', shortcut: 'Alt+F6' },
        { name: 'Purchase Order', path: '/vouchers/purchase-order', shortcut: 'Ctrl+F9' },
      ]
    },
    { 
      name: 'Account Book', 
      icon: Database,
      subItems: [
        { name: 'Balance Sheet', path: '/reports/financial/balance-sheet' },
        { name: 'Profit & Loss A/c', path: '/reports/financial/profit-loss' },
        { name: 'Trial Balance', path: '/reports/financial/trial-balance' },
        { name: 'Ledger', path: '/reports/account-book/ledger' },
        { name: 'Sales Module', path: '/reports/account-book/sales-module' },
        { name: 'Purchase Module', path: '/reports/account-book/purchase-module' },

        { name: 'Debit Note Register', path: '/reports/account-book/debit-note' },
        { name: 'Credit Note Registry', path: '/reports/account-book/credit-note' },
      ]
    },
    { 
      name: 'GST Reports', 
      icon: FileText,
      subItems: [
        { name: 'GSTR-1', path: '/reports/gst/gstr1' },
        { name: 'GSTR-2', path: '/reports/gst/gstr2' },
        { name: 'GSTR-3B', path: '/reports/gst/gstr3b' },
      ]
    },
    { 
      name: 'Banking', 
      icon: Landmark,
      subItems: [
        { name: 'Bank Reconciliation', path: '/banking/reconciliation' },
      ]
    }
  ];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { selectedCompany, user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    const activeModule = modules.find(m => 
      m.subItems && m.subItems.some(sub => location.pathname.includes(sub.path))
    );
    if (activeModule) {
      setOpenDropdown(activeModule.name);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };



  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-56 bg-tally-light-blue border-r border-tally-border text-tally-dark transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Company Logo Display */}
        <div className="p-4 border-b border-tally-border bg-white flex flex-col items-center">
          {selectedCompany?.logo ? (
            <img src={selectedCompany.logo} alt="Company Logo" className="w-16 h-16 object-contain mb-2" />
          ) : (
            <div className="w-12 h-12 bg-tally-bg rounded-full flex items-center justify-center mb-2 border border-tally-border">
              <Building2 size={24} className="text-tally-blue" />
            </div>
          )}
          <h2 className="font-bold text-center text-xs text-tally-blue uppercase tracking-tight">
            {selectedCompany?.name || 'SSSI ERP SYSTEM'}
          </h2>
        </div>

        <nav className="py-2 flex-1 overflow-y-auto no-scrollbar">
          {modules.map((module) => (
            <div key={module.name} className="mb-0.5">
              {module.subItems ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(module.name)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${openDropdown === module.name ? 'bg-tally-yellow text-tally-dark font-medium' : 'hover:bg-tally-blue hover:text-white text-tally-blue'}`}
                  >
                    <div className="flex items-center">
                      <module.icon className="w-3.5 h-3.5 mr-2" />
                      {module.name}
                    </div>
                    {openDropdown === module.name ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openDropdown === module.name && (
                    <div className="bg-white border-y border-tally-border py-1">
                      {module.subItems.map((sub) => (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          className={({ isActive }) => 
                            `flex items-center justify-between px-4 py-1 text-xs transition-colors ${
                              isActive 
                                ? 'bg-tally-yellow text-tally-dark font-medium' 
                                : 'text-tally-dark hover:bg-tally-yellow'
                            }`
                          }
                        >
                          <span>{sub.name}</span>
                          {sub.shortcut && (
                            <span className="text-[10px] text-tally-blue font-semibold">
                              {sub.shortcut}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={module.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-1.5 text-xs transition-colors ${
                      isActive 
                        ? 'bg-tally-yellow text-tally-dark font-medium' 
                        : 'text-tally-blue hover:bg-tally-blue hover:text-white'
                    }`
                  }
                >
                  <module.icon className="w-3.5 h-3.5 mr-2" />
                  {module.name}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-tally-border p-2">
          <div className="text-[10px] text-gray-400 text-center mb-1 truncate px-1">
            {user?.name || user?.email || ''}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors rounded"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
