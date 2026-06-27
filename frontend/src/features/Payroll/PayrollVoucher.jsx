import { getLocalISODate } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import Swal from 'sweetalert2';

export default function PayrollVoucher() {
  const { setPageTitle } = useStore();
  
  const [formData, setFormData] = useState({
    date: getLocalISODate(),
    voucherNumber: 'PAY/26-27/001',
    employeeId: '',
    narration: ''
  });

  const [earnings, setEarnings] = useState([
    { payheadId: '', amount: 0 }
  ]);
  
  const [deductions, setDeductions] = useState([
    { payheadId: '', amount: 0 }
  ]);

  const [payheads] = useState([
    { id: '1', name: 'Basic Pay', type: 'Earning' },
    { id: '2', name: 'HRA', type: 'Earning' },
    { id: '3', name: 'PF Deduction', type: 'Deduction' },
    { id: '4', name: 'ESI Deduction', type: 'Deduction' },
    { id: '5', name: 'Professional Tax', type: 'Deduction' }
  ]);

  useEffect(() => {
    setPageTitle('Payroll Voucher');
    // In a real app we'd fetch actual Employees from API
    // For UI demonstration, we use a mock if not fetched
  }, [setPageTitle]);

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0);
  const netSalary = totalEarnings - totalDeductions;

  const handleEarningChange = (index, field, value) => {
    const newArr = [...earnings];
    newArr[index][field] = value;
    if (index === newArr.length - 1 && field === 'payheadId' && value) {
      newArr.push({ payheadId: '', amount: 0 });
    }
    setEarnings(newArr);
  };

  const handleDeductionChange = (index, field, value) => {
    const newArr = [...deductions];
    newArr[index][field] = value;
    if (index === newArr.length - 1 && field === 'payheadId' && value) {
      newArr.push({ payheadId: '', amount: 0 });
    }
    setDeductions(newArr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({ icon: 'success', title: 'Saved', text: 'Payroll Voucher saved successfully!', timer: 1500, showConfirmButton: false });
    setFormData({...formData, employeeId: '', narration: ''});
    setEarnings([{ payheadId: '', amount: 0 }]);
    setDeductions([{ payheadId: '', amount: 0 }]);
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-2">
      <form onSubmit={handleSubmit} className="bg-white border border-tally-border shadow-sm flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="font-bold text-xl text-tally-blue">Payroll Voucher</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-tally-blue">No.</span>
              <input value={formData.voucherNumber} readOnly className="bg-transparent border border-transparent w-48 px-1 font-bold outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border border-tally-border px-1 focus:bg-tally-yellow focus:outline-none text-sm" />
          </div>
        </div>

        {/* Employee Selection */}
        <div className="p-4 border-b border-tally-border flex items-center">
          <label className="w-32 text-sm font-bold text-tally-blue">Employee Name :</label>
          <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="border border-tally-border px-2 py-1 w-64 focus:bg-tally-yellow text-sm outline-none">
            <option value="">-- Primary Cost Category --</option>
            <option value="E01">Ramesh Kumar (Sales)</option>
            <option value="E02">Suresh Patil (Marketing)</option>
          </select>
        </div>

        {/* Payroll Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Earnings */}
          <div className="w-1/2 border-r border-tally-border flex flex-col">
            <div className="bg-[#eaf4e8] border-b border-tally-border px-4 py-1 font-bold text-sm text-center text-green-800">Earnings</div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs bg-gray-50 text-gray-500">
                    <th className="p-2 pl-4">Pay Head</th>
                    <th className="p-2 w-32 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-yellow-50">
                      <td className="p-1 pl-4">
                        <select value={e.payheadId} onChange={ev => handleEarningChange(idx, 'payheadId', ev.target.value)} className="w-full border-none bg-transparent outline-none">
                           <option value=""></option>
                           {payheads.filter(p => p.type === 'Earning').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="p-1 pr-4">
                        <input type="number" value={e.amount} onChange={ev => handleEarningChange(idx, 'amount', ev.target.value)} className="w-full text-right bg-transparent outline-none font-bold" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-tally-border p-2 text-right font-bold bg-gray-50 pr-4 text-green-700">
              Gross Earnings: ₹ {totalEarnings.toFixed(2)}
            </div>
          </div>

          {/* Right: Deductions */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-[#fcf8e3] border-b border-tally-border px-4 py-1 font-bold text-sm text-center text-red-800">Deductions</div>
            <div className="flex-1 overflow-auto border-b border-tally-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs bg-gray-50 text-gray-500">
                    <th className="p-2 pl-4">Pay Head</th>
                    <th className="p-2 w-32 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((d, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-yellow-50">
                      <td className="p-1 pl-4">
                        <select value={d.payheadId} onChange={ev => handleDeductionChange(idx, 'payheadId', ev.target.value)} className="w-full border-none bg-transparent outline-none">
                           <option value=""></option>
                           {payheads.filter(p => p.type === 'Deduction').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="p-1 pr-4">
                        <input type="number" value={d.amount} onChange={ev => handleDeductionChange(idx, 'amount', ev.target.value)} className="w-full text-right bg-transparent outline-none font-bold text-red-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-tally-border p-2 text-right font-bold bg-gray-50 pr-4 text-red-600">
              Total Deductions: ₹ {totalDeductions.toFixed(2)}
            </div>
            <div className="bg-[#f0f6fa] p-4 text-right flex justify-between font-bold items-center border-t border-tally-border">
               <span className="text-tally-blue uppercase">Net Salary Payable</span>
               <span className="text-2xl text-tally-blue border-t-2 border-double border-tally-blue pt-1">₹ {netSalary.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-tally-border p-2 flex justify-between items-end bg-[#f0f6fa]">
          <div className="w-1/2 pr-4">
            <label className="text-xs font-bold text-tally-blue">Narration:</label>
            <textarea value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})} className="w-full border border-tally-border focus:bg-tally-yellow px-1 outline-none text-sm resize-none" rows="1" />
          </div>
          <button type="submit" className="bg-tally-blue text-white px-6 py-1 font-bold text-sm shadow hover:bg-opacity-90">
             Accept
          </button>
        </div>
      </form>
    </div>
  );
}
