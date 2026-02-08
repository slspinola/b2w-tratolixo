import { createContext, useContext, useState, type ReactNode } from 'react';

export interface FilterState {
  municipio: string | null;
  periodo: 'mes' | 'ytd' | 'trimestre' | 'ano';
  turno: 'manha' | 'tarde' | 'noite' | null;
}

interface FilterContextValue {
  filters: FilterState;
  setMunicipio: (m: string | null) => void;
  setPeriodo: (p: FilterState['periodo']) => void;
  setTurno: (t: FilterState['turno']) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

const defaultFilters: FilterState = {
  municipio: null,
  periodo: 'mes',
  turno: null,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setMunicipio = (m: string | null) =>
    setFilters((prev) => ({ ...prev, municipio: m }));

  const setPeriodo = (p: FilterState['periodo']) =>
    setFilters((prev) => ({ ...prev, periodo: p }));

  const setTurno = (t: FilterState['turno']) =>
    setFilters((prev) => ({ ...prev, turno: t }));

  return (
    <FilterContext.Provider value={{ filters, setMunicipio, setPeriodo, setTurno }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return ctx;
}
