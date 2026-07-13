import { 
  LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function ReconciliationCharts() {
  // Mock Data for charts
  const trendData = [
    { name: 'Jan', balance: 4000, reconciled: 2400 },
    { name: 'Feb', balance: 3000, reconciled: 1398 },
    { name: 'Mar', balance: 2000, reconciled: 9800 },
    { name: 'Apr', balance: 2780, reconciled: 3908 },
    { name: 'May', balance: 1890, reconciled: 4800 },
    { name: 'Jun', balance: 2390, reconciled: 3800 },
  ];

  const pieData = [
    { name: 'Reconciled', value: 400 },
    { name: 'Pending', value: 300 },
    { name: 'Unmatched', value: 100 },
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Line Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-2">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Reconciliation Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} />
              <YAxis tick={{fontSize: 12, fill: '#6b7280'}} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Bank Balance" activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="reconciled" stroke="#10b981" strokeWidth={2} name="Reconciled Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Status Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
