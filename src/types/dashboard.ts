/**
 * Dashboard Metric Type Definitions
 *
 * Interfaces for KPIs, semaphores, and dashboard-specific
 * data structures used across all 5 dashboards.
 */

import type { BioBag } from './entities';

// ---------------------------------------------------------------------------
// Shared metric types
// ---------------------------------------------------------------------------

export interface KpiData {
  label: string;
  value: number;
  unit: string;
  previousValue?: number;
  /** Percentage change from previous period */
  trend?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  sparklineData?: number[];
  /** Whether an upward trend is positive (e.g. true for production, false for contamination) */
  isPositive?: boolean;
}

export interface SemaphoreData {
  question: string;
  /** Composite score 0-100 */
  score: number;
  status: 'verde' | 'amarelo' | 'laranja' | 'vermelho';
  trendPercent: number;
  trendDirection: 'up' | 'down' | 'stable';
  sparklineData: number[];
  components: Array<{ label: string; value: number; weight: number }>;
}

export interface MunicipalityComparison {
  municipio: string;
  cor: string;
  toneladas: number;
  sacos: number;
  volume_m3: number;
  kg_per_capita: number;
}

export interface ContaminationBreakdown {
  tipo: string;
  cor: string;
  peso_kg: number;
  percentagem: number;
  trend: number;
}

export interface MonthlyMetric {
  /** Abbreviated month, e.g. "Jan", "Fev" */
  mes: string;
  /** Full month label, e.g. "Janeiro 2026" */
  mesCompleto: string;
  valor: number;
}

export interface ParishScore {
  freguesia_id: string;
  nome: string;
  municipio: string;
  score: number;
  status: 'verde' | 'amarelo' | 'laranja' | 'vermelho' | 'cinzento';
  x1_captacao: number;
  x2_qualidade: number;
  x3_alertas: number;
  x4_impacto: number;
  x5_cobertura: number;
}

// ---------------------------------------------------------------------------
// Dashboard-specific metric aggregates
// ---------------------------------------------------------------------------

export interface CeoMetrics {
  semaphores: SemaphoreData[];
  totalBio: KpiData;
  crescimento: KpiData;
  percBioRU: KpiData;
  totalSacos: KpiData;
  totalVolume: KpiData;
  municipalityComparison: MunicipalityComparison[];
  desvioAterro: KpiData;
  co2Evitado: KpiData;
  composto: KpiData;
  biogas: KpiData;
  co2Evolution: MonthlyMetric[];
  productionBreakdown: Array<{
    mes: string;
    composto: number;
    digestato: number;
    biogas: number;
  }>;
  taxaContaminacao: KpiData;
  sacosRejeitados: KpiData;
  topContaminantes: ContaminationBreakdown[];
}

export interface OperationalMetrics {
  sacosHoje: KpiData;
  pesoMedio: KpiData;
  volumeMedio: KpiData;
  cumprimentoPlano: KpiData;
  kmPorTonelada: KpiData;
  rotasTable: Array<{
    codigo: string;
    planeada: boolean;
    realizada: boolean;
    horaInicio: string;
    horaFim: string;
    km: number;
    sacos: number;
    pesoTotal: number;
  }>;
  sacosPorFreguesia: Array<{ freguesia: string; sacos: number }>;
  taxaContaminacao: KpiData;
  sacosRejeitados: KpiData;
  contaminationBreakdown: ContaminationBreakdown[];
  alertas: Array<{
    id: string;
    timestamp: string;
    uid: string;
    tapete: string;
    tipo: string;
    severidade: string;
    descricao: string;
  }>;
  ultimosSacos: Array<{
    timestamp: string;
    uid: string;
    tapete: string;
    peso: number;
    contaminacao: number;
    status: 'OK' | 'Rejeitado';
  }>;
  produtividadeEquipas: Array<{
    equipa: string;
    tonsPorTurno: number;
    ranking: number;
    trend: number;
  }>;
  incidentesPorSector: Array<{ sector: string; count: number }>;
  mttr: KpiData;
}

export interface CfoMetrics {
  custoPorTon: KpiData;
  custoPorSaco: KpiData;
  custoPorRota: KpiData;
  custoTratamento: KpiData;
  produtividade: KpiData;
  tnPorKm: KpiData;
  horasExtra: KpiData;
  custoMaoObra: KpiData;
  costEvolution: Array<{
    mes: string;
    custoPorTon: number;
    custoPorSaco: number;
    tratamento: number;
  }>;
  costComparison: MunicipalityComparison[];
}

export interface CouncillorMetrics {
  bioRecolhidos: KpiData;
  reducaoRU: KpiData;
  co2Evitado: KpiData;
  producao: KpiData;
  taxaAdesao: KpiData;
  cobertura: KpiData;
  parishScores: ParishScore[];
  parishEvolution: Array<{ mes: string; [freguesia: string]: number | string }>;
  nationalTargets: Array<{
    label: string;
    current: number;
    target: number;
    deadline: string;
  }>;
}

export interface Bee2WasteMetrics {
  totalSacos: KpiData;
  pesoMedio: KpiData;
  searchResults: BioBag[];
  contaminationResults: Array<
    BioBag & { contaminationTypes: ContaminationBreakdown[] }
  >;
  historyData: MonthlyMetric[];
}
