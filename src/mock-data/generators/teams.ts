// ============================================================
// teams.ts — Collection team reference data
// ============================================================

export interface Team {
  id: string;
  nome: string;
  municipio_id: string;
  tipo: 'recolha' | 'inspecao';
  membros: number;
}

export function generateTeams(): Team[] {
  return [
    // Cascais
    { id: 'EQ-CAS-A', nome: 'Equipa Cascais A', municipio_id: 'MUN-CAS', tipo: 'recolha', membros: 4 },
    { id: 'EQ-CAS-B', nome: 'Equipa Cascais B', municipio_id: 'MUN-CAS', tipo: 'recolha', membros: 4 },
    // Sintra
    { id: 'EQ-SIN-A', nome: 'Equipa Sintra A', municipio_id: 'MUN-SIN', tipo: 'recolha', membros: 5 },
    { id: 'EQ-SIN-B', nome: 'Equipa Sintra B', municipio_id: 'MUN-SIN', tipo: 'recolha', membros: 5 },
    // Oeiras
    { id: 'EQ-OEI-A', nome: 'Equipa Oeiras A', municipio_id: 'MUN-OEI', tipo: 'recolha', membros: 4 },
    { id: 'EQ-OEI-B', nome: 'Equipa Oeiras B', municipio_id: 'MUN-OEI', tipo: 'recolha', membros: 3 },
    // Mafra
    { id: 'EQ-MAF-A', nome: 'Equipa Mafra A', municipio_id: 'MUN-MAF', tipo: 'recolha', membros: 3 },
    { id: 'EQ-MAF-B', nome: 'Equipa Mafra B', municipio_id: 'MUN-MAF', tipo: 'recolha', membros: 3 },
  ];
}
