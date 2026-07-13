import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';
import api from '../../../services/API';
import { stockItemAPI } from '../../../services/stockItemAPI';
import { handleEnterToNextField } from '../../../utils/formNavigation';
import TallySelect from '../../../components/common/TallySelect';

export default function StockItemCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setPageTitle } = useStore();
  
  const restoredState = location.state?.itemState;

  const [formData, setFormData] = useState(restoredState || {
    name: '',
    alias: '',
    description: '',
    stockGroupId: '', // dropdown
    unitId: '', // dropdown
    hsnSac: '',
    gstRate: '',
    openingQuantity: '',
    openingRate: '',
    openingValue: ''
  });

  const [units, setUnits] = useState([]);
  const [stockGroups, setStockGroups] = useState([]);

  useEffect(() => {
    setPageTitle(id ? 'Stock Item Alteration' : 'Stock Item Creation');
    let ignore = false;

    async function fetchData() {
      try {
        const [unitsRes, groupsRes] = await Promise.all([
          api.get('/units'),
          api.get('/stock-groups')
        ]);
        if (!ignore) {
          setUnits([{ id: '', name: 'Not Applicable' }, ...unitsRes.data.map(u => ({
            id: String(u.id),
            name: `${u.symbol} ${u.formalName ? '(' + u.formalName + ')' : ''}`.trim()
          }))]);
          
          setStockGroups([{ id: '', name: 'Primary' }, ...groupsRes.data.map(g => ({
            id: String(g.id),
            name: g.name
          }))]);
        }

        if (id) {
          const res = await stockItemAPI.getById(id);
          if (!ignore && res.data) setFormData(res.data);
        }
      } catch (err) {
        if (!ignore) console.error('Failed to fetch data', err);
      }
    }

    fetchData();

    return () => { ignore = true; };
  }, [id, setPageTitle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (location.state?.returnTo) {
          navigate(location.state.returnTo, { state: { voucherState: location.state.voucherState, focusField: location.state.focusField } });
        } else {
          navigate(id ? '/inventory/item/alter' : '/');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === 'CREATE') {
      if (name === 'stockGroupId') {
        navigate('/inventory/group/create', { state: { returnTo: location.pathname, itemState: formData }});
        return;
      }
      if (name === 'unitId') {
        navigate('/inventory/unit/create', { state: { returnTo: location.pathname, itemState: formData }});
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await stockItemAPI.update(id, formData);
      } else {
        await stockItemAPI.create(formData);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Stock Item ${id ? 'updated' : 'created'} successfully!`,
        timer: 1500,
        showConfirmButton: false
      });
      if (location.state?.returnTo) {
        navigate(location.state.returnTo, { state: { voucherState: location.state.voucherState, focusField: location.state.focusField } });
      } else {
        navigate(id ? '/inventory/item/alter' : '/');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${id ? 'update' : 'create'} stock item`
      });
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans">

      <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="p-4 max-w-3xl">
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
            <div className="flex items-start mt-2">
              <label className="w-1/3 text-xs font-semibold text-tally-blue pt-1">Description</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows="2"
                className="w-2/3 border border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent resize-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-tally-border">
            <div className="space-y-2">
              <div className="flex items-center">
                <label className="w-1/2 text-xs font-semibold text-tally-blue">Under</label>
                <TallySelect 
                  name="stockGroupId" value={formData.stockGroupId} onChange={handleChange}
                  options={stockGroups}
                  createOption={{ label: "Create New Group..." }}
                  placeholder="Primary"
                  className="w-1/2 border-b border-tally-border px-1 py-0.5 text-sm" 
                />
              </div>
              <div className="flex items-center mt-2">
                <label className="w-1/2 text-xs font-semibold text-tally-blue">Units</label>
                <TallySelect 
                  name="unitId" value={formData.unitId} onChange={handleChange}
                  options={units}
                  createOption={{ label: "Create New Unit..." }}
                  placeholder="Not Applicable"
                  className="w-1/2 border-b border-tally-border px-1 py-0.5 text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2 border border-tally-border p-2">
              <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Statutory Details</h3>
              <div className="flex items-center">
                <label className="w-1/2 text-xs font-semibold text-tally-blue">HSN/SAC</label>
                <input 
                  name="hsnSac" value={formData.hsnSac} onChange={handleChange}
                  className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
                />
              </div>
              <div className="flex items-center">
                <label className="w-1/2 text-xs font-semibold text-tally-blue">GST Rate (%)</label>
                <input 
                  name="gstRate" type="number" step="0.1" value={formData.gstRate} onChange={handleChange}
                  className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
                  placeholder="e.g. 18.0"
                />
              </div>
            </div>
          </div>

          <div className="pt-8">
            <h3 className="text-xs font-bold text-tally-blue uppercase border-b border-tally-border pb-1 mb-2">Opening Balance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-tally-blue mb-1">Quantity</label>
                <input 
                  name="openingQuantity" type="number" step="1" value={formData.openingQuantity} onChange={handleChange}
                  className="border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent text-right" 
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-tally-blue mb-1">Rate</label>
                <input 
                  name="openingRate" type="number" step="0.01" value={formData.openingRate} onChange={handleChange}
                  className="border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent text-right" 
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-tally-blue mb-1">Value</label>
                <input 
                  name="openingValue" type="number" step="0.01" value={formData.openingValue} onChange={handleChange}
                  className="border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent text-right font-bold" 
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-tally-border">
          <button type="submit" className="bg-tally-blue text-white px-6 py-1.5 text-sm font-bold hover:bg-opacity-90">
            Accept (Ctrl+A)
          </button>
        </div>
      </form>
    </div>
  );
}
