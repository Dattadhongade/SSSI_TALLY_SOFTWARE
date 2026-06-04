import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';
import { currencyAPI } from '../../../services/currencyAPI';
import { handleEnterToNextField } from '../../../utils/formNavigation';

export default function CurrencyCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useStore();
  const [currencies, setCurrencies] = useState([]);
  
  const [formData, setFormData] = useState({
    symbol: '',
    formalName: '',
    isoCode: '',
    decimalPlaces: 2,
    showInMillions: false,
    suffixSymbol: false,
    spaceBeforeSymbol: false,
    wordForDecimal: '',
    decimalPlacesForWords: 2
  });

  useEffect(() => {
    setPageTitle(id ? 'Currency Alteration' : 'Currency Creation');
    let ignore = false;

    async function fetchCurrencies() {
      try {
        const res = await currencyAPI.getAll();
        if (!ignore) setCurrencies(res.data);
      } catch (err) {
        if (!ignore) console.error('Failed to fetch currencies', err);
      }
    }

    async function fetchCurrency() {
      try {
        const res = await currencyAPI.getById(id);
        if (!ignore && res.data) setFormData(res.data);
      } catch (err) {
        if (!ignore) console.error('Failed to fetch currency details', err);
      }
    }

    fetchCurrencies();
    if (id) fetchCurrency();

    return () => { ignore = true; };
  }, [id, setPageTitle]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' || type === 'select-one' && (value === 'Yes' || value === 'No') 
        ? (value === 'Yes') 
        : value 
    });
  };

  const fetchCurrencies = async () => {
    try {
      const res = await currencyAPI.getAll();
      setCurrencies(res.data);
    } catch (err) {
      console.error('Failed to fetch currencies', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await currencyAPI.update(id, formData);
      } else {
        await currencyAPI.create(formData);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Currency ${id ? 'updated' : 'created'} successfully!`,
        timer: 1500,
        showConfirmButton: false
      });
      if (id) {
        navigate('/masters/currency/alter');
      } else {
        setFormData({
          symbol: '', formalName: '', isoCode: '', decimalPlaces: 2,
          showInMillions: false, suffixSymbol: false, spaceBeforeSymbol: false,
          wordForDecimal: '', decimalPlacesForWords: 2
        });
        fetchCurrencies(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to ${id ? 'update' : 'create'} currency`
      });
    }
  };

  // Helper for Yes/No dropdowns
  const renderYesNoSelect = (label, name) => (
    <div className="flex items-center justify-between">
      <label className="text-sm w-2/3">{label}</label>
      <div className="w-1/3 flex items-center">
        <span className="mr-2">:</span>
        <select 
          name={name}
          value={formData[name] ? 'Yes' : 'No'}
          onChange={(e) => setFormData({...formData, [name]: e.target.value === 'Yes'})}
          className="border border-tally-border bg-tally-yellow px-1 w-full focus:outline-none text-sm font-bold"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex gap-4">
      <div className="w-2/3 bg-white border border-tally-border p-4 shadow-sm">
        <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField} className="space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-xl">
            {/* Field Set */}
            <div className="flex items-center justify-between col-span-2">
              <label className="text-sm w-1/3">Symbol</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="symbol" value={formData.symbol} onChange={handleChange}
                  className="border border-tally-border bg-tally-yellow px-1 py-0.5 w-full focus:outline-none font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between col-span-2 mt-2">
              <label className="text-sm w-1/3">Formal name</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="formalName" value={formData.formalName} onChange={handleChange}
                  className="border border-tally-border px-1 py-0.5 w-full focus:bg-tally-yellow focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between col-span-2">
              <label className="text-sm w-1/3">ISO Currency Code</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="isoCode" value={formData.isoCode} onChange={handleChange}
                  className="border border-tally-border px-1 py-0.5 w-full focus:bg-tally-yellow focus:outline-none"
                />
              </div>
            </div>

            <div className="col-span-2 my-2 border-b border-gray-200"></div>

            <div className="flex items-center justify-between col-span-2">
              <label className="text-sm w-2/3">Number of decimal places</label>
              <div className="w-1/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="number" name="decimalPlaces" value={formData.decimalPlaces} onChange={handleChange}
                  className="border border-tally-border bg-transparent px-1 py-0.5 w-full focus:bg-tally-yellow focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="col-span-2">{renderYesNoSelect('Show amount in millions', 'showInMillions')}</div>
            
            <div className="col-span-2 mt-4">{renderYesNoSelect('Suffix symbol to amount', 'suffixSymbol')}</div>
            <div className="col-span-2">{renderYesNoSelect('Add space between amount and symbol', 'spaceBeforeSymbol')}</div>

            <div className="col-span-2 my-2 border-b border-gray-200"></div>

            <div className="flex items-center justify-between col-span-2">
              <label className="text-sm w-1/3">Word representing amount after decimal</label>
              <div className="w-2/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="text" name="wordForDecimal" value={formData.wordForDecimal} onChange={handleChange}
                  className="border border-tally-border px-1 py-0.5 w-full focus:bg-tally-yellow focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between col-span-2">
              <label className="text-sm w-2/3">No. of decimal places for amount in words</label>
              <div className="w-1/3 flex items-center">
                <span className="mr-2">:</span>
                <input 
                  type="number" name="decimalPlacesForWords" value={formData.decimalPlacesForWords} onChange={handleChange}
                  className="border border-tally-border bg-transparent px-1 py-0.5 w-full focus:bg-tally-yellow focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-tally-blue text-white px-6 py-1 text-sm font-bold shadow hover:bg-opacity-90">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Right Sidebar List */}
      <div className="w-1/3 bg-white border border-tally-border p-2">
        <h3 className="font-bold text-tally-blue bg-tally-light-blue px-2 py-1 mb-2 border border-tally-border text-center uppercase tracking-wider">
          List of Currencies
        </h3>
        <ul className="space-y-1 max-h-[80vh] overflow-y-auto">
          {currencies.length > 0 ? currencies.map(c => (
            <li key={c.id} className="text-sm px-2 py-1 hover:bg-tally-yellow border-b border-gray-100 last:border-0 cursor-pointer" onClick={() => navigate(`/masters/currency/edit/${c.id}`)}>
              <span className="font-bold mr-2">{c.symbol}</span> 
              {c.formalName && <span className="text-gray-600">- {c.formalName}</span>}
            </li>
          )) : (
            <li className="text-sm px-2 text-gray-500 italic">No currencies found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
