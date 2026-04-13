import { useState, useCallback } from 'react';

export function useSelection<T extends { id: string }>(paginated: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === paginated.length ? new Set() : new Set(paginated.map((item) => item.id))
    );
  }, [paginated]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isAllSelected = paginated.length > 0 && selected.size === paginated.length;

  return { selected, toggle, toggleAll, clear, isAllSelected };
}
