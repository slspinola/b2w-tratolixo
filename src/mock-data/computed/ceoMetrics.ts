// ============================================================
// ceoMetrics.ts — CEO dashboard aggregated metrics
// ============================================================

import type { MockDatabase } from '../generators/index.js';
import { co2Complete } from './co2Calculator.js';
import { computeSemaphore1, computeSemaphore2, computeSemaphore3 } from './semaphores.js';
import type { SemaphoreData } from './semaphores.js';

// ---- Types ----

export interface SparklinePoint {
  mes: string;
  valor: number;
}

export interface KpiCard {
  label: string;
  valor: number;
  unidade: string;
  variacao_pct: number; // vs previous period
  sparkline: SparklinePoint[];
}

export interface CeoMetrics {
  // KPIs
  totalBioTon: KpiCard;
  crescimentoPct: KpiCard;
  percentBioRU: KpiCard;
  totalSacos: KpiCard;
  volumeM3: KpiCard;
  coberturaServico: KpiCard;

  // Semaphores
  semaforos: SemaphoreData[];

  // Environmental
  co2EvitadoTon: KpiCard;
  desvioAterroPct: KpiCard;
  compostoTon: KpiCard;
  biogasM3: KpiCard;
  energiaKwh: KpiCard;

  // Quality
  taxaContaminacaoMedia: KpiCard;
  taxaRejeicaoPct: KpiCard;

  // Monthly breakdown (for charts)
  monthlyBreakdown: {
    mes: string;
    bioTon: number;
    contaminacao: number;
    co2Evitado: number;
    sacos: number;
  }[];

  // Municipality comparison
  municipalityComparison: {
    municipio_id: string;
    nome: string;
    bioTon: number;
    contaminacao: number;
    co2Evitado: number;
    custoTotal: number;
  }[];
}

// ---- Helpers ----

