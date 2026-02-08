// ============================================================
// semaphores.ts — CEO semaphore logic (3 traffic lights)
// ============================================================
//
// Semaphore 1: "Os biorresiduos estao a crescer com qualidade?"
//   Combines: volume growth trend + contamination rate trend + critical alerts frequency
//   Green:  volume growing AND contamination stable/decreasing AND alerts low
//   Yellow: 1 of 3 negative
//   Orange: 2 of 3 negative
//   Red:    all 3 negative
//
// Semaphore 2: "O impacto ambiental esta a reduzir?"
//   Based on: CO2 avoided trend + landfill diversion trend
//
// Semaphore 3: "A producao potencial de biogas esta a aumentar?"
//   Based on: biogas production trend (6-month regression slope)

import type { MonthlyParishData } from '../generators/bags.js';
import type { MonthlyIncidents } from '../generators/incidents.js';

// ---- Types ----

export type SemaphoreColor = 'verde' | 'amarelo' | 'laranja' | 'vermelho';

export interface SemaphoreData {
  id: string;
  pergunta: string;
  cor: SemaphoreColor;
  descricao: string;
  detalhes: {
    indicador: string;
    valor: number;
    tendencia: 'positiva' | 'neutra' | 'negativa';
  }[];
}

// ---- Helpers ----

/** Calculate linear regression slope on an array of values (index = x) */
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

/** Group monthly parish data into monthly municipality totals */
function aggregateByMunicipalityMonth(
  data: MonthlyParishData[],
  municipioId: string | null,
): Map<string, { pesoKg: number; contaminacao: number; sacos: number }> {
  const map = new Map<string, { pesoKg: number; contaminacaoSum: number; pesoSum: number; sacos: number }>();

  for (const d of data) {
    if (municipioId && d.municipio_id !== municipioId) continue;
    const existing = map.get(d.mes);
    if (existing) {
      existing.pesoKg += d.peso_total_kg;
      existing.contaminacaoSum += d.taxa_contaminacao * d.peso_total_kg;
      existing.pesoSum += d.peso_total_kg;
      existing.sacos += d.total_sacos;
    } else {
      map.set(d.mes, {
        pesoKg: d.peso_total_kg,
        contaminacaoSum: d.taxa_contaminacao * d.peso_total_kg,
        pesoSum: d.peso_total_kg,
        sacos: d.total_sacos,
      });
    }
  }

  const result = new Map<string, { pesoKg: number; contaminacao: number; sacos: number }>();
  for (const [mes, v] of map) {
    result.set(mes, {
      pesoKg: v.pesoKg,
      contaminacao: v.pesoSum > 0 ? v.contaminacaoSum / v.pesoSum : 0,
      sacos: v.sacos,
    });
  }
  return result;
}

/** Get sorted months from data map */
function sortedMonths(map: Map<string, unknown>): string[] {
  return Array.from(map.keys()).sort();
}

/** Get last N months from a sorted array */
function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, arr.length - n));
}

// ---- Semaphore 1 ----

export function computeSemaphore1(
  monthlyData: MonthlyParishData[],
  monthlyIncidents: MonthlyIncidents[],
  municipioId: string | null,
): SemaphoreData {
  const agg = aggregateByMunicipalityMonth(monthlyData, municipioId);
  const months = sortedMonths(agg);
  const last6 = lastN(months, 6);

  // Volume trend (slope of peso over last 6 months)
  const volumeValues = last6.map((m) => agg.get(m)!.pesoKg);
  const volumeSlope = regressionSlope(volumeValues);
  const volumeTrend = volumeSlope > 0 ? 'positiva' : volumeSlope < -50 ? 'negativa' : 'neutra';
  const volumeNegative = volumeTrend === 'negativa';

  // Contamination trend
  const contamValues = last6.map((m) => agg.get(m)!.contaminacao);
  const contamSlope = regressionSlope(contamValues);
  const contamTrend = contamSlope < -0.1 ? 'positiva' : contamSlope > 0.1 ? 'negativa' : 'neutra';
  const contamNegative = contamTrend === 'negativa';

  // Critical alerts frequency (incidents with severidade 'critica' per ton)
  const alertValues = last6.map((m) => {
    const pesoTon = agg.get(m)!.pesoKg / 1000;
    const incidentsForMonth = monthlyIncidents.filter(
      (inc) => inc.mes === m && (!municipioId || inc.municipio_id === municipioId),
    );
    const criticals = incidentsForMonth.reduce(
      (sum, inc) => sum + inc.incidents.filter((i) => i.severidade === 'critica').length,
      0,
    );
    return pesoTon > 0 ? criticals / pesoTon : 0;
  });
  const alertSlope = regressionSlope(alertValues);
  const avgAlerts = alertValues.reduce((a, b) => a + b, 0) / alertValues.length;
  const alertTrend = alertSlope < 0 ? 'positiva' : alertSlope > 0.01 ? 'negativa' : 'neutra';
  const alertNegative = avgAlerts > 0.5 || alertTrend === 'negativa';

  // Determine color
  const negCount = [volumeNegative, contamNegative, alertNegative].filter(Boolean).length;
  let cor: SemaphoreColor;
  if (negCount === 0) cor = 'verde';
  else if (negCount === 1) cor = 'amarelo';
  else if (negCount === 2) cor = 'laranja';
  else cor = 'vermelho';

  return {
    id: 'SEM-01',
    pergunta: 'Os biorresiduos estao a crescer com qualidade?',
    cor,
    descricao: descricaoSemaphore1(cor),
    detalhes: [
      { indicador: 'Crescimento volume', valor: Math.round(volumeSlope), tendencia: volumeTrend as 'positiva' | 'neutra' | 'negativa' },
      { indicador: 'Taxa contaminacao', valor: Math.round(contamValues[contamValues.length - 1] * 10) / 10, tendencia: contamTrend as 'positiva' | 'neutra' | 'negativa' },
      { indicador: 'Alertas criticos/ton', valor: Math.round(avgAlerts * 100) / 100, tendencia: alertTrend as 'positiva' | 'neutra' | 'negativa' },
    ],
  };
}

