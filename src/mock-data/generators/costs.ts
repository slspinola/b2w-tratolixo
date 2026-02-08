// ============================================================
// costs.ts — Monthly cost data per municipality
// ============================================================

import { withNoise } from '../seed.js';
import { municipalities } from './municipalities.js';
import { MONTHS } from './bags.js';
import type { MonthlyParishData } from './bags.js';

// ---- Types ----

export interface MonthlyCosts {
  mes: string;
  municipio_id: string;
  recolha_eur: number;
  tratamento_eur: number;
  transporte_eur: number;
  mao_obra_eur: number;
  overhead_eur: number;
  total_eur: number;
}

// ---- Configuration ----

/** Base cost per ton by municipality (EUR) */
const COST_PER_TON: Record<string, number> = {
  'MUN-CAS': 45,
  'MUN-SIN': 42,
  'MUN-OEI': 48,
  'MUN-MAF': 40,
};

/** Cost split percentages */
const COST_SPLIT = {
  recolha: 0.35,
  tratamento: 0.25,
  transporte: 0.15,
  mao_obra: 0.20,
  overhead: 0.05,
} as const;

// ---- Generator ----

export function generateMonthlyCosts(monthlyParishData: MonthlyParishData[]): MonthlyCosts[] {
  const result: MonthlyCosts[] = [];

  for (const mun of municipalities) {
    for (const mes of MONTHS) {
      // Sum total weight for this municipality this month
      const monthData = monthlyParishData.filter(
        (d) => d.municipio_id === mun.id && d.mes === mes,
      );
      const totalKg = monthData.reduce((sum, d) => sum + d.peso_total_kg, 0);
      const totalTons = totalKg / 1000;

      // Calculate total cost with noise
      const baseCostPerTon = COST_PER_TON[mun.id] ?? 44;
      const totalCost = withNoise(totalTons * baseCostPerTon, 0.08);

      // Split costs
      const recolha = Math.round(totalCost * COST_SPLIT.recolha * 100) / 100;
      const tratamento = Math.round(totalCost * COST_SPLIT.tratamento * 100) / 100;
      const transporte = Math.round(totalCost * COST_SPLIT.transporte * 100) / 100;
      const maoObra = Math.round(totalCost * COST_SPLIT.mao_obra * 100) / 100;
      const overhead = Math.round(totalCost * COST_SPLIT.overhead * 100) / 100;

      result.push({
        mes,
        municipio_id: mun.id,
        recolha_eur: recolha,
        tratamento_eur: tratamento,
        transporte_eur: transporte,
        mao_obra_eur: maoObra,
        overhead_eur: overhead,
        total_eur: Math.round((recolha + tratamento + transporte + maoObra + overhead) * 100) / 100,
      });
    }
  }

  return result;
}
