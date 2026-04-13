import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  itemsPerPage?: number;
}

export function usePagination<T>(items: T[], options: UsePaginationOptions = {}) {
  const { itemsPerPage = 20 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginated = useMemo(
    () => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [items, currentPage, itemsPerPage]
  );

  const resetPage = useCallback(() => setCurrentPage(1), []);
  const nextPage = useCallback(
    () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );
  const prevPage = useCallback(() => setCurrentPage((p) => Math.max(p - 1, 1)), []);

  return {
    currentPage,
    totalPages,
    paginated,
    setCurrentPage,
    resetPage,
    nextPage,
    prevPage,
    totalItems: items.length,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, items.length),
  };
}
