// ============================================================
// cfoMetrics.ts — CFO dashboard aggregated metrics
// ============================================================

import type { MockDatabase } from '../generators/index.js';

// ---- Types ----

export interface CostBreakdown {
  recolha_eur: number;
  tratamento_eur: number;
  transporte_eur: number;
  mao_obra_eur: number;
  overhead_eur: number;
  total_eur: number;
}

export interface CfoSparkline {
  mes: string;
  valor: number;
}

export interface CfoKpi {
  label: string;
  valor: number;
  unidade: string;
  variacao_pct: number;
  sparkline: CfoSparkline[];
}

export interface MunicipalityCostComparison {
  municipio_id: string;
  nome: string;
  custo_total_eur: number;
  custo_por_ton_eur: number;
  bio_ton: number;
  receita_estimada_eur: number;
  margem_pct: number;
}

export interface CfoMetrics {
  // KPIs
  custoTotal: CfoKpi;
  custoPorTon: CfoKpi;
  receitaEstimada: CfoKpi;
  margemOperacional: CfoKpi;

  // Cost breakdown (period total)
  costBreakdown: CostBreakdown;

  // Monthly cost evolution
  monthlyCosts: {
    mes: string;
    recolha: number;
    tratamento: number;
    transporte: number;
    mao_obra: number;
    overhead: number;
    total: number;
  }[];

  // Municipality comparison
  municipalityComparison: MunicipalityCostComparison[];

  // Cost per bag trend
  custoPorSaco: CfoKpi;

  // Revenue breakdown
  receitaComposto: number;
  receitaEnergia: number;
  receitaReciclaveis: number;
  receitaTotal: number;

  // Budget variance
  orcamentoPrevisto: number;
  orcamentoReal: number;
  desvioOrcamento: number;
  desvioOrcamentoPct: number;
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

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ---- Main computation ----

export function computeCfoMetrics(
  db: MockDatabase,
  filters: { municipio: string | null; periodo: string },
): CfoMetrics {
  const { municipio, periodo } = filters;

  const allMonths = [...new Set(db.monthlyCosts.map((c) => c.mes))].sort();
  const periodMonths = filterMonths(allMonths, periodo);

  // Current period costs
  const costs = db.monthlyCosts.filter(
    (c) => periodMonths.includes(c.mes) && (!municipio || c.municipio_id === municipio),
  );

  // Previous period
  const prevEnd = allMonths.indexOf(periodMonths[0]);
  const prevStart = Math.max(0, prevEnd - periodMonths.length);
  const prevMonths = allMonths.slice(prevStart, prevEnd);
  const prevCosts = db.monthlyCosts.filter(
    (c) => prevMonths.includes(c.mes) && (!municipio || c.municipio_id === municipio),
  );

  // Parish data for tonnage
  const parishData = db.monthlyParishData.filter(
    (d) => periodMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );
  const prevParish = db.monthlyParishData.filter(
    (d) => prevMonths.includes(d.mes) && (!municipio || d.municipio_id === municipio),
  );

  // Aggregated costs
  const totalCost = costs.reduce((s, c) => s + c.total_eur, 0);
  const prevTotalCost = prevCosts.reduce((s, c) => s + c.total_eur, 0);

  const totalBioTon = parishData.reduce((s, d) => s + d.peso_total_kg, 0) / 1000;
  const prevBioTon = prevParish.reduce((s, d) => s + d.peso_total_kg, 0) / 1000;

  const custoPorTon = totalBioTon > 0 ? totalCost / totalBioTon : 0;
  const prevCustoPorTon = prevBioTon > 0 ? prevTotalCost / prevBioTon : 0;

  const totalSacos = parishData.reduce((s, d) => s + d.total_sacos, 0);
  const prevSacos = prevParish.reduce((s, d) => s + d.total_sacos, 0);
  const custoPorSaco = totalSacos > 0 ? totalCost / totalSacos : 0;
  const prevCustoPorSaco = prevSacos > 0 ? prevTotalCost / prevSacos : 0;

  // Cost breakdown
  const costBreakdown: CostBreakdown = {
    recolha_eur: Math.round(costs.reduce((s, c) => s + c.recolha_eur, 0) * 100) / 100,
    tratamento_eur: Math.round(costs.reduce((s, c) => s + c.tratamento_eur, 0) * 100) / 100,
    transporte_eur: Math.round(costs.reduce((s, c) => s + c.transporte_eur, 0) * 100) / 100,
    mao_obra_eur: Math.round(costs.reduce((s, c) => s + c.mao_obra_eur, 0) * 100) / 100,
    overhead_eur: Math.round(costs.reduce((s, c) => s + c.overhead_eur, 0) * 100) / 100,
    total_eur: Math.round(totalCost * 100) / 100,
  };

  // Revenue estimates
  // Composto: ~15 EUR/ton of compost produced (30% of clean bio)
  const contamWeighted = totalBioTon > 0
    ? parishData.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0)
      / parishData.reduce((s, d) => s + d.peso_total_kg, 0)
    : 0;
  const cleanBio = totalBioTon * (1 - contamWeighted / 100);
  const compostoTon = cleanBio * 0.30;
  const receitaComposto = compostoTon * 15;

  // Energy: biogas -> electricity sold at ~0.08 EUR/kWh
  const biogasM3 = cleanBio * 0.70 * 120;
  const energiaKwh = biogasM3 * 6;
  const receitaEnergia = energiaKwh * 0.08;

  // Recyclable contamination materials recovered: ~5 EUR/ton
  const recycledTon = totalBioTon * (contamWeighted / 100) * 0.40; // 40% of contaminants recovered
  const receitaReciclaveis = recycledTon * 5;

