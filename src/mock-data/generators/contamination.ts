// ============================================================
// contamination.ts — Contamination type reference data
// ============================================================

export interface ContaminationType {
  id: string;
  nome: string;
  cor: string;
  percentagem_tipica: number;
}

/**
 * 7 contamination types with typical distribution.
 * percentagem_tipica represents what fraction of contaminated material
 * is of this type (across all municipalities). Sums to 100.
 */
export const contaminationTypes: readonly ContaminationType[] = [
  { id: 'CT-PLA', nome: 'Plastico', cor: '#EF4444', percentagem_tipica: 28 },
  { id: 'CT-VID', nome: 'Vidro', cor: '#10B981', percentagem_tipica: 22 },
  { id: 'CT-PAP', nome: 'Papel/Cartao', cor: '#3B82F6', percentagem_tipica: 18 },
  { id: 'CT-MET', nome: 'Metal', cor: '#F59E0B', percentagem_tipica: 12 },
  { id: 'CT-TEX', nome: 'Textil', cor: '#8B5CF6', percentagem_tipica: 8 },
  { id: 'CT-ORG', nome: 'Organico N/B', cor: '#06B6D4', percentagem_tipica: 7 },
  { id: 'CT-OUT', nome: 'Outros', cor: '#94A3B8', percentagem_tipica: 5 },
] as const;

/** Base contamination rate by municipality (%) */
export const municipalityContaminationRates: Record<string, number> = {
  'MUN-MAF': 7,
  'MUN-CAS': 9,
  'MUN-OEI': 10,
  'MUN-SIN': 12,
};
