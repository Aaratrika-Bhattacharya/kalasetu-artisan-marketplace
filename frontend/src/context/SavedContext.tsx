import { createContext, useContext, type ReactNode } from 'react';
import { useLocalToggle } from './useLocalToggle';

const SavedContext = createContext<{
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  following: string[];
  toggleFollow: (id: string) => void;
}>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [wishlist, toggleWishlist] = useLocalToggle('kalasetu_wishlist');
  const [following, toggleFollow] = useLocalToggle('kalasetu_following');
  return <SavedContext.Provider value={{ wishlist, toggleWishlist, following, toggleFollow }}>{children}</SavedContext.Provider>;
}

export const useSaved = () => useContext(SavedContext);
