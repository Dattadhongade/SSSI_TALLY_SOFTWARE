import { useEffect } from 'react';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Calculator, Settings, Calendar } from 'lucide-react';

export default function PayrollLanding() {
  const { setPageTitle } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle('Payroll Management');
  }, [setPageTitle]);

  const cards = [
    { title: 'Employee Master', desc: 'Create and alter employee details', icon: Users, path: '/payroll/employee/create', color: 'bg-blue-100 text-blue-600' },
    { title: 'Attendance', desc: 'Mark employee attendance and leaves', icon: Calendar, path: '/payroll/attendance', color: 'bg-green-100 text-green-600' },
    { title: 'Payroll Vouchers', desc: 'Process salaries and generate slips', icon: FileText, path: '/vouchers/payroll', color: 'bg-purple-100 text-purple-600' },
    { title: 'Pay Heads', desc: 'Configure Earnings and Deductions', icon: Calculator, path: '/payroll/payheads', color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Payroll Settings', desc: 'PF, ESI, and Tax configurations', icon: Settings, path: '/payroll/settings', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="bg-tally-bg text-tally-dark min-h-full font-sans p-6">
      <div className="bg-white border border-tally-border shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-tally-blue">Payroll Module</h2>
        <p className="text-gray-600 mt-2">Manage employee records, process payroll, and generate payslips efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            className="bg-white border border-tally-border shadow-sm p-6 hover:shadow-md cursor-pointer transition-shadow hover:border-tally-blue group rounded-lg flex flex-col items-center text-center"
          >
            <div className={`p-4 rounded-full mb-4 ${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon size={32} />
            </div>
            <h3 className="text-lg font-bold text-tally-dark">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{card.desc}</p>
            <button className="mt-4 px-4 py-1.5 border border-tally-blue text-tally-blue rounded text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Access Module
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
