import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useStore from '../../../store/useStore';
import { handleEnterToNextField } from '../../../utils/formNavigation';

export default function CompanyCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    mailingName: '',
    address: '',
    state: '',
    country: 'India',
    pincode: '',
    telephone: '',
    mobile: '',
    fax: '',
    email: '',
    website: '',
    pan: '',
    cin: '',
    financialYearStart: '2026-04-01',
    booksBeginningFrom: '2026-04-01',
    baseCurrencySymbol: '₹',
    formalName: 'INR',
    logo: ''
  });

  useEffect(() => {
    setPageTitle(id ? 'Company Alteration' : 'Company Creation');
    let ignore = false;

    async function fetchCompany() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/companies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!ignore && res.data) {
          setFormData({
            ...res.data,
            financialYearStart: res.data.financialYearStart?.split('T')[0],
            booksBeginningFrom: res.data.booksBeginningFrom?.split('T')[0],
          });
        }
      } catch (err) {
        if (!ignore) console.error('Failed to fetch company details', err);
      }
    }

    if (id) fetchCompany();

    return () => { ignore = true; };
  }, [id, setPageTitle]);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = id ? `http://localhost:5000/api/companies/${id}` : 'http://localhost:5000/api/companies';
      const method = id ? 'put' : 'post';
      
      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { selectedCompany, selectCompany, selectedFinancialYear } = useStore.getState();
      if (id && selectedCompany && selectedCompany.id === Number(id)) {
        // Update the global state with the new company details (including logo)
        selectCompany({ ...selectedCompany, ...formData }, selectedFinancialYear);
      }

      Swal.fire({ 
        icon: 'success', 
        title: id ? 'Company Updated' : 'Company Created', 
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 3000 
      });
      
      if (!id) {
        navigate(`/company/gst/${res.data.company.id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', `Failed to ${id ? 'update' : 'create'} company`, 'error');
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans">
      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="p-4 grid grid-cols-2 gap-8 max-w-5xl">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="w-1/3 text-xs font-semibold text-tally-blue">Company Name</label>
            <input 
              name="name" value={formData.name} onChange={handleChange} required minLength={3} maxLength={100}
              className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
            />
          </div>
          <div className="flex items-center">
            <label className="w-1/3 text-xs font-semibold text-tally-blue">Mailing Name</label>
            <input 
              name="mailingName" value={formData.mailingName} onChange={handleChange}
              className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
            />
          </div>
          <div className="flex items-start mt-2">
            <label className="w-1/3 text-xs font-semibold text-tally-blue pt-1">Address</label>
            <textarea 
              name="address" value={formData.address} onChange={handleChange} rows="3" maxLength={255}
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
              name="pincode" value={formData.pincode} onChange={handleChange} pattern="[0-9]{6}" title="6 digit PIN code" maxLength={6}
              className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
            />
          </div>

          <div className="space-y-2 border border-tally-border p-2 mt-4">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Registration Details</h3>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">PAN No.</label>
              <input 
                name="pan" value={formData.pan} onChange={handleChange} maxLength={10} placeholder="ABCDE1234F"
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent uppercase" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">CIN</label>
              <input 
                name="cin" value={formData.cin} onChange={handleChange} maxLength={21} placeholder="L12345MH2026PTC123456"
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent uppercase" 
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2 border border-tally-border p-2">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Company Branding</h3>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Company Logo</label>
              <input 
                type="file" accept="image/*" onChange={handleLogoUpload}
                className="w-2/3 focus:outline-none px-1 py-0.5 text-xs text-gray-600" 
              />
            </div>
          </div>

          <div className="space-y-2 border border-tally-border p-2">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Contact Details</h3>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Telephone No.</label>
              <input 
                name="telephone" value={formData.telephone} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Mobile No.</label>
              <input 
                name="mobile" value={formData.mobile} onChange={handleChange} pattern="[0-9]{10}" title="10 digit Mobile Number" maxLength={10}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Fax No.</label>
              <input 
                name="fax" value={formData.fax} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">E-mail</label>
              <input 
                name="email" type="email" value={formData.email} onChange={handleChange}
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-xs font-semibold text-tally-blue">Website</label>
              <input 
                name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://example.com"
                className="w-2/3 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
          </div>

          <div className="space-y-2 border border-tally-border p-2 mt-4">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Books and Financial Year Details</h3>
            <div className="flex items-center">
              <label className="w-1/2 text-xs font-semibold text-tally-blue">Financial Year begins from</label>
              <input 
                name="financialYearStart" type="date" value={formData.financialYearStart} onChange={handleChange} required
                className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/2 text-xs font-semibold text-tally-blue">Books beginning from</label>
              <input 
                name="booksBeginningFrom" type="date" value={formData.booksBeginningFrom} onChange={handleChange} required
                className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
              />
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