function descricaoSemaphore1(cor: SemaphoreColor): string {
  switch (cor) {
    case 'verde': return 'Volume crescente com qualidade estavel e baixa frequencia de alertas.';
    case 'amarelo': return 'Um dos indicadores requer atencao.';
    case 'laranja': return 'Dois indicadores em tendencia negativa. Intervencao necessaria.';
    case 'vermelho': return 'Todos os indicadores negativos. Acao urgente necessaria.';
  }
}

// ---- Semaphore 2 ----

export function computeSemaphore2(
  monthlyData: MonthlyParishData[],
  municipioId: string | null,
): SemaphoreData {
  const agg = aggregateByMunicipalityMonth(monthlyData, municipioId);
  const months = sortedMonths(agg);
  const last6 = lastN(months, 6);

  // CO2 avoided per ton trend
  const EF_REF = 0.900;
  const EF_TREAT = 0.100;
  const co2Values = last6.map((m) => {
    const d = agg.get(m)!;
    const bioTon = d.pesoKg / 1000;
    const c = d.contaminacao / 100;
    const mBioOk = bioTon * (1 - c);
    return bioTon > 0 ? (mBioOk * (EF_REF - EF_TREAT)) / bioTon : 0;
  });
  const co2Slope = regressionSlope(co2Values);
  const co2Trend = co2Slope > 0 ? 'positiva' : co2Slope < -0.005 ? 'negativa' : 'neutra';

  // Landfill diversion: proportion of clean bio-waste (higher = better)
  const diversionValues = last6.map((m) => {
    const d = agg.get(m)!;
    return 100 - d.contaminacao;
  });
  const diversionSlope = regressionSlope(diversionValues);
  const diversionTrend = diversionSlope > 0 ? 'positiva' : diversionSlope < -0.1 ? 'negativa' : 'neutra';

  const bothPositive = co2Trend !== 'negativa' && diversionTrend !== 'negativa';
  const bothNegative = co2Trend === 'negativa' && diversionTrend === 'negativa';

  let cor: SemaphoreColor;
  if (bothPositive) cor = 'verde';
  else if (bothNegative) cor = 'vermelho';
  else cor = 'amarelo';

  return {
    id: 'SEM-02',
    pergunta: 'O impacto ambiental esta a reduzir?',
    cor,
    descricao: cor === 'verde'
      ? 'CO2 evitado e desvio de aterro em tendencia positiva.'
      : cor === 'vermelho'
        ? 'Ambos os indicadores ambientais em declinio.'
        : 'Um indicador ambiental requer atencao.',
    detalhes: [
      { indicador: 'CO2 evitado/ton', valor: Math.round(co2Values[co2Values.length - 1] * 1000) / 1000, tendencia: co2Trend as 'positiva' | 'neutra' | 'negativa' },
      { indicador: 'Desvio aterro %', valor: Math.round(diversionValues[diversionValues.length - 1] * 10) / 10, tendencia: diversionTrend as 'positiva' | 'neutra' | 'negativa' },
    ],
  };
}

// ---- Semaphore 3 ----

export function computeSemaphore3(
  monthlyData: MonthlyParishData[],
  municipioId: string | null,
): SemaphoreData {
  const agg = aggregateByMunicipalityMonth(monthlyData, municipioId);
  const months = sortedMonths(agg);
  const last6 = lastN(months, 6);

  // Biogas potential: ~120 m3 per ton of clean bio-waste
  const BIOGAS_M3_PER_TON = 120;
  const biogasValues = last6.map((m) => {
    const d = agg.get(m)!;
    const bioTon = d.pesoKg / 1000;
    const c = d.contaminacao / 100;
    return bioTon * (1 - c) * BIOGAS_M3_PER_TON;
  });

  const biogasSlope = regressionSlope(biogasValues);
  const avgBiogas = biogasValues.reduce((a, b) => a + b, 0) / biogasValues.length;
  const relativeSlope = avgBiogas > 0 ? biogasSlope / avgBiogas : 0;

  let cor: SemaphoreColor;
  let tendencia: 'positiva' | 'neutra' | 'negativa';
  if (relativeSlope > 0.02) {
    cor = 'verde';
    tendencia = 'positiva';
  } else if (relativeSlope > -0.01) {
    cor = 'amarelo';
    tendencia = 'neutra';
  } else if (relativeSlope > -0.03) {
    cor = 'laranja';
    tendencia = 'negativa';
  } else {
    cor = 'vermelho';
    tendencia = 'negativa';
  }

  return {
    id: 'SEM-03',
    pergunta: 'A producao potencial de biogas esta a aumentar?',
    cor,
    descricao: cor === 'verde'
      ? 'Producao potencial de biogas em crescimento.'
      : cor === 'amarelo'
        ? 'Producao estavel, sem crescimento significativo.'
        : 'Producao de biogas em declinio. Verificar qualidade e volume.',
    detalhes: [
      { indicador: 'Biogas potencial (m3/mes)', valor: Math.round(biogasValues[biogasValues.length - 1]), tendencia },
      { indicador: 'Tendencia 6 meses', valor: Math.round(relativeSlope * 10000) / 100, tendencia },
    ],
  };
}
