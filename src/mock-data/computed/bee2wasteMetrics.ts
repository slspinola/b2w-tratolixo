// ============================================================
// bee2wasteMetrics.ts — Bee2Waste (operator) dashboard metrics
// ============================================================

import type { MockDatabase } from '../generators/index.js';
import { co2Complete } from './co2Calculator.js';
import { calculateGisIndex } from './gisIndex.js';
import type { GisIndexResult } from './gisIndex.js';

// ---- Types ----

export interface Bee2WasteMunicipalityCard {
  municipio_id: string;
  nome: string;
  cor: string;
  populacao: number;
  bioTon: number;
  sacos: number;
  contaminacao: number;
  co2Evitado: number;
  custoTotal: number;
  custoPorTon: number;
  gis: GisIndexResult;
  tendenciaBio: 'positiva' | 'neutra' | 'negativa';
  tendenciaContam: 'positiva' | 'neutra' | 'negativa';
}

export interface Bee2WasteSystemHealth {
  totalIncidents: number;
  resolvedPct: number;
  mttrMinutes: number;
  uptimePct: number;
  incidentsByType: { tipo: string; count: number; pct: number }[];
}

export interface Bee2WasteFleetMetrics {
  totalRoutes: number;
  activeTeams: number;
  avgRoutesPerTeam: number;
  totalCollectionPoints: number;
  avgEfficiencyPct: number;
}

export interface Bee2WasteEnvironmental {
  totalCo2Evitado: number;
  compostoTon: number;
  biogasM3: number;
  energiaKwh: number;
  desvioAterroPct: number;
  co2PorTon: number;
}

export interface Bee2WasteMonthlyTrend {
  mes: string;
  bioTon: number;
  contaminacao: number;
  co2Evitado: number;
  custoTotal: number;
  custoPorTon: number;
  sacos: number;
  gisScore: number;
}

export interface Bee2WasteMetrics {
  // Per-municipality cards
  municipalityCards: Bee2WasteMunicipalityCard[];

  // System-wide totals
  totalBioTon: number;
  totalSacos: number;
  avgContaminacao: number;
  totalCustoEur: number;
  avgCustoPorTon: number;

  // System health
  systemHealth: Bee2WasteSystemHealth;

  // Fleet
  fleet: Bee2WasteFleetMetrics;

  // Environmental totals
  environmental: Bee2WasteEnvironmental;

  // Monthly trends (system-wide)
  monthlyTrends: Bee2WasteMonthlyTrend[];

  // Aggregate GIS
  aggregateGis: GisIndexResult;

  // Contamination heatmap (municipality x month)
  contaminationHeatmap: {
    municipio_id: string;
    nome: string;
    months: { mes: string; valor: number }[];
  }[];
}

// ---- Helpers ----

function filterMonths(allMonths: string[], periodo: string): string[] {
  const sorted = [...allMonths].sort();
  if (periodo === 'ultimos_6m') return sorted.slice(-6);
  if (periodo === 'ultimos_12m') return sorted.slice(-12);
  if (periodo === 'ytd') {
    const year = sorted[sorted.length - 1]?.split('-')[0] ?? '2026';
    return sorted.filter((m) => m.startsWith(year));
  }
  return sorted;
}

function regressionSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }
  return den === 0 ? 0 : num / den;
}