function filterByPeriod(months: string[], periodo: string): string[] {
  // periodo: 'ultimos_6m', 'ultimos_12m', 'ytd', 'all', or 'YYYY-MM'
  const sorted = [...months].sort();
  if (periodo === 'ultimos_6m') return sorted.slice(-6);
  if (periodo === 'ultimos_12m') return sorted.slice(-12);
  if (periodo === 'ytd') {
    const currentYear = sorted[sorted.length - 1]?.split('-')[0] ?? '2026';
    return sorted.filter((m) => m.startsWith(currentYear));
  }
  return sorted; // 'all'
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ---- Main computation ----

export function computeCeoMetrics(
  db: MockDatabase,
  filters: { municipio: string | null; periodo: string },
): CeoMetrics {
  const { municipio, periodo } = filters;

  // Get all unique months
  const allMonths = [...new Set(db.monthlyParishData.map((d) => d.mes))].sort();
  const periodMonths = filterByPeriod(allMonths, periodo);

  // Filter parish data
  const filtered = db.monthlyParishData.filter(
    (d) => periodMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );

  // Previous period (same length, immediately before)
  const prevEnd = allMonths.indexOf(periodMonths[0]);
  const prevStart = Math.max(0, prevEnd - periodMonths.length);
  const prevMonths = allMonths.slice(prevStart, prevEnd);
  const prevFiltered = db.monthlyParishData.filter(
    (d) => prevMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );

  // ---- Aggregate totals ----
  const totalPesoKg = filtered.reduce((s, d) => s + d.peso_total_kg, 0);
  const totalBioTon = totalPesoKg / 1000;
  const prevBioTon = prevFiltered.reduce((s, d) => s + d.peso_total_kg, 0) / 1000;

  const totalSacos = filtered.reduce((s, d) => s + d.total_sacos, 0);
  const prevSacos = prevFiltered.reduce((s, d) => s + d.total_sacos, 0);

  const totalVolume = filtered.reduce((s, d) => s + d.volume_total_m3, 0);
  const prevVolume = prevFiltered.reduce((s, d) => s + d.volume_total_m3, 0);

  // Coverage: % of parishes with significant bio-waste collection (>1 kg/capita/year)
  const totalParishes = db.parishes.filter((p) => !municipio || p.municipio_id === municipio).length;
  const activeParishes = db.parishes
    .filter((p) => !municipio || p.municipio_id === municipio)
    .filter((p) => {
      const parishKg = filtered
        .filter((d) => d.freguesia_id === p.id)
        .reduce((s, d) => s + d.peso_total_kg, 0);
      const annualKgPerCapita = p.populacao > 0 ? (parishKg / p.populacao) * (12 / periodMonths.length) : 0;
      return annualKgPerCapita > 1;
    }).length;
  const cobertura = totalParishes > 0 ? (activeParishes / totalParishes) * 100 : 0;
  const prevActiveParishes = db.parishes
    .filter((p) => !municipio || p.municipio_id === municipio)
    .filter((p) => {
      const parishKg = prevFiltered
        .filter((d) => d.freguesia_id === p.id)
        .reduce((s, d) => s + d.peso_total_kg, 0);
      const annualKgPerCapita = p.populacao > 0 ? (parishKg / p.populacao) * (12 / Math.max(prevMonths.length, 1)) : 0;
      return annualKgPerCapita > 1;
    }).length;
  const prevCobertura = totalParishes > 0 ? (prevActiveParishes / totalParishes) * 100 : 0;

  // Weighted average contamination
  const contamWeighted = totalPesoKg > 0
    ? filtered.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / totalPesoKg
    : 0;
  const prevContamWeighted = prevFiltered.length > 0
    ? prevFiltered.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0)
      / prevFiltered.reduce((s, d) => s + d.peso_total_kg, 0)
    : 0;

  // Rejection rate
  const totalRejected = filtered.reduce((s, d) => s + d.sacos_rejeitados, 0);
  const rejectionPct = totalSacos > 0 ? (totalRejected / totalSacos) * 100 : 0;
  const prevRejected = prevFiltered.reduce((s, d) => s + d.sacos_rejeitados, 0);
  const prevRejPct = prevSacos > 0 ? (prevRejected / prevSacos) * 100 : 0;

  // Bio/RU percentage
  const urbanWaste = db.monthlyUrbanWaste.filter(
    (d) => periodMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );
  const totalRU = urbanWaste.reduce((s, d) => s + d.total_ru_ton, 0);
  const bioRUPct = totalRU > 0 ? (totalBioTon / totalRU) * 100 : 0;
  const prevUrban = db.monthlyUrbanWaste.filter(
    (d) => prevMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );
  const prevRU = prevUrban.reduce((s, d) => s + d.total_ru_ton, 0);
  const prevBioRUPct = prevRU > 0 ? (prevBioTon / prevRU) * 100 : 0;

  // CO2
  const co2Evitado = co2Complete(totalBioTon, contamWeighted);
  const prevCo2 = co2Complete(prevBioTon, prevContamWeighted);

  // Landfill diversion
  const desvioAterro = 100 - contamWeighted;
  const prevDesvio = 100 - prevContamWeighted;

  // Composting: 30% of clean bio-waste
  const cleanBioTon = totalBioTon * (1 - contamWeighted / 100);
  const compostoTon = cleanBioTon * 0.30;
  const prevCleanBio = prevBioTon * (1 - prevContamWeighted / 100);
  const prevComposto = prevCleanBio * 0.30;

  // Biogas: 120 m3/ton of DA feedstock (~70% of clean bio goes to DA)
  const daFeedstock = cleanBioTon * 0.70;
  const biogasM3 = daFeedstock * 120;
  const prevDA = prevCleanBio * 0.70;
  const prevBiogas = prevDA * 120;

  // Energy: 6 kWh per m3 biogas
  const energiaKwh = biogasM3 * 6;
  const prevEnergia = prevBiogas * 6;

  // Growth rate
  const growthPct = pctChange(totalBioTon, prevBioTon);

  // ---- Sparklines (monthly) ----
  function monthlySparkline(getValue: (mes: string) => number): SparklinePoint[] {
    return periodMonths.map((mes) => ({
      mes,
      valor: Math.round(getValue(mes) * 100) / 100,
    }));
  }

  const monthlyAgg = new Map<string, { pesoKg: number; sacos: number; volume: number; contamSum: number; rejected: number }>();
  for (const d of filtered) {
    const existing = monthlyAgg.get(d.mes);
    if (existing) {
      existing.pesoKg += d.peso_total_kg;
      existing.sacos += d.total_sacos;
      existing.volume += d.volume_total_m3;
      existing.contamSum += d.taxa_contaminacao * d.peso_total_kg;
      existing.rejected += d.sacos_rejeitados;
    } else {
      monthlyAgg.set(d.mes, {
        pesoKg: d.peso_total_kg,
        sacos: d.total_sacos,
        volume: d.volume_total_m3,
        contamSum: d.taxa_contaminacao * d.peso_total_kg,
        rejected: d.sacos_rejeitados,
      });
    }
  }

  // ---- Monthly breakdown (for charts) ----
  const monthlyBreakdown = periodMonths.map((mes) => {
    const m = monthlyAgg.get(mes);
    const bioT = (m?.pesoKg ?? 0) / 1000;
    const contam = m && m.pesoKg > 0 ? m.contamSum / m.pesoKg : 0;
    return {
      mes,
      bioTon: Math.round(bioT * 10) / 10,
      contaminacao: Math.round(contam * 10) / 10,
      co2Evitado: Math.round(co2Complete(bioT, contam) * 10) / 10,
      sacos: m?.sacos ?? 0,
    };
  });

  // ---- Municipality comparison ----
  const munIds = municipio ? [municipio] : db.municipalities.map((m) => m.id);
  const municipalityComparison = munIds.map((mid) => {
    const munData = filtered.filter((d) => d.municipio_id === mid);
    const mPesoKg = munData.reduce((s, d) => s + d.peso_total_kg, 0);
    const mBioTon = mPesoKg / 1000;
    const mContam = mPesoKg > 0
      ? munData.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / mPesoKg
      : 0;
    const costs = db.monthlyCosts.filter(
      (c) => c.municipio_id === mid && periodMonths.includes(c.mes),
    );
    const custoTotal = costs.reduce((s, c) => s + c.total_eur, 0);

    return {
      municipio_id: mid,
      nome: db.municipalities.find((m) => m.id === mid)?.nome ?? mid,
      bioTon: Math.round(mBioTon * 10) / 10,
      contaminacao: Math.round(mContam * 10) / 10,
      co2Evitado: Math.round(co2Complete(mBioTon, mContam) * 10) / 10,
      custoTotal: Math.round(custoTotal * 100) / 100,
    };
  });

  // ---- Semaphores ----
  const semaforos = [
    computeSemaphore1(db.monthlyParishData, db.monthlyIncidents, municipio),
    computeSemaphore2(db.monthlyParishData, municipio),
    computeSemaphore3(db.monthlyParishData, municipio),
  ];

  // ---- Build KPI cards ----
  return {
    totalBioTon: {
      label: 'Total Biorresiduos',
      valor: Math.round(totalBioTon * 10) / 10,
      unidade: 'ton',
      variacao_pct: pctChange(totalBioTon, prevBioTon),
      sparkline: monthlySparkline((mes) => (monthlyAgg.get(mes)?.pesoKg ?? 0) / 1000),
    },
    crescimentoPct: {
      label: 'Crescimento',
      valor: growthPct,
      unidade: '%',
      variacao_pct: 0,
      sparkline: [],
    },
    percentBioRU: {
      label: 'Bio/RU',
      valor: Math.round(bioRUPct * 10) / 10,
      unidade: '%',
      variacao_pct: pctChange(bioRUPct, prevBioRUPct),
      sparkline: [],
    },
    totalSacos: {
      label: 'Total Sacos',
      valor: totalSacos,
      unidade: 'sacos',
      variacao_pct: pctChange(totalSacos, prevSacos),
      sparkline: monthlySparkline((mes) => monthlyAgg.get(mes)?.sacos ?? 0),
    },
    volumeM3: {
      label: 'Volume',
      valor: Math.round(totalVolume * 10) / 10,
      unidade: 'm3',
      variacao_pct: pctChange(totalVolume, prevVolume),
      sparkline: monthlySparkline((mes) => monthlyAgg.get(mes)?.volume ?? 0),
    },
    coberturaServico: {
      label: 'Cobertura Servico',
      valor: Math.round(cobertura * 10) / 10,
      unidade: '%',
      variacao_pct: pctChange(cobertura, prevCobertura),
      sparkline: [],
    },

    semaforos,

    co2EvitadoTon: {
      label: 'CO2 Evitado',
      valor: Math.round(co2Evitado * 10) / 10,
      unidade: 'tCO2e',
      variacao_pct: pctChange(co2Evitado, prevCo2),
      sparkline: monthlySparkline((mes) => {
        const m = monthlyAgg.get(mes);
        const bt = (m?.pesoKg ?? 0) / 1000;
        const ct = m && m.pesoKg > 0 ? m.contamSum / m.pesoKg : 0;
        return co2Complete(bt, ct);
      }),
    },
    desvioAterroPct: {
      label: 'Desvio Aterro',
      valor: Math.round(desvioAterro * 10) / 10,
      unidade: '%',
      variacao_pct: pctChange(desvioAterro, prevDesvio),
      sparkline: [],
    },
    compostoTon: {
      label: 'Composto Produzido',
      valor: Math.round(compostoTon * 10) / 10,
      unidade: 'ton',
      variacao_pct: pctChange(compostoTon, prevComposto),
      sparkline: [],
    },
    biogasM3: {
      label: 'Biogas Produzido',
      valor: Math.round(biogasM3),
      unidade: 'm3',
      variacao_pct: pctChange(biogasM3, prevBiogas),
      sparkline: [],
    },
    energiaKwh: {
      label: 'Energia Gerada',
      valor: Math.round(energiaKwh),
      unidade: 'kWh',
      variacao_pct: pctChange(energiaKwh, prevEnergia),
      sparkline: [],
    },

    taxaContaminacaoMedia: {
      label: 'Taxa Contaminacao',
      valor: Math.round(contamWeighted * 10) / 10,
      unidade: '%',
      variacao_pct: pctChange(contamWeighted, prevContamWeighted),
      sparkline: monthlySparkline((mes) => {
        const m = monthlyAgg.get(mes);
        return m && m.pesoKg > 0 ? m.contamSum / m.pesoKg : 0;
      }),
    },
    taxaRejeicaoPct: {
      label: 'Taxa Rejeicao',
      valor: Math.round(rejectionPct * 10) / 10,
      unidade: '%',
      variacao_pct: pctChange(rejectionPct, prevRejPct),
      sparkline: [],
    },

    monthlyBreakdown,
    municipalityComparison,
  };
}
