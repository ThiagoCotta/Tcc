import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OngoingSearch {
  id: string;
  type: 'pc-builder' | 'quick-search' | 'game-ai' | 'component-based';
  title: string;
  subtitle?: string;
  startTime: number;
  data?: any;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
}

interface SearchContextType {
  ongoingSearches: OngoingSearch[];
  addSearch: (search: Omit<OngoingSearch, 'id' | 'startTime'>) => string;
  completeSearch: (id: string, result: any) => void;
  errorSearch: (id: string, error: any) => void;
  removeSearch: (id: string) => void;
  getSearchById: (id: string) => OngoingSearch | undefined;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [ongoingSearches, setOngoingSearches] = useState<OngoingSearch[]>([]);

  // Carregar buscas em andamento do localStorage na inicialização
  useEffect(() => {
    const saved = localStorage.getItem('ongoing-searches');
    if (saved) {
      try {
        const searches = JSON.parse(saved);
        setOngoingSearches(searches);
      } catch (error) {
        console.error('Erro ao carregar buscas em andamento:', error);
      }
    }
  }, []);

  // Salvar buscas em andamento no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('ongoing-searches', JSON.stringify(ongoingSearches));
  }, [ongoingSearches]);

  const addSearch = (search: Omit<OngoingSearch, 'id' | 'startTime'>): string => {
    const id = `search-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newSearch: OngoingSearch = {
      ...search,
      id,
      startTime: Date.now(),
    };
    
    setOngoingSearches(prev => [...prev, newSearch]);
    return id;
  };

  const completeSearch = (id: string, result: any) => {
    setOngoingSearches(prev => {
      const updated = prev.map(search => 
        search.id === id 
          ? { ...search, data: result }
          : search
      );
      
      // Executar callback de sucesso
      const search = updated.find(s => s.id === id);
      if (search?.onComplete) {
        search.onComplete(result);
      }
      
      return updated;
    });
  };

  const errorSearch = (id: string, error: any) => {
    setOngoingSearches(prev => {
      const updated = prev.map(search => 
        search.id === id 
          ? { ...search, data: { error } }
          : search
      );
      
      // Executar callback de erro
      const search = updated.find(s => s.id === id);
      if (search?.onError) {
        search.onError(error);
      }
      
      return updated;
    });
  };

  const removeSearch = (id: string) => {
    setOngoingSearches(prev => prev.filter(search => search.id !== id));
  };

  const getSearchById = (id: string): OngoingSearch | undefined => {
    return ongoingSearches.find(search => search.id === id);
  };

  return (
    <SearchContext.Provider value={{
      ongoingSearches,
      addSearch,
      completeSearch,
      errorSearch,
      removeSearch,
      getSearchById,
    }}>
      {children}
    </SearchContext.Provider>
  );
};
