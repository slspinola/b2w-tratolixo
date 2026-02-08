// ============================================================
// bags.ts — Aggregated monthly bio-waste data per parish
// ============================================================

import { normalRandom, withNoise, clamp } from '../seed.js';
import { parishes } from './municipalities.js';
import { contaminationTypes, municipalityContaminationRates } from './contamination.js';

// ---- Types ----

export interface MonthlyParishData {
  mes: string; // YYYY-MM
  freguesia_id: string;
  municipio_id: string;
  total_sacos: number;
  peso_total_kg: number;
  volume_total_m3: number;
  peso_medio_saco_kg: number;
  taxa_contaminacao: number; // %
  sacos_rejeitados: number;
  contaminacao_por_tipo: Record<string, number>; // tipo_id -> kg
}

// ---- Configuration ----

/** Seasonal multipliers (Jan=0, Feb=1, ... Dec=11) */
const SEASONAL_MULTIPLIERS: readonly number[] = [
  0.85, // Jan
  0.87, // Feb
  0.92, // Mar
  0.95, // Apr
  1.0, // May
  1.08, // Jun
  1.15, // Jul
  1.2, // Aug
  1.1, // Sep
  1.0, // Oct
  0.93, // Nov
  0.9, // Dec
];

/** Monthly compounding growth rate */
const GROWTH_RATE = 0.015;

/** Bags per 10 inhabitants per month (base) */
const BAGS_PER_10_HAB = 1.0;

/** Average weight per bag (kg) */
const WEIGHT_MEAN_KG = 8;
const WEIGHT_STD_KG = 3;
const WEIGHT_MIN_KG = 0.5;
const WEIGHT_MAX_KG = 30;

/** Volume per bag (m3) — average kitchen bio-waste bag */
const VOLUME_PER_BAG_M3 = 0.012;

/** Random noise factor */
const NOISE = 0.15;

/** Rejection threshold: bags with contamination > 30% are rejected */
const REJECTION_RATE_BASE = 0.03; // ~3% of bags

// ---- Months to generate ----

const MONTHS: string[] = [];
// Feb 2025 (2025-02) through Jan 2026 (2026-01)
for (let i = 0; i < 12; i++) {
  const year = 2025 + Math.floor((i + 1) / 12);
  const month = ((i + 1) % 12) + 1; // Feb=2 .. Jan=1 (next year)
  MONTHS.push(`${year}-${String(month).padStart(2, '0')}`);
}

export { MONTHS };

// ---- Generator ----

export function generateMonthlyParishData(): MonthlyParishData[] {
  const result: MonthlyParishData[] = [];

  for (const parish of parishes) {
    const baseContamRate = municipalityContaminationRates[parish.municipio_id] ?? 10;

    for (let i = 0; i < MONTHS.length; i++) {
      const mes = MONTHS[i]!;
      const monthIndex = parseInt(mes.split('-')[1], 10) - 1; // 0-based month

      // Base bags proportional to population
      const baseBags = (parish.populacao / 10) * BAGS_PER_10_HAB;

      // Apply seasonal multiplier
      const seasonal = SEASONAL_MULTIPLIERS[monthIndex] ?? 1.0;

      // Apply growth trend (compounding from month 0)
      const growth = Math.pow(1 + GROWTH_RATE, i);

      // Final bag count with noise
      const totalSacos = Math.round(withNoise(baseBags * seasonal * growth, NOISE));

      // Weight per bag (normally distributed, clamped)
      const avgWeight = clamp(normalRandom(WEIGHT_MEAN_KG, WEIGHT_STD_KG), WEIGHT_MIN_KG, WEIGHT_MAX_KG);
      const pesoTotal = Math.round(totalSacos * avgWeight);

      // Volume
      const volumeTotal = Math.round(totalSacos * VOLUME_PER_BAG_M3 * 100) / 100;

      // Contamination rate with some monthly variation
      const taxaContaminacao = Math.round(
        clamp(withNoise(baseContamRate, 0.2), baseContamRate * 0.5, baseContamRate * 2) * 10,
      ) / 10;

      // Rejected bags (those with >30% contamination)
      const rejectionRate = withNoise(REJECTION_RATE_BASE, 0.3);
      const sacosRejeitados = Math.round(totalSacos * clamp(rejectionRate, 0.01, 0.08));

      // Contamination breakdown by type
      const totalContamKg = (pesoTotal * taxaContaminacao) / 100;
      const contaminacaoPorTipo: Record<string, number> = {};
      let assignedKg = 0;

      for (let j = 0; j < contaminationTypes.length; j++) {
        const ct = contaminationTypes[j];
        if (j === contaminationTypes.length - 1) {
          // Last type gets the remainder
          contaminacaoPorTipo[ct.id] = Math.round((totalContamKg - assignedKg) * 10) / 10;
        } else {
          const fraction = withNoise(ct.percentagem_tipica / 100, 0.25);
          const kg = Math.round(totalContamKg * clamp(fraction, 0.01, 0.5) * 10) / 10;
          contaminacaoPorTipo[ct.id] = kg;
          assignedKg += kg;
        }
      }

      result.push({
        mes,
        freguesia_id: parish.id,
        municipio_id: parish.municipio_id,
        total_sacos: totalSacos,
        peso_total_kg: pesoTotal,
        volume_total_m3: volumeTotal,
        peso_medio_saco_kg: Math.round((pesoTotal / totalSacos) * 10) / 10,
        taxa_contaminacao: taxaContaminacao,
        sacos_rejeitados: sacosRejeitados,
        contaminacao_por_tipo: contaminacaoPorTipo,
      });
    }
  }

  return result;
}