  const receitaTotal = receitaComposto + receitaEnergia + receitaReciclaveis;
  const prevCleanBio = prevBioTon * (1 - (prevParish.length > 0
    ? prevParish.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0)
      / prevParish.reduce((s, d) => s + d.peso_total_kg, 0)
    : 0) / 100);
  const prevReceita = prevCleanBio * 0.30 * 15
    + prevCleanBio * 0.70 * 120 * 6 * 0.08
    + prevBioTon * 0.10 * 0.40 * 5;

  // Operating margin
  const margem = receitaTotal > 0 ? ((receitaTotal - totalCost) / receitaTotal) * 100 : 0;
  const prevMargem = prevReceita > 0 ? ((prevReceita - prevTotalCost) / prevReceita) * 100 : 0;

  // Monthly cost evolution
  const monthlyCosts = periodMonths.map((mes) => {
    const mc = costs.filter((c) => c.mes === mes);
    return {
      mes,
      recolha: Math.round(mc.reduce((s, c) => s + c.recolha_eur, 0) * 100) / 100,
      tratamento: Math.round(mc.reduce((s, c) => s + c.tratamento_eur, 0) * 100) / 100,
      transporte: Math.round(mc.reduce((s, c) => s + c.transporte_eur, 0) * 100) / 100,
      mao_obra: Math.round(mc.reduce((s, c) => s + c.mao_obra_eur, 0) * 100) / 100,
      overhead: Math.round(mc.reduce((s, c) => s + c.overhead_eur, 0) * 100) / 100,
      total: Math.round(mc.reduce((s, c) => s + c.total_eur, 0) * 100) / 100,
    };
  });

  // Municipality comparison
  const munIds = municipio ? [municipio] : db.municipalities.map((m) => m.id);
  const municipalityComparison: MunicipalityCostComparison[] = munIds.map((mid) => {
    const mc = costs.filter((c) => c.municipio_id === mid);
    const mp = parishData.filter((d) => d.municipio_id === mid);
    const mCost = mc.reduce((s, c) => s + c.total_eur, 0);
    const mBio = mp.reduce((s, d) => s + d.peso_total_kg, 0) / 1000;
    const mContam = mBio > 0
      ? mp.reduce((s, d) => s + d.taxa_contaminacao * d.peso_total_kg, 0) / mp.reduce((s, d) => s + d.peso_total_kg, 0)
      : 0;
    const mClean = mBio * (1 - mContam / 100);
    const mReceita = mClean * 0.30 * 15 + mClean * 0.70 * 120 * 6 * 0.08;

    return {
      municipio_id: mid,
      nome: db.municipalities.find((m) => m.id === mid)?.nome ?? mid,
      custo_total_eur: Math.round(mCost * 100) / 100,
      custo_por_ton_eur: mBio > 0 ? Math.round((mCost / mBio) * 100) / 100 : 0,
      bio_ton: Math.round(mBio * 10) / 10,
      receita_estimada_eur: Math.round(mReceita * 100) / 100,
      margem_pct: mReceita > 0 ? Math.round(((mReceita - mCost) / mReceita) * 100 * 10) / 10 : 0,
    };
  });

  // Budget variance (estimated: budget = 95% of actual, simulating slight overrun)
  const orcamentoPrevisto = Math.round(totalCost * 0.95 * 100) / 100;
  const desvioOrcamento = Math.round((totalCost - orcamentoPrevisto) * 100) / 100;
  const desvioOrcamentoPct = orcamentoPrevisto > 0
    ? Math.round((desvioOrcamento / orcamentoPrevisto) * 1000) / 10
    : 0;

  // Sparklines
  const costSparkline = periodMonths.map((mes) => ({
    mes,
    valor: Math.round(costs.filter((c) => c.mes === mes).reduce((s, c) => s + c.total_eur, 0) * 100) / 100,
  }));

  return {
    custoTotal: {
      label: 'Custo Total',
      valor: Math.round(totalCost * 100) / 100,
      unidade: 'EUR',
      variacao_pct: pctChange(totalCost, prevTotalCost),
      sparkline: costSparkline,
    },
    custoPorTon: {
      label: 'Custo por Tonelada',
      valor: Math.round(custoPorTon * 100) / 100,
      unidade: 'EUR/ton',
      variacao_pct: pctChange(custoPorTon, prevCustoPorTon),
      sparkline: [],
    },
    receitaEstimada: {
      label: 'Receita Estimada',
      valor: Math.round(receitaTotal * 100) / 100,
      unidade: 'EUR',
      variacao_pct: pctChange(receitaTotal, prevReceita),
      sparkline: [],
    },
    margemOperacional: {
      label: 'Margem Operacional',
      valor: Math.round(margem * 10) / 10,
      unidade: '%',
      variacao_pct: pctChange(margem, prevMargem),
      sparkline: [],
    },

    costBreakdown,
    monthlyCosts,
    municipalityComparison,

    custoPorSaco: {
      label: 'Custo por Saco',
      valor: Math.round(custoPorSaco * 100) / 100,
      unidade: 'EUR',
      variacao_pct: pctChange(custoPorSaco, prevCustoPorSaco),
      sparkline: [],
    },

    receitaComposto: Math.round(receitaComposto * 100) / 100,
    receitaEnergia: Math.round(receitaEnergia * 100) / 100,
    receitaReciclaveis: Math.round(receitaReciclaveis * 100) / 100,
    receitaTotal: Math.round(receitaTotal * 100) / 100,

    orcamentoPrevisto,
    orcamentoReal: Math.round(totalCost * 100) / 100,
    desvioOrcamento,
    desvioOrcamentoPct,
  };
}
