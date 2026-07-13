import { 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calculator
} from 'lucide-react';

export default function SummaryCards({ 
  bankBalance = 0, 
  bookBalance = 0, 
  reconciledCount = 0, 
  pendingCount = 0, 
  unmatchedCount = 0 
}) {
  const differenceAmount = Math.abs(bankBalance - bookBalance);
  const isBalanced = differenceAmount === 0;

  const formatAmount = (amount) => `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cards = [
    { title: 'Total Bank Balance', amount: formatAmount(bankBalance), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'Book Balance', amount: formatAmount(bookBalance), icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { title: 'Difference Amount', amount: formatAmount(differenceAmount), icon: Calculator, color: isBalanced ? 'text-green-600' : 'text-red-600', bg: isBalanced ? 'bg-green-50' : 'bg-red-50', border: isBalanced ? 'border-green-200' : 'border-red-200' },
    { title: 'Reconciled', count: reconciledCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', isCount: true },
    { title: 'Pending', count: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', isCount: true },
    { title: 'Unmatched', count: unmatchedCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', isCount: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`rounded-xl border ${card.border} bg-white p-3 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-3`}>
            <div className={`p-2.5 rounded-full shrink-0 ${card.bg} ${card.color}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight mb-0.5">{card.title}</p>
              <p className={`text-sm md:text-base font-bold truncate ${card.color}`}>
                {card.isCount ? card.count : card.amount}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
