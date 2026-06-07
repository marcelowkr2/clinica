'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'pacientes' | 'agendamentos' | null;
  setSearchType: (type: 'pacientes' | 'agendamentos' | null) => void;
  performSearch: (term: string, type: 'pacientes' | 'agendamentos') => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'pacientes' | 'agendamentos' | null>(null);
  const router = useRouter();

  const performSearch = (term: string, type: 'pacientes' | 'agendamentos') => {
    setSearchTerm(term);
    setSearchType(type);
    
    // Navegar para a página correspondente
    if (type === 'pacientes') {
      router.push('/pacientes');
    } else if (type === 'agendamentos') {
      router.push('/agendamentos');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchType(null);
  };

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchType,
        setSearchType,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}