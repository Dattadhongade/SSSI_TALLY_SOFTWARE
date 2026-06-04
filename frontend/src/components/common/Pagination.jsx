import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-tally-border bg-white px-4 py-2 text-xs">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded border border-tally-border bg-white px-3 py-1 text-xs font-medium text-tally-dark hover:bg-tally-bg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded border border-tally-border bg-white px-3 py-1 text-xs font-medium text-tally-dark hover:bg-tally-bg disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-tally-dark opacity-80">
            Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-bold">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-1 text-gray-500 border border-tally-border hover:bg-tally-bg focus:z-20 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-3 py-1 text-xs font-semibold border ${
                  currentPage === page
                    ? 'z-10 bg-tally-blue text-white border-tally-blue'
                    : 'text-tally-dark border-tally-border hover:bg-tally-bg'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-1 text-gray-500 border border-tally-border hover:bg-tally-bg focus:z-20 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
