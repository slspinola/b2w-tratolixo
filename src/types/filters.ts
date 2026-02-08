export interface FilterState {
  municipio: string | null;
  periodo: 'mes' | 'ytd' | 'trimestre' | 'ano';
  periodoCustom?: { inicio: Date; fim: Date };
  turno?: 'manha' | 'tarde' | 'noite' | null;
  rota?: string | null;
  freguesia?: string | null;
  equipa?: string | null;
  data?: Date;
}

export const defaultFilters: FilterState = {
  municipio: null,
  periodo: 'mes',
  turno: null,
  rota: null,
  freguesia: null,
  equipa: null,
  data: new Date(),
};
