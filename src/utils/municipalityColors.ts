export const municipalityColors: Record<string, string> = {
  'Cascais': '#3B82F6',
  'Sintra': '#22C55E',
  'Oeiras': '#F59E0B',
  'Mafra': '#8B5CF6',
};

export const municipalityList = ['Cascais', 'Sintra', 'Oeiras', 'Mafra'] as const;
export type Municipality = typeof municipalityList[number];
