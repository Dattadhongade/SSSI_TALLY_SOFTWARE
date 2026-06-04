import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';
import { handleEnterToNextField } from '../../../utils/formNavigation';

export default function GstRegistration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, selectCompany, setPageTitle } = useStore();
  
  useEffect(() => {
    setPageTitle('GST Registration Details');
  }, [setPageTitle]);
  
  const [formData, setFormData] = useState({
    gstRegistrationStatus: 'Active',
    state: '',
    gstRegistrationType: 'Regular',
    assesseeOtherTerritory: false,
    gstin: '',
    periodicityGSTR1: 'Monthly',
    ewayBillApplicable: true,
    ewayBillApplicableFrom: '2026-04-01',
    ewayBillIntrastate: true,
    einvoicingApplicable: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // For selects that represent boolean
    if (value === 'Yes') {
      setFormData({ ...formData, [name]: true });
    } else if (value === 'No') {
      setFormData({ ...formData, [name]: false });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app we would PUT to update the company
      const res = await axios.put(`http://localhost:5000/api/companies/${id}/gst`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      selectCompany(res.data.company); // Auto select this company
      Swal.fire({ icon: 'success', title: 'GST Details Saved', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      navigate('/');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save GST details', 'error');
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans">


      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="p-4 max-w-5xl mx-auto">
        <h2 className="text-center font-bold mb-4 underline">GST Details</h2>
        
        <div className="flex items-center border-b border-gray-300 pb-2 mb-4">
          <label className="w-1/4 text-xs font-semibold">Registration status</label>
          <span className="mr-2">:</span>
          <select 
            name="gstRegistrationStatus" value={formData.gstRegistrationStatus} onChange={handleChange}
            className="w-1/4 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm bg-transparent font-bold" 
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm mb-2">GST Registration Details</h3>
            
            <div className="flex items-center">
              <label className="w-2/5 text-xs">State</label>
              <span className="mr-2">:</span>
              <input 
                name="state" value={formData.state} onChange={handleChange}
                className="w-3/5 border border-tally-border focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm bg-[#fcf8e3]" 
              />
            </div>
            
            <div className="flex items-center">
              <label className="w-2/5 text-xs">Registration type</label>
              <span className="mr-2">:</span>
              <select 
                name="gstRegistrationType" value={formData.gstRegistrationType} onChange={handleChange}
                className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
              >
                <option value="Regular">Regular</option>
                <option value="Composition">Composition</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="w-2/5 text-xs">Assessee of Other Territory</label>
              <span className="mr-2">:</span>
              <select 
                name="assesseeOtherTerritory" value={formData.assesseeOtherTerritory ? 'Yes' : 'No'} onChange={handleChange}
                className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="w-2/5 text-xs">GSTIN/UIN</label>
              <span className="mr-2">:</span>
              <input 
                name="gstin" value={formData.gstin} onChange={handleChange}
                className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
              />
            </div>
            
            <div className="flex items-center">
              <label className="w-2/5 text-xs">Periodicity of GSTR-1</label>
              <span className="mr-2">:</span>
              <select 
                name="periodicityGSTR1" value={formData.periodicityGSTR1} onChange={handleChange}
                className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>

            <h3 className="font-bold text-sm mt-4 mb-2">e-Invoice Details</h3>
            <div className="flex items-center">
              <label className="w-2/5 text-xs">e-Invoicing applicable</label>
              <span className="mr-2">:</span>
              <select 
                name="einvoicingApplicable" value={formData.einvoicingApplicable ? 'Yes' : 'No'} onChange={handleChange}
                className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm mb-2">e-Way Bill Details</h3>
            
            <div className="flex items-center">
              <label className="w-2/5 text-xs">e-Way Bill applicable</label>
              <span className="mr-2">:</span>
              <select 
                name="ewayBillApplicable" value={formData.ewayBillApplicable ? 'Yes' : 'No'} onChange={handleChange}
                className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            
            {formData.ewayBillApplicable && (
              <>
                <div className="flex items-center pl-4">
                  <label className="w-[35%] text-xs">Applicable from</label>
                  <span className="mr-2">:</span>
                  <input 
                    name="ewayBillApplicableFrom" type="date" value={formData.ewayBillApplicableFrom} onChange={handleChange}
                    className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
                  />
                </div>
                <div className="flex items-center pl-4">
                  <label className="w-[35%] text-xs">Applicable for intrastate</label>
                  <span className="mr-2">:</span>
                  <select 
                    name="ewayBillIntrastate" value={formData.ewayBillIntrastate ? 'Yes' : 'No'} onChange={handleChange}
                    className="w-3/5 focus:outline-none focus:bg-tally-yellow px-1 py-0.5 text-sm font-bold" 
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-12 pt-4 border-t border-gray-300">
          <button type="submit" className="bg-tally-blue text-white px-6 py-1.5 text-sm font-bold hover:bg-opacity-90">
            Accept (Ctrl+A)
          </button>
        </div>
      </form>
    </div>
  );
}
