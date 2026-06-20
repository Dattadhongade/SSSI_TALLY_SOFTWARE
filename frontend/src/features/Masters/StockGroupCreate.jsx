import { useState, useEffect, useRef } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/API';
import Swal from 'sweetalert2';
import { handleEnterToNextField } from '../../utils/formNavigation';

export default function StockGroupCreate() {
  const { setPageTitle } = useStore();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    parentGroupId: ''
  });

  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/stock-groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setPageTitle('Stock Group Creation');
      fetchGroups();
    }, 0);
  }, [setPageTitle]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock-groups', formData);
      Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'Stock Group created successfully!',
        timer: 1500,
        showConfirmButton: false
      });
      setFormData({ name: '', alias: '', parentGroupId: '' });
      fetchGroups();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save Stock Group', 'error');
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4">
      <div className="max-w-2xl mx-auto bg-white border border-tally-border shadow-sm">
        <div className="bg-[#f0f6fa] border-b border-tally-border px-4 py-2 font-bold text-tally-blue flex justify-between">
          <span>Stock Group Creation</span>
          <span className="text-xs text-gray-500">Inventory Master</span>
        </div>
        
        <form ref={formRef} onKeyDown={handleEnterToNextField} onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center mb-4">
            <label className="w-48 text-sm font-bold text-tally-blue">Name <span className="text-red-500">*</span></label>
            <span className="mx-2 text-tally-blue font-bold">:</span>
            <input
              autoFocus
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none font-bold"
            />
          </div>

          <div className="flex items-center mb-6">
            <label className="w-48 text-sm text-tally-blue italic">(Alias)</label>
            <span className="mx-2 text-tally-blue font-bold">:</span>
            <input
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none italic"
            />
          </div>

          <div className="flex items-center mb-4">
            <label className="w-48 text-sm font-bold text-tally-blue">Under</label>
            <span className="mx-2 text-tally-blue font-bold">:</span>
            <select
              name="parentGroupId"
              value={formData.parentGroupId}
              onChange={handleChange}
              className="flex-1 border border-tally-border px-1 focus:bg-tally-yellow outline-none uppercase font-bold text-sm"
            >
              <option value="">-- Primary --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="text-right mt-10 border-t border-tally-border pt-4">
            <button
              type="submit"
              className="bg-tally-blue text-white px-8 py-2 text-sm font-bold shadow hover:bg-opacity-90"
            >
              Accept
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
