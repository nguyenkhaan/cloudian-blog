import React from 'react';
import { Button } from '../ui/button';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  isLoading: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  onPageChange,
  hasMore,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 dark:border-border pt-6">
      <Button
        variant="outline"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="px-5 py-2.5 rounded-xl border border-slate-355 dark:border-border text-black dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-none"
      >
        Previous
      </Button>
      <span className="text-sm text-black dark:text-slate-300 font-black">
        Page {currentPage}
      </span>
      <Button
        variant="outline"
        disabled={!hasMore || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-5 py-2.5 rounded-xl border border-slate-355 dark:border-border text-black dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-none"
      >
        Next
      </Button>
    </div>
  );
};
