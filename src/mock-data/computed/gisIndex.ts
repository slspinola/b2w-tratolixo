// ============================================================
// gisIndex.ts — ICD-GIS composite index calculation
// ============================================================
// 5 variables with min-max normalization and absolute benchmarks:
//
// X1: Captacao per capita (kg/hab/ano) — min 5, max 80
// X2: Qualidade (100 - contamination%) — min 60, max 100
// X3: Frequencia alertas (alertas/t) — min 0, max 10 (INVERTED)
// X4: Impacto ambiental (tCO2e/t avoided) — min 0, max 0.80
// X5: Cobertura (sacos/hab/mes) — min 0, max 4
//
// Weights: w1=0.25, w2=0.30, w3=0.15, w4=0.15, w5=0.15
// Final ICD-GIS score: 0-100

// ---- Types ----

export interface GisIndexResult {
  score: number;
  classification: 'excelente' | 'bom' | 'satisfatorio' | 'insuficiente' | 'critico';
  components: {
    x1: number; // Captacao per capita
    x2: number; // Qualidade
    x3: number; // Frequencia alertas (inverted)
    x4: number; // Impacto ambiental
    x5: number; // Cobertura
  };
}

export interface GisIndexParams {
  kgPerCapitaAno: number;
  taxaContaminacao: number; // %
  alertasPorTon: number;
  co2EvitadoPorTon: number; // tCO2e/t
  sacosPorHabMes: number;
}

// ---- Weights ----

const W1 = 0.25; // Captacao
const W2 = 0.30; // Qualidade
const W3 = 0.15; // Alertas
const W4 = 0.15; // Impacto ambiental
const W5 = 0.15; // Cobertura

// ---- Normalization ----

function normalize(value: number, min: number, max: number, invert = false): number {
  const clamped = Math.max(min, Math.min(max, value));
  const norm = ((clamped - min) / (max - min)) * 100;
  return invert ? 100 - norm : norm;
}

function classify(score: number): GisIndexResult['classification'] {
  if (score >= 80) return 'excelente';
  if (score >= 65) return 'bom';
  if (score >= 50) return 'satisfatorio';
  if (score >= 35) return 'insuficiente';
  return 'critico';
}

// ---- Calculator ----

export function calculateGisIndex(params: GisIndexParams): GisIndexResult {
  const x1 = normalize(params.kgPerCapitaAno, 5, 80);
  const x2 = normalize(100 - params.taxaContaminacao, 60, 100);
  const x3 = normalize(params.alertasPorTon, 0, 10, true); // inverted: fewer alerts = better
  const x4 = normalize(params.co2EvitadoPorTon, 0, 0.80);
  const x5 = normalize(params.sacosPorHabMes, 0, 4);

  const score = Math.round((W1 * x1 + W2 * x2 + W3 * x3 + W4 * x4 + W5 * x5) * 10) / 10;

  return {
    score,
    classification: classify(score),
    components: { x1, x2, x3, x4, x5 },
  };
}
