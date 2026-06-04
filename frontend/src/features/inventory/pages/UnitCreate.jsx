import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';
import { unitAPI } from '../../../services/unitAPI';
import { handleEnterToNextField } from '../../../utils/formNavigation';

export default function UnitCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useStore();
  const [units, setUnits] = useState([]);
  
  const [formData, setFormData] = useState({
    type: 'Simple',
    symbol: '',
    formalName: '',
    uqc: 'Not Applicable',
    numberOfDecimalPlaces: 0
  });

  const fetchUnits = async () => {
    try {
      const res = await unitAPI.getAll();
      setUnits(res.data);
    } catch (err) {
      console.error('Failed to fetch units', err);
    }
  };

  useEffect(() => {
    setPageTitle(id ? 'Unit Alteration' : 'Unit Creation');
    let ignore = false;

    async function loadData() {
      try {
        const res = await unitAPI.getAll();
        if (!ignore) setUnits(res.data);
      } catch (err) {
        if (!ignore) console.error('Failed to fetch units', err);
      }

      if (id) {
        try {
          const res = await unitAPI.getById(id);
          if (!ignore && res.data) setFormData(res.data);
        } catch (err) {
          if (!ignore) console.error('Failed to fetch unit details', err);
        }
      }
    }

    loadData();
    return () => { ignore = true; };
  }, [id, setPageTitle]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await unitAPI.update(id, formData);
      } else {
        await unitAPI.create(formData);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Unit ${id ? 'updated' : 'created'} successfully!`,
        timer: 1500,
        showConfirmButton: false
      });
      if (id) {
        navigate('/inventory/unit/alter');
      } else {
        setFormData({ type: 'Simple', symbol: '', formalName: '', uqc: 'Not Applicable', numberOfDecimalPlaces: 0 });
        fetchUnits();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error!', text: `Failed to ${id ? 'update' : 'create'} unit` });
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex gap-4">
      <div className="w-2/3 bg-white border border-tally-border p-4 shadow-sm">
        <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="space-y-4">
          <div className="max-w-md space-y-2">
            
            <div className="flex items-center justify-between">
              <label className="text-sm w-1/3">Type</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <select 
                  name="type" value={formData.type} onChange={handleChange}
                  className="border border-tally-border bg-transparent px-1 py-0.5 w-1/2 focus:outline-none font-bold"
                >
                  <option value="Simple">Simple</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm w-1/3">Symbol</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="symbol" value={formData.symbol} onChange={handleChange}
                  className="border border-tally-border bg-tally-yellow px-1 py-0.5 w-1/2 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm w-1/3">Formal name</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="formalName" value={formData.formalName} onChange={handleChange}
                  className="border border-tally-border px-1 py-0.5 w-full focus:bg-tally-yellow focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="text-sm w-1/3">Unit Quantity Code (UQC)</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="uqc" value={formData.uqc} onChange={handleChange}
                  className="border border-tally-border px-1 py-0.5 w-full font-bold focus:bg-tally-yellow focus:outline-none"
                  placeholder="e.g. KGS - KILOGRAMS"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="text-sm w-1/3">Number of decimal places</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="number" name="numberOfDecimalPlaces" value={formData.numberOfDecimalPlaces} onChange={handleChange}
                  className="border border-tally-border bg-transparent px-1 py-0.5 w-1/4 font-bold focus:bg-tally-yellow focus:outline-none"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-start pl-[33%]">
            <button type="submit" className="bg-tally-blue text-white px-6 py-1 text-sm font-bold shadow hover:bg-opacity-90">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Right Sidebar List */}
      <div className="w-1/3 bg-white border border-tally-border p-2">
        <h3 className="font-bold text-tally-blue bg-tally-light-blue px-2 py-1 mb-2 border border-tally-border text-center uppercase tracking-wider">
          List of Units
        </h3>
        <ul className="space-y-1 max-h-[80vh] overflow-y-auto">
          {units.length > 0 ? units.map(u => (
            <li key={u.id} className="text-sm px-2 py-1 hover:bg-tally-yellow border-b border-gray-100 last:border-0 cursor-pointer flex justify-between" onClick={() => navigate(`/inventory/unit/edit/${u.id}`)}>
              <span className="font-bold">{u.symbol}</span>
              <span className="text-gray-500 text-xs">{u.formalName}</span>
            </li>
          )) : (
            <li className="text-sm px-2 text-gray-500 italic">No units found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
