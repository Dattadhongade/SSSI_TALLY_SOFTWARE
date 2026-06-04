import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Search, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/API';

export default function AlterList({ title, endpoint, editPathPrefix, displayField, secondaryField }) {
  const { setPageTitle } = useStore();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPageTitle(`Alter ${title}`);
    let ignore = false;

    async function fetchItems() {
      try {
        const url = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
        const res = await api.get(url);
        if (!ignore) {
          setItems(res.data);
        }
      } catch (err) {
        if (!ignore) console.error(`Failed to fetch ${title}`, err);
      }
    }

    fetchItems();
    return () => { ignore = true; };
  }, [setPageTitle, title, endpoint]);

  const filteredItems = items.filter(item => 
    (item[displayField] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (secondaryField && (item[secondaryField] || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const url = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
        await api.delete(`${url}/${id}`);
        setItems(items.filter(item => item.id !== id));
        Swal.fire('Deleted!', `${title} has been deleted.`, 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete', 'error');
      }
    }
  };

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-4 flex justify-center">
      <div className="w-full max-w-2xl bg-white border border-tally-border shadow-sm flex flex-col h-[80vh]">
        
        <div className="bg-tally-blue text-white p-2 flex justify-between items-center font-bold text-sm">
          <span>List of {title}s</span>
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1 bg-white text-black text-xs rounded focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredItems.map(item => (
                <li 
                  key={item.id} 
                  className="px-4 py-2 hover:bg-tally-yellow cursor-pointer flex justify-between items-center transition-colors group"
                  onClick={() => navigate(`${editPathPrefix}/${item.id}`)}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{item[displayField]}</span>
                    {secondaryField && item[secondaryField] && (
                      <span className="text-xs text-gray-500 italic">{item[secondaryField]}</span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, item.id, item[displayField])}
                    className="text-red-500 hover:text-red-700 transition-opacity p-1"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 italic text-sm">
              No {title.toLowerCase()} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
