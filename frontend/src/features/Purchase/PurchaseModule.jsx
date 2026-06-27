import { formatDateStr } from '../../utils/dateUtils';
import { useState, useEffect, useCallback } from 'react';
import { Search, Printer, FileDown, Edit, Trash2, Plus, Calendar, Eye } from 'lucide-react';
import { voucherAPI } from '../../services/voucherAPI';
import api from '../../services/API';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Pagination from '../../components/common/Pagination';

export default function PurchaseModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Purchase Bills');
  const [vouchers, setVouchers] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = ['Purchase Bills', 'Purchase Orders', 'Receipt Notes', 'Debit Notes'];

  const fetchData = useCallback(async () => {
    try {
      const [vRes, lRes] = await Promise.all([
        voucherAPI.getAll(),
        api.get('/ledgers')
      ]);
      setVouchers(vRes.data);
      setLedgers(lRes.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch purchase data', 'error');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // eslint-disable-next-line
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter, fromDate, toDate]);

  const getSupplierName = (voucher) => {
    // The second entry is usually the party ledger in purchase (Purchase A/c Dr, Party A/c Cr)
    const partyEntry = voucher.entries?.[1];
    if (!partyEntry) return 'Unknown Supplier';
    const ledger = ledgers.find(l => l.id === partyEntry.ledgerId);
    return ledger ? ledger.name : 'Unknown Supplier';
  };

  const getFilteredVouchers = () => {
    let filtered;
    
    if (activeTab === 'Purchase Bills') filtered = vouchers.filter(v => v.VoucherType?.name === 'Purchase');
    else if (activeTab === 'Purchase Orders') filtered = vouchers.filter(v => v.VoucherType?.name === 'Purchase Order');
    else if (activeTab === 'Receipt Notes') filtered = vouchers.filter(v => v.VoucherType?.name === 'Receipt Note');
    else if (activeTab === 'Debit Notes') filtered = vouchers.filter(v => v.VoucherType?.name === 'Debit Note');
    else filtered = []; 

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.voucherNumber?.toLowerCase().includes(lower) || 
        getSupplierName(v).toLowerCase().includes(lower)
      );
    }
    
    if (fromDate) {
      filtered = filtered.filter(v => v.date.split('T')[0] >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter(v => v.date.split('T')[0] <= toDate);
    }

    return filtered;
  };

  const displayVouchers = getFilteredVouchers();
  
  const totalItems = displayVouchers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedVouchers = displayVouchers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalPurchased = displayVouchers.reduce((sum, v) => sum + Number(v.totalAmount), 0);
  const paid = 0; // Mock for now
  const outstanding = totalPurchased - paid;
  const draft = 0;

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        await voucherAPI.delete(id);
        fetchData();
        Swal.fire('Deleted!', 'Voucher has been deleted.', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete voucher', 'error');
      }
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num).replace('₹', '₹ ');
  };

  const getNewBtnText = () => {
    switch(activeTab) {
      case 'Purchase Bills': return 'New Purchase';
      case 'Purchase Orders': return 'New Purchase Order';
      case 'Receipt Notes': return 'New Receipt Note';
      case 'Debit Notes': return 'New Debit Note';
      default: return 'New Purchase';
    }
  };

  const handleNewVoucher = () => {
    let type = 'Purchase';
    if (activeTab === 'Purchase Orders') type = 'Purchase Order';
    else if (activeTab === 'Receipt Notes') type = 'Receipt Note';
    else if (activeTab === 'Debit Notes') type = 'Debit Note';
    
    navigate('/vouchers/purchase', { state: { newVoucherType: type } });
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-tally-blue tracking-tight">Purchase Module</h1>
          <p className="text-xs text-gray-600 mt-1">Purchase bills, purchase orders, receipt notes and debit notes.</p>
        </div>
        <button onClick={handleNewVoucher} className="bg-tally-blue hover:bg-opacity-90 text-white px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-semibold transition-colors">
          <Plus size={16} /> {getNewBtnText()}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-tally-border shadow-sm rounded p-4 relative overflow-hidden">
           <div className="text-xs text-tally-dark font-bold mb-1 uppercase opacity-70">Total Purchased</div>
           <div className="text-2xl font-bold text-tally-blue mb-2">{formatCurrency(totalPurchased)}</div>
           <div className="text-[10px] text-green-600 flex items-center gap-1">▲ FY 2026-27</div>
           <div className="absolute right-4 top-4 text-yellow-500 opacity-20"><span className="text-3xl">🛒</span></div>
        </div>
        <div className="bg-white border border-tally-border shadow-sm rounded p-4">
           <div className="text-xs text-tally-dark font-bold mb-1 uppercase opacity-70">Paid</div>
           <div className="text-2xl font-bold text-tally-blue mb-2">{formatCurrency(paid)}</div>
           <div className="text-[10px] text-green-600 flex items-center gap-1">▲ 0 bills paid</div>
        </div>
        <div className="bg-white border border-tally-border shadow-sm rounded p-4">
           <div className="text-xs text-tally-dark font-bold mb-1 uppercase opacity-70">Outstanding</div>
           <div className="text-2xl font-bold text-tally-blue mb-2">{formatCurrency(outstanding)}</div>
           <div className="text-[10px] text-red-600 flex items-center gap-1">▼ {displayVouchers.length} unpaid</div>
        </div>
        <div className="bg-white border border-tally-border shadow-sm rounded p-4">
           <div className="text-xs text-tally-dark font-bold mb-1 uppercase opacity-70">Draft</div>
           <div className="text-2xl font-bold text-tally-blue mb-2">{formatCurrency(draft)}</div>
           <div className="text-[10px] text-gray-500">0 pending finalization</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-tally-border mb-6">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-tally-blue text-tally-blue bg-white' : 'border-transparent text-gray-600 hover:bg-white hover:text-tally-blue'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex justify-between items-center mb-4 bg-white p-3 border border-tally-border rounded shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search bills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-tally-border rounded pl-9 pr-3 py-1.5 text-sm text-tally-dark focus:outline-none focus:border-tally-blue w-64 shadow-inner"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-tally-border rounded px-3 py-1.5 text-sm text-tally-dark focus:outline-none focus:border-tally-blue shadow-inner"
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Unpaid</option>
            <option>Partial</option>
            <option>Draft</option>
            <option>Due</option>
          </select>
          <select 
            value={(function() {
              if (!fromDate || !toDate) return "";
              if (fromDate.substring(0, 7) !== toDate.substring(0, 7)) return "";
              const m = parseInt(fromDate.substring(5, 7), 10);
              const map = {
                1: "January", 2: "February", 3: "March", 4: "April",
                5: "May", 6: "June", 7: "July", 8: "August",
                9: "September", 10: "October", 11: "November", 12: "December"
              };
              return map[m] || "";
            })()}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setFromDate('');
                setToDate('');
                return;
              }
              const currentYear = new Date().getFullYear();
              const currentMonth = new Date().getMonth();
              const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
              
              const monthMap = {
                "April": { m: 4, yOffset: 0 },
                "May": { m: 5, yOffset: 0 },
                "June": { m: 6, yOffset: 0 },
                "July": { m: 7, yOffset: 0 },
                "August": { m: 8, yOffset: 0 },
                "September": { m: 9, yOffset: 0 },
                "October": { m: 10, yOffset: 0 },
                "November": { m: 11, yOffset: 0 },
                "December": { m: 12, yOffset: 0 },
                "January": { m: 1, yOffset: 1 },
                "February": { m: 2, yOffset: 1 },
                "March": { m: 3, yOffset: 1 },
              };
              
              const info = monthMap[val];
              const targetYear = fyStartYear + info.yOffset;
              const targetMonthStr = info.m.toString().padStart(2, '0');
              const firstDay = `${targetYear}-${targetMonthStr}-01`;
              const lastDay = new Date(targetYear, info.m, 0).getDate();
              const lastDayStr = lastDay.toString().padStart(2, '0');
              
              setFromDate(firstDay);
              setToDate(`${targetYear}-${targetMonthStr}-${lastDayStr}`);
            }}
            className="bg-white border border-tally-border rounded px-3 py-1.5 text-sm text-tally-dark focus:outline-none focus:border-tally-blue shadow-inner"
          >
            <option value="">Select Month</option>
            {["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
               <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               <input 
                 type="date" 
                 value={fromDate}
                 onChange={(e) => setFromDate(e.target.value)}
                 className="bg-white border border-tally-border rounded pl-7 pr-2 py-1.5 text-sm text-tally-dark focus:outline-none focus:border-tally-blue shadow-inner w-32" 
               />
            </div>
            <span className="text-gray-400 text-xs font-semibold">to</span>
            <div className="relative flex items-center">
               <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               <input 
                 type="date" 
                 value={toDate}
                 onChange={(e) => setToDate(e.target.value)}
                 className="bg-white border border-tally-border rounded pl-7 pr-2 py-1.5 text-sm text-tally-dark focus:outline-none focus:border-tally-blue shadow-inner w-32" 
               />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-tally-bg border border-tally-border hover:bg-tally-light-blue text-tally-blue px-3 py-1.5 rounded flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm">
             <Printer size={14} /> PDF
          </button>
          <button className="bg-tally-bg border border-tally-border hover:bg-tally-light-blue text-tally-blue px-3 py-1.5 rounded flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm">
             <FileDown size={14} /> Excel
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-tally-border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-tally-light-blue text-tally-dark font-bold border-b border-tally-border">
              <th className="p-2 border-r border-tally-border">Voucher No.</th>
              <th className="p-2 border-r border-tally-border">Date</th>
              <th className="p-2 border-r border-tally-border">Supplier</th>
              <th className="p-2 border-r border-tally-border">Supplier Inv No.</th>
              <th className="p-2 border-r border-tally-border text-right">Debit Amt (₹)</th>
              <th className="p-2 border-r border-tally-border text-right">Credit Amt (₹)</th>
              <th className="p-2 border-r border-tally-border">Due Date</th>
              <th className="p-2 border-r border-tally-border text-center">Status</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVouchers.map((v) => {
              return (
                <tr key={v.id} className="border-b border-tally-border hover:bg-tally-yellow hover:bg-opacity-20 transition-colors">
                  <td className="p-2 border-r border-tally-border font-bold text-tally-blue">{v.voucherNumber}</td>
                  <td className="p-2 border-r border-tally-border">{formatDateStr(v.date)}</td>
                  <td className="p-2 border-r border-tally-border font-bold">{getSupplierName(v)}</td>
                  <td className="p-2 border-r border-tally-border">{v.referenceNumber || '-'}</td>
                  <td className="p-2 border-r border-tally-border text-right">{Number(v.totalAmount).toFixed(2)}</td>
                  <td className="p-2 border-r border-tally-border text-right font-bold">{Number(v.totalAmount).toFixed(2)}</td>
                  <td className="p-2 border-r border-tally-border">{formatDateStr(v.date)}</td>
                  <td className="p-2 border-r border-tally-border text-center">
                    <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded font-bold">Unpaid</span>
                  </td>
                  <td className="p-2 flex justify-center items-center gap-1">
                    <button 
                      onClick={() => navigate('/vouchers/purchase', { state: { viewVoucherId: v.id } })}
                      className="p-1 bg-tally-bg border border-tally-border hover:bg-tally-light-blue rounded text-tally-blue transition-colors shadow-sm" title="View Bill">
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => navigate('/vouchers/purchase', { state: { editVoucherId: v.id } })}
                      className="p-1 bg-tally-bg border border-tally-border hover:bg-tally-light-blue rounded text-tally-blue transition-colors shadow-sm" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(v.id)}
                      className="p-1 bg-red-50 border border-red-200 hover:bg-red-100 rounded text-red-600 transition-colors shadow-sm" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {paginatedVouchers.length === 0 && (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500 italic bg-white">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
          itemsPerPage={itemsPerPage} 
          totalItems={totalItems} 
        />
      </div>
    </div>
  );
}
