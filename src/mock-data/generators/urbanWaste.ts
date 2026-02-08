// ============================================================
// urbanWaste.ts — Monthly total urban waste per municipality
// ============================================================
// Bio-waste is typically 15-25% of total urban waste (RU).
// We derive total RU from the bio-waste data so percentages make sense.

import { withNoise } from '../seed.js';
import { municipalities } from './municipalities.js';
import { MONTHS } from './bags.js';
import type { MonthlyParishData } from './bags.js';

// ---- Types ----

export interface MonthlyUrbanWaste {
  mes: string;
  municipio_id: string;
  total_ru_ton: number;
}

// ---- Configuration ----

/** Target bio/RU percentage by municipality */
const BIO_RU_TARGET: Record<string, number> = {
  'MUN-CAS': 0.20, // 20% of urban waste is bio
  'MUN-SIN': 0.18,
  'MUN-OEI': 0.22,
  'MUN-MAF': 0.15,
};

// ---- Generator ----

export function generateMonthlyUrbanWaste(monthlyParishData: MonthlyParishData[]): MonthlyUrbanWaste[] {
  const result: MonthlyUrbanWaste[] = [];

  for (const mun of municipalities) {
    for (const mes of MONTHS) {
      // Sum bio-waste for this municipality this month
      const monthData = monthlyParishData.filter(
        (d) => d.municipio_id === mun.id && d.mes === mes,
      );
      const bioTons = monthData.reduce((sum, d) => sum + d.peso_total_kg, 0) / 1000;

      // Calculate total RU so that bio% = target with some noise
      const targetPct = BIO_RU_TARGET[mun.id] ?? 0.19;
      const effectivePct = withNoise(targetPct, 0.10); // +/-10% variation
      const totalRuTon = Math.round((bioTons / effectivePct) * 10) / 10;

      result.push({
        mes,
        municipio_id: mun.id,
        total_ru_ton: totalRuTon,
      });
    }
  }

  return result;
}
