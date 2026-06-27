import { formatDateStr } from '../../utils/dateUtils';
import { useState, useEffect, useCallback } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import { FaEye, FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function PurchaseRegister() {
  const { setPageTitle } = useStore();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await api.get('/vouchers?type=Purchase');
      setVouchers(res.data);
    } catch {
      Swal.fire('Error', 'Failed to fetch purchase register', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPageTitle('Purchase Register');
    // eslint-disable-next-line
    fetchPurchases();
  }, [setPageTitle, fetchPurchases]);

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
        setLoading(true);
        await api.delete(`/vouchers/${id}`);
        Swal.fire('Deleted!', 'Purchase voucher has been deleted.', 'success');
        fetchPurchases();
      } catch {
        Swal.fire('Error', 'Failed to delete voucher.', 'error');
      }
    }
  };

  // Calculate totals
  const totalDebit = vouchers.reduce((sum, v) => sum + Number(v.totalAmount || 0), 0);
  // Purchases usually have debit entries to Purchase account, but here we can just show totalAmount in Debit for standard display or sum up entries
  // To match the image strictly: Grand Total is shown for Debit.

  if (loading) {
    return <div className="p-4 text-tally-blue font-bold">Loading Purchase Register...</div>;
  }

  return (
    <div className="bg-white min-h-full font-sans p-4 shadow-sm border border-tally-border">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-tally-blue">Purchase Register</h2>
        <button 
          onClick={() => navigate('/vouchers/purchase')}
          className="bg-tally-blue text-white px-4 py-2 font-bold shadow hover:bg-opacity-90"
        >
          + Add Purchase
        </button>
      </div>

      <div className="overflow-x-auto border border-blue-100 rounded">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#eef5fa] text-tally-blue text-left text-xs uppercase">
              <th className="p-3 border-r border-blue-100 font-bold">Date</th>
              <th className="p-3 border-r border-blue-100 font-bold">Particulars</th>
              <th className="p-3 border-r border-blue-100 font-bold text-center">Vch Type</th>
              <th className="p-3 border-r border-blue-100 font-bold text-center">Vch No.</th>
              <th className="p-3 border-r border-blue-100 font-bold text-right">Debit Amount</th>
              <th className="p-3 border-r border-blue-100 font-bold text-right">Credit Amount</th>
              <th className="p-3 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 italic">No purchase vouchers found</td>
              </tr>
            ) : (
              vouchers.map(v => {
                let partyName = 'Cash/Bank';
                if (v.partyDetails) {
                  try {
                    const pd = JSON.parse(v.partyDetails);
                    partyName = pd.supplierName || partyName;
                  } catch {
                    // Ignore JSON parse error
                  }
                }
                
                return (
                  <tr key={v.id} className="border-b border-blue-100 hover:bg-[#fcf8e3] transition-colors">
                    <td className="p-3 border-r border-blue-100">{formatDateStr(v.date)}</td>
                    <td className="p-3 border-r border-blue-100 font-bold italic text-gray-800">{partyName}</td>
                    <td className="p-3 border-r border-blue-100 text-center">{v.VoucherType?.name || 'Purchase'}</td>
                    <td className="p-3 border-r border-blue-100 text-center">{v.voucherNumber}</td>
                    <td className="p-3 border-r border-blue-100 text-right text-gray-700">{Number(v.totalAmount).toFixed(2)}</td>
                    <td className="p-3 border-r border-blue-100 text-right text-gray-700"></td>
                    <td className="p-3 text-center flex justify-center gap-3">
                      <button className="text-blue-600 hover:text-blue-800" title="View"><FaEye /></button>
                      <button className="text-indigo-600 hover:text-indigo-800" title="Download"><FaDownload /></button>
                      <button onClick={() => navigate(`/vouchers/alter/${v.id}`)} className="text-gray-600 hover:text-gray-800" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700" title="Delete"><FaTrash /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {vouchers.length > 0 && (
            <tfoot>
              <tr className="bg-[#f8fafd] border-t-2 border-blue-200">
                <td colSpan="4" className="p-3 border-r border-blue-100 text-right font-bold text-tally-dark">Grand Total</td>
                <td className="p-3 border-r border-blue-100 text-right font-bold text-tally-dark">{totalDebit.toFixed(2)}</td>
                <td className="p-3 border-r border-blue-100 text-right font-bold text-tally-dark">0.00</td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
