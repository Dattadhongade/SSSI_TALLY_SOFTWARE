import { useState, useEffect, useCallback } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import Swal from 'sweetalert2';

export default function EmployeeMaster() {
  const { setPageTitle } = useStore();
  const [formData, setFormData] = useState({
    name: '', alias: '', designation: '', dateOfJoin: '', dateOfResign: '',
    bloodGroup: '', panNumber: '', aadhaarNumber: '', uanNumber: '', pfAccountNumber: '',
    esiNumber: '', basicSalary: ''
  });

  const fetchEmployees = useCallback(async () => {
    try {
      // Assuming a generic endpoint for employees, fallback to empty array if no API
      await api.get('/employees').catch(() => ({ data: [] }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setPageTitle('Employee Master');
    fetchEmployees();
  }, [setPageTitle, fetchEmployees]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Fake API call
      // await api.post('/employees', formData);
      Swal.fire({ icon: 'success', title: 'Saved', text: 'Employee created successfully!', timer: 1500, showConfirmButton: false });
      setFormData({
        name: '', alias: '', designation: '', dateOfJoin: '', dateOfResign: '',
        bloodGroup: '', panNumber: '', aadhaarNumber: '', uanNumber: '', pfAccountNumber: '',
        esiNumber: '', basicSalary: ''
      });
      fetchEmployees();
    } catch {
      Swal.fire('Error', 'Failed to save employee', 'error');
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4">
      <div className="max-w-4xl mx-auto bg-white border border-tally-border shadow-sm">
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 font-bold text-tally-blue flex justify-between">
           <span>Employee Creation</span>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-x-8 gap-y-4">
           {/* General Details */}
           <div className="col-span-2 font-bold text-tally-blue border-b border-gray-200 pb-1 underline">General Details</div>
           
           <div className="flex items-center">
             <label className="w-40 text-sm font-bold">Name <span className="text-red-500">*</span></label>
             <span className="mx-2">:</span>
             <input autoFocus required name="name" value={formData.name} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none font-bold" />
           </div>
           
           <div className="flex items-center">
             <label className="w-40 text-sm">Alias</label>
             <span className="mx-2">:</span>
             <input name="alias" value={formData.alias} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">Designation</label>
             <span className="mx-2">:</span>
             <input name="designation" value={formData.designation} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm font-bold">Basic Salary</label>
             <span className="mx-2">:</span>
             <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none text-right font-bold" placeholder="0.00" />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">Date of Joining</label>
             <span className="mx-2">:</span>
             <input type="date" name="dateOfJoin" value={formData.dateOfJoin} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">Blood Group</label>
             <span className="mx-2">:</span>
             <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none">
               <option value=""></option>
               <option value="A+">A+</option>
               <option value="A-">A-</option>
               <option value="B+">B+</option>
               <option value="B-">B-</option>
               <option value="O+">O+</option>
               <option value="O-">O-</option>
               <option value="AB+">AB+</option>
               <option value="AB-">AB-</option>
             </select>
           </div>

           {/* Statutory Details */}
           <div className="col-span-2 font-bold text-tally-blue border-b border-gray-200 pb-1 mt-4 underline">Statutory Details</div>
           
           <div className="flex items-center">
             <label className="w-40 text-sm">PAN Number</label>
             <span className="mx-2">:</span>
             <input name="panNumber" value={formData.panNumber} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none uppercase" maxLength={10} />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">Aadhaar Number</label>
             <span className="mx-2">:</span>
             <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" maxLength={12} />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">UAN Number</label>
             <span className="mx-2">:</span>
             <input name="uanNumber" value={formData.uanNumber} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">PF A/c Number</label>
             <span className="mx-2">:</span>
             <input name="pfAccountNumber" value={formData.pfAccountNumber} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" />
           </div>

           <div className="flex items-center">
             <label className="w-40 text-sm">ESI Number</label>
             <span className="mx-2">:</span>
             <input name="esiNumber" value={formData.esiNumber} onChange={handleChange} className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none" />
           </div>

           <div className="col-span-2 text-right mt-6">
             <button type="submit" className="bg-tally-blue text-white px-6 py-1 text-sm font-bold shadow hover:bg-opacity-90">
               Accept
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}
