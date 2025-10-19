import React from 'react';
import { ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5); // Limit to 5 pages for simplicity

  const handleNext = () => {
    if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            currentPage === page
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      {totalPages > 5 && (
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <span>Siguiente</span>
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );
};

export default Pagination;