function trend(values: number[]): 'positiva' | 'neutra' | 'negativa' {
  const slope = regressionSlope(values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const rel = avg !== 0 ? slope / avg : 0;
  if (rel > 0.02) return 'positiva';
  if (rel < -0.02) return 'negativa';
  return 'neutra';
}

// ---- Main computation ----

export function computeBee2WasteMetrics(
  db: MockDatabase,
  filters: { municipio: string | null; periodo: string },
): Bee2WasteMetrics {
  const { municipio, periodo } = filters;

  const allMonths = [...new Set(db.monthlyParishData.map((d) => d.mes))].sort();
  const periodMonths = filterMonths(allMonths, periodo);
  const numMonths = periodMonths.length;

  // Filter data
  const parishData = db.monthlyParishData.filter(
    (d) => periodMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );

  // ---- Municipality cards ----
  const munIds = municipio ? [municipio] : db.municipalities.map((m) => m.id);
  const municipalityCards: Bee2WasteMunicipalityCard[] = munIds.map((mid) => {
    const mun = db.municipalities.find((m) => m.id === mid)!;
    const mData = parishData.filter((d) => d.municipio_id === mid);
    const mKg = mData.reduce((s, d) => s + d.peso_total_kg, 0);
    const mBioTon = mKg / 1000;
    const mSacos = mData.reduce((s, d) => s + d.total_sacos, 0);
    const mContam = mKg > 0
      ? mData.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / mKg
      : 0;
    const mCo2 = co2Complete(mBioTon, mContam);

    // Costs
    const mCosts = db.monthlyCosts.filter(
      (c) => c.municipio_id === mid && periodMonths.includes(c.mes),
    );
    const mCustoTotal = mCosts.reduce((s, c) => s + c.total_eur, 0);

    // Population from parishes
    const munParishes = db.parishes.filter((p) => p.municipio_id === mid);
    const populacao = munParishes.reduce((s, p) => s + p.populacao, 0);

    // Monthly bio-waste for trend
    const monthlyBio = periodMonths.map((mes) => {
      return mData.filter((d) => d.mes === mes).reduce((s, d) => s + d.peso_total_kg, 0) / 1000;
    });
    const monthlyContam = periodMonths.map((mes) => {
      const md = mData.filter((d) => d.mes === mes);
      const kg = md.reduce((s, d) => s + d.peso_total_kg, 0);
      return kg > 0 ? md.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / kg : 0;
    });

    // GIS
    const annualizeFactor = numMonths > 0 ? 12 / numMonths : 1;
    const kgPerCapitaAno = populacao > 0 ? (mKg / populacao) * annualizeFactor : 0;
    const sacosPorHabMes = populacao > 0 && numMonths > 0 ? mSacos / populacao / numMonths : 0;

    const incidentsCount = db.monthlyIncidents
      .filter((i) => i.municipio_id === mid && periodMonths.includes(i.mes))
      .reduce((s, i) => s + i.incidents.length, 0);
    const alertasPorTon = mBioTon > 0 ? incidentsCount / mBioTon : 0;

    const gis = calculateGisIndex({
      kgPerCapitaAno,
      taxaContaminacao: mContam,
      alertasPorTon,
      co2EvitadoPorTon: mBioTon > 0 ? mCo2 / mBioTon : 0,
      sacosPorHabMes,
    });

    return {
      municipio_id: mid,
      nome: mun.nome,
      cor: mun.cor,
      populacao,
      bioTon: Math.round(mBioTon * 10) / 10,
      sacos: mSacos,
      contaminacao: Math.round(mContam * 10) / 10,
      co2Evitado: Math.round(mCo2 * 10) / 10,
      custoTotal: Math.round(mCustoTotal * 100) / 100,
      custoPorTon: mBioTon > 0 ? Math.round((mCustoTotal / mBioTon) * 100) / 100 : 0,
      gis,
      tendenciaBio: trend(monthlyBio),
      tendenciaContam: trend(monthlyContam),
    };
  });

  // ---- System-wide totals ----
  const totalKg = parishData.reduce((s, d) => s + d.peso_total_kg, 0);
  const totalBioTon = totalKg / 1000;
  const totalSacos = parishData.reduce((s, d) => s + d.total_sacos, 0);
  const avgContaminacao = totalKg > 0
    ? parishData.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / totalKg
    : 0;
  const costsFiltered = db.monthlyCosts.filter(
    (c) => periodMonths.includes(c.mes) && (!municipio || c.municipio_id === municipio),
  );
  const totalCustoEur = costsFiltered.reduce((s, c) => s + c.total_eur, 0);

  // ---- System health ----
  const incidents = db.monthlyIncidents.filter(
    (i) => periodMonths.includes(i.mes) && (!municipio || i.municipio_id === municipio),
  );
  const allIncidents = incidents.flatMap((i) => i.incidents);
  const totalIncidents = allIncidents.length;
  const resolvedCount = allIncidents.filter((i) => i.resolvido).length;
  const resolvedPct = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 100;
  const avgMttr = allIncidents.length > 0
    ? Math.round(allIncidents.reduce((s, i) => s + i.tempo_resolucao_min, 0) / allIncidents.length)
    : 0;
  // Uptime: assume 24*30*numMonths hours operational, subtract incident time
  const totalHours = numMonths * 30 * 24;
  const downtimeHours = allIncidents.reduce((s, i) => s + i.tempo_resolucao_min / 60, 0);
  const uptimePct = totalHours > 0
    ? Math.round(((totalHours - downtimeHours) / totalHours) * 10000) / 100
    : 100;

  // Incidents by type
  const incidentTypeCounts = new Map<string, number>();
  for (const i of allIncidents) {
    incidentTypeCounts.set(i.tipo, (incidentTypeCounts.get(i.tipo) ?? 0) + 1);
  }
  const incidentsByType = Array.from(incidentTypeCounts.entries())
    .map(([tipo, count]) => ({
      tipo,
      count,
      pct: totalIncidents > 0 ? Math.round((count / totalIncidents) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const systemHealth: Bee2WasteSystemHealth = {
    totalIncidents,
    resolvedPct,
    mttrMinutes: avgMttr,
    uptimePct,
    incidentsByType,
  };

  // ---- Fleet metrics ----
  const filteredRoutes = db.routes.filter((r) => !municipio || r.municipio_id === municipio);
  const filteredTeams = db.teams.filter((t) => !municipio || t.municipio_id === municipio);
  const fleet: Bee2WasteFleetMetrics = {
    totalRoutes: filteredRoutes.length,
    activeTeams: filteredTeams.length,
    avgRoutesPerTeam: filteredTeams.length > 0
      ? Math.round((filteredRoutes.length / filteredTeams.length) * 10) / 10
      : 0,
    totalCollectionPoints: filteredRoutes.reduce((s, r) => s + r.pontos_recolha, 0),
    avgEfficiencyPct: 88, // Simulated average
  };

  // ---- Environmental ----
  const cleanBioTon = totalBioTon * (1 - avgContaminacao / 100);
  const compostoTon = cleanBioTon * 0.30;
  const daFeedstock = cleanBioTon * 0.70;
  const biogasM3 = daFeedstock * 120;
  const energiaKwh = biogasM3 * 6;
  const co2Total = co2Complete(totalBioTon, avgContaminacao);
  const desvioAterro = 100 - avgContaminacao;

  const environmental: Bee2WasteEnvironmental = {
    totalCo2Evitado: Math.round(co2Total * 10) / 10,
    compostoTon: Math.round(compostoTon * 10) / 10,
    biogasM3: Math.round(biogasM3),
    energiaKwh: Math.round(energiaKwh),
    desvioAterroPct: Math.round(desvioAterro * 10) / 10,
    co2PorTon: totalBioTon > 0 ? Math.round((co2Total / totalBioTon) * 1000) / 1000 : 0,
  };

  // ---- Monthly trends ----
  const monthlyTrends: Bee2WasteMonthlyTrend[] = periodMonths.map((mes) => {
    const md = parishData.filter((d) => d.mes === mes);
    const mKg = md.reduce((s, d) => s + d.peso_total_kg, 0);
    const mTon = mKg / 1000;
    const mSacos = md.reduce((s, d) => s + d.total_sacos, 0);
    const mContam = mKg > 0
      ? md.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / mKg
      : 0;
    const mCo2 = co2Complete(mTon, mContam);
    const mc = costsFiltered.filter((c) => c.mes === mes);
    const mCost = mc.reduce((s, c) => s + c.total_eur, 0);

    // Simplified GIS for monthly snapshot
    const totalPop = db.parishes
      .filter((p) => !municipio || p.municipio_id === municipio)
      .reduce((s, p) => s + p.populacao, 0);
    const gis = calculateGisIndex({
      kgPerCapitaAno: totalPop > 0 ? (mKg / totalPop) * 12 : 0,
      taxaContaminacao: mContam,
      alertasPorTon: 0.5,
      co2EvitadoPorTon: mTon > 0 ? mCo2 / mTon : 0,
      sacosPorHabMes: totalPop > 0 ? mSacos / totalPop : 0,
    });

    return {
      mes,
      bioTon: Math.round(mTon * 10) / 10,
      contaminacao: Math.round(mContam * 10) / 10,
      co2Evitado: Math.round(mCo2 * 10) / 10,
      custoTotal: Math.round(mCost * 100) / 100,
      custoPorTon: mTon > 0 ? Math.round((mCost / mTon) * 100) / 100 : 0,
      sacos: mSacos,
      gisScore: gis.score,
    };
  });

  // ---- Aggregate GIS ----
  const totalPop = db.parishes
    .filter((p) => !municipio || p.municipio_id === municipio)
    .reduce((s, p) => s + p.populacao, 0);
  const annualizeFactor = numMonths > 0 ? 12 / numMonths : 1;
  const aggregateGis = calculateGisIndex({
    kgPerCapitaAno: totalPop > 0 ? (totalKg / totalPop) * annualizeFactor : 0,
    taxaContaminacao: avgContaminacao,
    alertasPorTon: totalBioTon > 0 ? totalIncidents / totalBioTon : 0,
    co2EvitadoPorTon: totalBioTon > 0 ? co2Total / totalBioTon : 0,
    sacosPorHabMes: totalPop > 0 && numMonths > 0 ? totalSacos / totalPop / numMonths : 0,
  });

  // ---- Contamination heatmap ----
  const contaminationHeatmap = munIds.map((mid) => {
    const mun = db.municipalities.find((m) => m.id === mid)!;
    const months = periodMonths.map((mes) => {
      const md = parishData.filter((d) => d.municipio_id === mid && d.mes === mes);
      const kg = md.reduce((s, d) => s + d.peso_total_kg, 0);
      const contam = kg > 0
        ? md.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / kg
        : 0;
      return { mes, valor: Math.round(contam * 10) / 10 };
    });
    return { municipio_id: mid, nome: mun.nome, months };
  });

  return {
    municipalityCards,
    totalBioTon: Math.round(totalBioTon * 10) / 10,
    totalSacos,
    avgContaminacao: Math.round(avgContaminacao * 10) / 10,
    totalCustoEur: Math.round(totalCustoEur * 100) / 100,
    avgCustoPorTon: totalBioTon > 0 ? Math.round((totalCustoEur / totalBioTon) * 100) / 100 : 0,
    systemHealth,
    fleet,
    environmental,
    monthlyTrends,
    aggregateGis,
    contaminationHeatmap,
  };
}
