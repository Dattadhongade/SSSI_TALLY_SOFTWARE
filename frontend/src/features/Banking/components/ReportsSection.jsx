import { FileText, ChevronRight } from 'lucide-react';

export default function ReportsSection() {
  const reports = [
    { title: 'Bank Reconciliation Statement (BRS)', desc: 'View complete BRS as on date' },
    { title: 'Pending Cheques Report', desc: 'Cheques issued but not presented' },
    { title: 'Cleared Transactions', desc: 'List of all matched entries' },
    { title: 'Unmatched Voucher Entries', desc: 'Book entries missing in bank' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-6">
      <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
        <FileText size={18} className="text-blue-600" />
        Quick Reports
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report, idx) => (
          <div 
            key={idx} 
            className="group border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 p-3 rounded-lg cursor-pointer transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {report.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{report.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
