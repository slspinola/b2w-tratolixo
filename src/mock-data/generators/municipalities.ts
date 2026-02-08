// ============================================================
// municipalities.ts — Municipality and parish reference data
// ============================================================

export interface Municipality {
  id: string;
  nome: string;
  populacao: number;
  area_km2: number;
  cor: string;
}

export interface Parish {
  id: string;
  municipio_id: string;
  nome: string;
  populacao: number;
  area_km2: number;
}

// ---- Municipalities (Tratolixo service area) ----

export const municipalities: readonly Municipality[] = [
  { id: 'MUN-CAS', nome: 'Cascais', populacao: 214158, area_km2: 97.4, cor: '#3B82F6' },
  { id: 'MUN-SIN', nome: 'Sintra', populacao: 391066, area_km2: 319.2, cor: '#22C55E' },
  { id: 'MUN-OEI', nome: 'Oeiras', populacao: 178984, area_km2: 45.7, cor: '#F59E0B' },
  { id: 'MUN-MAF', nome: 'Mafra', populacao: 82552, area_km2: 291.7, cor: '#8B5CF6' },
] as const;

// ---- Parishes (simplified — ~4-5 per municipality) ----

export const parishes: readonly Parish[] = [
  // Cascais
  { id: 'FRG-CAS-01', municipio_id: 'MUN-CAS', nome: 'Cascais e Estoril', populacao: 64000, area_km2: 18.5 },
  { id: 'FRG-CAS-02', municipio_id: 'MUN-CAS', nome: 'Carcavelos e Parede', populacao: 52000, area_km2: 9.8 },
  { id: 'FRG-CAS-03', municipio_id: 'MUN-CAS', nome: 'São Domingos de Rana', populacao: 58000, area_km2: 22.4 },
  { id: 'FRG-CAS-04', municipio_id: 'MUN-CAS', nome: 'Alcabideche', populacao: 40158, area_km2: 46.7 },

  // Sintra
  { id: 'FRG-SIN-01', municipio_id: 'MUN-SIN', nome: 'Agualva e Mira-Sintra', populacao: 85000, area_km2: 10.2 },
  { id: 'FRG-SIN-02', municipio_id: 'MUN-SIN', nome: 'Queluz e Belas', populacao: 110000, area_km2: 28.5 },
  { id: 'FRG-SIN-03', municipio_id: 'MUN-SIN', nome: 'Rio de Mouro', populacao: 78000, area_km2: 16.4 },
  { id: 'FRG-SIN-04', municipio_id: 'MUN-SIN', nome: 'Cacém e São Marcos', populacao: 68000, area_km2: 11.8 },
  { id: 'FRG-SIN-05', municipio_id: 'MUN-SIN', nome: 'Sintra (São Pedro)', populacao: 50066, area_km2: 252.3 },

  // Oeiras
  { id: 'FRG-OEI-01', municipio_id: 'MUN-OEI', nome: 'Oeiras e São Julião', populacao: 52000, area_km2: 10.3 },
  { id: 'FRG-OEI-02', municipio_id: 'MUN-OEI', nome: 'Algés, Linda-a-Velha e Cruz Quebrada', populacao: 55000, area_km2: 8.1 },
  { id: 'FRG-OEI-03', municipio_id: 'MUN-OEI', nome: 'Carnaxide e Queijas', populacao: 42000, area_km2: 12.5 },
  { id: 'FRG-OEI-04', municipio_id: 'MUN-OEI', nome: 'Porto Salvo', populacao: 29984, area_km2: 14.8 },

  // Mafra
  { id: 'FRG-MAF-01', municipio_id: 'MUN-MAF', nome: 'Mafra', populacao: 18000, area_km2: 42.1 },
  { id: 'FRG-MAF-02', municipio_id: 'MUN-MAF', nome: 'Ericeira', populacao: 12000, area_km2: 28.5 },
  { id: 'FRG-MAF-03', municipio_id: 'MUN-MAF', nome: 'Malveira e São Miguel de Alcainça', populacao: 15000, area_km2: 58.3 },
  { id: 'FRG-MAF-04', municipio_id: 'MUN-MAF', nome: 'Enxara do Bispo e A-dos-Cunhados', populacao: 20000, area_km2: 85.6 },
  { id: 'FRG-MAF-05', municipio_id: 'MUN-MAF', nome: 'Venda do Pinheiro e Santo Estêvão', populacao: 17552, area_km2: 77.2 },
] as const;

// ---- Helpers ----

export function getParishesByMunicipality(municipioId: string): Parish[] {
  return parishes.filter((p) => p.municipio_id === municipioId);
}

export function getMunicipalityPopulation(municipioId: string): number {
  return parishes
    .filter((p) => p.municipio_id === municipioId)
    .reduce((sum, p) => sum + p.populacao, 0);
}
