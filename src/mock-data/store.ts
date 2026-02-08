// ============================================================
// store.ts — Singleton store for mock data access
// ============================================================
// Generates data once on first access using seeded PRNG.
// Provides typed accessors for each dashboard persona.

import { getDatabase } from './generators/index.js';
import type { MockDatabase } from './generators/index.js';
import { computeCeoMetrics } from './computed/ceoMetrics.js';
import type { CeoMetrics } from './computed/ceoMetrics.js';
import { computeOperationalMetrics } from './computed/operationalMetrics.js';
import type { OperationalMetrics } from './computed/operationalMetrics.js';
import { computeCfoMetrics } from './computed/cfoMetrics.js';
import type { CfoMetrics } from './computed/cfoMetrics.js';
import { computeCouncillorMetrics } from './computed/councillorMetrics.js';
import type { CouncillorMetrics } from './computed/councillorMetrics.js';
import { computeBee2WasteMetrics } from './computed/bee2wasteMetrics.js';
import type { Bee2WasteMetrics } from './computed/bee2wasteMetrics.js';

// Re-export types for consumer convenience
export type {
  MockDatabase,
  CeoMetrics,
  OperationalMetrics,
  CfoMetrics,
  CouncillorMetrics,
  Bee2WasteMetrics,
};

// Re-export generator types
export type {
  Municipality,
  Parish,
  Team,
  Route,
  ContaminationType,
  EmissionFactor,
  MonthlyParishData,
  MonthlyIncidents,
  MonthlyCosts,
  MonthlyUrbanWaste,
} from './generators/index.js';

// Re-export computed types
export type { SemaphoreData, SemaphoreColor } from './computed/semaphores.js';
export type { GisIndexResult, GisIndexParams } from './computed/gisIndex.js';
export type { SparklinePoint, KpiCard } from './computed/ceoMetrics.js';

// Re-export utility functions
export { co2Simplified, co2Complete, co2LandfillReference, co2IntensityPerTon } from './computed/co2Calculator.js';
export { calculateGisIndex } from './computed/gisIndex.js';

// ---- Store ----

class MockStore {
  private db: MockDatabase;

  constructor() {
    this.db = getDatabase();
  }

  /** Access the raw generated database */
  getDatabase(): MockDatabase {
    return this.db;
  }

  /** CEO dashboard metrics */
  getCeoMetrics(filters: { municipio: string | null; periodo: string }): CeoMetrics {
    return computeCeoMetrics(this.db, filters);
  }

  /** Operational dashboard metrics (daily/shift view) */
  getOperationalMetrics(filters: {
    municipio: string | null;
    data: Date;
    turno: string | null;
  }): OperationalMetrics {
    return computeOperationalMetrics(this.db, filters);
  }

  /** CFO dashboard metrics */
  getCfoMetrics(filters: { municipio: string | null; periodo: string }): CfoMetrics {
    return computeCfoMetrics(this.db, filters);
  }

  /** Councillor dashboard metrics (parish-level GIS) */
  getCouncillorMetrics(filters: { municipio: string | null; periodo: string }): CouncillorMetrics {
    return computeCouncillorMetrics(this.db, filters);
  }

  /** Bee2Waste operator dashboard metrics */
  getBee2WasteMetrics(filters: { municipio: string | null; periodo: string }): Bee2WasteMetrics {
    return computeBee2WasteMetrics(this.db, filters);
  }

  /** List of municipalities for filters */
  getMunicipalities() {
    return this.db.municipalities;
  }

  /** List of parishes for a given municipality */
  getParishes(municipioId?: string) {
    if (municipioId) {
      return this.db.parishes.filter((p) => p.municipio_id === municipioId);
    }
    return this.db.parishes;
  }

  /** Available months in the dataset */
  getAvailableMonths(): string[] {
    return [...new Set(this.db.monthlyParishData.map((d) => d.mes))].sort();
  }

  /** Date range of the dataset */
  getDateRange(): { start: string; end: string } {
    const months = this.getAvailableMonths();
    return {
      start: months[0] ?? '2025-02',
      end: months[months.length - 1] ?? '2026-01',
    };
  }
}

/** Singleton store instance */
export const store = new MockStore();
