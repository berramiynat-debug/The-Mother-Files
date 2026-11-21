import { createContext, useContext } from 'react';

export const ArchiveContext = createContext(null);
export function useArchive() {
  return useContext(ArchiveContext);
}
