import { useEffect, useState } from 'react';

export function useLocalToggle(key: string) {
  const [items, setItems] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(stored) ? stored.filter((value) => typeof value === 'string') : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [key, items]);

  const toggle = (id: string) => setItems((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return [items, toggle] as const;
}
