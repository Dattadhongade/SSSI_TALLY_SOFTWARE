import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';
import { ledgerAPI } from '../../../services/ledgerAPI';
import { handleEnterToNextField } from '../../../utils/formNavigation';

export default function LedgerCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    groupId: '', // Ideally a select dropdown for Groups
    mailingName: '',
    address: '',
    state: '',
    country: 'India',
    pincode: '',
    provideBankDetails: false,
    bankAccountHolder: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    pan: '',
    registrationType: 'Regular',
    gstin: '',
    openingBalance: '',
    balanceType: 'Dr'
  });

  useEffect(() => {
    setPageTitle(id ? 'Ledger Alteration' : 'Ledger Creation');
    let ignore = false;

    async function fetchLedger() {
      try {
        const res = await ledgerAPI.getById(id);
        if (!ignore && res.data) setFormData(res.data);
      } catch (err) {
        if (!ignore) console.error('Failed to fetch ledger details', err);
      }
    }

    if (id) fetchLedger();

    return () => { ignore = true; };
  }, [id, setPageTitle]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await ledgerAPI.update(id, formData);
      } else {
        await ledgerAPI.create(formData);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Ledger ${id ? 'updated' : 'created'} successfully!`,
        timer: 1500,
        showConfirmButton: false
      });
      navigate(id ? '/masters/ledger/alter' : '/');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${id ? 'update' : 'create'} ledger`
      });
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans">

      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="p-4 grid grid-cols-2 gap-8 max-w-5xl">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Name</label>
              <input 
                name="name" value={formData.name} onChange={handleChange} required
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent font-bold" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue flex justify-end pr-2">(Alias)</label>
              <input 
                name="alias" value={formData.alias} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center mt-4 pt-4 border-t border-tally-border">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Under</label>
              <select 
                name="groupId" value={formData.groupId} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              >
                <option value="">Select Group...</option>
                <option value="1">Sundry Debtors</option>
                <option value="2">Sundry Creditors</option>
                <option value="3">Bank Accounts</option>
                <option value="4">Sales Accounts</option>
                <option value="5">Purchase Accounts</option>
                {/* Dynamically load from DB later */}
              </select>
            </div>
          </div>

          <div className="space-y-2 border border-tally-border p-2 mt-4">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Mailing Details</h3>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Name</label>
              <input 
                name="mailingName" value={formData.mailingName} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-start mt-2">
              <label className="w-1/3 text-xs font-semibold text-tally-blue pt-1">Address</label>
              <textarea 
                name="address" value={formData.address} onChange={handleChange} rows="3"
                className="w-2/3 border border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent resize-none" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">State</label>
              <input 
                name="state" value={formData.state} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Country</label>
              <input 
                name="country" value={formData.country} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Pincode</label>
              <input 
                name="pincode" value={formData.pincode} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
            {/* Banking Details */}
            <div className="border border-tally-border p-3">
              <h3 className="font-bold border-b border-tally-border mb-2 text-tally-blue">Banking Details</h3>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold w-1/2">Provide Bank Details</label>
                <select 
                  name="provideBankDetails"
                  value={formData.provideBankDetails}
                  onChange={(e) => handleChange({ target: { name: 'provideBankDetails', value: e.target.value === 'true', type: 'checkbox', checked: e.target.value === 'true' }})}
                  className="border border-tally-border px-1 py-0.5 w-1/2 focus:bg-tally-yellow focus:outline-none"
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>

              {formData.provideBankDetails && (
                <div className="pl-4 mt-2 border-l-2 border-tally-blue space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold w-1/2">A/C Holder Name</label>
                    <input 
                      type="text" name="bankAccountHolder" value={formData.bankAccountHolder} onChange={handleChange}
                      className="border border-tally-border px-1 py-0.5 w-1/2 focus:bg-tally-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold w-1/2">Bank Name</label>
                    <input 
                      type="text" name="bankName" value={formData.bankName} onChange={handleChange}
                      className="border border-tally-border px-1 py-0.5 w-1/2 focus:bg-tally-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold w-1/2">A/C Number</label>
                    <input 
                      type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange}
                      className="border border-tally-border px-1 py-0.5 w-1/2 focus:bg-tally-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold w-1/2">IFSC Code</label>
                    <input 
                      type="text" name="bankIfsc" value={formData.bankIfsc} onChange={handleChange}
                      className="border border-tally-border px-1 py-0.5 w-1/2 focus:bg-tally-yellow focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

          <div className="space-y-2 border border-tally-border p-2 mt-4">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Tax Registration Details</h3>
            <div className="flex items-center">
              <label className="w-1/2 text-xs font-semibold text-tally-blue">PAN/IT No.</label>
              <input 
                name="pan" value={formData.pan} onChange={handleChange}
                className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent uppercase" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/2 text-xs font-semibold text-tally-blue">Registration Type</label>
              <select 
                name="registrationType" value={formData.registrationType} onChange={handleChange}
                className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              >
                <option value="Regular">Regular</option>
                <option value="Composition">Composition</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Consumer">Consumer</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="w-1/2 text-xs font-semibold text-tally-blue">GSTIN/UIN</label>
              <input 
                name="gstin" value={formData.gstin} onChange={handleChange}
                className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent uppercase" 
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-10">
            <div className="flex items-center border border-tally-border p-2 bg-[#f0f6fa]">
              <label className="w-1/2 text-sm font-bold text-tally-blue">Opening Balance</label>
              <div className="w-1/2 flex gap-2">
                <input 
                  name="openingBalance" type="number" step="0.01" value={formData.openingBalance} onChange={handleChange}
                  className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent text-right font-bold" 
                  placeholder="0.00"
                />
                <select 
                  name="balanceType" value={formData.balanceType} onChange={handleChange}
                  className="w-1/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent font-bold" 
                >
                  <option value="Dr">Dr</option>
                  <option value="Cr">Cr</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 flex justify-end mt-4 pt-4 border-t border-tally-border">
          <button type="submit" className="bg-tally-blue text-white px-6 py-1.5 text-sm font-bold hover:bg-opacity-90">
            Accept (Ctrl+A)
          </button>
        </div>
      </form>
    </div>
  );
}
