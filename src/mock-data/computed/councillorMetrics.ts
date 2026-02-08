// ============================================================
// councillorMetrics.ts — Councillor dashboard (parish-level ICD-GIS)
// ============================================================

import type { MockDatabase } from '../generators/index.js';
import { calculateGisIndex } from './gisIndex.js';
import type { GisIndexResult } from './gisIndex.js';
import { co2Complete } from './co2Calculator.js';

// ---- Types ----

export interface ParishGisScore {
  freguesia_id: string;
  nome: string;
  populacao: number;
  gis: GisIndexResult;
  kgPerCapitaAno: number;
  taxaContaminacao: number;
  bioTon: number;
  sacosPorHabMes: number;
  co2Evitado: number;
}

export interface CouncillorMunicipalitySummary {
  municipio_id: string;
  nome: string;
  gisScore: number;
  gisClassification: string;
  bioTonTotal: number;
  contaminacaoMedia: number;
  co2Evitado: number;
  populacao: number;
  kgPerCapitaAno: number;
}

export interface CouncillorMetrics {
  // Parish-level ICD-GIS scores
  parishScores: ParishGisScore[];

  // Municipality summary (when no filter or for all)
  municipalitySummaries: CouncillorMunicipalitySummary[];

  // Rankings
  topParishes: ParishGisScore[];
  bottomParishes: ParishGisScore[];

  // Aggregate GIS score (weighted by population)
  aggregateGisScore: number;
  aggregateGisClassification: string;

  // Trends (per parish, last 3 months of GIS score)
  parishTrends: {
    freguesia_id: string;
    nome: string;
    scores: { mes: string; score: number }[];
    tendencia: 'positiva' | 'neutra' | 'negativa';
  }[];

