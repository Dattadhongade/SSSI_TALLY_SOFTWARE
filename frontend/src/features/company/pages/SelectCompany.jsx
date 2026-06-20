import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';

export default function SelectCompany() {
  const [companyRows, setCompanyRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, logout, selectCompany } = useStore();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/companies', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Flatten companies and their financial years into selectable rows
        const rows = [];
        res.data.forEach(c => {
          if (c.FinancialYears && c.FinancialYears.length > 0) {
            c.FinancialYears.forEach(fy => {
              rows.push({
                company: c,
                financialYear: fy,
                id: `${c.id}-${fy.id}`
              });
            });
          } else {
            // Company with no FY yet (edge case)
            rows.push({
              company: c,
              financialYear: null,
              id: `${c.id}-0`
            });
          }
        });
        
        if (rows.length === 0) {
          navigate('/company/create'); // Auto redirect if none found
          return;
        }

        setCompanyRows(rows);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to fetch companies', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [token, navigate]);

  const handleSelect = (row) => {
    selectCompany(row.company, row.financialYear);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading companies...</div>;

  return (
    <div className="bg-tally-light-blue min-h-screen flex items-center justify-center font-sans">
      <div className="bg-white border border-tally-border shadow-lg w-[600px]">
        <div className="bg-tally-blue text-white px-4 py-2 font-bold text-center">
          Gateway of SSSI - Select Company
        </div>
        <div className="flex bg-[#fcf8e3] text-tally-blue font-bold px-4 py-1 text-xs border-b border-tally-border">
          <div className="flex-1">Name of Company</div>
          <div className="w-48 text-right">Financial Year</div>
        </div>
        <div className="h-[300px] overflow-y-auto bg-white">
          {companyRows.length === 0 ? (
            <div className="text-center text-tally-dark py-10">
              No Companies Found. Please create one.
            </div>
          ) : (
            <ul className="">
              {companyRows.map(row => (
                <li key={row.id}>
                  <button
                    onClick={() => handleSelect(row)}
                    className="w-full text-left px-4 py-1.5 hover:bg-tally-yellow hover:text-tally-dark font-semibold transition-colors border-b border-gray-100 flex justify-between text-sm"
                  >
                    <span className="flex-1 uppercase">{row.company.name}</span>
                    <span className="w-48 text-right text-gray-600 font-medium">
                      {row.financialYear ? `${row.financialYear.start_date} to ${row.financialYear.end_date}` : 'No FY'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-tally-border flex justify-between">
          <Link 
            to="/company/create" 
            className="text-sm font-bold text-tally-blue hover:underline"
          >
            Create Company (F3)
          </Link>
          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
