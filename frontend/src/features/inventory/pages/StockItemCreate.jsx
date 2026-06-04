import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';
import { stockItemAPI } from '../../../services/stockItemAPI';
import { handleEnterToNextField } from '../../../utils/formNavigation';

export default function StockItemCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useStore();
  
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    setPageTitle(id ? 'Stock Item Alteration' : 'Stock Item Creation');
    let ignore = false;

    async function fetchStockItem() {
      try {
        const res = await stockItemAPI.getById(id);
        if (!ignore && res.data) setFormData(res.data);
      } catch (err) {
        if (!ignore) console.error('Failed to fetch stock item details', err);
      }
    }

    if (id) fetchStockItem();

    return () => { ignore = true; };
  }, [id, setPageTitle]);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      navigate(id ? '/inventory/item/alter' : '/');
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
                <select 
                  name="stockGroupId" value={formData.stockGroupId} onChange={handleChange}
                  className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
                >
                  <option value="">Primary</option>
                  <option value="1">Raw Materials</option>
                  <option value="2">Finished Goods</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-1/2 text-xs font-semibold text-tally-blue">Units</label>
                <select 
                  name="unitId" value={formData.unitId} onChange={handleChange}
                  className="w-1/2 border-b border-tally-border focus:outline-none focus:border-tally-yellow px-1 py-0.5 text-sm bg-transparent" 
                >
                  <option value="">Not Applicable</option>
                  <option value="1">PCS (Pieces)</option>
                  <option value="2">KG (Kilograms)</option>
                </select>
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
