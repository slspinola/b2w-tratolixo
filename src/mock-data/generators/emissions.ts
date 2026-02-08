// ============================================================
// emissions.ts — Emission factor reference data (IPCC 2006 / APA 2023)
// ============================================================

export interface EmissionFactor {
  id: string;
  cenario: string;
  valor_tco2e_por_t: number;
  fonte: string;
}

export const emissionFactors: readonly EmissionFactor[] = [
  { id: 'EF-REF', cenario: 'aterro', valor_tco2e_por_t: 0.900, fonte: 'IPCC 2006' },
  { id: 'EF-DA', cenario: 'digestao_anaerobica', valor_tco2e_por_t: 0.100, fonte: 'IPCC 2006' },
  { id: 'EF-COMP', cenario: 'compostagem', valor_tco2e_por_t: 0.050, fonte: 'IPCC 2006' },
  { id: 'EF-OPS', cenario: 'operacoes', valor_tco2e_por_t: 0.030, fonte: 'APA 2023' },
  { id: 'EF-REJ', cenario: 'rejeitados', valor_tco2e_por_t: 0.500, fonte: 'IPCC 2006' },
] as const;