  // Contamination by type (aggregate)
  contaminacaoPorTipo: { tipo: string; nome: string; cor: string; kg: number; pct: number }[];
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

// ---- Main computation ----

export function computeCouncillorMetrics(
  db: MockDatabase,
  filters: { municipio: string | null; periodo: string },
): CouncillorMetrics {
  const { municipio, periodo } = filters;

  const allMonths = [...new Set(db.monthlyParishData.map((d) => d.mes))].sort();
  const periodMonths = filterMonths(allMonths, periodo);
  const numMonths = periodMonths.length;

  // Filter parishes
  const relevantParishes = municipio
    ? db.parishes.filter((p) => p.municipio_id === municipio)
    : [...db.parishes];

  // ---- Parish-level GIS scores ----
  const parishScores: ParishGisScore[] = relevantParishes.map((parish) => {
    const data = db.monthlyParishData.filter(
      (d) => d.freguesia_id === parish.id && periodMonths.includes(d.mes),
    );

    const totalKg = data.reduce((s, d) => s + d.peso_total_kg, 0);
    const bioTon = totalKg / 1000;
    const totalSacos = data.reduce((s, d) => s + d.total_sacos, 0);

    // Weighted average contamination
    const contam = totalKg > 0
      ? data.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / totalKg
      : 0;

    // Per capita per year (annualize based on period length)
    const annualizeFactor = numMonths > 0 ? 12 / numMonths : 1;
    const kgPerCapitaAno = parish.populacao > 0
      ? (totalKg / parish.populacao) * annualizeFactor
      : 0;

    // Bags per inhabitant per month
    const sacosPorHabMes = parish.populacao > 0 && numMonths > 0
      ? totalSacos / parish.populacao / numMonths
      : 0;

    // Alerts per ton (from incidents in the parish's municipality)
    const munIncidents = db.monthlyIncidents.filter(
      (inc) => inc.municipio_id === parish.municipio_id && periodMonths.includes(inc.mes),
    );
    const totalIncidents = munIncidents.reduce((s, inc) => s + inc.incidents.length, 0);
    // Distribute incidents across parishes proportionally to weight
    const munTotalKg = db.monthlyParishData
      .filter((d) => d.municipio_id === parish.municipio_id && periodMonths.includes(d.mes))
      .reduce((s, d) => s + d.peso_total_kg, 0);
    const parishIncidentShare = munTotalKg > 0 ? totalKg / munTotalKg : 0;
    const parishIncidents = totalIncidents * parishIncidentShare;
    const alertasPorTon = bioTon > 0 ? parishIncidents / bioTon : 0;

    // CO2 avoided per ton
    const co2Evitado = co2Complete(bioTon, contam);
    const co2PorTon = bioTon > 0 ? co2Evitado / bioTon : 0;

    const gis = calculateGisIndex({
      kgPerCapitaAno,
      taxaContaminacao: contam,
      alertasPorTon,
      co2EvitadoPorTon: co2PorTon,
      sacosPorHabMes,
    });

    return {
      freguesia_id: parish.id,
      nome: parish.nome,
      populacao: parish.populacao,
      gis,
      kgPerCapitaAno: Math.round(kgPerCapitaAno * 10) / 10,
      taxaContaminacao: Math.round(contam * 10) / 10,
      bioTon: Math.round(bioTon * 10) / 10,
      sacosPorHabMes: Math.round(sacosPorHabMes * 100) / 100,
      co2Evitado: Math.round(co2Evitado * 10) / 10,
    };
  });

  // Sort by GIS score
  parishScores.sort((a, b) => b.gis.score - a.gis.score);

  // ---- Municipality summaries ----
  const munIds = municipio ? [municipio] : db.municipalities.map((m) => m.id);
  const municipalitySummaries: CouncillorMunicipalitySummary[] = munIds.map((mid) => {
    const munParishes = parishScores.filter((p) => {
      const parish = db.parishes.find((pp) => pp.id === p.freguesia_id);
      return parish?.municipio_id === mid;
    });

    const totalPop = munParishes.reduce((s, p) => s + p.populacao, 0);
    const weightedGis = totalPop > 0
      ? munParishes.reduce((s, p) => s + p.gis.score * p.populacao, 0) / totalPop
      : 0;
    const totalBio = munParishes.reduce((s, p) => s + p.bioTon, 0);
    const weightedContam = totalBio > 0
      ? munParishes.reduce((s, p) => s + p.taxaContaminacao * p.bioTon, 0) / totalBio
      : 0;
    const totalCo2 = munParishes.reduce((s, p) => s + p.co2Evitado, 0);
    const annualizeFactor = numMonths > 0 ? 12 / numMonths : 1;

    const gisResult = calculateGisIndex({
      kgPerCapitaAno: totalPop > 0 ? (totalBio * 1000 / totalPop) * annualizeFactor : 0,
      taxaContaminacao: weightedContam,
      alertasPorTon: 0.5,
      co2EvitadoPorTon: totalBio > 0 ? totalCo2 / totalBio : 0,
      sacosPorHabMes: 0,
    });

    return {
      municipio_id: mid,
      nome: db.municipalities.find((m) => m.id === mid)?.nome ?? mid,
      gisScore: Math.round(weightedGis * 10) / 10,
      gisClassification: gisResult.classification,
      bioTonTotal: Math.round(totalBio * 10) / 10,
      contaminacaoMedia: Math.round(weightedContam * 10) / 10,
      co2Evitado: Math.round(totalCo2 * 10) / 10,
      populacao: totalPop,
      kgPerCapitaAno: totalPop > 0 ? Math.round((totalBio * 1000 / totalPop) * annualizeFactor * 10) / 10 : 0,
    };
  });

  // ---- Rankings ----
  const topParishes = parishScores.slice(0, 5);
  const bottomParishes = [...parishScores].reverse().slice(0, 5);

  // ---- Aggregate GIS ----
  const totalPop = parishScores.reduce((s, p) => s + p.populacao, 0);
  const aggregateGisScore = totalPop > 0
    ? Math.round(parishScores.reduce((s, p) => s + p.gis.score * p.populacao, 0) / totalPop * 10) / 10
    : 0;
  const aggregateGisClassification = aggregateGisScore >= 80 ? 'excelente'
    : aggregateGisScore >= 65 ? 'bom'
    : aggregateGisScore >= 50 ? 'satisfatorio'
    : aggregateGisScore >= 35 ? 'insuficiente'
    : 'critico';

  // ---- Parish trends (last 3 months) ----
  const last3Months = allMonths.slice(-3);
  const parishTrends = relevantParishes.map((parish) => {
    const scores = last3Months.map((mes) => {
      const d = db.monthlyParishData.filter(
        (pd) => pd.freguesia_id === parish.id && pd.mes === mes,
      );
      const totalKg = d.reduce((s, dd) => s + dd.peso_total_kg, 0);
      const contam = totalKg > 0
        ? d.reduce((s, dd) => s + dd.taxa_contaminacao * dd.peso_total_kg, 0) / totalKg
        : 0;
      const totalSacos = d.reduce((s, dd) => s + dd.total_sacos, 0);
      const gis = calculateGisIndex({
        kgPerCapitaAno: parish.populacao > 0 ? (totalKg / parish.populacao) * 12 : 0,
        taxaContaminacao: contam,
        alertasPorTon: 0.5,
        co2EvitadoPorTon: 0.7,
        sacosPorHabMes: parish.populacao > 0 ? totalSacos / parish.populacao : 0,
      });
      return { mes, score: Math.round(gis.score * 10) / 10 };
    });

    const tendencia = scores.length >= 2
      ? scores[scores.length - 1].score > scores[0].score + 2 ? 'positiva'
        : scores[scores.length - 1].score < scores[0].score - 2 ? 'negativa'
        : 'neutra'
      : 'neutra';

    return {
      freguesia_id: parish.id,
      nome: parish.nome,
      scores,
      tendencia: tendencia as 'positiva' | 'neutra' | 'negativa',
    };
  });

  // ---- Contamination by type (aggregate) ----
  const contamByType = new Map<string, number>();
  for (const d of db.monthlyParishData.filter(
    (d) => periodMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  )) {
    for (const [tipoId, kg] of Object.entries(d.contaminacao_por_tipo)) {
      contamByType.set(tipoId, (contamByType.get(tipoId) ?? 0) + kg);
    }
  }
  const totalContamKg = Array.from(contamByType.values()).reduce((s, v) => s + v, 0);
  const contaminacaoPorTipo = db.contaminationTypes.map((ct) => ({
    tipo: ct.id,
    nome: ct.nome,
    cor: ct.cor,
    kg: Math.round((contamByType.get(ct.id) ?? 0) * 10) / 10,
    pct: totalContamKg > 0
      ? Math.round(((contamByType.get(ct.id) ?? 0) / totalContamKg) * 1000) / 10
      : 0,
  }));

  return {
    parishScores,
    municipalitySummaries,
    topParishes,
    bottomParishes,
    aggregateGisScore,
    aggregateGisClassification,
    parishTrends,
    contaminacaoPorTipo,
  };
}
